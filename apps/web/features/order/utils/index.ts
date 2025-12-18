import { Check, Clock, Home, Package, Truck, XCircle } from "lucide-react";
import type { OrderStep, StatusConfig } from "../types";

export const extractStatusCode = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof (error as { response?: { status?: unknown } }).response?.status ===
      "number"
  ) {
    return (error as { response: { status: number } }).response.status;
  }
  return undefined;
};

export function getStatusConfig(status?: string | null): StatusConfig {
  switch (status) {
    case "pending":
      return {
        icon: Clock,
        bgColor: "bg-yellow-500",
        textColor: "text-yellow-500",
        title: "Menunggu Pembayaran",
        message: "Silakan selesaikan pembayaran sebelum waktu berakhir",
      };
    case "failed":
      return {
        icon: XCircle,
        bgColor: "bg-destructive",
        textColor: "text-destructive",
        title: "Pembayaran Gagal",
        message: "Pembayaran Anda tidak berhasil diproses",
      };
    case "cancelled":
    case "cancel":
      return {
        icon: XCircle,
        bgColor: "bg-destructive",
        textColor: "text-destructive",
        title: "Transaksi dibatalkan",
        message: "Transaksi Anda dibatalkan, silahkan coba lagi",
      };
    default:
      return {
        icon: Check,
        bgColor: "bg-foreground",
        textColor: "text-foreground",
        title: "Pesanan Berhasil!",
        message: "Pesanan Anda sedang diproses",
      };
  }
}

export function buildOrderSteps(
  shippingStatus: string,
  paidAt?: string | Date | null,
  shippedAt?: string | Date | null,
  deliveredAt?: string | Date | null,
): OrderStep[] {
  return [
    {
      icon: Check,
      label: "Pesanan Diterima",
      active: [
        "ready",
        "processing",
        "shipped",
        "in_transit",
        "delivered",
      ].includes(shippingStatus),
      date: paidAt,
    },
    {
      icon: Package,
      label: "Sedang Diproses",
      active: ["processing", "shipped", "in_transit", "delivered"].includes(
        shippingStatus,
      ),
      date: paidAt,
    },
    {
      icon: Truck,
      label: "Dalam Pengiriman",
      active: ["shipped", "in_transit", "delivered"].includes(shippingStatus),
      date: shippedAt,
    },
    {
      icon: Home,
      label: "Terkirim",
      active: ["delivered"].includes(shippingStatus),
      date: deliveredAt,
    },
  ];
}
