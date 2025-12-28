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
