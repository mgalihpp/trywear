"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const analyticsService = new analytics_service_1.AnalyticsService();
exports.AnalyticsController = {
    /**
     * GET /api/v1/analytics/sales-summary
     * Get sales summary with trends
     */
    getSalesSummary: async (req, res) => {
        try {
            const period = req.query.period || "month";
            const days = parseInt(req.query.days) || 30;
            const [summary, trend, byCategory, byStatus] = await Promise.all([
                analyticsService.getSalesSummary(period),
                analyticsService.getSalesTrend(days),
                analyticsService.getSalesByCategory(),
                analyticsService.getOrdersByPaymentStatus(),
            ]);
            res.json({
                success: true,
                data: {
                    summary,
                    trend,
                    byCategory,
                    byStatus,
                },
            });
        }
        catch (error) {
            console.error("Sales summary error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch sales summary",
            });
        }
    },
    /**
     * GET /api/v1/analytics/customer-insights
     * Get customer insights and segmentation
     */
    getCustomerInsights: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const [overview, byLocation, topCustomers, segments] = await Promise.all([
                analyticsService.getCustomerOverview(),
                analyticsService.getCustomersByLocation(),
                analyticsService.getTopCustomers(limit),
                analyticsService.getCustomerSegments(),
            ]);
            res.json({
                success: true,
                data: {
                    overview,
                    byLocation,
                    topCustomers,
                    segments,
                },
            });
        }
        catch (error) {
            console.error("Customer insights error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch customer insights",
            });
        }
    },
    /**
     * GET /api/v1/analytics/product-performance
     * Get product performance metrics
     */
    getProductPerformance: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const [performance, categoryPerformance] = await Promise.all([
                analyticsService.getProductPerformance(limit),
                analyticsService.getCategoryPerformance(),
            ]);
            res.json({
                success: true,
                data: {
                    ...performance,
                    categoryPerformance,
                },
            });
        }
        catch (error) {
            console.error("Product performance error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch product performance",
            });
        }
    },
};
