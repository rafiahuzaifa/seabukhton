import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";
import { prisma } from "@/lib/prisma";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: { include: { images: true } } } }, address: true, payment: true },
    }),
    getSiteSettings(),
  ]);

  if (!order) notFound();

  return (
    <>
      <Header />
      <main className="container py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#eadac2] bg-white p-8 text-center shadow-sm">
          <CheckCircle2 size={40} className="mx-auto text-[#4d7a43]" />
          <p className="eyebrow mt-4">Order confirmed</p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">Thank you, {order.address?.firstName}.</h1>
          <p className="mt-3 text-[#5d4d45]">
            Your order <span className="font-medium text-[#1b120d]">{order.orderNumber}</span> has been placed and is now{" "}
            {order.status.toLowerCase()}.
          </p>

          <div className="mt-8 space-y-3 text-left">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-[1.2rem] border border-[#eadac2] bg-[#faf6f1] p-3">
                {item.product.images[0]?.url ? (
                  <Image src={item.product.images[0].url} alt={item.product.name} width={56} height={56} className="h-14 w-14 rounded-lg object-cover" />
                ) : null}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1b120d]">{item.product.name}</p>
                  <p className="text-xs text-[#7a6356]">Qty {item.quantity}</p>
                </div>
                <p className="text-sm text-[#1b120d]">{formatPrice(Number(item.price) * item.quantity, settings.currencySymbol)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-left text-sm text-[#54453f]">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal, settings.currencySymbol)}</span></div>
            {Number(order.discount) > 0 ? (
              <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(order.discount, settings.currencySymbol)}</span></div>
            ) : null}
            <div className="flex justify-between"><span>Shipping</span><span>{Number(order.shipping) === 0 ? "Free" : formatPrice(order.shipping, settings.currencySymbol)}</span></div>
            <div className="flex justify-between text-base font-medium text-[#1b120d]"><span>Total</span><span>{formatPrice(order.total, settings.currencySymbol)}</span></div>
          </div>

          <p className="mt-6 text-sm text-[#7a6356]">
            {order.paymentMethod === "BANK_TRANSFER"
              ? "Please complete your bank transfer using the details we've emailed you — your order will be confirmed once payment is received."
              : "We'll send updates to your email as your order is prepared, shipped and delivered."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full px-6 py-3 text-[11px] tracking-[0.12em]">
              <Link href="/shop">Continue shopping</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full px-6 py-3 text-[11px] tracking-[0.12em]">
              <Link href={order.userId ? `/account/orders/${order.id}` : "/"}>Track order</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
