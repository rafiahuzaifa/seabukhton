import "server-only";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CART_COOKIE = "berriva_cart_id";

const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: true, variants: true },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

function emptyCart(): CartWithItems {
  return {
    id: "",
    userId: null,
    sessionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  } as unknown as CartWithItems;
}

async function getGuestCartId() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/**
 * Read-only lookup safe to call from Server Components / page renders.
 * Never creates a cart row or sets cookies — if a guest cart exists under
 * the current cookie but hasn't been merged into a logged-in user's cart
 * yet, it is still returned so pages render correctly; the actual merge
 * happens lazily the next time a mutation (Server Action) runs.
 */
export async function getCart(): Promise<CartWithItems> {
  const session = await getServerSession(authOptions);
  const guestCartId = await getGuestCartId();

  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id }, include: cartInclude });
    if (cart) return cart;

    if (guestCartId) {
      const guestCart = await prisma.cart.findUnique({ where: { id: guestCartId }, include: cartInclude });
      if (guestCart && !guestCart.userId) return guestCart;
    }
    return emptyCart();
  }

  if (guestCartId) {
    const cart = await prisma.cart.findUnique({ where: { id: guestCartId }, include: cartInclude });
    if (cart) return cart;
  }

  return emptyCart();
}

/**
 * Mutation-safe cart accessor. Creates a cart row and sets the guest cart
 * cookie as needed, and merges any guest cart into a logged-in user's cart.
 * Only call this from Server Actions or Route Handlers.
 */
export async function getOrCreateCart(): Promise<CartWithItems> {
  const store = await cookies();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (userId) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });

    const guestCartId = store.get(CART_COOKIE)?.value ?? null;
    if (guestCartId) {
      const guestCart = await prisma.cart.findUnique({ where: { id: guestCartId }, include: cartInclude });
      if (guestCart && guestCart.userId !== userId) {
        cart = cart ?? (await prisma.cart.create({ data: { userId }, include: cartInclude }));
        for (const item of guestCart.items) {
          const existing = cart.items.find(
            (i) => i.productId === item.productId && i.variant === item.variant
          );
          if (existing) {
            await prisma.cartItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + item.quantity },
            });
          } else {
            await prisma.cartItem.create({
              data: { cartId: cart.id, productId: item.productId, quantity: item.quantity, variant: item.variant },
            });
          }
        }
        await prisma.cart.delete({ where: { id: guestCart.id } });
        cart = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
        store.set(CART_COOKIE, "", { maxAge: 0, path: "/" });
      }
    }

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: cartInclude });
    }
    return cart;
  }

  const guestCartId = store.get(CART_COOKIE)?.value ?? null;
  if (guestCartId) {
    const cart = await prisma.cart.findUnique({ where: { id: guestCartId }, include: cartInclude });
    if (cart) return cart;
  }

  const cart = await prisma.cart.create({ data: {}, include: cartInclude });
  store.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return cart;
}

export function lineItemPrice(item: CartWithItems["items"][number]) {
  const variant = item.variant ? item.product.variants.find((v) => v.id === item.variant) : null;
  const unitPrice = variant
    ? Number(variant.salePrice ?? variant.price)
    : Number(item.product.salePrice ?? item.product.price);
  return unitPrice * item.quantity;
}

/** Read-only summary safe for page rendering (Header, cart/checkout pages). */
export async function cartSummary() {
  const cart = await getCart();
  const subtotal = cart.items.reduce((sum, item) => sum + lineItemPrice(item), 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { cart, subtotal, itemCount };
}
