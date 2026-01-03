import { type AxiosInstance } from "axios";
export type ParentObj = Record<string, unknown>;
/**
 * Wrapper of Axios to do API request to Midtrans API
 * @return {Promise<any>} of API response, or exception during request
 * capable to do HTTP `request`
 */
declare class HttpClient {
    parent: ParentObj;
    http_client: AxiosInstance;
    constructor(parentObj?: ParentObj);
    request<T>(httpMethod: string, serverKey: string, requestUrl: string, firstParam?: Record<string, unknown>, secondParam?: Record<string, unknown>): Promise<T>;
}
export default HttpClient;
//# sourceMappingURL=httpClient.d.ts.map