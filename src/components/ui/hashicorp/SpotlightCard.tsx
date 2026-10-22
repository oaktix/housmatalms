"use client";

import React, { useRef, useState, useCallback } from "react";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  variant?: "default" | "hcem" | "hcpa" | "vault" | "consul" | "surface-2";
  className?: string;
  radius?: "md" | "lg" | "xl" | "2xl";
  interactive?: boolean;
}

const variantGradients: Record<string, string> = {
  default: "rgba(255, 255, 255, 0.08)",
  hcem: "rgba(2, 184, 117, 0.18)",
  hcpa: "rgba(123, 66, 188, 0.22)",
  vault: "rgba(245, 158, 11, 0.18)",
  consul: "rgba(230, 43, 30, 0.18)",
  "surface-2": "rgba(255, 255, 255, 0.06)",
};

const radiusClasses = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export function SpotlightCard({
  children,
  spotlightColor,
  variant = "default",
  className = "",
  radius = "lg",
  interactive = true,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  const glow = spotlightColor || variantGradients[variant] || variantGradients.default;

  return (
    <div
      ref={cardRef}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseEnter={interactive ? handleMouseEnter : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      className={`relative overflow-hidden bg-surface-1 border border-hairline-soft transition-all duration-300 ${
        radiusClasses[radius]
      } ${
        interactive ? "hover:border-hairline hover:-translate-y-0.5" : ""
      } ${className}`}
      {...props}
    >
      {/* Radial Spotlight Follower */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glow}, transparent 40%)`,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
