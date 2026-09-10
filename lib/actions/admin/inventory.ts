"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({ productId: z.string(), delta: z.number().int(), reason: z.string().optional() });

export async function adjustStockAction(input: z.infer<typeof schema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid adjustment." };

  const product = await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { stock: { increment: parsed.data.delta } },
  });

  await prisma.inventoryTransaction.create({
    data: {
      productId: parsed.data.productId,
      type: parsed.data.delta >= 0 ? "RESTOCK" : "ADJUSTMENT",
      quantity: parsed.data.delta,
      reason: parsed.data.reason || `Manual adjustment by ${session.user.name ?? session.user.email}`,
    },
  });

  revalidatePath("/admin/inventory");
  return { success: true, newStock: product.stock };
}
