import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppError } from "@/utils/appError";
import { AppResponse } from "@/utils/appResponse";
import { CouponService } from "./coupon.service";

export class CouponController {
  private couponService: CouponService;

  constructor() {
    this.couponService = new CouponService();
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const coupons = await this.couponService.findAll();
    return new AppResponse({
      res,
      data: coupons,
      message: "Coupons retrieved successfully",
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const coupon = await this.couponService.getById(id as string);

    if (!coupon) {
      throw AppError.notFound("Coupon not found");
    }

    return new AppResponse({
      res,
      data: coupon,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await this.couponService.createCoupon(req.body);

    return new AppResponse({
      res,
      statusCode: 201,
      data: coupon,
      message: "Coupon created successfully",
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const coupon = await this.couponService.updateCoupon(
      id as string,
      req.body,
    );

    if (!coupon) {
      throw AppError.notFound("Coupon not found for update");
    }

    return new AppResponse({
      res,
      data: coupon,
      message: "Coupon updated successfully",
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.couponService.delete(id as string);

    return new AppResponse({
      res,
      message: "Coupon deleted successfully",
    });
  });

  validate = asyncHandler(async (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    const userId = req.user?.id;
    const userSegmentId = req.user?.segment_id;

    if (!userId) {
      throw AppError.unauthorized("Unauthorized");
    }

    const result = await this.couponService.validateCoupon(
      code,
      userId,
      subtotal,
      userSegmentId,
    );

    return new AppResponse({
      res,
      data: result,
      message: "Coupon is valid",
    });
  });

  getAvailable = asyncHandler(async (req: Request, res: Response) => {
    const userSegmentId = req.user?.segment_id;
    const userId = req.user?.id;

    const coupons = await this.couponService.getAvailableCoupons(
      userSegmentId,
      userId,
    );

    return new AppResponse({
      res,
      data: coupons,
    });
  });

  getUsage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const usage = await this.couponService.getCouponUsage(id as string);

    return new AppResponse({
      res,
      data: usage,
    });
  });
}
