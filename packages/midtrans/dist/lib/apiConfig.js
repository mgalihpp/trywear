"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
/**
 *  Config Object that used to store isProduction, serverKey, clientKey.
 *  And also API base urls.
 */
class ApiConfig {
    isProduction;
    serverKey;
    clientKey;
    static CORE_SANDBOX_BASE_URL = "https://api.sandbox.midtrans.com";
    static CORE_PRODUCTION_BASE_URL = "https://api.midtrans.com";
    static SNAP_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1";
    static SNAP_PRODUCTION_BASE_URL = "https://app.midtrans.com/snap/v1";
    static IRIS_SANDBOX_BASE_URL = "https://app.sandbox.midtrans.com/iris/api/v1";
    static IRIS_PRODUCTION_BASE_URL = "https://app.midtrans.com/iris/api/v1";
    /**
     * Initiate with options
     * @param  {ApiConfigOptions} options - should have these props:
     * isProduction, serverKey, clientKey
     */
    constructor(options = {
        isProduction: false,
        serverKey: "",
        clientKey: "",
    }) {
        this.isProduction = false;
        this.serverKey = "";
        this.clientKey = "";
        this.set(options);
    }
    /**
     * Return config stored
     * @return {ApiConfigOptions} object contains isProduction, serverKey, clientKey
     */
    get() {
        return {
            isProduction: this.isProduction,
            serverKey: this.serverKey,
            clientKey: this.clientKey,
        };
    }
    set(options) {
        const currentConfig = {
            isProduction: this.isProduction,
            serverKey: this.serverKey,
            clientKey: this.clientKey,
        };
        const parsedOptions = lodash_1.default.pick(options, [
            "isProduction",
            "serverKey",
            "clientKey",
        ]);
        const mergedConfig = lodash_1.default.merge({}, currentConfig, parsedOptions);
        this.isProduction = mergedConfig.isProduction;
        this.serverKey = mergedConfig.serverKey;
        this.clientKey = mergedConfig.clientKey;
    }
    /**
     * @return {String} core api base url
     */
    getCoreApiBaseUrl() {
        return this.isProduction
            ? ApiConfig.CORE_PRODUCTION_BASE_URL
            : ApiConfig.CORE_SANDBOX_BASE_URL;
    }
    /**
     * @return {String} snap api base url
     */
    getSnapApiBaseUrl() {
        return this.isProduction
            ? ApiConfig.SNAP_PRODUCTION_BASE_URL
            : ApiConfig.SNAP_SANDBOX_BASE_URL;
    }
    /**
     * @return {String} Iris api base url
     */
    getIrisApiBaseUrl() {
        return this.isProduction
            ? ApiConfig.IRIS_PRODUCTION_BASE_URL
            : ApiConfig.IRIS_SANDBOX_BASE_URL;
    }
}
exports.default = ApiConfig;
//# sourceMappingURL=apiConfig.js.map