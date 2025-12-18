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
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Inbox,
  Package,
  RotateCcw,
  ShoppingCart,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
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
  ORDER_CREATED: {
    icon: <ShoppingCart className="h-5 w-5" />,
    title: "Pesanan Dibuat",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  ORDER_PAID: {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Pembayaran Berhasil",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  ORDER_SHIPPED: {
    icon: <Truck className="h-5 w-5" />,
    title: "Pesanan Dikirim",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  ORDER_DELIVERED: {
    icon: <Package className="h-5 w-5" />,
    title: "Pesanan Tiba",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  ORDER_CANCELLED: {
    icon: <XCircle className="h-5 w-5" />,
    title: "Pesanan Dibatalkan",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  RETURN_REQUEST: {
    icon: <RotateCcw className="h-5 w-5" />,
    title: "Permintaan Retur",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
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
  switch (type) {
    case "ORDER_CREATED":
      return `Pesanan #${orderId} berhasil dibuat dan menunggu pembayaran`;
    case "ORDER_PAID":
      return `Pembayaran untuk pesanan #${orderId} telah dikonfirmasi`;
    case "ORDER_SHIPPED":
      return `Pesanan #${orderId} sedang dalam perjalanan ke alamat Anda`;
    case "ORDER_DELIVERED":
      return `Pesanan #${orderId} telah sampai di tujuan`;
    case "ORDER_CANCELLED":
      return `Pesanan #${orderId} telah dibatalkan`;
    case "RETURN_REQUEST":
      return `Permintaan retur untuk pesanan #${orderId} sedang diproses`;
    default:
      return "Anda memiliki notifikasi baru";
  }
}

export default function NotificationsPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useNotifications(
    { user_id: userId ?? "", limit: 50 },
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

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Silakan Login</CardTitle>
            <CardDescription>
              Anda perlu login untuk melihat notifikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
          <p className="text-muted-foreground mt-1">
            Lihat update terbaru tentang pesanan Anda
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsReadMutation.mutate(userId)}
            disabled={markAllAsReadMutation.isPending}
            size="sm"
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allNotifications.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Baru</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allNotifications.length - unreadCount}
                </p>
                <p className="text-xs text-muted-foreground">Dibaca</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as "all" | "unread")}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1 gap-2">
            Semua
            <Badge variant="secondary" className="ml-1">
              {allNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1 gap-2">
            Belum Dibaca
            {unreadCount > 0 && <Badge className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                {filter === "unread" ? (
                  <BellOff className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <Bell className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filter === "unread"
                  ? "Semua Sudah Dibaca"
                  : "Belum Ada Notifikasi"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {filter === "unread"
                  ? "Tidak ada notifikasi baru. Cek kembali nanti!"
                  : "Notifikasi tentang pesanan dan aktivitas akun Anda akan muncul di sini."}
              </p>
            </div>
          </CardContent>
        </Card>
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

            return (
              <Card
                key={notification.id}
                className={cn(
                  "group transition-all duration-200 cursor-pointer",
                  !notification.is_read
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "hover:bg-muted/50",
                )}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsReadMutation.mutate(notification.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
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
                    <div className="flex-1 min-w-0">
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

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {orderId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={`/user/settings/orders`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
