import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, getSiteSettings } from "@/lib/data/settings";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { RemoveWishlistButton } from "@/components/account/remove-wishlist-button";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [wishlist, settings] = await Promise.all([
    prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: { include: { images: true } } }, orderBy: { createdAt: "desc" } } },
    }),
    getSiteSettings(),
  ]);

  const items = wishlist?.items ?? [];

  if (!items.length) {
    return (
      <div className="rounded-[1.75rem] border border-[#eadac2] bg-white p-10 text-center text-[#5d4d45]">
        Your wishlist is empty. <Link href="/shop" className="underline underline-offset-2">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="relative rounded-[1.5rem] border border-[#eadac2] bg-white p-4 shadow-sm">
          <RemoveWishlistButton itemId={item.id} className="absolute right-4 top-4" />
          <Link href={`/product/${item.product.slug}`}>
            <Image
              src={item.product.images[0]?.url ?? item.product.featuredImage ?? ""}
              alt={item.product.name}
              width={400}
              height={300}
              className="h-40 w-full rounded-xl object-cover"
            />
          </Link>
          <Link href={`/product/${item.product.slug}`} className="mt-4 block font-medium text-[#1b120d]">
            {item.product.name}
          </Link>
          <p className="mt-1 text-sm text-[#5d4d45]">{formatPrice(item.product.salePrice ?? item.product.price, settings.currencySymbol)}</p>
          <AddToCartButton productId={item.productId} outOfStock={item.product.stock <= 0} className="mt-4 w-full" />
        </div>
      ))}
    </div>
  );
}
