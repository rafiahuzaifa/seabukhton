"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import type { HeroContent, HomepageExtras, NavItem, StoryContent } from "@/lib/data/cms";

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

// ------------------------------------------------------------------- Navigation
const navItemSchema = z.object({ label: z.string().min(1), href: z.string().min(1), active: z.boolean().default(true) });
const navSchema = z.object({ items: z.array(navItemSchema).min(1) });

export async function updateNavigationAction(input: { items: NavItem[] }) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = navSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Every nav item needs a label and a link." };

  await prisma.homepageSection.upsert({
    where: { name: "navigation" },
    update: { content: parsed.data, isActive: true },
    create: { name: "navigation", type: "navigation", content: parsed.data, isActive: true },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/cms");
  return { success: true };
}

// ----------------------------------------------------------------------- Story
const storySchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  image: z.string().url(),
});

export async function updateStoryAction(input: StoryContent) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = storySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete all story fields." };

  await prisma.homepageSection.upsert({
    where: { name: "story" },
    update: { content: parsed.data, isActive: true },
    create: { name: "story", type: "story", content: parsed.data, isActive: true },
  });

  revalidatePath("/story");
  revalidatePath("/admin/cms");
  return { success: true };
}

// ------------------------------------------------------------- Homepage extras
const extrasSchema = z.object({
  trustPillars: z.array(z.string().min(1)).min(1),
  goldenBerry: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    image: z.string().url(),
    ctaLabel: z.string().min(1),
    ctaHref: z.string().min(1),
  }),
  skincareRoutine: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    steps: z.array(z.object({ step: z.string().min(1), product: z.string().min(1) })).min(1),
  }),
  journey: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    steps: z.array(z.string().min(1)).min(1),
  }),
});

export async function updateHomepageExtrasAction(input: HomepageExtras) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = extrasSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete every field." };

  await prisma.homepageSection.upsert({
    where: { name: "extras" },
    update: { content: parsed.data, isActive: true },
    create: { name: "extras", type: "homepage_extras", content: parsed.data, isActive: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
  return { success: true };
}
