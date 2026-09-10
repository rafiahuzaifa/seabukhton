import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Content</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">New journal post</h1>
      </div>
      <BlogForm />
    </div>
  );
}
