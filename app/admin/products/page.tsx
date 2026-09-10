import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Products</h1>
        </div>
        <Button asChild className="gap-2 rounded-full px-5 py-3 text-[11px] tracking-[0.12em]">
          <Link href="/admin/products/new">
            <Plus size={15} /> New product
          </Link>
        </Button>
      </div>

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="w-full max-w-sm rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none"
        />
      </form>

      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[#f0e7dc] last:border-0">
                <td className="px-5 py-4">
                  <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3">
                    {product.images[0]?.url ? (
                      <Image src={product.images[0].url} alt={product.name} width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />
                    ) : (
                      <div className="h-11 w-11 rounded-lg bg-[#f0e7dc]" />
                    )}
                    <div>
                      <p className="font-medium text-[#1b120d]">{product.name}</p>
                      <p className="text-xs text-[#8a7469]">{product.sku}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4 text-[#54453f]">{product.category?.name ?? "—"}</td>
                <td className="px-5 py-4 text-[#54453f]">{formatPrice(product.salePrice ?? product.price, settings.currencySymbol)}</td>
                <td className="px-5 py-4">
                  <span className={product.stock <= 5 ? "text-[#a4372e]" : "text-[#54453f]"}>{product.stock}</span>
                </td>
                <td className="px-5 py-4">
                  <ProductRowActions id={product.id} isPublished={product.isPublished} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
