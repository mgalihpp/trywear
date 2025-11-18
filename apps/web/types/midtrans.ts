// ==== SNAP GLOBAL INTERFACE ====
interface Snap {
  pay: (token: string, options?: SnapOptions) => void;
  embed?: (token: string, options?: SnapEmbedOptions) => void;
}
// ==== SNAP OPTIONS (snap.pay) ====
interface SnapOptions {
  // Filter payment method yang ditampilkan
  enabledPayments?: SnapPaymentType[];

  // Callback functions
  onSuccess?: (result: SnapTransactionResult) => void;
  onPending?: (result: SnapTransactionResult) => void;
  onError?: (result: SnapTransactionResult) => void;
  onClose?: () => void;

  // UI & Behavior
  language?: "id" | "en";
  autoCloseDelay?: number; // detik, default 0 (disabled)
  selectedPaymentType?: SnapPaymentType; // langsung ke metode tertentu
  uiMode?: "deeplink" | "qr" | "auto"; // khusus GoPay, ShopeePay, QRIS
}

// ==== SNAP EMBED OPTIONS (jika pakai embed, jarang dipakai) ====
interface SnapEmbedOptions {
  container?: string | HTMLElement;
}

// ==== TIPE PEMBAYARAN YANG DIIZINKAN ====
type SnapPaymentType =
  | "credit_card"
  | "cimb_clicks"
  | "bca_klikbca"
  | "bca_klikpay"
  | "bri_epay"
  | "telkomsel_cash"
  | "echannel"
  | "permata_va"
  | "bca_va"
  | "bni_va"
  | "other_va"
  | "gopay"
  | "qris"
  | "shopeepay"
  | "indomaret"
  | "alfamart"
  | "danamon_online"
  | "akulaku"
  | "cstore";

// ==== HASIL CALLBACK DARI MIDTRANS (onSuccess / onPending / onError) ====
interface SnapTransactionResult {
  status_code: string; // "200", "201", "202", "400", dll
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string; // sama seperti SnapPaymentType
  transaction_time: string; // "2025-11-17 16:11:22"
  transaction_status:
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "cancel"
    | "expire"
    | "failure";
  fraud_status?: "accept" | "deny" | "challenge";

  // Credit Card
  masked_card?: string; // "481111-1114"
  card_type?: "credit" | "debit";
  bank?: string;
  approval_code?: string;

  // Virtual Account
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  permata_va_number?: string;
  bca_va_number?: string;

  // E-Channel (Mandiri Bill)
  bill_key?: string;
  biller_code?: string;

  // Convenience Store
  payment_code?: string; // kode bayar Indomaret/Alfamart

  // QRIS, GoPay, ShopeePay
  qr_code?: string;
  deeplink_url?: string;
  actions?: Array<{
    name: string;
    method: string;
    url: string;
  }>;

  // Umum
  pdf_url?: string;
  finish_redirect_url?: string;
}

interface PaymentGatewaySuccessResponse {
  status_code: string; // "200"
  status_message: string; // "Success, Credit Card transaction is successful"
  transaction_id: string; // UUID transaksi dari gateway
  masked_card?: string; // "48111111-1114"
  order_id: string; // ID order dari merchant (kamu)
  payment_type: string; // "credit_card" | "gopay" | "shopeepay" | dll
  transaction_time: string; // "2015-02-26 14:39:33"
  transaction_status: string; // "capture" | "settlement" | "pending" | dll
  fraud_status?: string; // "accept" | "deny" | "challenge"
  approval_code?: string; // kode approval dari bank
  signature_key?: string; // signature untuk verifikasi webhook
  bank?: string; // "bni" | "bca" | "mandiri" dll
  gross_amount: string; // selalu string di Midtrans
  channel_response_code?: string; // "00"
  channel_response_message?: string; // "Approved"
  card_type?: string; // "credit" | "debit"
  payment_option_type?: string; // kadang ada (contoh: "GOPAY_WALLET")
  shopeepay_reference_number?: string;
  reference_id?: string;

  // Field tambahan yang sering muncul di real case
  issuer?: string;
  eci?: string;
  three_domain_secure?: string;
  bill_key?: string;
  bill_code?: string;
  permata_va_number?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  payment_amounts?: Array<{
    paid_at: string;
    amount: string;
  }>;
  currency?: string;
  settlement_time?: string;
  expiry_time: string;
}

interface PaymentDetail {
  method: string; // wajib: "Bank Transfer BCA", "GoPay", "Kartu Kredit", dll
  bank?: string; // "BCA", "BNI", dll
  accountNumber?: string; // VA number atau rekening tujuan
  expiryTime?: string; // "26 Februari 2025 15:30 WIB"
  paidAt?: string; // waktu transaksi sukses
  maskedCard?: string; // tambah ini → "481111xxxxxx1114"
  qrisUrl?: string; // kalau QRIS
}

// Export biar bisa di-import jika perlu
export type {
  Snap,
  SnapOptions,
  SnapPaymentType,
  SnapTransactionResult,
  PaymentGatewaySuccessResponse,
  PaymentDetail,
};
