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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // focus the panel for accessibility
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const shell =
    variant === "full"
      ? "fixed inset-0 z-50 flex flex-col bg-bg-card animate-fade-in"
      : variant === "drawer-right"
      ? "fixed inset-0 z-50 flex justify-end bg-bg-main/80 backdrop-blur-md animate-fade-in"
      : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-main/80 backdrop-blur-md animate-fade-in";

  const panel =
    variant === "full"
      ? "w-full h-full flex flex-col bg-bg-card"
      : variant === "drawer-right"
      ? "w-full max-w-2xl h-full bg-bg-card border-l border-border-main shadow-2xl flex flex-col overflow-hidden"
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
