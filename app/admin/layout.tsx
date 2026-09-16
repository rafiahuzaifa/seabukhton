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
  FolderTree,
  Layers,
  Leaf,
  HelpCircle,
  Mail,
  ShieldCheck,
  Settings,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navGroups = [
  {
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    heading: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Collections", href: "/admin/collections", icon: Layers },
      { label: "Ingredients", href: "/admin/ingredients", icon: Leaf },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes },
    ],
  },
  {
    heading: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    heading: "Content",
    items: [
      { label: "Journal", href: "/admin/journal", icon: FileText },
      { label: "CMS", href: "/admin/cms", icon: LayoutTemplate },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    heading: "Insights & access",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Team & roles", href: "/admin/team", icon: ShieldCheck },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#f4efe7] lg:flex">
      <aside className="border-b border-[#e6d8c8] bg-[#1b120d] px-5 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <Link href="/" className="text-xl font-semibold tracking-[0.2em]">
          HERBOVA
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#c9a56b]">Admin console</p>

        <nav className="mt-8 flex-1 space-y-5 lg:overflow-y-auto lg:pr-1">
          {navGroups.map((group, gi) => (
            <div key={group.heading ?? gi}>
              {group.heading ? (
                <p className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.14em] text-[#8a7062]">{group.heading}</p>
              ) : null}
              <div className="flex flex-wrap gap-1 lg:flex-col">
                {group.items.map((item) => {
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
              </div>
            </div>
          ))}
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
