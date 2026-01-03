import { z } from "zod";
export declare const ReturnStatus: z.ZodEnum<{
    processing: "processing";
    requested: "requested";
    approved: "approved";
    rejected: "rejected";
    completed: "completed";
}>;
export type ReturnStatusType = z.infer<typeof ReturnStatus>;
export declare const returnItemSchema: z.ZodObject<{
    order_item_id: z.ZodNumber;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export declare const createReturnSchema: z.ZodObject<{
    order_id: z.ZodString;
    reason: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        order_item_id: z.ZodNumber;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        key: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateReturnStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        processing: "processing";
        requested: "requested";
        approved: "approved";
        rejected: "rejected";
        completed: "completed";
    }>;
    admin_notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type UpdateReturnStatusInput = z.infer<typeof updateReturnStatusSchema>;
export type ReturnItemInput = z.infer<typeof returnItemSchema>;
//# sourceMappingURL=returnSchema.d.ts.map