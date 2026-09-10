import { NextResponse } from "next/server";

import { searchProducts } from "@/lib/data/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) return NextResponse.json({ products: [] });

  const products = await searchProducts(q, 6);

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url ?? p.featuredImage,
      price: Number(p.salePrice ?? p.price),
      category: p.category?.name ?? null,
    })),
  });
}
