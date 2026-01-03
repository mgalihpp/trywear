"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppResponse = void 0;
class AppResponse {
    res;
    message;
    success;
    data;
    error;
    errors;
    errorCode;
    statusCode;
    constructor({ res, message, success = true, data, error, errors, errorCode, statusCode = 200, }) {
        this.res = res;
        this.message = message;
        this.success = success;
        this.data = data;
        this.error = error;
        this.errors = errors;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.send();
    }
    send() {
        return this.res.status(this.statusCode).json({
            message: this.message,
            success: this.success,
            data: this.data,
            error: this.error,
            errors: this.formatZodErrors(this.errors),
            errorCode: this.errorCode,
        });
    }
    formatZodErrors(errors) {
        if (!errors)
            return undefined;
        return errors.map((error) => ({
            field: error.path.join("."),
            message: error.message,
        }));
    }
}
exports.AppResponse = AppResponse;
