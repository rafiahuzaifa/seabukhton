"use client";

import { useTransition } from "react";

import { addToCartAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export function AddAllToBag({ productIds }: { productIds: string[] }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handleClick() {
    startTransition(async () => {
      const results = await Promise.all(productIds.map((productId) => addToCartAction({ productId, quantity: 1 })));
      const failed = results.filter((r) => !r.success).length;
      if (failed === 0) push("Added all to your bag", "success");
      else push(`Added ${results.length - failed} of ${results.length} items`, "info");
    });
  }

  return (
    <Button variant="secondary" disabled={pending} onClick={handleClick} className="rounded-full px-5 py-3 text-[10px] uppercase tracking-[0.14em]">
      {pending ? "Adding…" : "Add all to bag"}
    </Button>
  );
}
