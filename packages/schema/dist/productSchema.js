"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductReviewSchema = exports.createProductImagesSchema = exports.updateInventorySchema = exports.createInventorySchema = exports.updateVariantSchema = exports.createVariantSchema = exports.updateProductSchema = exports.createProductSchema = exports.listProductsQuery = exports.imageIdParams = exports.variantIdParams = exports.productIdParams = void 0;
const zod_1 = require("zod");
exports.productIdParams = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
exports.variantIdParams = zod_1.z.object({
    variantId: zod_1.z.string().min(1),
});
exports.imageIdParams = zod_1.z.object({
    imageId: zod_1.z.string().min(1),
});
exports.listProductsQuery = zod_1.z.object({
    categoryId: zod_1.z.string().optional(),
    colors: zod_1.z.array(zod_1.z.string()).optional(),
    sizes: zod_1.z.array(zod_1.z.string()).optional(),
    priceRange: zod_1.z
        .array(zod_1.z.coerce.number().int())
        .optional()
        .refine((v) => !v || v.length === 2, {
        message: "priceRange must contain two numeric values: [min, max]",
    }),
    query: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().optional(),
    limit: zod_1.z.coerce.number().int().positive().optional(),
    sort: zod_1.z.enum(["newest", "price_asc", "price_desc"]).optional(),
});
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    sku: zod_1.z.string(),
    status: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    price_cents: zod_1.z.number().int(),
    currency: zod_1.z.string().optional(),
    category_id: zod_1.z.number().optional(),
    supplier_id: zod_1.z.number().optional(),
});
exports.updateProductSchema = exports.createProductSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
});
exports.createVariantSchema = zod_1.z.object({
    product_id: zod_1.z.string(),
    sku: zod_1.z.string(),
    option_values: zod_1.z.any().optional(),
    additional_price_cents: zod_1.z.number().int().optional(),
    stock_quantity: zod_1.z.number().optional(),
    reserved_quantity: zod_1.z.number().optional(),
    safety_stock: zod_1.z.number().optional(),
});
exports.updateVariantSchema = exports.createVariantSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
});
exports.createInventorySchema = zod_1.z.object({
    stock_quantity: zod_1.z.number(),
    reserved_quantity: zod_1.z.number().optional(),
    safety_stock: zod_1.z.number().optional(),
});
exports.updateInventorySchema = exports.createInventorySchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
});
exports.createProductImagesSchema = zod_1.z.array(zod_1.z.object({
    product_id: zod_1.z.string().min(1),
    url: zod_1.z.url(),
    alt: zod_1.z.string().optional(),
    sort_order: zod_1.z.number(),
    key: zod_1.z.string(),
}));
exports.createProductReviewSchema = zod_1.z.object({
    product_id: zod_1.z.uuid(),
    rating: zod_1.z.number().min(1, "Silakan beri rating").max(5),
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().min(10, "Ulasan minimal 10 karakter").optional(),
});
//# sourceMappingURL=productSchema.js.map