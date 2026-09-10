import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AdminDashboard() {
  const [orders, customerCount, products, settings] = await Promise.all([
    prisma.order.findMany({ include: { items: true, user: true }, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.findMany({ include: { orderItems: true } }),
    getSiteSettings(),
  ]);

  const paidOrders = orders.filter((o) => !["CANCELLED", "REFUNDED"].includes(o.status));
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;

  const bestSellers = [...products]
    .map((p) => ({ name: p.name, sold: p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0) }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const lowStock = products.filter((p) => p.stock <= 5 && p.stock > 0).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const dailyRevenue = last7Days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const revenue = paidOrders
      .filter((o) => o.createdAt >= day && o.createdAt < next)
      .reduce((sum, o) => sum + Number(o.total), 0);
    return { day, revenue };
  });
  const maxRevenue = Math.max(1, ...dailyRevenue.map((d) => d.revenue));

  const metrics = [
    { label: "Total revenue", value: formatPrice(totalRevenue, settings.currencySymbol) },
    { label: "Total orders", value: orders.length.toLocaleString() },
    { label: "Customers", value: customerCount.toLocaleString() },
    { label: "Average order value", value: formatPrice(avgOrderValue, settings.currencySymbol) },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Admin dashboard</p>
        <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">Operations overview</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[1.6rem] border border-[#eadac2] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.14em] text-[#7a6356]">{metric.label}</p>
            <p className="mt-4 text-4xl font-medium text-[#1b120d]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-medium text-[#1b120d]">Sales — last 7 days</h2>
        <div className="mt-6 flex items-end gap-3">
          {dailyRevenue.map(({ day, revenue }) => (
            <div key={day.toISOString()} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-[#c49242]"
                  style={{ height: `${Math.max(4, (revenue / maxRevenue) * 100)}%` }}
                  title={formatPrice(revenue, settings.currencySymbol)}
                />
              </div>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#8a7469]">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-medium text-[#1b120d]">Best-selling products</h2>
          <div className="mt-5 space-y-3 text-[#54453f]">
            {bestSellers.length ? (
              bestSellers.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between rounded-[1.15rem] border border-[#e7d9c9] bg-[#faf6f1] px-4 py-3">
                  <span>{index + 1}. {product.name}</span>
                  <span>{product.sold} sold</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8a7469]">No sales yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-[#1b120d]">Low stock</h2>
            <Link href="/admin/inventory" className="text-xs uppercase tracking-[0.1em] text-[#6e5245]">Inventory</Link>
          </div>
          <p className="mt-1 text-xs text-[#a4372e]">{outOfStock} product{outOfStock === 1 ? "" : "s"} out of stock</p>
          <div className="mt-4 space-y-3 text-[#54453f]">
            {lowStock.length ? (
              lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-[1.15rem] border border-[#e7d9c9] bg-[#faf6f1] px-4 py-3">
                  <span>{product.name}</span>
                  <span className="text-[#a4372e]">{product.stock} left</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#8a7469]">Stock levels look healthy.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-[#1b120d]">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-[0.1em] text-[#6e5245]">View all</Link>
          </div>
          <div className="mt-5 space-y-3 text-[#54453f]">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between rounded-[1.15rem] border border-[#e7d9c9] bg-[#faf6f1] px-4 py-3"
              >
                <span>{order.orderNumber}</span>
                <span>{order.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
