import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const [categories, collections, ingredients] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">New product</h1>
      </div>
      <ProductForm categories={categories} collections={collections} ingredients={ingredients} />
    </div>
  );
}
