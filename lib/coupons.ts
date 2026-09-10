import "server-only";

import { prisma } from "@/lib/prisma";

type CouponResult =
  | { valid: false; error: string }
  | { valid: true; coupon: NonNullable<Awaited<ReturnType<typeof prisma.coupon.findUnique>>>; discount: number };

export async function validateCoupon(code: string, subtotal: number, userId?: string | null): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon || !coupon.isActive) return { valid: false, error: "This coupon code is invalid." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, error: "This coupon has expired." };
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return { valid: false, error: `Minimum order of Rs. ${Number(coupon.minOrderAmount).toLocaleString()} required.` };
  }

  if (coupon.usageLimit) {
    const used = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
    if (used >= coupon.usageLimit) return { valid: false, error: "This coupon has reached its usage limit." };
  }

  if (coupon.firstOrderOnly && userId) {
    const priorOrders = await prisma.order.count({ where: { userId } });
    if (priorOrders > 0) return { valid: false, error: "This coupon is valid for first orders only." };
  }

  const discount = coupon.type === "PERCENTAGE" ? Math.round((subtotal * Number(coupon.value)) / 100) : Number(coupon.value);

  return { valid: true, coupon, discount: Math.min(discount, subtotal) };
}
