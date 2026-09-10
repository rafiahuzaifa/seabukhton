import { CouponManager } from "@/components/admin/coupon-manager";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/data/settings";

export default async function AdminCouponsPage() {
  const [coupons, settings] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Marketing</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Coupons</h1>
      </div>
      <CouponManager coupons={coupons} currencySymbol={settings.currencySymbol} />
    </div>
  );
}
