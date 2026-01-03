"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveBgService = void 0;
const http_1 = require("../configs/http");
const appError_1 = require("../utils/appError");
const getEnv_1 = require("../utils/getEnv");
class RemoveBgService {
    apiKey;
    apiUrl = "https://api.remove.bg/v1.0/removebg";
    constructor() {
        this.apiKey = (0, getEnv_1.getEnv)("REMOVE_BG_API_KEY", "");
    }
    /**
     * Remove background from an image URL
     * @param imageUrl - The URL of the image to process
     * @returns Buffer containing the processed image with transparent background
     */
    async removeBackground(imageUrl) {
        if (!this.apiKey) {
            throw appError_1.AppError.httpException("Remove.bg API key is not configured", http_1.HTTPSTATUS.INTERNAL_SERVER_ERROR);
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
                throw appError_1.AppError.httpException("Remove.bg API credits exhausted. Please check your account.", http_1.HTTPSTATUS.PAYMENT_REQUIRED);
            }
            if (response.status === 400) {
                throw appError_1.AppError.httpException("Invalid image URL or format. Please provide a valid image.", http_1.HTTPSTATUS.BAD_REQUEST);
            }
            throw appError_1.AppError.httpException(`Failed to remove background: ${response.statusText}`, http_1.HTTPSTATUS.BAD_GATEWAY);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    /**
     * Remove background from an image file (base64)
     * @param imageBase64 - Base64 encoded image data
     * @returns Buffer containing the processed image with transparent background
     */
    async removeBackgroundFromBase64(imageBase64) {
        if (!this.apiKey) {
            throw appError_1.AppError.httpException("Remove.bg API key is not configured", http_1.HTTPSTATUS.INTERNAL_SERVER_ERROR);
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
                throw appError_1.AppError.httpException("Remove.bg API credits exhausted. Please check your account.", http_1.HTTPSTATUS.PAYMENT_REQUIRED);
            }
            throw appError_1.AppError.httpException(`Failed to remove background: ${response.statusText}`, http_1.HTTPSTATUS.BAD_GATEWAY);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}
exports.RemoveBgService = RemoveBgService;
