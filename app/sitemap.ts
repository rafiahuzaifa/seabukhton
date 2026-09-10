import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const [products, categories, posts] = await Promise.all([
    prisma.product.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { published: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/story`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/journal`, changeFrequency: "weekly", priority: 0.7 },
  ];

  return [
    ...staticRoutes,
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${base}/categories/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
