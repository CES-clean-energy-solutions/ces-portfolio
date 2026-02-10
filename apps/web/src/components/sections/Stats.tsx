"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// PLACEHOLDER — replace with real stats
const STATS = [
  { value: 500, suffix: "+", label: "Projects Delivered" },
  { value: 30, suffix: "", label: "Years Experience" },
  { value: 15, suffix: "", label: "Countries" },
  { value: 50, suffix: "+", label: "Engineers" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) {
        // Show final values immediately
        STATS.forEach((stat, i) => {
          const el = numberRefs.current[i];
          if (el) el.textContent = String(stat.value);
        });
        return;
      }

      // Count-up animation triggers once when section enters viewport
      STATS.forEach((stat, i) => {
        const el = numberRefs.current[i];
        if (!el) return;

        const obj = { value: 0 };

        gsap.to(obj, {
          value: stat.value,
          duration: 2,
          ease: "power2.out",
          snap: { value: 1 }, // Integer rounding
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.value));
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="bg-[#0a0a0a] px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4 lg:gap-16">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="text-5xl font-bold text-brand-gold md:text-6xl lg:text-7xl">
              <span
                ref={(el) => {
                  numberRefs.current[i] = el;
                }}
              >
                0
              </span>
              {stat.suffix && (
                <span className="text-brand-gold">{stat.suffix}</span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted md:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
