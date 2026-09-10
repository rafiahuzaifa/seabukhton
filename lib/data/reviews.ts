import { prisma } from "@/lib/prisma";

export async function getFeaturedReviews(take = 3) {
  return prisma.review.findMany({
    where: { approved: true, featured: true },
    include: { user: true, product: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}
