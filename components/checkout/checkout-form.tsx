"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { placeOrderAction, type CheckoutInput } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

type PaymentOption = { key: CheckoutInput["paymentMethod"]; label: string; isLive: boolean };

export function CheckoutForm({
  paymentOptions,
  defaults,
}: {
  paymentOptions: PaymentOption[];
  defaults: Partial<CheckoutInput>;
}) {
  const [form, setForm] = useState<CheckoutInput>({
    firstName: defaults.firstName ?? "",
    lastName: defaults.lastName ?? "",
    email: defaults.email ?? "",
    phone: defaults.phone ?? "",
    street: defaults.street ?? "",
    city: defaults.city ?? "",
    area: defaults.area ?? "",
    postalCode: defaults.postalCode ?? "",
    country: defaults.country ?? "Pakistan",
    paymentMethod: paymentOptions.find((p) => p.isLive)?.key ?? "CASH_ON_DELIVERY",
  });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function set<K extends keyof CheckoutInput>(key: K, value: CheckoutInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await placeOrderAction(form);
      if (result.success) {
        router.push(`/order/confirmation/${result.orderId}`);
      } else {
        push(result.error ?? "Something went wrong placing your order.", "error");
      }
    });
  }

  const inputClass =
    "rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none focus:border-[#c49242]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-medium text-[#1b120d]">Customer information</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass} placeholder="First name" />
          <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputClass} placeholder="Last name" />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={`md:col-span-2 ${inputClass}`}
            placeholder="Email address"
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-medium text-[#1b120d]">Shipping address</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <input
            required
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
            className={`md:col-span-2 ${inputClass}`}
            placeholder="Street address"
          />
          <input required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} placeholder="City" />
          <input value={form.area} onChange={(e) => set("area", e.target.value)} className={inputClass} placeholder="Area (optional)" />
          <input
            value={form.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            className={inputClass}
            placeholder="Postal code"
          />
          <input
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
            placeholder="Phone number"
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#eadac2] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-medium text-[#1b120d]">Payment</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {paymentOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center justify-between gap-3 rounded-full border px-4 py-3 ${
                !option.isLive
                  ? "cursor-not-allowed border-[#eee1d2] bg-[#faf7f3] text-[#b7a696]"
                  : form.paymentMethod === option.key
                    ? "border-[#1b120d] bg-[#1b120d] text-white"
                    : "border-[#dcc7ad] bg-[#faf7f3] text-[#1b120d]"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  disabled={!option.isLive}
                  checked={form.paymentMethod === option.key}
                  onChange={() => set("paymentMethod", option.key)}
                  className="accent-[#1b120d]"
                />
                {option.label}
              </span>
              {!option.isLive ? <span className="text-[10px] uppercase tracking-[0.1em]">Coming soon</span> : null}
            </label>
          ))}
        </div>
      </section>

      <Button type="submit" disabled={pending} className="w-full rounded-full px-5 py-3.5 text-[11px] tracking-[0.12em] md:w-auto">
        {pending ? "Placing order…" : "Place order"}
      </Button>
    </form>
  );
}
