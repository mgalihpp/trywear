"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const inventory_service_1 = require("./inventory.service");
class InventoryController {
    inventoryService;
    constructor() {
        this.inventoryService = new inventory_service_1.InventoryService();
    }
    /**
     * Get all inventory items
     * GET /api/v1/inventory
     */
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const status = req.query.status;
        const inventory = await this.inventoryService.findAll(status);
        return res.status(200).json({
            status: "success",
            data: inventory,
        });
    });
    /**
     * Get inventory statistics
     * GET /api/v1/inventory/stats
     */
    getStats = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const stats = await this.inventoryService.getStats();
        return res.status(200).json({
            status: "success",
            data: stats,
        });
    });
    /**
     * Get inventory by variant ID
     * GET /api/v1/inventory/:variantId
     */
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { variantId } = req.params;
        const inventory = await this.inventoryService.get(variantId);
        return res.status(200).json({
            status: "success",
            data: inventory,
        });
    });
    /**
     * Update stock quantity
     * PATCH /api/v1/inventory/:variantId/stock
     */
    updateStock = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { variantId } = req.params;
        const { quantity, type, reason } = req.body;
        const userId = req.user?.id;
        const inventory = await this.inventoryService.updateStock(variantId, { quantity, type, reason }, userId);
        return res.status(200).json({
            status: "success",
            message: "Stock updated successfully",
            data: inventory,
        });
    });
    /**
     * Update safety stock threshold
     * PATCH /api/v1/inventory/:variantId/threshold
     */
    updateThreshold = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { variantId } = req.params;
        const { safetyStock } = req.body;
        const inventory = await this.inventoryService.updateThreshold(variantId, safetyStock);
        return res.status(200).json({
            status: "success",
            message: "Threshold updated successfully",
            data: inventory,
        });
    });
    /**
     * Get stock movements for a variant
     * GET /api/v1/inventory/:variantId/movements
     */
    getMovements = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { variantId } = req.params;
        const movements = await this.inventoryService.getStockMovements(variantId);
        return res.status(200).json({
            status: "success",
            data: movements,
        });
    });
    /**
     * Get all stock movements (global)
     * GET /api/v1/inventory/movements
     */
    getAllMovements = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const movements = await this.inventoryService.getAllStockMovements(limit);
        return res.status(200).json({
            status: "success",
            data: movements,
        });
    });
}
exports.InventoryController = InventoryController;
