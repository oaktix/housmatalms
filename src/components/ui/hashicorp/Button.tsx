"use client";

import React, { forwardRef } from "react";
import Link from "next/link";

export type ButtonVariant =
  | "primary"     // White bg, black text on dark; black bg, white text on light
  | "secondary"   // Surface-2 ground, hairline border, white text
  | "ghost"       // Transparent ground, subtle hover lift
  | "hcem"        // Housmata Emerald (#02b875)
  | "hcpa"        // Sovereign Violet (#7b42bc)
  | "vault"       // Vault Amber (#f59e0b)
  | "consul"      // Consul Red (#e62b1e)
  | "outline";    // 1px hairline border, subtle hover

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-inverse-canvas text-inverse-ink hover:opacity-90 active:scale-[0.98] shadow-sm",
  secondary:
    "bg-surface-2 text-ink border border-hairline-soft hover:border-hairline hover:bg-surface-3 active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-muted hover:text-ink hover:bg-surface-1 active:scale-[0.98]",
  hcem:
    "bg-product-hcem text-black font-bold hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(2,184,117,0.3)]",
  hcpa:
    "bg-product-hcpa text-white font-bold hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(123,66,188,0.3)]",
  vault:
    "bg-product-vault text-black font-bold hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.3)]",
  consul:
    "bg-product-consul text-white font-bold hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(230,43,30,0.3)]",
  outline:
    "bg-transparent text-ink border border-hairline hover:bg-surface-2 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-base gap-2.5 rounded-md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      href,
      icon,
      iconPosition = "right",
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = `inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
      variantStyles[variant]
    } ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`;

    const content = (
      <>
        {icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseClasses} disabled={disabled} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
