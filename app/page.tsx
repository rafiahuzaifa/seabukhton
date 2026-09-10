import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Check, Star } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { RitualBuilder } from "@/components/home/ritual-builder";
import { NewsletterForm } from "@/components/newsletter-form";
import { getFeaturedProducts } from "@/lib/data/products";
import { getCategories, getHeroSection } from "@/lib/data/cms";
import { getFeaturedReviews } from "@/lib/data/reviews";
import { getPublishedPosts } from "@/lib/data/blog";
import { getSiteSettings, formatPrice } from "@/lib/data/settings";
import { prisma } from "@/lib/prisma";

const trustPillars = ["Premium Ingredients", "Naturally Inspired", "Carefully Crafted", "Secure Checkout", "Nationwide Delivery"];

const skincareSteps = [
  { step: "Cleanse", product: "Sea Buckthorn Face Wash" },
  { step: "Treat", product: "Radiance Serum" },
  { step: "Hydrate", product: "Hydrating Serum" },
  { step: "Nourish", product: "Pure Berry Oil" },
];

const journeySteps = ["Harvest", "Selection", "Processing", "Formulation", "Packaging", "Delivery"];

export default async function HomePage() {
  const [hero, categories, featured, bundles, reviews, posts, ingredients, settings] = await Promise.all([
    getHeroSection(),
    getCategories(),
    getFeaturedProducts(5),
    prisma.product.findMany({
      where: { isPublished: true, category: { slug: "bundles" } },
      include: { images: true, category: true },
      take: 4,
      orderBy: { rating: "desc" },
    }),
    getFeaturedReviews(3),
    getPublishedPosts(3),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    getSiteSettings(),
  ]);

  const heroProduct = hero.featuredProductSlug
    ? await prisma.product.findUnique({ where: { slug: hero.featuredProductSlug }, include: { images: true } })
    : null;

  const categoryImages: Record<string, string> = {
    skincare: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    wellness: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    haircare: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
    oils: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    bundles: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  };

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-[#eadcc4] bg-[#f2e8dd]">
          <div className="absolute inset-0">
            <Image src={hero.image} alt="Sea buckthorn berries in nature" fill priority className="object-cover opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),transparent_38%),linear-gradient(90deg,rgba(20,12,8,0.72),rgba(20,12,8,0.22))]" />
          </div>

          <div className="container relative grid min-h-[760px] items-center py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-xl text-white">
              <p className="eyebrow mb-6 text-[#f5d9b0]">{hero.eyebrow}</p>
              <h1 className="text-5xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">{hero.headline}</h1>
              <p className="mt-6 max-w-lg text-base text-[#f5efe9] md:text-lg">{hero.description}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="rounded-full bg-[#e4b86a] px-7 py-3.5 text-[11px] font-medium tracking-[0.12em] text-[#1b120d] hover:bg-[#f0c988]">
                  <Link href={hero.primaryCta.href}>
                    {hero.primaryCta.label} <ArrowRight size={16} className="ml-2 inline" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-full bg-white/10 px-7 py-3.5 text-[11px] font-medium tracking-[0.12em] text-white hover:bg-white/20">
                  <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
                </Button>
              </div>
            </div>

            {heroProduct ? (
              <div className="flex justify-end">
                <div className="panel w-full max-w-md rounded-[2rem] border border-white/20 bg-white/10 p-5 text-white shadow-2xl shadow-[#291a10]/20 backdrop-blur-md">
                  <div className="overflow-hidden rounded-[1.5rem] bg-[#f2e7d9]">
                    <Image
                      src={heroProduct.images[0]?.url ?? heroProduct.featuredImage ?? hero.image}
                      alt={heroProduct.name}
                      width={900}
                      height={1100}
                      className="h-[540px] w-full object-cover"
                    />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#f2d7b4]">Signature blend</p>
                      <h2 className="mt-2 text-2xl font-medium">{heroProduct.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#f5d7b5]">From</p>
                      <p className="text-2xl font-semibold">
                        {formatPrice(heroProduct.salePrice ?? heroProduct.price, settings.currencySymbol)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-b border-[#e7d9c9] bg-[#faf6f1]">
          <div className="container grid gap-4 py-7 md:grid-cols-5">
            {trustPillars.map((pillar) => (
              <div key={pillar} className="flex items-center justify-center gap-3 rounded-full border border-[#eadac2] bg-white/60 px-4 py-3 text-center text-sm text-[#41352f]">
                <Check size={16} className="text-[#c49242]" />
                {pillar}
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Shop by category</p>
                <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Curated for every ritual</h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-[#eadac2] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={category.image ?? categoryImages[category.slug] ?? categoryImages.skincare}
                      alt={category.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <p className="text-2xl font-medium">{category.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2 p-5">
                    <p className="text-sm text-[#5d4d45]">{category.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f8f3ed]">
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Best sellers</p>
                <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Our most loved essentials</h2>
              </div>
              <Link href="/shop" className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-[#6e5245]">
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={settings.currencySymbol} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#eadac2] bg-[#f5efe7]">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
                alt="Sea buckthorn berry close-up"
                width={1200}
                height={1200}
                className="h-[620px] w-full object-cover"
              />
            </div>
            <div>
              <p className="eyebrow">The Golden Berry</p>
              <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Meet the Golden Berry</h2>
              <p className="mt-5 text-lg text-[#54453f]">
                Sea buckthorn is a resilient berry native to the high mountain regions of the Himalayas. Known for its luminous color and
                naturally rich botanical profile, it has been valued for generations in traditional wellness rituals.
              </p>
              <p className="mt-4 text-base text-[#5f4d46]">
                This small but powerful fruit brings together a distinctive combination of botanical oils, carotenoids, and plant compounds
                that help create premium formulations for modern skin and wellness routines.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Button asChild className="rounded-full bg-[#1b120d] px-6 py-3.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#2b1d17]">
                  <Link href="/story">Discover Sea Buckthorn</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f1e7dc]">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="eyebrow">Skincare experience</p>
              <h2 className="mt-3 text-5xl tracking-[-0.05em] text-[#1b120d]">Glow, Naturally.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              {skincareSteps.map((item) => (
                <div key={item.step} className="rounded-[1.75rem] border border-[#e0c8a9] bg-white/70 p-6 shadow-sm">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0d8a1] text-lg font-medium text-[#1b120d]">
                    {item.step[0]}
                  </div>
                  <p className="eyebrow text-[#7e665b]">{item.step}</p>
                  <h3 className="mt-3 text-2xl font-medium">{item.product}</h3>
                  <div className="mt-5 h-px w-12 bg-[#d4aa67]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="eyebrow">Ingredients</p>
              <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Nature-powered nourishment</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#d7c1a2] bg-[#f8eeea] text-lg font-medium text-[#2c211d]">
                    {ingredient.name.split(" ")[0][0]}
                  </div>
                  <h3 className="text-xl font-medium text-[#1b120d]">{ingredient.name}</h3>
                  <p className="mt-3 text-sm text-[#5d4d45]">{ingredient.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#faf7f3]">
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Product discovery</p>
                <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Build Your Sea Buckthorn Ritual</h2>
              </div>
            </div>
            <RitualBuilder />
          </div>
        </section>

        <section className="section-shell">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="eyebrow">From berry to bottle</p>
              <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">From the Mountains to Your Ritual</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-6">
              {journeySteps.map((step, i) => (
                <div key={step} className="rounded-[1.5rem] border border-[#e6d6bf] bg-white p-5 text-center shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0d8a1] text-sm font-medium text-[#1b120d] mx-auto">
                    0{i + 1}
                  </div>
                  <p className="text-lg font-medium text-[#1b120d]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f8f1eb]">
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Premium bundles</p>
                <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Complete rituals</h2>
              </div>
              <Link href="/shop?category=bundles" className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-[#6e5245]">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {bundles.map((bundle, i) => (
                <div key={bundle.id} className="rounded-[1.5rem] border border-[#e8d8c3] bg-white p-5 shadow-sm">
                  <div className="mb-4 overflow-hidden rounded-[1.1rem] bg-[#f5eee6]">
                    <Image
                      src={bundle.images[0]?.url ?? bundle.featuredImage ?? categoryImages.bundles}
                      alt={bundle.name}
                      width={500}
                      height={360}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-[#f2e6d5] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#694d41]">
                      Bundle
                    </span>
                    <Sparkles size={16} className="text-[#c49242]" />
                  </div>
                  <Link href={`/product/${bundle.slug}`} className="block text-2xl font-medium text-[#1b120d]">
                    {bundle.name}
                  </Link>
                  <p className="mt-2 text-lg font-semibold text-[#1b120d]">
                    {formatPrice(bundle.salePrice ?? bundle.price, settings.currencySymbol)}
                  </p>
                  <AddToCartButton
                    productId={bundle.id}
                    outOfStock={bundle.stock <= 0}
                    variantStyle="secondary"
                    className="mt-6 w-full px-4 py-2.5 text-[10px] tracking-[0.13em]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Reviews</p>
                <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Loved by our community</h2>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0d8a1] text-lg font-medium text-[#1b120d]">
                        {review.user.name?.[0] ?? "B"}
                      </div>
                      <div>
                        <p className="font-medium text-[#1b120d]">{review.user.name}</p>
                        <p className="text-xs text-[#73675f]">{review.verified ? "Verified Purchase" : "Review"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#d4aa67]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#7b665d]">{review.product.name}</p>
                  <p className="mt-4 text-base text-[#4d3d39]">&ldquo;{review.content}&rdquo;</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f0e7dc]">
          <div className="container">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Journal</p>
                <h2 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Fresh ideas, botanical wisdom</h2>
              </div>
              <Link href="/journal" className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-[#6e5245]">
                Read more <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/journal/${post.slug}`} className="overflow-hidden rounded-[1.7rem] border border-[#eadac2] bg-white shadow-sm">
                  <div className="relative h-60 overflow-hidden">
                    {post.featureImage ? <Image src={post.featureImage} alt={post.title} fill className="object-cover" /> : null}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7b665d]">{post.category?.name}</p>
                    <h3 className="mt-3 text-2xl font-medium text-[#1b120d]">{post.title}</h3>
                    <p className="mt-3 text-sm text-[#5d4d45]">{post.excerpt}</p>
                    <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[#796a60]">
                      <span>Read article</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="container">
            <div className="rounded-[2.25rem] border border-[#e2c8a9] bg-[#1b120d] px-6 py-12 text-center text-white md:px-10">
              <p className="eyebrow text-[#efcf97]">Newsletter</p>
              <h2 className="mt-3 text-4xl tracking-[-0.04em] text-white">Bring Nature Into Your Inbox.</h2>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
