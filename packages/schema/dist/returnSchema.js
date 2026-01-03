"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnIdSchema = exports.updateReturnStatusSchema = exports.createReturnSchema = exports.returnItemSchema = exports.ReturnStatus = void 0;
const zod_1 = require("zod");
// Return Status enum
exports.ReturnStatus = zod_1.z.enum([
    "requested", // Pelanggan mengajukan return
    "approved", // Admin menyetujui return
    "rejected", // Admin menolak return
    "processing", // Return sedang diproses (barang dalam perjalanan kembali)
    "completed", // Return selesai, refund sudah dilakukan
]);
// Schema untuk item yang akan di-return
exports.returnItemSchema = zod_1.z.object({
    order_item_id: zod_1.z.number().int(),
    quantity: zod_1.z.number().int().min(1),
});
// Schema untuk membuat return baru (pelanggan)
exports.createReturnSchema = zod_1.z.object({
    order_id: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(10, "Alasan minimal 10 karakter").max(500),
    items: zod_1.z
        .array(exports.returnItemSchema)
        .min(1, "Pilih minimal 1 item untuk dikembalikan"),
    images: zod_1.z
        .array(zod_1.z.object({
        url: zod_1.z.string().url(),
        key: zod_1.z.string(),
    }))
        .optional(),
});
// Schema untuk update status return (admin)
exports.updateReturnStatusSchema = zod_1.z.object({
    status: exports.ReturnStatus,
    admin_notes: zod_1.z.string().optional(),
});
// Schema untuk params
exports.returnIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=returnSchema.js.map