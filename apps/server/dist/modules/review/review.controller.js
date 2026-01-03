"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const schema_1 = require("@repo/schema");
const zod_1 = require("zod");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const review_service_1 = require("./review.service");
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["approved", "rejected"]),
});
const reportReviewSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
});
class ReviewController extends controller_1.BaseController {
    constructor() {
        super(new review_service_1.ReviewService());
    }
    /**
     * Get all reviews
     */
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const reviews = await this.service.findAll();
        new appResponse_1.AppResponse({ res, data: reviews });
    });
    /**
     * Get pending reviews
     */
    getPending = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const reviews = await this.service.findPending();
        new appResponse_1.AppResponse({ res, data: reviews });
    });
    /**
     * Get reported reviews
     */
    getReported = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const reviews = await this.service.findReported();
        new appResponse_1.AppResponse({ res, data: reviews });
    });
    /**
     * Get review by ID
     */
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const review = await this.service.findById(id);
        new appResponse_1.AppResponse({ res, data: review });
    });
    /**
     * Get review statistics
     */
    getStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const stats = await this.service.getStats();
        new appResponse_1.AppResponse({ res, data: stats });
    });
    /**
     * Update review status (approve/reject)
     */
    updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const { status } = updateStatusSchema.parse(req.body);
        const review = await this.service.updateStatus(id, status);
        new appResponse_1.AppResponse({ res, data: review });
    });
    /**
     * Mark review as reported (can be called by users or admin)
     */
    markAsReported = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const { reason } = reportReviewSchema.parse(req.body);
        const review = await this.service.markAsReported(id, reason);
        new appResponse_1.AppResponse({ res, data: review });
    });
    /**
     * Clear report from review (admin only)
     */
    clearReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const review = await this.service.clearReport(id);
        new appResponse_1.AppResponse({ res, data: review });
    });
    /**
     * Delete review
     */
    deleteReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const review = await this.service.deleteReview(id);
        new appResponse_1.AppResponse({ res, data: review });
    });
}
exports.ReviewController = ReviewController;
