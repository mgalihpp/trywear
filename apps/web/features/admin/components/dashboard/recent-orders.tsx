"use client";

import type { ShipmentStatusType } from "@repo/schema";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { useRecentOrders } from "@/features/admin/queries/useDashboardQuery";
import { formatCurrency } from "@/features/admin/utils";
import { statusColors } from "@/features/order/constants/shipment";


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

export function RecentOrders() {
  const { data: orders, isLoading, isError } = useRecentOrders(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Gagal memuat data pesanan
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pesanan Terbaru</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders">Lihat Semua</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!orders || orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Belum ada pesanan
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = order.status as ShipmentStatusType;

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.date), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatCurrency(order.amount)}
                    </p>
                    <Badge className={statusColors[status]}>{orderStatusLabels[status]}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
