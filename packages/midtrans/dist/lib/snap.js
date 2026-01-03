"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiConfig_1 = __importDefault(require("./apiConfig"));
const httpClient_1 = __importDefault(require("./httpClient"));
const transaction_1 = __importDefault(require("./transaction"));
/**
 * Snap object used to do request to Midtrans Snap API
 */
class Snap {
    apiConfig;
    httpClient;
    transaction;
    constructor(options = {
        isProduction: false,
        serverKey: "",
        clientKey: "",
    }) {
        this.apiConfig = new apiConfig_1.default(options);
        this.httpClient = new httpClient_1.default(this);
        this.transaction = new transaction_1.default(this);
    }
    /**
     * Do `/transactions` API request to Snap API
     * @param {Object} parameter - object of Core API JSON body as parameter, will be converted to JSON (more params detail refer to: https://snap-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    createTransaction(parameter = {}) {
        const apiUrl = `${this.apiConfig.getSnapApiBaseUrl()}/transactions`;
        console.log(this.apiConfig.get().serverKey);
        return this.httpClient.request("post", this.apiConfig.get().serverKey, apiUrl, parameter);
    }
    /**
     * Wrapper function that call `createTransaction` then:
     * @return {Promise} - Promise of String token
     */
    createTransactionToken(parameter = {}) {
        return this.createTransaction(parameter).then((res) => res.token);
    }
    /**
     * Wrapper function that call `createTransaction` then:
     * @return {Promise} - Promise of String redirect_url
     */
    createTransactionRedirectUrl(parameter = {}) {
        return this.createTransaction(parameter).then((res) => res.redirect_url);
    }
}
exports.default = Snap;
//# sourceMappingURL=snap.js.map