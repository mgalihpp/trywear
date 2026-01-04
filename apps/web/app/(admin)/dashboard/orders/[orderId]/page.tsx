"use client";

import { ShipmentStatus, type ShipmentStatusType } from "@repo/schema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Package, Printer, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import { formatCurrency, formatDate, isNotFoundError } from "@/features/admin/utils";
import {
  SHIPPING_METHODS,
  statusColors,
} from "@/features/order/constants/shipment";
import {
  useOrder,
  useUpdateOrderStatus,
} from "@/features/order/queries/useOrderQuery";

// Label status pesanan dalam Bahasa Indonesia
const orderStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  ready: "Siap Kirim",
  processing: "Diproses",
  shipped: "Dikirim",
  in_transit: "Dalam Pengiriman",
  delivered: "Terkirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  failed: "Gagal",
  returned: "Dikembalikan",
};

// Fungsi untuk cetak label pengiriman
const handlePrintLabel = (orderData: any) => {
  if (!orderData) return;

  const shippingMethod =
    SHIPPING_METHODS.find(
      (m) => m.id === orderData.shipments?.[0]?.shipment_method_id,
    )?.name || "Standard";

  const labelContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Label Pengiriman - ${orderData.id.slice(0, 8)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 15px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; }
        .header .order-id { font-size: 12px; color: #666; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
        .recipient { font-size: 16px; font-weight: bold; }
        .address { font-size: 14px; line-height: 1.4; }
        .phone { font-size: 14px; margin-top: 5px; }
        .tracking { text-align: center; border-top: 2px dashed #000; padding-top: 15px; margin-top: 15px; }
        .tracking-number { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
        .shipping-method { font-size: 12px; color: #666; margin-top: 5px; }
        .footer { text-align: center; font-size: 10px; color: #999; margin-top: 15px; }
        @media print { body { padding: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="header">
          <h1>LABEL PENGIRIMAN</h1>
          <div class="order-id">Order #${orderData.id.slice(0, 8)}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Penerima</div>
          <div class="recipient">${orderData.address?.recipient_name || "-"}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Alamat</div>
          <div class="address">
            ${orderData.address?.address_line1 || ""}<br/>
            ${orderData.address?.address_line2 ? orderData.address.address_line2 + "<br/>" : ""}
            ${orderData.address?.city || ""}, ${orderData.address?.postal_code || ""}<br/>
            ${orderData.address?.province || ""}          </div>
          <div class="phone">Tel: ${orderData.address?.phone || "-"}</div>
        </div>
        
        <div class="tracking">
          <div class="section-title">Nomor Resi</div>
          <div class="tracking-number">${orderData.shipments?.[0]?.tracking_number || "BELUM ADA"}</div>
          <div class="shipping-method">${shippingMethod}</div>
        </div>
        
        <div class="footer">
          Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
          Cetak Label
        </button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=500,height=600");
  if (printWindow) {
    printWindow.document.write(labelContent);
    printWindow.document.close();
  }
};

function OrderDetailSkeleton() {
  return (
    <div className="p-0 md:p-8 space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 border rounded-md"
                  >
                    <Skeleton className="w-16 h-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const { orderId } = params;

  const { data: orderData, isPending, isError, error } = useOrder(
    orderId as string,
  );
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const [newMethod, setNewMethod] = useState<number | null>(
    orderData?.shipments?.[0]?.shipment_method_id ?? null,
  );
  const [trackingNumber, setTrackingNumber] = useState(
    orderData?.shipments?.[0]?.tracking_number ?? "",
  );

  const [newStatus, setNewStatus] = useState<ShipmentStatusType>("ready");

  const qc = useQueryClient();

  const handleStatusUpdate = () => {
    updateOrderStatusMutation.mutate(
      {
        orderId: orderId as string,
        input: {
          status: newStatus,
        },
      },
      {
        onSuccess: (data) => {
          qc.refetchQueries({
            queryKey: ["order", data.order.id],
          });

          qc.refetchQueries({
            queryKey: ["orders"],
          });

          toast.success("Berhasil Perbaharui Status Pesanan");
        },
        onError: (error) => {
          toast.error("Gagal Perbaharui Status Pesanan");
          console.error(error);
        },
      },
    );
  };

  const handleMethodUpdate = () => {
    updateOrderStatusMutation.mutate(
      {
        orderId: orderId as string,
        input: {
          shipment_method_id: Number(newMethod),
        },
      },
      {
        onSuccess: () => {
          qc.refetchQueries({ queryKey: ["order", orderId] });
          toast.success("Metode pengiriman diperbarui");
        },
        onError: () => {
          toast.error("Gagal memperbarui metode pengiriman");
        },
      },
    );
  };

  const handleTrackingUpdate = () => {
    updateOrderStatusMutation.mutate(
      {
        orderId: orderId as string,
        input: {
          tracking_number: trackingNumber,
        },
      },
      {
        onSuccess: () => {
          qc.refetchQueries({ queryKey: ["order", orderId] });
          toast.success("Tracking number diperbarui");
        },
        onError: () => {
          toast.error("Gagal memperbarui tracking number");
        },
      },
    );
  };

  useEffect(() => {
    if (orderData) {
      setNewStatus(orderData.status as ShipmentStatusType);
      setNewMethod(orderData.shipments[0]?.shipment_method?.id ?? 0);
      setTrackingNumber(orderData.shipments[0]?.tracking_number ?? "");
    }
  }, [orderData]);

  if (isPending) {
    return <OrderDetailSkeleton />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <NotFoundAlert
          title="Pesanan Tidak Ditemukan"
          description="Pesanan yang Anda cari tidak dapat ditemukan."
          backUrl="/dashboard/orders"
        />
      );
    }

    return (
      <div className="p-8">
        <ErrorAlert
          description="Gagal memuat detail pesanan."
          action={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!orderData) {
    return (
      <NotFoundAlert
        title="Pesanan Tidak Ditemukan"
        description="Pesanan yang Anda cari tidak dapat ditemukan."
        backUrl="/dashboard/orders"
      />
    );
  }

  return (
    <div className="p-0 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Detail Pesanan</h1>
        <p className="text-muted-foreground mt-2">
          Lihat dan kelola detail pesanan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Status Sekarang
                  </p>
                  <Badge
                    className={
                      statusColors[
                        orderData?.status as keyof typeof statusColors
                      ]
                    }
                  >
                    {orderStatusLabels[orderData?.status ?? ""] ||
                      orderData?.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Tanggal Pesanan
                  </p>
                  <p className="font-medium">
                    {formatDate(orderData?.created_at)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="block text-sm font-medium">
                  Perbarui Status
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={newStatus}
                    onValueChange={(v) => setNewStatus(v as ShipmentStatusType)}
                    disabled={orderData?.payments[0]?.status === "pending"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      {ShipmentStatus.options.map((s) => (
                        <SelectItem key={s} value={s}>
                          {orderStatusLabels[s] || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={
                      orderData?.payments[0]?.status === "pending" ||
                      updateOrderStatusMutation.isPending
                    }
                  >
                    Perbarui
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Barang Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderData?.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-3 border rounded-md"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                      {item.variant?.product?.product_images?.[0]?.url ? (
                        <img
                          src={item.variant.product.product_images[0].url}
                          alt={item.title ?? ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                      <VariantInfo variant={item.variant} />
                      <p className="text-sm text-muted-foreground">
                        Jumlah: {item.quantity}
                      </p>
                    </div>
                    {/* Price */}
                    <p className="font-medium text-right whitespace-nowrap">
                      {item.quantity} x{" "}
                      {formatCurrency(Number(item.unit_price_cents))}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(orderData?.subtotal_cents))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Informasi Pengiriman
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Shipping Address */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Alamat Pengiriman
                </p>

                <p className="font-medium text-foreground">
                  {orderData?.address?.recipient_name}
                </p>
                <p className="font-medium">
                  {orderData?.address?.address_line1}
                </p>
                {orderData?.address?.address_line2 && (
                  <p>{orderData?.address?.address_line2}</p>
                )}
                <p className="font-medium">
                  {[
                    orderData?.address?.city,
                    orderData?.address?.province,
                    orderData?.address?.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="font-medium">{orderData?.address?.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Shipping Method */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Metode Pengiriman
                  </p>

                  <Select
                    value={newMethod ? String(newMethod) : ""}
                    onValueChange={(v) => setNewMethod(Number(v))}
                    disabled={
                      orderData?.payments[0]?.status === "pending" ||
                      updateOrderStatusMutation.isPending
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Metode" />
                    </SelectTrigger>

                    <SelectContent>
                      {SHIPPING_METHODS.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleMethodUpdate}
                    disabled={
                      orderData?.payments[0]?.status === "pending" ||
                      updateOrderStatusMutation.isPending
                    }
                    className="w-full"
                  >
                    Perbarui Metode
                  </Button>
                </div>

                {/* Tracking Number */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Nomor Pelacakan
                  </p>

                  <Input
                    type="text"
                    value={trackingNumber}
                    disabled={
                      orderData?.payments[0]?.status === "pending" ||
                      updateOrderStatusMutation.isPending
                    }
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Isi nomor resi"
                  />

                  <Button
                    onClick={handleTrackingUpdate}
                    disabled={
                      orderData?.payments[0]?.status === "pending" ||
                      updateOrderStatusMutation.isPending
                    }
                    className="w-full"
                  >
                    Perbarui Tracking
                  </Button>
                </div>
              </div>

              {/* (Optional) Timestamp Info */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Dikirim Pada</p>
                  <p className="font-medium">
                    {orderData?.shipments?.[0]?.shipped_at
                      ? formatDate(orderData.shipments[0].shipped_at)
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Diterima Pada</p>
                  <p className="font-medium">
                    {orderData?.shipments?.[0]?.delivered_at
                      ? formatDate(orderData.shipments[0].delivered_at)
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{orderData?.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all">
                  {orderData?.user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telephone</p>
                <p className="font-medium">{orderData?.address?.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(orderData?.subtotal_cents))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span>{formatCurrency(Number(orderData?.tax_cents))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengiriman</span>
                <span className="font-medium">
                  {formatCurrency(Number(orderData?.shipping_cents))}
                </span>
              </div>
              {Number(orderData?.discount_cents) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Diskon</span>
                  <span>
                    - {formatCurrency(Number(orderData?.discount_cents))}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(orderData?.total_cents))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handlePrintLabel(orderData)}
                disabled={!orderData?.address}
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak Label
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled
                title="Fitur ini akan segera hadir"
              >
                <Bell className="w-4 h-4 mr-2" />
                Kirim Notifikasi
              </Button>
              <Link href="/dashboard/orders" className="block">
                <Button className="w-full bg-transparent" variant="outline">
                  Kembali ke Pesanan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
