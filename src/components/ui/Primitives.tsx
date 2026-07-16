"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-main pb-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h1 className="text-lg font-heading font-bold text-text-main truncate">{title}</h1>
          {subtitle && <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="p-8 rounded-2xl bg-bg-card border border-border-main text-center space-y-3">
      {icon && <div className="mx-auto w-fit text-text-muted opacity-60">{icon}</div>}
      <h3 className="font-bold text-text-main text-sm">{title}</h3>
      {description && <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-bg-card-hover ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="premium-card rounded-2xl bg-bg-card border-border-main p-6 space-y-4">
      <LoadingSkeleton className="h-4 w-1/3" />
      <LoadingSkeleton className="h-3 w-full" />
      <LoadingSkeleton className="h-3 w-5/6" />
      <LoadingSkeleton className="h-3 w-2/3" />
    </div>
  );
}

export function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} />;
}
