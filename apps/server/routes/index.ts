import { Router } from "express";
import { addressRouter } from "@/modules/address/address.route";
import auditLogRouter from "@/modules/audit/audit-log.routes";
import { categoriesRouter } from "@/modules/categories/categories.route";
import { couponRouter } from "@/modules/coupon/coupon.route";
import { customerRouter } from "@/modules/customer/customer.route";
import { analyticsRouter } from "@/modules/dashboard/analytics.route";
import { dashboardRouter } from "@/modules/dashboard/dashboard.route";
import { inventoryRouter } from "@/modules/inventory/inventory.route";
import { notificationRouter } from "@/modules/notification/notification.route";
import { orderRouter } from "@/modules/order/order.route";
import { paymentRouter } from "@/modules/payment/payment.route";
import { productRouter } from "@/modules/product/product.route";
import reportRouter from "@/modules/report/report.routes";
import { returnRouter } from "@/modules/return/return.route";
import { reviewRouter } from "@/modules/review/review.route";
import { segmentRouter } from "@/modules/segment/segment.route";
import { supplierRouter } from "@/modules/supplier/supplier.route";
import { tryonRouter } from "@/modules/tryon/tryon.route";
import { userRouter } from "@/modules/user/user.routes";

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
const v1Router: Router = Router();

/**
 * Route ini menangani semua endpoint terkait dashboard.
 * Semua route yang berhubungan dengan statistik dan analytics dashboard admin.
 */
v1Router.use("/dashboard", dashboardRouter);

/**
 * Route ini menangani semua endpoint terkait analytics.
 * Semua route yang berhubungan dengan analytics lanjutan untuk admin.
 */
v1Router.use("/analytics", analyticsRouter);

/**
 * Route ini menangani semua endpoint terkait produk.
 * Semua route yang berhubungan dengan data produk, managemen produk.
 * pengguna dikelola di dalam router ini.
 */
v1Router.use("/products", productRouter);

/**
 * Route ini menangani semua endpoint terkait kategori.
 * Semua route yang berhubungan dengan data kategori, managemen kategori.
 * dikelola di dalam router ini.
 */
v1Router.use("/categories", categoriesRouter);

/**
 * Route ini menangani semua endpoint terkait order.
 * Semua route yang berhubungan dengan data order, managemen order.
 * dikelola di dalam router ini.
 */
v1Router.use("/orders", orderRouter);

/**
 * Route ini menangani semua endpoint terkait address.
 * Semua route yang berhubungan dengan data address, managemen address.
 * dikelola di dalam router ini.
 */
v1Router.use("/address", addressRouter);

/**
 * Route ini menangani semua endpoint terkait payment.
 * Semua route yang berhubungan dengan data payment, managemen payment.
 * dikelola di dalam router ini.
 */
v1Router.use("/payment", paymentRouter);

/**
 * Route ini menangani semua endpoint terkait customer.
 * Semua route yang berhubungan dengan data customer, managemen customer.
 * dikelola di dalam router ini.
 */
v1Router.use("/customers", customerRouter);

/**
 * Route ini menangani semua endpoint terkait notifications.
 * Semua route yang berhubungan dengan data notifications, managemen notifications.
 * dikelola di dalam router ini.
 */
v1Router.use("/notifications", notificationRouter);

/**
 * Route ini menangani semua endpoint terkait customer segments.
 * Semua route yang berhubungan dengan segmentasi customer, managemen segment.
 * dikelola di dalam router ini.
 */
v1Router.use("/segments", segmentRouter);

/**
 * Route ini menangani semua endpoint terkait inventory.
 * Semua route yang berhubungan dengan data inventory, managemen stok.
 * dikelola di dalam router ini.
 */
v1Router.use("/inventory", inventoryRouter);

/**
 * Route ini menangani semua endpoint terkait supplier.
 * Semua route yang berhubungan dengan data supplier, managemen supplier.
 * dikelola di dalam router ini.
 */
v1Router.use("/suppliers", supplierRouter);

/**
 * Route ini menangani semua endpoint terkait coupon.
 * Semua route yang berhubungan dengan data coupon, managemen kupon.
 * dikelola di dalam router ini.
 */
v1Router.use("/coupons", couponRouter);

/**
 * Route ini menangani semua endpoint terkait return/refund.
 * Semua route yang berhubungan dengan pengembalian produk.
 * dikelola di dalam router ini.
 */
v1Router.use("/returns", returnRouter);

/**
 * Route ini menangani semua endpoint terkait review.
 * Semua route yang berhubungan dengan ulasan produk.
 * dikelola di dalam router ini.
 */
v1Router.use("/reviews", reviewRouter);

/**
 * Route ini menangani semua endpoint terkait reports.
 * Semua route yang berhubungan dengan laporan penjualan dan keuangan.
 * dikelola di dalam router ini.
 */
v1Router.use("/reports", reportRouter);

/**
 * Route ini menangani semua endpoint terkait audit logs.
 * Semua route yang berhubungan dengan log aktivitas sistem dan user.
 * dikelola di dalam router ini.
 */
v1Router.use("/audit-logs", auditLogRouter);

/**
 * Route ini menangani manajemen user (admin roles).
 */
v1Router.use("/users", userRouter);

/**
 * Route ini menangani semua endpoint terkait virtual try-on AI.
 * Semua route yang berhubungan dengan AI virtual try-on features.
 * dikelola di dalam router ini.
 */
v1Router.use("/tryon", tryonRouter);

export default v1Router;
