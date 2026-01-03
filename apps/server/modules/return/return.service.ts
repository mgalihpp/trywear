import type { Returns } from "@repo/db";
import type { CreateReturnInput, UpdateReturnStatusInput } from "@repo/schema";
import { AppError } from "@/utils/appError";
import { NotificationService } from "../notification/notification.service";
import { BaseService } from "../service";

export class ReturnService extends BaseService<Returns, "returns"> {
  private notificationService: NotificationService;

  constructor() {
    super("returns");
    this.notificationService = new NotificationService();
  }

  /**
   * Get all returns for admin or filtered by user
   */
  findAll = async ({ userId }: { userId?: string }) => {
    return await this.db.returns.findMany({
      where: userId ? { user_id: userId } : undefined,
      include: {
        order: {
          include: {
            order_items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        product_images: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: true,
        return_items: {
          include: {
            order_item: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  };

  /**
   * Get return by ID with full relations
   */
  findById = async (id: string) => {
    const returnData = await this.db.returns.findFirst({
      where: { id },
      include: {
        order: {
          include: {
            address: true,
            order_items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        product_images: true,
                      },
                    },
                  },
                },
              },
            },
            payments: true,
            shipments: {
              include: {
                shipment_method: true,
              },
            },
          },
        },
        user: true,
        return_items: {
          include: {
            order_item: true,
          },
        },
      },
    });

    if (!returnData) {
      throw AppError.notFound("Return tidak ditemukan");
    }

    return returnData;
  };

  /**
   * Create a new return request (customer)
   */
  createReturn = async (input: CreateReturnInput, userId: string) => {
    // 1. Validate order exists and belongs to user
    const order = await this.db.orders.findFirst({
      where: {
        id: input.order_id,
        user_id: userId,
      },
      include: {
        order_items: true,
        returns: true,
      },
    });

    if (!order) {
      throw AppError.notFound("Pesanan tidak ditemukan");
    }

    // 2. Check if order status allows return (must be delivered)
    if (order.status !== "delivered" && order.status !== "completed") {
      throw AppError.badRequest(
        "Hanya pesanan yang sudah diterima yang dapat dikembalikan",
      );
    }

    // 2b. Check 7-day return window from shipment delivered_at
    const shipment = await this.db.shipments.findFirst({
      where: { order_id: order.id },
    });

    if (shipment?.delivered_at) {
      const deliveredDate = new Date(shipment.delivered_at);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff > 7) {
        throw AppError.badRequest(
          "Batas waktu pengajuan pengembalian adalah 7 hari setelah pesanan diterima",
        );
      }
    }

    // 3. Check if return already exists for this order
    const existingReturn = order.returns.find(
      (r) => r.status !== "rejected" && r.status !== "completed",
    );
    if (existingReturn) {
      throw AppError.badRequest(
        "Sudah ada pengajuan pengembalian untuk pesanan ini",
      );
    }

    // 4. Validate items belong to order
    for (const item of input.items) {
      const orderItem = order.order_items.find(
        (oi) => oi.id === item.order_item_id,
      );
      if (!orderItem) {
        throw AppError.badRequest(
          `Item dengan ID ${item.order_item_id} tidak ditemukan dalam pesanan`,
        );
      }
      if (item.quantity > orderItem.quantity) {
        throw AppError.badRequest(
          `Jumlah pengembalian melebihi jumlah pembelian untuk item ${orderItem.title}`,
        );
      }
    }

    // 5. Create return with items
    const returnData = await this.db.returns.create({
      data: {
        order_id: input.order_id,
        user_id: userId,
        reason: input.reason,
        images: (input.images as any) ?? null,
        status: "requested",
        return_items: {
          create: input.items.map((item) => ({
            order_item_id: item.order_item_id,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        return_items: true,
        order: true,
      },
    });

    // 6. Notify admins about new return request
    await this.notificationService.notifyAllAdmins("RETURN_REQUEST", {
      return_id: returnData.id,
      order_id: order.id,
    });

    return returnData;
  };

  /**
   * Update return status (admin)
   */
  updateStatus = async (returnId: string, input: UpdateReturnStatusInput) => {
    const returnData = await this.db.returns.findUnique({
      where: { id: returnId },
      include: {
        order: true,
        return_items: {
          include: {
            order_item: {
              include: {
                variant: {
                  include: {
                    inventory: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!returnData) {
      throw AppError.notFound("Return tidak ditemukan");
    }

    const oldStatus = returnData.status;
    const newStatus = input.status;

    // Update return status
    const updatedReturn = await this.db.$transaction(async (tx) => {
      const updated = await tx.returns.update({
        where: { id: returnId },
        data: {
          status: newStatus,
        },
        include: {
          order: true,
          user: true,
        },
      });

      // If status changed to completed, update order status to returned and restore stock
      if (newStatus === "completed" && oldStatus !== "completed") {
        // Update order status
        await tx.orders.update({
          where: { id: returnData.order_id! },
          data: { status: "returned" },
        });

        // Restore stock for each return item
        for (const returnItem of returnData.return_items) {
          if (returnItem.order_item?.variant_id) {
            const inventory = await tx.inventory.findUnique({
              where: { variant_id: returnItem.order_item.variant_id },
            });

            if (inventory) {
              await tx.inventory.update({
                where: { variant_id: returnItem.order_item.variant_id },
                data: {
                  stock_quantity: { increment: returnItem.quantity },
                },
              });

              // Log stock movement
              await tx.auditLogs.create({
                data: {
                  action: "STOCK_ADD",
                  object_type: "INVENTORY",
                  object_id: returnItem.order_item.variant_id,
                  metadata: {
                    variant_id: returnItem.order_item.variant_id,
                    quantity_change: returnItem.quantity,
                    previous_quantity: inventory.stock_quantity,
                    new_quantity:
                      inventory.stock_quantity + returnItem.quantity,
                    reason: `Return ${returnId} completed - stok dikembalikan`,
                  },
                },
              });
            }
          }
        }
      }

      return updated;
    });

    // Send notification to user based on status
    if (updatedReturn.user_id) {
      const notificationMap: Record<string, () => Promise<unknown>> = {
        approved: () =>
          this.notificationService.create({
            user_id: updatedReturn.user_id!,
            type: "RETURN_APPROVED",
            payload: {
              return_id: returnId,
              order_id: updatedReturn.order_id,
              message: "Pengajuan pengembalian Anda telah disetujui",
            },
          }),
        rejected: () =>
          this.notificationService.create({
            user_id: updatedReturn.user_id!,
            type: "RETURN_REJECTED",
            payload: {
              return_id: returnId,
              order_id: updatedReturn.order_id,
              message: "Pengajuan pengembalian Anda ditolak",
            },
          }),
        completed: () =>
          this.notificationService.create({
            user_id: updatedReturn.user_id!,
            type: "RETURN_COMPLETED",
            payload: {
              return_id: returnId,
              order_id: updatedReturn.order_id,
              message: "Pengembalian Anda telah selesai",
            },
          }),
      };

      if (notificationMap[newStatus]) {
        await notificationMap[newStatus]();
      }
    }

    return updatedReturn;
  };
}
