"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CreditCard,
  ExternalLink,
  Inbox,
  PackageX,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";

const notificationConfig: Record<
  string,
  {
    icon: React.ReactNode;
    title: string;
    color: string;
    bgColor: string;
  }
> = {
  NEW_ORDER: {
    icon: <ShoppingCart className="h-5 w-5" />,
    title: "Pesanan Baru",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  PAYMENT_RECEIVED: {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Pembayaran Diterima",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  RETURN_REQUEST: {
    icon: <RotateCcw className="h-5 w-5" />,
    title: "Permintaan Retur",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  LOW_STOCK: {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Stok Menipis",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  OUT_OF_STOCK: {
    icon: <PackageX className="h-5 w-5" />,
    title: "Stok Habis",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const defaultConfig = {
  icon: <Bell className="h-5 w-5" />,
  title: "Notifikasi",
  color: "text-gray-600",
  bgColor: "bg-gray-100",
};

function getDescription(
  type: string,
  payload: Record<string, unknown> | null,
): string {
  const orderId = (payload?.order_id as string)?.slice(0, 8) ?? "";
  const productTitle = (payload?.product_title as string) ?? "Produk";
  const remainingStock = payload?.remaining_stock as number;

  switch (type) {
    case "NEW_ORDER":
      return `Pesanan baru dengan ID #${orderId} telah masuk`;
    case "PAYMENT_RECEIVED":
      return `Pembayaran berhasil diterima untuk pesanan #${orderId}`;
    case "RETURN_REQUEST":
      return `Pelanggan mengajukan retur untuk pesanan #${orderId}`;
    case "LOW_STOCK":
      return `${productTitle} hampir habis, sisa stok: ${remainingStock ?? "?"}`;
    case "OUT_OF_STOCK":
      return `${productTitle} sudah habis, segera restok!`;
    default:
      return "Anda memiliki notifikasi baru";
  }
}

export default function AdminNotificationsPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useNotifications(
    { user_id: userId ?? "", limit: 100 },
    !!userId,
  );
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const allNotifications = data?.data ?? [];
  const unreadCount = allNotifications.filter((n) => !n.is_read).length;
  const notifications =
    filter === "unread"
      ? allNotifications.filter((n) => !n.is_read)
      : allNotifications;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua notifikasi admin Anda
          </p>
        </div>
        {unreadCount > 0 && userId && (
          <Button
            onClick={() => markAllAsReadMutation.mutate(userId)}
            disabled={markAllAsReadMutation.isPending}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifikasi
            </CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allNotifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Dibaca</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Dibaca</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {allNotifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Notifikasi</CardTitle>
              <CardDescription>
                Klik notifikasi untuk menandai sudah dibaca
              </CardDescription>
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as "all" | "unread")}
            >
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  Semua
                  <Badge variant="secondary" className="ml-1">
                    {allNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-2">
                  Belum Dibaca
                  {unreadCount > 0 && (
                    <Badge className="ml-1">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-xl">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filter === "unread"
                  ? "Tidak Ada Notifikasi Baru"
                  : "Belum Ada Notifikasi"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {filter === "unread"
                  ? "Semua notifikasi sudah dibaca. Kerja bagus!"
                  : "Notifikasi pesanan, pembayaran, dan stok akan muncul di sini."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const config =
                  notificationConfig[notification.type ?? ""] ?? defaultConfig;
                const payload = notification.payload as Record<
                  string,
                  unknown
                > | null;
                const description = getDescription(
                  notification.type ?? "",
                  payload,
                );
                const timeAgo = formatDistanceToNow(
                  new Date(notification.created_at),
                  {
                    addSuffix: true,
                    locale: id,
                  },
                );

                const orderId = payload?.order_id as string | undefined;
                const linkHref = orderId
                  ? `/dashboard/orders/${orderId}`
                  : undefined;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
                      !notification.is_read
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "hover:bg-muted/50",
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                        config.bgColor,
                        config.color,
                      )}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "font-medium",
                                !notification.is_read && "font-semibold",
                              )}
                            >
                              {config.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {linkHref && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link href={linkHref}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
