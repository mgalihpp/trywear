import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { format } from "date-fns";
import { Package, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/features/admin/utils";
import { statusColors } from "@/features/order/constants/shipment";
import { useUserOrders } from "@/features/order/queries/useOrderQuery";
import { authClient } from "@/lib/auth-client";
import ReviewDialog from "./review-dialog";

export const OrdersSection = () => {
  const { data: sessionData } = authClient.useSession();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const {
    data: orderData,
    isPending,
    isError,
  } = useUserOrders(sessionData?.user.id as string);

  // const orders = [
  //   {
  //     id: "ORD123",
  //     date: "15 Jan 2025",
  //     status: "delivered",
  //     statusLabel: "Terkirim",
  //     total: 12999000,
  //     items: [{ name: "Premium Smartphone Pro Max", quantity: 1 }],
  //     canReview: true,
  //   },
  //   {
  //     id: "ORD124",
  //     date: "10 Jan 2025",
  //     status: "shipping",
  //     statusLabel: "Dalam Pengiriman",
  //     total: 3499000,
  //     items: [{ name: "Smart Watch Ultra", quantity: 1 }],
  //     canReview: false,
  //   },
  //   {
  //     id: "ORD125",
  //     date: "5 Jan 2025",
  //     status: "processing",
  //     statusLabel: "Diproses",
  //     total: 1299000,
  //     items: [{ name: "Wireless Earbuds Pro", quantity: 2 }],
  //     canReview: false,
  //   },
  // ];

  const filteredOrders = orderData?.filter(
    (order) => orderFilter === "all" || order.status === orderFilter,
  );

  const handleReview = (productName: string) => {
    setReviewProduct(productName);
    setReviewDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Pesanan Saya</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={orderFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("all")}
          >
            Semua
          </Button>
          <Button
            variant={orderFilter === "processing" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("processing")}
          >
            Diproses
          </Button>
          <Button
            variant={orderFilter === "shipping" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("shipping")}
          >
            Dikirim
          </Button>
          <Button
            variant={orderFilter === "delivered" ? "default" : "outline"}
            size="sm"
            onClick={() => setOrderFilter("delivered")}
          >
            Selesai
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders?.map((order) => (
          <div
            key={order.id}
            className="border border-border rounded-lg p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Order #{order.id}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {format(order.created_at ?? new Date(), "dd MMMM yyyy")}
                </p>
                <p className="text-sm">
                  Status:{" "}
                  <Badge
                    className={
                      statusColors[order.status as keyof typeof statusColors]
                    }
                  >
                    {order.status}
                  </Badge>
                </p>
              </div>
              <div className="flex flex-col justify-between items-start sm:items-end gap-2">
                <p className="font-bold text-lg">
                  {formatCurrency(Number(order.total_cents))}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    x {item.quantity}
                  </span>{" "}
                  <VariantInfo variant={item.variant} />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 sm:flex-none"
              >
                <Link href={`/order?order_id=${order.id}`}>Lihat Detail</Link>
              </Button>
              {order && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() =>
                    handleReview(order.order_items[0]?.title ?? "")
                  }
                >
                  <Star className="h-4 w-4 mr-2" />
                  Beri Ulasan
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders?.length === 0 && (
        <div className="text-center py-16 border border-border rounded-lg">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Tidak ada pesanan ditemukan</p>
        </div>
      )}

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        productName={reviewProduct}
      />
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
        <span className="text-muted-foreground">Warna: {opts.color}</span>
      )}{" "}
      {opts.size && (
        <span className="text-muted-foreground">Ukuran: {opts.size}</span>
      )}
    </>
  );
}
