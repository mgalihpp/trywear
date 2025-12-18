"use client";

import type { Notifications } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CreditCard,
  Package,
  PackageX,
  RotateCcw,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  useDeleteNotification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";

/**
 * Icon mapping untuk setiap tipe notifikasi
 */
const notificationIcons: Record<string, React.ReactNode> = {
  ORDER_CREATED: <ShoppingCart className="h-4 w-4 text-blue-500" />,
  ORDER_PAID: <CreditCard className="h-4 w-4 text-green-500" />,
  ORDER_SHIPPED: <Truck className="h-4 w-4 text-orange-500" />,
  ORDER_DELIVERED: <Package className="h-4 w-4 text-green-600" />,
  ORDER_CANCELLED: <X className="h-4 w-4 text-red-500" />,
  NEW_ORDER: <ShoppingCart className="h-4 w-4 text-blue-500" />,
  PAYMENT_RECEIVED: <CreditCard className="h-4 w-4 text-green-500" />,
  RETURN_REQUEST: <RotateCcw className="h-4 w-4 text-yellow-500" />,
  LOW_STOCK: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  OUT_OF_STOCK: <PackageX className="h-4 w-4 text-red-500" />,
};

/**
 * Title mapping untuk setiap tipe notifikasi
 */
const notificationTitles: Record<string, string> = {
  ORDER_CREATED: "Pesanan Dibuat",
  ORDER_PAID: "Pembayaran Berhasil",
  ORDER_SHIPPED: "Pesanan Dikirim",
  ORDER_DELIVERED: "Pesanan Tiba",
  ORDER_CANCELLED: "Pesanan Dibatalkan",
  NEW_ORDER: "Pesanan Baru",
  PAYMENT_RECEIVED: "Pembayaran Diterima",
  RETURN_REQUEST: "Permintaan Retur",
  LOW_STOCK: "Stok Menipis",
  OUT_OF_STOCK: "Stok Habis",
};

/**
 * Get description based on notification type and payload
 */
function getNotificationDescription(notification: Notifications): string {
  const payload = notification.payload as Record<string, unknown> | null;

  switch (notification.type) {
    case "ORDER_CREATED":
      return `Pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""} menunggu pembayaran`;
    case "ORDER_PAID":
      return `Pembayaran untuk pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""} berhasil`;
    case "ORDER_SHIPPED":
      return `Pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""} sedang dalam pengiriman`;
    case "ORDER_DELIVERED":
      return `Pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""} telah sampai`;
    case "ORDER_CANCELLED":
      return `Pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""} dibatalkan`;
    case "NEW_ORDER":
      return `Ada pesanan baru #${(payload?.order_id as string)?.slice(0, 8) ?? ""}`;
    case "PAYMENT_RECEIVED":
      return `Pembayaran diterima untuk pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""}`;
    case "RETURN_REQUEST":
      return `Permintaan retur untuk pesanan #${(payload?.order_id as string)?.slice(0, 8) ?? ""}`;
    case "LOW_STOCK":
      return `Stok ${payload?.product_title ?? "produk"} menipis`;
    case "OUT_OF_STOCK":
      return `Stok ${payload?.product_title ?? "produk"} habis`;
    default:
      return "Notifikasi baru";
  }
}

/**
 * Single notification item component
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notifications;
  onMarkAsRead: () => void;
  onDelete: () => void;
}) {
  const icon = notificationIcons[notification.type ?? ""] ?? (
    <Bell className="h-4 w-4" />
  );
  const title = notificationTitles[notification.type ?? ""] ?? "Notifikasi";
  const description = getNotificationDescription(notification);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: id,
  });

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0",
        !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20",
      )}
      onClick={onMarkAsRead}
      onKeyDown={(e) => e.key === "Enter" && onMarkAsRead()}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            !notification.is_read && "font-semibold",
          )}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1">
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/**
 * NotificationBell - Komponen bell icon dengan badge dan dropdown notifikasi
 */
export function NotificationBell() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount(userId);
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useNotifications(
    {
      user_id: userId ?? "",
      limit: 10,
    },
    open, // Only fetch when popover is open
  );

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notificationsData?.data ?? [];

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (userId) {
      markAllAsReadMutation.mutate(userId);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (!userId) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifikasi</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Gagal memuat notifikasi
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Belum ada notifikasi
              </p>
            </div>
          ) : (
            <div className="group">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              asChild
              onClick={() => setOpen(false)}
            >
              <a
                href={
                  typeof window !== "undefined" &&
                  window.location.pathname.startsWith("/dashboard")
                    ? "/dashboard/notifications"
                    : "/user/settings/notifications"
                }
              >
                Lihat semua notifikasi
              </a>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
