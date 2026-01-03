"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderIdSchema = void 0;
const zod_1 = require("zod");
const shippingSchema_1 = require("./shippingSchema");
exports.orderIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
exports.createOrderSchema = zod_1.z.object({
    user_id: zod_1.z.string().min(1),
    address_id: zod_1.z.number().int().optional().nullable(),
    shipment_method_id: zod_1.z.number().int().optional().nullable(),
    coupon_code: zod_1.z.string().optional().nullable(),
    items: zod_1.z
        .array(zod_1.z.object({
        variant_id: zod_1.z.string().min(1),
        quantity: zod_1.z.number().int().min(1),
    }))
        .min(1),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: shippingSchema_1.ShipmentStatus.optional(),
    tracking_number: zod_1.z.string().optional(),
    shipment_method_id: zod_1.z.number().optional(),
});
//# sourceMappingURL=orderSchema.js.map