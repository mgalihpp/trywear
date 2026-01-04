/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import type { Reviews } from "@repo/db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Camera, Check, RefreshCw, Shield, Star, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addItemToCart } from "@/actions/cart";
import { formatCurrency } from "@/features/admin/utils";
import { useCartStore } from "@/features/cart/store/useCartStore";
import {
  findVariant,
  getVariantStock,
  parseOptions,
} from "@/features/product/utils";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { useServerAction } from "@/hooks/useServerAction";
import type { ProductWithRelations } from "@/types/index";
import SizeGuideDialog from "./size-guide-dialog";
import VirtualTryOnDialog from "./virtual-try-on-dialog";

type ProductInfoProps = {
  product: ProductWithRelations;
};

const colorStyle: Record<string, string> = {
  Grey: "bg-gray-400",
  Black: "bg-black",
  White: "bg-white border border-border",
  Navy: "bg-blue-950",
  Olive: "bg-green-700",
  Blue: "bg-blue-200",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addToCart, items } = useCartStore();
  const router = useRouter();

  // Initial selected size & color dari variant pertama (kalau ada)
  const initialOptionValues = parseOptions(
    product.product_variants[0]?.option_values,
  );

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    initialOptionValues?.size,
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    initialOptionValues?.color,
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [runAddItemToCartAction, isAddItemToCartPending] =
    useServerAction(addItemToCart);

  // -------------------------
  // Derived data
  // -------------------------

  const sizes = useMemo(() => {
    const sizeSet = new Set<string>();

    for (const variant of product.product_variants) {
      const options = parseOptions(variant.option_values);
      if (options?.size) sizeSet.add(options.size);
    }

    return Array.from(sizeSet).sort(
      (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
    );
  }, [product]);

  const colors = useMemo(() => {
    const colorSet = new Set<string>();

    for (const variant of product.product_variants) {
      const options = parseOptions(variant.option_values);
      if (options?.color) colorSet.add(options.color);
    }

    return Array.from(colorSet);
  }, [product]);

  const selectedVariant = findVariant(product, selectedSize, selectedColor);

  const availableStock = selectedVariant ? getVariantStock(selectedVariant) : 0;

  const cartItem = items.find(
    (i) => i.id === product.id && i.variant_id === selectedVariant?.id,
  );
  const inCart = !!cartItem;
  const cartQuantity = cartItem?.quantity ?? 0;

  // Sisa stok yang masih boleh ditambah (total stok - yang sudah ada di cart)
  const remainingStock = Math.max(availableStock - cartQuantity, 0);
  const inStock = remainingStock > 0;
  const canAddMore = remainingStock > 0;

  const parsedOptionValues = useMemo(
    () =>
      selectedVariant
        ? parseOptions(selectedVariant.option_values)
        : initialOptionValues,
    [selectedVariant, initialOptionValues],
  );

  // -------------------------
  // Handlers
  // -------------------------

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Pilih ukuran dan warna terlebih dahulu.");
      return;
    }

    if (!inStock || !canAddMore) {
      toast.error("Stok produk tidak mencukupi.");
      return;
    }

    const safeQuantity = Math.min(quantity, remainingStock || 1);

    const cart_item = await runAddItemToCartAction({
      variant_id: selectedVariant.id as string,
      quantity: safeQuantity,
    });

    if (!cart_item) {
      toast.error("Gagal menambahkan ke keranjang.");
      return;
    }

    addToCart({
      id: product.id,
      cart_item_id: cart_item.id as number,
      variant_id: selectedVariant.id as string,
      image: product.product_images?.[0]?.url as string,
      name: product.title,
      quantity: safeQuantity,
      price:
        Number(product.price_cents) +
        Number(selectedVariant.additional_price_cents),
      size: selectedSize,
      color: selectedColor,
      stock_quantity: availableStock,
    });

    toast.success("Ditambahkan ke Keranjang");
  };

  // -------------------------
  // Render
  // -------------------------

  const renderStars = (reviews: Reviews[]) => {
    const total =
      reviews?.reduce((acc, review) => acc + (review.rating || 0), 0) || 0;
    const count = reviews?.length || 0;
    const avgRating = count > 0 ? total / count : 0;
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;

    return (
      <>
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star
              key={`full-${i}`}
              className="w-3 h-3 fill-current text-yellow-500"
            />
          ))}
        {hasHalfStar && (
          <Star key="half" className="w-3 h-3 fill-current text-yellow-400" />
        )}
        {Array(5 - fullStars - (hasHalfStar ? 1 : 0))
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
          ))}
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="hidden sm:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Produk</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {parsedOptionValues?.color && (
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                {parsedOptionValues.color}
              </p>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {product.title}
            </h1>
          </div>
          <WishlistButton product={product} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1">{renderStars(product.reviews)}</div>

          <span className="text-sm">
            <span className="font-semibold">
              {product.reviews.reduce((a, r) => a + r.rating, 0)}
            </span>
            <span className="text-muted-foreground">
              {" "}
              ({product.reviews.length} Ulasan)
            </span>
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold">
            {formatCurrency(
              Number(product.price_cents) +
                (selectedVariant
                  ? Number(selectedVariant.additional_price_cents)
                  : 0),
            )}
          </p>

          <div className="flex items-center gap-2 text-sm">
            {inStock ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
            <span className="font-medium">
              {inStock ? "Tersedia" : "Stok Habis"}
            </span>
            {inStock && (
              <Badge variant="secondary" className="text-xs">
                Stok {remainingStock}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Ukuran</p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="text-xs underline hover:no-underline"
            >
              Panduan Ukuran
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setSelectedSize(size)}
                aria-pressed={size === selectedSize}
                className={`py-3 text-sm font-medium border transition-all ${
                  size === selectedSize
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">Warna</p>

          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setSelectedColor(color)}
                aria-label={color}
                aria-pressed={selectedColor === color}
                className={`
                  relative w-10 h-10 rounded-full transition-all
                  ${
                    colorStyle[color as keyof typeof colorStyle] ||
                    "bg-gray-300"
                  }
                  ${
                    selectedColor === color
                      ? "ring-2 ring-foreground ring-offset-2"
                      : "hover:scale-110"
                  }
                `}
              >
                {selectedColor === color && (
                  <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-4">
        <p className="text-sm font-semibold">Kuantitas</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 hover:bg-secondary"
            >
              -
            </button>

            <span className="px-6 py-2 font-medium border-x border-border">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((prev) => Math.min(prev + 1, remainingStock || 1))
              }
              disabled={!inStock || quantity >= remainingStock}
              className="px-4 py-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Virtual Try-On */}
      <Button
        size="lg"
        variant="secondary"
        className="w-full h-12 text-base font-medium gap-2"
        onClick={() => setTryOnOpen(true)}
      >
        <Camera className="w-5 h-5" />
        Coba Virtual Try-On
      </Button>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold"
          onClick={handleAddToCart}
          disabled={!canAddMore || isAddItemToCartPending}
        >
          {isAddItemToCartPending
            ? "Menambahkan..."
            : canAddMore
              ? inCart
                ? "Tambah"
                : "Tambahkan ke Keranjang"
              : "Out of Stock"}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full h-14 text-base font-semibold border-2 hover:bg-foreground hover:text-background"
          disabled={!canAddMore || isAddItemToCartPending}
          onClick={async () => {
            if (!selectedVariant) {
              toast.error("Pilih ukuran dan warna terlebih dahulu.");
              return;
            }

            if (!inStock || !canAddMore) {
              toast.error("Stok produk tidak mencukupi.");
              return;
            }

            const safeQuantity = Math.min(quantity, remainingStock || 1);

            const cart_item = await runAddItemToCartAction({
              variant_id: selectedVariant.id as string,
              quantity: safeQuantity,
            });

            if (!cart_item) {
              toast.error("Gagal menambahkan ke keranjang.");
              return;
            }

            addToCart({
              id: product.id,
              cart_item_id: cart_item.id as number,
              variant_id: selectedVariant.id as string,
              image: product.product_images?.[0]?.url as string,
              name: product.title,
              quantity: safeQuantity,
              price:
                Number(product.price_cents) +
                Number(selectedVariant.additional_price_cents),
              size: selectedSize,
              color: selectedColor,
              stock_quantity: availableStock,
            });

            // Redirect to checkout
            router.push("/checkout");
          }}
        >
          Beli Sekarang
        </Button>
      </div>

      <Separator />

      {/* Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger>Deskripsi</AccordionTrigger>
          <AccordionContent>
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger>Features</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <Truck className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Gratis Pengiriman</p>
                  <p className="text-xs text-muted-foreground">
                    Jika pesanan lebih dari Rp 500.000
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <RefreshCw className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Pengembalian 30 Hari</p>
                  <p className="text-xs text-muted-foreground">
                    Kebijakan pengembalian tanpa repot
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Shield className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Jaminan Kualitas</p>
                  <p className="text-xs text-muted-foreground">
                    Bahan dan pengerjaan premium
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
      <VirtualTryOnDialog
        open={tryOnOpen}
        onOpenChange={setTryOnOpen}
        productImage={product.product_images?.[0]?.url}
        productName={product.title}
      />
    </div>
  );
};

export default ProductInfo;
