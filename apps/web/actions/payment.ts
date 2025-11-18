"use server";

import { db } from "@repo/db";

export const cancelPayment = async (order_id: string) => {
  try {
    const order = await db.orders.findFirst({
      where: { id: order_id },
      include: {
        order_items: {
          include: {
            variant: {
              include: {
                inventory: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Kalo order udah paid/settlement, jangan sentuh
    if (order.status === "settlement") {
      throw new Error("Order is already paid and cannot be cancelled.");
    }

    // Jalankan semuanya dalam transaksi
    const result = await db.$transaction(async (tx) => {
      // 1. Balikin reserved stock
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

      // 2. Update order → cancelled
      const updatedOrder = await tx.orders.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          updated_at: new Date(),
        },
      });

      // 3. Update payment status → cancelled
      const updatedPayment = await tx.payments.updateMany({
        where: { order_id: order.id },
        data: {
          status: "cancelled",
          paid_at: null,
        },
      });

      return {
        order: updatedOrder,
        payment: updatedPayment,
      };
    });

    return result;
  } catch (err) {
    console.error("Cancel payment error:", err);
    throw err;
  }
};

export const updatePaymentStatus = async ({
  order_id,
  status,
}: {
  order_id: string;
  status: string;
}) => {
  try {
    const order = await db.orders.findFirst({
      where: {
        id: order_id,
      },
    });

    if (!order?.id) {
      throw new Error("Order not found");
    }

    const payment = await db.payments.update({
      where: {
        order_id: order.id,
      },
      data: {
        status,
        paid_at: new Date(),
      },
    });

    return payment;
  } catch (error) {
    console.error(error);
  }
};
