"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteNewsletterSubscriberAction } from "@/lib/actions/admin/taxonomy";
import { useToast } from "@/components/toast";

export function NewsletterRow({ id, email, subscribedAt }: { id: string; email: string; subscribedAt: string }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <tr className="border-b border-[#f0e7dc] last:border-0">
      <td className="px-5 py-4 text-[#1b120d]">{email}</td>
      <td className="px-5 py-4 text-[#8a7469]">{subscribedAt}</td>
      <td className="px-5 py-4">
        <button
          disabled={pending}
          onClick={() => startTransition(async () => { await deleteNewsletterSubscriberAction(id); push("Subscriber removed", "success"); router.refresh(); })}
          className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}
