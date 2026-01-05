"use server";

import { db } from "@repo/db";

/**
 * Mendapatkan review terbaru untuk testimonials
 * @param limit - jumlah review yang ingin diambil (default: 3)
 * @returns Array review dengan user dan product info
 */
export const getLatestReviews = async (limit: number = 3) => {
  try {
    const reviews = await db.reviews.findMany({
      where: {
        status: "approved",
        rating: {
          gte: 4, // Hanya review dengan rating 4 atau 5
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      createdAt: review.created_at,
      user: {
        id: review.user.id,
        name: review.user.name,
        image: review.user.image,
      },
      product: review.product
        ? {
            id: review.product.id,
            title: review.product.title,
            slug: review.product.slug,
          }
        : null,
    }));
  } catch (error) {
    console.error("[getLatestReviews] Error:", error);
    return [];
  }
};
