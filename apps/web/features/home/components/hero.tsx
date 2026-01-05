"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center max-sm:-mt-20 -mt-10">
      {/* Full-width background image - fixed for zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80')",
        }}
      />
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1] mb-8">
            Temukan
            <br />
            Gayamu
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200">
              Sendiri
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
            Temukan koleksi fashion premium yang membuat penampilanmu semakin
            memukau. Kualitas terbaik, harga terjangkau.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-white text-black hover:bg-white/90 rounded-full group"
              asChild
            >
              <Link href="/products">
                Jelajahi Produk
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            {/* <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-white/10 border-2 border-white text-white hover:bg-white hover:text-black rounded-full transition-colors"
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              Lihat Lookbook
            </Button> */}
          </div>

          {/* Product Stats */}
          <div className="flex flex-wrap items-center gap-8 lg:gap-12 text-white/80">
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">10+</p>
              <p className="text-sm lg:text-base">Produk</p>
            </div>
            <div className="w-px h-10 lg:h-12 bg-white/20" />
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">100+</p>
              <p className="text-sm lg:text-base">Pelanggan Puas</p>
            </div>
            <div className="w-px h-10 lg:h-12 bg-white/20" />
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">20+</p>
              <p className="text-sm lg:text-base">Koleksi Eksklusif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
};
