import { createSegmentSchema, updateSegmentSchema } from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { SegmentService } from "./segment.service";

export class SegmentController {
  private service: SegmentService;

  constructor() {
    this.service = new SegmentService();
  }

  /**
   * Get all segments
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.include_inactive === "true";
    const segments = await this.service.findAll(includeInactive);

    return new AppResponse({
      res,
      data: segments,
    });
  });

  /**
   * Get segment by ID
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const segment = await this.service.findById(id);

    return new AppResponse({
      res,
      data: segment,
    });
  });

  /**
   * Create a new segment
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createSegmentSchema.parse(req.body);
    const segment = await this.service.create(data);

    return new AppResponse({
      res,
      data: segment,
      message: "Segment created successfully",
      statusCode: 201,
    });
  });

  /**
   * Update a segment
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const data = updateSegmentSchema.parse(req.body);
    const segment = await this.service.update(id, data);

    return new AppResponse({
      res,
      data: segment,
      message: "Segment updated successfully",
    });
  });

  /**
   * Delete a segment
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    await this.service.delete(id);

    return new AppResponse({
      res,
      message: "Segment deleted successfully",
    });
  });

  /**
   * Get segment statistics
   */
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await this.service.getSegmentStats();

    return new AppResponse({
      res,
      data: stats,
    });
  });

  /**
   * Recalculate all customer segments
   */
  recalculate = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.service.bulkRecalculateSegments();

    return new AppResponse({
      res,
      data: result,
      message: `Successfully recalculated segments for ${result.updated} customers`,
    });
  });

  /**
   * Get customers by segment
   */
  getCustomersBySegment = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const page = Number.parseInt(req.query.page as string, 10) || 1;
    const limit = Number.parseInt(req.query.limit as string, 10) || 20;

    const result = await this.service.getCustomersBySegment(slug, page, limit);

    return new AppResponse({
      res,
      data: result,
    });
  });

  /**
   * Assign segment to a specific user
   */
  assignToUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await this.service.assignSegmentToUser(userId);

    return new AppResponse({
      res,
      data: result,
      message: "User segment updated successfully",
    });
  });
}
