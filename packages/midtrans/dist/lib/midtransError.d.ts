/**
 * Custom HTTP Error Class that also exposes httpStatusCode, ApiResponse, rawHttpClientData
 * To expose more info for lib user
 */
declare class MidtransError extends Error {
    httpStatusCode: number | null;
    ApiResponse: unknown;
    rawHttpClientData: unknown;
    constructor(message: string, httpStatusCode?: number | null, ApiResponse?: unknown, rawHttpClientData?: unknown);
}
export default MidtransError;
//# sourceMappingURL=midtransError.d.ts.map