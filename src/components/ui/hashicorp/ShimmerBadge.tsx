"use client";

import React from "react";

export type ShimmerBadgeVariant =
  | "default"
  | "hcem"
  | "hcpa"
  | "vault"
  | "waypoint"
  | "consul";

export interface ShimmerBadgeProps {
  children: React.ReactNode;
  variant?: ShimmerBadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<ShimmerBadgeVariant, { container: string; dot: string; beam: string }> = {
  default: {
    container: "bg-surface-2 border-hairline text-ink-muted",
    dot: "bg-ink-muted",
    beam: "from-transparent via-white/10 to-transparent",
  },
  hcem: {
    container: "bg-product-hcem/10 border-product-hcem/30 text-product-hcem",
    dot: "bg-product-hcem shadow-[0_0_8px_#02b875]",
    beam: "from-transparent via-[#02b875]/25 to-transparent",
  },
  hcpa: {
    container: "bg-product-hcpa/10 border-product-hcpa/30 text-[#a855f7]",
    dot: "bg-product-hcpa shadow-[0_0_8px_#7b42bc]",
    beam: "from-transparent via-[#7b42bc]/30 to-transparent",
  },
  vault: {
    container: "bg-product-vault/10 border-product-vault/30 text-product-vault",
    dot: "bg-product-vault shadow-[0_0_8px_#f59e0b]",
    beam: "from-transparent via-[#f59e0b]/25 to-transparent",
  },
  waypoint: {
    container: "bg-product-waypoint/10 border-product-waypoint/30 text-product-waypoint",
    dot: "bg-product-waypoint shadow-[0_0_8px_#14c6cb]",
    beam: "from-transparent via-[#14c6cb]/25 to-transparent",
  },
  consul: {
    container: "bg-product-consul/10 border-product-consul/30 text-product-consul",
    dot: "bg-product-consul shadow-[0_0_8px_#e62b1e]",
    beam: "from-transparent via-[#e62b1e]/25 to-transparent",
  },
};

export function ShimmerBadge({
  children,
  variant = "default",
  icon,
  className = "",
  dot = false,
}: ShimmerBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`relative inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border overflow-hidden select-none ${styles.container} ${className}`}
    >
      {/* Traveling Shimmer Beam */}
      <div
        className={`absolute inset-0 w-[200%] bg-gradient-to-r ${styles.beam} -translate-x-full animate-[shimmer_3s_infinite_linear] pointer-events-none`}
      />

      {dot && (
        <span
          className={`relative z-10 w-1.5 h-1.5 rounded-full ${styles.dot}`}
        />
      )}

      {icon && <span className="relative z-10 flex-shrink-0">{icon}</span>}

      <span className="relative z-10">{children}</span>
    </div>
  );
}
