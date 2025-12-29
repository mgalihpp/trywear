import { Router } from "express";
import { requireAdmin } from "@/middleware/admin";
import { authenticateMiddleware } from "@/middleware/authenticated";
import { ProductVariantsController } from "../variant/variant.controller";
import { ProductController } from "./product.controller";

const productRouter = Router();
const productController = new ProductController();
const productVariantsController = new ProductVariantsController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Apparel products (hoodies, t-shirts, etc.)
 */

/* ---------------------- PRODUCTS ---------------------- */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List products
 *     description: Get a paginated list of apparel products.
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/CategoryQuery'
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
productRouter.get("/", requireAdmin, productController.getAll);

/**
 * @swagger
 * /api/v1/products/related/{id}:
 *   get:
 *     summary: Get related products
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Related products
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
productRouter.get("/related/:id", productController.getRelatedProducts);

/**
 * @swagger
 * /api/v1/products/filters:
 *   get:
 *     summary: List products using filters
 *     tags: [Products]
 *     parameters:
 *       - name: categoryId
 *         in: query
 *         schema:
 *           type: string
 *       - name: colors[]
 *         in: query
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: sizes[]
 *         in: query
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - name: priceRange[]
 *         in: query
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           minItems: 2
 *           maxItems: 2
 *           items:
 *             type: integer
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [newest, price_asc, price_desc]
 *     responses:
 *       200:
 *         description: Filtered products
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 */
productRouter.get("/filters", productController.getAllByFilters);

/**
 * @swagger
 * /api/v1/products/get-filters:
 *   get:
 *     summary: Get available filter options
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Available filter options
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductFilterOptions'
 */
productRouter.get("/get-filters", productController.getAvailableFilters);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productRouter.get("/:id", productController.getById);

/**
 * @swagger
 * /api/v1/products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 */
productRouter.get("/:id/reviews", productController.getProductReviews);

/**
 * @swagger
 * /api/v1/products/{id}/reviews:
 *   post:
 *     summary: Create product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - rating
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *                 nullable: true
 *               body:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Review'
 *       409:
 *         description: Review already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productRouter.post(
  "/:id/reviews",
  authenticateMiddleware,
  productController.createProductReview,
);

/**
 * @swagger
 * /api/v1/products/review/{id}:
 *   delete:
 *     summary: Delete product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productRouter.delete(
  "/review/:id",
  authenticateMiddleware,
  productController.deleteProductReview,
);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
productRouter.post("/", requireAdmin, productController.create);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
productRouter.put("/:id", requireAdmin, productController.update);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductId'
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
productRouter.delete("/:id", requireAdmin, productController.delete);

/* ---------------------- PRODUCT IMAGES ---------------------- */
/**
 * @swagger
 * /api/v1/products/images:
 *   post:
 *     summary: Upload product images
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ProductImage'
 *     responses:
 *       201:
 *         description: Images uploaded
 */
productRouter.post("/images", requireAdmin, productController.createImages);

/**
 * @swagger
 * /api/v1/products/images/{imageId}:
 *   delete:
 *     summary: Delete a product image
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/ProductImageId'
 *     responses:
 *       204:
 *         description: Image deleted successfully
 */
productRouter.delete(
  "/images/:imageId",
  requireAdmin,
  productController.deleteImage,
);

/**
 * @swagger
 * /api/v1/products/remove-bg:
 *   post:
 *     summary: Remove background from product image
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to process
 *     responses:
 *       200:
 *         description: Background removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       description: Base64 encoded PNG with transparent background
 */
productRouter.post("/remove-bg", authenticateMiddleware, productController.removeBackground);

/* ---------------------- PRODUCT VARIANTS ---------------------- */

/**
 * @swagger
 * /api/v1/products/variant:
 *   post:
 *     summary: Create a product variant
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       201:
 *         description: Variant created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariant'
 */
productRouter.post("/variant", requireAdmin, productVariantsController.create);

/**
 * @swagger
 * /api/v1/products/variant/{variantId}:
 *   put:
 *     summary: Update a product variant
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/VariantId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductVariant'
 *     responses:
 *       200:
 *         description: Variant updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Variant not found
 */
productRouter.put(
  "/variant/:variantId",
  requireAdmin,
  productVariantsController.update,
);

/**
 * @swagger
 * /api/v1/products/variant/{variantId}:
 *   delete:
 *     summary: Delete a product variant
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/VariantId'
 *     responses:
 *       204:
 *         description: Variant deleted successfully
 */
productRouter.delete(
  "/variant/:variantId",
  requireAdmin,
  productVariantsController.delete,
);

export { productRouter };
