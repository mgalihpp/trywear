import type { Notifications } from "@repo/db";
import { listNotificationsQuerySchema, markAsReadSchema } from "@repo/schema";
import type { Request, Response } from "express";
import { asyncHandler } from "@/middleware/asyncHandler";
import { AppError } from "@/utils/appError";
import { AppResponse } from "@/utils/appResponse";
import { notificationService } from "./notification.service";

/**
 * NotificationController untuk handle HTTP requests terkait notifikasi.
 */
export class NotificationController {
  /**
   * GET /notifications
   * List notifications dengan pagination dan filter.
   */
  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = listNotificationsQuerySchema.parse(req.query);

    // Jika ada user dari auth, gunakan user_id dari auth
    // Untuk admin, bisa query semua atau filter by user_id
    const result = await notificationService.findAllByUser(query);

    new AppResponse<typeof result>({
      res,
      data: result,
    });
  });

  /**
   * GET /notifications/unread-count
   * Mendapatkan jumlah notifikasi yang belum dibaca.
   */
  getUnreadCount = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.query.user_id as string;

      if (!userId) {
        throw new AppError("user_id is required", 400);
      }

      const count = await notificationService.getUnreadCount(userId);

      new AppResponse<{ count: number }>({
        res,
        data: { count },
      });
    },
  );

  /**
   * PATCH /notifications/:id/read
   * Menandai satu notifikasi sebagai sudah dibaca.
   */
  markAsRead = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = markAsReadSchema.parse(req.params);

      const notification = await notificationService.markAsRead(id);

      new AppResponse<Notifications>({
        res,
        data: notification,
      });
    },
  );

  /**
   * PATCH /notifications/read-all
   * Menandai semua notifikasi user sebagai sudah dibaca.
   */
  markAllAsRead = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.query.user_id as string;

      if (!userId) {
        throw new AppError("user_id is required", 400);
      }

      const result = await notificationService.markAllAsRead(userId);

      new AppResponse<{ count: number }>({
        res,
        data: result,
      });
    },
  );

  /**
   * DELETE /notifications/:id
   * Menghapus satu notifikasi.
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = markAsReadSchema.parse(req.params);

    const notification = await notificationService.deleteNotification(id);

    new AppResponse<Notifications>({
      res,
      data: notification,
    });
  });

  /**
   * DELETE /notifications/read
   * Menghapus semua notifikasi yang sudah dibaca.
   */
  deleteRead = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.query.user_id as string;

      if (!userId) {
        throw new AppError("user_id is required", 400);
      }

      const result = await notificationService.deleteReadNotifications(userId);

      new AppResponse<{ count: number }>({
        res,
        data: result,
      });
    },
  );
}

export const notificationController = new NotificationController();
