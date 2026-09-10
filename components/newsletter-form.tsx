"use client";

import { useState, useTransition } from "react";

import { subscribeNewsletterAction } from "@/lib/actions/newsletter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeNewsletterAction(email);
      if (result.success) {
        push("You're on the list — welcome to BERRIVA.", "success");
        setEmail("");
      } else {
        push(result.error ?? "Something went wrong.", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <input
        aria-label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full max-w-md rounded-full border border-[#caa16a] bg-[#2a1e18] px-5 py-3.5 text-white placeholder:text-[#d7c1a7] focus:outline-none focus:ring-2 focus:ring-[#caa16a] sm:max-w-lg"
      />
      <Button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#d7a964] px-7 py-3.5 text-[11px] font-medium tracking-[0.12em] text-[#1b120d] hover:bg-[#e4b86a]"
      >
        {pending ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
