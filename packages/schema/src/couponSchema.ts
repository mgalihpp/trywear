import { z } from "zod";

export const couponIdParams = z.object({
  id: z.string().uuid(),
});

export const couponCodeParams = z.object({
  code: z.string().min(1),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Kode kupon minimal 3 karakter")
    .max(50, "Kode kupon maksimal 50 karakter")
    .toUpperCase(),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().positive("Nilai diskon harus positif"),
  expires_at: z.string().datetime().nullable().optional(),
  usage_limit: z.number().int().nonnegative().nullable().optional(),
  usage_limit_per_user: z.number().int().nonnegative().nullable().optional(),
  segment_ids: z.array(z.number()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export type ParamsCouponId = z.infer<typeof couponIdParams>;
export type ParamsCouponCode = z.infer<typeof couponCodeParams>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
