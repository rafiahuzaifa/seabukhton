import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import type { Metadata } from "next";

import { Header } from "@/components/header";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { AddAllToBag } from "@/components/product/add-all-to-bag";
import { ReviewForm } from "@/components/product/review-form";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getSiteSettings, formatPrice } from "@/lib/data/settings";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    alternates: { canonical: product.canonicalUrl ?? `/product/${product.slug}` },
    openGraph: {
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.shortDescription ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getSiteSettings(),
  ]);

  await prisma.productView.create({ data: { productId: product.id } }).catch(() => {});

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: salePrice ?? price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/product/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: Number(product.rating), reviewCount: product.reviewCount }
        : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: "/shop" },
      product.category
        ? { "@type": "ListItem", position: 2, name: product.category.name, item: `/shop?category=${product.category.slug}` }
        : null,
      { "@type": "ListItem", position: 3, name: product.name, item: `/product/${product.slug}` },
    ].filter(Boolean),
  };

  return (
    <>
      <Header />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="container py-10 md:py-14">
        <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#8a7469]">
          <Link href="/shop">Shop</Link>
          <span>/</span>
          {product.category ? (
            <>
              <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-[#4f3e36]">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[2rem] border border-[#eadac2] bg-white p-3 shadow-sm">
              <Image
                src={product.images[0]?.url ?? product.featuredImage ?? ""}
                alt={product.name}
                width={1000}
                height={1200}
                className="h-[620px] w-full rounded-[1.5rem] object-cover"
                priority
              />
            </div>
            {product.images.length > 1 ? (
              <div className="grid grid-cols-3 gap-3">
                {product.images.map((image, index) => (
                  <div key={image.id} className={`overflow-hidden rounded-[1.3rem] border ${index === 0 ? "border-[#d4aa67]" : "border-[#eadac2]"} bg-white p-2`}>
                    <Image src={image.url} alt={image.alt ?? product.name} width={400} height={500} className="h-28 w-full rounded-[1rem] object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              <p className="eyebrow">{product.category?.name}</p>
              <h1 className="mt-3 text-5xl tracking-[-0.05em] text-[#1b120d]">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#d4aa67]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill={i < Math.round(Number(product.rating)) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-[#5d4d45]">{Number(product.rating).toFixed(1)} / 5</span>
              <span className="text-sm text-[#7f685f]">{product.reviewCount} reviews</span>
            </div>

            <PurchasePanel
              productId={product.id}
              basePrice={price}
              baseSalePrice={salePrice}
              variants={product.variants}
              stock={product.stock}
              currencySymbol={settings.currencySymbol}
            />

            <div className="grid gap-3 text-sm text-[#54453f] md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#e7d9c9] bg-white px-4 py-3">
                <ShieldCheck size={18} className="text-[#c49242]" />
                In stock • {product.stock} remaining
              </div>
              <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#e7d9c9] bg-white px-4 py-3">
                <Truck size={18} className="text-[#c49242]" />
                Nationwide delivery in 2-5 days
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
              <div className="flex items-center gap-2 text-[#1b120d]">
                <ShieldCheck size={18} className="text-[#c49242]" />
                Secure checkout & traceable shipping
              </div>
              <p className="mt-3 text-[#5d4d45]">{product.shortDescription}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-8">
          <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6">
            <h2 className="text-3xl tracking-[-0.04em] text-[#1b120d]">Overview</h2>
            <p className="mt-4 text-[#5d4d45]">{product.description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5">
              <h3 className="text-xl font-medium text-[#1b120d]">Benefits</h3>
              <ul className="mt-4 space-y-2 text-[#5d4d45]">
                {product.benefit ? <li>• {product.benefit}</li> : null}
                {product.skinConcern ? <li>• Supports: {product.skinConcern}</li> : null}
                {product.ingredients.map((pi) => (
                  <li key={pi.id}>• {pi.ingredient.name}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5">
              <h3 className="text-xl font-medium text-[#1b120d]">Ingredients</h3>
              <p className="mt-4 text-[#5d4d45]">{product.ingredientNotes}</p>
            </div>
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5">
              <h3 className="text-xl font-medium text-[#1b120d]">How to use</h3>
              <p className="mt-4 text-[#5d4d45]">{product.usageInstructions}</p>
            </div>
          </div>

          {product.faqs.length ? (
            <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6">
              <h2 className="text-3xl tracking-[-0.04em] text-[#1b120d]">FAQs</h2>
              <div className="mt-5 divide-y divide-[#eee1d2]">
                {product.faqs.map((faq) => (
                  <div key={faq.id} className="py-4">
                    <p className="font-medium text-[#1b120d]">{faq.question}</p>
                    <p className="mt-2 text-sm text-[#5d4d45]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6">
            <h2 className="text-3xl tracking-[-0.04em] text-[#1b120d]">Reviews</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <ReviewForm productId={product.id} productSlug={product.slug} />
              <div className="space-y-4">
                {product.reviews.length ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="rounded-[1.3rem] border border-[#eadac2] bg-[#faf6f1] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-[#1b120d]">{review.user.name}</p>
                        <div className="flex items-center gap-1 text-[#d4aa67]">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {review.verified ? <p className="mt-1 text-xs text-[#8a7469]">Verified Purchase</p> : null}
                      <p className="mt-2 text-sm text-[#4d3d39]">{review.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#7a6356]">Be the first to review this product.</p>
                )}
              </div>
            </div>
          </div>

          {related.length ? (
            <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-3xl tracking-[-0.04em] text-[#1b120d]">Complete your ritual</h2>
                <AddAllToBag productIds={related.map((r) => r.id)} />
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.id} href={`/product/${item.slug}`} className="rounded-[1.3rem] border border-[#eadac2] bg-[#faf6f1] p-4">
                    <Image
                      src={item.images[0]?.url ?? item.featuredImage ?? ""}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="h-40 w-full rounded-[1rem] object-cover"
                    />
                    <p className="mt-4 font-medium text-[#1b120d]">{item.name}</p>
                    <p className="mt-1 text-sm text-[#5d4d45]">{formatPrice(item.salePrice ?? item.price, settings.currencySymbol)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
