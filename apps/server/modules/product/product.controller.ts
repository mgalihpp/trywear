import type { Product } from "@repo/db";
import {
  createProductImagesSchema,
  createProductReviewSchema,
  createProductSchema,
  imageIdParams,
  listProductsQuery,
  paramsIdSchema,
  productIdParams,
  updateProductSchema,
} from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { BaseController } from "../controller";
import { ProductService } from "./product.service";

const normalizeQuery = (query: any) => {
  const fixed: any = { ...query };

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

export class ProductController extends BaseController<Product, ProductService> {
  constructor() {
    super(new ProductService());
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const products = await this.service.findAll();

    return new AppResponse({
      res,
      data: products,
    });
  });

  getAllByFilters = asyncHandler(async (req: Request, res: Response) => {
    const q = listProductsQuery.parse(normalizeQuery(req.query));

    const products = await this.service.findAll(q);

    return new AppResponse({ res, data: products });
  });

  getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdParams.parse(req.params);
    const relatedProducts = await this.service.findSimilarProducts(id);

    return new AppResponse({
      res,
      data: relatedProducts,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdParams.parse(req.params);
    const product = await this.service.findById(id);

    return new AppResponse({
      res,
      data: product,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = createProductSchema.parse(req.body);
    const newProduct = await this.service.create(data);

    return new AppResponse({
      res,
      data: newProduct,
    });
  });

  createImages = asyncHandler(async (req: Request, res: Response) => {
    const data = createProductImagesSchema.parse(req.body);

    const images = await this.service.createImages(data);

    return new AppResponse({
      res,
      data: images,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdParams.parse(req.params);
    const data = updateProductSchema.parse(req.body);

    const updatedProduct = await this.service.update(id, data);

    return new AppResponse({
      res,
      data: updatedProduct,
    });
  });

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { imageId } = imageIdParams.parse(req.params);
    const deletedImage = await this.service.deleteImage(Number(imageId));

    return new AppResponse({
      res,
      data: deletedImage,
    });
  });

  getAvailableFilters = asyncHandler(async (_req: Request, res: Response) => {
    const filters = await this.service.getAvailableFilters();
    return new AppResponse({
      res,
      data: filters,
    });
  });

  createProductReview = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createProductReviewSchema.parse(req.body);
    const userId = req.user?.id as string;

    const newReview = await this.service.createReview(userId, parsed);

    return new AppResponse({
      res,
      data: newReview,
    });
  });

  deleteProductReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = paramsIdSchema.parse(req.params);

    const deletedReview = await this.service.deleteReview(id);

    return new AppResponse({
      res,
      data: deletedReview,
    });
  });

  getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdParams.parse(req.params);

    const reviews = await this.service.getProductReviews(id);

    return new AppResponse({
      res,
      data: reviews,
    });
  });

  removeBackground = asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body as { imageUrl: string };

    if (!imageUrl) {
      return new AppResponse({
        res,
        statusCode: 400,
        message: "Image URL is required",
      });
    }

    const processedImage = await this.service.removeBackground(imageUrl);

    return new AppResponse({
      res,
      data: { image: processedImage },
      message: "Background removed successfully",
    });
  });
}
