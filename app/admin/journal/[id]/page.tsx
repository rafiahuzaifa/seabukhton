import { notFound } from "next/navigation";

import { BlogForm } from "@/components/admin/blog-form";
import { prisma } from "@/lib/prisma";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { category: true } });

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Content</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">{post.title}</h1>
      </div>
      <BlogForm
        postId={post.id}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featureImage: post.featureImage ?? "",
          categoryName: post.category?.name ?? "",
          published: post.published,
          authorName: post.authorName ?? "",
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }}
      />
    </div>
  );
}
