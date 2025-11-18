import type { Orders } from "@repo/db";
import { format } from "date-fns";
import type {
  PaymentDetail,
  PaymentGatewaySuccessResponse,
} from "@/types/midtrans";

export const mapGatewayResponseToPaymentDetail = (
  gatewayResponse: PaymentGatewaySuccessResponse,
  _order?: Orders, // atau tipe order kamu
): PaymentDetail => {
  const paymentType = gatewayResponse.payment_type;

  // Virtual Account
  if (["bank_transfer", "echannel", "permata"].includes(paymentType)) {
    const va = gatewayResponse.va_numbers?.[0];
    const bankName =
      va?.bank.toUpperCase() || gatewayResponse.bank?.toUpperCase();

    return {
      method: `Bank Transfer ${bankName}`,
      bank: bankName,
      accountNumber: va?.va_number || gatewayResponse.permata_va_number,
      expiryTime: `${format(
        new Date(gatewayResponse.transaction_time),
        "dd MMMM yyyy HH:mm",
      )} WIB`,
      paidAt:
        gatewayResponse.settlement_time &&
        `${format(
          new Date(gatewayResponse.settlement_time),
          "dd MMMM yyyy HH:mm",
        )} WIB`,
    };
  }

  // E-Wallet
  if (
    paymentType === "gopay" ||
    paymentType === "shopeepay" ||
    paymentType === "qris"
  ) {
    return {
      method:
        paymentType === "gopay"
          ? "GoPay"
          : paymentType === "shopeepay"
            ? "ShopeePay"
            : "QRIS",
      expiryTime: `${format(
        new Date(gatewayResponse.expiry_time),
        "dd MMMM yyyy HH:mm",
      )} WIB`,
      paidAt:
        gatewayResponse.settlement_time &&
        `${format(
          new Date(gatewayResponse.settlement_time),
          "dd MMMM yyyy HH:mm",
        )} WIB`,
    };
  }

  // Credit Card
  if (paymentType === "credit_card") {
    return {
      method: "Kartu Kredit",
      bank: gatewayResponse.bank?.toUpperCase(),
      maskedCard: gatewayResponse.masked_card,
      expiryTime: `${format(
        new Date(gatewayResponse.expiry_time),
        "dd MMMM yyyy HH:mm",
      )} WIB`,

      paidAt:
        gatewayResponse.settlement_time &&
        `${format(
          new Date(gatewayResponse.settlement_time),
          "dd MMMM yyyy HH:mm",
        )} WIB`,
    };
  }

  return { method: paymentType || "Unknown" };
};
