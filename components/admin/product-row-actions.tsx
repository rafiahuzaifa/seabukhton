"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2 } from "lucide-react";

import { deleteProductAction, duplicateProductAction, togglePublishAction } from "@/lib/actions/admin/products";
import { useToast } from "@/components/toast";

export function ProductRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(async () => { await togglePublishAction(id); router.refresh(); })}
        className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] ${isPublished ? "bg-[#eaf3e6] text-[#3e5c37]" : "bg-[#f1ecec] text-[#6a5a55]"}`}
      >
        {isPublished ? "Published" : "Draft"}
      </button>
      <button
        aria-label="Duplicate"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await duplicateProductAction(id);
            if (result.success) {
              push("Product duplicated", "success");
              router.refresh();
            }
          })
        }
        className="rounded-full border border-[#dcc7ad] p-1.5 text-[#4f3e36]"
      >
        <Copy size={13} />
      </button>
      <button
        aria-label="Delete"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            if (!confirm("Delete this product?")) return;
            await deleteProductAction(id);
            push("Product deleted", "success");
            router.refresh();
          })
        }
        className="rounded-full border border-[#dcc7ad] p-1.5 text-[#a4372e]"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
