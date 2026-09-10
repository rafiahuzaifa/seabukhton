"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
  variant: z.string().optional().nullable(),
});

export async function addToCartAction(input: z.infer<typeof addSchema>) {
  const { productId, quantity, variant } = addSchema.parse(input);
  const cart = await getOrCreateCart();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isPublished) {
    return { success: false, error: "This product is not available." };
  }

  const existing = cart.items.find((i) => i.productId === productId && i.variant === (variant ?? null));

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, variant: variant ?? null },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: Math.min(quantity, 20) } });
  }
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItemAction(itemId: string) {
  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
