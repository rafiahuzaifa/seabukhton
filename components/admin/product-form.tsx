"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Category, Collection, Ingredient } from "@prisma/client";

import { createProductAction, updateProductAction, type ProductFormInput } from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const inputClass = "w-full rounded-xl border border-[#dcc7ad] bg-[#faf7f3] px-3.5 py-2.5 text-sm text-[#1b120d] outline-none focus:border-[#c49242]";
const labelClass = "block text-xs uppercase tracking-[0.1em] text-[#8a7469] mb-1.5";

export function ProductForm({
  categories,
  collections,
  ingredients,
  initial,
  productId,
}: {
  categories: Category[];
  collections: Collection[];
  ingredients: Ingredient[];
  initial?: Partial<ProductFormInput>;
  productId?: string;
}) {
  const [form, setForm] = useState<ProductFormInput>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? "",
    collectionId: initial?.collectionId ?? "",
    price: initial?.price ?? 0,
    salePrice: initial?.salePrice ?? null,
    sku: initial?.sku ?? "",
    stock: initial?.stock ?? 0,
    isPublished: initial?.isPublished ?? true,
    isFeatured: initial?.isFeatured ?? false,
    isNew: initial?.isNew ?? false,
    productType: initial?.productType ?? "",
    skinConcern: initial?.skinConcern ?? "",
    benefit: initial?.benefit ?? "",
    format: initial?.format ?? "",
    ingredientNotes: initial?.ingredientNotes ?? "",
    usageInstructions: initial?.usageInstructions ?? "",
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    images: initial?.images ?? [],
    ingredientIds: initial?.ingredientIds ?? [],
    faqs: initial?.faqs ?? [],
    variants: initial?.variants ?? [],
  });
  const [imageText, setImageText] = useState((initial?.images ?? []).join("\n"));
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function set<K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const images = imageText.split("\n").map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, images };

    startTransition(async () => {
      const result = productId ? await updateProductAction(productId, payload) : await createProductAction(payload);
      if (result?.success === false) {
        push(result.error ?? "Something went wrong.", "error");
      } else if (productId) {
        push("Product updated", "success");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <h2 className="text-xl font-medium text-[#1b120d]">Basic information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Name</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={form.name} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Short description</label>
            <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <h2 className="text-xl font-medium text-[#1b120d]">Organization</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Category</label>
            <select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value)} className={inputClass}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Collection</label>
            <select value={form.collectionId ?? ""} onChange={(e) => set("collectionId", e.target.value)} className={inputClass}>
              <option value="">None</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Product type</label>
            <input value={form.productType} onChange={(e) => set("productType", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Benefit</label>
            <input value={form.benefit} onChange={(e) => set("benefit", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Skin concern</label>
            <input value={form.skinConcern} onChange={(e) => set("skinConcern", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Format</label>
            <input value={form.format} onChange={(e) => set("format", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {ingredients.map((ing) => {
            const active = form.ingredientIds.includes(ing.id);
            return (
              <button
                type="button"
                key={ing.id}
                onClick={() =>
                  set("ingredientIds", active ? form.ingredientIds.filter((i) => i !== ing.id) : [...form.ingredientIds, ing.id])
                }
                className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-[#1b120d] bg-[#1b120d] text-white" : "border-[#dcc7ad] bg-white text-[#4f3e36]"}`}
              >
                {ing.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <h2 className="text-xl font-medium text-[#1b120d]">Pricing & inventory</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className={labelClass}>Price</label>
            <input required type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sale price</label>
            <input type="number" min={0} value={form.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input required value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input required type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-[#4f3e36]">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} /> Published
          </label>
          <label className="flex items-center gap-2 text-sm text-[#4f3e36]">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-[#4f3e36]">
            <input type="checkbox" checked={form.isNew} onChange={(e) => set("isNew", e.target.checked)} /> New arrival
          </label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <h2 className="text-xl font-medium text-[#1b120d]">Media</h2>
        <label className={`${labelClass} mt-4`}>Image URLs (one per line, first = primary)</label>
        <textarea rows={4} value={imageText} onChange={(e) => setImageText(e.target.value)} className={inputClass} placeholder="https://…" />
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <h2 className="text-xl font-medium text-[#1b120d]">Content</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={labelClass}>Ingredient notes</label>
            <textarea rows={2} value={form.ingredientNotes} onChange={(e) => set("ingredientNotes", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Usage instructions</label>
            <textarea rows={2} value={form.usageInstructions} onChange={(e) => set("usageInstructions", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#1b120d]">Variants</h2>
          <Button
            type="button"
            variant="outline"
            className="gap-1 rounded-full px-3 py-2 text-[10px] tracking-[0.1em]"
            onClick={() => set("variants", [...form.variants, { name: "", sku: "", price: form.price, salePrice: null, stock: 0 }])}
          >
            <Plus size={13} /> Add variant
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {form.variants.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-[#eadac2] bg-[#faf6f1] p-3 md:grid-cols-5">
              <input placeholder="Name" value={v.name} onChange={(e) => { const next = [...form.variants]; next[i] = { ...v, name: e.target.value }; set("variants", next); }} className={inputClass} />
              <input placeholder="SKU" value={v.sku} onChange={(e) => { const next = [...form.variants]; next[i] = { ...v, sku: e.target.value }; set("variants", next); }} className={inputClass} />
              <input type="number" placeholder="Price" value={v.price} onChange={(e) => { const next = [...form.variants]; next[i] = { ...v, price: Number(e.target.value) }; set("variants", next); }} className={inputClass} />
              <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const next = [...form.variants]; next[i] = { ...v, stock: Number(e.target.value) }; set("variants", next); }} className={inputClass} />
              <button type="button" onClick={() => set("variants", form.variants.filter((_, idx) => idx !== i))} className="flex items-center justify-center rounded-xl border border-[#eadac2] text-[#a4372e]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#1b120d]">FAQs</h2>
          <Button
            type="button"
            variant="outline"
            className="gap-1 rounded-full px-3 py-2 text-[10px] tracking-[0.1em]"
            onClick={() => set("faqs", [...form.faqs, { question: "", answer: "" }])}
          >
            <Plus size={13} /> Add FAQ
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {form.faqs.map((f, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-[#eadac2] bg-[#faf6f1] p-3 md:grid-cols-[1fr_1fr_auto]">
              <input placeholder="Question" value={f.question} onChange={(e) => { const next = [...form.faqs]; next[i] = { ...f, question: e.target.value }; set("faqs", next); }} className={inputClass} />
              <input placeholder="Answer" value={f.answer} onChange={(e) => { const next = [...form.faqs]; next[i] = { ...f, answer: e.target.value }; set("faqs", next); }} className={inputClass} />
              <button type="button" onClick={() => set("faqs", form.faqs.filter((_, idx) => idx !== i))} className="flex items-center justify-center rounded-xl border border-[#eadac2] text-[#a4372e]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
        <h2 className="text-xl font-medium text-[#1b120d]">SEO</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={labelClass}>SEO title</label>
            <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Meta description</label>
            <textarea rows={2} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={pending} className="rounded-full px-6 py-3.5 text-[11px] tracking-[0.12em]">
        {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
