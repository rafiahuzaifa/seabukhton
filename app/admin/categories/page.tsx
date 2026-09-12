import { CategoryManager } from "@/components/admin/category-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Catalog setup</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Categories</h1>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
