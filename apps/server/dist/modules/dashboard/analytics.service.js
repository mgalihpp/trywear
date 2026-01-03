"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const db_1 = require("@repo/db");
class AnalyticsService {
    db = db_1.db;
    // ========================
    // SALES SUMMARY METHODS
    // ========================
    /**
     * Get comprehensive sales summary
     */
    async getSalesSummary(period = "month") {
        const now = new Date();
        const { startDate, previousStartDate, previousEndDate } = this.getPeriodDates(period, now);
        // Current period stats
        const [currentRevenue, previousRevenue, currentOrders, previousOrders] = await Promise.all([
            this.db.orders.aggregate({
                _sum: { total_cents: true },
                _count: true,
                where: {
                    created_at: { gte: startDate },
                    status: { in: ["paid", "shipped", "delivered", "completed"] },
                },
            }),
            this.db.orders.aggregate({
                _sum: { total_cents: true },
                _count: true,
                where: {
                    created_at: { gte: previousStartDate, lte: previousEndDate },
                    status: { in: ["paid", "shipped", "delivered", "completed"] },
                },
            }),
            this.db.orders.count({
                where: { created_at: { gte: startDate } },
            }),
            this.db.orders.count({
                where: {
                    created_at: { gte: previousStartDate, lte: previousEndDate },
                },
            }),
        ]);
        const totalRevenue = Number(currentRevenue._sum.total_cents || 0);
        const totalOrders = currentOrders;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const prevTotalRevenue = Number(previousRevenue._sum.total_cents || 0);
        const prevAOV = previousOrders > 0 ? prevTotalRevenue / previousOrders : 0;
        return {
            totalRevenue,
            revenueChange: this.calculateChange(totalRevenue, prevTotalRevenue),
            totalOrders,
            ordersChange: this.calculateChange(totalOrders, previousOrders),
            averageOrderValue,
            aovChange: this.calculateChange(averageOrderValue, prevAOV),
            period,
        };
    }
    /**
     * Get sales trend by day/week
     */
    async getSalesTrend(days = 30) {
        const result = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const [revenue, orders] = await Promise.all([
                this.db.orders.aggregate({
                    _sum: { total_cents: true },
                    where: {
                        created_at: { gte: startOfDay, lte: endOfDay },
                        status: { in: ["paid", "shipped", "delivered", "completed"] },
                    },
                }),
                this.db.orders.count({
                    where: { created_at: { gte: startOfDay, lte: endOfDay } },
                }),
            ]);
            result.push({
                date: startOfDay.toISOString().split("T")[0],
                revenue: Number(revenue._sum.total_cents || 0),
                orders,
            });
        }
        return result;
    }
    /**
     * Get sales breakdown by category
     */
    async getSalesByCategory() {
        const orderItems = await this.db.orderItems.findMany({
            where: {
                order: {
                    status: { in: ["paid", "shipped", "delivered", "completed"] },
                },
            },
            include: {
                variant: {
                    include: {
                        product: {
                            include: { category: true },
                        },
                    },
                },
            },
        });
        const categoryMap = new Map();
        for (const item of orderItems) {
            const categoryName = item.variant?.product?.category?.name || "Tanpa Kategori";
            const existing = categoryMap.get(categoryName);
            if (existing) {
                existing.revenue += Number(item.total_price_cents);
                existing.orders += item.quantity;
            }
            else {
                categoryMap.set(categoryName, {
                    name: categoryName,
                    revenue: Number(item.total_price_cents),
                    orders: item.quantity,
                });
            }
        }
        return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
    }
    /**
     * Get sales by payment status
     */
    async getOrdersByPaymentStatus() {
        const statusLabels = {
            pending: "Menunggu Pembayaran",
            paid: "Dibayar",
            shipped: "Dalam Pengiriman",
            delivered: "Terkirim",
            completed: "Selesai",
            cancelled: "Dibatalkan",
            returned: "Dikembalikan",
        };
        const statuses = await this.db.orders.groupBy({
            by: ["status"],
            _count: true,
            _sum: { total_cents: true },
        });
        return statuses.map((s) => ({
            status: s.status,
            label: statusLabels[s.status] || s.status,
            count: s._count,
            revenue: Number(s._sum.total_cents || 0),
        }));
    }
    // ========================
    // CUSTOMER INSIGHTS METHODS
    // ========================
    /**
     * Get customer overview stats
     */
    async getCustomerOverview() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalCustomers, newCustomersThisMonth, newCustomersLastMonth, customersWithOrders, totalRevenue,] = await Promise.all([
            this.db.user.count({ where: { role: "user" } }),
            this.db.user.count({
                where: { role: "user", createdAt: { gte: startOfMonth } },
            }),
            this.db.user.count({
                where: {
                    role: "user",
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            this.db.user.count({
                where: {
                    role: "user",
                    orders: { some: { status: { in: ["completed", "delivered"] } } },
                },
            }),
            this.db.orders.aggregate({
                _sum: { total_cents: true },
                where: {
                    status: { in: ["paid", "shipped", "delivered", "completed"] },
                },
            }),
        ]);
        // Calculate CLV (Customer Lifetime Value)
        const clv = customersWithOrders > 0
            ? Number(totalRevenue._sum.total_cents || 0) / customersWithOrders
            : 0;
        // Calculate retention rate (customers with >1 order)
        const repeatCustomers = await this.db.user.count({
            where: {
                role: "user",
                orders: { some: {} },
            },
        });
        const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
        return {
            totalCustomers,
            newCustomersThisMonth,
            newCustomersChange: this.calculateChange(newCustomersThisMonth, newCustomersLastMonth),
            customerLifetimeValue: clv,
            retentionRate: Number(retentionRate.toFixed(1)),
            customersWithOrders,
        };
    }
    /**
     * Get customers by location (city/province)
     */
    async getCustomersByLocation() {
        const addresses = await this.db.addresses.findMany({
            where: { is_default: true, user: { role: "user" } },
            select: { city: true, province: true },
        });
        const cityMap = new Map();
        const provinceMap = new Map();
        for (const addr of addresses) {
            if (addr.city) {
                cityMap.set(addr.city, (cityMap.get(addr.city) || 0) + 1);
            }
            if (addr.province) {
                provinceMap.set(addr.province, (provinceMap.get(addr.province) || 0) + 1);
            }
        }
        return {
            byCity: Array.from(cityMap.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            byProvince: Array.from(provinceMap.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
        };
    }
    /**
     * Get top customers by lifetime value
     */
    async getTopCustomers(limit = 10) {
        const customers = await this.db.user.findMany({
            where: { role: "user" },
            orderBy: { lifetime_spent: "desc" },
            take: limit,
            include: {
                _count: { select: { orders: true } },
                segment: { select: { name: true, color: true } },
            },
        });
        return customers.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            image: c.image,
            lifetimeSpent: Number(c.lifetime_spent),
            orderCount: c._count.orders,
            segment: c.segment,
            joinedAt: c.createdAt,
        }));
    }
    /**
     * Get customer segments distribution
     */
    async getCustomerSegments() {
        const segments = await this.db.customerSegment.findMany({
            where: { is_active: true },
            orderBy: { priority: "desc" },
            include: {
                _count: { select: { users: true } },
                users: { select: { lifetime_spent: true } },
            },
        });
        return segments.map((segment) => {
            const totalSpent = segment.users.reduce((sum, user) => sum + Number(user.lifetime_spent), 0);
            return {
                id: segment.id,
                name: segment.name,
                slug: segment.slug,
                color: segment.color,
                icon: segment.icon,
                customerCount: segment._count.users,
                totalSpent,
                discountPercent: segment.discount_percent,
            };
        });
    }
    // ========================
    // PRODUCT PERFORMANCE METHODS
    // ========================
    /**
     * Get product performance overview
     */
    async getProductPerformance(limit = 10) {
        const [topSelling, topRated, mostReturned] = await Promise.all([
            this.getTopSellingProducts(limit),
            this.getTopRatedProducts(limit),
            this.getMostReturnedProducts(limit),
        ]);
        const totalProducts = await this.db.product.count({
            where: { status: "active" },
        });
        const totalCategories = await this.db.categories.count();
        return {
            totalProducts,
            totalCategories,
            topSelling,
            topRated,
            mostReturned,
        };
    }
    /**
     * Get top selling products
     */
    async getTopSellingProducts(limit = 10) {
        const orderItems = await this.db.orderItems.findMany({
            where: {
                variant_id: { not: null },
                order: { status: { in: ["delivered", "completed"] } },
            },
            select: {
                quantity: true,
                total_price_cents: true,
                variant: {
                    select: {
                        product_id: true,
                        product: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                product_images: { take: 1, orderBy: { sort_order: "asc" } },
                                category: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });
        const productMap = new Map();
        for (const item of orderItems) {
            if (!item.variant?.product)
                continue;
            const productId = item.variant.product.id;
            const existing = productMap.get(productId);
            if (existing) {
                existing.sales += item.quantity;
                existing.revenue += Number(item.total_price_cents);
            }
            else {
                productMap.set(productId, {
                    id: productId,
                    name: item.variant.product.title,
                    slug: item.variant.product.slug,
                    image: item.variant.product.product_images[0]?.url,
                    category: item.variant.product.category?.name,
                    sales: item.quantity,
                    revenue: Number(item.total_price_cents),
                });
            }
        }
        return Array.from(productMap.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, limit);
    }
    /**
     * Get top rated products
     */
    async getTopRatedProducts(limit = 10) {
        const products = await this.db.product.findMany({
            where: { status: "active", reviews: { some: {} } },
            include: {
                product_images: { take: 1, orderBy: { sort_order: "asc" } },
                category: { select: { name: true } },
                reviews: {
                    where: { status: "approved" },
                    select: { rating: true },
                },
            },
        });
        const productsWithRating = products.map((p) => {
            const avgRating = p.reviews.length > 0
                ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
                : 0;
            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                image: p.product_images[0]?.url,
                category: p.category?.name,
                avgRating: Number(avgRating.toFixed(1)),
                reviewCount: p.reviews.length,
            };
        });
        return productsWithRating
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, limit);
    }
    /**
     * Get products with highest return rates
     */
    async getMostReturnedProducts(limit = 10) {
        const returnItems = await this.db.returnItems.findMany({
            where: { return: { status: { not: "rejected" } } },
            include: {
                order_item: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        product_images: { take: 1, orderBy: { sort_order: "asc" } },
                                        category: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const productMap = new Map();
        for (const item of returnItems) {
            if (!item.order_item?.variant?.product)
                continue;
            const product = item.order_item.variant.product;
            const existing = productMap.get(product.id);
            if (existing) {
                existing.returnCount += item.quantity;
            }
            else {
                productMap.set(product.id, {
                    id: product.id,
                    name: product.title,
                    image: product.product_images[0]?.url,
                    category: product.category?.name,
                    returnCount: item.quantity,
                });
            }
        }
        return Array.from(productMap.values())
            .sort((a, b) => b.returnCount - a.returnCount)
            .slice(0, limit);
    }
    /**
     * Get category performance
     */
    async getCategoryPerformance() {
        const categories = await this.db.categories.findMany({
            include: {
                products: {
                    include: {
                        product_variants: {
                            include: {
                                order_items: {
                                    where: {
                                        order: {
                                            status: { in: ["delivered", "completed"] },
                                        },
                                    },
                                },
                            },
                        },
                        reviews: { where: { status: "approved" } },
                    },
                },
            },
        });
        return categories
            .map((cat) => {
            let totalSales = 0;
            let totalRevenue = 0;
            let totalReviews = 0;
            let totalRating = 0;
            for (const product of cat.products) {
                for (const variant of product.product_variants) {
                    for (const orderItem of variant.order_items) {
                        totalSales += orderItem.quantity;
                        totalRevenue += Number(orderItem.total_price_cents);
                    }
                }
                for (const review of product.reviews) {
                    totalReviews++;
                    totalRating += review.rating;
                }
            }
            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                productCount: cat.products.length,
                totalSales,
                totalRevenue,
                avgRating: totalReviews > 0
                    ? Number((totalRating / totalReviews).toFixed(1))
                    : 0,
            };
        })
            .sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
    // ========================
    // HELPER METHODS
    // ========================
    getPeriodDates(period, now) {
        let startDate;
        let previousStartDate;
        let previousEndDate;
        switch (period) {
            case "day":
                startDate = new Date(now.setHours(0, 0, 0, 0));
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(previousEndDate);
                previousStartDate.setHours(0, 0, 0, 0);
                break;
            case "week": {
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(previousEndDate);
                previousStartDate.setDate(previousEndDate.getDate() - 6);
                previousStartDate.setHours(0, 0, 0, 0);
                break;
            }
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
                break;
            case "month":
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
        }
        return { startDate, previousStartDate, previousEndDate };
    }
    calculateChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    }
}
exports.AnalyticsService = AnalyticsService;
