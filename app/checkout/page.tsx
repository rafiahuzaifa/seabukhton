import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import { Header } from "@/components/header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { authOptions } from "@/lib/auth";
import { cartSummary } from "@/lib/cart";
import { validateCoupon } from "@/lib/coupons";
import { getSiteSettings, formatPrice } from "@/lib/data/settings";
import { paymentProviders } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const [session, { cart, subtotal }, settings, cookieStore] = await Promise.all([
    getServerSession(authOptions),
    cartSummary(),
    getSiteSettings(),
    cookies(),
  ]);

  if (cart.items.length === 0) redirect("/cart");

  const appliedCode = cookieStore.get("herbova_coupon")?.value ?? null;
  const couponResult = appliedCode ? await validateCoupon(appliedCode, subtotal, session?.user?.id) : null;
  const discount = couponResult?.valid ? couponResult.discount : 0;
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
  const total = Math.max(0, subtotal - discount) + shipping;

  const defaultAddress = session?.user?.id
    ? await prisma.address.findFirst({ where: { userId: session.user.id, isDefault: true } })
    : null;

  const paymentOptions = Object.values(paymentProviders).map((p) => ({ key: p.key, label: p.label, isLive: p.isLive }));

  return (
    <>
      <Header />
      <main className="container py-12">
        <div className="mb-8">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">Complete your order</h1>
          {!session ? (
            <p className="mt-2 text-sm text-[#7a6356]">
              Checking out as a guest —{" "}
              <a href="/login?callbackUrl=/checkout" className="underline underline-offset-2">
                sign in
              </a>{" "}
              to save your details.
            </p>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <CheckoutForm
            paymentOptions={paymentOptions}
            defaults={{
              firstName: defaultAddress?.firstName ?? session?.user?.name?.split(" ")[0] ?? "",
              lastName: defaultAddress?.lastName ?? session?.user?.name?.split(" ").slice(1).join(" ") ?? "",
              email: defaultAddress?.email ?? session?.user?.email ?? "",
              phone: defaultAddress?.phone ?? "",
              street: defaultAddress?.street ?? "",
              city: defaultAddress?.city ?? "",
              area: defaultAddress?.area ?? "",
              postalCode: defaultAddress?.postalCode ?? "",
            }}
          />

          <aside className="h-fit rounded-[1.75rem] border border-[#eadac2] bg-[#faf6f1] p-6 shadow-sm">
            <h2 className="text-2xl font-medium text-[#1b120d]">Order summary</h2>
            <div className="mt-6 space-y-4 text-[#54453f]">
              {cart.items.map((item) => {
                const variant = item.variant ? item.product.variants.find((v) => v.id === item.variant) : null;
                const unitPrice = variant
                  ? Number(variant.salePrice ?? variant.price)
                  : Number(item.product.salePrice ?? item.product.price);
                return (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(unitPrice * item.quantity, settings.currencySymbol)}</span>
                  </div>
                );
              })}
              <div className="h-px bg-[#e6d8c8]" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, settings.currencySymbol)}</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-[#3e5c37]">
                  <span>Coupon ({appliedCode})</span>
                  <span>-{formatPrice(discount, settings.currencySymbol)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping, settings.currencySymbol)}</span>
              </div>
            </div>
            <div className="my-6 h-px bg-[#e6d8c8]" />
            <div className="flex justify-between text-lg font-medium text-[#1b120d]">
              <span>Total</span>
              <span>{formatPrice(total, settings.currencySymbol)}</span>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
