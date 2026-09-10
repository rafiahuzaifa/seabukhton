"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string(),
  productSlug: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(10).max(2000),
});

export async function submitReviewAction(input: z.infer<typeof schema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Please sign in to leave a review." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please add a rating and a short review." };

  const { productId, productSlug, rating, title, content } = parsed.data;

  const verified = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: session.user.id, status: { in: ["DELIVERED", "SHIPPED", "CONFIRMED", "PROCESSING"] } },
    },
  });

  await prisma.review.create({
    data: {
      userId: session.user.id,
      productId,
      rating,
      title,
      content,
      verified: Boolean(verified),
      approved: false,
    },
  });

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}

export async function markReviewHelpfulAction() {
  // Placeholder hook for a future "helpful" counter column.
  return { success: true };
}
