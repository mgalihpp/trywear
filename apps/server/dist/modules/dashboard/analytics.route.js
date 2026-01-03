"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter = analyticsRouter;
/**
 * GET /api/v1/analytics/sales-summary
 * Get sales summary with trends and breakdowns
 */
analyticsRouter.get("/sales-summary", analytics_controller_1.AnalyticsController.getSalesSummary);
/**
 * GET /api/v1/analytics/customer-insights
 * Get customer insights and segmentation
 */
analyticsRouter.get("/customer-insights", analytics_controller_1.AnalyticsController.getCustomerInsights);
/**
 * GET /api/v1/analytics/product-performance
 * Get product performance metrics
 */
analyticsRouter.get("/product-performance", analytics_controller_1.AnalyticsController.getProductPerformance);
