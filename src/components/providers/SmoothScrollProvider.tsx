"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePathname } from "next/navigation";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | HTMLElement | number, options?: Record<string, unknown>) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  stop: () => {},
  start: () => {},
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // GSAP ticker lockstep synchronization
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  // Scroll to top on pathname changes smoothly
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  const stop = () => {
    lenisRef.current?.stop();
    document.documentElement.classList.add("lenis-stopped");
  };

  const start = () => {
    lenisRef.current?.start();
    document.documentElement.classList.remove("lenis-stopped");
  };

  const scrollTo = (target: string | HTMLElement | number, options?: Record<string, unknown>) => {
    lenisRef.current?.scrollTo(target, options);
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, stop, start, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
