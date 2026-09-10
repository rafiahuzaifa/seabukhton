"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Star, Trash2 } from "lucide-react";
import type { Address } from "@prisma/client";

import { addAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/addresses";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const emptyForm = { firstName: "", lastName: "", phone: "", street: "", city: "", area: "", postalCode: "", country: "Pakistan" };

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addAddressAction(form);
      if (result.success) {
        push("Address saved", "success");
        setForm(emptyForm);
        setShowForm(false);
        router.refresh();
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  const inputClass = "rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-2.5 text-sm text-[#1b120d] outline-none";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[#1b120d]">
                {address.firstName} {address.lastName}
              </p>
              {address.isDefault ? (
                <span className="flex items-center gap-1 text-xs uppercase tracking-[0.1em] text-[#c49242]">
                  <Star size={12} fill="currentColor" /> Default
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-[#5d4d45]">
              {address.street}, {address.area ? `${address.area}, ` : ""}
              {address.city}
              <br />
              {address.phone}
            </p>
            <div className="mt-4 flex gap-3">
              {!address.isDefault ? (
                <button
                  disabled={pending}
                  onClick={() => startTransition(async () => { await setDefaultAddressAction(address.id); router.refresh(); })}
                  className="text-xs uppercase tracking-[0.1em] text-[#6e5245]"
                >
                  Set default
                </button>
              ) : null}
              <button
                disabled={pending}
                onClick={() => startTransition(async () => { await deleteAddressAction(address.id); router.refresh(); })}
                className="flex items-center gap-1 text-xs uppercase tracking-[0.1em] text-[#a4372e]"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="grid gap-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5 md:grid-cols-2">
          <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="First name" className={inputClass} />
          <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Last name" className={inputClass} />
          <input required value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" className={inputClass} />
          <input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className={inputClass} />
          <input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Area (optional)" className={inputClass} />
          <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="Postal code" className={inputClass} />
          <input required value={form.street} onChange={(e) => set("street", e.target.value)} placeholder="Street address" className={`md:col-span-2 ${inputClass}`} />
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
              {pending ? "Saving…" : "Save address"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          <Plus size={14} /> Add new address
        </Button>
      )}
    </div>
  );
}
