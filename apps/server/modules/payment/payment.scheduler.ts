import { db } from "@repo/db";
import { snap } from "@/lib/midtrans";

/**
 * Scheduler untuk mengecek dan membatalkan pembayaran yang sudah kadaluarsa
 * Berjalan setiap 5 menit
 */
export class PaymentScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs = 5 * 60 * 1000; // 5 menit dalam ms

  /**
   * Mulai scheduler
   */
  start(): void {
    console.log("[PaymentScheduler] Starting...");
    // Jalankan sekali saat start
    this.checkExpiredPayments();

    // Kemudian jalankan berulang setiap interval
    this.intervalId = setInterval(() => {
      this.checkExpiredPayments();
    }, this.intervalMs);

    console.log(
      `[PaymentScheduler] Running every ${this.intervalMs / 60000} minutes`,
    );
  }

  /**
   * Hentikan scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[PaymentScheduler] Stopped");
    }
  }

  /**
   * Cek pembayaran pending dan batalkan yang sudah expire
   */
  private async checkExpiredPayments(): Promise<void> {
    console.log("[PaymentScheduler] Checking expired payments...");

    try {
      // Ambil semua pembayaran pending
      const pendingPayments = await db.payments.findMany({
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

      console.log(
        `[PaymentScheduler] Found ${pendingPayments.length} pending payments`,
      );

      let cancelledCount = 0;

      for (const payment of pendingPayments) {
        try {
          // Cek status di Midtrans
          const status = await snap.transaction.status(payment.order_id);

          // Jika status di Midtrans adalah expire atau cancel, update di database
          if (
            status.transaction_status === "expire" ||
            status.transaction_status === "cancel" ||
            status.transaction_status === "deny"
          ) {
            await this.cancelPaymentAndOrder(
              payment.order_id,
              status.transaction_status,
              payment.order?.user_id,
            );
            cancelledCount++;
          }
        } catch (error) {
          // Jika error dari Midtrans, cek apakah ini status yang bisa dianggap expire/cancel
          const midtransError = error as any;
          const apiResponse = midtransError?.ApiResponse;
          const statusCode = String(
            apiResponse?.status_code || midtransError?.httpStatusCode || "",
          );
          const transactionStatus = apiResponse?.transaction_status;

          const isTerminal =
            transactionStatus === "expire" ||
            transactionStatus === "cancel" ||
            transactionStatus === "deny" ||
            statusCode === "407" ||
            statusCode === "404";

          if (isTerminal) {
            const reason =
              transactionStatus ||
              (statusCode === "404" ? "not_found" : "expire");
            console.log(
              `[PaymentScheduler] Payment ${payment.order_id} is in terminal state (${reason}) in Midtrans, auto-cancelling...`,
            );
            await this.cancelPaymentAndOrder(
              payment.order_id,
              reason,
              payment.order?.user_id,
            );
            cancelledCount++;
          } else {
            console.error(
              `[PaymentScheduler] Error checking payment ${payment.order_id}:`,
              error,
            );
          }
        }
      }

      if (cancelledCount > 0) {
        console.log(
          `[PaymentScheduler] Cancelled ${cancelledCount} expired payments`,
        );
      }
    } catch (error) {
      console.error(
        "[PaymentScheduler] Error checking expired payments:",
        error,
      );
    }
  }

  /**
   * Batalkan pembayaran dan order
   */
  private async cancelPaymentAndOrder(
    orderId: string,
    status: string,
    userId?: string | null,
  ): Promise<void> {
    try {
      // Get order dengan items untuk mengembalikan stok
      const order = await db.orders.findUnique({
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

      if (!order) return;

      await db.$transaction(async (tx) => {
        // 1. Kembalikan reserved stock
        for (const item of order.order_items) {
          if (!item.variant_id) continue;

          const inventory = await tx.inventory.findUnique({
            where: { variant_id: item.variant_id as string },
          });

          if (!inventory) continue;

          await tx.inventory.update({
            where: { variant_id: item.variant_id as string },
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
              object_id: item.variant_id as string,
              metadata: {
                variant_id: item.variant_id,
                quantity_change: -item.quantity,
                previous_reserved: inventory.reserved_quantity,
                new_reserved: Math.max(
                  0,
                  inventory.reserved_quantity - item.quantity,
                ),
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

      console.log(
        `[PaymentScheduler] Order ${orderId} cancelled due to ${status}`,
      );
    } catch (error) {
      console.error(
        `[PaymentScheduler] Failed to cancel order ${orderId}:`,
        error,
      );
    }
  }
}

// Singleton instance
export const paymentScheduler = new PaymentScheduler();
