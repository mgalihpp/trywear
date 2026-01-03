"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_route_1 = require("../modules/address/address.route");
const audit_log_routes_1 = __importDefault(require("../modules/audit/audit-log.routes"));
const categories_route_1 = require("../modules/categories/categories.route");
const coupon_route_1 = require("../modules/coupon/coupon.route");
const customer_route_1 = require("../modules/customer/customer.route");
const analytics_route_1 = require("../modules/dashboard/analytics.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const inventory_route_1 = require("../modules/inventory/inventory.route");
const notification_route_1 = require("../modules/notification/notification.route");
const order_route_1 = require("../modules/order/order.route");
const payment_route_1 = require("../modules/payment/payment.route");
const product_route_1 = require("../modules/product/product.route");
const report_routes_1 = __importDefault(require("../modules/report/report.routes"));
const return_route_1 = require("../modules/return/return.route");
const review_route_1 = require("../modules/review/review.route");
const segment_route_1 = require("../modules/segment/segment.route");
const supplier_route_1 = require("../modules/supplier/supplier.route");
const user_routes_1 = require("../modules/user/user.routes");
/**
 * Router utama untuk versi 1 (v1) dari API.
 *
 * Digunakan untuk mengelompokkan route dan middleware yang terkait dengan versi 1 aplikasi.
 * Semua route untuk API v1 harus didaftarkan di sini, dan router ini dipasang di aplikasi
 * Express utama dengan prefix seperti '/api/v1'.
 *
 * Contoh penggunaan:
 * // import v1Router dari file ini lalu daftarkan pada app utama:
 * // app.use('/api/v1', v1Router);
 *
 * @constant
 * @type {import('express').Router}
 * @public
 * @since 1.0.0
 */
const v1Router = (0, express_1.Router)();
/**
 * Route ini menangani semua endpoint terkait dashboard.
 * Semua route yang berhubungan dengan statistik dan analytics dashboard admin.
 */
v1Router.use("/dashboard", dashboard_route_1.dashboardRouter);
/**
 * Route ini menangani semua endpoint terkait analytics.
 * Semua route yang berhubungan dengan analytics lanjutan untuk admin.
 */
v1Router.use("/analytics", analytics_route_1.analyticsRouter);
/**
 * Route ini menangani semua endpoint terkait produk.
 * Semua route yang berhubungan dengan data produk, managemen produk.
 * pengguna dikelola di dalam router ini.
 */
v1Router.use("/products", product_route_1.productRouter);
/**
 * Route ini menangani semua endpoint terkait kategori.
 * Semua route yang berhubungan dengan data kategori, managemen kategori.
 * dikelola di dalam router ini.
 */
v1Router.use("/categories", categories_route_1.categoriesRouter);
/**
 * Route ini menangani semua endpoint terkait order.
 * Semua route yang berhubungan dengan data order, managemen order.
 * dikelola di dalam router ini.
 */
v1Router.use("/orders", order_route_1.orderRouter);
/**
 * Route ini menangani semua endpoint terkait address.
 * Semua route yang berhubungan dengan data address, managemen address.
 * dikelola di dalam router ini.
 */
v1Router.use("/address", address_route_1.addressRouter);
/**
 * Route ini menangani semua endpoint terkait payment.
 * Semua route yang berhubungan dengan data payment, managemen payment.
 * dikelola di dalam router ini.
 */
v1Router.use("/payment", payment_route_1.paymentRouter);
/**
 * Route ini menangani semua endpoint terkait customer.
 * Semua route yang berhubungan dengan data customer, managemen customer.
 * dikelola di dalam router ini.
 */
v1Router.use("/customers", customer_route_1.customerRouter);
/**
 * Route ini menangani semua endpoint terkait notifications.
 * Semua route yang berhubungan dengan data notifications, managemen notifications.
 * dikelola di dalam router ini.
 */
v1Router.use("/notifications", notification_route_1.notificationRouter);
/**
 * Route ini menangani semua endpoint terkait customer segments.
 * Semua route yang berhubungan dengan segmentasi customer, managemen segment.
 * dikelola di dalam router ini.
 */
v1Router.use("/segments", segment_route_1.segmentRouter);
/**
 * Route ini menangani semua endpoint terkait inventory.
 * Semua route yang berhubungan dengan data inventory, managemen stok.
 * dikelola di dalam router ini.
 */
v1Router.use("/inventory", inventory_route_1.inventoryRouter);
/**
 * Route ini menangani semua endpoint terkait supplier.
 * Semua route yang berhubungan dengan data supplier, managemen supplier.
 * dikelola di dalam router ini.
 */
v1Router.use("/suppliers", supplier_route_1.supplierRouter);
/**
 * Route ini menangani semua endpoint terkait coupon.
 * Semua route yang berhubungan dengan data coupon, managemen kupon.
 * dikelola di dalam router ini.
 */
v1Router.use("/coupons", coupon_route_1.couponRouter);
/**
 * Route ini menangani semua endpoint terkait return/refund.
 * Semua route yang berhubungan dengan pengembalian produk.
 * dikelola di dalam router ini.
 */
v1Router.use("/returns", return_route_1.returnRouter);
/**
 * Route ini menangani semua endpoint terkait review.
 * Semua route yang berhubungan dengan ulasan produk.
 * dikelola di dalam router ini.
 */
v1Router.use("/reviews", review_route_1.reviewRouter);
/**
 * Route ini menangani semua endpoint terkait reports.
 * Semua route yang berhubungan dengan laporan penjualan dan keuangan.
 * dikelola di dalam router ini.
 */
v1Router.use("/reports", report_routes_1.default);
/**
 * Route ini menangani semua endpoint terkait audit logs.
 * Semua route yang berhubungan dengan log aktivitas sistem dan user.
 * dikelola di dalam router ini.
 */
v1Router.use("/audit-logs", audit_log_routes_1.default);
/**
 * Route ini menangani manajemen user (admin roles).
 */
v1Router.use("/users", user_routes_1.userRouter);
exports.default = v1Router;
