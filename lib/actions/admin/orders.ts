"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { emailTemplates, sendMail } from "@/lib/mail";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"]);

export async function updateOrderStatusAction(orderId: string, status: z.infer<typeof statusSchema>) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) return { success: false, error: "Invalid status." };

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: parsedStatus.data },
    include: { address: true, user: true, shipment: true },
  });

  if (order.shipment && (status === "SHIPPED" || status === "DELIVERED")) {
    await prisma.shipment.update({
      where: { orderId },
      data: status === "SHIPPED" ? { status, shippedAt: new Date() } : { status, deliveredAt: new Date() },
    });
  } else if (!order.shipment && status === "SHIPPED") {
    await prisma.shipment.create({ data: { orderId, status: "SHIPPED", shippedAt: new Date() } });
  }

  const email = order.address?.email ?? order.guestEmail;
  if (email) {
    if (status === "SHIPPED") await sendMail({ to: email, ...emailTemplates.orderShipped(order.orderNumber, order.trackingCode) });
    if (status === "DELIVERED") await sendMail({ to: email, ...emailTemplates.orderDelivered(order.orderNumber) });
    if (status === "CANCELLED") await sendMail({ to: email, ...emailTemplates.orderCancelled(order.orderNumber) });
  }

  if (order.userId) {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: `Order ${order.orderNumber} ${status.toLowerCase()}`,
        body: `Your order status has been updated to ${status.toLowerCase()}.`,
        href: `/account/orders/${order.id}`,
      },
    });
  }

  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "ORDER_STATUS_UPDATED", entityType: "Order", entityId: orderId, details: { status } },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function addTrackingAction(orderId: string, trackingCode: string, carrier?: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  await prisma.order.update({ where: { id: orderId }, data: { trackingCode } });
  await prisma.shipment.upsert({
    where: { orderId },
    update: { trackingNo: trackingCode, carrier },
    create: { orderId, trackingNo: trackingCode, carrier, status: "PENDING" },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function addInternalNoteAction(orderId: string, note: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  const existing = order?.internalNotes ? `${order.internalNotes}\n---\n` : "";
  const stamped = `[${new Date().toLocaleString()}] ${session.user.name ?? session.user.email}: ${note}`;

  await prisma.order.update({ where: { id: orderId }, data: { internalNotes: `${existing}${stamped}` } });
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function processRefundAction(orderId: string) {
  const session = await requireStaff();
  if (!session) return { success: false, error: "Not authorized." };

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "REFUNDED" },
    include: { address: true },
  });

  await prisma.payment.update({ where: { orderId }, data: { status: "REFUNDED" } }).catch(() => {});

  const email = order.address?.email ?? order.guestEmail;
  if (email) await sendMail({ to: email, ...emailTemplates.refundProcessed(order.orderNumber) });

  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "ORDER_REFUNDED", entityType: "Order", entityId: orderId },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
