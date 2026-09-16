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

export type NavItem = { label: string; href: string; active?: boolean };

const defaultNavItems: NavItem[] = [
  { label: "Shop", href: "/shop", active: true },
  { label: "Skincare", href: "/shop?category=skincare", active: true },
  { label: "Wellness", href: "/shop?category=wellness", active: true },
  { label: "Haircare", href: "/shop?category=haircare", active: true },
  { label: "Oils", href: "/shop?category=oils", active: true },
  { label: "Bundles", href: "/shop?category=bundles", active: true },
  { label: "Our Story", href: "/story", active: true },
  { label: "Journal", href: "/journal", active: true },
];

/** All nav items, active and inactive — for the admin editor. */
export async function getAllNavigationItems(): Promise<NavItem[]> {
  const section = await prisma.homepageSection.findUnique({ where: { name: "navigation" } });
  if (!section || !section.isActive) return defaultNavItems;
  const items = (section.content as { items?: NavItem[] })?.items;
  return items && items.length ? items : defaultNavItems;
}

/** Only active nav items — for rendering the header. */
export async function getNavigation(): Promise<NavItem[]> {
  const items = await getAllNavigationItems();
  return items.filter((item) => item.active !== false);
}

export type StoryContent = {
  eyebrow: string;
  headline: string;
  paragraphs: string[];
  image: string;
};

const defaultStory: StoryContent = {
  eyebrow: "Our story",
  headline: "Rooted in the Himalayas",
  paragraphs: [
    "HERBOVA brings together the richness of sea buckthorn and the calm discipline of modern botanical skincare.",
    "We work with nature-inspired formulations that respect the power of the berry while creating elevated routines for skin, body, and daily wellness.",
  ],
  image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
};

export async function getStoryContent(): Promise<StoryContent> {
  const section = await prisma.homepageSection.findUnique({ where: { name: "story" } });
  if (!section || !section.isActive) return defaultStory;
  return { ...defaultStory, ...(section.content as Partial<StoryContent>) };
}
