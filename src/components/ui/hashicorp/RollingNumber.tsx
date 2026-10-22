"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export interface RollingNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

export function RollingNumber({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  delay = 0,
}: RollingNumberProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const numberRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef({ current: 0 });

  useEffect(() => {
    // If reduced motion is preferred, jump straight to value
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      stateRef.current.current = value;
      return;
    }

    const tween = gsap.to(stateRef.current, {
      current: value,
      duration,
      delay,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayValue(stateRef.current.current);
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration, delay]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span
      ref={numberRef}
      className={`tabular-nums font-semibold tracking-tight ${className}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
