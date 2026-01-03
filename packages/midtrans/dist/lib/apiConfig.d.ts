export interface ApiConfigOptions {
    isProduction?: boolean;
    serverKey?: string;
    clientKey?: string;
}
/**
 *  Config Object that used to store isProduction, serverKey, clientKey.
 *  And also API base urls.
 */
declare class ApiConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
    static CORE_SANDBOX_BASE_URL: string;
    static CORE_PRODUCTION_BASE_URL: string;
    static SNAP_SANDBOX_BASE_URL: string;
    static SNAP_PRODUCTION_BASE_URL: string;
    static IRIS_SANDBOX_BASE_URL: string;
    static IRIS_PRODUCTION_BASE_URL: string;
    /**
     * Initiate with options
     * @param  {ApiConfigOptions} options - should have these props:
     * isProduction, serverKey, clientKey
     */
    constructor(options?: ApiConfigOptions);
    /**
     * Return config stored
     * @return {ApiConfigOptions} object contains isProduction, serverKey, clientKey
     */
    get(): ApiConfigOptions;
    set(options: ApiConfigOptions): void;
    /**
     * @return {String} core api base url
     */
    getCoreApiBaseUrl(): string;
    /**
     * @return {String} snap api base url
     */
    getSnapApiBaseUrl(): string;
    /**
     * @return {String} Iris api base url
     */
    getIrisApiBaseUrl(): string;
}
export default ApiConfig;
//# sourceMappingURL=apiConfig.d.ts.map