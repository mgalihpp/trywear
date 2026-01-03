import type ApiConfig from "./apiConfig";
import type HttpClient from "./httpClient";
interface NotificationObject {
    transaction_id: string;
    [key: string]: unknown;
}
interface TransactionSuccessReponse {
    status_code: string;
    status_message: string;
    transaction_id: string;
    masked_card: string;
    order_id: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: "settlement" | "pending" | "expire" | "capture" | "deny" | "authorize" | "cancel";
    fraud_status: string;
    approval_code: string;
    signature_key: string;
    bank: string;
    gross_amount: string;
    channel_response_code: string;
    channel_response_message: string;
    card_type: string;
    payment_option_type: string;
    shopeepay_reference_number: string;
    reference_id: string;
}
/**
 * These are wrapper/implementation of API methods described on:
 * https://api-docs.midtrans.com/#midtrans-api
 * @return {Promise} - Promise that contains JSON API response decoded as Object
 */
declare class Transaction {
    parent: {
        apiConfig: ApiConfig;
        httpClient: HttpClient;
    };
    constructor(parentObj: {
        apiConfig: ApiConfig;
        httpClient: HttpClient;
    });
    status(transactionId?: string): Promise<TransactionSuccessReponse>;
    statusb2b(transactionId?: string): Promise<unknown>;
    approve(transactionId?: string): Promise<unknown>;
    deny(transactionId?: string): Promise<unknown>;
    cancel(transactionId?: string): Promise<unknown>;
    expire(transactionId?: string): Promise<unknown>;
    refund(transactionId?: string, parameter?: Record<string, unknown>): Promise<unknown>;
    refundDirect(transactionId?: string, parameter?: Record<string, unknown>): Promise<unknown>;
    notification(notificationObj: NotificationObject | string): Promise<unknown>;
}
export default Transaction;
//# sourceMappingURL=transaction.d.ts.map