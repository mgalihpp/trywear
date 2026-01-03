"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const http_1 = require("../configs/http");
const error_1 = require("../types/enums/error");
const appError_1 = require("../utils/appError");
const appResponse_1 = require("../utils/appResponse");
// Enhanced Prisma error handling for server
const handlePrismaError = (error) => {
    if (!error || typeof error !== "object" || !("code" in error)) {
        return {
            error: "Internal server error. Please try again later.",
            timestamp: new Date().toISOString(),
        };
    }
    const prismaError = error;
    switch (prismaError.code) {
        case "P2002":
            return {
                error: "A record with this information already exists",
                details: prismaError.meta?.target
                    ? `Field: ${prismaError.meta.target}`
                    : undefined,
                timestamp: new Date().toISOString(),
            };
        case "P2025":
            return {
                error: "Record not found",
                timestamp: new Date().toISOString(),
            };
        case "P2003":
            return {
                error: "Foreign key constraint failed",
                timestamp: new Date().toISOString(),
            };
        case "P2014":
            return {
                error: "The change you are trying to make would violate the required relation",
                timestamp: new Date().toISOString(),
            };
        case "P2021":
            return {
                error: "The table does not exist in the current database",
                timestamp: new Date().toISOString(),
            };
        case "P2022":
            return {
                error: "The column does not exist in the current database",
                timestamp: new Date().toISOString(),
            };
        default:
            return {
                error: "Database operation failed",
                details: `Error code: ${prismaError.code}`,
                timestamp: new Date().toISOString(),
            };
    }
};
/**
 * Handles any errors that occur within the application. It logs the error
 * with the current request path and method, and returns a JSON response with
 * the error message and status code. If the error is a ZodError, it includes
 * the validation errors in the response. If the error is an AppError, it
 * includes the error code in the response.
 * @param {Error} err The error that occurred
 * @param {Request} req The request object
 * @param {Response} res The response object
 * @param {NextFunction} _next The next middleware function in the stack
 * @returns {void}
 */
const errorHandler = (err, req, res, _next) => {
    console.error(`
    \x1b[31mError Occurred:\x1b[0m
    \x1b[34mPATH:\x1b[0m "${req.path}"
    \x1b[34mMETHOD:\x1b[0m "${req.method}"
    \x1b[34mMESSAGE:\x1b[0m "${err.message}"
  `);
    switch (true) {
        case err instanceof SyntaxError:
            new appResponse_1.AppResponse({
                res,
                message: "Invalid JSON format. Please check your request body.",
                success: false,
                error: err.name,
                errorCode: "JSON_FORMAT_ERROR",
                statusCode: http_1.HTTPSTATUS.BAD_REQUEST,
            });
            break;
        case typeof err === "object" && "code" in err: {
            const prismaErrorResponse = handlePrismaError(err);
            new appResponse_1.AppResponse({
                res,
                message: prismaErrorResponse.error,
                success: false,
                error: err.name,
                errorCode: prismaErrorResponse.details,
                statusCode: http_1.HTTPSTATUS.BAD_REQUEST,
            });
            break;
        }
        case err instanceof zod_1.ZodError:
            new appResponse_1.AppResponse({
                res,
                message: "Validation failed",
                success: false,
                error: err.name,
                errors: err.issues,
                errorCode: error_1.ErrorCodeEnum.VALIDATION_ERROR,
                statusCode: http_1.HTTPSTATUS.BAD_REQUEST,
            });
            break;
        case err instanceof appError_1.AppError:
            new appResponse_1.AppResponse({
                res,
                message: err.message,
                success: false,
                error: err.name,
                statusCode: err.statusCode,
                errorCode: err.errorCode,
            });
            break;
        default:
            new appResponse_1.AppResponse({
                res,
                message: "Internal Server Error",
                success: false,
                error: err.message || "Unknown error occurred",
                errorCode: error_1.ErrorCodeEnum.INTERNAL_SERVER_ERROR,
                statusCode: http_1.HTTPSTATUS.INTERNAL_SERVER_ERROR,
            });
            break;
    }
};
exports.errorHandler = errorHandler;
