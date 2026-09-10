"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import type { HeroContent } from "@/lib/data/cms";

const heroSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  description: z.string().min(1),
  primaryLabel: z.string().min(1),
  primaryHref: z.string().min(1),
  secondaryLabel: z.string().min(1),
  secondaryHref: z.string().min(1),
  image: z.string().url(),
  featuredProductSlug: z.string().optional(),
});

export async function updateHeroAction(input: z.infer<typeof heroSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = heroSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete all hero fields." };
  const d = parsed.data;

  const content: HeroContent = {
    eyebrow: d.eyebrow,
    headline: d.headline,
    description: d.description,
    primaryCta: { label: d.primaryLabel, href: d.primaryHref },
    secondaryCta: { label: d.secondaryLabel, href: d.secondaryHref },
    image: d.image,
    featuredProductSlug: d.featuredProductSlug,
  };

  await prisma.homepageSection.upsert({
    where: { name: "hero" },
    update: { content, isActive: true },
    create: { name: "hero", type: "hero", content, isActive: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
  return { success: true };
}

export async function updateAnnouncementAction(text: string, isActive: boolean) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.homepageSection.upsert({
    where: { name: "announcement" },
    update: { content: { text }, isActive },
    create: { name: "announcement", type: "announcement_bar", content: { text }, isActive },
  });

  revalidatePath("/");
  return { success: true };
}

const bannerSchema = z.object({ title: z.string().min(1), subtitle: z.string().optional(), image: z.string().url(), link: z.string().optional() });

export async function createBannerAction(input: z.infer<typeof bannerSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete all banner fields." };

  await prisma.banner.create({ data: { ...parsed.data, isActive: true } });
  revalidatePath("/admin/cms");
  return { success: true };
}

export async function toggleBannerAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return { success: false, error: "Banner not found." };

  await prisma.banner.update({ where: { id }, data: { isActive: !banner.isActive } });
  revalidatePath("/admin/cms");
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/cms");
  return { success: true };
}
