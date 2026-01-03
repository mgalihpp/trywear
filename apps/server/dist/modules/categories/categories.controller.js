"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const categories_service_1 = require("./categories.service");
class CategoriesController extends controller_1.BaseController {
    constructor() {
        super(new categories_service_1.CategoriesService());
    }
    getAll = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const cats = await this.service.findAll();
        new appResponse_1.AppResponse({
            res,
            data: cats,
        });
    });
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const cat = await this.service.findById(Number(id));
        if (!cat) {
            res.status(404).json({
                success: false,
                message: "Category not found",
            });
            return;
        }
        new appResponse_1.AppResponse({
            res,
            data: cat,
        });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const parsed = schema_1.createCategorySchema.parse(req.body);
        const cat = await this.service.create(parsed);
        new appResponse_1.AppResponse({
            res,
            data: cat,
        });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const parsed = schema_1.updateCategorySchema.parse(req.body);
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const cat = await this.service.update(Number(id), parsed);
        new appResponse_1.AppResponse({
            res,
            data: cat,
        });
    });
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        await this.service.delete(Number(id));
        new appResponse_1.AppResponse({
            res,
            message: "Successfully Delete Category",
        });
    });
}
exports.CategoriesController = CategoriesController;
