import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Header } from "@/components/header";
import { getPostBySlug } from "@/lib/data/blog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: { canonical: post.canonicalUrl ?? `/journal/${post.slug}` },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images: post.featureImage ? [post.featureImage] : undefined,
    },
  };
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featureImage ? [post.featureImage] : undefined,
    author: { "@type": "Organization", name: post.authorName ?? "BERRIVA" },
    datePublished: post.createdAt.toISOString(),
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="container py-12">
        <article className="mx-auto max-w-3xl">
          {post.featureImage ? (
            <div className="overflow-hidden rounded-[2rem] border border-[#eadac2] bg-white p-3 shadow-sm">
              <Image src={post.featureImage} alt={post.title} width={1200} height={800} className="h-[480px] w-full rounded-[1.6rem] object-cover" />
            </div>
          ) : null}
          <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-[#7b665d]">
            {post.category?.name} {post.authorName ? `• ${post.authorName}` : ""}
          </p>
          <h1 className="mt-3 text-5xl tracking-[-0.05em] text-[#1b120d]">{post.title}</h1>
          <p className="mt-5 text-lg text-[#54453f]">{post.excerpt}</p>
          <div className="mt-10 space-y-5 text-base text-[#5d4d45]">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}
