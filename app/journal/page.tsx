import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Header } from "@/components/header";
import { getPublishedPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Journal",
  description: "Botanical stories, skincare guidance and sea buckthorn wisdom from HERBOVA.",
};

export default async function JournalPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <p className="eyebrow">Journal</p>
          <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">Botanical stories & guidance</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[1.75rem] border border-[#eadac2] bg-white shadow-sm">
              <div className="relative h-64 overflow-hidden">
                {post.featureImage ? <Image src={post.featureImage} alt={post.title} fill className="object-cover" /> : null}
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#7b665d]">{post.category?.name}</p>
                <Link href={`/journal/${post.slug}`} className="mt-3 block text-2xl font-medium text-[#1b120d]">{post.title}</Link>
                <p className="mt-3 text-sm text-[#5d4d45]">{post.excerpt}</p>
              </div>
            </article>
          ))}
          {!posts.length ? <p className="text-sm text-[#7a6356]">No articles published yet.</p> : null}
        </div>
      </main>
    </>
  );
}
