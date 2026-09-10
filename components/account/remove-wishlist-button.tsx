"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { removeFromWishlistAction } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

export function RemoveWishlistButton({ itemId, className }: { itemId: string; className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      aria-label="Remove from wishlist"
      disabled={pending}
      onClick={() => startTransition(() => removeFromWishlistAction(itemId))}
      className={cn("z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#a4372e] shadow-sm", className)}
    >
      <Trash2 size={14} />
    </button>
  );
}
