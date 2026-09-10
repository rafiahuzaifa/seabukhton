import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";

import { CustomerStatusToggle } from "@/components/admin/customer-status-toggle";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [customer, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: "desc" } },
        addresses: true,
        wishlist: { include: { items: { include: { product: true } } } },
        reviews: { include: { product: true } },
      },
    }),
    getSiteSettings(),
  ]);

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Customer</p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">{customer.name}</h1>
          <p className="mt-1 text-sm text-[#7a6356]">{customer.email}</p>
        </div>
        <CustomerStatusToggle userId={customer.id} isActive={customer.isActive} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Total spent</p>
          <p className="mt-2 text-2xl font-medium text-[#1b120d]">{formatPrice(totalSpent, settings.currencySymbol)}</p>
        </div>
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Orders</p>
          <p className="mt-2 text-2xl font-medium text-[#1b120d]">{customer.orders.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Loyalty points</p>
          <p className="mt-2 text-2xl font-medium text-[#1b120d]">{customer.loyaltyPoints}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <h2 className="text-lg font-medium text-[#1b120d]">Orders</h2>
          <div className="mt-3 space-y-2">
            {customer.orders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-[#eadac2] bg-[#faf6f1] px-4 py-3 text-sm">
                <span className="text-[#1b120d]">{order.orderNumber}</span>
                <span className="text-[#7a6356]">{order.status}</span>
                <span className="text-[#1b120d]">{formatPrice(order.total, settings.currencySymbol)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <h2 className="text-lg font-medium text-[#1b120d]">Saved addresses</h2>
          <div className="mt-3 space-y-2 text-sm text-[#54453f]">
            {customer.addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-[#eadac2] bg-[#faf6f1] px-4 py-3">
                {a.firstName} {a.lastName}, {a.street}, {a.city}
              </div>
            ))}
            {!customer.addresses.length ? <p className="text-[#8a7469]">No saved addresses.</p> : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <h2 className="text-lg font-medium text-[#1b120d]">Wishlist</h2>
          <div className="mt-3 space-y-2 text-sm text-[#54453f]">
            {customer.wishlist?.items.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#eadac2] bg-[#faf6f1] px-4 py-3">{item.product.name}</div>
            ))}
            {!customer.wishlist?.items.length ? <p className="text-[#8a7469]">No wishlist items.</p> : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <h2 className="text-lg font-medium text-[#1b120d]">Reviews</h2>
          <div className="mt-3 space-y-2 text-sm text-[#54453f]">
            {customer.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-[#eadac2] bg-[#faf6f1] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span>{review.product.name}</span>
                  <span className="flex items-center gap-1 text-[#d4aa67]">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </span>
                </div>
              </div>
            ))}
            {!customer.reviews.length ? <p className="text-[#8a7469]">No reviews yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
