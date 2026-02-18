"use client";

import { useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { InnovationSlide } from "./InnovationSlide";
import type { InnovationArea } from "@ces/content/data/innovation";

gsap.registerPlugin(ScrollTrigger);

interface InnovationShowcaseProps {
  innovations: InnovationArea[];
}

function InnovationProgressDots({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  return (
    <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === activeIndex ? "w-8 bg-brand-gold" : "w-2 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

export function InnovationShowcase({ innovations }: InnovationShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const setSlideRef = useCallback(
    (_el: HTMLDivElement | null, _index: number) => {
      // Reserved for future per-slide animation hooks
    },
    []
  );

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const totalAreas = innovations.length;

      ScrollTrigger.matchMedia({
        // Desktop: pin the viewport, scroll the tall track upward through it
        "(min-width: 1024px)": () => {
          const scrollDistance = (totalAreas * 2 - 1) * window.innerHeight;

          gsap.to(trackRef.current, {
            y: -(totalAreas - 1) * window.innerHeight,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: `+=${scrollDistance}`,
              pin: true,
              scrub: 0.5,
              snap: {
                snapTo: 1 / (totalAreas - 1),
                duration: { min: 0.2, max: 0.6 },
                delay: 0.05,
                ease: "power1.inOut",
              },
              onUpdate: (self) => {
                const newIndex = Math.min(
                  Math.floor(self.progress * totalAreas),
                  totalAreas - 1
                );
                setActiveIndex(newIndex);
              },
            },
          });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {/* Desktop: pinned viewport with scrolling track */}
      <div className="relative hidden h-screen w-full overflow-hidden lg:block">
        {/* Tall track — each slide is 100vh, stacked vertically */}
        <div ref={trackRef} className="will-change-transform">
          {innovations.map((area, i) => (
            <div
              key={area.id}
              ref={(el) => setSlideRef(el, i)}
              className="relative h-screen w-full"
            >
              <InnovationSlide area={area} isActive={activeIndex === i} />
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <InnovationProgressDots
          total={innovations.length}
          activeIndex={activeIndex}
        />
      </div>

      {/* Mobile/tablet: stacked panels with fade-in */}
      <div className="lg:hidden">
        {innovations.map((area) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative min-h-screen"
          >
            <InnovationSlide area={area} isActive={true} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
