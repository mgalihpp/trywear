"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const db_1 = require("@repo/db");
const date_fns_1 = require("date-fns");
class ReportService {
    db = db_1.db;
    /**
     * Get date range based on period type
     */
    getDateRange(period, customStart, customEnd) {
        const now = new Date();
        switch (period) {
            case "daily":
                return { start: (0, date_fns_1.startOfDay)(now), end: (0, date_fns_1.endOfDay)(now) };
            case "weekly":
                return {
                    start: (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 }),
                    end: (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 1 }),
                };
            case "monthly":
                return { start: (0, date_fns_1.startOfMonth)(now), end: (0, date_fns_1.endOfMonth)(now) };
            case "yearly":
                return { start: (0, date_fns_1.startOfYear)(now), end: (0, date_fns_1.endOfYear)(now) };
            case "custom":
                return {
                    start: customStart ? (0, date_fns_1.startOfDay)(customStart) : (0, date_fns_1.startOfMonth)(now),
                    end: customEnd ? (0, date_fns_1.endOfDay)(customEnd) : (0, date_fns_1.endOfMonth)(now),
                };
            default:
                return { start: (0, date_fns_1.startOfMonth)(now), end: (0, date_fns_1.endOfMonth)(now) };
        }
    }
    /**
     * Get previous period for comparison
     */
    getPreviousDateRange(dateRange) {
        const duration = dateRange.end.getTime() - dateRange.start.getTime();
        return {
            start: new Date(dateRange.start.getTime() - duration),
            end: new Date(dateRange.end.getTime() - duration),
        };
    }
    /**
     * Get sales report
     */
    async getSalesReport(period, startDate, endDate) {
        const dateRange = this.getDateRange(period, startDate, endDate);
        const prevRange = this.getPreviousDateRange(dateRange);
        // Current period data
        const currentOrders = await this.db.orders.findMany({
            where: {
                created_at: { gte: dateRange.start, lte: dateRange.end },
                status: { notIn: ["cancelled", "failed"] },
            },
            include: {
                order_items: true,
                payments: true,
            },
        });
        // Previous period data
        const prevOrders = await this.db.orders.findMany({
            where: {
                created_at: { gte: prevRange.start, lte: prevRange.end },
                status: { notIn: ["cancelled", "failed"] },
            },
        });
        // Calculate metrics
        const totalRevenue = currentOrders.reduce((sum, order) => sum + Number(order.total_cents), 0);
        const prevRevenue = prevOrders.reduce((sum, order) => sum + Number(order.total_cents), 0);
        const totalOrders = currentOrders.length;
        const prevTotalOrders = prevOrders.length;
        const totalItemsSold = currentOrders.reduce((sum, order) => sum + order.order_items.reduce((s, item) => s + item.quantity, 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const prevAvgOrderValue = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0;
        // Calculate percentage changes
        const revenueChange = prevRevenue > 0
            ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
            : totalRevenue > 0
                ? 100
                : 0;
        const ordersChange = prevTotalOrders > 0
            ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
            : totalOrders > 0
                ? 100
                : 0;
        const avgOrderChange = prevAvgOrderValue > 0
            ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
            : avgOrderValue > 0
                ? 100
                : 0;
        // Revenue by day/week/month for chart
        const revenueByPeriod = await this.getRevenueByPeriod(dateRange, period);
        // Orders by status
        const ordersByStatus = await this.db.orders.groupBy({
            by: ["status"],
            where: {
                created_at: { gte: dateRange.start, lte: dateRange.end },
            },
            _count: { id: true },
            _sum: { total_cents: true },
        });
        // Top selling products
        const topProducts = await this.db.orderItems.groupBy({
            by: ["variant_id", "title"],
            where: {
                order: {
                    created_at: { gte: dateRange.start, lte: dateRange.end },
                    status: { notIn: ["cancelled", "failed"] },
                },
            },
            _count: { id: true },
            _sum: { quantity: true, unit_price_cents: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: 10,
        });
        return {
            period,
            dateRange: {
                start: dateRange.start.toISOString(),
                end: dateRange.end.toISOString(),
            },
            summary: {
                totalRevenue,
                revenueChange,
                totalOrders,
                ordersChange,
                totalItemsSold,
                avgOrderValue,
                avgOrderChange,
            },
            revenueByPeriod,
            ordersByStatus: ordersByStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
                revenue: Number(s._sum.total_cents) || 0,
            })),
            topProducts: topProducts.map((p) => ({
                title: p.title,
                quantity: p._sum.quantity || 0,
                revenue: Number(p._sum.unit_price_cents) || 0,
            })),
        };
    }
    /**
     * Get revenue breakdown by period
     */
    async getRevenueByPeriod(dateRange, period) {
        let intervals;
        let formatStr;
        switch (period) {
            case "daily":
                intervals = [dateRange.start];
                formatStr = "HH:mm";
                break;
            case "weekly":
                intervals = (0, date_fns_1.eachDayOfInterval)(dateRange);
                formatStr = "EEE";
                break;
            case "monthly":
                intervals = (0, date_fns_1.eachDayOfInterval)(dateRange);
                formatStr = "dd";
                break;
            case "yearly":
                intervals = (0, date_fns_1.eachMonthOfInterval)(dateRange);
                formatStr = "MMM";
                break;
            default:
                intervals = (0, date_fns_1.eachDayOfInterval)(dateRange);
                formatStr = "dd MMM";
        }
        const result = await Promise.all(intervals.map(async (date) => {
            let start;
            let end;
            if (period === "yearly") {
                start = (0, date_fns_1.startOfMonth)(date);
                end = (0, date_fns_1.endOfMonth)(date);
            }
            else {
                start = (0, date_fns_1.startOfDay)(date);
                end = (0, date_fns_1.endOfDay)(date);
            }
            const revenue = await this.db.orders.aggregate({
                _sum: { total_cents: true },
                where: {
                    created_at: { gte: start, lte: end },
                    status: { notIn: ["cancelled", "failed"] },
                },
            });
            const orders = await this.db.orders.count({
                where: {
                    created_at: { gte: start, lte: end },
                    status: { notIn: ["cancelled", "failed"] },
                },
            });
            return {
                label: (0, date_fns_1.format)(date, formatStr),
                revenue: Number(revenue._sum.total_cents) || 0,
                orders,
            };
        }));
        return result;
    }
    /**
     * Get financial report
     */
    async getFinancialReport(period, startDate, endDate) {
        const dateRange = this.getDateRange(period, startDate, endDate);
        // Revenue breakdown
        const revenueData = await this.db.orders.aggregate({
            _sum: {
                subtotal_cents: true,
                tax_cents: true,
                shipping_cents: true,
                discount_cents: true,
                total_cents: true,
            },
            where: {
                created_at: { gte: dateRange.start, lte: dateRange.end },
                status: { notIn: ["cancelled", "failed"] },
            },
        });
        // Payment methods breakdown
        const paymentMethods = await this.db.payments.groupBy({
            by: ["provider"], // Changed from payment_method to provider
            where: {
                paid_at: { gte: dateRange.start, lte: dateRange.end },
                status: "settlement",
            },
            _count: { id: true },
            _sum: { amount_cents: true },
        });
        // Refunds/Returns - Calculate manually as there is no refund_amount_cents
        const returns = await this.db.returns.findMany({
            where: {
                created_at: { gte: dateRange.start, lte: dateRange.end },
                status: "approved",
            },
            include: {
                return_items: {
                    include: {
                        order_item: true,
                    },
                },
            },
        });
        const totalRefundAmount = returns.reduce((sum, ret) => {
            const returnTotal = ret.return_items.reduce((itemSum, item) => {
                // Calculate refund per item: quantity * unit_price
                const price = Number(item.order_item?.unit_price_cents || 0);
                return itemSum + price * item.quantity;
            }, 0);
            return sum + returnTotal;
        }, 0);
        // Coupons used - Count from Orders table
        const couponsUsed = await this.db.orders.count({
            where: {
                created_at: { gte: dateRange.start, lte: dateRange.end },
                coupon_code: { not: null }, // Count orders with coupon_code
            },
        });
        const totalDiscount = await this.db.orders.aggregate({
            _sum: { discount_cents: true },
            where: {
                created_at: { gte: dateRange.start, lte: dateRange.end },
                status: { notIn: ["cancelled", "failed"] },
            },
        });
        return {
            period,
            dateRange: {
                start: dateRange.start.toISOString(),
                end: dateRange.end.toISOString(),
            },
            revenue: {
                subtotal: Number(revenueData._sum.subtotal_cents) || 0,
                tax: Number(revenueData._sum.tax_cents) || 0,
                shipping: Number(revenueData._sum.shipping_cents) || 0,
                discount: Number(revenueData._sum.discount_cents) || 0,
                total: Number(revenueData._sum.total_cents) || 0,
                netRevenue: (Number(revenueData._sum.total_cents) || 0) - totalRefundAmount,
            },
            paymentMethods: paymentMethods.map((pm) => ({
                method: pm.provider || "unknown", // Changed from payment_method
                count: pm._count.id,
                amount: Number(pm._sum.amount_cents) || 0,
            })),
            refunds: {
                count: returns.length, // Changed from aggregate count
                amount: totalRefundAmount, // Changed from aggregate sum
            },
            coupons: {
                used: couponsUsed,
                totalDiscount: Number(totalDiscount._sum.discount_cents) || 0,
            },
        };
    }
    /**
     * Generate report data for export
     */
    async getReportForExport(period, startDate, endDate) {
        const [salesReport, financialReport] = await Promise.all([
            this.getSalesReport(period, startDate, endDate),
            this.getFinancialReport(period, startDate, endDate),
        ]);
        return {
            generatedAt: new Date().toISOString(),
            ...salesReport,
            financial: financialReport,
        };
    }
}
exports.ReportService = ReportService;
