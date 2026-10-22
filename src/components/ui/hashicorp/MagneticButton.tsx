"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { Button, ButtonProps } from "./Button";

export interface MagneticButtonProps extends ButtonProps {
  magneticPull?: number; // Distance multiplier (default 0.35)
  threshold?: number;   // Detection radius in px
}

export function MagneticButton({
  children,
  magneticPull = 0.35,
  threshold = 60,
  className = "",
  ...props
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Skip magnetic physics if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < threshold) {
        gsap.to(el, {
          x: deltaX * magneticPull,
          y: deltaY * magneticPull,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [magneticPull, threshold]);

  return (
    <div ref={containerRef} className="inline-block will-change-transform">
      <Button ref={buttonRef} className={className} {...props}>
        {children}
      </Button>
    </div>
  );
}
