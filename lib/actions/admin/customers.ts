"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function toggleCustomerActiveAction(userId: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "Customer not found." };

  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: user.isActive ? "CUSTOMER_SUSPENDED" : "CUSTOMER_ACTIVATED",
      entityType: "User",
      entityId: userId,
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return { success: true };
}
