import { Skeleton } from "@repo/ui/components/skeleton";

// Skeleton untuk Featured Product
export function FeaturedProductSkeleton() {
  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center mb-10">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-8 w-48 mx-auto mb-3" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-secondary/30">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Skeleton untuk Categories
export function CategoriesSkeleton() {
  return (
    <section className="py-12 lg:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center mb-6">
          <Skeleton className="h-4 w-24 mx-auto mb-2" />
          <Skeleton className="h-7 w-56 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Skeleton untuk Testimonials
export function TestimonialsSkeleton() {
  return (
    <section className="py-12 lg:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center mb-10">
          <Skeleton className="h-4 w-32 mx-auto mb-3" />
          <Skeleton className="h-8 w-44 mx-auto mb-3" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background rounded-xl p-5 border border-border"
            >
              <Skeleton className="w-8 h-8 rounded-lg mb-4" />
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="w-3.5 h-3.5 rounded" />
                ))}
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5 mb-4" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
