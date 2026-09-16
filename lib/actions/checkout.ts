"use server";

import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { cartSummary } from "@/lib/cart";
import { validateCoupon } from "@/lib/coupons";
import { getSiteSettings } from "@/lib/data/settings";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentMethodKey } from "@/lib/payments/types";
import { prisma } from "@/lib/prisma";
import { emailTemplates, sendMail } from "@/lib/mail";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(6, "Enter a valid phone number."),
  street: z.string().min(3, "Street address is required."),
  city: z.string().min(2, "City is required."),
  area: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Pakistan"),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "CARD", "LOCAL_GATEWAY"]),
  saveAddress: z.boolean().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function generateOrderNumber() {
  return `HRB-${Date.now().toString(36).toUpperCase()}`;
}

export async function placeOrderAction(input: CheckoutInput) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const data = parsed.data;

  const session = await getServerSession(authOptions);
  const { cart, subtotal } = await cartSummary();

  if (cart.items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  for (const item of cart.items) {
    const availableStock = item.variant
      ? item.product.variants.find((v) => v.id === item.variant)?.stock ?? 0
      : item.product.stock;
    if (item.quantity > availableStock) {
      return { success: false, error: `${item.product.name} only has ${availableStock} left in stock.` };
    }
  }

  const settings = await getSiteSettings();
  const provider = getPaymentProvider(data.paymentMethod as PaymentMethodKey);
  if (!provider.isLive) {
    return { success: false, error: `${provider.label} is not yet connected. Please choose another payment method.` };
  }

  const cookieStore = await cookies();
  const appliedCode = cookieStore.get("herbova_coupon")?.value ?? null;
  const couponResult = appliedCode ? await validateCoupon(appliedCode, subtotal, session?.user?.id) : null;
  const discount = couponResult?.valid ? couponResult.discount : 0;

  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
  const total = Math.max(0, subtotal - discount) + shipping;

  const address = await prisma.address.create({
    data: {
      userId: session?.user?.id ?? null,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      city: data.city,
      area: data.area,
      street: data.street,
      postalCode: data.postalCode,
      isDefault: Boolean(session?.user?.id),
    },
  });

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id ?? null,
      guestEmail: session?.user?.id ? null : data.email,
      addressId: address.id,
      couponId: couponResult?.valid ? couponResult.coupon.id : null,
      status: "PENDING",
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod: data.paymentMethod,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.variant
            ? (item.product.variants.find((v) => v.id === item.variant)?.salePrice ??
              item.product.variants.find((v) => v.id === item.variant)?.price ??
              item.product.price)
            : (item.product.salePrice ?? item.product.price),
        })),
      },
    },
  });

  const paymentResult = await provider.initiate({ orderId: order.id, amount: total });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: data.paymentMethod,
      status: paymentResult.status,
      amount: total,
      reference: paymentResult.reference,
    },
  });

  for (const item of cart.items) {
    await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    await prisma.inventoryTransaction.create({
      data: { productId: item.productId, type: "SALE", quantity: -item.quantity, reason: `Order ${orderNumber}` },
    });
    if (item.variant) {
      await prisma.productVariant.update({ where: { id: item.variant }, data: { stock: { decrement: item.quantity } } });
    }
  }

  if (couponResult?.valid) {
    await prisma.couponUsage.create({
      data: { couponId: couponResult.coupon.id, userId: session?.user?.id ?? null, orderId: order.id },
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  cookieStore.set("herbova_coupon", "", { maxAge: 0, path: "/" });

  if (session?.user?.id) {
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Order placed",
        body: `Your order ${orderNumber} has been placed successfully.`,
        href: `/account/orders/${order.id}`,
      },
    });
  }

  await sendMail({ to: data.email, ...emailTemplates.orderConfirmation(orderNumber) });

  return { success: true, orderId: order.id, orderNumber };
}
