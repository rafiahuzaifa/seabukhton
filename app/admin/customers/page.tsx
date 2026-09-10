import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const [customers, settings] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
      },
      include: { orders: true },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">People</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Customers</h1>
      </div>

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="w-full max-w-sm rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none"
        />
      </form>

      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Orders</th>
              <th className="px-5 py-4">Total spent</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);
              return (
                <tr key={customer.id} className="border-b border-[#f0e7dc] last:border-0">
                  <td className="px-5 py-4">
                    <Link href={`/admin/customers/${customer.id}`} className="font-medium text-[#1b120d]">
                      {customer.name}
                    </Link>
                    <p className="text-xs text-[#8a7469]">{customer.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#54453f]">{customer.orders.length}</td>
                  <td className="px-5 py-4 text-[#54453f]">{formatPrice(totalSpent, settings.currencySymbol)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${customer.isActive ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#faeaea] text-[#a4372e]"}`}>
                      {customer.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
