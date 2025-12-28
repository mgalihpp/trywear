import type { Orders } from "@repo/db";
import type { CreateSnapInput } from "@repo/schema/midtransSchema";
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "@repo/schema/orderSchema";
import type { ShipmentStatusType } from "@repo/schema/shippingSchema";
import appConfig from "@/configs/appConfig";
import { snap } from "@/lib/midtrans";
import { AppError } from "@/utils/appError";
import { CouponService } from "../coupon/coupon.service";
import { NotificationService } from "../notification/notification.service";
import { SegmentService } from "../segment/segment.service";
import { BaseService } from "../service";

export class OrderService extends BaseService<Orders, "orders"> {
  private notificationService: NotificationService;
  private couponService: CouponService;

  constructor() {
    super("orders");
    this.notificationService = new NotificationService();
    this.couponService = new CouponService();
  }

  findAll = async ({
    userId,
    status,
  }: {
    userId?: string;
    status?: ShipmentStatusType;
  }) => {
    return await this.db[this.model].findMany({
      where: {
        user_id: userId,
        status,
      },
      include: {
        order_items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    product_images: true,
                    reviews: {
                      where: userId ? { user_id: userId } : undefined,
                      select: {
                        id: true,
                        user_id: true,
                        rating: true,
                        body: true,
                        created_at: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: true,
        payments: true,
      },
    });
  };

  findById = async (id: string) => {
    const order = await this.db[this.model].findFirst({
      where: {
        id,
      },
      include: {
        address: true,
        order_items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    product_images: true,
                    reviews: {
                      select: {
                        id: true,
                        user_id: true,
                        rating: true,
                        body: true,
                        created_at: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        payments: true,
        returns: true,
        shipments: {
          include: {
            shipment_method: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw AppError.notFound("Order Not Found");
    }

    return order;
  };

  create = async (input: CreateOrderInput, idempotencyKey?: string) => {
    // 1) Gather variants + product data + user data
    const variantIds = input.items.map((i) => i.variant_id);
    const variants = await this.db.productVariants.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });
    const user = await this.db.user.findFirst({
      where: {
        id: input.user_id,
      },
      include: {
        addresses: {
          where: {
            id: input.address_id as number,
          },
        },
        segment: true,
      },
    });

    if (variants.length !== variantIds.length) {
      throw AppError.badRequest("Some variants not found");
    }

    // Build item price details and check inventory rows
    const itemsDetailed = input.items.map((it) => {
      const v = variants.find((a) => a.id === it.variant_id)!;
      const productPrice = Number(v.product.price_cents);
      const additional = Number(v.additional_price_cents || 0);
      const unit_price_cents = productPrice + additional;
      return {
        variant_id: v.id,
        sku: v.sku ?? null,
        title: v.product.title,
        unit_price_cents,
        quantity: it.quantity,
        total_price_cents: unit_price_cents * it.quantity,
        category_id: v.product.category_id,
      };
    });

    const subtotal = itemsDetailed.reduce(
      (s, it) => s + it.total_price_cents,
      0,
    );

    function shippingRate(shipment_method_id: number) {
      let basePrice: number;

      switch (shipment_method_id) {
        case 1:
          basePrice = 9000;
          break;
        case 2:
          basePrice = 15000;
          break;
        case 3:
          basePrice = 7000;
          break;
        default:
          basePrice = 0;
          break;
      }

      return basePrice;
    }

    // Calculate Discounts (Segment + Coupon)
    const discount = await (async () => {
      let totalDiscount = 0;

      // 1. Segment Discount (Automatic)
      if (user?.segment?.discount_percent) {
        const segmentDiscount = Math.round(
          subtotal * (user.segment.discount_percent / 100),
        );
        totalDiscount += segmentDiscount;
      }

      // 2. Coupon Discount
      if (input.coupon_code) {
        try {
          const { discountAmount } = await this.couponService.validateCoupon(
            input.coupon_code,
            input.user_id,
            subtotal,
            user?.segment_id,
          );
          totalDiscount += Math.round(discountAmount);
        } catch (error) {
          // If coupon invalid, we just ignore it or throw?
          // Usually better to throw so user knows why it failed.
          throw error;
        }
      }

      // Cap discount at subtotal
      return Math.min(totalDiscount, subtotal);
    })();
    const tax = Math.round(subtotal * 0.1); // adapt as needed
    const shipping = shippingRate(input.shipment_method_id ?? 0);
    const total = subtotal - discount + tax + shipping;

    // Idempotency pre-check: avoid duplicates if key exists
    if (idempotencyKey) {
      const existing = await this.db.idempotencyKeys.findUnique({
        where: { key: idempotencyKey },
      });
      if (existing?.order_id) {
        const order = await this.db.orders.findUnique({
          where: { id: existing.order_id },
          include: { order_items: true, payments: true },
        });
        return { order, alreadyExists: true };
      }
    }

    // Main transaction: reserve inventory, create order+items+payment, log idempotency
    const result = await this.db.$transaction(async (tx) => {
      // 1. Reserve inventory (simple: check then update reserved_quantity)
      for (const it of itemsDetailed) {
        const inv = await tx.inventory.findUnique({
          where: { variant_id: it.variant_id },
        });
        if (!inv)
          throw AppError.badRequest(`Inventory missing for ${it.variant_id}`);
        if (inv.stock_quantity - inv.reserved_quantity < it.quantity) {
          throw AppError.badRequest(
            `Insufficient stock for variant ${it.variant_id}`,
          );
        }
        await tx.inventory.update({
          where: { variant_id: it.variant_id },
          data: { reserved_quantity: { increment: it.quantity } },
        });
      }

      // 2. Create order
      const order = await tx.orders.create({
        data: {
          user_id: input.user_id,
          address_id: input.address_id ?? null,
          status: "pending",
          subtotal_cents: BigInt(subtotal),
          shipping_cents: BigInt(shipping),
          tax_cents: BigInt(tax),
          discount_cents: BigInt(discount),
          total_cents: BigInt(total),
          coupon_code: input.coupon_code ?? null,
          order_items: {
            create: itemsDetailed.map((it) => ({
              variant_id: it.variant_id,
              sku: it.sku,
              title: it.title,
              unit_price_cents: BigInt(it.unit_price_cents),
              quantity: it.quantity,
              total_price_cents: BigInt(it.total_price_cents),
            })),
          },
        },
        include: { order_items: true },
      });

      // 3. Create payment row (pending)
      const payment = await tx.payments.create({
        data: {
          order_id: order.id,
          provider: "midtrans",
          status: "pending",
          amount_cents: BigInt(total),
          currency: "IDR",
        },
      });

      // 4. Save idempotency key mapping (if present)
      if (idempotencyKey) {
        await tx.idempotencyKeys.create({
          data: { key: idempotencyKey, order_id: order.id },
        });
      }

      // 5. Create Shipments
      const shipment = await tx.shipments.create({
        data: {
          shipment_method_id: input.shipment_method_id,
          order_id: order.id,
          status: "ready",
        },
      });

      return {
        order,
        payment,
        shipment,
      };
    });

    // 3) Call Midtrans Snap (outside DB transaction)
    // Note: Midtrans expects amount in whole currency (IDR), we store cents -> divide by 100
    const grossAmount = Math.round(Number(result.order.total_cents));

    // Map category yang benar: cari dari itemsDetailed berdasarkan variant_id
    const categoryIds = [
      ...new Set(
        itemsDetailed
          .map((d) => d.category_id)
          .filter((id): id is number => id != null),
      ),
    ];

    const categories = await this.db.categories.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

    const categoryMap = Object.fromEntries(
      categories.map((cat) => [cat.id, cat.name ?? `Category ${cat.id}`]),
    );

    const itemDetailsForMidtrans = result.order.order_items.map((oi) => {
      const detailed = itemsDetailed.find(
        (d) => d.variant_id === oi.variant_id,
      )!;

      return {
        id: oi.sku ?? oi.variant_id ?? `ITEM-${oi.id}`,
        name: (oi.title ?? "Produk TryWear").slice(0, 50),
        price: Number(oi.unit_price_cents), // sudah Rupiah utuh
        quantity: oi.quantity,
        brand: "TryWear",
        category:
          detailed.category_id != null
            ? (categoryMap[detailed.category_id] ?? "Fashion")
            : "Uncategorized",
        merchant_name: "TryWear",
      };
    });

    // Menambahkan cost untuk shipping cost ke item details
    if (shipping > 0) {
      itemDetailsForMidtrans.push({
        id: "SHIPPING",
        name: "Biaya Pengiriman",
        price: shipping,
        quantity: 1,
        brand: "TryWear",
        category: "Shipping",
        merchant_name: "TryWear",
      });
    }

    if (tax > 0) {
      itemDetailsForMidtrans.push({
        id: "TAX",
        name: "Pajak (10%)",
        price: tax,
        quantity: 1,
        brand: "TryWear",
        category: "Tax",
        merchant_name: "TryWear",
      });
    }

    if (discount > 0) {
      itemDetailsForMidtrans.push({
        id: "DISCOUNT",
        name: "Diskon (Kupon/Segmen)",
        price: -discount, // Negative price for discount
        quantity: 1,
        brand: "TryWear",
        category: "Discount",
        merchant_name: "TryWear",
      });
    }

    const snapPayload: CreateSnapInput = {
      transaction_details: {
        order_id: result.order.id,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user?.name,
        email: user?.email,
        shipping_address: {
          address: user?.addresses[0].address_line1 ?? "",
          city: user?.addresses[0].city ?? "",
          postal_code: user?.addresses[0].postal_code ?? "",
          email: user?.email,
          phone: user?.addresses[0].phone ?? "",
          first_name: user?.addresses[0].recipient_name,
        },
      },
      credit_card: {
        secure: true,
      },
      item_details: itemDetailsForMidtrans,
      callbacks: {
        finish: `${appConfig.CLIENT_ORIGIN}/order?order_id=${result.order.id}`,
        error: `${appConfig.CLIENT_ORIGIN}/order?order_id=${result.order.id}`,
      },
      gopay: {
        callback_url: `${appConfig.CLIENT_ORIGIN}/order?order_id=${result.order.id}`,
      },
    };

    const snapResponse = await snap.createTransaction(snapPayload);

    // 4) Update payment row with provider id token
    await this.db.payments.updateMany({
      where: { order_id: result.order.id, provider: "midtrans" },
      data: {
        provider_payment_id: snapResponse.token,
        // keep status pending for now
      },
    });

    // Create notification for order created
    await this.notificationService.notifyOrderCreated(
      input.user_id,
      result.order.id,
    );

    // Notify admins about new order
    await this.notificationService.notifyAdminsNewOrder(result.order.id);

    return {
      order: result.order,
      payment: { provider_payment_id: snapResponse.token },
      snap: snapResponse,
    };
  };

  updateStatus = async (orderId: string, input: UpdateOrderStatusInput) => {
    return await this.db.$transaction(async (tx) => {
      // 1. Ambil order beserta order_items dan variant-nya
      const order = await tx.orders.findUnique({
        where: { id: orderId },
        include: {
          order_items: {
            include: {
              variant: {
                include: {
                  inventory: true,
                },
              }, // penting untuk mengurangi stok
            },
          },
        },
      });

      if (!order) {
        throw AppError.notFound("Order tidak ditemukan");
      }

      const oldStatus = order.status;
      const newStatus = input.status;

      // 2. Update status order
      const updatedOrder = await tx.orders.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          updated_at: new Date(),
        },
      });

      // 3. Logika khusus berdasarkan transisi status
      const now = new Date();
      const extraFields: Record<string, Date> = {};

      // Waktu shipped / delivered
      if (newStatus === "shipped") {
        extraFields.shipped_at = now;
      }
      if (newStatus === "delivered") {
        extraFields.delivered_at = now;

        // Auto-update customer segment on delivery
        const segmentService = new SegmentService();
        await segmentService.assignSegmentToUser(order.user_id);
      }

      // 4. Update / Create shipment
      const shipment = await tx.shipments.upsert({
        where: { order_id: order.id },
        update: {
          status: newStatus,
          tracking_number: input.tracking_number ?? undefined,
          shipment_method_id: input.shipment_method_id ?? undefined,
          ...extraFields,
        },
        create: {
          order_id: order.id,
          status: newStatus,
          tracking_number: input.tracking_number,
          shipment_method_id: input.shipment_method_id,
          shipped_at: newStatus === "shipped" ? now : undefined,
          delivered_at: newStatus === "delivered" ? now : undefined,
        },
      });

      // 5. === PENGURANGAN STOK VARIAN ===
      // Hanya lakukan pengurangan stok saat order berubah dari status SELAIN shipped/delivered
      // menjadi shipped (artinya barang benar-benar dikirim)
      const shouldDecreaseStock =
        oldStatus !== "shipped" &&
        oldStatus !== "delivered" &&
        newStatus === "shipped";

      if (shouldDecreaseStock) {
        for (const item of order.order_items) {
          if (!item.variant_id || !item.variant) continue;

          const variant = item.variant;

          // Pastikan stok cukup (opsional: lempar error jika stok kurang)
          const currentStock = variant.inventory?.[0]?.stock_quantity ?? 0;
          const currentReserved =
            variant.inventory?.[0]?.reserved_quantity ?? 0;
          if (currentStock < item.quantity) {
            throw AppError.badRequest(
              `Stok tidak cukup untuk variant ${variant.sku}. Tersedia: ${currentStock}, Dibutuhkan: ${item.quantity}`,
            );
          }

          // Kurangi stok di tabel inventory
          await tx.inventory.updateMany({
            where: {
              variant_id: item.variant_id,
            },
            data: {
              reserved_quantity: {
                decrement: item.quantity,
              },
              stock_quantity: {
                decrement: item.quantity,
              },
            },
          });

          // Log stock movement ke AuditLogs
          await tx.auditLogs.create({
            data: {
              action: "STOCK_REMOVE",
              object_type: "INVENTORY",
              object_id: item.variant_id,
              metadata: {
                variant_id: item.variant_id,
                quantity_change: -item.quantity,
                previous_quantity: currentStock,
                new_quantity: currentStock - item.quantity,
                previous_reserved: currentReserved,
                new_reserved: Math.max(0, currentReserved - item.quantity),
                reason: `Order ${orderId} shipped - stok dikirim ke customer`,
              },
            },
          });

          // Check for low/out of stock and notify admins
          const newStock = currentStock - item.quantity;
          const lowStockThreshold = variant.inventory?.[0]?.safety_stock ?? 5;

          if (newStock <= 0) {
            // Out of stock - notify admins
            await this.notificationService.notifyAllAdmins("OUT_OF_STOCK", {
              product_title: item.title ?? `Variant ${variant.sku}`,
              variant_id: variant.id,
            });
          } else if (newStock <= lowStockThreshold) {
            // Low stock - notify admins
            await this.notificationService.notifyAllAdmins("LOW_STOCK", {
              product_title: item.title ?? `Variant ${variant.sku}`,
              variant_id: variant.id,
              remaining_stock: newStock,
            });
          }
        }
      }

      // 6. Pengembalian stok saat status menjadi cancelled / returned
      const shouldRestoreStock =
        (newStatus === "cancelled" || newStatus === "returned") &&
        ["pending", "processing", "shipped"].includes(oldStatus);

      if (shouldRestoreStock) {
        for (const item of order.order_items) {
          if (!item.variant_id) continue;

          const inventory = await tx.inventory.findUnique({
            where: { variant_id: item.variant_id },
          });

          if (!inventory) continue;

          // Jika order sudah shipped, kembalikan stock_quantity
          // Jika masih pending/processing, hanya kurangi reserved_quantity
          const wasShipped = oldStatus === "shipped";

          if (wasShipped) {
            // Barang sudah dikirim, kembalikan ke stok utama
            await tx.inventory.update({
              where: { variant_id: item.variant_id },
              data: {
                stock_quantity: { increment: item.quantity },
              },
            });

            // Log stock movement
            await tx.auditLogs.create({
              data: {
                action: "STOCK_ADD",
                object_type: "INVENTORY",
                object_id: item.variant_id,
                metadata: {
                  variant_id: item.variant_id,
                  quantity_change: item.quantity,
                  previous_quantity: inventory.stock_quantity,
                  new_quantity: inventory.stock_quantity + item.quantity,
                  reason: `Order ${orderId} ${newStatus} - stok dikembalikan`,
                },
              },
            });
          } else {
            // Masih pending/processing, hanya lepas reserved
            await tx.inventory.update({
              where: { variant_id: item.variant_id },
              data: {
                reserved_quantity: { decrement: item.quantity },
              },
            });

            // Log stock movement
            await tx.auditLogs.create({
              data: {
                action: "STOCK_UNRESERVE",
                object_type: "INVENTORY",
                object_id: item.variant_id,
                metadata: {
                  variant_id: item.variant_id,
                  quantity_change: -item.quantity,
                  previous_reserved: inventory.reserved_quantity,
                  new_reserved: Math.max(
                    0,
                    inventory.reserved_quantity - item.quantity,
                  ),
                  reason: `Order ${orderId} ${newStatus} - reservasi dibatalkan`,
                },
              },
            });
          }
        }
      }

      // Create notification for status change
      const statusNotificationMap: Record<string, () => Promise<unknown>> = {
        paid: () =>
          this.notificationService.notifyOrderPaid(order.user_id, order.id),
        shipped: () =>
          this.notificationService.notifyOrderShipped(order.user_id, order.id),
        delivered: () =>
          this.notificationService.notifyOrderDelivered(
            order.user_id,
            order.id,
          ),
        cancelled: () =>
          this.notificationService.notifyOrderCancelled(
            order.user_id,
            order.id,
          ),
      };

      if (newStatus && statusNotificationMap[newStatus]) {
        await statusNotificationMap[newStatus]();
      }

      return {
        order: updatedOrder,
        shipment,
      };
    });
  };
}
