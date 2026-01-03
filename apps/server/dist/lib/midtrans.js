"use strict";
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snap = void 0;
const midtrans_1 = __importDefault(require("@repo/midtrans"));
const appConfig_1 = __importDefault(require("../configs/appConfig"));
exports.snap = new midtrans_1.default.Snap({
    isProduction: appConfig_1.default.NODE_ENV !== "development",
    serverKey: appConfig_1.default.NODE_ENV !== "development"
        ? appConfig_1.default.MIDTRANS_SANDBOX_SERVER_KEY
        : appConfig_1.default.MIDTRANS_SANDBOX_SERVER_KEY,
    clientKey: appConfig_1.default.NODE_ENV !== "development"
        ? appConfig_1.default.MIDTRANS_SANDBOX_CLIENT_KEY
        : appConfig_1.default.MIDTRANS_SANDBOX_CLIENT_KEY,
});
