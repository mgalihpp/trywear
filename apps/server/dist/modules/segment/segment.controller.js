"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const segment_service_1 = require("./segment.service");
class SegmentController {
    service;
    constructor() {
        this.service = new segment_service_1.SegmentService();
    }
    /**
     * Get all segments
     */
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const includeInactive = req.query.include_inactive === "true";
        const segments = await this.service.findAll(includeInactive);
        return new appResponse_1.AppResponse({
            res,
            data: segments,
        });
    });
    /**
     * Get segment by ID
     */
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Number.parseInt(req.params.id, 10);
        const segment = await this.service.findById(id);
        return new appResponse_1.AppResponse({
            res,
            data: segment,
        });
    });
    /**
     * Create a new segment
     */
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = schema_1.createSegmentSchema.parse(req.body);
        const segment = await this.service.create(data);
        return new appResponse_1.AppResponse({
            res,
            data: segment,
            message: "Segment created successfully",
            statusCode: 201,
        });
    });
    /**
     * Update a segment
     */
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Number.parseInt(req.params.id, 10);
        const data = schema_1.updateSegmentSchema.parse(req.body);
        const segment = await this.service.update(id, data);
        return new appResponse_1.AppResponse({
            res,
            data: segment,
            message: "Segment updated successfully",
        });
    });
    /**
     * Delete a segment
     */
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Number.parseInt(req.params.id, 10);
        await this.service.delete(id);
        return new appResponse_1.AppResponse({
            res,
            message: "Segment deleted successfully",
        });
    });
    /**
     * Get segment statistics
     */
    getStats = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const stats = await this.service.getSegmentStats();
        return new appResponse_1.AppResponse({
            res,
            data: stats,
        });
    });
    /**
     * Recalculate all customer segments
     */
    recalculate = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const result = await this.service.bulkRecalculateSegments();
        return new appResponse_1.AppResponse({
            res,
            data: result,
            message: `Successfully recalculated segments for ${result.updated} customers`,
        });
    });
    /**
     * Get customers by segment
     */
    getCustomersBySegment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { slug } = req.params;
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 20;
        const result = await this.service.getCustomersBySegment(slug, page, limit);
        return new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
    /**
     * Assign segment to a specific user
     */
    assignToUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { userId } = req.params;
        const result = await this.service.assignSegmentToUser(userId);
        return new appResponse_1.AppResponse({
            res,
            data: result,
            message: "User segment updated successfully",
        });
    });
}
exports.SegmentController = SegmentController;
