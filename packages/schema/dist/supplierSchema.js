"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierSchema = void 0;
const zod_1 = require("zod");
exports.supplierSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Nama pemasok harus diisi")
        .max(200, "Nama terlalu panjang"),
    contact_email: zod_1.z
        .string()
        .email("Format email tidak valid")
        .nullable()
        .or(zod_1.z.literal("")),
    phone: zod_1.z
        .string()
        .max(50, "Nomor telepon terlalu panjang")
        .nullable()
        .or(zod_1.z.literal("")),
});
//# sourceMappingURL=supplierSchema.js.map