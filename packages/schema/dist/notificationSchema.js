"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsReadSchema = exports.listNotificationsQuerySchema = exports.createNotificationSchema = exports.NotificationPayload = exports.ReturnNotificationPayload = exports.StockNotificationPayload = exports.OrderNotificationPayload = exports.NotificationType = exports.AdminNotificationType = exports.UserNotificationType = void 0;
const zod_1 = require("zod");
/**
 * Notification types for User (customer)
 */
exports.UserNotificationType = zod_1.z.enum([
    "ORDER_CREATED", // Pesanan dibuat, menunggu pembayaran
    "ORDER_PAID", // Pembayaran berhasil
    "ORDER_SHIPPED", // Pesanan dalam pengiriman
    "ORDER_DELIVERED", // Pesanan telah sampai
    "ORDER_CANCELLED", // Pesanan dibatalkan
]);
/**
 * Notification types for Admin
 */
exports.AdminNotificationType = zod_1.z.enum([
    "NEW_ORDER", // Pesanan baru masuk
    "PAYMENT_RECEIVED", // Pembayaran diterima
    "RETURN_REQUEST", // Permintaan retur
    "LOW_STOCK", // Stok menipis
    "OUT_OF_STOCK", // Stok habis
]);
/**
 * Combined notification types
 */
exports.NotificationType = zod_1.z.enum([
    ...exports.UserNotificationType.options,
    ...exports.AdminNotificationType.options,
]);
/**
 * Notification payload schemas for different types
 */
exports.OrderNotificationPayload = zod_1.z.object({
    order_id: zod_1.z.string().uuid(),
    order_status: zod_1.z.string().optional(),
    total_cents: zod_1.z.coerce.number().optional(),
    tracking_number: zod_1.z.string().optional(),
});
exports.StockNotificationPayload = zod_1.z.object({
    product_id: zod_1.z.string().uuid(),
    product_title: zod_1.z.string(),
    variant_id: zod_1.z.string().uuid().optional(),
    current_stock: zod_1.z.number(),
    safety_stock: zod_1.z.number().optional(),
});
exports.ReturnNotificationPayload = zod_1.z.object({
    return_id: zod_1.z.string().uuid(),
    order_id: zod_1.z.string().uuid(),
    reason: zod_1.z.string().optional(),
});
/**
 * Generic notification payload (union of all payload types)
 */
exports.NotificationPayload = zod_1.z.union([
    exports.OrderNotificationPayload,
    exports.StockNotificationPayload,
    exports.ReturnNotificationPayload,
    zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()), // Allow custom payloads
]);
/**
 * Create notification input
 */
exports.createNotificationSchema = zod_1.z.object({
    user_id: zod_1.z.string(),
    type: exports.NotificationType,
    payload: exports.NotificationPayload.optional(),
});
/**
 * Query parameters for listing notifications
 */
exports.listNotificationsQuerySchema = zod_1.z.object({
    user_id: zod_1.z.string().optional(),
    is_read: zod_1.z.coerce.boolean().optional(),
    type: exports.NotificationType.optional(),
    limit: zod_1.z.coerce.number().int().positive().default(20),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
});
/**
 * Mark notification as read input
 */
exports.markAsReadSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=notificationSchema.js.map