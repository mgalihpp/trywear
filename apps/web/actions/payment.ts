"use server";

import { db } from "@repo/db";

/**
 * Membatalkan order beserta pembayarannya.
 * Hanya boleh dilakukan jika order belum berstatus "settlement".
 * Akan:
 *   - Mengembalikan reserved stock ke inventory
 *   - Mengubah status order → cancelled
 *   - Mengubah status payment → cancelled
 *
 * @param order_id - ID order yang ingin dibatalkan
 * @returns { order: Order, payment: Prisma.BatchPayload }
 * @throws Error jika order tidak ditemukan / sudah dibayar
 */
export async function cancelOrder(order_id: string) {
  if (!order_id) throw new Error("order_id is required");

  try {
    const order = await db.orders.findFirst({
      where: { id: order_id },
      include: {
        order_items: {
          include: {
            variant: {
              include: { inventory: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) throw new Error("Order not found");
    if (order.status === "settlement") {
      throw new Error("Cannot cancel order that is already paid (settlement)");
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Kembalikan reserved stock
      for (const item of order.order_items) {
        await tx.inventory.updateMany({
          where: { variant_id: item.variant_id as string },
          data: {
            reserved_quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Update status order
      const updatedOrder = await tx.orders.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          updated_at: new Date(),
        },
      });

      // 3. Update semua payment terkait (biasanya cuma 1)
      const updatedPayments = await tx.payments.updateMany({
        where: { order_id: order.id },
        data: {
          status: "cancelled",
          paid_at: null,
        },
      });

      return {
        order: updatedOrder,
        payments: updatedPayments, // { count: number }
      };
    });

    return result;
  } catch (error) {
    console.error("[cancelOrder] Error:", error);
  }
}

/**
 * Update status pembayaran (dipanggil dari webhook payment gateway).
 * Hanya mengubah kolom payment, tidak menyentuh order status atau stock.
 *
 * @param params.order_id - ID order
 * @param params.status - Status baru (contoh: "pending" | "capture" | "settlement" | "deny" | "cancel" | "expire")
 * @returns Payment record yang sudah diupdate
 */
export async function updatePaymentStatus({
  order_id,
  status,
}: {
  order_id: string;
  status: string;
}) {
  if (!order_id || !status) {
    throw new Error("order_id and status are required");
  }

  // Validasi status yang diperbolehkan (opsional, sesuaikan dengan gateway kamu)
  const allowedStatuses = [
    "pending",
    "capture",
    "settlement",
    "deny",
    "cancel",
    "expire",
    "refund",
    "failed",
  ];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid payment status: ${status}`);
  }

  try {
    // Pastikan order ada
    const order = await db.orders.findUnique({
      where: { id: order_id },
    });

    if (!order) throw new Error("Order not found");

    // Get current payment status BEFORE update
    const currentPayment = await db.payments.findUnique({
      where: { order_id },
      select: { status: true },
    });

    const previousStatus = currentPayment?.status;

    const payment = await db.payments.update({
      where: { order_id }, // asumsi constraint unique di order_id
      data: {
        status,
        paid_at: ["capture", "settlement"].includes(status) ? new Date() : null,
      },
    });

    // Only create notifications if status is actually changing to prevent duplicates
    const isNewSettlement =
      ["capture", "settlement"].includes(status) &&
      !["capture", "settlement"].includes(previousStatus ?? "");

    const isNewCancellation =
      (status === "cancel" || status === "expire") &&
      previousStatus !== "cancel" &&
      previousStatus !== "expire" &&
      previousStatus !== "cancelled";

    if (isNewSettlement) {
      // Notify user that payment is successful
      await db.notifications.create({
        data: {
          user_id: order.user_id,
          type: "ORDER_PAID",
          payload: { order_id: order.id },
        },
      });

      // Notify all admins about payment received
      const admins = await db.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      });

      if (admins.length > 0) {
        await db.notifications.createMany({
          data: admins.map((admin) => ({
            user_id: admin.id,
            type: "PAYMENT_RECEIVED",
            payload: { order_id: order.id },
          })),
        });
      }
    } else if (isNewCancellation) {
      // Notify user that order/payment is cancelled
      await db.notifications.create({
        data: {
          user_id: order.user_id,
          type: "ORDER_CANCELLED",
          payload: { order_id: order.id },
        },
      });
    }

    return payment;
  } catch (error) {
    console.error("[updatePaymentStatus] Error:", error);
  }
}
