/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
"use client";

import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cancelOrder, updatePaymentStatus } from "@/actions/payment";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import {
  AddressCard,
  OrderItemsCard,
  OrderSkeleton,
  OrderTimeline,
  PaymentOrShippingCard,
  StatusHeader,
} from "@/features/order/components";
import { useOrderWithPayment } from "@/features/order/queries/useOrderQuery";
import type { OrderItem } from "@/features/order/types";
import {
  buildOrderSteps,
  extractStatusCode,
  getStatusConfig,
} from "@/features/order/utils";
import { mapGatewayResponseToPaymentDetail } from "@/features/order/utils/mapGateway";
import { useServerAction } from "@/hooks/useServerAction";
import type { PaymentDetail, Snap } from "@/types/midtrans";

declare global {
  interface Window {
    snap?: Snap;
  }
}

const scriptId = "midtrans-snap-script";

// Helper to show notification only once per session
const getNotificationKey = (orderId: string, type: string) =>
  `order_notification_${orderId}_${type}`;

const hasShownNotification = (orderId: string, type: string): boolean => {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(getNotificationKey(orderId, type)) === "true";
};

const markNotificationAsShown = (orderId: string, type: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(getNotificationKey(orderId, type), "true");
};

const OrderDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const transaction_status =
    searchParams.get("transaction_status") || "settlement";
  const [runUpdatePaymentStatusAction] = useServerAction(updatePaymentStatus);
  const [runCancelOrderAction] = useServerAction(cancelOrder);

  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(
    null,
  );
  const [hasAutoCancelled, setHasAutoCancelled] = useState(false);

  const {
    orderData,
    paymentData,
    isLoading,
    isError,
    isOrderError,
    orderError,
    isPaymentError,
    paymentError,
  } = useOrderWithPayment(order_id as string);

  const payment = orderData?.payments?.[0];
  const shipment = orderData?.shipments?.[0];
  const shippingStatus = shipment?.status ?? "";

  const statusConfig = getStatusConfig(payment?.status);
  const orderSteps = buildOrderSteps(
    shippingStatus,
    payment?.paid_at,
    shipment?.shipped_at,
    shipment?.delivered_at,
  );
  const isPendingPayment = payment?.status === "pending";
  const isFailedPayment = payment?.status === "failed";
  const isCancelledPayment =
    payment?.status === "cancelled" || payment?.status === "cancel";
  const isSettlement = payment?.status === "settlement";
  const paymentStatusCode = extractStatusCode(paymentError);
  const isPaymentNotFound = isPaymentError && paymentStatusCode === 404;
  const isPaymentServerError =
    isPaymentError &&
    typeof paymentStatusCode === "number" &&
    paymentStatusCode >= 500;
  const isOrderStatusCancelled =
    orderData?.status === "cancel" || orderData?.status === "cancelled";

  // Auto cancel on gateway cancel
  useEffect(() => {
    if (
      paymentData?.transaction_status === "cancel" &&
      !hasAutoCancelled &&
      !isCancelledPayment &&
      !isOrderStatusCancelled
    ) {
      runUpdatePaymentStatusAction({
        order_id: order_id as string,
        status: "cancel",
      });

      runCancelOrderAction(order_id as string);
      setHasAutoCancelled(true);
    }
  }, [
    order_id,
    paymentData?.transaction_status,
    hasAutoCancelled,
    isCancelledPayment,
    isOrderStatusCancelled,
    runUpdatePaymentStatusAction,
    runCancelOrderAction,
  ]);

  // Auto update on settlement
  useEffect(() => {
    if (paymentData?.transaction_status === "settlement") {
      runUpdatePaymentStatusAction({
        order_id: order_id as string,
        status: "settlement",
      });
    }
  }, [order_id, paymentData?.transaction_status]);

  // Map payment detail
  useEffect(() => {
    if (
      paymentData &&
      (transaction_status === "pending" || transaction_status === "settlement")
    ) {
      setPaymentDetail(mapGatewayResponseToPaymentDetail(paymentData));
    }
  }, [transaction_status, paymentData]);

  // Load Midtrans Snap script
  useEffect(() => {
    if (typeof window === "undefined" || window.snap) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      process.env.NODE_ENV === "production"
        ? "https://app.sandbox.midtrans.com/snap/snap.js"
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
    if (!orderData?.payments?.[0]?.provider_payment_id) {
      toast.error("Tidak bisa melakukan pembayaran");
      return;
    }

    if (!window.snap) {
      alert(
        "Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman.",
      );
      return;
    }

    window.snap?.pay(orderData?.payments?.[0]?.provider_payment_id, {
      language: "id",
      onSuccess: async (result) => {
        console.log(result);
        await runUpdatePaymentStatusAction({
          order_id: result.order_id,
          status: "settlement",
        });
        router.push(`${result.finish_redirect_url}`);
      },
      onPending: async (result) => {
        console.log(result);
        router.push(`${result.finish_redirect_url}`);
      },
      onError: async (result) => {
        console.log(result);
        await runCancelOrderAction(order_id as string);
        router.push(`${result.finish_redirect_url}`);
      },
      onClose: () => {
        router.push(`/order?order_id=${order_id}`);
      },
    });
  };

  // Auto cancel on payment not found
  useEffect(() => {
    if (!isPaymentNotFound || !order_id || hasAutoCancelled) return;
    // Check and mark notification BEFORE async to prevent race condition in Strict Mode
    const shouldShowNotification = !hasShownNotification(
      order_id,
      "payment_not_found",
    );
    if (shouldShowNotification) {
      markNotificationAsShown(order_id, "payment_not_found");
    }

    (async () => {
      try {
        await runUpdatePaymentStatusAction({
          order_id,
          status: "cancel",
        });
        await runCancelOrderAction(order_id);
        if (shouldShowNotification) {
          toast.error(
            "Pembayaran tidak ditemukan, pesanan dibatalkan otomatis.",
          );
        }
      } catch (error) {
        console.error("Failed to auto cancel order", error);
      } finally {
        setHasAutoCancelled(true);
      }
    })();
  }, [
    isPaymentNotFound,
    order_id,
    hasAutoCancelled,
    runUpdatePaymentStatusAction,
    runCancelOrderAction,
  ]);

  // Auto cancel on server error
  useEffect(() => {
    if (
      !isPaymentServerError ||
      !order_id ||
      hasAutoCancelled ||
      isCancelledPayment ||
      isOrderStatusCancelled ||
      !isOrderError
    )
      return;

    // Check and mark notification BEFORE async to prevent race condition in Strict Mode
    const shouldShowNotification = !hasShownNotification(
      order_id,
      "server_error",
    );
    if (shouldShowNotification) {
      markNotificationAsShown(order_id, "server_error");
    }

    (async () => {
      try {
        await runUpdatePaymentStatusAction({
          order_id,
          status: "cancel",
        });
        await runCancelOrderAction(order_id);
        if (shouldShowNotification) {
          toast.error(
            "Terjadi kendala pada pembayaran. Pesanan dibatalkan otomatis.",
          );
        }
      } catch (error) {
        console.error("Failed to auto cancel order after server error", error);
      } finally {
        setHasAutoCancelled(true);
      }
    })();
  }, [
    isPaymentServerError,
    order_id,
    hasAutoCancelled,
    isCancelledPayment,
    isOrderStatusCancelled,
    runUpdatePaymentStatusAction,
    runCancelOrderAction,
  ]);

  if (isLoading) {
    return <OrderSkeleton />;
  }

  if (isOrderError) {
    // Check if it's a 404 Not Found error
    const axiosError = orderError as any;
    const is404 =
      axiosError?.response?.status === 404 ||
      axiosError?.response?.data?.errorCode === "RESOURCE_NOT_FOUND";

    if (is404) {
      return (
        <NotFoundAlert
          title="Pesanan Tidak Ditemukan"
          description="Pesanan yang Anda cari tidak dapat ditemukan. Mungkin sudah dihapus atau ID pesanan tidak valid."
          backUrl="/user/settings/orders"
        />
      );
    }

    return (
      <ErrorAlert
        title="Terjadi Kesalahan"
        description="Gagal memuat detail pesanan. Silakan coba lagi."
        action={() => window.location.reload()}
      />
    );
  }

  if (isPaymentError && !isPaymentNotFound && !isPaymentServerError) {
    return (
      <ErrorAlert
        title="Status Pembayaran Bermasalah"
        description={"Gagal memuat status pembayaran. Silakan coba lagi."}
        action={() => window.location.reload()}
      />
    );
  }

  if (isError && !isPaymentNotFound) {
    return (
      <ErrorAlert
        title="Terjadi Kesalahan"
        description="Gagal memuat detail pesanan. Silakan coba lagi."
        action={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <StatusHeader
            orderId={orderData?.id}
            config={statusConfig}
            isPending={isPendingPayment}
            isFailedOrCancelled={isFailedPayment || isCancelledPayment}
            expiryTime={paymentDetail?.expiryTime}
            message={statusConfig.message}
          />

          {isSettlement && <OrderTimeline steps={orderSteps} />}

          <OrderItemsCard
            items={orderData?.order_items as unknown as OrderItem[]}
            orderStatus={orderData?.status}
            totals={{
              subtotal: Number(orderData?.subtotal_cents),
              tax: Number(orderData?.tax_cents),
              shipping: Number(orderData?.shipping_cents),
              discount: Number(orderData?.discount_cents),
              total: Number(orderData?.total_cents),
            }}
          />

          {paymentDetail && (
            <div className="grid md:grid-cols-2 gap-8">
              <AddressCard
                name={orderData?.address?.recipient_name}
                addressLine={orderData?.address?.address_line1}
                city={orderData?.address?.city}
                province={orderData?.address?.province}
                postalCode={orderData?.address?.postal_code}
                phone={orderData?.address?.phone}
              />

              <PaymentOrShippingCard
                transactionStatus={transaction_status}
                paymentStatus={payment?.status}
                paymentDetail={paymentDetail}
                paymentMethod={paymentDetail?.method}
                shipmentMethod={
                  orderData?.shipments?.[0]?.shipment_method?.name
                }
                deliveredAt={orderData?.shipments?.[0]?.delivered_at}
                trackingNumber={orderData?.shipments?.[0]?.tracking_number}
                onPay={handlePayment}
              />
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

export default OrderDetails;
