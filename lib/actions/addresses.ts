"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  street: z.string().min(3),
  city: z.string().min(2),
  area: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Pakistan"),
});

export async function addAddressAction(input: z.infer<typeof schema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Please sign in." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete all required fields." };

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } });

  await prisma.address.create({
    data: { ...parsed.data, userId: session.user.id, isDefault: existingCount === 0 },
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddressAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Please sign in." };

  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddressAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Please sign in." };

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id, userId: session.user.id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  return { success: true };
}
