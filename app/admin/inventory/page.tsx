import { StockAdjuster } from "@/components/admin/stock-adjuster";
import { prisma } from "@/lib/prisma";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { stock: "asc" },
  });

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Operations</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Inventory</h1>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Low stock (≤5)</p>
          <p className="mt-2 text-2xl font-medium text-[#a4372e]">{lowStock}</p>
        </div>
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Out of stock</p>
          <p className="mt-2 text-2xl font-medium text-[#a4372e]">{outOfStock}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">Stock / adjust</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[#f0e7dc] last:border-0">
                <td className="px-5 py-4 font-medium text-[#1b120d]">{product.name}</td>
                <td className="px-5 py-4 text-[#8a7469]">{product.sku}</td>
                <td className="px-5 py-4">
                  <StockAdjuster productId={product.id} stock={product.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
