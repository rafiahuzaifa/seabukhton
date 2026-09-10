import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

const statusColors: Record<string, string> = {
  PENDING: "bg-[#f5e7d7] text-[#7a5a2e]",
  CONFIRMED: "bg-[#e6effb] text-[#2d5a94]",
  PROCESSING: "bg-[#e6effb] text-[#2d5a94]",
  SHIPPED: "bg-[#eef0fb] text-[#4b4ea0]",
  DELIVERED: "bg-[#eaf3e6] text-[#3e5c37]",
  CANCELLED: "bg-[#faeaea] text-[#a4372e]",
  RETURNED: "bg-[#faeaea] text-[#a4372e]",
  REFUNDED: "bg-[#f1ecec] text-[#6a5a55]",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  if (!orders.length) {
    return <p className="rounded-[1.75rem] border border-[#eadac2] bg-white p-8 text-center text-[#5d4d45]">No orders yet.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex flex-col gap-3 rounded-[1.5rem] border border-[#eadac2] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-medium text-[#1b120d]">{order.orderNumber}</p>
            <p className="text-sm text-[#7a6356]">
              {order.items.length} item{order.items.length > 1 ? "s" : ""} • {order.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.1em] ${statusColors[order.status]}`}>
              {order.status}
            </span>
            <span className="font-medium text-[#1b120d]">{formatPrice(order.total, settings.currencySymbol)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
