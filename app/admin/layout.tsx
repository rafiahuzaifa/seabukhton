import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Tag,
  Star,
  FileText,
  LayoutTemplate,
  BarChart3,
  ExternalLink,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Journal", href: "/admin/journal", icon: FileText },
  { label: "CMS", href: "/admin/cms", icon: LayoutTemplate },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#f4efe7] lg:flex">
      <aside className="border-b border-[#e6d8c8] bg-[#1b120d] px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <Link href="/" className="text-xl font-semibold tracking-[0.2em]">
          BERRIVA
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#c9a56b]">Admin console</p>

        <nav className="mt-8 flex flex-wrap gap-1 lg:flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#e7dccf] transition hover:bg-white/10"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="text-sm text-[#e7dccf]">{session?.user?.name}</p>
          <p className="text-xs text-[#a5907d]">{session?.user?.role}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 text-xs text-[#c9a56b]">
              <ExternalLink size={12} /> View storefront
            </Link>
            <SignOutButton className="w-fit rounded-full bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-white hover:bg-white/20" />
          </div>
        </div>
      </aside>

      <main className="flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
