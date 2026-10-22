import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Check reduced motion preference
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) {
    gsap.globalTimeline.timeScale(100);
  }

  mediaQuery.addEventListener?.("change", (e) => {
    if (e.matches) {
      gsap.globalTimeline.timeScale(100);
    } else {
      gsap.globalTimeline.timeScale(1);
    }
  });
}

export { gsap, ScrollTrigger };
