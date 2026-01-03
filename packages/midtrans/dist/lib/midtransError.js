"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom HTTP Error Class that also exposes httpStatusCode, ApiResponse, rawHttpClientData
 * To expose more info for lib user
 */
class MidtransError extends Error {
    httpStatusCode;
    ApiResponse;
    rawHttpClientData;
    constructor(message, httpStatusCode = null, ApiResponse = null, rawHttpClientData = null) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.httpStatusCode = httpStatusCode;
        this.ApiResponse = ApiResponse;
        this.rawHttpClientData = rawHttpClientData;
        // This clips the constructor invocation from the stack trace.
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = MidtransError;
//# sourceMappingURL=midtransError.js.map