"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentRouter = void 0;
const express_1 = require("express");
const authenticated_1 = require("../../middleware/authenticated");
const segment_controller_1 = require("./segment.controller");
const segmentRouter = (0, express_1.Router)();
exports.segmentRouter = segmentRouter;
const segmentController = new segment_controller_1.SegmentController();
/**
 * @swagger
 * tags:
 *   name: Segments
 *   description: Customer segment management endpoints
 */
/**
 * @swagger
 * /api/v1/segments:
 *   get:
 *     summary: List all segments
 *     tags: [Segments]
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *         description: Include inactive segments
 *     responses:
 *       200:
 *         description: Segments retrieved
 */
segmentRouter.get("/", authenticated_1.authenticateMiddleware, segmentController.getAll);
/**
 * @swagger
 * /api/v1/segments/stats:
 *   get:
 *     summary: Get segment statistics
 *     tags: [Segments]
 *     responses:
 *       200:
 *         description: Segment stats retrieved
 */
segmentRouter.get("/stats", authenticated_1.authenticateMiddleware, segmentController.getStats);
/**
 * @swagger
 * /api/v1/segments/recalculate:
 *   post:
 *     summary: Recalculate all customer segments
 *     tags: [Segments]
 *     responses:
 *       200:
 *         description: Segments recalculated
 */
segmentRouter.post("/recalculate", authenticated_1.authenticateMiddleware, segmentController.recalculate);
/**
 * @swagger
 * /api/v1/segments/{id}:
 *   get:
 *     summary: Get segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Segment retrieved
 *       404:
 *         description: Segment not found
 */
segmentRouter.get("/:id", authenticated_1.authenticateMiddleware, segmentController.getById);
/**
 * @swagger
 * /api/v1/segments:
 *   post:
 *     summary: Create a new segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               min_spend_cents:
 *                 type: integer
 *               max_spend_cents:
 *                 type: integer
 *               discount_percent:
 *                 type: number
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               priority:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Segment created
 */
segmentRouter.post("/", authenticated_1.authenticateMiddleware, segmentController.create);
/**
 * @swagger
 * /api/v1/segments/{id}:
 *   put:
 *     summary: Update a segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Segment updated
 */
segmentRouter.put("/:id", authenticated_1.authenticateMiddleware, segmentController.update);
/**
 * @swagger
 * /api/v1/segments/{id}:
 *   delete:
 *     summary: Delete a segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Segment deleted
 */
segmentRouter.delete("/:id", authenticated_1.authenticateMiddleware, segmentController.delete);
/**
 * @swagger
 * /api/v1/segments/customers/{slug}:
 *   get:
 *     summary: Get customers by segment slug
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customers retrieved
 */
segmentRouter.get("/customers/:slug", authenticated_1.authenticateMiddleware, segmentController.getCustomersBySegment);
/**
 * @swagger
 * /api/v1/segments/assign/{userId}:
 *   post:
 *     summary: Recalculate and assign segment to a user
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User segment assigned
 */
segmentRouter.post("/assign/:userId", authenticated_1.authenticateMiddleware, segmentController.assignToUser);
