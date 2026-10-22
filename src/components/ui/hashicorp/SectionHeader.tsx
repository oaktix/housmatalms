"use client";

import React from "react";

export interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowColor?: "default" | "hcem" | "hcpa" | "vault" | "waypoint";
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  align?: "left" | "center";
  size?: "lg" | "xl";
  className?: string;
  badge?: React.ReactNode;
}

const eyebrowColorMap = {
  default: "text-ink-subtle",
  hcem: "text-product-hcem",
  hcpa: "text-[#a855f7]",
  vault: "text-product-vault",
  waypoint: "text-product-waypoint",
};

export function SectionHeader({
  eyebrow,
  eyebrowColor = "default",
  title,
  description,
  align = "left",
  size = "lg",
  className = "",
  badge,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-3 ${
        isCenter ? "text-center mx-auto max-w-3xl" : "max-w-3xl"
      } ${className}`}
    >
      {(eyebrow || badge) && (
        <div
          className={`flex items-center gap-2.5 ${
            isCenter ? "justify-center" : "justify-start"
          }`}
        >
          {badge}
          {eyebrow && (
            <span
              className={`text-eyebrow font-semibold tracking-widest ${eyebrowColorMap[eyebrowColor]}`}
            >
              {eyebrow}
            </span>
          )}
        </div>
      )}

      <h2
        className={`text-ink tracking-tight ${
          size === "xl" ? "text-display-xl" : "text-display-lg"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p className="text-body-lg text-ink-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
