"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Check, X, Sparkles, Trash2 } from "lucide-react";

import { approveReviewAction, deleteReviewAction, rejectReviewAction, toggleFeatureReviewAction } from "@/lib/actions/admin/reviews";
import { useToast } from "@/components/toast";

export function ReviewModerationRow({
  id,
  productName,
  userName,
  rating,
  content,
  verified,
  approved,
  featured,
}: {
  id: string;
  productName: string;
  userName: string | null;
  rating: number;
  content: string;
  verified: boolean;
  approved: boolean;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function run(action: () => Promise<unknown>, message: string) {
    startTransition(async () => {
      await action();
      push(message, "success");
      router.refresh();
    });
  }

  return (
    <div className="rounded-[1.5rem] border border-[#eadac2] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-[#1b120d]">{productName}</p>
          <p className="text-xs text-[#8a7469]">
            {userName} {verified ? "• Verified purchase" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[#d4aa67]">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={13} fill="currentColor" />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-[#4d3d39]">{content}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!approved ? (
          <button disabled={pending} onClick={() => run(() => approveReviewAction(id), "Review approved")} className="flex items-center gap-1 rounded-full bg-[#eaf3e6] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#3e5c37]">
            <Check size={12} /> Approve
          </button>
        ) : (
          <button disabled={pending} onClick={() => run(() => rejectReviewAction(id), "Review hidden")} className="flex items-center gap-1 rounded-full bg-[#f1ecec] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#6a5a55]">
            <X size={12} /> Unapprove
          </button>
        )}
        <button disabled={pending} onClick={() => run(() => toggleFeatureReviewAction(id), featured ? "Removed from featured" : "Marked as featured")} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] ${featured ? "bg-[#f5e7d7] text-[#7a5a2e]" : "bg-[#f1ecec] text-[#6a5a55]"}`}>
          <Sparkles size={12} /> {featured ? "Featured" : "Feature"}
        </button>
        <button disabled={pending} onClick={() => run(() => deleteReviewAction(id), "Review deleted")} className="flex items-center gap-1 rounded-full bg-[#faeaea] px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-[#a4372e]">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
