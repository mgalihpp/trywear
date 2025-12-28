import * as z from "zod";

export const paramsIdSchema = z.object({
  id: z.string().min(1),
});

export type ParamsId = z.infer<typeof paramsIdSchema>;

export * from "./couponSchema";
export * from "./segmentSchema";
export * from "./supplierSchema";
