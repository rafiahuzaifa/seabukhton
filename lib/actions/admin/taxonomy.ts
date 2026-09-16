"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------- Categories
const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
});

export async function createCategoryAction(input: z.infer<typeof categorySchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  if (await prisma.category.findUnique({ where: { slug } })) {
    return { success: false, error: "A category with this slug already exists." };
  }

  await prisma.category.create({
    data: { name: data.name, slug, description: data.description, image: data.image || null, parentId: data.parentId || null },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategoryAction(id: string, input: z.infer<typeof categorySchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  const conflict = await prisma.category.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return { success: false, error: "A category with this slug already exists." };

  await prisma.category.update({
    where: { id },
    data: { name: data.name, slug, description: data.description, image: data.image || null, parentId: data.parentId || null },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const productCount = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (productCount > 0) return { success: false, error: `${productCount} product(s) still use this category.` };

  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleCategoryActiveAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { success: false, error: "Category not found." };

  await prisma.category.update({ where: { id }, data: { isActive: !category.isActive } });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  revalidatePath("/shop");
  return { success: true };
}

// --------------------------------------------------------------- Collections
const collectionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export async function createCollectionAction(input: z.infer<typeof collectionSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid collection." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  if (await prisma.collection.findUnique({ where: { slug } })) {
    return { success: false, error: "A collection with this slug already exists." };
  }

  await prisma.collection.create({ data: { name: data.name, slug, description: data.description, image: data.image || null } });
  revalidatePath("/admin/collections");
  revalidatePath("/");
  return { success: true };
}

export async function updateCollectionAction(id: string, input: z.infer<typeof collectionSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid collection." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  const conflict = await prisma.collection.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return { success: false, error: "A collection with this slug already exists." };

  await prisma.collection.update({ where: { id }, data: { name: data.name, slug, description: data.description, image: data.image || null } });
  revalidatePath("/admin/collections");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCollectionAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const productCount = await prisma.product.count({ where: { collectionId: id, deletedAt: null } });
  if (productCount > 0) return { success: false, error: `${productCount} product(s) still use this collection.` };

  await prisma.collection.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/collections");
  return { success: true };
}

// --------------------------------------------------------------- Ingredients
const ingredientSchema = z.object({ name: z.string().min(2), slug: z.string().optional(), description: z.string().min(5) });

export async function createIngredientAction(input: z.infer<typeof ingredientSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid ingredient." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  if (await prisma.ingredient.findUnique({ where: { slug } })) {
    return { success: false, error: "An ingredient with this slug already exists." };
  }

  await prisma.ingredient.create({ data: { name: data.name, slug, description: data.description } });
  revalidatePath("/admin/ingredients");
  revalidatePath("/");
  return { success: true };
}

export async function updateIngredientAction(id: string, input: z.infer<typeof ingredientSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid ingredient." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  const conflict = await prisma.ingredient.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return { success: false, error: "An ingredient with this slug already exists." };

  await prisma.ingredient.update({ where: { id }, data: { name: data.name, slug, description: data.description } });
  revalidatePath("/admin/ingredients");
  revalidatePath("/");
  return { success: true };
}

export async function deleteIngredientAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.productIngredient.deleteMany({ where: { ingredientId: id } });
  await prisma.ingredient.delete({ where: { id } });
  revalidatePath("/admin/ingredients");
  revalidatePath("/");
  return { success: true };
}

// ---------------------------------------------------------------------- FAQs
const faqSchema = z.object({ question: z.string().min(3), answer: z.string().min(3) });

export async function createSiteFaqAction(input: z.infer<typeof faqSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please complete both fields." };

  await prisma.fAQ.create({ data: { ...parsed.data, productId: null } });
  revalidatePath("/admin/faqs");
  return { success: true };
}

export async function deleteSiteFaqAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.fAQ.delete({ where: { id } });
  revalidatePath("/admin/faqs");
  return { success: true };
}

// ----------------------------------------------------------------- Newsletter
export async function deleteNewsletterSubscriberAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
  return { success: true };
}
