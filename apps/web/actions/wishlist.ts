"use server";

import { db } from "@repo/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getOrCreateWishlist() {
  try {
    const data = await auth.api.getSession({
      headers: await headers(),
    });
    if (!data?.user.id) return null;

    let wishlist = await db.wishlist.findFirst({
      where: { user_id: data.user.id },
      include: {
        wishlist_items: {
          include: {
            variant: {
              include: {
                inventory: true,
                product: {
                  include: {
                    product_images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { user_id: data.user.id },
        include: {
          wishlist_items: {
            include: {
              variant: {
                include: {
                  inventory: true,
                  product: {
                    include: {
                      product_images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return wishlist;
  } catch (error) {
    console.error("getOrCreateWishlist error:", error);
    // throw error;
  }
}

type AddToWishlistParams = {
  variant_id: string;
};

export async function addItemToWishlist({ variant_id }: AddToWishlistParams) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (!variant_id) return null;

  try {
    const wishlist = await getOrCreateWishlist();
    if (!wishlist) return null;

    const existing = await db.wishlistItems.findFirst({
      where: {
        wishlist_id: wishlist.id,
        variant_id,
      },
    });

    if (existing) {
      return;
    }

    return await db.wishlistItems.create({
      data: {
        wishlist_id: wishlist.id,
        variant_id,
      },
    });
  } catch (error) {
    console.error("addToWishlist error:", error);
    // throw error;
  }
}

type DeleteWishlistItemParams = {
  wishlist_item_id: number;
};

export async function deleteWishlistItem({
  wishlist_item_id,
}: DeleteWishlistItemParams) {
  if (!wishlist_item_id) return false;

  try {
    const item = await db.wishlistItems.findUnique({
      where: { id: wishlist_item_id },
    });
    if (!item) return false;

    await db.wishlistItems.delete({ where: { id: wishlist_item_id } });
    return true;
  } catch (error) {
    console.error("deleteWishlistItem error:", error);
    return false;
  }
}
