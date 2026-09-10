"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0),
});

const faqSchema = z.object({ question: z.string().min(1), answer: z.string().min(1) });

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  shortDescription: z.string().optional(),
  description: z.string().min(10),
  categoryId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional().nullable(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  productType: z.string().optional(),
  skinConcern: z.string().optional(),
  benefit: z.string().optional(),
  format: z.string().optional(),
  ingredientNotes: z.string().optional(),
  usageInstructions: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  ingredientIds: z.array(z.string()).default([]),
  faqs: z.array(faqSchema).default([]),
  variants: z.array(variantSchema).default([]),
});

export type ProductFormInput = z.infer<typeof productSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProductAction(input: ProductFormInput) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  const data = parsed.data;

  const slug = slugify(data.slug || data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A product with this slug already exists." };

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || null,
      collectionId: data.collectionId || null,
      price: data.price,
      salePrice: data.salePrice ?? null,
      sku: data.sku,
      stock: data.stock,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      productType: data.productType,
      skinConcern: data.skinConcern,
      benefit: data.benefit,
      format: data.format,
      ingredientNotes: data.ingredientNotes,
      usageInstructions: data.usageInstructions,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      featuredImage: data.images[0],
      images: { create: data.images.map((url, i) => ({ url, isPrimary: i === 0 })) },
      ingredients: { create: data.ingredientIds.map((id) => ({ ingredientId: id })) },
      faqs: { create: data.faqs },
      variants: { create: data.variants.map((v) => ({ ...v, salePrice: v.salePrice ?? null })) },
    },
  });

  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "PRODUCT_CREATED", entityType: "Product", entityId: product.id },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(id: string, input: ProductFormInput) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  const data = parsed.data;

  const slug = slugify(data.slug || data.name);
  const conflict = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return { success: false, error: "A product with this slug already exists." };

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productIngredient.deleteMany({ where: { productId: id } }),
    prisma.fAQ.deleteMany({ where: { productId: id } }),
    prisma.productVariant.deleteMany({ where: { productId: id } }),
  ]);

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || null,
      collectionId: data.collectionId || null,
      price: data.price,
      salePrice: data.salePrice ?? null,
      sku: data.sku,
      stock: data.stock,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      productType: data.productType,
      skinConcern: data.skinConcern,
      benefit: data.benefit,
      format: data.format,
      ingredientNotes: data.ingredientNotes,
      usageInstructions: data.usageInstructions,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      featuredImage: data.images[0],
      images: { create: data.images.map((url, i) => ({ url, isPrimary: i === 0 })) },
      ingredients: { create: data.ingredientIds.map((ingredientId) => ({ ingredientId })) },
      faqs: { create: data.faqs },
      variants: { create: data.variants.map((v) => ({ ...v, salePrice: v.salePrice ?? null })) },
    },
  });

  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "PRODUCT_UPDATED", entityType: "Product", entityId: id },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/product/${slug}`);
  return { success: true };
}

export async function togglePublishAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { success: false, error: "Product not found." };

  await prisma.product.update({ where: { id }, data: { isPublished: !product.isPublished } });
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "PRODUCT_DELETED", entityType: "Product", entityId: id },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function duplicateProductAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const original = await prisma.product.findUnique({
    where: { id },
    include: { images: true, ingredients: true, faqs: true, variants: true },
  });
  if (!original) return { success: false, error: "Product not found." };

  let slug = `${original.slug}-copy`;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${original.slug}-copy-${counter}`;
  }

  const copy = await prisma.product.create({
    data: {
      name: `${original.name} (Copy)`,
      slug,
      shortDescription: original.shortDescription,
      description: original.description,
      categoryId: original.categoryId,
      collectionId: original.collectionId,
      price: original.price,
      salePrice: original.salePrice,
      sku: `${original.sku}-COPY-${counter}`,
      stock: 0,
      isPublished: false,
      isFeatured: false,
      isNew: true,
      productType: original.productType,
      skinConcern: original.skinConcern,
      benefit: original.benefit,
      format: original.format,
      ingredientNotes: original.ingredientNotes,
      usageInstructions: original.usageInstructions,
      featuredImage: original.featuredImage,
      images: { create: original.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary, alt: i.alt })) },
      ingredients: { create: original.ingredients.map((i) => ({ ingredientId: i.ingredientId })) },
      faqs: { create: original.faqs.map((f) => ({ question: f.question, answer: f.answer })) },
    },
  });

  revalidatePath("/admin/products");
  return { success: true, id: copy.id };
}
