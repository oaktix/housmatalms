"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg bg-bg-card border-border-main animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <span className="mt-0.5 flex-shrink-0">
              {t.variant === "success" && <CheckCircle2 className="w-4 h-4 text-primary" />}
              {t.variant === "error" && <AlertTriangle className="w-4 h-4 text-error" />}
              {t.variant === "info" && <Info className="w-4 h-4 text-secondary" />}
            </span>
            <p className="text-xs font-medium text-text-main flex-grow leading-relaxed">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-text-muted hover:text-text-main transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: (_m: string, _v?: ToastVariant) => {} };
  return ctx;
}
