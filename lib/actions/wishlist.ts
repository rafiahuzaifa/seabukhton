"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireWishlist() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    include: { items: true },
  });
  return wishlist;
}

export async function toggleWishlistAction(productId: string) {
  const wishlist = await requireWishlist();
  if (!wishlist) return { success: false, error: "Please sign in to save items to your wishlist." };

  const existing = wishlist.items.find((i) => i.productId === productId);
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { success: true, saved: false };
  }

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  revalidatePath("/account/wishlist");
  return { success: true, saved: true };
}

export async function removeFromWishlistAction(itemId: string) {
  await prisma.wishlistItem.delete({ where: { id: itemId } });
  revalidatePath("/account/wishlist");
}
