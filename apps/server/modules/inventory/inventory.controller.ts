import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { InventoryService } from "./inventory.service";

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Get all inventory items
   * GET /api/v1/inventory
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as "all" | "low" | "out" | undefined;
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
  getStats = asyncHandler(async (_req: Request, res: Response) => {
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
  getById = asyncHandler(async (req: Request, res: Response) => {
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
  updateStock = asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params;
    const { quantity, type, reason } = req.body;
    const userId = req.user?.id;

    const inventory = await this.inventoryService.updateStock(
      variantId,
      { quantity, type, reason },
      userId,
    );

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
  updateThreshold = asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params;
    const { safetyStock } = req.body;

    const inventory = await this.inventoryService.updateThreshold(
      variantId,
      safetyStock,
    );

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
  getMovements = asyncHandler(async (req: Request, res: Response) => {
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
  getAllMovements = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const movements = await this.inventoryService.getAllStockMovements(limit);

    return res.status(200).json({
      status: "success",
      data: movements,
    });
  });
}
