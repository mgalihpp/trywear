"use client";

import { Button } from "@repo/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatCurrency } from "@/features/admin/utils";
import { ProductGrid } from "@/features/search/components/product-grid";
import { api } from "@/lib/api";

// import { useWishlist } from "@/contexts/WishlistContext";

type RelatedProductsProps = {
  productId: string;
};

const RelatedProducts = ({ productId }: RelatedProductsProps) => {
  //   const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  const {
    data: relatedProducts,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["related-products", productId],
    queryFn: () => api.product.getRelatedProducts(productId),
  });

  const handleWishlist = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    // if (isInWishlist(product.id)) {
    //   removeFromWishlist(product.id);
    //   toast.success("Removed from wishlist");
    // } else {
    //   addToWishlist({
    //     id: product.id,
    //     name: product.name,
    //     price: product.price,
    //     image: product.image,
    //     inStock: true,
    //   });
    toast.success("Added to wishlist");
    // }
  };

  return (
    <section className="border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-12">You Might Also Like</h2>

        {isPending ? (
          <></>
        ) : isError ? (
          <></>
        ) : (
          // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          //   {relatedProducts.map((product) => (
          //     <div
          //       key={product.id}
          //       className="group relative bg-background border border-border hover:border-foreground transition-all"
          //     >
          //       <Button
          //         variant="ghost"
          //         size="icon"
          //         className="absolute top-2 right-2 z-10 h-10 w-10 bg-background/80 hover:bg-background"
          //         onClick={(e) => handleWishlist(product, e)}
          //       >
          //         <Heart
          //         //   className={`h-5 w-5 ${
          //         //     isInWishlist(product.id) ? "fill-current" : ""
          //         //   }`}
          //         />
          //       </Button>

          //       <Link href={`/product/${product.id}`} className="block">
          //         <div className="aspect-square bg-secondary overflow-hidden">
          //           <img
          //             src={product.product_images[0]?.url}
          //             alt={product.title}
          //             className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          //           />
          //         </div>

          //         <div className="p-4 space-y-2">
          //           <h3 className="font-medium text-sm">{product.title}</h3>
          //           <div className="flex items-center gap-1">
          //             {[1, 2, 3, 4, 5].map((star) => (
          //               <Star key={star} className="w-3 h-3 fill-current" />
          //             ))}
          //             <span className="text-xs text-muted-foreground ml-1">
          //               {/* {product.rating} */}
          //             </span>
          //           </div>
          //           <p className="font-bold text-base">
          //             {formatCurrency(Number(product.price_cents))}
          //           </p>
          //         </div>
          //       </Link>
          //     </div>
          //   ))}
          // </div>
          <ProductGrid products={relatedProducts} />
        )}
      </div>
    </section>
  );
};

export default RelatedProducts;
