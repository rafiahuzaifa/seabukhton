import { bankTransfer } from "@/lib/payments/providers/bank-transfer";
import { card } from "@/lib/payments/providers/card";
import { cashOnDelivery } from "@/lib/payments/providers/cash-on-delivery";
import { localGateway } from "@/lib/payments/providers/local-gateway";
import type { PaymentMethodKey, PaymentProvider } from "@/lib/payments/types";

export const paymentProviders: Record<PaymentMethodKey, PaymentProvider> = {
  CASH_ON_DELIVERY: cashOnDelivery,
  BANK_TRANSFER: bankTransfer,
  CARD: card,
  LOCAL_GATEWAY: localGateway,
};

export function getPaymentProvider(key: PaymentMethodKey) {
  return paymentProviders[key];
}

export type { PaymentMethodKey, PaymentProvider } from "@/lib/payments/types";
