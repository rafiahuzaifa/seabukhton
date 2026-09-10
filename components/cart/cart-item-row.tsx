"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { removeCartItemAction, updateCartItemAction } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/data/settings";

export function CartItemRow({
  id,
  name,
  slug,
  image,
  unitPrice,
  quantity,
  variantLabel,
  currencySymbol,
}: {
  id: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  variantLabel?: string | null;
  currencySymbol: string;
}) {
  const [pending, startTransition] = useTransition();

  function update(next: number) {
    startTransition(() => updateCartItemAction(id, next));
  }

  return (
    <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#eadac2] bg-white p-4">
      <Link href={`/product/${slug}`} className="shrink-0">
        {image ? (
          <Image src={image} alt={name} width={96} height={96} className="h-24 w-24 rounded-xl object-cover" />
        ) : (
          <div className="h-24 w-24 rounded-xl bg-[#f0e7dc]" />
        )}
      </Link>
      <div className="flex-1">
        <Link href={`/product/${slug}`} className="font-medium text-[#1b120d]">
          {name}
        </Link>
        {variantLabel ? <p className="text-xs text-[#7a6356]">{variantLabel}</p> : null}
        <p className="mt-1 text-sm text-[#5d4d45]">{formatPrice(unitPrice, currencySymbol)}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-[#d7c1a2] bg-white px-3 py-1.5">
            <button aria-label="Decrease quantity" disabled={pending} onClick={() => update(quantity - 1)}>
              <Minus size={14} />
            </button>
            <span className="w-4 text-center text-sm">{quantity}</span>
            <button aria-label="Increase quantity" disabled={pending} onClick={() => update(quantity + 1)}>
              <Plus size={14} />
            </button>
          </div>
          <button
            aria-label="Remove item"
            disabled={pending}
            onClick={() => startTransition(() => removeCartItemAction(id))}
            className="flex items-center gap-1 text-xs uppercase tracking-[0.1em] text-[#8a5c4d] hover:text-[#c14d2c]"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
      <p className="text-lg font-medium text-[#1b120d]">{formatPrice(unitPrice * quantity, currencySymbol)}</p>
    </div>
  );
}
