"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleCustomerActiveAction } from "@/lib/actions/admin/customers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export function CustomerStatusToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  return (
    <Button
      variant={isActive ? "outline" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleCustomerActiveAction(userId);
          push(isActive ? "Customer suspended" : "Customer activated", "success");
          router.refresh();
        })
      }
      className="rounded-full px-4 py-2.5 text-[10px] tracking-[0.1em]"
    >
      {isActive ? "Suspend account" : "Activate account"}
    </Button>
  );
}
