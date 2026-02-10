"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins once at module scope
gsap.registerPlugin(ScrollTrigger, SplitText);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<import("lenis").default | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Only enable Lenis on desktop (≥1024px)
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    // Dynamic import to avoid SSR issues with Lenis
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis();
      lenisRef.current = lenis;

      // Sync Lenis scroll position with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      // Let GSAP's ticker drive Lenis's animation frame
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return <>{children}</>;
}
