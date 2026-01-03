"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const midtransError_1 = __importDefault(require("./midtransError"));
/**
 * Wrapper of Axios to do API request to Midtrans API
 * @return {Promise<any>} of API response, or exception during request
 * capable to do HTTP `request`
 */
class HttpClient {
    parent;
    http_client;
    constructor(parentObj = {}) {
        this.parent = parentObj;
        this.http_client = axios_1.default.create();
    }
    request(httpMethod, serverKey, requestUrl, firstParam = {}, secondParam = {}) {
        const headers = {
            "content-type": "application/json",
            accept: "application/json",
            "user-agent": "midtransclient-nodejs/1.3.0",
        };
        let reqBodyPayload = {};
        let reqQueryParam = {};
        if (httpMethod.toLowerCase() === "get") {
            reqQueryParam = firstParam;
            reqBodyPayload = secondParam;
        }
        else {
            reqBodyPayload = firstParam;
            reqQueryParam = secondParam;
        }
        return new Promise((resolve, reject) => {
            if (typeof reqBodyPayload === "string") {
                try {
                    reqBodyPayload = JSON.parse(reqBodyPayload);
                }
                catch (err) {
                    reject(new midtransError_1.default(`Failed to parse 'body parameters' string as JSON. Use JSON string or Object as 'body parameters'. Error: ${err.message}`));
                    return;
                }
            }
            if (typeof reqQueryParam === "string") {
                try {
                    reqQueryParam = JSON.parse(reqQueryParam);
                }
                catch (err) {
                    reject(new midtransError_1.default(`Failed to parse 'query parameters' string as JSON. Use JSON string or Object as 'query parameters'. Error: ${err.message}`));
                    return;
                }
            }
            this.http_client({
                method: httpMethod,
                headers: headers,
                url: requestUrl,
                data: reqBodyPayload,
                params: reqQueryParam,
                auth: {
                    username: serverKey,
                    password: "",
                },
            })
                .then((res) => {
                const statusCode = Number(res.data.status_code);
                if (Object.hasOwn(res.data, "status_code") &&
                    statusCode >= 400 &&
                    statusCode !== 407) {
                    reject(new midtransError_1.default(`Midtrans API returned an error. HTTP status code: ${res.data.status_code}. API response: ${JSON.stringify(res.data)}`, res.data.status_code, res.data, res));
                    return;
                }
                resolve(res.data);
            })
                .catch((err) => {
                const res = err.response;
                if (res && res.status >= 400) {
                    reject(new midtransError_1.default(`Midtrans API returned an error. HTTP status code: ${res.status}. API response: ${JSON.stringify(res.data)}`, res.status, res.data, res));
                }
                else if (!res) {
                    reject(new midtransError_1.default(`Midtrans API request failed. HTTP response not found, likely connection failure. Error: ${err.message}`, null, null, err));
                }
                else {
                    reject(err);
                }
            });
        });
    }
}
exports.default = HttpClient;
//# sourceMappingURL=httpClient.js.map