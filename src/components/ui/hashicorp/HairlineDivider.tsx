"use client";

import React from "react";

export interface HairlineDividerProps {
  variant?: "subtle" | "glow" | "strong" | "hcem" | "hcpa";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const variantStyles = {
  subtle: "bg-hairline-soft",
  glow: "bg-hairline-glow shadow-[0_0_8px_rgba(2,184,117,0.3)]",
  strong: "bg-hairline",
  hcem: "bg-product-hcem/30 shadow-[0_0_8px_rgba(2,184,117,0.2)]",
  hcpa: "bg-product-hcpa/30 shadow-[0_0_8px_rgba(123,66,188,0.2)]",
};

export function HairlineDivider({
  variant = "subtle",
  orientation = "horizontal",
  className = "",
}: HairlineDividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={`w-px h-full self-stretch ${variantStyles[variant]} ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <div
      className={`w-full h-px ${variantStyles[variant]} ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
