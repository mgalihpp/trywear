import type { Reviews } from "@repo/db";
import { paramsIdSchema } from "@repo/schema";
import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { ReviewService } from "./review.service";

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

const reportReviewSchema = z.object({
  reason: z.string().optional(),
});

export class ReviewController extends BaseController<Reviews, ReviewService> {
  constructor() {
    super(new ReviewService());
  }

  /**
   * Get all reviews
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await this.service.findAll();
    new AppResponse({ res, data: reviews });
  });

  /**
   * Get pending reviews
   */
  getPending = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await this.service.findPending();
    new AppResponse({ res, data: reviews });
  });

  /**
   * Get reported reviews
   */
  getReported = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await this.service.findReported();
    new AppResponse({ res, data: reviews });
  });

  /**
   * Get review by ID
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const review = await this.service.findById(id as string);
    new AppResponse({ res, data: review });
  });

  /**
   * Get review statistics
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.service.getStats();
    new AppResponse({ res, data: stats });
  });

  /**
   * Update review status (approve/reject)
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);
    const review = await this.service.updateStatus(id as string, status);
    new AppResponse({ res, data: review });
  });

  /**
   * Mark review as reported (can be called by users or admin)
   */
  markAsReported = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const { reason } = reportReviewSchema.parse(req.body);
    const review = await this.service.markAsReported(id as string, reason);
    new AppResponse({ res, data: review });
  });

  /**
   * Clear report from review (admin only)
   */
  clearReport = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const review = await this.service.clearReport(id as string);
    new AppResponse({ res, data: review });
  });

  /**
   * Delete review
   */
  deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);
    const review = await this.service.deleteReview(id as string);
    new AppResponse({ res, data: review });
  });
}
