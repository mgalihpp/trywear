"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const midtrans_1 = __importDefault(require("@repo/midtrans"));
const midtrans_2 = require("../../lib/midtrans");
const appError_1 = require("../../utils/appError");
const service_1 = require("../service");
class PaymentService extends service_1.BaseService {
    constructor() {
        super("payments");
    }
    status = async (order_id) => {
        try {
            const status = await midtrans_2.snap.transaction.status(order_id);
            return status;
        }
        catch (error) {
            if (error instanceof midtrans_1.default.MidtransError) {
                if (error.ApiResponse.status_code === "404") {
                    throw appError_1.AppError.notFound(error.ApiResponse.status_message);
                }
            }
            console.error("UNKNOWN ERROR:", error);
            throw appError_1.AppError.internalServerError();
        }
    };
}
exports.PaymentService = PaymentService;
