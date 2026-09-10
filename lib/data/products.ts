import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const productCardInclude = {
  images: { orderBy: { isPrimary: "desc" as const } },
  category: true,
} satisfies Prisma.ProductInclude;

export const productDetailInclude = {
  images: { orderBy: { isPrimary: "desc" as const } },
  variants: true,
  category: true,
  collection: true,
  faqs: true,
  ingredients: { include: { ingredient: true } },
  reviews: {
    where: { approved: true },
    include: { user: true, images: true },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.ProductInclude;

export async function getFeaturedProducts(take = 5) {
  return prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isPublished: true },
    include: productDetailInclude,
  });
  return product;
}

export async function getRelatedProducts(productId: string, categoryId: string | null, take = 3) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      isPublished: true,
      ...(categoryId ? { categoryId } : {}),
    },
    include: productCardInclude,
    take,
    orderBy: { rating: "desc" },
  });
}

export type ShopFilters = {
  category?: string;
  q?: string;
  benefit?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: "in-stock" | "out-of-stock";
  sort?: "newest" | "best-selling" | "price-asc" | "price-desc" | "rating";
  page?: number;
  pageSize?: number;
};

export async function listProducts(filters: ShopFilters) {
  const {
    category,
    q,
    benefit,
    minPrice,
    maxPrice,
    minRating,
    availability,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(benefit ? { benefit } : {}),
    ...(minRating ? { rating: { gte: minRating } } : {}),
    ...(availability === "in-stock" ? { stock: { gt: 0 } } : {}),
    ...(availability === "out-of-stock" ? { stock: { lte: 0 } } : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: minPrice } : {}),
            ...(maxPrice ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { productType: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { rating: "desc" }
          : sort === "best-selling"
            ? { reviewCount: "desc" }
            : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productCardInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function searchProducts(query: string, take = 6) {
  if (!query.trim()) return [];
  return prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { productType: { contains: query, mode: "insensitive" } },
        { benefit: { contains: query, mode: "insensitive" } },
      ],
    },
    include: productCardInclude,
    take,
  });
}
