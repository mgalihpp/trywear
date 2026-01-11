import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppResponse } from "@/utils/appResponse";
import { TryOnService, type AiTryOnInput } from "./tryon.service";

export class TryOnController {
  private service: TryOnService;

  constructor() {
    this.service = new TryOnService();
  }

  /**
   * Generate AI try-on image from uploaded selfie and product
   * POST /api/v1/tryon/ai-generate
   */
  generateAiTryOn = asyncHandler(async (req: Request, res: Response) => {
    console.log("[TryOn Controller] Request received for AI generation");
    const { personImage, productId } = req.body as AiTryOnInput;
    console.log("[TryOn Controller] productId:", productId, "personImage length:", personImage?.length || 0);

    if (!personImage) {
      return new AppResponse({
        res,
        statusCode: 400,
        message: "Person image is required",
      });
    }

    if (!productId) {
      return new AppResponse({
        res,
        statusCode: 400,
        message: "Product ID is required",
      });
    }

    const result = await this.service.generateAiTryOn({
      personImage,
      productId,
    });

    console.log("[TryOn Controller] Got result from service. Image size:", result.image?.length || 0);
    console.log("[TryOn Controller] Sending response to client...");

    const response = new AppResponse({
      res,
      data: result,
      message: "AI try-on image generated successfully",
    });

    console.log("[TryOn Controller] Response sent successfully!");
    return response;
  });
}
