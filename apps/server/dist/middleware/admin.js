"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.adminMiddleware = void 0;
const http_1 = require("../configs/http");
const appError_1 = require("../utils/appError");
const appResponse_1 = require("../utils/appResponse");
const asyncHandler_1 = require("./asyncHandler");
const authenticated_1 = require("./authenticated");
/**
 * Middleware admin, wajib sudah lewat authenticateMiddleware dulu
 */
exports.adminMiddleware = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            throw appError_1.AppError.unauthorized();
        }
        if (user.role !== "admin") {
            return new appResponse_1.AppResponse({
                res,
                statusCode: http_1.HTTPSTATUS.FORBIDDEN,
                message: "You are cannot access this features",
            });
        }
        next();
    }
    catch (error) {
        console.error(error);
        throw appError_1.AppError.unauthorized();
    }
});
exports.requireAdmin = [authenticated_1.authenticateMiddleware, exports.adminMiddleware];
