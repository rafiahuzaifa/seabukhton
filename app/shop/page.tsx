import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Header } from "@/components/header";
import { ProductCard } from "@/components/product/product-card";
import { listProducts, type ShopFilters } from "@/lib/data/products";
import { getCategories } from "@/lib/data/cms";
import { getSiteSettings } from "@/lib/data/settings";

const sortOptions: { label: string; value: NonNullable<ShopFilters["sort"]> }[] = [
  { label: "Newest", value: "newest" },
  { label: "Best selling", value: "best-selling" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Top rated", value: "rating" },
];

const benefitOptions = ["Hydration", "Glow", "Nourishment", "Hair Care", "Daily Wellness"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);

  const filters: ShopFilters = {
    category: get("category"),
    q: get("q"),
    benefit: get("benefit"),
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    minRating: get("minRating") ? Number(get("minRating")) : undefined,
    availability: get("availability") as ShopFilters["availability"],
    sort: (get("sort") as ShopFilters["sort"]) ?? "newest",
    page: get("page") ? Number(get("page")) : 1,
  };

  const [{ items, page, pageCount, total }, categories, settings] = await Promise.all([
    listProducts(filters),
    getCategories(),
    getSiteSettings(),
  ]);

  function buildHref(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, ...overrides })) {
      if (typeof value === "string" && value) next.set(key, value);
    }
    return `/shop?${next.toString()}`;
  }

  return (
    <>
      <Header />
      <main className="container py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Shop all</p>
            <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">
              {filters.q ? `Results for "${filters.q}"` : "Premium essentials"}
            </h1>
            <p className="mt-2 text-sm text-[#7a6356]">{total} products</p>
          </div>
          <form action="/shop" className="flex items-center gap-3">
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search products"
              className="rounded-full border border-[#dcc7ad] bg-white px-4 py-3 text-sm text-[#4f3e36] outline-none focus:border-[#c49242]"
            />
          </form>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href={buildHref({ category: undefined, page: undefined })}
            className={`rounded-full border px-4 py-2.5 text-sm ${!filters.category ? "border-[#1b120d] bg-[#1b120d] text-white" : "border-[#e7d9c9] bg-white text-[#54453f]"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildHref({ category: c.slug, page: undefined })}
              className={`rounded-full border px-4 py-2.5 text-sm ${filters.category === c.slug ? "border-[#1b120d] bg-[#1b120d] text-white" : "border-[#e7d9c9] bg-white text-[#54453f]"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          {benefitOptions.map((b) => (
            <Link
              key={b}
              href={buildHref({ benefit: filters.benefit === b ? undefined : b, page: undefined })}
              className={`rounded-full border px-3.5 py-2 text-xs uppercase tracking-[0.1em] ${filters.benefit === b ? "border-[#c49242] bg-[#f5e7d7] text-[#1b120d]" : "border-[#e7d9c9] bg-white text-[#6e5b52]"}`}
            >
              {b}
            </Link>
          ))}
          <Link
            href={buildHref({ availability: filters.availability === "in-stock" ? undefined : "in-stock", page: undefined })}
            className={`rounded-full border px-3.5 py-2 text-xs uppercase tracking-[0.1em] ${filters.availability === "in-stock" ? "border-[#c49242] bg-[#f5e7d7] text-[#1b120d]" : "border-[#e7d9c9] bg-white text-[#6e5b52]"}`}
          >
            In stock
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.12em] text-[#8a7469]">Sort</span>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={buildHref({ sort: option.value, page: undefined })}
                  className={`rounded-full border px-3 py-2 text-xs ${filters.sort === option.value ? "border-[#1b120d] bg-[#1b120d] text-white" : "border-[#e7d9c9] bg-white text-[#54453f]"}`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {items.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={settings.currencySymbol} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-12 text-center">
            <p className="text-lg text-[#54453f]">No products match these filters yet.</p>
            <Link href="/shop" className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-[#6e5245]">
              Clear filters <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {pageCount > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildHref({ page: String(p) })}
                className={`rounded-full px-3 py-2 text-sm ${p === page ? "bg-[#1b120d] text-white" : "border border-[#dcc7ad] bg-white text-[#4f3e36]"}`}
              >
                {p}
              </Link>
            ))}
          </div>
        ) : null}
      </main>
    </>
  );
}
