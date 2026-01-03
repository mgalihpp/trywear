"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const order_service_1 = require("./order.service");
class OrderController extends controller_1.BaseController {
    constructor() {
        super(new order_service_1.OrderService());
    }
    getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const orders = await this.service.findAll({
            status: query.status,
        });
        return new appResponse_1.AppResponse({
            res,
            data: orders,
        });
    });
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.orderIdSchema.parse(req.params);
        const order = await this.service.findById(id);
        return new appResponse_1.AppResponse({
            res,
            data: order,
        });
    });
    getByUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        const orders = await this.service.findAll({ userId });
        return new appResponse_1.AppResponse({
            res,
            data: orders,
        });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const parsed = schema_1.createOrderSchema.parse(req.body);
        const idempotencyKey = req.idempotencyKey || req.header("x-idempotency-key");
        const result = await this.service.create(parsed, idempotencyKey);
        return new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
    updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.orderIdSchema.parse(req.params);
        const parsed = schema_1.updateOrderStatusSchema.parse(req.body);
        const updatedOrder = await this.service.updateStatus(id, parsed);
        return new appResponse_1.AppResponse({
            res,
            data: updatedOrder,
        });
    });
}
exports.OrderController = OrderController;
