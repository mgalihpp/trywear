"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = require("express");
const admin_1 = require("../../middleware/admin");
const authenticated_1 = require("../../middleware/authenticated");
const review_controller_1 = require("./review.controller");
const reviewRouter = (0, express_1.Router)();
exports.reviewRouter = reviewRouter;
const reviewController = new review_controller_1.ReviewController();
/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management
 */
/* ---------------------- ADMIN ROUTES ---------------------- */
/**
 * @swagger
 * /api/v1/reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews
 */
reviewRouter.get("/", admin_1.requireAdmin, reviewController.getAll);
/**
 * @swagger
 * /api/v1/reviews/stats:
 *   get:
 *     summary: Get review statistics
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review statistics
 */
reviewRouter.get("/stats", admin_1.requireAdmin, reviewController.getStats);
/**
 * @swagger
 * /api/v1/reviews/pending:
 *   get:
 *     summary: Get pending reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending reviews
 */
reviewRouter.get("/pending", admin_1.requireAdmin, reviewController.getPending);
/**
 * @swagger
 * /api/v1/reviews/reported:
 *   get:
 *     summary: Get reported reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reported reviews
 */
reviewRouter.get("/reported", admin_1.requireAdmin, reviewController.getReported);
/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
reviewRouter.get("/:id", admin_1.requireAdmin, reviewController.getById);
/**
 * @swagger
 * /api/v1/reviews/{id}/status:
 *   patch:
 *     summary: Update review status
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Review status updated
 */
reviewRouter.patch("/:id/status", admin_1.requireAdmin, reviewController.updateStatus);
/**
 * @swagger
 * /api/v1/reviews/{id}/report:
 *   patch:
 *     summary: Report a review (user or admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review reported
 */
reviewRouter.patch("/:id/report", authenticated_1.authenticateMiddleware, reviewController.markAsReported);
/**
 * @swagger
 * /api/v1/reviews/{id}/clear-report:
 *   patch:
 *     summary: Clear report from review (admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report cleared
 */
reviewRouter.patch("/:id/clear-report", admin_1.requireAdmin, reviewController.clearReport);
/**
 * @swagger
 * /api/v1/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *       404:
 *         description: Review not found
 */
reviewRouter.delete("/:id", admin_1.requireAdmin, reviewController.deleteReview);
