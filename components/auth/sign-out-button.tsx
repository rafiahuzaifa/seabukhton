"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="secondary"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className ?? "rounded-full px-5 py-3 text-[10px] uppercase tracking-[0.14em]"}
    >
      Logout
    </Button>
  );
}
