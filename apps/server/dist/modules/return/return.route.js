"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnRouter = void 0;
const express_1 = require("express");
const admin_1 = require("../../middleware/admin");
const authenticated_1 = require("../../middleware/authenticated");
const return_controller_1 = require("./return.controller");
const returnRouter = (0, express_1.Router)();
exports.returnRouter = returnRouter;
const returnController = new return_controller_1.ReturnController();
/**
 * @swagger
 * tags:
 *   name: Return
 *   description: Return/refund management endpoints
 */
/**
 * @swagger
 * /api/v1/returns:
 *   get:
 *     summary: List all returns (admin)
 *     tags: [Return]
 *     responses:
 *       200:
 *         description: Returns retrieved successfully
 */
returnRouter.get("/", admin_1.requireAdmin, returnController.getAll);
/**
 * @swagger
 * /api/v1/returns/me:
 *   get:
 *     summary: List returns for authenticated user
 *     tags: [Return]
 *     responses:
 *       200:
 *         description: Returns retrieved successfully
 */
returnRouter.get("/me", authenticated_1.authenticateMiddleware, returnController.getByUser);
/**
 * @swagger
 * /api/v1/returns/{id}:
 *   get:
 *     summary: Get return by ID
 *     tags: [Return]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Return detail
 *       404:
 *         description: Return not found
 */
returnRouter.get("/:id", returnController.getById);
/**
 * @swagger
 * /api/v1/returns:
 *   post:
 *     summary: Create a return request
 *     tags: [Return]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - reason
 *               - items
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - order_item_id
 *                     - quantity
 *                   properties:
 *                     order_item_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Return request created
 *       400:
 *         description: Validation error
 */
returnRouter.post("/", authenticated_1.authenticateMiddleware, returnController.createReturn);
/**
 * @swagger
 * /api/v1/returns/{id}/status:
 *   put:
 *     summary: Update return status (admin)
 *     tags: [Return]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [requested, approved, rejected, processing, completed]
 *               admin_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return status updated
 *       404:
 *         description: Return not found
 */
returnRouter.put("/:id/status", admin_1.requireAdmin, returnController.updateStatus);
