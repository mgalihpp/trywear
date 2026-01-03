"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipmetsSchema = exports.createShipmentsSchema = exports.createShipmentsMethodSchema = exports.shipmentIdParams = exports.ShipmentStatus = void 0;
const zod_1 = require("zod");
exports.ShipmentStatus = zod_1.z.enum([
    "ready",
    "pending",
    "processing",
    "shipped",
    "in_transit",
    "delivered",
    "failed",
    "returned",
    "cancelled",
]);
exports.shipmentIdParams = zod_1.z.object({
    id: zod_1.z.uuid(),
});
exports.createShipmentsMethodSchema = zod_1.z.object({
    id: zod_1.z.number().int(),
    name: zod_1.z.string().max(150).nullable().optional(),
    carrier_code: zod_1.z.string().max(50).nullable().optional(),
});
exports.createShipmentsSchema = zod_1.z.object({
    order_id: zod_1.z.uuid(),
    shipment_method_id: zod_1.z.number().int().nullable().optional(),
    tracking_number: zod_1.z.string().max(200).nullable().optional(),
    status: exports.ShipmentStatus.optional(),
    shipped_at: zod_1.z.date().nullable().optional(),
    delivered_at: zod_1.z.date().nullable().optional(),
    // relasi biasanya divalidasi di logic, bukan di schema
});
exports.updateShipmetsSchema = exports.createShipmentsSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
});
//# sourceMappingURL=shippingSchema.js.map