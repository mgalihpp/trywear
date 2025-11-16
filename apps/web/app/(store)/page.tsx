import { CategoriesProduct } from "@/features/home/components/categories-product";
import { CTA } from "@/features/home/components/cta";
import { FeaturedProduct } from "@/features/home/components/featured-product";
import { Hero } from "@/features/home/components/hero";
import { WhyChooseUs } from "@/features/home/components/why-choose-us";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProduct />
      <CategoriesProduct />
      <WhyChooseUs />
      <CTA />
    </main>
  );
}
