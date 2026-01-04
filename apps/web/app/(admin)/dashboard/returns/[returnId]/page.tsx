"use client";

import type { ReturnStatusType } from "@repo/schema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Check, ImageIcon, Package, User, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorAlert } from "@/features/admin/components/error-alert";
import { NotFoundAlert } from "@/features/admin/components/not-found-alert";
import { isNotFoundError } from "@/features/admin/utils";
import {
  useReturn,
  useUpdateReturnStatus,
} from "@/features/order/queries/useReturnQuery";

// Status config
const returnStatusLabels: Record<string, string> = {
  requested: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  processing: "Diproses",
  completed: "Selesai",
};

const returnStatusColors: Record<string, string> = {
  requested: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  rejected: "bg-red-500/20 text-red-600 border-red-500/30",
  processing: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  completed: "bg-green-500/20 text-green-600 border-green-500/30",
};

const allStatuses: ReturnStatusType[] = [
  "requested",
  "approved",
  "rejected",
  "processing",
  "completed",
];

export default function ReturnDetailPage() {
  const params = useParams();
  const returnId = params.returnId as string;
  const qc = useQueryClient();

  const { data: returnData, isPending, isError, error, refetch } = useReturn(returnId);
  const updateStatusMutation = useUpdateReturnStatus();

  const [newStatus, setNewStatus] = useState<ReturnStatusType | "">(
    (returnData?.status as ReturnStatusType) || "",
  );

  const handleStatusUpdate = () => {
    if (!newStatus) return;

    updateStatusMutation.mutate(
      {
        returnId,
        input: { status: newStatus as ReturnStatusType },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["return", returnId] });
          qc.invalidateQueries({ queryKey: ["returns"] });
          toast.success("Status pengembalian berhasil diperbarui");
        },
        onError: () => {
          toast.error("Gagal memperbarui status");
        },
      },
    );
  };

  const handleQuickAction = (status: ReturnStatusType) => {
    updateStatusMutation.mutate(
      {
        returnId,
        input: { status },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["return", returnId] });
          qc.invalidateQueries({ queryKey: ["returns"] });
          toast.success(
            status === "approved"
              ? "Pengembalian disetujui"
              : "Pengembalian ditolak",
          );
        },
        onError: () => {
          toast.error("Gagal memperbarui status");
        },
      },
    );
  };

  if (isPending) {
    return <PageSkeleton />;
  }

  if (isError) {
    if (isNotFoundError(error)) {
      return (
        <NotFoundAlert
          title="Pengembalian Tidak Ditemukan"
          description="Data pengembalian yang Anda cari tidak dapat ditemukan."
          backUrl="/dashboard/returns"
        />
      );
    }

    return (
      <div className="p-8">
        <ErrorAlert
          description="Gagal memuat detail pengembalian."
          action={() => refetch()}
        />
      </div>
    );
  }

  if (!returnData) {
    return (
      <NotFoundAlert
        title="Pengembalian Tidak Ditemukan"
        description="Data pengembalian yang Anda cari tidak dapat ditemukan."
        backUrl="/dashboard/returns"
      />
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Detail Pengembalian
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {returnData.id}
          </p>
        </div>
        <Badge className={returnStatusColors[returnData.status]}>
          {returnStatusLabels[returnData.status] || returnData.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Informasi Pengembalian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tanggal Pengajuan
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(returnData.created_at),
                      "dd MMMM yyyy, HH:mm",
                      {
                        locale: id,
                      },
                    )}{" "}
                    WIB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pesanan Terkait
                  </p>
                  <Link
                    href={`/dashboard/orders/${returnData.order_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    #{returnData.order_id}
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Alasan Pengembalian
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{returnData.reason || "-"}</p>
                </div>
              </div>

              {/* Proof Photos */}
              {returnData.images &&
                Array.isArray(returnData.images) &&
                returnData.images.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Foto Bukti
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        returnData.images as Array<{ url: string; key: string }>
                      ).map((img, idx) => (
                        <a
                          key={img.key}
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-20 h-20 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={img.url}
                            alt={`Bukti ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Return Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item yang Dikembalikan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {returnData.return_items?.map((item) => {
                  const orderItem = item.order_item;
                  const imageUrl = returnData.order?.order_items?.find(
                    (oi) => oi.id === item.order_item_id,
                  )?.variant?.product?.product_images?.[0]?.url;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      {/* Image */}
                      <div className="w-14 h-14 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={orderItem?.title ?? ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">
                          {orderItem?.title || `Item #${item.order_item_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Jumlah dikembalikan: {item.quantity} pcs
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{returnData.user?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all">
                  {returnData.user?.email || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {returnData.status === "requested" && (
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleQuickAction("approved")}
                  disabled={updateStatusMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Setujui Pengembalian
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleQuickAction("rejected")}
                  disabled={updateStatusMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Tolak Pengembalian
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Perbarui Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={newStatus || returnData.status}
                onValueChange={(v) => setNewStatus(v as ReturnStatusType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {allStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {returnStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                onClick={handleStatusUpdate}
                disabled={
                  updateStatusMutation.isPending ||
                  !newStatus ||
                  newStatus === returnData.status
                }
              >
                Perbarui Status
              </Button>
            </CardContent>
          </Card>

          {/* Back Button */}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/returns">Kembali ke Daftar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-40" />
          <Skeleton className="h-10" />
        </div>
      </div>
    </div>
  );
}
