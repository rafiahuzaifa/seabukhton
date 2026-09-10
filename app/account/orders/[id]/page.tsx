import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { CheckCircle2, Circle, Truck } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";

const trackingSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [order, settings] = await Promise.all([
    prisma.order.findFirst({
      where: { id, userId: session.user.id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        address: true,
        payment: true,
        shipment: true,
      },
    }),
    getSiteSettings(),
  ]);

  if (!order) notFound();

  const currentStepIndex = trackingSteps.indexOf(order.status);
  const isTerminalIssue = ["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Order</p>
            <h2 className="mt-1 text-3xl text-[#1b120d]">{order.orderNumber}</h2>
          </div>
          <p className="text-sm text-[#7a6356]">Placed {order.createdAt.toLocaleDateString()}</p>
        </div>

        {isTerminalIssue ? (
          <p className="mt-6 rounded-full bg-[#faeaea] px-4 py-2 text-sm text-[#a4372e]">Order {order.status.toLowerCase()}</p>
        ) : (
          <div className="mt-8 flex items-center justify-between">
            {trackingSteps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
                <div className="flex w-full items-center">
                  {i > 0 ? <div className={`h-px flex-1 ${i <= currentStepIndex ? "bg-[#c49242]" : "bg-[#eadac2]"}`} /> : <div className="flex-1" />}
                  {i <= currentStepIndex ? (
                    <CheckCircle2 size={20} className="text-[#c49242]" />
                  ) : (
                    <Circle size={20} className="text-[#eadac2]" />
                  )}
                  {i < trackingSteps.length - 1 ? (
                    <div className={`h-px flex-1 ${i < currentStepIndex ? "bg-[#c49242]" : "bg-[#eadac2]"}`} />
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#7a6356]">{step}</span>
              </div>
            ))}
          </div>
        )}

        {order.trackingCode ? (
          <div className="mt-6 flex items-center gap-2 rounded-full border border-[#eadac2] bg-[#faf6f1] px-4 py-3 text-sm text-[#54453f]">
            <Truck size={16} className="text-[#c49242]" />
            Tracking code: {order.trackingCode}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-[1.5rem] border border-[#eadac2] bg-white p-4">
              {item.product.images[0]?.url ? (
                <Image src={item.product.images[0].url} alt={item.product.name} width={72} height={72} className="h-18 w-18 rounded-xl object-cover" />
              ) : null}
              <div className="flex-1">
                <p className="font-medium text-[#1b120d]">{item.product.name}</p>
                <p className="text-sm text-[#7a6356]">Qty {item.quantity}</p>
              </div>
              <p className="text-[#1b120d]">{formatPrice(Number(item.price) * item.quantity, settings.currencySymbol)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5">
            <h3 className="font-medium text-[#1b120d]">Order summary</h3>
            <div className="mt-4 space-y-2 text-sm text-[#54453f]">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal, settings.currencySymbol)}</span></div>
              {Number(order.discount) > 0 ? <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(order.discount, settings.currencySymbol)}</span></div> : null}
              <div className="flex justify-between"><span>Shipping</span><span>{Number(order.shipping) === 0 ? "Free" : formatPrice(order.shipping, settings.currencySymbol)}</span></div>
              <div className="flex justify-between font-medium text-[#1b120d]"><span>Total</span><span>{formatPrice(order.total, settings.currencySymbol)}</span></div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.1em] text-[#8a7469]">Payment: {order.paymentMethod.replace(/_/g, " ")}</p>
            {order.payment ? <p className="mt-1 text-xs text-[#8a7469]">Status: {order.payment.status}</p> : null}
          </div>

          {order.address ? (
            <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
              <h3 className="font-medium text-[#1b120d]">Shipping address</h3>
              <p className="mt-3 text-sm text-[#54453f]">
                {order.address.firstName} {order.address.lastName}
                <br />
                {order.address.street}, {order.address.area ? `${order.address.area}, ` : ""}
                {order.address.city}
                <br />
                {order.address.phone}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
