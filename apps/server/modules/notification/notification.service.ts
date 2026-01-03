import type { Notifications, Prisma } from "@repo/db";
import type {
  ListNotificationsQuery,
  NotificationPayload,
  NotificationType,
} from "@repo/schema";
import { BaseService } from "../service";

/**
 * NotificationService untuk mengelola notifikasi user dan admin.
 * Menyediakan method untuk CRUD notifikasi dan helper untuk trigger notifikasi.
 */
export class NotificationService extends BaseService<
  Notifications,
  "notifications"
> {
  constructor() {
    super("notifications");
  }

  /**
   * Mendapatkan semua notifikasi untuk user tertentu dengan pagination.
   */
  async findAllByUser(query: ListNotificationsQuery) {
    const { user_id, is_read, type, limit, offset } = query;

    const where: Record<string, unknown> = {};

    if (user_id) {
      where.user_id = user_id;
    }

    if (is_read !== undefined) {
      where.is_read = is_read;
    }

    if (type) {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      this.db.notifications.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      }),
      this.db.notifications.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + notifications.length < total,
      },
    };
  }

  /**
   * Mendapatkan jumlah notifikasi yang belum dibaca.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.db.notifications.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  /**
   * Menandai satu notifikasi sebagai sudah dibaca.
   */
  async markAsRead(id: string): Promise<Notifications> {
    return await this.db.notifications.update({
      where: { id },
      data: { is_read: true },
    });
  }

  /**
   * Menandai semua notifikasi user sebagai sudah dibaca.
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.db.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: { is_read: true },
    });

    return { count: result.count };
  }

  /**
   * Helper method untuk membuat notifikasi dengan mudah.
   * Digunakan oleh service lain untuk trigger notifikasi.
   */
  async notify(
    userId: string,
    type: NotificationType,
    payload?: NotificationPayload,
  ): Promise<Notifications> {
    return await this.db.notifications.create({
      data: {
        user_id: userId,
        type,
        payload: (payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  /**
   * Batch notify - kirim notifikasi ke multiple users.
   * Berguna untuk admin notifications.
   */
  async notifyMany(
    userIds: string[],
    type: NotificationType,
    payload?: NotificationPayload,
  ): Promise<{ count: number }> {
    const result = await this.db.notifications.createMany({
      data: userIds.map((user_id) => ({
        user_id,
        type,
        payload: (payload ?? undefined) as Prisma.InputJsonValue | undefined,
      })),
    });

    return { count: result.count };
  }

  /**
   * Get all admin users for admin notifications.
   */
  async getAdminUserIds(): Promise<string[]> {
    const admins = await this.db.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    return admins.map((admin) => admin.id);
  }

  /**
   * Notify all admins with a notification.
   */
  async notifyAllAdmins(
    type: NotificationType,
    payload?: NotificationPayload,
  ): Promise<{ count: number }> {
    const adminIds = await this.getAdminUserIds();

    if (adminIds.length === 0) {
      return { count: 0 };
    }

    return await this.notifyMany(adminIds, type, payload);
  }

  /**
   * Hapus notifikasi berdasarkan ID.
   */
  async deleteNotification(id: string): Promise<Notifications> {
    return await this.db.notifications.delete({
      where: { id },
    });
  }

  /**
   * Hapus semua notifikasi yang sudah dibaca untuk user.
   */
  async deleteReadNotifications(userId: string): Promise<{ count: number }> {
    const result = await this.db.notifications.deleteMany({
      where: {
        user_id: userId,
        is_read: true,
      },
    });

    return { count: result.count };
  }

  // ==========================================
  // ORDER NOTIFICATION HELPERS
  // ==========================================

  /**
   * Notify user that order has been created.
   */
  async notifyOrderCreated(
    userId: string,
    orderId: string,
  ): Promise<Notifications> {
    return this.notify(userId, "ORDER_CREATED", { order_id: orderId });
  }

  /**
   * Notify user that payment has been received.
   */
  async notifyOrderPaid(
    userId: string,
    orderId: string,
  ): Promise<Notifications> {
    return this.notify(userId, "ORDER_PAID", { order_id: orderId });
  }

  /**
   * Notify user that order has been shipped.
   */
  async notifyOrderShipped(
    userId: string,
    orderId: string,
  ): Promise<Notifications> {
    return this.notify(userId, "ORDER_SHIPPED", { order_id: orderId });
  }

  /**
   * Notify user that order has been delivered.
   */
  async notifyOrderDelivered(
    userId: string,
    orderId: string,
  ): Promise<Notifications> {
    return this.notify(userId, "ORDER_DELIVERED", { order_id: orderId });
  }

  /**
   * Notify user that order has been cancelled.
   */
  async notifyOrderCancelled(
    userId: string,
    orderId: string,
  ): Promise<Notifications> {
    return this.notify(userId, "ORDER_CANCELLED", { order_id: orderId });
  }

  /**
   * Notify all admins about a new order.
   */
  async notifyAdminsNewOrder(orderId: string): Promise<{ count: number }> {
    return this.notifyAllAdmins("NEW_ORDER", { order_id: orderId });
  }
}

export const notificationService = new NotificationService();
