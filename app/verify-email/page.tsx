import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  let success = false;
  if (token) {
    const record = await prisma.userToken.findUnique({ where: { token } });
    if (record && record.type === "EMAIL_VERIFICATION" && record.expiresAt > new Date()) {
      await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } });
      await prisma.userToken.delete({ where: { id: record.id } });
      success = true;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe9] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e7d9c9] bg-white p-8 text-center shadow-sm">
        {success ? (
          <>
            <CheckCircle2 size={40} className="mx-auto text-[#4d7a43]" />
            <h1 className="mt-4 text-3xl tracking-[-0.04em] text-[#1b120d]">Email verified</h1>
            <p className="mt-3 text-[#5d4d45]">Your email address has been verified. You're all set.</p>
          </>
        ) : (
          <>
            <XCircle size={40} className="mx-auto text-[#a4372e]" />
            <h1 className="mt-4 text-3xl tracking-[-0.04em] text-[#1b120d]">Link expired</h1>
            <p className="mt-3 text-[#5d4d45]">This verification link is invalid or has expired.</p>
          </>
        )}
        <Button asChild className="mt-6 rounded-full px-6 py-3 text-[11px] tracking-[0.12em]">
          <Link href="/account">Go to account</Link>
        </Button>
      </div>
    </main>
  );
}
