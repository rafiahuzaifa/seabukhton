"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { resetPasswordAction } from "@/lib/actions/password-reset";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await resetPasswordAction({ token, password });
      if (result.success) {
        push("Password updated — please sign in.", "success");
        router.push("/login");
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5efe9] px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e7d9c9] bg-white p-8 shadow-sm">
        <p className="eyebrow">Reset password</p>
        <h1 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b120d]">Choose a new password</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-[#dcc7ad] bg-[#faf7f3] px-4 py-3 text-[#1b120d] outline-none"
            placeholder="New password (min. 8 characters)"
          />
          <Button type="submit" disabled={pending} className="w-full rounded-full px-5 py-3.5 text-[11px] tracking-[0.12em]">
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
