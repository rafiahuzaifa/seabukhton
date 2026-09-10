import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

const statuses = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = status && statuses.includes(status as (typeof statuses)[number]) ? status : "ALL";

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: filter === "ALL" ? {} : { status: filter as never },
      include: { items: true, user: true, address: true },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Sales</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Orders</h1>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}
            className={`rounded-full border px-3.5 py-2 text-xs uppercase tracking-[0.1em] ${filter === s ? "border-[#1b120d] bg-[#1b120d] text-white" : "border-[#dcc7ad] bg-white text-[#54453f]"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#f0e7dc] last:border-0">
                <td className="px-5 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-[#1b120d]">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-4 text-[#54453f]">{order.user?.name ?? order.address?.firstName ?? order.guestEmail ?? "Guest"}</td>
                <td className="px-5 py-4 text-[#54453f]">{order.items.length}</td>
                <td className="px-5 py-4 text-[#54453f]">{formatPrice(order.total, settings.currencySymbol)}</td>
                <td className="px-5 py-4 text-[#54453f]">{order.status}</td>
                <td className="px-5 py-4 text-[#8a7469]">{order.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
