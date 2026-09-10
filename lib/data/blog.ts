import { prisma } from "@/lib/prisma";

export async function getPublishedPosts(take?: number) {
  return prisma.blogPost.findMany({
    where: { published: true, deletedAt: null },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, published: true, deletedAt: null },
    include: { category: true },
  });
}
