"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createBlogPostAction, updateBlogPostAction, type BlogFormInput } from "@/lib/actions/admin/blog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const inputClass = "w-full rounded-xl border border-[#dcc7ad] bg-[#faf7f3] px-3.5 py-2.5 text-sm text-[#1b120d] outline-none focus:border-[#c49242]";
const labelClass = "block text-xs uppercase tracking-[0.1em] text-[#8a7469] mb-1.5";

export function BlogForm({ postId, initial }: { postId?: string; initial?: Partial<BlogFormInput> }) {
  const [form, setForm] = useState<BlogFormInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    featureImage: initial?.featureImage ?? "",
    categoryName: initial?.categoryName ?? "Journal",
    published: initial?.published ?? false,
    authorName: initial?.authorName ?? "",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
  });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function set<K extends keyof BlogFormInput>(key: K, value: BlogFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = postId ? await updateBlogPostAction(postId, form) : await createBlogPostAction(form);
      if (result?.success === false) {
        push(result.error ?? "Something went wrong.", "error");
      } else if (postId) {
        push("Post updated", "success");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 rounded-[1.5rem] border border-[#eadac2] bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Title</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={form.title} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input value={form.categoryName} onChange={(e) => set("categoryName", e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Excerpt</label>
          <textarea required rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Content</label>
          <textarea required rows={8} value={form.content} onChange={(e) => set("content", e.target.value)} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Feature image URL</label>
          <input value={form.featureImage} onChange={(e) => set("featureImage", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Author</label>
          <input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#4f3e36]">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published
        </label>
        <div>
          <label className={labelClass}>SEO title</label>
          <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Meta description</label>
          <input value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className={inputClass} />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="rounded-full px-6 py-3.5 text-[11px] tracking-[0.12em]">
        {pending ? "Saving…" : postId ? "Save changes" : "Publish post"}
      </Button>
    </form>
  );
}
