"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createAddressSchema = zod_1.default.object({
    user_id: zod_1.default.string(),
    recipient_name: zod_1.default.string().max(50),
    label: zod_1.default.string().max(50).optional().nullable(),
    address_line1: zod_1.default.string().optional().nullable(),
    address_line2: zod_1.default.string().optional().nullable(),
    city: zod_1.default.string().max(100).optional().nullable(),
    province: zod_1.default.string().max(100).optional().nullable(),
    postal_code: zod_1.default.string().max(20).optional().nullable(),
    phone: zod_1.default.string().max(50).optional().nullable(),
    country: zod_1.default.string().max(100).optional().nullable(),
    lat: zod_1.default.number().optional().nullable(),
    lng: zod_1.default.number().optional().nullable(),
    is_default: zod_1.default.boolean().optional().default(false),
});
exports.updateAddressSchema = zod_1.default.object({
    recipient_name: zod_1.default.string().max(50).optional().nullable(),
    label: zod_1.default.string().max(50).optional().nullable(),
    address_line1: zod_1.default.string().optional().nullable(),
    address_line2: zod_1.default.string().optional().nullable(),
    city: zod_1.default.string().max(100).optional().nullable(),
    province: zod_1.default.string().max(100).optional().nullable(),
    postal_code: zod_1.default.string().max(20).optional().nullable(),
    phone: zod_1.default.string().max(50).optional().nullable(),
    country: zod_1.default.string().max(100).optional().nullable(),
    lat: zod_1.default.number().optional().nullable(),
    lng: zod_1.default.number().optional().nullable(),
    is_default: zod_1.default.boolean().optional(),
});
//# sourceMappingURL=addressSchema.js.map