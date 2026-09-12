"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateSiteSettingsAction } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const inputClass = "w-full rounded-xl border border-[#dcc7ad] bg-[#faf7f3] px-3.5 py-2.5 text-sm text-[#1b120d] outline-none focus:border-[#c49242]";
const labelClass = "block text-xs uppercase tracking-[0.1em] text-[#8a7469] mb-1.5";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState({
    site_name: initial.site_name ?? "",
    site_tagline: initial.site_tagline ?? "",
    currency_symbol: initial.currency_symbol ?? "",
    free_shipping_threshold: initial.free_shipping_threshold ?? "",
    flat_shipping_rate: initial.flat_shipping_rate ?? "",
    contact_email: initial.contact_email ?? "",
    contact_phone: initial.contact_phone ?? "",
  });
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateSiteSettingsAction(form);
      if (result.success) {
        push("Settings saved", "success");
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-[#eadac2] bg-white p-6 md:grid-cols-2">
      <div><label className={labelClass}>Site name</label><input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Tagline</label><input value={form.site_tagline} onChange={(e) => setForm({ ...form, site_tagline: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Currency symbol</label><input value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Contact email</label><input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Contact phone</label><input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Free shipping threshold</label><input type="number" value={form.free_shipping_threshold} onChange={(e) => setForm({ ...form, free_shipping_threshold: e.target.value })} className={inputClass} /></div>
      <div><label className={labelClass}>Flat shipping rate</label><input type="number" value={form.flat_shipping_rate} onChange={(e) => setForm({ ...form, flat_shipping_rate: e.target.value })} className={inputClass} /></div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending} className="rounded-full px-6 py-3 text-[11px] tracking-[0.12em]">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
