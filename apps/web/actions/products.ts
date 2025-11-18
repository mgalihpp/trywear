"use server";

import { db } from "@repo/db";

export const getProductBySlug = async (slug: string) => {
  try {
    const product = await db.product.findFirst({
      where: {
        slug,
      },
      include: {
        category: true,
        product_variants: {
          include: {
            inventory: true,
          },
        },
        product_images: true,
        reviews: true,
      },
    });

    return product;
  } catch (error) {
    console.error(error);
  }
};
