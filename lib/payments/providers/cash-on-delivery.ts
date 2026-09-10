import type { PaymentProvider } from "@/lib/payments/types";

export const cashOnDelivery: PaymentProvider = {
  key: "CASH_ON_DELIVERY",
  label: "Cash on Delivery",
  isLive: true,
  async initiate() {
    return { status: "PENDING" };
  },
};
