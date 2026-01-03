"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appError_1 = require("../../utils/appError");
const appResponse_1 = require("../../utils/appResponse");
const coupon_service_1 = require("./coupon.service");
class CouponController {
    couponService;
    constructor() {
        this.couponService = new coupon_service_1.CouponService();
    }
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const coupons = await this.couponService.findAll();
        return new appResponse_1.AppResponse({
            res,
            data: coupons,
            message: "Coupons retrieved successfully",
        });
    });
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const coupon = await this.couponService.getById(id);
        if (!coupon) {
            throw appError_1.AppError.notFound("Coupon not found");
        }
        return new appResponse_1.AppResponse({
            res,
            data: coupon,
        });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const coupon = await this.couponService.createCoupon(req.body);
        return new appResponse_1.AppResponse({
            res,
            statusCode: 201,
            data: coupon,
            message: "Coupon created successfully",
        });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const coupon = await this.couponService.updateCoupon(id, req.body);
        if (!coupon) {
            throw appError_1.AppError.notFound("Coupon not found for update");
        }
        return new appResponse_1.AppResponse({
            res,
            data: coupon,
            message: "Coupon updated successfully",
        });
    });
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        await this.couponService.delete(id);
        return new appResponse_1.AppResponse({
            res,
            message: "Coupon deleted successfully",
        });
    });
    validate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { code, subtotal } = req.body;
        const userId = req.user?.id;
        const userSegmentId = req.user?.segment_id;
        if (!userId) {
            throw appError_1.AppError.unauthorized("Unauthorized");
        }
        const result = await this.couponService.validateCoupon(code, userId, subtotal, userSegmentId);
        return new appResponse_1.AppResponse({
            res,
            data: result,
            message: "Coupon is valid",
        });
    });
    getAvailable = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userSegmentId = req.user?.segment_id;
        const userId = req.user?.id;
        const coupons = await this.couponService.getAvailableCoupons(userSegmentId, userId);
        return new appResponse_1.AppResponse({
            res,
            data: coupons,
        });
    });
    getUsage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const usage = await this.couponService.getCouponUsage(id);
        return new appResponse_1.AppResponse({
            res,
            data: usage,
        });
    });
}
exports.CouponController = CouponController;
