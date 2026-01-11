import { db } from "@repo/db";
import { HTTPSTATUS } from "@/configs/http";
import { GeminiTryOnService } from "@/lib/gemini-tryon";
import { RemoveBgService } from "@/lib/remove-bg";
import { AppError } from "@/utils/appError";

export interface AiTryOnInput {
  personImage: string; // Base64 encoded selfie image
  productId: string; // UUID of the product
}

export interface AiTryOnResult {
  image: string; // Base64 encoded result image
  productName: string;
}

export class TryOnService {
  private geminiService: GeminiTryOnService;
  private removeBgService: RemoveBgService;

  constructor() {
    this.geminiService = new GeminiTryOnService();
    this.removeBgService = new RemoveBgService();
  }

  /**
   * Generate AI try-on image
   * @param input - Person image and product ID
   * @returns Generated try-on image
   */
  async generateAiTryOn(input: AiTryOnInput): Promise<AiTryOnResult> {
    console.log("[TryOn Service] Starting AI generation...");
    const { personImage, productId } = input;

    // Validate person image
    if (!personImage || personImage.length === 0) {
      AppError.badRequest("Person image is required");
    }

    // Get product with images
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        product_images: {
          orderBy: { sort_order: "asc" },
          take: 1,
        },
      },
    });

    if (!product) {
      AppError.notFound("Product not found");
    }

    // Get product image URL
    const productImageUrl = product!.product_images[0]?.url;
    if (!productImageUrl) {
      AppError.badRequest("Product has no images");
    }

    // Remove background from product image
    let clothingImageBase64: string;
    try {
      const imageBuffer =
        await this.removeBgService.removeBackground(productImageUrl);
      clothingImageBase64 = imageBuffer.toString("base64");
    } catch (error) {
      console.error("Failed to remove background from product image:", error);
      // Fallback: try to fetch the image directly
      console.log("[TryOn Service] Falling back to direct image fetch. URL:", productImageUrl);
      try {
        clothingImageBase64 = await this.fetchImageAsBase64(productImageUrl!);
        console.log("[TryOn Service] Fallback image fetch successful. Length:", clothingImageBase64.length);
      } catch (fallbackError) {
        console.error("[TryOn Service] Fallback image fetch FAILED:", fallbackError);
        throw fallbackError;
      }
    }

    // Generate try-on image using Gemini
    console.log("[TryOn Service] Calling Gemini API with personImage length:", personImage.length, "clothingImage length:", clothingImageBase64.length);
    const generatedImage = await this.geminiService.generateTryOn(
      personImage,
      clothingImageBase64,
      product!.title,
    );

    return {
      image: generatedImage,
      productName: product!.title,
    };
  }

  /**
   * Fetch an image URL and convert to base64
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString("base64");
    } catch (error) {
      console.error("Error fetching image:", error);
      throw AppError.httpException(
        "Failed to process product image",
        HTTPSTATUS.BAD_GATEWAY,
      );
    }
  }
}
