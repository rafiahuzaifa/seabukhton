"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adjustStockAction } from "@/lib/actions/admin/inventory";
import { useToast } from "@/components/toast";

export function StockAdjuster({ productId, stock }: { productId: string; stock: number }) {
  const [value, setValue] = useState(1);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function adjust(delta: number) {
    startTransition(async () => {
      const result = await adjustStockAction({ productId, delta });
      if (result.success) {
        push(`Stock updated to ${result.newStock}`, "success");
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-sm text-[#1b120d]">{stock}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-16 rounded-full border border-[#dcc7ad] bg-white px-2 py-1.5 text-center text-xs outline-none"
      />
      <button disabled={pending} onClick={() => adjust(value)} className="rounded-full border border-[#dcc7ad] px-2.5 py-1.5 text-xs text-[#3e5c37]">
        + Add
      </button>
      <button disabled={pending} onClick={() => adjust(-value)} className="rounded-full border border-[#dcc7ad] px-2.5 py-1.5 text-xs text-[#a4372e]">
        − Remove
      </button>
    </div>
  );
}
