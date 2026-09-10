import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CouponWidget } from "@/components/cart/coupon-widget";
import { ProductCard } from "@/components/product/product-card";
import { cartSummary, lineItemPrice } from "@/lib/cart";
import { validateCoupon } from "@/lib/coupons";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";
import { prisma } from "@/lib/prisma";

export default async function CartPage() {
  const [{ cart, subtotal, itemCount }, settings, cookieStore] = await Promise.all([
    cartSummary(),
    getSiteSettings(),
    cookies(),
  ]);

  const appliedCode = cookieStore.get("berriva_coupon")?.value ?? null;
  const couponResult = appliedCode ? await validateCoupon(appliedCode, subtotal) : null;
  const discount = couponResult?.valid ? couponResult.discount : 0;

  const shipping = subtotal === 0 ? 0 : subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
  const total = Math.max(0, subtotal - discount) + shipping;
  const remainingForFreeShipping = Math.max(0, settings.freeShippingThreshold - subtotal);

  const recommended = cart.items.length
    ? await prisma.product.findMany({
        where: { isPublished: true, id: { notIn: cart.items.map((i) => i.productId) } },
        include: { images: true, category: true },
        orderBy: { rating: "desc" },
        take: 4,
      })
    : [];

  return (
    <>
      <Header />
      <main className="container py-10 md:py-14">
        <div className="mb-8">
          <p className="eyebrow">Your bag</p>
          <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">Shopping bag</h1>
        </div>

        {itemCount === 0 ? (
          <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-16 text-center">
            <ShoppingBag size={36} className="mx-auto text-[#c49242]" />
            <p className="mt-4 text-lg text-[#54453f]">Your bag is empty.</p>
            <Button asChild className="mt-6 rounded-full px-6 py-3 text-[11px] tracking-[0.12em]">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {remainingForFreeShipping > 0 ? (
                <div className="rounded-[1.25rem] border border-[#eadac2] bg-[#faf6f1] p-4 text-sm text-[#54453f]">
                  You&apos;re {formatPrice(remainingForFreeShipping, settings.currencySymbol)} away from free delivery.
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#eee1d2]">
                    <div
                      className="h-full rounded-full bg-[#c49242]"
                      style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.25rem] border border-[#c9dfc4] bg-[#f2f7ef] p-4 text-sm text-[#3e5c37]">
                  You&apos;ve unlocked free delivery.
                </div>
              )}

              {cart.items.map((item) => {
                const variant = item.variant ? item.product.variants.find((v) => v.id === item.variant) : null;
                const unitPrice = variant
                  ? Number(variant.salePrice ?? variant.price)
                  : Number(item.product.salePrice ?? item.product.price);
                return (
                  <CartItemRow
                    key={item.id}
                    id={item.id}
                    name={item.product.name}
                    slug={item.product.slug}
                    image={item.product.images[0]?.url ?? item.product.featuredImage ?? ""}
                    unitPrice={unitPrice}
                    quantity={item.quantity}
                    variantLabel={variant?.name}
                    currencySymbol={settings.currencySymbol}
                  />
                );
              })}
            </div>

            <aside className="h-fit space-y-5 rounded-[1.75rem] border border-[#eadac2] bg-[#faf6f1] p-6 shadow-sm">
              <h2 className="text-2xl font-medium text-[#1b120d]">Order summary</h2>
              <CouponWidget subtotal={subtotal} currencySymbol={settings.currencySymbol} appliedCode={couponResult?.valid ? appliedCode : null} />
              <div className="space-y-3 text-[#54453f]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, settings.currencySymbol)}</span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-[#3e5c37]">
                    <span>Discount ({appliedCode})</span>
                    <span>-{formatPrice(discount, settings.currencySymbol)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping, settings.currencySymbol)}</span>
                </div>
              </div>
              <div className="h-px bg-[#e6d8c8]" />
              <div className="flex justify-between text-lg font-medium text-[#1b120d]">
                <span>Total</span>
                <span>{formatPrice(total, settings.currencySymbol)}</span>
              </div>
              <Button asChild className="w-full rounded-full px-5 py-3.5 text-[11px] tracking-[0.12em]">
                <Link href="/checkout">
                  Checkout <ArrowRight size={16} className="ml-2 inline" />
                </Link>
              </Button>
            </aside>
          </div>
        )}

        {recommended.length ? (
          <div className="mt-16">
            <h2 className="mb-6 text-3xl tracking-[-0.04em] text-[#1b120d]">You may also like</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {recommended.map((product) => (
                <ProductCard key={product.id} product={product} currencySymbol={settings.currencySymbol} />
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
