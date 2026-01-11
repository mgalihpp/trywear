import { Router } from "express";
import { authenticateMiddleware } from "@/middleware/authenticated";
import { TryOnController } from "./tryon.controller";

export const tryonRouter = Router();
const tryonController = new TryOnController();

/**
 * @swagger
 * tags:
 *   name: TryOn
 *   description: Virtual Try-On AI features
 */

/**
 * @swagger
 * /api/v1/tryon/ai-generate:
 *   post:
 *     summary: Generate AI try-on image
 *     description: Upload a selfie photo and generate an image of the person wearing the selected product using AI
 *     tags: [TryOn]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personImage
 *               - productId
 *             properties:
 *               personImage:
 *                 type: string
 *                 description: Base64 encoded selfie image (with or without data URI prefix)
 *                 example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the product to try on
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: AI try-on image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "AI try-on image generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     image:
 *                       type: string
 *                       description: Base64 encoded result image with data URI prefix
 *                     productName:
 *                       type: string
 *                       description: Name of the product
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Product not found
 *       429:
 *         description: Rate limit exceeded
 *       502:
 *         description: AI service error
 */
tryonRouter.post(
  "/ai-generate",
  authenticateMiddleware,
  tryonController.generateAiTryOn,
);
