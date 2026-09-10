"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { requestPasswordResetAction } from "@/lib/actions/password-reset";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await requestPasswordResetAction(email);
      setSent(Boolean(result.success));
      setDevLink(result.devLink ?? null);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe9] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e7d9c9] bg-white p-8 shadow-sm">
        <p className="eyebrow">Reset password</p>
        <h1 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Forgot password?</h1>
        {sent ? (
          <div className="mt-6 space-y-3">
            <p className="text-[#5d4d45]">If an account exists for that email, we&apos;ve sent a reset link.</p>
            {devLink ? (
              <p className="rounded-2xl bg-[#faf6f1] px-4 py-3 text-xs text-[#7a6356]">
                Dev mode (no email provider configured) —{" "}
                <Link href={devLink.replace(/^https?:\/\/[^/]+/, "")} className="underline underline-offset-2">
                  open your reset link
                </Link>
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none"
              placeholder="Email address"
            />
            <Button type="submit" disabled={pending} className="w-full rounded-full px-5 py-3.5 text-[11px] tracking-[0.12em]">
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <p className="mt-5 text-center text-sm text-[#5d4d45]">
          <Link href="/login" className="hover:text-[#1b120d]">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
