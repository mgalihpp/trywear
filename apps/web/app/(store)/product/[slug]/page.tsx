import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/products";
import ProductGallery from "@/features/product/components/product-gallery";
import ProductInfo from "@/features/product/components/product-info";
import ProductTabs from "@/features/product/components/product-tabs";
import RelatedProducts from "@/features/product/components/related-product";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) return notFound();

  return (
    <main>
      <section className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          <ProductGallery images={product.product_images} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductInfo product={product} />
          </div>
        </div>
        <ProductTabs product={product} />
        <RelatedProducts productId={product.id} />
      </section>
    </main>
  );
}
