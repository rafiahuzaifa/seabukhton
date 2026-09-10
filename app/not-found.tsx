import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f2ed] px-4">
      <div className="max-w-lg text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-5xl tracking-[-0.05em] text-[#1b120d]">Page not found</h1>
        <p className="mt-4 text-lg text-[#5d4d45]">The page you requested no longer exists or may have moved.</p>
        <Link href="/" className="mt-8 inline-block">
          <Button className="rounded-full bg-[#1b120d] px-6 py-3.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#2b1d17]">Back to homepage</Button>
        </Link>
      </div>
    </main>
  );
}
