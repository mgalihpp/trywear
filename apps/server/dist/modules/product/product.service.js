"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const http_1 = require("../../configs/http");
const remove_bg_1 = require("../../lib/remove-bg");
const appError_1 = require("../../utils/appError");
const service_1 = require("../service");
const variant_service_1 = require("../variant/variant.service");
class ProductService extends service_1.BaseService {
    variantService;
    removeBgService;
    constructor() {
        super("product");
        this.variantService = new variant_service_1.ProductVariantsService();
        this.removeBgService = new remove_bg_1.RemoveBgService();
    }
    findAll = async (q) => {
        // Filter status: "active" hanya untuk store (ketika ada query params)
        // Admin dashboard memanggil findAll tanpa params sehingga bisa melihat semua produk
        const where = q ? { status: "active" } : {};
        if (!q) {
            return this.db[this.model].findMany({
                include: {
                    category: true,
                    supplier: true,
                    product_images: { orderBy: { sort_order: "asc" } },
                    product_variants: { include: { inventory: true } },
                    reviews: true,
                },
            });
        }
        if (q.categoryId !== undefined && Number(q.categoryId) > 0) {
            where.category = { id: Number(q.categoryId) };
        }
        if (q.priceRange && q.priceRange.length === 2) {
            where.price_cents = {
                gte: Number(q.priceRange[0]),
                lte: Number(q.priceRange[1]),
            };
        }
        if (q.colors?.length || q.sizes?.length) {
            const colorCond = q.colors?.length
                ? {
                    OR: q.colors.map((c) => ({
                        option_values: { path: ["color"], equals: c },
                    })),
                }
                : null;
            const sizeCond = q.sizes?.length
                ? {
                    OR: q.sizes.map((s) => ({
                        option_values: { path: ["size"], equals: s },
                    })),
                }
                : null;
            where.product_variants = {
                some: {
                    AND: [colorCond, sizeCond].filter(Boolean), // kalo salah satu null, otomatis di-skip
                },
            };
        }
        if (q.query?.trim()) {
            where.OR = [
                { title: { contains: q.query, mode: "insensitive" } },
                { description: { contains: q.query, mode: "insensitive" } },
            ];
        }
        let orderBy;
        if (q.sort) {
            switch (q.sort) {
                case "price_asc":
                    orderBy = { price_cents: "asc" };
                    break;
                case "price_desc":
                    orderBy = { price_cents: "desc" };
                    break;
                case "newest":
                    orderBy = { created_at: "desc" };
                    break;
            }
        }
        const page = Math.max(1, Number(q.page || 1));
        const limit = Math.min(Number(q.limit || 12), 100);
        const skip = (page - 1) * limit;
        return await this.db[this.model].findMany({
            where,
            orderBy,
            include: {
                category: true,
                supplier: true,
                product_images: { orderBy: { sort_order: "asc" } },
                product_variants: { include: { inventory: true } },
                reviews: true,
            },
            skip,
            take: limit,
        });
    };
    findById = async (id) => {
        return await this.db[this.model].findUnique({
            where: {
                id,
            },
            include: {
                supplier: true,
                product_images: true,
                product_variants: { include: { inventory: true } },
                reviews: true,
            },
        });
    };
    findSimilarProducts = async (product_id, limit = 8) => {
        // 1. Ambil produk + category + variant untuk ambil color/size
        const product = await this.db[this.model].findUnique({
            where: { id: product_id },
            select: {
                category_id: true,
                product_variants: {
                    select: {
                        option_values: true,
                    },
                    take: 1, // cukup ambil satu variant untuk deteksi warna/ukuran
                },
            },
        });
        if (!product) {
            throw appError_1.AppError.notFound("Product not found");
        }
        // 2. Ambil color & size dari variant pertama (paling aman)
        const firstVariant = product.product_variants[0];
        const optionValues = firstVariant?.option_values; // atau JsonObject
        const color = optionValues?.color;
        const size = optionValues?.size;
        // 3. Bangun kondisi where: prioritas color sama > kategori sama
        const where = {
            category_id: product.category_id,
            id: { not: product_id },
            status: "active", // Hanya tampilkan produk aktif di store
        };
        // Jika ada color, prioritaskan produk dengan warna yang sama
        // if (color) {
        //   where.product_variants = {
        //     some: {
        //       option_values: {
        //         path: ["color"],
        //         equals: color, // atau array_contains: [color] kalau disimpan array
        //       },
        //     },
        //   };
        // }
        // Opsional: kalau mau lebih ketat, tambah size juga
        // if (color && size) {
        //   where.product_variants = {
        //     some: {
        //       AND: [
        //         { option_values: { path: ["color"], equals: color } },
        //         { option_values: { path: ["size"], equals: size } },
        //       ],
        //     },
        //   };
        // }
        const products = await this.db[this.model].findMany({
            where,
            include: {
                category: true,
                product_images: {
                    orderBy: { sort_order: "asc" },
                    take: 1,
                },
                product_variants: {
                    include: { inventory: true },
                    take: 1,
                },
                reviews: true,
            },
            orderBy: [
                // { sold_count: "desc" }, // prioritas yang laris (kalau ada field ini)
                { created_at: "desc" }, // fallback terbaru
            ],
            take: limit * 2,
        });
        return products.sort(() => Math.random() - 0.5).slice(0, limit);
    };
    async update(id, data) {
        // Cek apakah productnya ada
        const product = await this.db[this.model].findFirst({
            where: {
                id,
            },
        });
        if (!product) {
            throw appError_1.AppError.notFound();
        }
        // Memperbarui data produk
        const updatedProduct = await this.db[this.model].update({
            where: {
                id,
            },
            data,
        });
        return updatedProduct;
    }
    async createImages(data) {
        const productId = data[0].product_id;
        const product = await this.db[this.model].findFirst({
            where: {
                id: productId,
            },
        });
        if (!product) {
            throw appError_1.AppError.notFound("Product Not Found");
        }
        return await this.db.productImages.createMany({
            data: data.map((image) => ({
                ...image,
            })),
        });
    }
    async deleteImage(imageId) {
        if (!imageId)
            return null;
        const isImageExits = await this.db.productImages.findFirst({
            where: {
                id: imageId,
            },
        });
        if (isImageExits) {
            return await this.db.productImages.delete({
                where: {
                    id: imageId,
                },
            });
        }
        return null;
    }
    async getAvailableFilters() {
        const colors = await this.variantService.getAvailableColors();
        const sizes = await this.variantService.getAvailableSizes();
        return { colors, sizes };
    }
    async createReview(user_id, data) {
        const existingReview = await this.db.reviews.findFirst({
            where: {
                user_id,
                product_id: data.product_id,
            },
            select: { id: true },
        });
        if (existingReview) {
            throw appError_1.AppError.httpException("Kamu sudah memberi ulasan untuk produk ini", http_1.HTTPSTATUS.CONFLICT);
        }
        const newReview = await this.db.reviews.create({
            data: {
                user_id,
                ...data,
            },
        });
        return newReview;
    }
    async deleteReview(id) {
        const isReviewExits = await this.db.reviews.findFirst({
            where: {
                id,
            },
        });
        if (!isReviewExits) {
            throw appError_1.AppError.notFound("Review is not found");
        }
        const deletedReview = await this.db.reviews.delete({
            where: {
                id: isReviewExits.id,
            },
        });
        return deletedReview;
    }
    async getProductReviews(product_id) {
        const reviews = await this.db.reviews.findMany({
            where: {
                product_id,
            },
        });
        return reviews;
    }
    /**
     * Remove background from product image
     * @param imageUrl - URL of the image to process
     * @returns Base64 encoded PNG image with transparent background
     */
    async removeBackground(imageUrl) {
        const imageBuffer = await this.removeBgService.removeBackground(imageUrl);
        return `data:image/png;base64,${imageBuffer.toString("base64")}`;
    }
}
exports.ProductService = ProductService;
