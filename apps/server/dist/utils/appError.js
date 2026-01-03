"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const http_1 = require("../configs/http");
const error_1 = require("../types/enums/error");
class AppError extends Error {
    statusCode;
    errorCode;
    constructor(message, statusCode = http_1.HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
    static httpException(message = "Http Exception Error", statusCode, errorCode) {
        throw new AppError(message, statusCode, errorCode);
    }
    static internalServerError(message = "Internal Server Error", errorCode) {
        throw new AppError(message, http_1.HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode || error_1.ErrorCodeEnum.INTERNAL_SERVER_ERROR);
    }
    static notFound(message = "Resource not found", errorCode) {
        throw new AppError(message, http_1.HTTPSTATUS.NOT_FOUND, errorCode || error_1.ErrorCodeEnum.RESOURCE_NOT_FOUND);
    }
    static badRequest(message = "Bad Request", errorCode) {
        throw new AppError(message, http_1.HTTPSTATUS.BAD_REQUEST, errorCode || error_1.ErrorCodeEnum.VALIDATION_ERROR);
    }
    static unauthorized(message = "Unauthorized Access", errorCode) {
        throw new AppError(message, http_1.HTTPSTATUS.UNAUTHORIZED, errorCode || error_1.ErrorCodeEnum.ACCESS_UNAUTHORIZED);
    }
}
exports.AppError = AppError;
