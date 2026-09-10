import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { ProductCard } from "@/components/product/product-card";
import { getCategoryBySlug } from "@/lib/data/cms";
import { listProducts } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/settings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} from BERRIVA.`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [{ items }, settings] = await Promise.all([listProducts({ category: slug, pageSize: 24 }), getSiteSettings()]);

  return (
    <>
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <p className="eyebrow">Category</p>
          <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">{category.name}</h1>
          {category.description ? <p className="mt-3 max-w-2xl text-[#5d4d45]">{category.description}</p> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} currencySymbol={settings.currencySymbol} />
          ))}
        </div>
      </main>
    </>
  );
}
