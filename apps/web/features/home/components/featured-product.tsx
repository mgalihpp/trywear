import { Button } from "@repo/ui/components/button";
import { ArrowRight, Heart, Package, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { getBestSellerProducts } from "@/actions/products";

// Helper untuk format harga ke Rupiah
const formatPrice = (cents: bigint | number) => {
  const price = typeof cents === "bigint" ? Number(cents) : cents;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export async function FeaturedProduct() {
  const featuredProducts = await getBestSellerProducts(2);

  // Jika tidak ada produk, tampilkan pesan
  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-primary font-medium tracking-widest uppercase text-xs mb-3">
              ✦ Best Sellers ✦
            </p>
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3">
              Produk Unggulan
            </h2>
          </div>
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Belum ada produk unggulan saat ini
            </p>
            <Button className="mt-4 rounded-full" size="sm" asChild>
              <Link href="/products">Jelajahi Produk</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-primary font-medium tracking-widest uppercase text-xs mb-3">
            ✦ Best Sellers ✦
          </p>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3">
            Produk Unggulan
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Pilihan terbaik yang paling banyak diminati oleh pelanggan kami
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
          {featuredProducts.map((product, index) => {
            const imageUrl =
              product.product_images[0]?.url ||
              "https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image";
            const reviewCount = product.reviews?.length || 0;

            return (
              <div key={product.id} className="group relative">
                {/* Product Card */}
                <div className="relative bg-[#f1f0f0] rounded-2xl overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Quick actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-white/80 backdrop-blur-sm border-0 h-9 w-9 shadow-md hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full bg-white/80 backdrop-blur-sm border-0 h-9 w-9 shadow-md hover:bg-white"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-xs">
                        {product.avg_rating > 0
                          ? product.avg_rating.toFixed(1)
                          : "5.0"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({reviewCount})
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Category */}
                    {product.category && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {product.category.name}
                      </p>
                    )}

                    <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">
                        {formatPrice(product.price_cents)}
                      </p>

                      <Button
                        size="sm"
                        className="rounded-full h-8 px-4 text-xs font-medium"
                        asChild
                      >
                        <Link href={`/products/${product.slug}`}>
                          Beli
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Decorative number */}
                <div className="absolute -top-3 -right-3 text-[80px] font-bold text-muted/10 pointer-events-none leading-none hidden lg:block">
                  0{index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-6 rounded-full font-semibold border-2"
            asChild
          >
            <Link href="/products">
              Lihat Semua Produk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
