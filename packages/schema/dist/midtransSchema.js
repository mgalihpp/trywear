"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSnapSchema = void 0;
const zod_1 = require("zod");
const transactionDetailsSchema = zod_1.z.object({
    order_id: zod_1.z
        .string()
        .max(50)
        .regex(/^[\w\-~.]+$/, "Allowed characters: letters, numbers, -, _, ~, ."),
    gross_amount: zod_1.z.number().int().min(0),
});
const itemDetailSchema = zod_1.z.object({
    id: zod_1.z.string().max(50).optional(),
    price: zod_1.z.number().int().min(0),
    quantity: zod_1.z.number().int().min(1),
    name: zod_1.z.string().max(50),
    brand: zod_1.z.string().max(50).optional(),
    category: zod_1.z.string().max(50).optional(),
    merchant_name: zod_1.z.string().max(50).optional(),
    url: zod_1.z.string().url().max(50).optional(),
});
const itemDetailsSchema = zod_1.z.array(itemDetailSchema).min(1);
const addressSchema = zod_1.z.object({
    first_name: zod_1.z.string().max(255).optional(),
    last_name: zod_1.z.string().max(255).optional(),
    email: zod_1.z.string().email().max(255).optional(),
    phone: zod_1.z.string().max(255).optional(),
    address: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().max(100).optional(),
    postal_code: zod_1.z.string().max(10).optional(),
    country_code: zod_1.z.string().max(10).optional(),
});
const customerDetailsSchema = zod_1.z.object({
    first_name: zod_1.z.string().max(255).optional(),
    last_name: zod_1.z.string().max(255).optional(),
    email: zod_1.z.string().email().max(255).optional(),
    phone: zod_1.z.string().max(255).optional(),
    billing_address: addressSchema.optional(),
    shipping_address: addressSchema.optional(),
});
const creditCardSchema = zod_1.z.object({
    save_card: zod_1.z.boolean().optional(),
    secure: zod_1.z.boolean().optional(),
    channel: zod_1.z.enum(["migs"]).optional(),
    bank: zod_1.z
        .enum([
        "bca",
        "bni",
        "mandiri",
        "cimb",
        "bri",
        "danamon",
        "maybank",
        "mega",
    ])
        .optional(),
    type: zod_1.z.enum(["authorize", "authorize_capture"]).optional(),
    whitelist_bins: zod_1.z.array(zod_1.z.string()).optional(),
    installment: zod_1.z
        .object({
        required: zod_1.z.boolean().optional(),
        terms: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.number()).min(1)).optional(),
    })
        .optional(),
    dynamic_descriptor: zod_1.z
        .object({
        merchant_name: zod_1.z.string().max(25).optional(),
        city_name: zod_1.z.string().max(13).optional(),
        country_code: zod_1.z.string().length(2).optional(),
    })
        .optional(),
});
const vaSchema = zod_1.z
    .object({
    va_number: zod_1.z.string().optional(),
    sub_company_code: zod_1.z.string().optional(),
    recipient_name: zod_1.z.string().optional(),
    free_text: zod_1.z
        .object({
        inquiry: zod_1.z
            .array(zod_1.z.object({ en: zod_1.z.string().max(50), id: zod_1.z.string().max(50) }))
            .optional(),
        payment: zod_1.z
            .array(zod_1.z.object({ en: zod_1.z.string().max(50), id: zod_1.z.string().max(50) }))
            .optional(),
    })
        .optional(),
})
    .optional();
const gopaySchema = zod_1.z
    .object({
    enable_callback: zod_1.z.boolean().optional(),
    callback_url: zod_1.z.string().url().optional(),
    tokenization: zod_1.z.boolean().optional(),
    enforce_tokenization: zod_1.z.boolean().optional(),
    phone_number: zod_1.z.string().optional(),
    country_code: zod_1.z.string().optional(),
})
    .optional();
const shopeepaySchema = zod_1.z
    .object({
    callback_url: zod_1.z.string().url().optional(),
})
    .optional();
const callbacksSchema = zod_1.z
    .object({
    finish: zod_1.z.string().url().optional(),
    error: zod_1.z.string().url().optional(),
})
    .optional();
const expirySchema = zod_1.z
    .object({
    start_time: zod_1.z.string().optional(), // yyyy-MM-dd HH:mm:ss Z
    unit: zod_1.z.enum(["day", "hour", "minute", "days", "hours", "minutes"]),
    duration: zod_1.z.number().int(),
})
    .optional();
exports.createSnapSchema = zod_1.z.object({
    transaction_details: transactionDetailsSchema,
    item_details: itemDetailsSchema.optional(),
    customer_details: customerDetailsSchema.optional(),
    credit_card: creditCardSchema.optional(),
    bca_va: vaSchema.optional(),
    permata_va: vaSchema.optional(),
    bni_va: vaSchema.optional(),
    mandiri_bill: vaSchema.optional(),
    bri_va: vaSchema.optional(),
    cimb_va: vaSchema.optional(),
    danamon_va: vaSchema.optional(),
    bsi_va: vaSchema.optional(),
    gopay: gopaySchema.optional(),
    shopeepay: shopeepaySchema.optional(),
    cstore: zod_1.z
        .object({
        alfamart_free_text_1: zod_1.z.string().max(40).optional(),
        alfamart_free_text_2: zod_1.z.string().max(40).optional(),
        alfamart_free_text_3: zod_1.z.string().max(40).optional(),
    })
        .optional(),
    callbacks: callbacksSchema,
    expiry: expirySchema,
    page_expiry: expirySchema.optional(),
    recurring: zod_1.z
        .object({
        required: zod_1.z.boolean(),
        start_time: zod_1.z.string().optional(),
        interval_unit: zod_1.z.enum(["day", "week", "month"]).optional(),
    })
        .optional(),
});
//# sourceMappingURL=midtransSchema.js.map