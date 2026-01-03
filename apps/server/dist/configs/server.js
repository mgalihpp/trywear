"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("../configs/swagger"));
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../middleware/logger");
const rateLimiter_1 = require("../middleware/rateLimiter");
const payment_scheduler_1 = require("../modules/payment/payment.scheduler");
const routes_1 = __importDefault(require("../routes"));
const appConfig_1 = __importDefault(require("./appConfig"));
const cors_2 = require("./cors");
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString(), 10);
    // Return numeric value if it's a safe integer, otherwise return string representation
    return Number.isSafeInteger(int) ? int : this.toString();
};
class Server {
    app;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        this.port = Number(appConfig_1.default.PORT);
        this.middlewares();
        this.routes();
    }
    middlewares() {
        this.app.use((0, cors_1.default)(cors_2.corsOptions));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Middleware tambahan dapat ditambahkan di sini
        this.app.use(logger_1.addRequestId);
        this.app.use(logger_1.securityLogger);
        this.app.use(logger_1.requestLogger);
        this.app.use(logger_1.consoleLogger);
        this.app.use(logger_1.errorLogger);
        // Biar Aplikasi Tidak Crash
        this.app.use(errorHandler_1.errorHandler);
        this.app.use(rateLimiter_1.generalLimiter);
    }
    routes() {
        // Daftarkan router untuk API versi 1
        this.app.use(`${appConfig_1.default.BASE_API_PATH}/v1`, routes_1.default);
        this.app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
    }
    listen() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`Server running on port ${this.port}\n\nRunning: ${appConfig_1.default.SERVER_ORIGIN}\n\n`);
                // Start background schedulers
                payment_scheduler_1.paymentScheduler.start();
                resolve();
            });
        });
    }
}
exports.Server = Server;
