import Link from "next/link";
import { getServerSession } from "next-auth";
import { ShoppingBag, Heart, User, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeaderSearch } from "@/components/header-search";
import { HeaderMobileMenu } from "@/components/header-mobile-menu";
import { authOptions } from "@/lib/auth";
import { cartSummary } from "@/lib/cart";
import { getAnnouncementBar } from "@/lib/data/cms";
import { prisma } from "@/lib/prisma";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Skincare", href: "/shop?category=skincare" },
  { label: "Wellness", href: "/shop?category=wellness" },
  { label: "Haircare", href: "/shop?category=haircare" },
  { label: "Oils", href: "/shop?category=oils" },
  { label: "Bundles", href: "/shop?category=bundles" },
  { label: "Our Story", href: "/story" },
  { label: "Journal", href: "/journal" },
];

export async function Header() {
  const [session, { itemCount }, announcement] = await Promise.all([
    getServerSession(authOptions),
    cartSummary(),
    getAnnouncementBar(),
  ]);

  const wishlistCount = session?.user?.id
    ? await prisma.wishlistItem.count({ where: { wishlist: { userId: session.user.id } } })
    : 0;

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6d8c8] bg-[#f6f1ea]/90 backdrop-blur-md">
      {announcement ? (
        <div className="bg-[#1b120d] py-2 text-center text-xs uppercase tracking-[0.1em] text-[#f2d7b4]">{announcement}</div>
      ) : null}
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-[0.24em] text-[#1b120d]">
            BERRIVA
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm text-[#4f3e36] transition hover:text-[#1b120d]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <HeaderSearch />

          {isStaff ? (
            <Link
              href="/admin"
              aria-label="Admin"
              className="hidden rounded-full border border-[#dcc7ad] p-2.5 text-[#1b120d] transition hover:border-[#c49242] md:inline-flex"
            >
              <ShieldCheck size={18} />
            </Link>
          ) : null}

          <Link
            href={session ? "/account" : "/login"}
            aria-label="Account"
            className="rounded-full border border-[#dcc7ad] p-2.5 text-[#1b120d] transition hover:border-[#c49242]"
          >
            <User size={18} />
          </Link>

          <Link
            href={session ? "/account/wishlist" : "/login"}
            aria-label="Wishlist"
            className="relative rounded-full border border-[#dcc7ad] p-2.5 text-[#1b120d] transition hover:border-[#c49242]"
          >
            <Heart size={18} />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1b120d] px-1 text-[9px] text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>

          <Button asChild variant="secondary" className="hidden sm:inline-flex gap-2 rounded-full px-4 py-2.5 text-[11px] tracking-[0.12em]">
            <Link href="/cart">
              <ShoppingBag size={16} />
              Cart ({itemCount})
            </Link>
          </Button>

          <HeaderMobileMenu />
        </div>
      </div>
    </header>
  );
}
