import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [user, orders, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    getSiteSettings(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-medium text-[#1b120d]">Profile overview</h2>
        <div className="mt-5 space-y-3 text-[#54453f]">
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Phone: {user?.phone ?? "Not set"}</p>
          <p>Loyalty points: {user?.loyaltyPoints ?? 0}</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[#eadac2] bg-[#faf6f1] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-[#1b120d]">Recent orders</h2>
          <Link href="/account/orders" className="text-xs uppercase tracking-[0.12em] text-[#6e5245]">
            View all
          </Link>
        </div>
        <div className="mt-5 space-y-4">
          {orders.length ? (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-[1.25rem] border border-[#e7d9c9] bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#1b120d]">{order.orderNumber}</p>
                  <p className="text-sm text-[#6d5349]">{order.status}</p>
                </div>
                <span className="font-medium text-[#1b120d]">{formatPrice(order.total, settings.currencySymbol)}</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-[#7a6356]">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
