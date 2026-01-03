"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const appConfig_1 = __importDefault(require("./configs/appConfig"));
const cors_2 = require("./configs/cors");
const swagger_1 = __importDefault(require("./configs/swagger"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const payment_scheduler_1 = require("./modules/payment/payment.scheduler");
const routes_1 = __importDefault(require("./routes"));
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString(), 10);
    // Return numeric value if it's a safe integer, otherwise return string representation
    return Number.isSafeInteger(int) ? int : this.toString();
};
const app = (0, express_1.default)();
const port = Number(appConfig_1.default.PORT);
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware tambahan dapat ditambahkan di sini
app.use(logger_1.addRequestId);
app.use(logger_1.securityLogger);
app.use(logger_1.requestLogger);
app.use(logger_1.consoleLogger);
app.use(logger_1.errorLogger);
// Biar Aplikasi Tidak Crash
app.use(errorHandler_1.errorHandler);
app.use(rateLimiter_1.generalLimiter);
// Daftarkan router untuk API versi 1
app.use(`${appConfig_1.default.BASE_API_PATH}/v1`, routes_1.default);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.listen(port, () => {
    console.log(`Server running on port ${port}\n\nRunning: ${appConfig_1.default.SERVER_ORIGIN}\n\n`);
    // Start background schedulers
    payment_scheduler_1.paymentScheduler.start();
});
exports.default = app;
