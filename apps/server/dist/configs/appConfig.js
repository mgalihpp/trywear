"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getEnv_1 = require("../utils/getEnv");
/**
 * Returns an object containing the application's configuration.
 *
 * @returns {AppConfig} An object containing the application's configuration.
 */
const config = () => ({
    NODE_ENV: (0, getEnv_1.getEnv)("NODE_ENV", "development"),
    PORT: (0, getEnv_1.getEnv)("PORT", "5000"),
    BASE_API_PATH: (0, getEnv_1.getEnv)("BASE_API_PATH", "/api"),
    SERVER_ORIGIN: (0, getEnv_1.getEnv)("SERVER_ORIGIN", `http://localhost:${(0, getEnv_1.getEnv)("PORT", "5000")}`),
    CLIENT_ORIGIN: (0, getEnv_1.getEnv)("CLIENT_ORIGIN", "http://localhost:3000"),
    // Midtrans keys
    MIDTRANS_SANDBOX_SERVER_KEY: (0, getEnv_1.getEnv)("MIDTRANS_SANDBOX_SERVER_KEY"),
    MIDTRANS_SANDBOX_CLIENT_KEY: (0, getEnv_1.getEnv)("MIDTRANS_SANDBOX_CLIENT_KEY"),
    MIDTRANS_PRODUCTION_SERVER_KEY: (0, getEnv_1.getEnv)("MIDTRANS_PRODUCTION_SERVER_KEY"),
    MIDTRANS_PRODUCTION_CLIENT_KEY: (0, getEnv_1.getEnv)("MIDTRANS_PRODUCTION_CLIENT_KEY"),
});
const appConfig = config();
exports.default = appConfig;
