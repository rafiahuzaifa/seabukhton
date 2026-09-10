import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderActions } from "@/components/admin/order-actions";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        address: true,
        payment: true,
        shipment: true,
        user: true,
      },
    }),
    getSiteSettings(),
  ]);

  if (!order) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Order</p>
        <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b120d]">{order.orderNumber}</h1>
        <p className="mt-1 text-sm text-[#7a6356]">Placed {order.createdAt.toLocaleString()}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
            <h2 className="text-lg font-medium text-[#1b120d]">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#eadac2] bg-[#faf6f1] p-3">
                  {item.product.images[0]?.url ? (
                    <Image src={item.product.images[0].url} alt={item.product.name} width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                  ) : null}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1b120d]">{item.product.name}</p>
                    <p className="text-xs text-[#7a6356]">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm text-[#1b120d]">{formatPrice(Number(item.price) * item.quantity, settings.currencySymbol)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-[#eee1d2] pt-4 text-sm text-[#54453f]">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal, settings.currencySymbol)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(order.discount, settings.currencySymbol)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping, settings.currencySymbol)}</span></div>
              <div className="flex justify-between font-medium text-[#1b120d]"><span>Total</span><span>{formatPrice(order.total, settings.currencySymbol)}</span></div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
              <h2 className="text-lg font-medium text-[#1b120d]">Customer</h2>
              {order.user ? (
                <Link href={`/admin/customers/${order.user.id}`} className="mt-3 block text-sm text-[#54453f] underline underline-offset-2">
                  {order.user.name} — {order.user.email}
                </Link>
              ) : (
                <p className="mt-3 text-sm text-[#54453f]">Guest — {order.guestEmail}</p>
              )}
            </div>
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
              <h2 className="text-lg font-medium text-[#1b120d]">Shipping address</h2>
              {order.address ? (
                <p className="mt-3 text-sm text-[#54453f]">
                  {order.address.firstName} {order.address.lastName}
                  <br />
                  {order.address.street}, {order.address.city}
                  <br />
                  {order.address.phone}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
            <h2 className="text-lg font-medium text-[#1b120d]">Payment</h2>
            <p className="mt-3 text-sm text-[#54453f]">
              {order.paymentMethod.replace(/_/g, " ")} — {order.payment?.status ?? "PENDING"}
            </p>
          </div>

          {order.internalNotes ? (
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
              <h2 className="text-lg font-medium text-[#1b120d]">Internal notes</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[#54453f]">{order.internalNotes}</pre>
            </div>
          ) : null}
        </div>

        <OrderActions orderId={order.id} currentStatus={order.status} trackingCode={order.trackingCode} />
      </div>
    </div>
  );
}
