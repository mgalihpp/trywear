"use server";

import { db } from "@repo/db";

/**
 * Mendapatkan semua kategori dengan jumlah produk.
 * @param limit - jumlah kategori yang ingin diambil (default: 5)
 * @returns Array kategori dengan product count
 */
export const getCategories = async (limit: number = 5) => {
  try {
    const categories = await db.categories.findMany({
      where: {
        parent_id: null, // Hanya kategori utama (bukan sub-kategori)
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category._count.products,
    }));
  } catch (error) {
    console.error("[getCategories] Error:", error);
    return [];
  }
};

/**
 * Mendapatkan kategori dengan produk terbaru untuk thumbnail.
 * @param limit - jumlah kategori yang ingin diambil (default: 5)
 * @returns Array kategori dengan thumbnail dari produk
 */
export const getCategoriesWithThumbnail = async (limit: number = 5) => {
  try {
    const categories = await db.categories.findMany({
      where: {
        parent_id: null,
        products: {
          some: {}, // Hanya kategori yang punya produk
        },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        products: {
          take: 1,
          orderBy: {
            created_at: "desc",
          },
          include: {
            product_images: {
              take: 1,
              orderBy: {
                sort_order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category._count.products,
      thumbnail: category.products[0]?.product_images[0]?.url || null,
    }));
  } catch (error) {
    console.error("[getCategoriesWithThumbnail] Error:", error);
    return [];
  }
};
