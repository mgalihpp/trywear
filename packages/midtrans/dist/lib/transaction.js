"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * These are wrapper/implementation of API methods described on:
 * https://api-docs.midtrans.com/#midtrans-api
 * @return {Promise} - Promise that contains JSON API response decoded as Object
 */
class Transaction {
    parent;
    constructor(parentObj) {
        this.parent = parentObj;
    }
    status(transactionId = "") {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/status`;
        return this.parent.httpClient.request("get", this.parent.apiConfig.get().serverKey, apiUrl, {});
    }
    statusb2b(transactionId = "") {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/status/b2b`;
        return this.parent.httpClient.request("get", this.parent.apiConfig.get().serverKey, apiUrl, {});
    }
    approve(transactionId = "") {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/approve`;
        return this.parent.httpClient.request("post", this.parent.apiConfig.get().serverKey, apiUrl, {});
    }
    deny(transactionId = "") {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/deny`;
        return this.parent.httpClient.request("post", this.parent.apiConfig.get().serverKey, apiUrl, {});
    }
    cancel(transactionId = "") {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/cancel`;
        return this.parent.httpClient.request("post", this.parent.apiConfig.get().serverKey, apiUrl, {});
    }
    expire(transactionId = "") {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/expire`;
        return this.parent.httpClient.request("post", this.parent.apiConfig.get().serverKey, apiUrl, {});
    }
    refund(transactionId = "", parameter = {}) {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/refund`;
        return this.parent.httpClient.request("post", this.parent.apiConfig.get().serverKey, apiUrl, parameter);
    }
    refundDirect(transactionId = "", parameter = {}) {
        const apiUrl = `${this.parent.apiConfig.getCoreApiBaseUrl()}/v2/${transactionId}/refund/online/direct`;
        return this.parent.httpClient.request("post", this.parent.apiConfig.get().serverKey, apiUrl, parameter);
    }
    notification(notificationObj) {
        if (typeof notificationObj === "string" ||
            notificationObj instanceof String) {
            try {
                notificationObj = JSON.parse(notificationObj);
            }
            catch (err) {
                return Promise.reject(new MidtransNotificationError(`Fail to parse 'notification' string as JSON. Use JSON string or Object as 'notification'. Message: ${err.message}`));
            }
        }
        const transactionId = notificationObj
            .transaction_id;
        return this.status(transactionId)
            .then((res) => res)
            .catch((err) => Promise.reject(err));
    }
}
class MidtransNotificationError extends Error {
}
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map