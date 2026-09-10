"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(3),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  firstOrderOnly: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function createCouponAction(input: z.infer<typeof schema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid coupon." };
  const data = parsed.data;

  const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) return { success: false, error: "A coupon with this code already exists." };

  await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      usageLimit: data.usageLimit,
      firstOrderOnly: data.firstOrderOnly,
      categoryId: data.categoryId || null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActiveAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return { success: false, error: "Coupon not found." };

  await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const usageCount = await prisma.couponUsage.count({ where: { couponId: id } });
  if (usageCount > 0) {
    await prisma.coupon.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/coupons");
    return { success: true, deactivatedInstead: true };
  }

  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { success: true };
}
