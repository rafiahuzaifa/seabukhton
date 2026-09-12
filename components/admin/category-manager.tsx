"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Category } from "@prisma/client";

import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "@/lib/actions/admin/taxonomy";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const emptyForm = { name: "", slug: "", description: "", image: "" };
const inputClass = "rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug, description: category.description ?? "", image: category.image ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = editingId ? await updateCategoryAction(editingId, form) : await createCategoryAction(form);
      if (result.success) {
        push(editingId ? "Category updated" : "Category created", "success");
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-[#1b120d]">{category.name}</p>
                <p className="text-xs text-[#8a7469]">/{category.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(category)} className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36]">
                  <Pencil size={13} />
                </button>
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteCategoryAction(category.id);
                      if (result.success) {
                        push("Category removed", "success");
                        router.refresh();
                      } else {
                        push(result.error ?? "Could not remove category.", "error");
                      }
                    })
                  }
                  className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {category.description ? <p className="mt-2 text-sm text-[#5d4d45]">{category.description}</p> : null}
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5 md:grid-cols-2">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          <input placeholder="Slug (auto from name)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
          <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`md:col-span-2 ${inputClass}`} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`md:col-span-2 ${inputClass}`} />
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
              {pending ? "Saving…" : editingId ? "Save changes" : "Create category"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          <Plus size={14} /> New category
        </Button>
      )}
    </div>
  );
}
