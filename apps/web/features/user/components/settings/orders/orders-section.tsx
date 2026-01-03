import type { Product, Returns } from "@repo/db";
import type { ReturnStatusType } from "@repo/schema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  ImageIcon,
  Package,
  RefreshCw,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { formatCurrency } from "@/features/admin/utils";
import { statusColors } from "@/features/order/constants/shipment";
import { useUserOrders } from "@/features/order/queries/useOrderQuery";
import { authClient } from "@/lib/auth-client";
import type { OrderWithFullRelations } from "@/types/index";
import ReturnRequestDialog from "./return-request-dialog";
import ReviewDialog from "./review-dialog";

// Status labels berdasarkan order.status DAN payment.status
const orderStatusLabels: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  in_transit: "Dalam Pengiriman",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  cancel: "Dibatalkan",
  returned: "Dikembalikan",
};

// Status labels untuk payment
const paymentStatusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  settlement: "Lunas",
  capture: "Lunas",
  failed: "Pembayaran Gagal",
  cancelled: "Dibatalkan",
  cancel: "Dibatalkan",
  expired: "Kadaluarsa",
  expire: "Kadaluarsa",
};

// Status labels untuk pengembalian
const returnStatusLabels: Record<ReturnStatusType, string> = {
  requested: "Menunggu Persetujuan",
  approved: "Disetujui",
  rejected: "Ditolak",
  processing: "Diproses",
  completed: "Selesai",
};

// Colors untuk return status
const returnStatusColors: Record<
  ReturnStatusType,
  { bg: string; text: string; icon: React.ElementType }
> = {
  requested: { bg: "bg-yellow-500/20", text: "text-yellow-600", icon: Clock },
  approved: { bg: "bg-blue-500/20", text: "text-blue-600", icon: CheckCircle },
  rejected: { bg: "bg-red-500/20", text: "text-red-600", icon: XCircle },
  processing: {
    bg: "bg-indigo-500/20",
    text: "text-indigo-600",
    icon: RefreshCw,
  },
  completed: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-600",
    icon: CheckCircle,
  },
};

// Helper: Get active return from order
const getActiveReturn = (
  order: OrderWithFullRelations,
): Returns | undefined => {
  return (
    order.returns?.find(
      (r) => r.status !== "rejected" && r.status !== "completed",
    ) ?? order.returns?.[0]
  ); // fallback to most recent
};

// Helper: Tentukan status display berdasarkan order dan payment
const getDisplayStatus = (
  orderStatus: string,
  paymentStatus?: string | null,
): { label: string; color: string } => {
  // Jika payment pending, tampilkan menunggu pembayaran
  if (paymentStatus === "pending") {
    return {
      label: paymentStatusLabels?.pending || "Menunggu Konfirmasi",
      color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    };
  }

  // Jika payment failed/cancelled/expired
  if (
    paymentStatus === "failed" ||
    paymentStatus === "cancelled" ||
    paymentStatus === "cancel" ||
    paymentStatus === "expired" ||
    paymentStatus === "expire"
  ) {
    return {
      label: paymentStatusLabels[paymentStatus] || "Dibatalkan",
      color: "bg-destructive/20 text-destructive border-destructive/30",
    };
  }

  // Jika order cancelled
  if (orderStatus === "cancelled" || orderStatus === "cancel") {
    return {
      label: "Dibatalkan",
      color: "bg-destructive/20 text-destructive border-destructive/30",
    };
  }

  // Order status biasa (payment sudah settlement)
  return {
    label: orderStatusLabels[orderStatus] || orderStatus.replace(/_/g, " "),
    color:
      statusColors[orderStatus as keyof typeof statusColors] ||
      "bg-secondary text-secondary-foreground",
  };
};

export const OrdersSection = () => {
  const { data: sessionData } = authClient.useSession();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product>();
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<OrderWithFullRelations>();
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const userId = sessionData?.user.id;
  const {
    data: orderData,
    isPending,
    isError,
    refetch,
  } = useUserOrders(sessionData?.user.id as string);

  // Helper untuk filter berdasarkan status
  const matchesFilter = (
    orderStatus: string,
    paymentStatus?: string | null,
    filter?: string,
  ) => {
    // Check if order/payment is cancelled
    const isCancelled =
      ["cancel", "cancelled"].includes(orderStatus) ||
      ["cancel", "cancelled", "failed", "expired", "expire"].includes(
        paymentStatus ?? "",
      );

    if (filter === "all") {
      // Semua KECUALI yang dibatalkan
      return !isCancelled;
    }

    if (filter === "pending") {
      // Menunggu pembayaran
      return paymentStatus === "pending";
    }

    if (filter === "processing") {
      // Diproses - payment sudah lunas, order belum dikirim
      return (
        (paymentStatus === "settlement" || paymentStatus === "capture") &&
        ["pending", "processing", "ready"].includes(orderStatus)
      );
    }

    if (filter === "shipped") {
      // Dikirim
      return ["shipped", "in_transit"].includes(orderStatus);
    }

    if (filter === "delivered") {
      // Selesai
      return ["delivered", "completed"].includes(orderStatus);
    }

    if (filter === "cancel") {
      // Dibatalkan
      return isCancelled;
    }

    return true;
  };

  const filteredOrders = orderData
    ?.filter((order) => {
      const paymentStatus = order.payments?.[0]?.status;
      return matchesFilter(order.status, paymentStatus, orderFilter);
    })
    ?.sort((a, b) => {
      const aIsCompleted = ["delivered", "completed"].includes(a.status);
      const bIsCompleted = ["delivered", "completed"].includes(b.status);

      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const handleReview = (product: Product) => {
    setReviewProduct(product);
    setReviewDialogOpen(true);
  };

  const handleReturn = (order: OrderWithFullRelations) => {
    setReturnOrder(order);
    setReturnDialogOpen(true);
  };

  // Check if order can be returned (within 7 days of delivery)
  const canRequestReturn = (order: OrderWithFullRelations) => {
    if (order.status !== "delivered" && order.status !== "completed") {
      return false;
    }
    // Check if already has pending return
    const hasActiveReturn = order.returns?.some(
      (r) => r.status !== "rejected" && r.status !== "completed",
    );
    if (hasActiveReturn) return false;

    // Check 7-day window
    const deliveredAt = order.shipments?.[0]?.delivered_at;
    if (deliveredAt) {
      const deliveredDate = new Date(deliveredAt);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysDiff <= 7;
    }
    return true; // Allow if no delivered_at date
  };

  return (
    <div>
      {/* Header & Filters - improved mobile */}
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Pesanan Saya</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <Button
            variant={orderFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("all")}
            className="shrink-0"
          >
            Semua
          </Button>
          <Button
            variant={orderFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("pending")}
            className="shrink-0"
          >
            Belum Bayar
          </Button>
          <Button
            variant={orderFilter === "processing" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("processing")}
            className="shrink-0"
          >
            Diproses
          </Button>
          <Button
            variant={orderFilter === "shipped" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("shipped")}
            className="shrink-0"
          >
            Dikirim
          </Button>
          <Button
            variant={orderFilter === "delivered" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("delivered")}
            className="shrink-0"
          >
            Selesai
          </Button>
          <Button
            variant={orderFilter === "cancel" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("cancel")}
            className="shrink-0"
          >
            Batal
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isPending ? (
          <OrdersSkeleton />
        ) : isError ? (
          <ErrorAlert
            description="Gagal memuat pesanan. Coba ulangi."
            action={() => refetch()}
          />
        ) : (
          filteredOrders?.map((order) => {
            const isDelivered =
              order.status === "delivered" || order.status === "completed";
            const primaryProduct = order.order_items[0]?.variant?.product;
            const userReview = primaryProduct?.reviews?.find(
              (review) => review.user_id === userId,
            );
            const hasReview = !!userReview;
            const paymentStatus = order.payments?.[0]?.status;
            const { label: statusLabel, color: badgeColor } = getDisplayStatus(
              order.status,
              paymentStatus,
            );
            const reviewLink =
              hasReview && primaryProduct?.slug
                ? `/product/${primaryProduct.slug}#reviews`
                : undefined;

            return (
              <div
                key={order.id}
                className="border border-border rounded-lg overflow-hidden shadow-sm bg-card/50"
              >
                {/* Header - Mobile optimized */}
                <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        Pesanan #{order.id.slice(0, 8)}...
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {format(
                          new Date(order.created_at),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={`${badgeColor} text-xs`}>
                        {statusLabel}
                      </Badge>
                      <p className="font-bold text-sm sm:text-base">
                        {formatCurrency(Number(order.total_cents))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-5">
                  <div className="space-y-3">
                    {order.order_items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {/* Image */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                          {item.variant?.product.product_images[0]?.url ? (
                            <img
                              src={item.variant.product.product_images[0].url}
                              alt={item.title ?? ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {item.title}
                          </p>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <VariantInfo variant={item.variant} />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              x{item.quantity}
                            </span>
                            <span className="font-medium text-sm">
                              {formatCurrency(Number(item.total_price_cents))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.order_items.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        +{order.order_items.length - 2} produk lainnya
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 sm:p-5 pt-0 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 h-9 min-w-[120px]"
                  >
                    <Link href={`/order?order_id=${order.id}`}>
                      Lihat Detail
                    </Link>
                  </Button>
                  {isDelivered &&
                    (() => {
                      const activeReturn = getActiveReturn(order);
                      if (activeReturn) {
                        const status = activeReturn.status as ReturnStatusType;
                        const statusConfig = returnStatusColors[status];
                        const StatusIcon = statusConfig?.icon || Clock;
                        return (
                          <div
                            className={`flex-1 min-w-[120px] h-9 flex items-center justify-center gap-1.5 rounded-md border ${statusConfig?.bg} ${statusConfig?.text} border-current/20 text-sm`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            <span>{returnStatusLabels[status] || status}</span>
                          </div>
                        );
                      }
                      if (canRequestReturn(order)) {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 min-w-[120px]"
                            onClick={() => handleReturn(order)}
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                            Ajukan Pengembalian
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  {isDelivered &&
                    (userReview && reviewLink ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 min-w-[120px]"
                        asChild
                      >
                        <Link href={reviewLink}>
                          <Star className="h-3.5 w-3.5 mr-1.5" />
                          Lihat Ulasan
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-9 min-w-[120px]"
                        disabled={!primaryProduct || hasReview}
                        onClick={() =>
                          !hasReview &&
                          primaryProduct &&
                          handleReview(primaryProduct)
                        }
                      >
                        <Star className="h-3.5 w-3.5 mr-1.5" />
                        Beri Ulasan
                      </Button>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isPending && !isError && filteredOrders?.length === 0 && (
        <div className="text-center py-12 border border-border rounded-lg bg-card/50">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Tidak ada pesanan ditemukan
          </p>
        </div>
      )}

      {reviewProduct && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          product={reviewProduct}
        />
      )}

      {returnOrder && (
        <ReturnRequestDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          order={returnOrder}
        />
      )}
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
    <span>
      {opts.color && `Warna: ${opts.color}`}
      {opts.color && opts.size && " • "}
      {opts.size && `Ukuran: ${opts.size}`}
    </span>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="border border-border rounded-lg overflow-hidden bg-card/50"
        >
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2].map((line) => (
              <div key={line} className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 pt-0 flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
