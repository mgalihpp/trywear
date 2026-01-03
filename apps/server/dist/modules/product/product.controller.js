"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appResponse_1 = require("../../utils/appResponse");
const controller_1 = require("../controller");
const product_service_1 = require("./product.service");
const normalizeQuery = (query) => {
    const fixed = { ...query };
    // Convert color[]
    if (query["colors[]"])
        fixed.colors = Array.isArray(query["colors[]"])
            ? query["colors[]"]
            : [query["colors[]"]];
    if (query["sizes[]"])
        fixed.sizes = Array.isArray(query["sizes[]"])
            ? query["sizes[]"]
            : [query["sizes[]"]];
    if (query["priceRange[]"])
        fixed.priceRange = Array.isArray(query["priceRange[]"])
            ? query["priceRange[]"]
            : [query["priceRange[]"]];
    return fixed;
};
class ProductController extends controller_1.BaseController {
    constructor() {
        super(new product_service_1.ProductService());
    }
    getAll = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const products = await this.service.findAll();
        return new appResponse_1.AppResponse({
            res,
            data: products,
        });
    });
    getAllByFilters = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const q = schema_1.listProductsQuery.parse(normalizeQuery(req.query));
        const products = await this.service.findAll(q);
        return new appResponse_1.AppResponse({ res, data: products });
    });
    getRelatedProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.productIdParams.parse(req.params);
        const relatedProducts = await this.service.findSimilarProducts(id);
        return new appResponse_1.AppResponse({
            res,
            data: relatedProducts,
        });
    });
    getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.productIdParams.parse(req.params);
        const product = await this.service.findById(id);
        return new appResponse_1.AppResponse({
            res,
            data: product,
        });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = schema_1.createProductSchema.parse(req.body);
        const newProduct = await this.service.create(data);
        return new appResponse_1.AppResponse({
            res,
            data: newProduct,
        });
    });
    createImages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = schema_1.createProductImagesSchema.parse(req.body);
        const images = await this.service.createImages(data);
        return new appResponse_1.AppResponse({
            res,
            data: images,
        });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.productIdParams.parse(req.params);
        const data = schema_1.updateProductSchema.parse(req.body);
        const updatedProduct = await this.service.update(id, data);
        return new appResponse_1.AppResponse({
            res,
            data: updatedProduct,
        });
    });
    deleteImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { imageId } = schema_1.imageIdParams.parse(req.params);
        const deletedImage = await this.service.deleteImage(Number(imageId));
        return new appResponse_1.AppResponse({
            res,
            data: deletedImage,
        });
    });
    getAvailableFilters = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const filters = await this.service.getAvailableFilters();
        return new appResponse_1.AppResponse({
            res,
            data: filters,
        });
    });
    createProductReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const parsed = schema_1.createProductReviewSchema.parse(req.body);
        const userId = req.user?.id;
        const newReview = await this.service.createReview(userId, parsed);
        return new appResponse_1.AppResponse({
            res,
            data: newReview,
        });
    });
    deleteProductReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.paramsIdSchema.parse(req.params);
        const deletedReview = await this.service.deleteReview(id);
        return new appResponse_1.AppResponse({
            res,
            data: deletedReview,
        });
    });
    getProductReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.productIdParams.parse(req.params);
        const reviews = await this.service.getProductReviews(id);
        return new appResponse_1.AppResponse({
            res,
            data: reviews,
        });
    });
    removeBackground = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return new appResponse_1.AppResponse({
                res,
                statusCode: 400,
                message: "Image URL is required",
            });
        }
        const processedImage = await this.service.removeBackground(imageUrl);
        return new appResponse_1.AppResponse({
            res,
            data: { image: processedImage },
            message: "Background removed successfully",
        });
    });
}
exports.ProductController = ProductController;
