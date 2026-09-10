import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AdminAnalyticsPage() {
  const [orders, productViews, newsletterCount, couponUsages, categories, settings] = await Promise.all([
    prisma.order.findMany({ include: { items: { include: { product: { include: { category: true } } } } } }),
    prisma.productView.count(),
    prisma.newsletterSubscriber.count(),
    prisma.couponUsage.findMany({ include: { coupon: true } }),
    prisma.category.findMany(),
    getSiteSettings(),
  ]);

  const paidOrders = orders.filter((o) => !["CANCELLED", "REFUNDED"].includes(o.status));
  const revenueByCategory = new Map<string, number>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const name = item.product.category?.name ?? "Uncategorized";
      revenueByCategory.set(name, (revenueByCategory.get(name) ?? 0) + Number(item.price) * item.quantity);
    }
  }
  const maxCategoryRevenue = Math.max(1, ...revenueByCategory.values());

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const couponUsageCounts = new Map<string, number>();
  for (const usage of couponUsages) {
    couponUsageCounts.set(usage.coupon.code, (couponUsageCounts.get(usage.coupon.code) ?? 0) + 1);
  }

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Insights</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Analytics</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Product views</p>
          <p className="mt-2 text-2xl font-medium text-[#1b120d]">{productViews.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Newsletter subscribers</p>
          <p className="mt-2 text-2xl font-medium text-[#1b120d]">{newsletterCount.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.1em] text-[#8a7469]">Coupon redemptions</p>
          <p className="mt-2 text-2xl font-medium text-[#1b120d]">{couponUsages.length.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
          <h2 className="text-lg font-medium text-[#1b120d]">Revenue by category</h2>
          <div className="mt-4 space-y-3">
            {[...revenueByCategory.entries()].map(([name, revenue]) => (
              <div key={name}>
                <div className="flex justify-between text-sm text-[#54453f]">
                  <span>{name}</span>
                  <span>{formatPrice(revenue, settings.currencySymbol)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#eee1d2]">
                  <div className="h-full rounded-full bg-[#c49242]" style={{ width: `${(revenue / maxCategoryRevenue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6">
          <h2 className="text-lg font-medium text-[#1b120d]">Orders by status</h2>
          <div className="mt-4 space-y-2 text-sm text-[#54453f]">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-xl border border-[#eadac2] bg-[#faf6f1] px-4 py-2.5">
                <span>{status}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-[#1b120d]">Coupon performance</h2>
          <div className="mt-4 space-y-2 text-sm text-[#54453f]">
            {[...couponUsageCounts.entries()].map(([code, count]) => (
              <div key={code} className="flex items-center justify-between rounded-xl border border-[#eadac2] bg-[#faf6f1] px-4 py-2.5">
                <span>{code}</span>
                <span>{count} redemption{count === 1 ? "" : "s"}</span>
              </div>
            ))}
            {!couponUsageCounts.size ? <p className="text-[#8a7469]">No coupon redemptions yet.</p> : null}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-[#8a7469]">
        Categories tracked: {categories.length}. Connect NEXT_PUBLIC_GA_ID and NEXT_PUBLIC_META_PIXEL_ID in your environment to enable
        Google Analytics and Meta Pixel tracking on the storefront.
      </p>
    </div>
  );
}
