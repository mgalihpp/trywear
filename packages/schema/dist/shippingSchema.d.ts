import { z } from "zod";
export declare const ShipmentStatus: z.ZodEnum<{
    ready: "ready";
    pending: "pending";
    processing: "processing";
    shipped: "shipped";
    in_transit: "in_transit";
    delivered: "delivered";
    failed: "failed";
    returned: "returned";
    cancelled: "cancelled";
}>;
export declare const shipmentIdParams: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
export declare const createShipmentsMethodSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    carrier_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createShipmentsSchema: z.ZodObject<{
    order_id: z.ZodUUID;
    shipment_method_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    tracking_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        ready: "ready";
        pending: "pending";
        processing: "processing";
        shipped: "shipped";
        in_transit: "in_transit";
        delivered: "delivered";
        failed: "failed";
        returned: "returned";
        cancelled: "cancelled";
    }>>;
    shipped_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    delivered_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, z.core.$strip>;
export declare const updateShipmetsSchema: z.ZodObject<{
    order_id: z.ZodOptional<z.ZodUUID>;
    shipment_method_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    tracking_number: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        ready: "ready";
        pending: "pending";
        processing: "processing";
        shipped: "shipped";
        in_transit: "in_transit";
        delivered: "delivered";
        failed: "failed";
        returned: "returned";
        cancelled: "cancelled";
    }>>>;
    shipped_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodDate>>>;
    delivered_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodDate>>>;
}, z.core.$strip>;
export type ShipmentStatusType = z.infer<typeof ShipmentStatus>;
export type CreateShipmentsInput = z.infer<typeof createShipmentsSchema>;
export type UpdateShipmetsSchema = z.infer<typeof updateShipmetsSchema>;
export type CreateShipmentsMethodInput = z.infer<typeof createShipmentsMethodSchema>;
//# sourceMappingURL=shippingSchema.d.ts.map