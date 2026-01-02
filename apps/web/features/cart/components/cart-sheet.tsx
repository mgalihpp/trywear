"use client";

import { Button } from "@repo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Loader2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import {
  deleteCartItem,
  getOrCreateCart,
  updateQuantity as updateCartItemQuantity,
} from "@/actions/cart";
import { formatCurrency } from "@/features/admin/utils";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useServerAction } from "@/hooks/useServerAction";

const CartSheet = () => {
  const {
    items,
    loading: isCartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    setLoading,
    totalItems,
    totalPrice,
  } = useCartStore();
  const [runGetOrCreateCartAction] = useServerAction(getOrCreateCart);
  const [runUpdateCartItemQuantityAction] = useServerAction(
    updateCartItemQuantity,
  );
  const [runDeleteCartItemAction, isDeleting] = useServerAction(deleteCartItem);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const loadCart = async () => {
      if (items.length > 0) return;
      setLoading(true);
      const cart = await runGetOrCreateCartAction({});
      if (!cart?.cart_items?.length) {
        setLoading(false);
        return;
      }

      const cartItems = cart.cart_items.map((ci) => {
        const variant = ci.variant;
        const product = variant.product;

        // Ambil gambar pertama yang sort_order terkecil
        const imageUrl =
          product.product_images.sort((a, b) => a.sort_order - b.sort_order)[0]
            ?.url || "/placeholder.jpg";

        // Gabung harga produk + additional harga variant
        const totalPriceCents =
          Number(product.price_cents) + Number(variant.additional_price_cents);

        return {
          id: product.id,
          cart_item_id: ci.id,
          variant_id: ci.variant_id,
          name: product.title,
          image: imageUrl,
          price: totalPriceCents, // simpan dalam cents dulu atau langsung konversi ke rupiah?
          quantity: ci.quantity,
          color: (variant.option_values as any)?.color || undefined,
          size: (variant.option_values as any)?.size || undefined,
          storage: variant.inventory[0]?.stock_quantity.toString(),
        };
      });
      cartItems.forEach((ci) => {
        addToCart(ci);
      });

      setLoading(false);
    };

    loadCart();
  }, []);

  if (isCartLoading) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-foreground text-background text-xs flex items-center justify-center font-bold rounded-full">
                {totalItems()}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-lg flex flex-col p-4">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Keranjang</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto py-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 pb-6 border-b animate-pulse">
                <Skeleton className="w-24 h-24 rounded-md" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center justify-between mt-3">
                    <Skeleton className="h-9 w-28 rounded-lg" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalItems() > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-foreground text-background text-xs flex items-center justify-center font-bold">
              {totalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-4">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Keranjang</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Keranjang Anda kosong</p>
              <Button asChild>
                <Link href="/">Mulai Belanja</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-6 space-y-6">
              {items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex gap-4 pb-6 border-b border-border"
                >
                  <div className="w-24 h-24 bg-secondary border border-border">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={isDeleting}
                        onClick={async () => {
                          removeFromCart(item.cart_item_id, item.variant_id);
                          await runDeleteCartItemAction({
                            cart_item_id: item.cart_item_id,
                          });
                        }}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                    {item.color && (
                      <p className="text-xs text-muted-foreground">
                        Warna: {item.color}
                      </p>
                    )}
                    {item.size && (
                      <p className="text-xs text-muted-foreground">
                        Ukuran: {item.size}
                      </p>
                    )}
                    {item.storage && (
                      <p className="text-xs text-muted-foreground">
                        Stok: {item.storage}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0"
                          onClick={async () => {
                            const newQty = item.quantity - 1;

                            if (newQty > 0) {
                              updateQuantity(
                                item.cart_item_id,
                                item.variant_id,
                                newQty,
                              );
                            } else {
                              removeFromCart(
                                item.cart_item_id,
                                item.variant_id,
                              );
                            }

                            if (newQty <= 0) {
                              await runDeleteCartItemAction({
                                cart_item_id: item.cart_item_id,
                              });
                            } else {
                              await runUpdateCartItemQuantityAction({
                                cart_item_id: item.cart_item_id,
                                quantity: newQty,
                              });
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 p-0"
                          onClick={async () => {
                            const newQty = item.quantity + 1;

                            updateQuantity(
                              item.cart_item_id,
                              item.variant_id,
                              newQty,
                            );

                            await runUpdateCartItemQuantityAction({
                              cart_item_id: item.cart_item_id,
                              quantity: newQty,
                            });
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalPrice())}</span>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full h-12">
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-12">
                  <Link href="/cart">Lihat Keranjang</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
