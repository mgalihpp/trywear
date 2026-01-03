"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createCategorySchema = zod_1.default.object({
    name: zod_1.default.string().min(1),
    slug: zod_1.default.string().min(1),
    description: zod_1.default.string().optional(),
    parent_id: zod_1.default.number().optional().nullable(),
});
exports.updateCategorySchema = zod_1.default.object({
    name: zod_1.default.string().min(1).optional(),
    slug: zod_1.default.string().min(1).optional(),
    description: zod_1.default.string().optional(),
    parent_id: zod_1.default.number().optional().nullable(),
});
//# sourceMappingURL=categorySchema.js.map