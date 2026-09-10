"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addInternalNoteAction, addTrackingAction, processRefundAction, updateOrderStatusAction } from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"] as const;

export function OrderActions({ orderId, currentStatus, trackingCode }: { orderId: string; currentStatus: string; trackingCode: string | null }) {
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingCode ?? "");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
        <p className="text-sm font-medium text-[#1b120d]">Order status</p>
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as typeof status;
            setStatus(next);
            startTransition(async () => {
              const result = await updateOrderStatusAction(orderId, next as never);
              if (result.success) {
                push("Order status updated", "success");
                router.refresh();
              }
            });
          }}
          disabled={pending}
          className="mt-3 w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-2.5 text-sm outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {status === "DELIVERED" || status === "SHIPPED" ? (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => startTransition(async () => { await processRefundAction(orderId); push("Refund processed", "success"); router.refresh(); })}
            className="mt-3 w-full rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
          >
            Process refund
          </Button>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
        <p className="text-sm font-medium text-[#1b120d]">Tracking number</p>
        <div className="mt-3 flex gap-2">
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="flex-1 rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-2.5 text-sm outline-none" />
          <Button
            disabled={pending}
            onClick={() => startTransition(async () => { await addTrackingAction(orderId, tracking); push("Tracking saved", "success"); router.refresh(); })}
            variant="outline"
            className="rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
        <p className="text-sm font-medium text-[#1b120d]">Internal note</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-3 w-full rounded-2xl border border-[#dcc7ad] bg-[#faf7f3] px-4 py-2.5 text-sm outline-none" />
        <Button
          disabled={pending || !note.trim()}
          onClick={() => startTransition(async () => { await addInternalNoteAction(orderId, note); setNote(""); push("Note added", "success"); router.refresh(); })}
          variant="outline"
          className="mt-2 rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
        >
          Add note
        </Button>
      </div>
    </div>
  );
}
