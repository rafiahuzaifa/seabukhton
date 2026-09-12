import { CollectionManager } from "@/components/admin/collection-manager";
import { prisma } from "@/lib/prisma";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Catalog setup</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Collections</h1>
      </div>
      <CollectionManager collections={collections} />
    </div>
  );
}
