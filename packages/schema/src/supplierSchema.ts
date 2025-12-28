import { z } from "zod";

export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, "Nama pemasok harus diisi")
    .max(200, "Nama terlalu panjang"),
  contact_email: z
    .string()
    .email("Format email tidak valid")
    .nullable()
    .or(z.literal("")),
  phone: z
    .string()
    .max(50, "Nomor telepon terlalu panjang")
    .nullable()
    .or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
