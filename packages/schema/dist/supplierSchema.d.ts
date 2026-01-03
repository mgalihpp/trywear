import { z } from "zod";
export declare const supplierSchema: z.ZodObject<{
    name: z.ZodString;
    contact_email: z.ZodUnion<[z.ZodNullable<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodUnion<[z.ZodNullable<z.ZodString>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
export type SupplierInput = z.infer<typeof supplierSchema>;
//# sourceMappingURL=supplierSchema.d.ts.map