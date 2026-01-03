"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const db_1 = require("@repo/db");
class DashboardService {
    db = db_1.db;
    /**
     * Get segment distribution for dashboard
     */
    async getSegmentDistribution() {
        const segments = await this.db.customerSegment.findMany({
            where: { is_active: true },
            orderBy: { priority: "desc" },
            include: {
                _count: {
                    select: { users: true },
                },
                users: {
                    select: {
                        lifetime_spent: true,
                    },
                },
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
    /**
     * Get overview statistics for the dashboard
     */
    async getOverviewStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        // Total Revenue (this month)
        const revenueThisMonth = await this.db.orders.aggregate({
            _sum: { total_cents: true },
            where: {
                created_at: { gte: startOfMonth },
                status: { in: ["paid", "shipped", "delivered", "completed"] },
            },
        });
        // Total Revenue (last month)
        const revenueLastMonth = await this.db.orders.aggregate({
            _sum: { total_cents: true },
            where: {
                created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
                status: { in: ["paid", "shipped", "delivered", "completed"] },
            },
        });
        // Total Orders (this month)
        const ordersThisMonth = await this.db.orders.count({
            where: { created_at: { gte: startOfMonth } },
        });
        // Total Orders (last month)
        const ordersLastMonth = await this.db.orders.count({
            where: {
                created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
            },
        });
        // Total Customers
        const totalCustomers = await this.db.user.count({
            where: { role: "user" },
        });
        // New Customers (this month)
        const customersThisMonth = await this.db.user.count({
            where: {
                role: "user",
                createdAt: { gte: startOfMonth },
            },
        });
        // Total Products
        const totalProducts = await this.db.product.count({
            where: { status: "active" },
        });
        // Calculate percentage change
        const revenueChange = this.calculateChange(Number(revenueThisMonth._sum.total_cents || 0), Number(revenueLastMonth._sum.total_cents || 0));
        const ordersChange = this.calculateChange(ordersThisMonth, ordersLastMonth);
        return {
            revenue: {
                value: Number(revenueThisMonth._sum.total_cents || 0),
                change: revenueChange,
            },
            orders: {
                value: ordersThisMonth,
                change: ordersChange,
            },
            customers: {
                value: totalCustomers,
                newThisMonth: customersThisMonth,
            },
            products: {
                value: totalProducts,
            },
        };
    }
    /**
     * Get revenue data for chart (last 12 months)
     */
    async getRevenueByMonth() {
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const revenue = await this.db.orders.aggregate({
                _sum: { total_cents: true },
                where: {
                    created_at: { gte: startOfMonth, lte: endOfMonth },
                    status: { in: ["paid", "shipped", "delivered", "completed"] },
                },
            });
            const monthName = startOfMonth.toLocaleDateString("id-ID", {
                month: "short",
            });
            months.push({
                month: monthName,
                revenue: Number(revenue._sum.total_cents || 0),
            });
        }
        return months;
    }
    /**
     * Get orders breakdown by status
     */
    async getOrdersByStatus() {
        const statusLabels = {
            pending: "Menunggu",
            processing: "Diproses",
            shipped: "Dikirim",
            delivered: "Terkirim",
            completed: "Selesai",
            cancelled: "Dibatalkan",
            returned: "Dikembalikan",
        };
        const statuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "completed",
            "cancelled",
            "returned",
        ];
        const result = [];
        for (const status of statuses) {
            const count = await this.db.orders.count({
                where: { status },
            });
            result.push({
                status,
                label: statusLabels[status] || status,
                count,
            });
        }
        return result;
    }
    /**
     * Get recent orders
     */
    async getRecentOrders(limit = 10) {
        const orders = await this.db.orders.findMany({
            where: {
                status: {
                    not: "cancelled",
                },
            },
            take: limit,
            orderBy: { created_at: "desc" },
            include: {
                user: {
                    select: { name: true, email: true },
                },
                order_items: {
                    take: 1,
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: { title: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        return orders.map((order) => ({
            id: order.id,
            customer: order.user?.name || order.user?.email || "Guest",
            amount: Number(order.total_cents),
            status: order.status,
            date: order.created_at,
            itemCount: order.order_items.length,
        }));
    }
    /**
     * Get top selling products (aggregated by product, not variant)
     */
    async getTopProducts(limit = 5) {
        // Get all order items with their variants and products
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
                                product_images: { take: 1, orderBy: { sort_order: "asc" } },
                            },
                        },
                    },
                },
            },
        });
        // Aggregate by product_id
        const productAggregates = new Map();
        for (const item of orderItems) {
            if (!item.variant?.product)
                continue;
            const productId = item.variant.product.id;
            const existing = productAggregates.get(productId);
            if (existing) {
                existing.sales += item.quantity;
                existing.revenue += Number(item.total_price_cents);
            }
            else {
                productAggregates.set(productId, {
                    id: productId,
                    name: item.variant.product.title,
                    image: item.variant.product.product_images[0]?.url,
                    sales: item.quantity,
                    revenue: Number(item.total_price_cents),
                });
            }
        }
        // Convert to array, sort by sales, and limit
        const sortedProducts = Array.from(productAggregates.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, limit);
        return sortedProducts;
    }
    /**
     * Get low stock products
     */
    async getLowStockProducts(threshold = 10, limit = 5) {
        const lowStockInventory = await this.db.inventory.findMany({
            where: {
                stock_quantity: { lte: threshold },
            },
            take: limit,
            orderBy: { stock_quantity: "asc" },
            include: {
                variant: {
                    include: {
                        product: {
                            include: {
                                product_images: { take: 1, orderBy: { sort_order: "asc" } },
                            },
                        },
                    },
                },
            },
        });
        return lowStockInventory.map((inv) => ({
            id: inv.variant?.product.id,
            name: inv.variant?.product.title || "Unknown",
            sku: inv.variant?.sku,
            image: inv.variant?.product.product_images[0]?.url,
            stock: inv.stock_quantity,
            safetyStock: inv.safety_stock,
        }));
    }
    /**
     * Get recent activities
     */
    async getRecentActivities(limit = 10) {
        const activities = [];
        // Recent orders
        const recentOrders = await this.db.orders.findMany({
            take: 5,
            orderBy: { created_at: "desc" },
            include: { user: { select: { name: true } } },
        });
        recentOrders.forEach((order) => {
            activities.push({
                type: "order",
                message: `Pesanan baru #${order.id} dari ${order.user?.name || "Guest"}`,
                date: order.created_at,
                icon: "shopping-cart",
            });
        });
        // Recent reviews
        const recentReviews = await this.db.reviews.findMany({
            take: 3,
            orderBy: { created_at: "desc" },
            include: {
                user: { select: { name: true } },
                product: { select: { title: true } },
            },
        });
        recentReviews.forEach((review) => {
            activities.push({
                type: "review",
                message: `${review.user?.name || "User"} memberikan ulasan untuk ${review.product?.title}`,
                date: review.created_at,
                icon: "star",
            });
        });
        // Recent customers
        const recentCustomers = await this.db.user.findMany({
            take: 3,
            where: { role: "user" },
            orderBy: { createdAt: "desc" },
        });
        recentCustomers.forEach((customer) => {
            activities.push({
                type: "customer",
                message: `Pelanggan baru: ${customer.name || customer.email}`,
                date: customer.createdAt,
                icon: "user-plus",
            });
        });
        // Sort by date and return
        return activities
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, limit);
    }
    calculateChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    }
}
exports.DashboardService = DashboardService;
