import { z } from "zod";
export declare const createSegmentSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    min_spend_cents: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    max_spend_cents: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    discount_percent: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateSegmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    min_spend_cents: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    max_spend_cents: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    discount_percent: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const assignSegmentSchema: z.ZodObject<{
    user_id: z.ZodString;
    segment_id: z.ZodNullable<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const segmentFilterSchema: z.ZodObject<{
    segment: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type CreateSegmentInput = z.infer<typeof createSegmentSchema>;
export type UpdateSegmentInput = z.infer<typeof updateSegmentSchema>;
export type AssignSegmentInput = z.infer<typeof assignSegmentSchema>;
//# sourceMappingURL=segmentSchema.d.ts.map