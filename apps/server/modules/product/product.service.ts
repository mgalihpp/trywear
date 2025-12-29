import type { Prisma, Product } from "@repo/db";
import type {
  CreateProductImagesInput,
  CreateProductReviewInput,
  ListProductQueryInput,
  UpdateProductInput,
} from "@repo/schema/productSchema";
import { HTTPSTATUS } from "@/configs/http";
import { AppError } from "@/utils/appError";
import { BaseService } from "../service";
import { ProductVariantsService } from "../variant/variant.service";

export class ProductService extends BaseService<Product, "product"> {
  variantService: ProductVariantsService;
  constructor() {
    super("product");
    this.variantService = new ProductVariantsService();
  }

  findAll = async (q?: ListProductQueryInput) => {
    // Filter status: "active" hanya untuk store (ketika ada query params)
    // Admin dashboard memanggil findAll tanpa params sehingga bisa melihat semua produk
    const where: Prisma.ProductWhereInput = q ? { status: "active" } : {};

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
          AND: [colorCond, sizeCond].filter(Boolean) as [], // kalo salah satu null, otomatis di-skip
        },
      };
    }

    if (q.query?.trim()) {
      where.OR = [
        { title: { contains: q.query, mode: "insensitive" } },
        { description: { contains: q.query, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | undefined;
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

  findById = async (id: string) => {
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
  findSimilarProducts = async (product_id: string, limit: number = 8) => {
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
      throw AppError.notFound("Product not found");
    }

    // 2. Ambil color & size dari variant pertama (paling aman)
    const firstVariant = product.product_variants[0];
    const optionValues = firstVariant?.option_values as any; // atau JsonObject

    const color = optionValues?.color as string | undefined;
    const size = optionValues?.size as string | undefined;

    // 3. Bangun kondisi where: prioritas color sama > kategori sama
    const where: any = {
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

  async update(id: string, data: UpdateProductInput) {
    // Cek apakah productnya ada
    const product = await this.db[this.model].findFirst({
      where: {
        id,
      },
    });

    if (!product) {
      throw AppError.notFound();
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

  async createImages(data: CreateProductImagesInput) {
    const productId = data[0].product_id;

    const product = await this.db[this.model].findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw AppError.notFound("Product Not Found");
    }

    return await this.db.productImages.createMany({
      data: data.map((image) => ({
        ...image,
      })),
    });
  }

  async deleteImage(imageId: number) {
    if (!imageId) return null;

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

  async createReview(user_id: string, data: CreateProductReviewInput) {
    const existingReview = await this.db.reviews.findFirst({
      where: {
        user_id,
        product_id: data.product_id,
      },
      select: { id: true },
    });

    if (existingReview) {
      throw AppError.httpException(
        "Kamu sudah memberi ulasan untuk produk ini",
        HTTPSTATUS.CONFLICT,
      );
    }

    const newReview = await this.db.reviews.create({
      data: {
        user_id,
        ...data,
      },
    });

    return newReview;
  }

  async deleteReview(id: string) {
    const isReviewExits = await this.db.reviews.findFirst({
      where: {
        id,
      },
    });

    if (!isReviewExits) {
      throw AppError.notFound("Review is not found");
    }

    const deletedReview = await this.db.reviews.delete({
      where: {
        id: isReviewExits.id,
      },
    });

    return deletedReview;
  }

  async getProductReviews(product_id: string) {
    const reviews = await this.db.reviews.findMany({
      where: {
        product_id,
      },
    });

    return reviews;
  }
}
