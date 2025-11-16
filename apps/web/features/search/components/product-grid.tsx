"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { formatCurrency } from "@/features/admin/utils";
import type { ProductWithRelations } from "@/types/index";

export const ProductGrid = memo(function ProductGrid({
  products,
}: {
  products: ProductWithRelations[];
}) {
  if (products.length === 0)
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">
          Tidak ada produk ditemukan
        </p>
      </div>
    );

  return (
    <div className="lg:col-span-3">
      {/* <p className="text-muted-foreground mb-4">
        {products.length} produk ditemukan
      </p> */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="group relative transition-all"
          >
            <div className="overflow-hidden">
              <img
                src={p.product_images[0]?.url || "/placeholder.png"}
                alt={p.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="py-4 space-y-2">
              <h3 className="font-medium text-sm line-clamp-2">{p.title}</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 fill-current" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {/* {p.reviews.reduce((acc, review) => acc + review.rating, 0) /
                    p.reviews.length}{" "}
                  ({p.reviews.length}) */}
                  0
                </span>
              </div>
              <p className="font-bold text-base">
                {formatCurrency(Number(p.price_cents))}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});
