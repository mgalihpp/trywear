import * as z from "zod";

export const paramsIdSchema = z.object({
  id: z.string().min(1),
});

export type ParamsId = z.infer<typeof paramsIdSchema>;

export * from "./addressSchema";
export * from "./categorySchema";
export * from "./couponSchema";
export * from "./midtransSchema";
export * from "./notificationSchema";
export * from "./orderSchema";
export * from "./paymentSchema";
export * from "./productSchema";
export * from "./returnSchema";
export * from "./returnSchema";
export * from "./segmentSchema";
export * from "./shippingSchema";
export * from "./supplierSchema";
