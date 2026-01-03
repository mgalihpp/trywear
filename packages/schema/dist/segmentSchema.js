"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentFilterSchema = exports.assignSegmentSchema = exports.updateSegmentSchema = exports.createSegmentSchema = void 0;
const zod_1 = require("zod");
// Base segment schema
const segmentBase = {
    name: zod_1.z.string().min(1, "Name is required").max(100),
    slug: zod_1.z.string().min(1, "Slug is required").max(120),
    description: zod_1.z.string().optional(),
    min_spend_cents: zod_1.z.coerce.number().int().min(0).default(0),
    max_spend_cents: zod_1.z.coerce.number().int().positive().nullable().optional(),
    discount_percent: zod_1.z.coerce.number().min(0).max(100).default(0),
    color: zod_1.z.string().max(20).optional(),
    icon: zod_1.z.string().max(50).optional(),
    priority: zod_1.z.coerce.number().int().default(0),
    is_active: zod_1.z.boolean().default(true),
};
exports.createSegmentSchema = zod_1.z.object({
    ...segmentBase,
});
exports.updateSegmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    slug: zod_1.z.string().min(1).max(120).optional(),
    description: zod_1.z.string().optional(),
    min_spend_cents: zod_1.z.coerce.number().int().min(0).optional(),
    max_spend_cents: zod_1.z.coerce.number().int().positive().nullable().optional(),
    discount_percent: zod_1.z.coerce.number().min(0).max(100).optional(),
    color: zod_1.z.string().max(20).optional(),
    icon: zod_1.z.string().max(50).optional(),
    priority: zod_1.z.coerce.number().int().optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.assignSegmentSchema = zod_1.z.object({
    user_id: zod_1.z.string().min(1, "User ID is required"),
    segment_id: zod_1.z.coerce.number().int().positive().nullable(),
});
exports.segmentFilterSchema = zod_1.z.object({
    segment: zod_1.z.string().optional(),
    is_active: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=segmentSchema.js.map