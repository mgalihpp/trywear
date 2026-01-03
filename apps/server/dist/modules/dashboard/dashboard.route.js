"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter = dashboardRouter;
/**
 * GET /api/v1/dashboard/stats
 * Get all dashboard statistics (overview, charts data)
 */
dashboardRouter.get("/stats", dashboard_controller_1.DashboardController.getStats);
/**
 * GET /api/v1/dashboard/recent-orders
 * Get recent orders for dashboard
 */
dashboardRouter.get("/recent-orders", dashboard_controller_1.DashboardController.getRecentOrders);
/**
 * GET /api/v1/dashboard/top-products
 * Get top selling products
 */
dashboardRouter.get("/top-products", dashboard_controller_1.DashboardController.getTopProducts);
/**
 * GET /api/v1/dashboard/low-stock
 * Get low stock products alert
 */
dashboardRouter.get("/low-stock", dashboard_controller_1.DashboardController.getLowStock);
/**
 * GET /api/v1/dashboard/activities
 * Get recent activities
 */
dashboardRouter.get("/activities", dashboard_controller_1.DashboardController.getActivities);
