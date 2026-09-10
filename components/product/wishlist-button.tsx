"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialSaved = false,
  className,
}: {
  productId: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const handleClick = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (result.success) {
        setSaved(Boolean(result.saved));
        push(result.saved ? "Saved to wishlist" : "Removed from wishlist", "success");
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  };

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc7ad] bg-white/85 text-[#1b120d] shadow-sm transition hover:border-[#c49242] disabled:opacity-60",
        className
      )}
    >
      <Heart size={16} className={saved ? "fill-[#c49242] text-[#c49242]" : ""} />
    </button>
  );
}
