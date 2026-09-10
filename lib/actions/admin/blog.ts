"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  featureImage: z.string().url().optional().or(z.literal("")),
  categoryName: z.string().optional(),
  published: z.boolean(),
  authorName: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type BlogFormInput = z.infer<typeof schema>;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function resolveCategoryId(name?: string) {
  if (!name?.trim()) return null;
  const slug = slugify(name);
  const category = await prisma.blogCategory.upsert({
    where: { slug },
    update: {},
    create: { name: name.trim(), slug },
  });
  return category.id;
}

export async function createBlogPostAction(input: BlogFormInput) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid post." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.title);

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A post with this slug already exists." };

  const categoryId = await resolveCategoryId(data.categoryName);

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      featureImage: data.featureImage || null,
      categoryId,
      published: data.published,
      authorName: data.authorName || session.user.name,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  revalidatePath("/admin/journal");
  redirect(`/admin/journal/${post.id}`);
}

export async function updateBlogPostAction(id: string, input: BlogFormInput) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid post." };
  const data = parsed.data;
  const slug = slugify(data.slug || data.title);

  const conflict = await prisma.blogPost.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) return { success: false, error: "A post with this slug already exists." };

  const categoryId = await resolveCategoryId(data.categoryName);

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      featureImage: data.featureImage || null,
      categoryId,
      published: data.published,
      authorName: data.authorName,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  revalidatePath("/admin/journal");
  revalidatePath(`/journal/${slug}`);
  return { success: true };
}

export async function deleteBlogPostAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
  revalidatePath("/admin/journal");
  return { success: true };
}

export async function togglePublishPostAction(id: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Post not found." };

  await prisma.blogPost.update({ where: { id }, data: { published: !post.published } });
  revalidatePath("/admin/journal");
  return { success: true };
}
