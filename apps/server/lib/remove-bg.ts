import { getEnv } from "@/utils/getEnv";
import { AppError } from "@/utils/appError";
import { HTTPSTATUS } from "@/configs/http";

export class RemoveBgService {
    private apiKey: string;
    private apiUrl = "https://api.remove.bg/v1.0/removebg";

    constructor() {
        this.apiKey = getEnv("REMOVE_BG_API_KEY", "");
    }

    /**
     * Remove background from an image URL
     * @param imageUrl - The URL of the image to process
     * @returns Buffer containing the processed image with transparent background
     */
    async removeBackground(imageUrl: string): Promise<Buffer> {
        if (!this.apiKey) {
            throw AppError.httpException(
                "Remove.bg API key is not configured",
                HTTPSTATUS.INTERNAL_SERVER_ERROR,
            );
        }

        const formData = new FormData();
        formData.append("size", "auto");
        formData.append("image_url", imageUrl);

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "X-Api-Key": this.apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Remove.bg API error:", response.status, errorText);

            if (response.status === 402) {
                throw AppError.httpException(
                    "Remove.bg API credits exhausted. Please check your account.",
                    HTTPSTATUS.PAYMENT_REQUIRED,
                );
            }

            if (response.status === 400) {
                throw AppError.httpException(
                    "Invalid image URL or format. Please provide a valid image.",
                    HTTPSTATUS.BAD_REQUEST,
                );
            }

            throw AppError.httpException(
                `Failed to remove background: ${response.statusText}`,
                HTTPSTATUS.BAD_GATEWAY,
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Remove background from an image file (base64)
     * @param imageBase64 - Base64 encoded image data
     * @returns Buffer containing the processed image with transparent background
     */
    async removeBackgroundFromBase64(imageBase64: string): Promise<Buffer> {
        if (!this.apiKey) {
            throw AppError.httpException(
                "Remove.bg API key is not configured",
                HTTPSTATUS.INTERNAL_SERVER_ERROR,
            );
        }

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const formData = new FormData();
        formData.append("size", "auto");
        formData.append("image_file_b64", base64Data);

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "X-Api-Key": this.apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Remove.bg API error:", response.status, errorText);

            if (response.status === 402) {
                throw AppError.httpException(
                    "Remove.bg API credits exhausted. Please check your account.",
                    HTTPSTATUS.PAYMENT_REQUIRED,
                );
            }

            throw AppError.httpException(
                `Failed to remove background: ${response.statusText}`,
                HTTPSTATUS.BAD_GATEWAY,
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}
