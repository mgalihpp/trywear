"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const payment_service_1 = require("./payment.service");
class PaymentController extends controller_1.BaseController {
    constructor() {
        super(new payment_service_1.PaymentService());
    }
    getStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const paymentStatus = await this.service.status(id);
        return new appResponse_1.AppResponse({
            res,
            data: paymentStatus,
        });
    });
}
exports.PaymentController = PaymentController;
