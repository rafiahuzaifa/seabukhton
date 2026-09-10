import { prisma } from "@/lib/prisma";

export type HeroContent = {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  image: string;
  featuredProductSlug?: string;
};

export async function getHeroSection(): Promise<HeroContent> {
  const section = await prisma.homepageSection.findUnique({ where: { name: "hero" } });
  const fallback: HeroContent = {
    eyebrow: "The Golden Berry of Wellness",
    headline: "Nature's Golden Berry. Reimagined.",
    description: "Premium Sea Buckthorn wellness and skincare, thoughtfully crafted from nature.",
    primaryCta: { label: "Shop Collection", href: "/shop" },
    secondaryCta: { label: "Discover Sea Buckthorn", href: "/story" },
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1800&q=80",
  };
  if (!section || !section.isActive) return fallback;
  return { ...fallback, ...(section.content as Partial<HeroContent>) };
}

export async function getAnnouncementBar() {
  const section = await prisma.homepageSection.findUnique({ where: { name: "announcement" } });
  if (!section || !section.isActive) return null;
  return (section.content as { text?: string })?.text ?? null;
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null, parentId: null },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, deletedAt: null } });
}

export async function getSiteFaqs() {
  return prisma.fAQ.findMany({ where: { productId: null }, orderBy: { createdAt: "asc" } });
}
