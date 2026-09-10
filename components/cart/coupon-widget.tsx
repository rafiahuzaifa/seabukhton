"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/data/settings";

export function CouponWidget({
  subtotal,
  currencySymbol,
  appliedCode,
}: {
  subtotal: number;
  currencySymbol: string;
  appliedCode?: string | null;
}) {
  const [code, setCode] = useState(appliedCode ?? "");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function apply() {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await fetch(`/api/coupon?code=${encodeURIComponent(code)}&subtotal=${subtotal}`);
      const data = await res.json();
      if (data.valid) {
        document.cookie = `berriva_coupon=${data.code}; path=/; max-age=${60 * 60 * 24 * 7}`;
        push(`Coupon applied: -${formatPrice(data.discount, currencySymbol)}`, "success");
        router.refresh();
      } else {
        push(data.error ?? "Invalid coupon.", "error");
      }
    });
  }

  function remove() {
    document.cookie = "berriva_coupon=; path=/; max-age=0";
    setCode("");
    push("Coupon removed", "success");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Coupon code"
        className="flex-1 rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm text-[#1b120d] outline-none"
      />
      {appliedCode ? (
        <Button type="button" variant="outline" onClick={remove} className="rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]">
          Remove
        </Button>
      ) : (
        <Button type="button" disabled={pending} onClick={apply} variant="outline" className="rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]">
          {pending ? "Checking…" : "Apply"}
        </Button>
      )}
    </div>
  );
}
