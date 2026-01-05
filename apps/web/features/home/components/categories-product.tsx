import { Button } from "@repo/ui/components/button";
import { ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { getCategoriesWithThumbnail } from "@/actions/categories";

export async function CategoriesProduct() {
  const categories = await getCategoriesWithThumbnail(3); // Ambil 3 saja, sisanya untuk "Lihat Semua"

  // Jika tidak ada kategori, tampilkan pesan
  if (!categories || categories.length === 0) {
    return (
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-primary font-medium tracking-widest uppercase text-xs mb-2">
              ✦ Kategori ✦
            </p>
            <h2 className="text-xl lg:text-2xl font-bold">
              Belanja Berdasarkan Kategori
            </h2>

          </div>
          <div className="text-center py-8">
            <LayoutGrid className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              Belum ada kategori tersedia
            </p>
            <Button className="mt-3 rounded-full" size="sm" asChild>
              <Link href="/products">Lihat Semua Produk</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6">
          <p className="text-primary font-medium tracking-widest uppercase text-xs mb-1">
            ✦ Kategori ✦
          </p>
          <h2 className="text-xl lg:text-2xl font-bold">
            Belanja Berdasarkan Kategori
          </h2>
          <p className="text-muted-foreground text-sm">
            Pilih kategori untuk memulai belanja
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3 max-w-4xl mx-auto">
          {categories.map((category) => {
            const imageUrl = category.thumbnail;

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative overflow-hidden rounded-lg"
              >
                {/* Background Image */}
                <div className="aspect-[3/4] overflow-hidden bg-secondary">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutGrid className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-white text-sm mb-0.5">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {category.productCount} Produk
                  </p>
                </div>

                {/* Arrow indicator on hover */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ArrowUpRight className="w-3 h-3 text-white" />
                </div>
              </Link>
            );
          })}

          {/* Lihat Semua Card */}
          <Link
            href="/products"
            className="group relative overflow-hidden rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <div className="aspect-[3/4] flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-center mb-1">
                Lihat Semua
              </h3>
              <p className="text-muted-foreground text-xs text-center">
                Kategori Lainnya
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
