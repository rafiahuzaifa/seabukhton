import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "BERRIVA | The Golden Berry of Wellness",
    template: "%s | BERRIVA",
  },
  description: "Premium Sea Buckthorn wellness, skincare, haircare, and beauty products crafted for modern rituals.",
  openGraph: {
    siteName: "BERRIVA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f6f1ea] text-[#1b120d]">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
