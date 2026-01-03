"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const errorHandler_1 = require("./errorHandler");
/**
 * Wraps a controller function with try-catch block, and passes the caught
 * error to errorHandler.
 *
 * @param {Controller} fn - Controller function to wrap.
 *
 * @returns {Controller} Wrapped controller function.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        (0, errorHandler_1.errorHandler)(error, req, res, next);
    });
};
exports.asyncHandler = asyncHandler;
