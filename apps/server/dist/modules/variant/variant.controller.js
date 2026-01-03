"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantsController = void 0;
const schema_1 = require("@repo/schema");
const zod_1 = __importDefault(require("zod"));
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const variant_service_1 = require("./variant.service");
class ProductVariantsController extends controller_1.BaseController {
    constructor() {
        super(new variant_service_1.ProductVariantsService());
    }
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (Array.isArray(req.body)) {
            const parsed = zod_1.default.array(schema_1.createVariantSchema).parse(req.body);
            const newVariants = await this.service.createMany(parsed);
            return new appResponse_1.AppResponse({
                res,
                data: newVariants,
                message: `Successfully created ${newVariants.length} variants.`,
            });
        }
        const parsed = schema_1.createVariantSchema.parse(req.body);
        const newVariant = await this.service.create(parsed);
        return new appResponse_1.AppResponse({
            res,
            data: newVariant,
        });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const parsed = schema_1.updateVariantSchema.parse(req.body);
        const { variantId } = schema_1.variantIdParams.parse(req.params);
        const updatedVariant = await this.service.update(variantId, parsed);
        return new appResponse_1.AppResponse({
            res,
            data: updatedVariant,
        });
    });
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { variantId } = schema_1.variantIdParams.parse(req.params);
        const deletedVariant = await this.service.delete(variantId);
        return new appResponse_1.AppResponse({
            res,
            data: deletedVariant,
        });
    });
}
exports.ProductVariantsController = ProductVariantsController;
