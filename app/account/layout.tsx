import Link from "next/link";
import { getServerSession } from "next-auth";

import { Header } from "@/components/header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { authOptions } from "@/lib/auth";

const tabs = [
  { label: "Profile", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Reviews", href: "/account/reviews" },
  { label: "Coupons", href: "/account/coupons" },
  { label: "Notifications", href: "/account/notifications" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header />
      <main className="container py-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="mt-2 text-5xl tracking-[-0.05em] text-[#1b120d]">
              Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
            </h1>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className="rounded-full border border-[#e7d9c9] bg-white px-4 py-3 text-center text-sm text-[#4f3e36] transition hover:border-[#c49242]"
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="mt-8">{children}</div>
      </main>
    </>
  );
}
