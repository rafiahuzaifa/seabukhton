import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, collections, ingredients] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: true, ingredients: true, faqs: true, variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.collection.findMany({ orderBy: { name: "asc" } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">{product.name}</h1>
      </div>
      <ProductForm
        productId={product.id}
        categories={categories}
        collections={collections}
        ingredients={ingredients}
        initial={{
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription ?? "",
          description: product.description,
          categoryId: product.categoryId ?? "",
          collectionId: product.collectionId ?? "",
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          sku: product.sku,
          stock: product.stock,
          isPublished: product.isPublished,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          productType: product.productType ?? "",
          skinConcern: product.skinConcern ?? "",
          benefit: product.benefit ?? "",
          format: product.format ?? "",
          ingredientNotes: product.ingredientNotes ?? "",
          usageInstructions: product.usageInstructions ?? "",
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          images: product.images.map((i) => i.url),
          ingredientIds: product.ingredients.map((i) => i.ingredientId),
          faqs: product.faqs.map((f) => ({ question: f.question, answer: f.answer })),
          variants: product.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            salePrice: v.salePrice ? Number(v.salePrice) : null,
            stock: v.stock,
          })),
        }}
      />
    </div>
  );
}
