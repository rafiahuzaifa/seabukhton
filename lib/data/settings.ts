import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    siteName: map.site_name ?? "HERBOVA",
    tagline: map.site_tagline ?? "The Golden Berry of Wellness",
    currencySymbol: map.currency_symbol ?? "Rs.",
    freeShippingThreshold: Number(map.free_shipping_threshold ?? 5000),
    flatShippingRate: Number(map.flat_shipping_rate ?? 250),
    contactEmail: map.contact_email ?? "hello@herbova.com",
    contactPhone: map.contact_phone ?? "",
  };
}

export function formatPrice(amount: number | string | { toString(): string }, currencySymbol = "Rs.") {
  const value = Number(amount);
  return `${currencySymbol} ${value.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}
