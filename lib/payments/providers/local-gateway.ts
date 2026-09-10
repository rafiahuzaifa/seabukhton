import type { PaymentProvider } from "@/lib/payments/types";

/**
 * Local payment gateway architecture (e.g. JazzCash, Easypaisa, PayFast).
 * Swap `initiate` for a real API call once LOCAL_GATEWAY_API_KEY is set —
 * the checkout flow and Payment/Order models do not need to change.
 */
export const localGateway: PaymentProvider = {
  key: "LOCAL_GATEWAY",
  label: "Local Payment Gateway",
  isLive: Boolean(process.env.LOCAL_GATEWAY_API_KEY),
  async initiate({ orderId, amount }) {
    if (!process.env.LOCAL_GATEWAY_API_KEY) {
      throw new Error("This payment gateway is not yet connected.");
    }
    return { status: "REQUIRES_ACTION", reference: `gateway_${orderId}`, redirectUrl: undefined };
  },
};
