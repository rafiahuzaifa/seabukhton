"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import type { NavItem } from "@/lib/data/cms";

export function HeaderMobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[#dcc7ad] p-2.5 text-[#1b120d] lg:hidden"
      >
        <Menu size={18} />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-[110] w-[85%] max-w-sm bg-[#f6f1ea] p-6 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold tracking-[0.2em] text-[#1b120d]">BERRIVA</span>
                <button aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X size={22} />
                </button>
              </div>
              <nav className="mt-10 flex flex-col gap-1">
                {items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3.5 text-lg text-[#2b1d17] transition hover:bg-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
