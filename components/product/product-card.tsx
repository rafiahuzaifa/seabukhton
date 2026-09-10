import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Category, Product, ProductImage } from "@prisma/client";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { formatPrice } from "@/lib/data/settings";

type CardProduct = Product & { images: ProductImage[]; category: Category | null };

export function ProductCard({ product, currencySymbol = "Rs." }: { product: CardProduct; currencySymbol?: string }) {
  const image = product.images[0]?.url ?? product.featuredImage ?? "";
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null;
  const badge = product.isNew ? "New" : discount ? `-${discount}%` : product.isFeatured ? "Best Seller" : null;

  return (
    <article className="group rounded-[1.75rem] border border-[#eadac2] bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden rounded-[1.35rem] bg-[#f5eee6]">
        <Link href={`/product/${product.slug}`}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              width={800}
              height={900}
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-72 w-full bg-[#f0e7dc]" />
          )}
        </Link>
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#1b120d] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
            {badge}
          </span>
        ) : null}
        <WishlistButton productId={product.id} className="absolute right-3 top-3" />
        {product.stock <= 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#1b120d]">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-2.5 px-1 pb-1">
        <div className="flex items-center gap-1 text-[#d4aa67]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={13} fill={i < Math.round(Number(product.rating)) ? "currentColor" : "none"} />
          ))}
          <span className="ml-1 text-xs text-[#8a7469]">({product.reviewCount})</span>
        </div>
        {product.category ? (
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7c685f]">{product.category.name}</p>
        ) : null}
        <Link href={`/product/${product.slug}`} className="block text-xl font-medium text-[#1b120d]">
          {product.name}
        </Link>
        {product.shortDescription ? <p className="text-sm text-[#5d4d45]">{product.shortDescription}</p> : null}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{formatPrice(salePrice ?? price, currencySymbol)}</span>
            {salePrice ? (
              <span className="text-sm text-[#7c685f] line-through">{formatPrice(price, currencySymbol)}</span>
            ) : null}
          </div>
          <AddToCartButton
            productId={product.id}
            outOfStock={product.stock <= 0}
            variantStyle="outline"
            label="Add"
            className="px-3 py-2 text-[10px] tracking-[0.12em]"
          />
        </div>
      </div>
    </article>
  );
}
