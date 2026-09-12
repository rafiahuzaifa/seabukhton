"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Ingredient } from "@prisma/client";

import { createIngredientAction, deleteIngredientAction, updateIngredientAction } from "@/lib/actions/admin/taxonomy";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const emptyForm = { name: "", slug: "", description: "" };
const inputClass = "rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none";

export function IngredientManager({ ingredients }: { ingredients: Ingredient[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function startEdit(ingredient: Ingredient) {
    setEditingId(ingredient.id);
    setForm({ name: ingredient.name, slug: ingredient.slug, description: ingredient.description });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = editingId ? await updateIngredientAction(editingId, form) : await createIngredientAction(form);
      if (result.success) {
        push(editingId ? "Ingredient updated" : "Ingredient added", "success");
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
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-[#1b120d]">{ingredient.name}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(ingredient)} className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36]">
                  <Pencil size={13} />
                </button>
                <button
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteIngredientAction(ingredient.id);
                      push("Ingredient removed", "success");
                      router.refresh();
                    })
                  }
                  className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-[#5d4d45]">{ingredient.description}</p>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5 md:grid-cols-2">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          <input placeholder="Slug (auto from name)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
          <textarea
            required
            rows={2}
            placeholder="Short educational description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`md:col-span-2 rounded-2xl border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none`}
          />
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
              {pending ? "Saving…" : editingId ? "Save changes" : "Add ingredient"}
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
          <Plus size={14} /> New ingredient
        </Button>
      )}
    </div>
  );
}
