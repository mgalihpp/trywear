"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
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
import { Check, Heart, RefreshCw, Shield, Star, Truck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/features/admin/utils";
import { useCartStore } from "@/features/cart/store/useCartStore";
import {
  findVariant,
  getVariantStock,
  parseOptions,
} from "@/features/product/utils";
import type { ProductWithRelations } from "@/types/index";
import SizeGuideDialog from "./size-guide-dialog";

type ProductInfoProps = {
  product: ProductWithRelations;
};

const colorStyle = {
  Grey: "bg-gray-400",
  Black: "bg-black",
  White: "bg-white border border-border",
  Navy: "bg-blue-950",
  Olive: "bg-green-700",
  Blue: "bg-blue-200",
};

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addToCart } = useCartStore();
  const opts_value = parseOptions(product.product_variants[0]?.option_values);
  const [selectedSize, setSelectedSize] = useState(opts_value.size ?? "S");
  const [selectedColor, setSelectedColor] = useState(
    opts_value?.color ?? "default",
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { items } = useCartStore();

  const inWishlist = false;

  const selectedVariant = findVariant(product, selectedSize, selectedColor);
  const availableStock = selectedVariant ? getVariantStock(selectedVariant) : 0;
  const inStock = availableStock > 0;
  const cartItem = items.find(
    (i) => i.id === product.id && i.variant_id === selectedVariant?.id,
  );
  const inCart = !!cartItem;
  const cartQuantity = cartItem?.quantity ?? 0;
  const canAddMore = quantity < availableStock - cartQuantity;

  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  const sizes = [
    ...new Set(
      product.product_variants
        .map((v) => parseOptions(v.option_values)?.size)
        .filter(Boolean),
    ),
  ].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

  const colors = [
    ...new Set(
      product.product_variants
        .map((v) => parseOptions(v.option_values)?.color)
        .filter(Boolean),
    ),
  ];

  const parsedOptionValues = selectedVariant
    ? parseOptions(selectedVariant.option_values)
    : null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      variant_id: selectedVariant?.id as string,
      image: product.product_images?.[0]?.url as string,
      name: product.title,
      quantity: quantity,
      price:
        Number(product.price_cents) +
        Number(selectedVariant?.additional_price_cents),
      size: selectedSize,
      color: selectedColor,
      storage:
        selectedVariant?.inventory[0]?.stock_quantity.toString() ?? undefined,
    });

    toast.success("Added to cart");
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="hidden sm:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
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

          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 hover:bg-secondary"
          >
            <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-current" />
            ))}
          </div>

          <span className="text-sm">
            <span className="font-semibold">
              {product.reviews.reduce((a, r) => a + r.rating, 0)}
            </span>
            <span className="text-muted-foreground"> (847 reviews)</span>
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold">
            {formatCurrency(Number(product.price_cents))}
          </p>

          <div className="flex items-center gap-2 text-sm">
            {inStock ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
            <span className="font-medium">
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Size</p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="text-xs underline hover:no-underline"
            >
              Size Guide
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setSelectedSize(size)}
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
          <p className="text-sm font-semibold">Color</p>

          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setSelectedColor(color)}
                aria-label={color}
                className={`
                  relative w-10 h-10 rounded-full transition-all
                  ${colorStyle[color as keyof typeof colorStyle] || "bg-gray-300"}
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
        <p className="text-sm font-semibold">Quantity</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
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
                setQuantity(Math.min(availableStock, quantity + 1))
              }
              disabled={quantity >= availableStock}
              className="px-4 py-2 hover:bg-secondary"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold"
          onClick={handleAddToCart}
          disabled={!inStock || !canAddMore}
        >
          {canAddMore ? (inCart ? "Add More" : "Add to Cart") : "Sold Out"}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="w-full h-14 text-base font-semibold border-2 hover:bg-foreground hover:text-background"
          disabled={!inStock || !canAddMore}
        >
          Buy Now
        </Button>
      </div>

      <Separator />

      {/* Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
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
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over Rp 500.000
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <RefreshCw className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">30-Day Returns</p>
                  <p className="text-xs text-muted-foreground">
                    Hassle-free return policy
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Shield className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Quality Guarantee</p>
                  <p className="text-xs text-muted-foreground">
                    Premium materials & craftsmanship
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SizeGuideDialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </div>
  );
};

export default ProductInfo;
