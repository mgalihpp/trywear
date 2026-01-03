import ApiConfig from "./apiConfig";
import HttpClient, { type ParentObj } from "./httpClient";
import Transaction from "./transaction";
interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
}
interface TransactionResponse {
    token: string;
    redirect_url: string;
    [key: string]: unknown;
}
/**
 * Snap object used to do request to Midtrans Snap API
 */
declare class Snap implements ParentObj {
    apiConfig: ApiConfig;
    httpClient: HttpClient;
    transaction: Transaction;
    [key: string]: unknown;
    constructor(options?: SnapOptions);
    /**
     * Do `/transactions` API request to Snap API
     * @param {Object} parameter - object of Core API JSON body as parameter, will be converted to JSON (more params detail refer to: https://snap-docs.midtrans.com)
     * @return {Promise} - Promise contains Object from JSON decoded response
     */
    createTransaction(parameter?: Record<string, unknown>): Promise<TransactionResponse>;
    /**
     * Wrapper function that call `createTransaction` then:
     * @return {Promise} - Promise of String token
     */
    createTransactionToken(parameter?: Record<string, unknown>): Promise<string>;
    /**
     * Wrapper function that call `createTransaction` then:
     * @return {Promise} - Promise of String redirect_url
     */
    createTransactionRedirectUrl(parameter?: Record<string, unknown>): Promise<string>;
}
export default Snap;
//# sourceMappingURL=snap.d.ts.map