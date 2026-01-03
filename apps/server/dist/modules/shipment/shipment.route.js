"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipmentRouter = void 0;
const express_1 = require("express");
const admin_1 = require("../../middleware/admin");
const shipment_controller_1 = require("./shipment.controller");
const shipmentRouter = (0, express_1.Router)();
exports.shipmentRouter = shipmentRouter;
const shipmentController = new shipment_controller_1.ShipmentController();
/**
 * @swagger
 * tags:
 *   name: Shipment
 *   description: Shipment management endpoints
 */
/**
 * @swagger
 * /api/v1/shipment:
 *   post:
 *     summary: Create shipment record
 *     description: Create a shipment for an order and optionally attach carrier details.
 *     tags: [Shipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *               shipment_method_id:
 *                 type: integer
 *                 nullable: true
 *               tracking_number:
 *                 type: string
 *                 nullable: true
 *               shipped_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ready, pending, processing, shipped, in_transit, delivered, failed, returned, cancelled]
 *     responses:
 *       201:
 *         description: Shipment created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
shipmentRouter.post("/", admin_1.requireAdmin, shipmentController.create);
/**
 * @swagger
 * /api/v1/shipment/{id}:
 *   put:
 *     summary: Update shipment
 *     description: Update shipment status, tracking number, or shipment method.
 *     tags: [Shipment]
 *     parameters:
 *       - $ref: '#/components/parameters/ShipmentId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shipment_method_id:
 *                 type: integer
 *                 nullable: true
 *               tracking_number:
 *                 type: string
 *                 nullable: true
 *               shipped_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ready, pending, processing, shipped, in_transit, delivered, failed, returned, cancelled]
 *     responses:
 *       200:
 *         description: Shipment updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Shipment'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
shipmentRouter.put("/:id", admin_1.requireAdmin, shipmentController.update);
