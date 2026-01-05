import { Button } from "@repo/ui/components/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
          alt="CTA Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 mb-6">
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="text-xs text-white font-medium">
              Koleksi Terbaru Tersedia
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4">
            Mulai Belanja Sekarang
          </h2>

          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            Temukan koleksi fashion terbaik dengan kualitas premium dan harga
            terjangkau. Jangan lewatkan kesempatan ini!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="sm"
              className="h-10 px-6 text-sm font-semibold bg-white text-primary hover:bg-white/90 rounded-full group"
              asChild
            >
              <Link href="/products">
                Jelajahi Produk
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-10 px-6 text-sm font-semibold bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary rounded-full"
              asChild
            >
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-white/70 text-xs">
            <span className="flex items-center gap-1">
              <span className="text-white">✓</span> Produk Original
            </span>
            <span className="flex items-center gap-1">
              <span className="text-white">✓</span> Pembayaran Aman
            </span>
            <span className="flex items-center gap-1">
              <span className="text-white">✓</span> Garansi Kualitas
            </span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-6 left-6 w-20 h-20 border border-white/10 rounded-full hidden lg:block" />
      <div className="absolute bottom-6 right-6 w-28 h-28 border border-white/10 rounded-full hidden lg:block" />
    </section>
  );
}
