"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const authenticated_1 = require("../../middleware/authenticated");
const customer_controller_1 = require("./customer.controller");
const customerRouter = (0, express_1.Router)();
exports.customerRouter = customerRouter;
const customerController = new customer_controller_1.CustomerController();
/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer management endpoints
 */
/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: List customers
 *     description: Returns customers with total order amounts. Requires authentication.
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: Customers retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/User'
 *                           - type: object
 *                             properties:
 *                               orders:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     total_cents:
 *                                       type: integer
 *                                       format: int64
 *       401:
 *         description: Unauthorized
 */
customerRouter.get("/", authenticated_1.authenticateMiddleware, customerController.getAll);
/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get customer detail
 *     description: Returns a customer with addresses and orders.
 *     tags: [Customer]
 *     parameters:
 *       - $ref: '#/components/parameters/CustomerId'
 *     responses:
 *       200:
 *         description: Customer retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             addresses:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Address'
 *                             orders:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
customerRouter.get("/:id", authenticated_1.authenticateMiddleware, customerController.getById);
