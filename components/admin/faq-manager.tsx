"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { FAQ } from "@prisma/client";

import { createSiteFaqAction, deleteSiteFaqAction } from "@/lib/actions/admin/taxonomy";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

const inputClass = "w-full rounded-xl border border-[#dcc7ad] bg-white px-4 py-2.5 text-sm outline-none";

export function FaqManager({ faqs }: { faqs: FAQ[] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="flex items-start justify-between gap-3 rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
            <div>
              <p className="font-medium text-[#1b120d]">{faq.question}</p>
              <p className="mt-1 text-sm text-[#5d4d45]">{faq.answer}</p>
            </div>
            <button
              disabled={pending}
              onClick={() => startTransition(async () => { await deleteSiteFaqAction(faq.id); push("FAQ removed", "success"); router.refresh(); })}
              className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {!faqs.length ? <p className="text-sm text-[#7a6356]">No site-wide FAQs yet.</p> : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await createSiteFaqAction({ question, answer });
            if (result.success) {
              push("FAQ added", "success");
              setQuestion("");
              setAnswer("");
              router.refresh();
            } else {
              push(result.error ?? "Something went wrong.", "error");
            }
          });
        }}
        className="space-y-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5"
      >
        <input required placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} className={inputClass} />
        <textarea required rows={2} placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} className={inputClass} />
        <Button type="submit" disabled={pending} className="gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
          <Plus size={14} /> Add FAQ
        </Button>
      </form>
    </div>
  );
}
