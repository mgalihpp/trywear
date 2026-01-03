import z from "zod";
export declare const createPaymentSchema: z.ZodObject<{
    order_id: z.ZodUUID;
    provider: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    provider_payment_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    amount_cents: z.ZodBigInt;
    currency: z.ZodEnum<{
        IDR: "IDR";
    }>;
    paid_at: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
}, z.core.$strip>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
//# sourceMappingURL=paymentSchema.d.ts.map