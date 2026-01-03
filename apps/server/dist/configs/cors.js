"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const appConfig_1 = __importDefault(require("./appConfig"));
const allowedOrigins = [
    appConfig_1.default.CLIENT_ORIGIN,
    appConfig_1.default.SERVER_ORIGIN,
    process.env.NEXTAUTH_URL,
    process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values
// CORS configuration with origin validation
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (process.env.NODE_ENV === "development" &&
            origin.startsWith("http://localhost:")) {
            return callback(null, true);
        }
        // Reject other origins
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-idempotency-key"],
    credentials: true, // Allow cookies and authorization headers
};
