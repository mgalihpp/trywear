"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateMiddleware = void 0;
const appConfig_1 = __importDefault(require("../configs/appConfig"));
const appError_1 = require("../utils/appError");
const asyncHandler_1 = require("./asyncHandler");
exports.authenticateMiddleware = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    try {
        // Fetch session from better auth nextjs routes handler
        const res = await fetch(`${appConfig_1.default.CLIENT_ORIGIN}/api/auth/get-session`, {
            headers: {
                cookie: req.headers.cookie || "", // Forward the cookies from the request
            },
            credentials: "include",
        });
        const data = await res.json();
        req.user = data?.user;
    }
    catch {
        throw appError_1.AppError.unauthorized();
    }
    next();
});
