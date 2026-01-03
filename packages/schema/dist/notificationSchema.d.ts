import { z } from "zod";
/**
 * Notification types for User (customer)
 */
export declare const UserNotificationType: z.ZodEnum<{
    ORDER_CREATED: "ORDER_CREATED";
    ORDER_PAID: "ORDER_PAID";
    ORDER_SHIPPED: "ORDER_SHIPPED";
    ORDER_DELIVERED: "ORDER_DELIVERED";
    ORDER_CANCELLED: "ORDER_CANCELLED";
}>;
/**
 * Notification types for Admin
 */
export declare const AdminNotificationType: z.ZodEnum<{
    NEW_ORDER: "NEW_ORDER";
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
    RETURN_REQUEST: "RETURN_REQUEST";
    LOW_STOCK: "LOW_STOCK";
    OUT_OF_STOCK: "OUT_OF_STOCK";
}>;
/**
 * Combined notification types
 */
export declare const NotificationType: z.ZodEnum<{
    ORDER_CREATED: "ORDER_CREATED";
    ORDER_PAID: "ORDER_PAID";
    ORDER_SHIPPED: "ORDER_SHIPPED";
    ORDER_DELIVERED: "ORDER_DELIVERED";
    ORDER_CANCELLED: "ORDER_CANCELLED";
    NEW_ORDER: "NEW_ORDER";
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
    RETURN_REQUEST: "RETURN_REQUEST";
    LOW_STOCK: "LOW_STOCK";
    OUT_OF_STOCK: "OUT_OF_STOCK";
}>;
export type NotificationType = z.infer<typeof NotificationType>;
export type UserNotificationType = z.infer<typeof UserNotificationType>;
export type AdminNotificationType = z.infer<typeof AdminNotificationType>;
/**
 * Notification payload schemas for different types
 */
export declare const OrderNotificationPayload: z.ZodObject<{
    order_id: z.ZodString;
    order_status: z.ZodOptional<z.ZodString>;
    total_cents: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    tracking_number: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const StockNotificationPayload: z.ZodObject<{
    product_id: z.ZodString;
    product_title: z.ZodString;
    variant_id: z.ZodOptional<z.ZodString>;
    current_stock: z.ZodNumber;
    safety_stock: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ReturnNotificationPayload: z.ZodObject<{
    return_id: z.ZodString;
    order_id: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Generic notification payload (union of all payload types)
 */
export declare const NotificationPayload: z.ZodUnion<readonly [z.ZodObject<{
    order_id: z.ZodString;
    order_status: z.ZodOptional<z.ZodString>;
    total_cents: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    tracking_number: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    product_id: z.ZodString;
    product_title: z.ZodString;
    variant_id: z.ZodOptional<z.ZodString>;
    current_stock: z.ZodNumber;
    safety_stock: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    return_id: z.ZodString;
    order_id: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>;
export type NotificationPayload = z.infer<typeof NotificationPayload>;
/**
 * Create notification input
 */
export declare const createNotificationSchema: z.ZodObject<{
    user_id: z.ZodString;
    type: z.ZodEnum<{
        ORDER_CREATED: "ORDER_CREATED";
        ORDER_PAID: "ORDER_PAID";
        ORDER_SHIPPED: "ORDER_SHIPPED";
        ORDER_DELIVERED: "ORDER_DELIVERED";
        ORDER_CANCELLED: "ORDER_CANCELLED";
        NEW_ORDER: "NEW_ORDER";
        PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
        RETURN_REQUEST: "RETURN_REQUEST";
        LOW_STOCK: "LOW_STOCK";
        OUT_OF_STOCK: "OUT_OF_STOCK";
    }>;
    payload: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        order_id: z.ZodString;
        order_status: z.ZodOptional<z.ZodString>;
        total_cents: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        tracking_number: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        product_id: z.ZodString;
        product_title: z.ZodString;
        variant_id: z.ZodOptional<z.ZodString>;
        current_stock: z.ZodNumber;
        safety_stock: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        return_id: z.ZodString;
        order_id: z.ZodString;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
}, z.core.$strip>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
/**
 * Query parameters for listing notifications
 */
export declare const listNotificationsQuerySchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    is_read: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    type: z.ZodOptional<z.ZodEnum<{
        ORDER_CREATED: "ORDER_CREATED";
        ORDER_PAID: "ORDER_PAID";
        ORDER_SHIPPED: "ORDER_SHIPPED";
        ORDER_DELIVERED: "ORDER_DELIVERED";
        ORDER_CANCELLED: "ORDER_CANCELLED";
        NEW_ORDER: "NEW_ORDER";
        PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
        RETURN_REQUEST: "RETURN_REQUEST";
        LOW_STOCK: "LOW_STOCK";
        OUT_OF_STOCK: "OUT_OF_STOCK";
    }>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
/**
 * Mark notification as read input
 */
export declare const markAsReadSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
//# sourceMappingURL=notificationSchema.d.ts.map