import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function AdminJournalPage() {
  const posts = await prisma.blogPost.findMany({ where: { deletedAt: null }, include: { category: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Journal</h1>
        </div>
        <Button asChild className="gap-2 rounded-full px-5 py-3 text-[11px] tracking-[0.12em]">
          <Link href="/admin/journal/new">
            <Plus size={15} /> New post
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-[#f0e7dc] last:border-0">
                <td className="px-5 py-4">
                  <Link href={`/admin/journal/${post.id}`} className="font-medium text-[#1b120d]">{post.title}</Link>
                </td>
                <td className="px-5 py-4 text-[#54453f]">{post.category?.name ?? "—"}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${post.published ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#f1ecec] text-[#6a5a55]"}`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
