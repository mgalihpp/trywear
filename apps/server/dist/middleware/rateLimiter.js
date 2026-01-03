"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderLimiter = exports.searchLimiter = exports.uploadLimiter = exports.userManagementLimiter = exports.registerLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("../configs/http");
const WINDOW_MS_1_MIN = 1 * 60 * 1000; // 1 minute
const WINDOW_MS_15_MIN = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS_1_HOUR = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MESSAGE = "Too many requests from this IP, please try again later.";
const AUTH_RATE_LIMIT_MESSAGE = "Too many authentication attempts, please try again later.";
const REGISTER_RATE_LIMIT_MESSAGE = "Too many registration attempts, please try again later.";
const USER_MANAGEMENT_RATE_LIMIT_MESSAGE = "Too many user management requests, please try again later.";
const UPLOAD_RATE_LIMIT_MESSAGE = "Too many file uploads, please try again later.";
const SEARCH_RATE_LIMIT_MESSAGE = "Too many search requests, please try again later.";
const ORDER_RATE_LIMIT_MESSAGE = "Too many order operations, please try again later.";
const RETRY_AFTER_15_MIN = "15 minutes";
const RETRY_AFTER_1_HOUR = "1 hour";
const RETRY_AFTER_1_MIN = "1 minute";
// General API rate limiter - applies to all API routes
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_15_MIN, // 15 minutes
    max: 200, // Limit each IP to 100 requests per windowMs
    message: {
        error: RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_15_MIN,
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_15_MIN,
        });
    },
});
exports.generalLimiter = generalLimiter;
// Strict rate limiter for authentication endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_15_MIN, // 15 minutes
    max: 10, // Limit each IP to 5 login attempts per windowMs
    message: {
        error: AUTH_RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_15_MIN,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: AUTH_RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_15_MIN,
        });
    },
});
exports.authLimiter = authLimiter;
// Strict rate limiter for user registration
const registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_1_HOUR, // 1 hour
    max: 6, // Limit each IP to 3 registration attempts per hour
    message: {
        error: REGISTER_RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_1_HOUR,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: REGISTER_RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_1_HOUR,
        });
    },
});
exports.registerLimiter = registerLimiter;
// Moderate rate limiter for user management endpoints
const userManagementLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_15_MIN, // 15 minutes
    max: 40, // Limit each IP to 20 requests per windowMs
    message: {
        error: USER_MANAGEMENT_RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_15_MIN,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: USER_MANAGEMENT_RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_15_MIN,
        });
    },
});
exports.userManagementLimiter = userManagementLimiter;
// Rate limiter for file uploads
const uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_15_MIN, // 15 minutes
    max: 20, // Limit each IP to 10 uploads per windowMs
    message: {
        error: UPLOAD_RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_15_MIN,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: UPLOAD_RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_15_MIN,
        });
    },
});
exports.uploadLimiter = uploadLimiter;
// Rate limiter for search endpoints
const searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_1_MIN, // 1 minute
    max: 60, // Limit each IP to 30 search requests per minute
    message: {
        error: SEARCH_RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_1_MIN,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: SEARCH_RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_1_MIN,
        });
    },
});
exports.searchLimiter = searchLimiter;
// Rate limiter for order operations
const orderLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS_15_MIN, // 15 minutes
    max: 20, // Limit each IP to 15 order operations per windowMs
    message: {
        error: ORDER_RATE_LIMIT_MESSAGE,
        retryAfter: RETRY_AFTER_15_MIN,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(http_1.HTTPSTATUS.TOO_MANY_REQUESTS).json({
            error: ORDER_RATE_LIMIT_MESSAGE,
            retryAfter: RETRY_AFTER_15_MIN,
        });
    },
});
exports.orderLimiter = orderLimiter;
