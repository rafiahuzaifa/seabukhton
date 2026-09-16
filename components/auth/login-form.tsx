"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await signIn("credentials", { redirect: false, email, password });
    setPending(false);
    if (result?.error) {
      push("Invalid email or password.", "error");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe9] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e7d9c9] bg-white p-8 shadow-sm">
        <p className="eyebrow">Welcome</p>
        <h1 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Sign in</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none"
            placeholder="Email address"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none"
            placeholder="Password"
          />
          <Button type="submit" disabled={pending} className="mt-2 w-full rounded-full bg-[#1b120d] px-5 py-3.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#2b1d17]">
            {pending ? "Signing in…" : "Login"}
          </Button>
        </form>

        {googleEnabled ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-3 w-full rounded-full px-5 py-3.5 text-[11px] tracking-[0.12em]"
          >
            Continue with Google
          </Button>
        ) : null}

        <div className="mt-5 flex items-center justify-between text-sm text-[#5d4d45]">
          <Link href="/account/forgot-password" className="hover:text-[#1b120d]">Forgot password?</Link>
          <Link href="/register" className="hover:text-[#1b120d]">Create account</Link>
        </div>

        <p className="mt-6 rounded-2xl bg-[#faf6f1] px-4 py-3 text-xs text-[#7a6356]">
          Demo: <span className="font-medium">customer@herbova.com</span> / Customer@123
        </p>
      </div>
    </main>
  );
}
