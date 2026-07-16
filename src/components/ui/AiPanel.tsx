"use client";

import { ReactNode } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";

export function AiPanel({
  title,
  content,
  loading,
  simulated,
  onClose,
  loadingLabel = "Thinking...",
  emptyHint,
}: {
  title: string;
  content?: string;
  loading?: boolean;
  simulated?: boolean;
  onClose?: () => void;
  loadingLabel?: string;
  emptyHint?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-primary-glow/20 border border-primary/20 flex items-center gap-2 text-xs text-primary">
        <Loader2 className="w-4 h-4 animate-spin" />
        {loadingLabel}
      </div>
    );
  }

  if (!content) {
    return emptyHint ? <div className="text-xs text-text-muted leading-relaxed">{emptyHint}</div> : null;
  }

  return (
    <div className="p-4 rounded-xl bg-primary-glow/15 border border-primary/20 text-xs text-text-main leading-relaxed whitespace-pre-line relative">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-extrabold text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {title}
        </span>
        <div className="flex items-center gap-2">
          {simulated && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Demo
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main transition-colors"
              aria-label="Dismiss AI result"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {content}
    </div>
  );
}
