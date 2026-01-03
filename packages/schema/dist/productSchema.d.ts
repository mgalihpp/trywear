import { z } from "zod";
export declare const productIdParams: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const variantIdParams: z.ZodObject<{
    variantId: z.ZodString;
}, z.core.$strip>;
export declare const imageIdParams: z.ZodObject<{
    imageId: z.ZodString;
}, z.core.$strip>;
export declare const listProductsQuery: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    colors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    sizes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    priceRange: z.ZodOptional<z.ZodArray<z.ZodCoercedNumber<unknown>>>;
    query: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodOptional<z.ZodEnum<{
        newest: "newest";
        price_asc: "price_asc";
        price_desc: "price_desc";
    }>>;
}, z.core.$strip>;
export declare const createProductSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    sku: z.ZodString;
    status: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price_cents: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodNumber>;
    supplier_id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price_cents: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    supplier_id: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const createVariantSchema: z.ZodObject<{
    product_id: z.ZodString;
    sku: z.ZodString;
    option_values: z.ZodOptional<z.ZodAny>;
    additional_price_cents: z.ZodOptional<z.ZodNumber>;
    stock_quantity: z.ZodOptional<z.ZodNumber>;
    reserved_quantity: z.ZodOptional<z.ZodNumber>;
    safety_stock: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateVariantSchema: z.ZodObject<{
    product_id: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    option_values: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
    additional_price_cents: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    stock_quantity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    reserved_quantity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    safety_stock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const createInventorySchema: z.ZodObject<{
    stock_quantity: z.ZodNumber;
    reserved_quantity: z.ZodOptional<z.ZodNumber>;
    safety_stock: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateInventorySchema: z.ZodObject<{
    stock_quantity: z.ZodOptional<z.ZodNumber>;
    reserved_quantity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    safety_stock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const createProductImagesSchema: z.ZodArray<z.ZodObject<{
    product_id: z.ZodString;
    url: z.ZodURL;
    alt: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodNumber;
    key: z.ZodString;
}, z.core.$strip>>;
export declare const createProductReviewSchema: z.ZodObject<{
    product_id: z.ZodUUID;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ParamsProductId = z.infer<typeof productIdParams>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type CreateProductImagesInput = z.infer<typeof createProductImagesSchema>;
export type ListProductQueryInput = z.infer<typeof listProductsQuery>;
export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;
//# sourceMappingURL=productSchema.d.ts.map