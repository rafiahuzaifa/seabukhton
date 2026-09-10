"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@prisma/client";

import { createCouponAction, deleteCouponAction, toggleCouponActiveAction } from "@/lib/actions/admin/coupons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/data/settings";

const emptyForm = {
  code: "",
  type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  value: 10,
  minOrderAmount: null as number | null,
  expiresAt: "" as string,
  usageLimit: null as number | null,
  firstOrderOnly: false,
  isActive: true,
};

export function CouponManager({ coupons, currencySymbol }: { coupons: Coupon[]; currencySymbol: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCouponAction({ ...form, categoryId: null });
      if (result.success) {
        push("Coupon created", "success");
        setForm(emptyForm);
        setShowForm(false);
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  const inputClass = "rounded-full border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none";

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-[1.5rem] border border-[#eadac2] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadac2] text-xs uppercase tracking-[0.1em] text-[#8a7469]">
              <th className="px-5 py-4">Code</th>
              <th className="px-5 py-4">Discount</th>
              <th className="px-5 py-4">Min order</th>
              <th className="px-5 py-4">Expires</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-[#f0e7dc] last:border-0">
                <td className="px-5 py-4 font-medium tracking-[0.05em] text-[#1b120d]">{coupon.code}</td>
                <td className="px-5 py-4 text-[#54453f]">
                  {coupon.type === "PERCENTAGE" ? `${Number(coupon.value)}%` : formatPrice(coupon.value, currencySymbol)}
                </td>
                <td className="px-5 py-4 text-[#54453f]">{coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount, currencySymbol) : "—"}</td>
                <td className="px-5 py-4 text-[#8a7469]">{coupon.expiresAt ? coupon.expiresAt.toLocaleDateString() : "No expiry"}</td>
                <td className="px-5 py-4">
                  <button
                    disabled={pending}
                    onClick={() => startTransition(async () => { await toggleCouponActiveAction(coupon.id); router.refresh(); })}
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.1em] ${coupon.isActive ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#f1ecec] text-[#6a5a55]"}`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button
                    disabled={pending}
                    onClick={() => startTransition(async () => { await deleteCouponAction(coupon.id); push("Coupon removed", "success"); router.refresh(); })}
                    className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5 md:grid-cols-3">
          <input required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENTAGE" | "FIXED" })} className={inputClass}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
          <input required type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className={inputClass} />
          <input type="number" placeholder="Min order amount" value={form.minOrderAmount ?? ""} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : null })} className={inputClass} />
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputClass} />
          <input type="number" placeholder="Usage limit" value={form.usageLimit ?? ""} onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })} className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-[#4f3e36]">
            <input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })} /> First order only
          </label>
          <div className="md:col-span-3 flex gap-3">
            <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
              {pending ? "Creating…" : "Create coupon"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          <Plus size={14} /> New coupon
        </Button>
      )}
    </div>
  );
}
