"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

async function refreshProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

export async function approveReviewAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const review = await prisma.review.update({ where: { id }, data: { approved: true } });
  await refreshProductRating(review.productId);
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function rejectReviewAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const review = await prisma.review.update({ where: { id }, data: { approved: false } });
  await refreshProductRating(review.productId);
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function toggleFeatureReviewAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return { success: false, error: "Review not found." };

  await prisma.review.update({ where: { id }, data: { featured: !review.featured } });
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReviewAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const review = await prisma.review.delete({ where: { id } });
  await refreshProductRating(review.productId);
  revalidatePath("/admin/reviews");
  return { success: true };
}
