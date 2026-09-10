import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AccountCouponsPage() {
  const [coupons, settings] = await Promise.all([
    prisma.coupon.findMany({ where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, orderBy: { createdAt: "desc" } }),
    getSiteSettings(),
  ]);

  if (!coupons.length) {
    return <p className="rounded-[1.75rem] border border-[#eadac2] bg-white p-10 text-center text-[#5d4d45]">No active coupons right now.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {coupons.map((coupon) => (
        <div key={coupon.id} className="rounded-[1.5rem] border border-dashed border-[#c49242] bg-[#faf6f1] p-5">
          <p className="text-2xl font-semibold tracking-[0.1em] text-[#1b120d]">{coupon.code}</p>
          <p className="mt-2 text-sm text-[#5d4d45]">
            {coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}% off` : `${formatPrice(coupon.value, settings.currencySymbol)} off`}
            {coupon.minOrderAmount ? ` orders over ${formatPrice(coupon.minOrderAmount, settings.currencySymbol)}` : ""}
          </p>
          {coupon.firstOrderOnly ? <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#8a7469]">First order only</p> : null}
        </div>
      ))}
    </div>
  );
}
