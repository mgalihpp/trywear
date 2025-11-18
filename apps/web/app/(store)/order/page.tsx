"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { format } from "date-fns";
import {
  AlertCircle,
  Check,
  Clock,
  Home,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updatePaymentStatus } from "@/actions/payment";
import { formatCurrency } from "@/features/admin/utils";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { statusColors } from "@/features/order/constants/shipment";
import {
  useOrder,
  usePaymentStatus,
} from "@/features/order/queries/useOrderQuery";
import { mapGatewayResponseToPaymentDetail } from "@/features/order/utils/mapGateway";
import { useServerAction } from "@/hooks/useServerAction";
import type { PaymentDetail, Snap } from "@/types/midtrans";

declare global {
  interface Window {
    snap?: Snap;
  }
}

const scriptId = "midtrans-snap-script";

const OrderDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentStatus = searchParams.get("transaction_status") || "settlement";
  const [runUpdatePaymentStatusAction] = useServerAction(updatePaymentStatus);

  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(
    null,
  );

  const { data: orderData, isPending, isError } = useOrder(orderId as string);
  const { clearCart } = useCartStore();
  const { data: paymentData } = usePaymentStatus(orderId as string);

  const shippingStatus = orderData?.shipments?.[0]?.status ?? "";

  // const mockOrder = {
  //   id: orderId,
  //   date: new Date().toLocaleDateString("id-ID"),
  //   status:
  //     paymentStatus === "settlement"
  //       ? "Sedang Dikemas"
  //       : paymentStatus === "pending"
  //         ? "Menunggu Pembayaran"
  //         : "Pembayaran Gagal",
  //   paymentStatus: paymentStatus,
  //   trackingNumber: paymentStatus === "settlement" ? "JNE123456789012" : "-",
  //   estimatedDelivery:
  //     paymentStatus === "settlement" ? "18 - 20 Jan 2025" : "-",
  //   items: [
  //     {
  //       id: 1,
  //       name: "Premium Smartphone Pro Max",
  //       price: 12999000,
  //       quantity: 1,
  //       image: "",
  //     },
  //   ],
  //   shipping: {
  //     name: "John Doe",
  //     address: "Jl. Contoh No. 123",
  //     city: "Jakarta",
  //     postalCode: "12345",
  //     phone: "081234567890",
  //   },
  //   payment: {
  //     method: "Transfer Bank",
  //     bank: "BCA",
  //     accountNumber: "1234567890",
  //     expiryTime: paymentStatus === "pending" ? "23:59:59" : null,
  //   },
  //   total: 12999000,
  // };

  const getStatusConfig = () => {
    switch (orderData?.payments[0]?.status) {
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
  };

  const statusConfig = getStatusConfig();

  useEffect(() => {
    if (paymentStatus === "pending" && paymentData) {
      setPaymentDetail(mapGatewayResponseToPaymentDetail(paymentData));
    }
    if (paymentStatus === "settlement" && paymentData) {
      setPaymentDetail(mapGatewayResponseToPaymentDetail(paymentData));
    }
  }, [paymentData, paymentStatus]);

  useEffect(() => {
    if (typeof window === "undefined" || window.snap) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      process.env.NODE_ENV === "production"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string,
    );
    script.async = true;

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      existingScript?.remove();
    };
  }, []);

  const handlePayment = () => {
    if (!orderData?.payments[0]?.provider_payment_id) {
      toast.error("Tidak bisa melakukan pembayaran");
      return;
    }

    if (!window.snap) {
      alert(
        "Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman.",
      );
      return;
    }

    window.snap?.pay(orderData?.payments[0]?.provider_payment_id, {
      language: "id",
      onSuccess: (result) => {
        clearCart();
        runUpdatePaymentStatusAction({
          order_id: result.order_id,
          status: "settlement",
        });
        console.log(result);
        router.push(`${result.finish_redirect_url}`);
      },
      onPending: (result) => {
        clearCart();
        console.log(result);
        router.push(`${result.finish_redirect_url}`);
      },
      onError: (result) => {
        console.log(result);
        runUpdatePaymentStatusAction({
          order_id: result.order_id,
          status: "failed",
        });
        router.push(`${result.finish_redirect_url}`);
      },
      onClose: () => {
        clearCart();
        router.push(`/order?order_id=${orderId}`);
      },
    });
  };

  const getStepDate = (stepIndex: number) => {
    const shipment = orderData?.shipments?.[0];
    if (!shipment) return null;

    switch (stepIndex) {
      case 0: // Pesanan Diterima → waktu pembayaran selesai (settlement)
        return orderData?.payments?.[0]?.paid_at;

      case 1: // Sedang Diproses → biasanya sama dengan paid_at atau processed_at kalau ada
        return orderData?.payments?.[0]?.paid_at;

      case 2: // Dalam Pengiriman → shipped_at
        return shipment.shipped_at;

      case 3: // Terkirim → delivered_at
        return shipment.delivered_at;

      default:
        return null;
    }
  };

  const orderSteps = [
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
      date: getStepDate(0),
    },
    {
      icon: Package,
      label: "Sedang Diproses",
      active: ["processing", "shipped", "in_transit", "delivered"].includes(
        shippingStatus,
      ),
      date: getStepDate(1),
    },
    {
      icon: Truck,
      label: "Dalam Pengiriman",
      active: ["shipped", "in_transit", "delivered"].includes(shippingStatus),
      date: getStepDate(2),
    },
    {
      icon: Home,
      label: "Terkirim",
      active: ["delivered"].includes(shippingStatus),
      date: getStepDate(3),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div
              className={`w-16 h-16 ${statusConfig.bgColor} text-background rounded-full flex items-center justify-center mx-auto`}
            >
              <statusConfig.icon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">{statusConfig.title}</h1>
            <p className="text-xl text-muted-foreground">
              Order ID: #{orderData?.id}
            </p>
            {orderData?.payments[0]?.status === "pending" && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center gap-2 text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-semibold">
                    Selesaikan pembayaran sebelum {paymentDetail?.expiryTime}
                  </p>
                </div>
              </div>
            )}
            {orderData?.payments[0]?.status === "failed" ||
              (orderData?.payments[0]?.status === "cancelled" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                  <p className="text-destructive font-semibold">
                    {statusConfig.message}
                  </p>
                </div>
              ))}
          </div>

          {orderData?.payments[0]?.status === "settlement" && (
            <div className="border border-border p-8">
              <h2 className="text-2xl font-bold mb-6">Status Pesanan</h2>
              <div className="block md:relative">
                {/* Desktop: Horizontal Timeline */}
                <div className="hidden md:block">
                  {/* Connection Lines */}
                  {/* Garis Penghubung – Versi SUPER RAPI */}
                  <div className="absolute inset-x-0 top-6 flex items-center pointer-events-none">
                    <div className="flex-1 flex justify-between items-center px-[80px]">
                      {orderSteps.map((_, index) => {
                        // Jangan render garis setelah step terakhir
                        if (index === orderSteps.length - 1) return null;

                        const isActive = orderSteps[index + 1]?.active;

                        return (
                          <div
                            key={index}
                            className="flex-1 flex items-center justify-center relative"
                          >
                            <div
                              className={`absolute w-full h-0.5 transition-all duration-500 ease-in-out ${
                                isActive ? "bg-foreground" : "bg-border"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop Steps */}
                  <div className="relative flex justify-between">
                    {orderSteps.map((step, index) => {
                      const Icon = step.icon;
                      const stepDate = step.date
                        ? format(new Date(step.date), "dd MMM yyyy HH:mm")
                        : null;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1 relative z-10"
                        >
                          <div
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 transition-all ${
                              step.active
                                ? "bg-foreground border-foreground text-background scale-110"
                                : "border-border bg-background"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="text-center">
                            <p
                              className={`text-sm font-medium ${step.active ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {step.label}
                            </p>
                            {step.active && stepDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {stepDate} WIB
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile: Vertical List */}
                <div className="md:hidden space-y-6">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const stepDate = step.date
                      ? format(new Date(step.date), "dd MMM yyyy HH:mm")
                      : null;

                    return (
                      <div key={index} className="flex items-start gap-4">
                        {/* Icon + Line */}
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              step.active
                                ? "bg-foreground border-foreground text-background"
                                : "border-border bg-background"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          {/* Vertical line (kecuali item terakhir) */}
                          {index < orderSteps.length - 1 && (
                            <div
                              className={`absolute top-12 left-6 w-0.5 h-16 -translate-x-1/2 transition-all ${
                                orderSteps[index + 1]?.active
                                  ? "bg-foreground"
                                  : "bg-border"
                              }`}
                            />
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 pb-8">
                          <p
                            className={`font-medium ${step.active ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {step.label}
                          </p>
                          {step.active && stepDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {stepDate} WIB
                            </p>
                          )}
                          {step.active && !stepDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              -
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="border border-border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detail Pesanan</h2>
              <Badge
                className={
                  statusColors[orderData?.status as keyof typeof statusColors]
                }
              >
                {orderData?.status}
              </Badge>
            </div>
            <div className="space-y-4">
              {orderData?.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 pb-4 border-b border-border"
                >
                  <div className="w-24 h-24 bg-secondary border border-border flex-shrink-0">
                    <img
                      src={item.variant?.product.product_images[0]?.url ?? ""}
                      alt={item.title ?? ""}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <VariantInfo variant={item.variant} />

                    <p className="text-sm text-muted-foreground">
                      Jumlah: {item.quantity}
                    </p>
                    <p className="font-bold mt-2">
                      {formatCurrency(Number(item.total_price_cents))}{" "}
                      {item.variant?.additional_price_cents &&
                      Number(item.variant.additional_price_cents) > 0
                        ? `(+${formatCurrency(Number(item.variant.additional_price_cents))})`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-4 mt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(Number(orderData?.subtotal_cents))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span className="font-medium">
                  {formatCurrency(Number(orderData?.tax_cents))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengiriman</span>
                <span className="font-medium">
                  {formatCurrency(Number(orderData?.shipping_cents))}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(Number(orderData?.total_cents))}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Delivery Info */}
          {paymentDetail && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-border p-8">
                <h2 className="text-2xl font-bold mb-6">Alamat Pengiriman</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    {orderData?.address?.recipient_name}
                  </p>
                  <p>{orderData?.address?.address_line1}</p>
                  <p>
                    {orderData?.address?.city},{" "}
                    {orderData?.address?.postal_code}
                  </p>
                  <p>{orderData?.address?.phone}</p>
                </div>
              </div>

              <div className="border border-border p-8">
                <h2 className="text-2xl font-bold mb-6">
                  {paymentStatus === "pending"
                    ? "Informasi Pembayaran"
                    : "Informasi Pengiriman"}
                </h2>
                <div className="space-y-4">
                  {paymentStatus === "pending" || !paymentData ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Metode Pembayaran
                        </p>
                        <p className="font-medium">{paymentDetail?.method}</p>
                      </div>

                      {paymentDetail?.bank && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank</p>
                          <p className="font-medium">{paymentDetail.bank}</p>
                        </div>
                      )}

                      {paymentDetail?.accountNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            No. Virtual Account
                          </p>
                          <p className="font-medium text-lg">
                            {paymentDetail.accountNumber}
                          </p>
                        </div>
                      )}

                      {paymentDetail?.expiryTime && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Batas Waktu Pembayaran
                          </p>
                          <p className="font-medium text-yellow-600 text-lg">
                            {paymentDetail.expiryTime}
                          </p>
                        </div>
                      )}

                      <Button className="w-full mt-4" onClick={handlePayment}>
                        Bayar Sekarang
                      </Button>
                    </>
                  ) : paymentStatus === "failed" ? (
                    <>
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Metode Pembayaran
                        </p>
                        <p className="font-medium">
                          {paymentDetail?.method || "Unknown"}
                        </p>
                        <p className="text-destructive text-sm mt-2">
                          Pembayaran tidak berhasil diproses
                        </p>
                      </div>
                      <Button className="w-full mt-4" variant="destructive">
                        Coba Lagi
                      </Button>
                    </>
                  ) : (
                    // SUCCESS / SHIPPED / DELIVERED
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Tanggal Pembelian
                        </p>
                        <p className="font-medium text-foreground">
                          {paymentDetail?.paidAt}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Kurir</p>
                        <p className="font-medium text-foreground">
                          {orderData?.shipments[0]?.shipment_method?.name
                            ? orderData.shipments[0].shipment_method.name
                            : "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Tanggal Terkirim
                        </p>
                        <p className="font-medium text-foreground">
                          {orderData?.shipments?.[0]?.delivered_at
                            ? `${format(
                                new Date(orderData.shipments[0].delivered_at),
                                "dd MMMM yyyy HH:mm",
                              )} WIB`
                            : "-"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          No. Resi
                        </p>
                        <p className="font-medium font-mono text-foreground">
                          {orderData?.shipments?.[0]?.tracking_number ?? "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex max-sm:flex-col gap-4">
            <Button asChild className="flex-1 h-12">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-12">
              <Link href="/products">Belanja Lagi</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

interface VariantOptions {
  color?: string;
  size?: string;
}

interface VariantInfoProps {
  variant?: {
    option_values?: unknown;
  } | null;
}

function VariantInfo({ variant }: VariantInfoProps) {
  const opts =
    variant?.option_values &&
    typeof variant.option_values === "object" &&
    !Array.isArray(variant.option_values)
      ? (variant.option_values as VariantOptions)
      : null;

  if (!opts) return null;

  return (
    <>
      {opts.color && (
        <p className="text-sm text-muted-foreground">Warna: {opts.color}</p>
      )}
      {opts.size && (
        <p className="text-sm text-muted-foreground">Ukuran: {opts.size}</p>
      )}
    </>
  );
}

export default OrderDetails;
