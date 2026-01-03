import { z } from "zod";
export declare const orderIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodObject<{
    user_id: z.ZodString;
    address_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    shipment_method_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    coupon_code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodObject<{
        variant_id: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
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
    tracking_number: z.ZodOptional<z.ZodString>;
    shipment_method_id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
//# sourceMappingURL=orderSchema.d.ts.map