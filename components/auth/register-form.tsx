"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        push(data.error ?? "Something went wrong.", "error");
        return;
      }
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) {
        push("Account created — please sign in.", "success");
        router.push("/login");
      } else {
        router.push("/account");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe9] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e7d9c9] bg-white p-8 shadow-sm">
        <p className="eyebrow">Join BERRIVA</p>
        <h1 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Create account</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none"
            placeholder="Full name"
          />
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
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none"
            placeholder="Password (min. 8 characters)"
          />
          <Button type="submit" disabled={pending} className="mt-2 w-full rounded-full bg-[#1b120d] px-5 py-3.5 text-[11px] tracking-[0.12em] text-white hover:bg-[#2b1d17]">
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-[#5d4d45]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1b120d] underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
