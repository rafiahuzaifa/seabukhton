import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { productCardInclude } from "@/lib/data/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const benefit = searchParams.get("benefit");

  if (!benefit) return NextResponse.json({ products: [] });

  const products = await prisma.product.findMany({
    where: { isPublished: true, benefit },
    include: productCardInclude,
    orderBy: { rating: "desc" },
    take: 3,
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0]?.url ?? p.featuredImage,
      category: p.category?.name ?? null,
      price: Number(p.salePrice ?? p.price),
    })),
  });
}
