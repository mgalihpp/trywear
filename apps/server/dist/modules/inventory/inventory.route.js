"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const authenticated_1 = require("../../middleware/authenticated");
const inventory_controller_1 = require("./inventory.controller");
const inventoryRouter = (0, express_1.Router)();
exports.inventoryRouter = inventoryRouter;
const inventoryController = new inventory_controller_1.InventoryController();
/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */
/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: List all inventory items
 *     description: Returns all inventory items with product and variant details
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, low, out]
 *         description: Filter by stock status
 *     responses:
 *       200:
 *         description: Inventory items retrieved
 */
inventoryRouter.get("/", authenticated_1.authenticateMiddleware, inventoryController.getAll);
/**
 * @swagger
 * /api/v1/inventory/stats:
 *   get:
 *     summary: Get inventory statistics
 *     description: Returns inventory statistics including total SKU, low stock, out of stock counts
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Inventory statistics retrieved
 */
inventoryRouter.get("/stats", authenticated_1.authenticateMiddleware, inventoryController.getStats);
/**
 * @swagger
 * /api/v1/inventory/movements:
 *   get:
 *     summary: Get global stock movement history
 *     description: Returns the stock movement history for all products
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Stock movements retrieved
 */
inventoryRouter.get("/movements", authenticated_1.authenticateMiddleware, inventoryController.getAllMovements);
/**
 * @swagger
 * /api/v1/inventory/{variantId}:
 *   get:
 *     summary: Get inventory by variant ID
 *     description: Returns a single inventory item with its details
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product variant ID
 *     responses:
 *       200:
 *         description: Inventory item retrieved
 *       404:
 *         description: Inventory not found
 */
inventoryRouter.get("/:variantId", authenticated_1.authenticateMiddleware, inventoryController.getById);
/**
 * @swagger
 * /api/v1/inventory/{variantId}/stock:
 *   patch:
 *     summary: Update stock quantity
 *     description: Update the stock quantity for a variant
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [add, remove, set]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
inventoryRouter.patch("/:variantId/stock", authenticated_1.authenticateMiddleware, inventoryController.updateStock);
/**
 * @swagger
 * /api/v1/inventory/{variantId}/threshold:
 *   patch:
 *     summary: Update safety stock threshold
 *     description: Update the safety stock threshold for a variant
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               safetyStock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Threshold updated successfully
 */
inventoryRouter.patch("/:variantId/threshold", authenticated_1.authenticateMiddleware, inventoryController.updateThreshold);
/**
 * @swagger
 * /api/v1/inventory/{variantId}/movements:
 *   get:
 *     summary: Get stock movement history
 *     description: Returns the stock movement history for a variant
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock movements retrieved
 */
inventoryRouter.get("/:variantId/movements", authenticated_1.authenticateMiddleware, inventoryController.getMovements);
