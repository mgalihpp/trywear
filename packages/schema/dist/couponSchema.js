"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCouponSchema = exports.createCouponSchema = exports.couponCodeParams = exports.couponIdParams = void 0;
const zod_1 = require("zod");
exports.couponIdParams = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.couponCodeParams = zod_1.z.object({
    code: zod_1.z.string().min(1),
});
exports.createCouponSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .min(3, "Kode kupon minimal 3 karakter")
        .max(50, "Kode kupon maksimal 50 karakter")
        .toUpperCase(),
    discount_type: zod_1.z.enum(["percentage", "fixed_amount"]),
    discount_value: zod_1.z.number().positive("Nilai diskon harus positif"),
    expires_at: zod_1.z.string().datetime().nullable().optional(),
    usage_limit: zod_1.z.number().int().nonnegative().nullable().optional(),
    usage_limit_per_user: zod_1.z.number().int().nonnegative().nullable().optional(),
    segment_ids: zod_1.z.array(zod_1.z.number()).optional(),
});
exports.updateCouponSchema = exports.createCouponSchema.partial();
//# sourceMappingURL=couponSchema.js.map