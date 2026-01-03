"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints untuk notifikasi user dan admin
 */
const notificationRouter = (0, express_1.Router)();
exports.notificationRouter = notificationRouter;
/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get list of notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to get notifications for
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: List of notifications with pagination
 */
notificationRouter.get("/", notification_controller_1.notificationController.list);
/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to count unread notifications for
 *     responses:
 *       200:
 *         description: Count of unread notifications
 */
notificationRouter.get("/unread-count", notification_controller_1.notificationController.getUnreadCount);
/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to mark all notifications as read
 *     responses:
 *       200:
 *         description: Number of notifications marked as read
 */
notificationRouter.patch("/read-all", notification_controller_1.notificationController.markAllAsRead);
/**
 * @swagger
 * /api/v1/notifications/read:
 *   delete:
 *     summary: Delete all read notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to delete read notifications for
 *     responses:
 *       200:
 *         description: Number of notifications deleted
 */
notificationRouter.delete("/read", notification_controller_1.notificationController.deleteRead);
/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Updated notification
 */
notificationRouter.patch("/:id/read", notification_controller_1.notificationController.markAsRead);
/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Deleted notification
 */
notificationRouter.delete("/:id", notification_controller_1.notificationController.delete);
