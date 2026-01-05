"use server";

import { db } from "@repo/db";

/**
 * Mendapatkan product berdasarkan slug.
 * Akan:
 *   - Mengembalikan data produk
 * @param slug - slug dari product url
 * @returns { product: ProductWithRelations }
 * @throws Error jika produk tidak ditemukan
 */
export const getProductBySlug = async (slug: string) => {
  try {
    const product = await db.product.findFirst({
      where: {
        slug,
      },
      include: {
        supplier: true,
        category: true,
        product_variants: {
          include: {
            inventory: true,
          },
        },
        product_images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error("[getProductBySlug] Error:", error);
  }
};

/**
 * Mendapatkan produk best seller berdasarkan jumlah penjualan.
 * Menghitung dari order yang sudah completed/shipped.
 * @param limit - jumlah produk yang ingin diambil (default: 8)
 * @returns Array produk best seller dengan total terjual
 */
export const getBestSellerProducts = async (limit: number = 8) => {
  try {
    // Ambil order items dari order yang sudah selesai
    const orderItems = await db.orderItems.groupBy({
      by: ["variant_id"],
      where: {
        order: {
          status: {
            in: ["completed", "shipped", "delivered"],
          },
        },
        variant_id: {
          not: null,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit * 2, // ambil lebih banyak karena akan difilter per produk
    });

    if (orderItems.length === 0) {
      // Jika tidak ada penjualan, ambil produk terbaru sebagai fallback
      const latestProducts = await db.product.findMany({
        where: {
          status: "active",
        },
        include: {
          product_images: {
            orderBy: { sort_order: "asc" },
            take: 1,
          },
          category: true,
          reviews: {
            select: { rating: true },
          },
          product_variants: {
            include: {
              inventory: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        take: limit,
      });

      return latestProducts.map((product) => ({
        ...product,
        total_sold: 0,
        avg_rating:
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0,
      }));
    }

    // Ambil variant IDs
    const variantIds = orderItems
      .map((item) => item.variant_id)
      .filter((id): id is string => id !== null);

    // Ambil detail variant untuk mendapatkan product_id
    const variants = await db.productVariants.findMany({
      where: {
        id: { in: variantIds },
      },
      select: {
        id: true,
        product_id: true,
      },
    });

    // Map variant_id ke quantity sold
    const variantSalesMap = new Map(
      orderItems.map((item) => [item.variant_id, item._sum.quantity || 0])
    );

    // Hitung total penjualan per produk
    const productSalesMap = new Map<string, number>();
    for (const variant of variants) {
      const currentSales = productSalesMap.get(variant.product_id) || 0;
      const variantSales = variantSalesMap.get(variant.id) || 0;
      productSalesMap.set(variant.product_id, currentSales + variantSales);
    }

    // Urutkan product_id berdasarkan penjualan
    const sortedProductIds = [...productSalesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId);

    // Ambil detail produk
    const products = await db.product.findMany({
      where: {
        id: { in: sortedProductIds },
        status: "active",
      },
      include: {
        product_images: {
          orderBy: { sort_order: "asc" },
          take: 1,
        },
        category: true,
        reviews: {
          select: { rating: true },
        },
        product_variants: {
          include: {
            inventory: true,
          },
        },
      },
    });

    // Gabungkan dengan data penjualan dan urutkan
    const productsWithSales = products
      .map((product) => ({
        ...product,
        total_sold: productSalesMap.get(product.id) || 0,
        avg_rating:
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0,
      }))
      .sort((a, b) => b.total_sold - a.total_sold);

    return productsWithSales;
  } catch (error) {
    console.error("[getBestSellerProducts] Error:", error);
    return [];
  }
};
