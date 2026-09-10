import type { PaymentProvider } from "@/lib/payments/types";

/**
 * Card payments architecture. Swap the body of `initiate` for a real gateway call
 * (Stripe PaymentIntents, etc.) once STRIPE_SECRET_KEY (or equivalent) is set —
 * the checkout flow and Payment/Order models do not need to change.
 */
export const card: PaymentProvider = {
  key: "CARD",
  label: "Card Payments",
  isLive: Boolean(process.env.STRIPE_SECRET_KEY),
  async initiate({ orderId, amount }) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Card payments are not yet connected. Configure STRIPE_SECRET_KEY to enable this method.");
    }
    // Real integration point: create a PaymentIntent / hosted checkout session here
    // using `orderId` and `amount`, then return its redirect URL and reference.
    return { status: "REQUIRES_ACTION", reference: `stripe_${orderId}`, redirectUrl: undefined };
  },
};
