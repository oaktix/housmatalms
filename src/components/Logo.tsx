import React from "react";
import Image from "next/image";

interface LogoProps {
  height?: number;
  showText?: boolean;
  variant?: "default" | "white" | "dark-only" | "light-only";
  className?: string;
}

export default function Logo({
  height = 36,
  variant = "default",
  className = "",
}: LogoProps) {
  // Approximate a standard aspect ratio for the logo image (width is roughly 4.5x the height)
  const width = height * 4.5;

  const containerId = `logo-${height}-${width}`.replace(/\./g, "-");

  return (
    <div
      id={containerId}
      className={`relative flex items-center select-none ${className}`}
    >
      <style>{`
        #${containerId} {
          height: ${height}px;
          width: ${width}px;
        }
      `}</style>
      {/* Light Mode Logo */}
      <Image
        src="/logo-light.png"
        alt="Housmata Logo"
        fill
        className={`object-contain ${
          variant === "white" || variant === "dark-only"
            ? "hidden"
            : variant === "light-only"
            ? "block"
            : "block dark:hidden"
        }`}
        priority
      />
      
      {/* Dark Mode Logo */}
      <Image
        src="/logo-dark.png"
        alt="Housmata Logo"
        fill
        className={`object-contain ${
          variant === "light-only"
            ? "hidden"
            : variant === "white" || variant === "dark-only"
            ? "block"
            : "hidden dark:block"
        }`}
        priority
      />
    </div>
  );
}
