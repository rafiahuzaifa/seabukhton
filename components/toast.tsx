"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

type Toast = { id: number; message: string; variant: "success" | "error" | "info" };
type ToastContextValue = { push: (message: string, variant?: Toast["variant"]) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#e6d8c8] bg-[#1b120d] px-5 py-3 text-sm text-white shadow-lg"
            >
              {toast.variant === "success" ? (
                <Check size={16} className="text-[#d4aa67]" />
              ) : toast.variant === "error" ? (
                <AlertCircle size={16} className="text-[#e08a6b]" />
              ) : (
                <Check size={16} className="text-[#d4aa67]" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export { X as ToastCloseIcon };
