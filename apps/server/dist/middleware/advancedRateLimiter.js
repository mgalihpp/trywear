"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDynamicLimiter = exports.productLimiter = exports.wishlistLimiter = exports.adminLimiter = exports.passwordResetLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiter for password reset attempts
const passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 6, // Limit to 3 password reset attempts per hour per IP
    message: {
        error: "Too many password reset attempts, please try again later.",
        retryAfter: "1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many password reset attempts, please try again later.",
            retryAfter: "1 hour",
        });
    },
});
exports.passwordResetLimiter = passwordResetLimiter;
// Rate limiter for admin operations
const adminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Higher limit for admin operations
    message: {
        error: "Too many admin operations, please try again later.",
        retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many admin operations, please try again later.",
            retryAfter: "15 minutes",
        });
    },
});
exports.adminLimiter = adminLimiter;
// Rate limiter for wishlist operations
const wishlistLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 40, // Limit wishlist operations
    message: {
        error: "Too many wishlist operations, please try again later.",
        retryAfter: "5 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many wishlist operations, please try again later.",
            retryAfter: "5 minutes",
        });
    },
});
exports.wishlistLimiter = wishlistLimiter;
// Rate limiter for product operations (viewing, etc.)
const productLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // Allow more requests for product viewing
    message: {
        error: "Too many product requests, please try again later.",
        retryAfter: "1 minute",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({
            error: "Too many product requests, please try again later.",
            retryAfter: "1 minute",
        });
    },
});
exports.productLimiter = productLimiter;
// Dynamic rate limiter that can be configured per endpoint
const createDynamicLimiter = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            error: message,
            retryAfter: `${Math.ceil(windowMs / 60000)} minutes`,
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
            res.status(429).json({
                error: message,
                retryAfter: `${Math.ceil(windowMs / 60000)} minutes`,
            });
        },
    });
};
exports.createDynamicLimiter = createDynamicLimiter;
