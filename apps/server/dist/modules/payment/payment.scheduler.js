"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentScheduler = exports.PaymentScheduler = void 0;
const db_1 = require("@repo/db");
const midtrans_1 = require("../../lib/midtrans");
/**
 * Scheduler untuk mengecek dan membatalkan pembayaran yang sudah kadaluarsa
 * serta mengupdate pembayaran yang sudah settlement
 * Berjalan setiap 5 menit
 */
class PaymentScheduler {
    intervalId = null;
    intervalMs = 5 * 60 * 1000; // 5 menit dalam ms
    /**
     * Mulai scheduler
     */
    start() {
        console.log("[PaymentScheduler] Starting...");
        // Jalankan sekali saat start
        this.checkPendingPayments();
        // Kemudian jalankan berulang setiap interval
        this.intervalId = setInterval(() => {
            this.checkPendingPayments();
        }, this.intervalMs);
        console.log(`[PaymentScheduler] Running every ${this.intervalMs / 60000} minutes`);
    }
    /**
     * Hentikan scheduler
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("[PaymentScheduler] Stopped");
        }
    }
    /**
     * Cek pembayaran pending:
     * - Batalkan yang sudah expire
     * - Update yang sudah settlement
     */
    async checkPendingPayments() {
        console.log("[PaymentScheduler] Checking pending payments...");
        try {
            // Ambil semua pembayaran pending
            const pendingPayments = await db_1.db.payments.findMany({
                where: {
                    status: "pending",
                },
                include: {
                    order: true,
                },
            });
            if (pendingPayments.length === 0) {
                console.log("[PaymentScheduler] No pending payments found");
                return;
            }
            console.log(`[PaymentScheduler] Found ${pendingPayments.length} pending payments`);
            let cancelledCount = 0;
            let settledCount = 0;
            for (const payment of pendingPayments) {
                try {
                    // Cek status di Midtrans
                    const status = await midtrans_1.snap.transaction.status(payment.order_id);
                    // Jika status di Midtrans adalah settlement, update di database
                    if (status.transaction_status === "settlement" ||
                        status.transaction_status === "capture") {
                        await this.confirmPaymentAndOrder(payment.order_id, status.transaction_status, status.settlement_time || status.transaction_time, payment.order?.user_id);
                        settledCount++;
                    }
                    // Jika status di Midtrans adalah expire atau cancel, update di database
                    else if (status.transaction_status === "expire" ||
                        status.transaction_status === "cancel" ||
                        status.transaction_status === "deny") {
                        await this.cancelPaymentAndOrder(payment.order_id, status.transaction_status, payment.order?.user_id);
                        cancelledCount++;
                    }
                }
                catch (error) {
                    // Jika error dari Midtrans, cek apakah ini status yang bisa dianggap expire/cancel
                    const midtransError = error;
                    const apiResponse = midtransError?.ApiResponse;
                    const statusCode = String(apiResponse?.status_code || midtransError?.httpStatusCode || "");
                    const transactionStatus = apiResponse?.transaction_status;
                    const isTerminal = transactionStatus === "expire" ||
                        transactionStatus === "cancel" ||
                        transactionStatus === "deny" ||
                        statusCode === "407" ||
                        statusCode === "404";
                    if (isTerminal) {
                        const reason = transactionStatus ||
                            (statusCode === "404" ? "not_found" : "expire");
                        console.log(`[PaymentScheduler] Payment ${payment.order_id} is in terminal state (${reason}) in Midtrans, auto-cancelling...`);
                        await this.cancelPaymentAndOrder(payment.order_id, reason, payment.order?.user_id);
                        cancelledCount++;
                    }
                    else {
                        console.error(`[PaymentScheduler] Error checking payment ${payment.order_id}:`, error);
                    }
                }
            }
            if (cancelledCount > 0) {
                console.log(`[PaymentScheduler] Cancelled ${cancelledCount} expired payments`);
            }
            if (settledCount > 0) {
                console.log(`[PaymentScheduler] Confirmed ${settledCount} settled payments`);
            }
        }
        catch (error) {
            console.error("[PaymentScheduler] Error checking pending payments:", error);
        }
    }
    /**
     * Konfirmasi pembayaran yang sudah settlement dan update order ke processing
     */
    async confirmPaymentAndOrder(orderId, status, settlementTime, userId) {
        try {
            const order = await db_1.db.orders.findUnique({
                where: { id: orderId },
                include: {
                    order_items: {
                        include: {
                            variant: {
                                include: { inventory: true },
                            },
                        },
                    },
                },
            });
            if (!order)
                return;
            await db_1.db.$transaction(async (tx) => {
                // 1. Commit reserved stock (kurangi stock_quantity, reset reserved)
                for (const item of order.order_items) {
                    if (!item.variant_id)
                        continue;
                    const inventory = await tx.inventory.findUnique({
                        where: { variant_id: item.variant_id },
                    });
                    if (!inventory)
                        continue;
                    await tx.inventory.update({
                        where: { variant_id: item.variant_id },
                        data: {
                            stock_quantity: {
                                decrement: item.quantity,
                            },
                            reserved_quantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                    // Log stock movement ke AuditLogs
                    await tx.auditLogs.create({
                        data: {
                            action: "STOCK_COMMITTED",
                            object_type: "INVENTORY",
                            object_id: item.variant_id,
                            metadata: {
                                variant_id: item.variant_id,
                                quantity_change: -item.quantity,
                                previous_stock: inventory.stock_quantity,
                                new_stock: inventory.stock_quantity - item.quantity,
                                reason: `Order ${orderId} payment confirmed via scheduler`,
                            },
                        },
                    });
                }
                // 2. Update status order ke processing
                await tx.orders.update({
                    where: { id: orderId },
                    data: {
                        status: "processing",
                        updated_at: new Date(),
                    },
                });
                // 3. Update status payment ke settlement
                await tx.payments.update({
                    where: { order_id: orderId },
                    data: {
                        status: "settlement",
                        paid_at: settlementTime ? new Date(settlementTime) : new Date(),
                    },
                });
                // 4. Buat notifikasi untuk user
                if (userId) {
                    await tx.notifications.create({
                        data: {
                            user_id: userId,
                            type: "PAYMENT_SUCCESS",
                            payload: {
                                order_id: orderId,
                                reason: "payment_confirmed_by_scheduler",
                            },
                        },
                    });
                }
            });
            console.log(`[PaymentScheduler] Order ${orderId} confirmed as ${status} - updated to processing`);
        }
        catch (error) {
            console.error(`[PaymentScheduler] Failed to confirm order ${orderId}:`, error);
        }
    }
    /**
     * Batalkan pembayaran dan order
     */
    async cancelPaymentAndOrder(orderId, status, userId) {
        try {
            // Get order dengan items untuk mengembalikan stok
            const order = await db_1.db.orders.findUnique({
                where: { id: orderId },
                include: {
                    order_items: {
                        include: {
                            variant: {
                                include: { inventory: true },
                            },
                        },
                    },
                },
            });
            if (!order)
                return;
            await db_1.db.$transaction(async (tx) => {
                // 1. Kembalikan reserved stock
                for (const item of order.order_items) {
                    if (!item.variant_id)
                        continue;
                    const inventory = await tx.inventory.findUnique({
                        where: { variant_id: item.variant_id },
                    });
                    if (!inventory)
                        continue;
                    await tx.inventory.update({
                        where: { variant_id: item.variant_id },
                        data: {
                            reserved_quantity: {
                                decrement: item.quantity,
                            },
                        },
                    });
                    // Log stock movement ke AuditLogs
                    await tx.auditLogs.create({
                        data: {
                            action: "STOCK_UNRESERVE",
                            object_type: "INVENTORY",
                            object_id: item.variant_id,
                            metadata: {
                                variant_id: item.variant_id,
                                quantity_change: -item.quantity,
                                previous_reserved: inventory.reserved_quantity,
                                new_reserved: Math.max(0, inventory.reserved_quantity - item.quantity),
                                reason: `Order ${orderId} ${status} - pembayaran kedaluwarsa/dibatalkan, reservasi dibebaskan`,
                            },
                        },
                    });
                }
                // 2. Update status order
                await tx.orders.update({
                    where: { id: orderId },
                    data: {
                        status: "cancelled",
                        updated_at: new Date(),
                    },
                });
                // 3. Update status payment
                await tx.payments.update({
                    where: { order_id: orderId },
                    data: {
                        status: status === "expire" ? "expired" : "cancelled",
                        paid_at: null,
                    },
                });
                // 4. Buat notifikasi untuk user
                if (userId) {
                    await tx.notifications.create({
                        data: {
                            user_id: userId,
                            type: "ORDER_CANCELLED",
                            payload: {
                                order_id: orderId,
                                reason: "payment_expired",
                            },
                        },
                    });
                }
            });
            console.log(`[PaymentScheduler] Order ${orderId} cancelled due to ${status}`);
        }
        catch (error) {
            console.error(`[PaymentScheduler] Failed to cancel order ${orderId}:`, error);
        }
    }
}
exports.PaymentScheduler = PaymentScheduler;
// Singleton instance
exports.paymentScheduler = new PaymentScheduler();
