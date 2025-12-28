import { Router } from "express";
import { requireAdmin } from "@/middleware/admin";
import { authenticateMiddleware } from "@/middleware/authenticated";
import { CouponController } from "./coupon.controller";

const couponRouter = Router();
const couponController = new CouponController();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon code management
 */

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 */
couponRouter.get("/", requireAdmin, couponController.getAll);

/**
 * @swagger
 * /api/v1/coupons/available:
 *   get:
 *     summary: Get available coupons for logged in user
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available coupons
 */
couponRouter.get(
  "/available",
  authenticateMiddleware,
  couponController.getAvailable,
);

/**
 * @swagger
 * /api/v1/coupons/validate:
 *   post:
 *     summary: Validate coupon code
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               subtotal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Validation result
 */
couponRouter.post(
  "/validate",
  authenticateMiddleware,
  couponController.validate,
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details
 */
couponRouter.get("/:id", requireAdmin, couponController.getById);

/**
 * @swagger
 * /api/v1/coupons/{id}/usage:
 *   get:
 *     summary: Get coupon usage history
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orders using this coupon
 */
couponRouter.get("/:id/usage", requireAdmin, couponController.getUsage);

/**
 * @swagger
 * /api/v1/coupons:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponInput'
 *     responses:
 *       201:
 *         description: Coupon created
 */
couponRouter.post("/", requireAdmin, couponController.create);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   put:
 *     summary: Update coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCouponInput'
 *     responses:
 *       200:
 *         description: Coupon updated
 */
couponRouter.put("/:id", requireAdmin, couponController.update);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   delete:
 *     summary: Delete coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted
 */
couponRouter.delete("/:id", requireAdmin, couponController.delete);

export { couponRouter };
