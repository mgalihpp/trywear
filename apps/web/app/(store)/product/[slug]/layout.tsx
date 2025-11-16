import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getProductBySlug } from "@/actions/products";

type Props = {
  params: Promise<{ slug: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const { slug } = await params;

  // fetch data
  const product = await getProductBySlug(slug);

  if (!product) return notFound();

  if (!product.product_images[0]) {
    return {
      title: product.title,
      description: product.description,
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.product_images[0].url, ...previousImages],
    },
  };
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
