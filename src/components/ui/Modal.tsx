"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** "center" = centered card modal; "drawer-right" = right-side drawer; "full" = full-screen (mobile lesson) */
  variant?: "center" | "drawer-right" | "full";
  title?: string;
  className?: string;
}

export function Modal({ open, onClose, children, variant = "center", title, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep latest onClose in a ref so the focus/scroll-lock effect only re-runs
  // when `open` changes — not on every render (which would steal focus and
  // blur/close the keyboard while typing in child inputs).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // focus the panel for accessibility
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const shell =
    variant === "full"
      ? "fixed inset-0 z-50 flex flex-col bg-bg-card animate-fade-in overscroll-contain"
      : variant === "drawer-right"
      ? "fixed inset-0 z-50 flex justify-end bg-bg-main/80 backdrop-blur-md animate-fade-in overscroll-contain"
      : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-main/80 backdrop-blur-md animate-fade-in overscroll-contain";

  const panel =
    variant === "full"
      ? "w-full h-[100dvh] max-w-full flex flex-col bg-bg-card [padding-top:env(safe-area-inset-top)] [padding-bottom:env(safe-area-inset-bottom)]"
      : variant === "drawer-right"
      ? "w-full max-w-2xl h-full max-h-full bg-bg-card border-l border-border-main shadow-2xl flex flex-col overflow-hidden"
      : `premium-card rounded-2xl bg-bg-card border-border-main max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto ${className || ""}`;

  return (
    <div className={shell} onClick={variant === "center" ? onClose : undefined}>
      <div
        ref={panelRef}
        tabIndex={-1}
        className={panel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && variant !== "center" && (
          <div className="flex items-center justify-between p-4 border-b border-border-main">
            <h2 className="font-heading font-bold text-sm text-text-main">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-card-hover transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
