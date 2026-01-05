"use client";

import type { ProductImages } from "@repo/db";
import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type ProductGalleryProps = {
  images: ProductImages[];
};

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-secondary overflow-hidden group">
        <img
          src={images[selectedImage]?.url}
          alt="Essential Grey Hoodie"
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prevImage}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextImage}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        {/* Image Counter */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/90 text-xs font-medium">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square bg-secondary overflow-hidden transition-all ${
              selectedImage === index
                ? "ring-2 ring-foreground ring-offset-2"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={image.url}
              alt={`View ${image.alt}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
