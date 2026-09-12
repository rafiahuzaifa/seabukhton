import { IngredientManager } from "@/components/admin/ingredient-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminIngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Catalog setup</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Ingredients</h1>
      </div>
      <IngredientManager ingredients={ingredients} />
    </div>
  );
}
