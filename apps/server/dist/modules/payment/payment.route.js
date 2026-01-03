"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const authenticated_1 = require("../../middleware/authenticated");
const payment_controller_1 = require("./payment.controller");
const paymentRouter = (0, express_1.Router)();
exports.paymentRouter = paymentRouter;
const paymentController = new payment_controller_1.PaymentController();
/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment status endpoints
 */
/**
 * @swagger
 * /api/v1/payment/status/{id}:
 *   get:
 *     summary: Get payment status
 *     description: Fetch Midtrans transaction status for the given order.
 *     tags: [Payment]
 *     parameters:
 *       - $ref: '#/components/parameters/OrderId'
 *     responses:
 *       200:
 *         description: Payment status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentStatus'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Provider error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
paymentRouter.get("/status/:id", authenticated_1.authenticateMiddleware, paymentController.getStatus);
