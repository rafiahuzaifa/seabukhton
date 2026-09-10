"use client";

import { useState, useTransition } from "react";
import { ShoppingBag } from "lucide-react";

import { addToCartAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  productId,
  quantity = 1,
  variant,
  className,
  label = "Add to bag",
  outOfStock = false,
  variantStyle = "default",
}: {
  productId: string;
  quantity?: number;
  variant?: string | null;
  className?: string;
  label?: string;
  outOfStock?: boolean;
  variantStyle?: "default" | "outline" | "secondary";
}) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addToCartAction({ productId, quantity, variant: variant ?? null });
      if (result.success) {
        push(`${label === "Add to bag" ? "Added to your bag" : "Added"}`, "success");
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  };

  return (
    <Button
      type="button"
      variant={variantStyle}
      disabled={pending || outOfStock}
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      <ShoppingBag size={15} />
      {outOfStock ? "Out of stock" : pending ? "Adding…" : label}
    </Button>
  );
}
