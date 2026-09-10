import type { PaymentProvider } from "@/lib/payments/types";

export const bankTransfer: PaymentProvider = {
  key: "BANK_TRANSFER",
  label: "Bank Transfer",
  isLive: true,
  async initiate() {
    return { status: "AWAITING_TRANSFER" };
  },
};
