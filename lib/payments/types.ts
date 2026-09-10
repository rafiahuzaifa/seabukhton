export type PaymentMethodKey = "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "CARD" | "LOCAL_GATEWAY";

export type PaymentInitResult = {
  /** Status to store on the Payment record immediately after checkout. */
  status: "PENDING" | "AWAITING_TRANSFER" | "REQUIRES_ACTION" | "PAID";
  /** Optional URL to redirect the customer to (hosted checkout / bank instructions). */
  redirectUrl?: string;
  /** Provider-side reference, if one was created. */
  reference?: string;
};

export interface PaymentProvider {
  key: PaymentMethodKey;
  label: string;
  /** Whether this provider is fully connected (has real credentials) vs. architecture-only. */
  isLive: boolean;
  initiate(input: { orderId: string; amount: number }): Promise<PaymentInitResult>;
}
