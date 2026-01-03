"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const schema_1 = require("@repo/schema");
const asyncHandler_1 = require("../../middleware/asyncHandler");
const appError_1 = require("../../utils/appError");
const appResponse_1 = require("../../utils/appResponse");
const notification_service_1 = require("./notification.service");
/**
 * NotificationController untuk handle HTTP requests terkait notifikasi.
 */
class NotificationController {
    /**
     * GET /notifications
     * List notifications dengan pagination dan filter.
     */
    list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = schema_1.listNotificationsQuerySchema.parse(req.query);
        // Jika ada user dari auth, gunakan user_id dari auth
        // Untuk admin, bisa query semua atau filter by user_id
        const result = await notification_service_1.notificationService.findAllByUser(query);
        new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
    /**
     * GET /notifications/unread-count
     * Mendapatkan jumlah notifikasi yang belum dibaca.
     */
    getUnreadCount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.query.user_id;
        if (!userId) {
            throw new appError_1.AppError("user_id is required", 400);
        }
        const count = await notification_service_1.notificationService.getUnreadCount(userId);
        new appResponse_1.AppResponse({
            res,
            data: { count },
        });
    });
    /**
     * PATCH /notifications/:id/read
     * Menandai satu notifikasi sebagai sudah dibaca.
     */
    markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.markAsReadSchema.parse(req.params);
        const notification = await notification_service_1.notificationService.markAsRead(id);
        new appResponse_1.AppResponse({
            res,
            data: notification,
        });
    });
    /**
     * PATCH /notifications/read-all
     * Menandai semua notifikasi user sebagai sudah dibaca.
     */
    markAllAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.query.user_id;
        if (!userId) {
            throw new appError_1.AppError("user_id is required", 400);
        }
        const result = await notification_service_1.notificationService.markAllAsRead(userId);
        new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
    /**
     * DELETE /notifications/:id
     * Menghapus satu notifikasi.
     */
    delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = schema_1.markAsReadSchema.parse(req.params);
        const notification = await notification_service_1.notificationService.deleteNotification(id);
        new appResponse_1.AppResponse({
            res,
            data: notification,
        });
    });
    /**
     * DELETE /notifications/read
     * Menghapus semua notifikasi yang sudah dibaca.
     */
    deleteRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.query.user_id;
        if (!userId) {
            throw new appError_1.AppError("user_id is required", 400);
        }
        const result = await notification_service_1.notificationService.deleteReadNotifications(userId);
        new appResponse_1.AppResponse({
            res,
            data: result,
        });
    });
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
