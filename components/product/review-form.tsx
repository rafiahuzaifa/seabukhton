"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star } from "lucide-react";

import { submitReviewAction } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  if (status !== "authenticated") {
    return (
      <p className="text-sm text-[#5d4d45]">
        <Link href="/login" className="underline underline-offset-2">
          Sign in
        </Link>{" "}
        to leave a review.
      </p>
    );
  }

  if (submitted) {
    return <p className="text-sm text-[#5d4d45]">Thank you — your review has been submitted for approval.</p>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 10) {
      push("Please write at least a short sentence.", "error");
      return;
    }
    startTransition(async () => {
      const result = await submitReviewAction({ productId, productSlug, rating, content });
      if (result.success) {
        setSubmitted(true);
        push("Review submitted for approval", "success");
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[1.5rem] border border-[#eadac2] bg-[#faf6f1] p-5">
      <p className="text-sm font-medium text-[#1b120d]">Write a review</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star size={20} className={n <= rating ? "fill-[#d4aa67] text-[#d4aa67]" : "text-[#c9b8a6]"} />
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Share your experience with this product…"
        className="w-full rounded-2xl border border-[#dcc7ad] bg-white px-4 py-3 text-sm text-[#1b120d] outline-none"
      />
      <Button type="submit" disabled={pending} className="rounded-full px-5 py-2.5 text-[11px] tracking-[0.12em]">
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
