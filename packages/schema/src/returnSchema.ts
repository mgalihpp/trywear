import { z } from "zod";

// Return Status enum
export const ReturnStatus = z.enum([
  "requested",   // Pelanggan mengajukan return
  "approved",    // Admin menyetujui return
  "rejected",    // Admin menolak return
  "processing",  // Return sedang diproses (barang dalam perjalanan kembali)
  "completed",   // Return selesai, refund sudah dilakukan
]);

export type ReturnStatusType = z.infer<typeof ReturnStatus>;

// Schema untuk item yang akan di-return
export const returnItemSchema = z.object({
  order_item_id: z.number().int(),
  quantity: z.number().int().min(1),
});

// Schema untuk membuat return baru (pelanggan)
export const createReturnSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500),
  items: z.array(returnItemSchema).min(1, "Pilih minimal 1 item untuk dikembalikan"),
  images: z.array(z.object({
    url: z.string().url(),
    key: z.string(),
  })).optional(),
});

// Schema untuk update status return (admin)
export const updateReturnStatusSchema = z.object({
  status: ReturnStatus,
  admin_notes: z.string().optional(),
});

// Schema untuk params
export const returnIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type UpdateReturnStatusInput = z.infer<typeof updateReturnStatusSchema>;
export type ReturnItemInput = z.infer<typeof returnItemSchema>;
