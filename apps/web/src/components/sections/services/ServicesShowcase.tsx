"use client";

import { useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { ServiceSlide } from "./ServiceSlide";
import type { ServiceCategory } from "@ces/content/data/services";

gsap.registerPlugin(ScrollTrigger);

interface ServicesShowcaseProps {
  services: ServiceCategory[];
}

function ServiceProgressDots({
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
            i === activeIndex ? "w-8 bg-gold" : "w-2 bg-white/30"
          }`}
        />
      ))}
    </div>
  );
}

export function ServicesShowcase({ services }: ServicesShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const setSlideRef = useCallback(
    (el: HTMLDivElement | null, index: number) => {
      slideRefs.current[index] = el;
    },
    []
  );

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const totalServices = services.length;

      ScrollTrigger.matchMedia({
        // Desktop: pin the viewport, scroll the tall track upward through it
        "(min-width: 1024px)": () => {
          // The track is totalServices * 100vh tall.
          // Pin the outer container (viewport-sized) and translate the
          // inner track upward as the user scrolls, so each service
          // naturally scrolls into and out of view.

          // Extra scroll distance per section so each one "dwells" in view
          // before the next transition begins. Each section gets 1vh of
          // hold time + 1vh of travel, so total = totalServices * 2 - 1
          // viewports of scroll distance (hold–travel–hold–travel…hold).
          const scrollDistance = (totalServices * 2 - 1) * window.innerHeight;

          gsap.to(trackRef.current, {
            y: -(totalServices - 1) * window.innerHeight,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: `+=${scrollDistance}`,
              pin: true,
              scrub: 0.5,
              snap: {
                // Snap to each section's "hold" midpoint
                snapTo: 1 / (totalServices - 1),
                duration: { min: 0.2, max: 0.6 },
                delay: 0.05,
                ease: "power1.inOut",
              },
              onUpdate: (self) => {
                const newIndex = Math.min(
                  Math.floor(self.progress * totalServices),
                  totalServices - 1
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
          {services.map((service, i) => (
            <div
              key={service.id}
              ref={(el) => setSlideRef(el, i)}
              className="relative h-screen w-full"
            >
              <ServiceSlide
                service={service}
                isActive={activeIndex === i}
              />
            </div>
          ))}
        </div>

        {/* Progress dots — fixed within the pinned container */}
        <ServiceProgressDots
          total={services.length}
          activeIndex={activeIndex}
        />
      </div>

      {/* Mobile/tablet: simple stacked sections with fade-in */}
      <div className="lg:hidden">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative min-h-screen"
          >
            <ServiceSlide service={service} isActive={true} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
