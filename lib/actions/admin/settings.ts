"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  site_name: z.string().min(1),
  site_tagline: z.string().min(1),
  currency_symbol: z.string().min(1),
  free_shipping_threshold: z.string().min(1),
  flat_shipping_rate: z.string().min(1),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
});

export async function updateSiteSettingsAction(input: z.infer<typeof schema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid settings." };

  await prisma.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.siteSetting.upsert({ where: { key }, update: { value: value ?? "" }, create: { key, value: value ?? "" } })
    )
  );

  await prisma.auditLog.create({ data: { userId: session.user.id, action: "SITE_SETTINGS_UPDATED", entityType: "SiteSetting" } });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}
