"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createPaymentSchema = zod_1.default.object({
    order_id: zod_1.default.uuid(),
    provider: zod_1.default.string().max(100).optional().nullable(),
    provider_payment_id: zod_1.default.string().max(200).optional().nullable(),
    status: zod_1.default.string().max(50).optional().nullable(),
    amount_cents: zod_1.default.bigint(),
    currency: zod_1.default.enum(["IDR"]), // Since default is "IDR"
    paid_at: zod_1.default.date().optional().nullable(),
});
//# sourceMappingURL=paymentSchema.js.map