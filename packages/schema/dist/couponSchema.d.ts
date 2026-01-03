import { z } from "zod";
export declare const couponIdParams: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const couponCodeParams: z.ZodObject<{
    code: z.ZodString;
}, z.core.$strip>;
export declare const createCouponSchema: z.ZodObject<{
    code: z.ZodString;
    discount_type: z.ZodEnum<{
        percentage: "percentage";
        fixed_amount: "fixed_amount";
    }>;
    discount_value: z.ZodNumber;
    expires_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    usage_limit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    usage_limit_per_user: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    segment_ids: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateCouponSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    discount_type: z.ZodOptional<z.ZodEnum<{
        percentage: "percentage";
        fixed_amount: "fixed_amount";
    }>>;
    discount_value: z.ZodOptional<z.ZodNumber>;
    expires_at: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    usage_limit: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    usage_limit_per_user: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    segment_ids: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodNumber>>>;
}, z.core.$strip>;
export type ParamsCouponId = z.infer<typeof couponIdParams>;
export type ParamsCouponCode = z.infer<typeof couponCodeParams>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
//# sourceMappingURL=couponSchema.d.ts.map