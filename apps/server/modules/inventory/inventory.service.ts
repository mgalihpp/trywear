import type { Inventory } from "@repo/db";
import type { CreateInventoryInput } from "@repo/schema/productSchema";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";

export interface InventoryStats {
  totalSku: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export interface StockUpdateInput {
  quantity: number;
  type: "add" | "remove" | "set";
  reason?: string;
}

export interface StockMovement {
  id: bigint;
  variant_id: string;
  action: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  created_at: Date;
  user_id: string | null;
  user_name?: string;
}

export class InventoryService extends BaseService<Inventory, "inventory"> {
  constructor() {
    super("inventory");
  }

  /**
   * Get all inventory items with product and variant details
   */
  async findAll(status?: "all" | "low" | "out") {
    const inventoryItems = await this.db[this.model].findMany({
      include: {
        variant: {
          include: {
            product: {
              include: {
                supplier: true,
                product_images: {
                  orderBy: { sort_order: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        stock_quantity: "asc",
      },
    });

    // Filter by status
    if (status === "low") {
      return inventoryItems.filter(
        (item) =>
          item.stock_quantity > 0 && item.stock_quantity <= item.safety_stock,
      );
    }

    if (status === "out") {
      return inventoryItems.filter((item) => item.stock_quantity === 0);
    }

    return inventoryItems;
  }

  /**
   * Get inventory by variant ID
   */
  async get(variantId: string) {
    const variantStock = await this.db[this.model].findUnique({
      where: {
        variant_id: variantId,
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                supplier: true,
                product_images: {
                  orderBy: { sort_order: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!variantStock) {
      throw AppError.notFound("Inventory not found");
    }

    return variantStock;
  }

  /**
   * Get inventory statistics
   */
  async getStats(): Promise<InventoryStats> {
    const inventoryItems = await this.db[this.model].findMany({
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalSku = inventoryItems.length;

    const lowStockCount = inventoryItems.filter(
      (item) =>
        item.stock_quantity > 0 && item.stock_quantity <= item.safety_stock,
    ).length;

    const outOfStockCount = inventoryItems.filter(
      (item) => item.stock_quantity === 0,
    ).length;

    // Calculate total inventory value
    const totalValue = inventoryItems.reduce((sum, item) => {
      const productPrice = Number(item.variant.product.price_cents);
      const additionalPrice = Number(item.variant.additional_price_cents);
      const unitPrice = productPrice + additionalPrice;
      return sum + unitPrice * item.stock_quantity;
    }, 0);

    return {
      totalSku,
      lowStockCount,
      outOfStockCount,
      totalValue,
    };
  }

  /**
   * Create or update inventory
   */
  async createOrUpdate(variantId: string, data: CreateInventoryInput) {
    return await this.db[this.model].upsert({
      where: { variant_id: variantId },
      create: {
        ...data,
        variant: {
          connect: { id: variantId },
        },
      },
      update: {
        ...data,
      },
    });
  }

  /**
   * Update stock quantity with logging
   */
  async updateStock(
    variantId: string,
    input: StockUpdateInput,
    userId?: string,
  ) {
    const inventory = await this.db[this.model].findUnique({
      where: { variant_id: variantId },
    });

    if (!inventory) {
      throw AppError.notFound("Inventory not found");
    }

    const previousQuantity = inventory.stock_quantity;
    let newQuantity: number;
    let quantityChange: number;

    switch (input.type) {
      case "add":
        newQuantity = previousQuantity + input.quantity;
        quantityChange = input.quantity;
        break;
      case "remove":
        newQuantity = Math.max(0, previousQuantity - input.quantity);
        quantityChange = -(previousQuantity - newQuantity);
        break;
      case "set":
        newQuantity = input.quantity;
        quantityChange = newQuantity - previousQuantity;
        break;
    }

    // Update the inventory
    const updatedInventory = await this.db[this.model].update({
      where: { variant_id: variantId },
      data: { stock_quantity: newQuantity },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    // Log the stock movement
    await this.logStockMovement(
      variantId,
      input.type === "add"
        ? "STOCK_ADD"
        : input.type === "remove"
          ? "STOCK_REMOVE"
          : "STOCK_SET",
      quantityChange,
      previousQuantity,
      newQuantity,
      input.reason ?? null,
      userId ?? null,
    );

    return updatedInventory;
  }

  /**
   * Update safety stock threshold
   */
  async updateThreshold(variantId: string, safetyStock: number) {
    const inventory = await this.db[this.model].findUnique({
      where: { variant_id: variantId },
    });

    if (!inventory) {
      throw AppError.notFound("Inventory not found");
    }

    return await this.db[this.model].update({
      where: { variant_id: variantId },
      data: { safety_stock: safetyStock },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Log stock movement to AuditLogs
   */
  private async logStockMovement(
    variantId: string,
    action: string,
    quantityChange: number,
    previousQuantity: number,
    newQuantity: number,
    reason: string | null,
    userId: string | null,
  ) {
    await this.db.auditLogs.create({
      data: {
        user_id: userId,
        action: action,
        object_type: "INVENTORY",
        object_id: variantId,
        metadata: {
          variant_id: variantId,
          quantity_change: quantityChange,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          reason: reason,
        },
      },
    });
  }

  /**
   * Get stock movement history for a variant
   */
  async getStockMovements(variantId: string): Promise<StockMovement[]> {
    const logs = await this.db.auditLogs.findMany({
      where: {
        object_type: "INVENTORY",
        object_id: variantId,
        action: {
          in: ["STOCK_ADD", "STOCK_REMOVE", "STOCK_SET", "STOCK_UNRESERVE"],
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 50,
    });

    return logs.map((log) => {
      const metadata = log.metadata as {
        variant_id: string;
        quantity_change: number;
        previous_quantity: number;
        new_quantity: number;
        reason: string | null;
      };

      return {
        id: log.id,
        variant_id: metadata.variant_id,
        action: log.action ?? "",
        quantity_change: metadata.quantity_change,
        previous_quantity: metadata.previous_quantity,
        new_quantity: metadata.new_quantity,
        reason: metadata.reason,
        created_at: log.created_at,
        user_id: log.user_id,
        user_name: log.user?.name,
      };
    });
  }

  /**
   * Get global stock movement history
   */
  async getAllStockMovements(limit = 100): Promise<any[]> {
    const logs = await this.db.auditLogs.findMany({
      where: {
        object_type: "INVENTORY",
        action: {
          in: ["STOCK_ADD", "STOCK_REMOVE", "STOCK_SET", "STOCK_UNRESERVE"],
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    const variantIds = [
      ...new Set(
        logs
          .map((log) => (log.metadata as any)?.variant_id)
          .filter((id): id is string => !!id),
      ),
    ];

    const variants = await this.db.productVariants.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: { title: true },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    return logs.map((log) => {
      const metadata = log.metadata as {
        variant_id: string;
        quantity_change: number;
        previous_quantity: number;
        new_quantity: number;
        reason: string | null;
      };

      const variantInfo = variantMap.get(metadata.variant_id);

      return {
        id: log.id,
        variant_id: metadata.variant_id,
        product_title: variantInfo?.product.title ?? "Unknown Product",
        variant_name: variantInfo
          ? Object.values(variantInfo.option_values as any).join(" / ")
          : "Unknown Variant",
        sku: variantInfo?.sku,
        action: log.action ?? "",
        quantity_change: metadata.quantity_change,
        previous_quantity: metadata.previous_quantity,
        new_quantity: metadata.new_quantity,
        reason: metadata.reason,
        created_at: log.created_at,
        user_id: log.user_id,
        user_name: log.user?.name,
      };
    });
  }
}
