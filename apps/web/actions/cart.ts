"use server";

import { db } from "@repo/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Mendapatkan atau membuat cart milik user yang sedang login.
 * @returns Cart object beserta cart_items, atau null jika user tidak login / error
 */
export async function getOrCreateCart() {
  try {
    const data = await auth.api.getSession({
      headers: await headers(),
    });
    if (!data?.user.id) return null;

    let cart = await db.carts.findFirst({
      where: { user_id: data.user.id },
      include: {
        cart_items: {
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

    if (!cart) {
      cart = await db.carts.create({
        data: { user_id: data.user.id },
        include: {
          cart_items: {
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

    return cart;
  } catch (error) {
    console.error("getOrCreateCart error:", error);
    // throw error;
  }
}

/** Input untuk menambah item ke cart */
type AddToCartParams = {
  variant_id: string;
  quantity: number;
};

/**
 * Menambah produk (variant) ke cart.
 * Jika variant sudah ada, quantity akan ditambah.
 * @param params - { variant_id, quantity }
 * @returns CartItem yang baru / yang sudah diupdate, atau null jika gagal
 */
export async function addItemToCart({ variant_id, quantity }: AddToCartParams) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (!variant_id || quantity < 1) return null;

  try {
    const cart = await getOrCreateCart();
    if (!cart) return null;

    const existing = await db.cartItems.findFirst({
      where: {
        cart_id: cart.id,
        variant_id,
      },
    });

    if (existing) {
      return await db.cartItems.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    }

    return await db.cartItems.create({
      data: {
        cart_id: cart.id,
        variant_id,
        quantity,
      },
    });
  } catch (error) {
    console.error("addToCart error:", error);
    // throw error;
  }
}

/** Input untuk update quantity item di cart */
type UpdateQuantityParams = {
  cart_item_id: number;
  quantity: number;
};

/**
 * Update quantity item di cart.
 * Jika quantity <= 0 maka item akan dihapus.
 * @param params - { cart_item_id, quantity }
 * @returns Updated CartItem atau true (jika dihapus), atau null jika gagal
 */
export async function updateQuantity({
  cart_item_id,
  quantity,
}: UpdateQuantityParams) {
  if (!cart_item_id || quantity === undefined) return null;

  try {
    if (quantity <= 0) {
      await db.cartItems.delete({ where: { id: cart_item_id } });
      return true;
    }

    return await db.cartItems.update({
      where: { id: cart_item_id },
      data: { quantity },
    });
  } catch (error) {
    console.error("updateQuantity error:", error);
    return null;
  }
}

/** Input untuk hapus satu item dari cart */
type DeleteCartItemParams = {
  cart_item_id: number;
};

/**
 * Menghapus satu item dari cart.
 * @param params - { cart_item_id }
 * @returns true jika berhasil, false jika item tidak ditemukan / error
 */
export async function deleteCartItem({ cart_item_id }: DeleteCartItemParams) {
  if (!cart_item_id) return false;

  try {
    const item = await db.cartItems.findUnique({ where: { id: cart_item_id } });
    if (!item) return false;

    await db.cartItems.delete({ where: { id: cart_item_id } });
    return true;
  } catch (error) {
    console.error("deleteCartItem error:", error);
    return false;
  }
}

/**
 * Mengosongkan seluruh isi cart user yang sedang login.
 * @returns true jika berhasil atau cart sudah kosong, false jika error
 */
export async function clearCart() {
  try {
    const data = await auth.api.getSession({
      headers: await headers(),
    });
    if (!data?.user?.id) return false;

    const cart = await db.carts.findFirst({
      where: { user_id: data.user.id },
    });

    if (!cart) return true; // tidak ada cart = sudah "kosong"

    await db.cartItems.deleteMany({
      where: { cart_id: cart.id },
    });

    return true;
  } catch (error) {
    console.error("clearCart error:", error);
    return false;
  }
}
