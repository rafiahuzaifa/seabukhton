import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-[#1b120d] text-white hover:bg-[#2b1d17]",
  secondary: "bg-[#f5efe9] text-[#1b120d] hover:bg-[#efe2d3]",
  outline: "border border-[#d9c5ae] bg-transparent text-[#1b120d] hover:bg-[#fbf5ee]",
  ghost: "text-[#1b120d] hover:bg-[#f5efe9]",
};

export function Button({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof buttonVariants;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium tracking-[0.08em] uppercase transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
