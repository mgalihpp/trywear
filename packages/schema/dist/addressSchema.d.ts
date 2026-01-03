import z from "zod";
export declare const createAddressSchema: z.ZodObject<{
    user_id: z.ZodString;
    recipient_name: z.ZodString;
    label: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address_line1: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address_line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    province: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    postal_code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    country: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lat: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    lng: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    is_default: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateAddressSchema: z.ZodObject<{
    recipient_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    label: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address_line1: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    address_line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    province: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    postal_code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    country: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lat: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    lng: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    is_default: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
//# sourceMappingURL=addressSchema.d.ts.map