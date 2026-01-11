import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { HTTPSTATUS } from "@/configs/http";
import { AppError } from "@/utils/appError";
import { getEnv } from "@/utils/getEnv";

export class GeminiTryOnService {
  private readonly apiKey: string;
  private readonly client: GoogleGenerativeAI;
  // Gemini 3 Pro Image Preview for advanced image generation
  private readonly model = "gemini-3-pro-image-preview";

  constructor() {
    this.apiKey = getEnv("GOOGLE_GEMINI_API_KEY", "");
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Generate a virtual try-on image using Google Gemini 3 Pro Image API via SDK
   * @param personImageBase64 - Base64 encoded image of the person (with or without data URI prefix)
   * @param clothingImageBase64 - Base64 encoded image of the clothing item (with or without data URI prefix)
   * @param productName - Name of the product for context
   * @returns Base64 encoded result image with data URI prefix
   */
  async generateTryOn(
    personImageBase64: string,
    clothingImageBase64: string,
    productName: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw AppError.httpException(
        "Google Gemini API key is not configured",
        HTTPSTATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Clean base64 strings (remove data URI prefix if present)
    const cleanPersonImage = this.cleanBase64(personImageBase64);
    const cleanClothingImage = this.cleanBase64(clothingImageBase64);

    try {
      console.log("[Gemini Service] Initializing model:", this.model);
      
      // Initialize model (simplified - removed safety settings for debugging)
      const model = this.client.getGenerativeModel({ 
        model: this.model,
      });

      // Improved prompt for virtual try-on
      const prompt = `You are a professional virtual try-on AI. Your task is to generate a realistic image showing the person from the FIRST image wearing the clothing item from the SECOND image.

IMPORTANT INSTRUCTIONS:
1. PRESERVE the person's face, body shape, pose, and skin tone exactly as shown in the first image
2. REPLACE or OVERLAY the clothing from the second image onto the person naturally
3. The clothing must FIT realistically on the person's body proportions
4. MAINTAIN proper lighting, realistic shadows, and natural fabric folds
5. The final result must look like an authentic photograph, NOT a digital collage or manipulation
6. Keep the background and overall composition natural

The clothing item is: ${productName}

Generate a high-quality, photorealistic image of this person wearing the specified clothing.`;

      // Construct parts for the request
      const parts = [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanPersonImage,
          },
        },
        {
          inlineData: {
            mimeType: "image/png",
            data: cleanClothingImage,
          },
        },
      ];

      console.log("[Gemini Service] Calling generateContent...");
      // Generate content
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
      });
      console.log("[Gemini Service] generateContent completed!");

      const response = await result.response;
      console.log("[Gemini Service] Got response, checking candidates...");
      
      // Check if we have candidates
      if (!response.candidates || response.candidates.length === 0) {
        console.error("Gemini Response (No Candidates):", JSON.stringify(result, null, 2));
        throw AppError.httpException(
            "No response generated from Gemini API",
            HTTPSTATUS.BAD_GATEWAY,
        );
      }

      // Try to get image from response parts
      const candidate = response.candidates[0];
      console.log("[Gemini Service] Candidate finishReason:", candidate?.finishReason);
      
      // Check finish reason
      if (candidate.finishReason !== "STOP" && candidate.finishReason !== undefined) {
          console.warn("Gemini Warning: Finish reason is", candidate.finishReason);
      }

      // Defensive null check for content
      if (!candidate.content) {
        console.error("[Gemini Service] Candidate has no content!", JSON.stringify(candidate, null, 2));
        throw AppError.httpException(
          "Gemini API returned empty content",
          HTTPSTATUS.BAD_GATEWAY,
        );
      }

      const modelParts = candidate.content.parts;
      console.log("[Gemini Service] Number of parts:", modelParts?.length);
      
      if (!modelParts || modelParts.length === 0) {
        console.error("[Gemini Service] No parts in content!", JSON.stringify(candidate.content, null, 2));
        throw AppError.httpException(
          "Gemini API returned no content parts",
          HTTPSTATUS.BAD_GATEWAY,
        );
      }
      
      for (const part of modelParts) {
         console.log("[Gemini Service] Part type:", part.text ? "text" : part.inlineData ? "image" : "other");
         // Check for inline data (image)
         if (part.inlineData && part.inlineData.data) {
             const mimeType = part.inlineData.mimeType || "image/png";
             console.log("[Gemini Service] SUCCESS! Generated image with mimeType:", mimeType);
             return `data:${mimeType};base64,${part.inlineData.data}`;
         }
      }
      
      console.error("Gemini Response (No Image Part):", JSON.stringify(response, null, 2));
      throw AppError.httpException(
        "No image data found in Gemini API response. The model might have returned text only.",
        HTTPSTATUS.BAD_GATEWAY,
      );

    } catch (error) {
      console.error("Gemini try-on generation error (FULL OBJECT):", error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
          throw AppError.httpException(
            "Invalid or unauthorized Gemini API key",
            HTTPSTATUS.UNAUTHORIZED,
          );
      }

      if (errorMessage.includes("429") || errorMessage.includes("Resource has been exhausted")) {
          throw AppError.httpException(
            "Gemini API rate limit exceeded. Please wait a moment and try again.",
            HTTPSTATUS.TOO_MANY_REQUESTS,
          );
      }

      throw AppError.httpException(
        `Failed to generate try-on image: ${errorMessage}`,
        HTTPSTATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove data URI prefix from base64 string if present
   */
  private cleanBase64(base64String: string): string {
    return base64String.replace(/^data:image\/\w+;base64,/, "");
  }
}
