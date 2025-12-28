"use client";

import {
  ShipmentStatus,
  type ShipmentStatusType,
} from "@repo/schema/shippingSchema";
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
import { useQueryClient } from "@tanstack/react-query";
import { Package, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/features/admin/utils";
import {
  SHIPPING_METHODS,
  statusColors,
} from "@/features/order/constants/shipment";
import {
  useOrder,
  useUpdateOrderStatus,
} from "@/features/order/queries/useOrderQuery";

export default function OrderDetailPage() {
  const params = useParams();
  const { orderId } = params;

  const { data: orderData, isPending } = useOrder(orderId as string);
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
                    {orderData?.status}
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
                          {s
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
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
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </p>
                      <VariantInfo variant={item.variant} />
                      <p className="text-sm text-muted-foreground">
                        Jumlah: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
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
                  {orderData?.address?.city}, {orderData?.address?.postal_code}
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
              <Button className="w-full bg-transparent" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Print Label
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Send Notification
              </Button>
              <Link href="/dashboard/orders" className="block">
                <Button className="w-full bg-transparent" variant="outline">
                  Back to Orders
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
