import { Suspense } from "react";
import { CategoriesProduct } from "@/features/home/components/categories-product";
import { CTA } from "@/features/home/components/cta";
import { FeaturedProduct } from "@/features/home/components/featured-product";
import { Hero } from "@/features/home/components/hero";
import {
  CategoriesSkeleton,
  FeaturedProductSkeleton,
  TestimonialsSkeleton,
} from "@/features/home/components/skeletons";
import { Testimonials } from "@/features/home/components/testimonials";
import { WhyChooseUs } from "@/features/home/components/why-choose-us";

export default function Home() {
  return (
    <main>
      <Hero />

      <Suspense fallback={<FeaturedProductSkeleton />}>
        <FeaturedProduct />
      </Suspense>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesProduct />
      </Suspense>

      <WhyChooseUs />

      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      <CTA />
    </main>
  );
}
