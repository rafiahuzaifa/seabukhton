"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { ProductVariant } from "@prisma/client";

import { addToCartAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/data/settings";

export function PurchasePanel({
  productId,
  basePrice,
  baseSalePrice,
  variants,
  stock,
  currencySymbol,
}: {
  productId: string;
  basePrice: number;
  baseSalePrice: number | null;
  variants: ProductVariant[];
  stock: number;
  currencySymbol: string;
}) {
  const [variantId, setVariantId] = useState<string | null>(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  const activeVariant = variants.find((v) => v.id === variantId) ?? null;
  const price = activeVariant ? Number(activeVariant.salePrice ?? activeVariant.price) : (baseSalePrice ?? basePrice);
  const compareAt = activeVariant ? (activeVariant.salePrice ? Number(activeVariant.price) : null) : baseSalePrice ? basePrice : null;
  const availableStock = activeVariant ? activeVariant.stock : stock;
  const outOfStock = availableStock <= 0;

  function addToCart() {
    return addToCartAction({ productId, quantity, variant: variantId });
  }

  function handleAddToBag() {
    startTransition(async () => {
      const result = await addToCart();
      if (result.success) push("Added to your bag", "success");
      else push(result.error ?? "Something went wrong.", "error");
    });
  }

  function handleBuyNow() {
    startTransition(async () => {
      const result = await addToCart();
      if (result.success) router.push("/checkout");
      else push(result.error ?? "Something went wrong.", "error");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <span className="text-4xl font-semibold text-[#1b120d]">{formatPrice(price, currencySymbol)}</span>
        {compareAt ? <span className="text-xl text-[#7c685f] line-through">{formatPrice(compareAt, currencySymbol)}</span> : null}
      </div>

      <div className="rounded-[1.5rem] border border-[#eadac2] bg-[#faf7f3] p-4">
        {variants.length ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-[#5d4d45]">Variant</div>
            <div className="flex flex-wrap justify-end gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-full border px-3 py-2 text-sm ${v.id === variantId ? "border-[#1b120d] bg-[#1b120d] text-white" : "border-[#d7c1a2] bg-white text-[#1b120d]"}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-[#5d4d45]">Quantity</div>
          <div className="flex items-center gap-3 rounded-full border border-[#d7c1a2] bg-white px-3 py-2">
            <button aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus size={16} />
            </button>
            <span className="w-4 text-center text-sm text-[#1b120d]">{quantity}</span>
            <button aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(20, q + 1))}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={pending || outOfStock}
          onClick={handleAddToBag}
          className="rounded-full bg-[#1b120d] px-6 py-3.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#2b1d17]"
        >
          {outOfStock ? "Out of stock" : pending ? "Adding…" : "Add to bag"}
        </Button>
        <Button
          disabled={pending || outOfStock}
          onClick={handleBuyNow}
          variant="secondary"
          className="rounded-full px-6 py-3.5 text-[11px] tracking-[0.12em]"
        >
          Buy now
        </Button>
        <WishlistButton productId={productId} className="h-12 w-12" />
      </div>

      <p className="text-sm text-[#5d4d45]">
        {outOfStock ? "Currently out of stock." : `In stock • ${availableStock} remaining`}
      </p>
    </div>
  );
}
