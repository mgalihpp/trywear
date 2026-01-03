"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const appError_1 = require("../../utils/appError");
const service_1 = require("../service");
class InventoryService extends service_1.BaseService {
    constructor() {
        super("inventory");
    }
    /**
     * Get all inventory items with product and variant details
     */
    async findAll(status) {
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
            return inventoryItems.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= item.safety_stock);
        }
        if (status === "out") {
            return inventoryItems.filter((item) => item.stock_quantity === 0);
        }
        return inventoryItems;
    }
    /**
     * Get inventory by variant ID
     */
    async get(variantId) {
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
            throw appError_1.AppError.notFound("Inventory not found");
        }
        return variantStock;
    }
    /**
     * Get inventory statistics
     */
    async getStats() {
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
        const lowStockCount = inventoryItems.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= item.safety_stock).length;
        const outOfStockCount = inventoryItems.filter((item) => item.stock_quantity === 0).length;
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
    async createOrUpdate(variantId, data) {
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
    async updateStock(variantId, input, userId) {
        const inventory = await this.db[this.model].findUnique({
            where: { variant_id: variantId },
        });
        if (!inventory) {
            throw appError_1.AppError.notFound("Inventory not found");
        }
        const previousQuantity = inventory.stock_quantity;
        let newQuantity;
        let quantityChange;
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
        await this.logStockMovement(variantId, input.type === "add"
            ? "STOCK_ADD"
            : input.type === "remove"
                ? "STOCK_REMOVE"
                : "STOCK_SET", quantityChange, previousQuantity, newQuantity, input.reason ?? null, userId ?? null);
        return updatedInventory;
    }
    /**
     * Update safety stock threshold
     */
    async updateThreshold(variantId, safetyStock) {
        const inventory = await this.db[this.model].findUnique({
            where: { variant_id: variantId },
        });
        if (!inventory) {
            throw appError_1.AppError.notFound("Inventory not found");
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
    async logStockMovement(variantId, action, quantityChange, previousQuantity, newQuantity, reason, userId) {
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
    async getStockMovements(variantId) {
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
            const metadata = log.metadata;
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
    async getAllStockMovements(limit = 100) {
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
            ...new Set(logs
                .map((log) => log.metadata?.variant_id)
                .filter((id) => !!id)),
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
            const metadata = log.metadata;
            const variantInfo = variantMap.get(metadata.variant_id);
            return {
                id: log.id,
                variant_id: metadata.variant_id,
                product_title: variantInfo?.product.title ?? "Unknown Product",
                variant_name: variantInfo
                    ? Object.values(variantInfo.option_values).join(" / ")
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
exports.InventoryService = InventoryService;
