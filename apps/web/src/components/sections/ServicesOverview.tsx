"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ServicesOverview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      ScrollTrigger.matchMedia({
        // Desktop: pinned text reveal
        "(min-width: 1024px)": () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=50%",
              pin: true,
              scrub: 0.5,
            },
          });

          tl.from(subtitleRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
          })
            .from(
              headingRef.current,
              {
                opacity: 0,
                y: 40,
                duration: 0.5,
              },
              0.1
            )
            .from(
              introRef.current,
              {
                opacity: 0,
                y: 30,
                duration: 0.4,
              },
              0.3
            );
        },

        // Mobile/tablet: simple scroll-through with IntersectionObserver-style fade
        "(max-width: 1023px)": () => {
          gsap.from([subtitleRef.current, headingRef.current, introRef.current], {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true,
            },
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center bg-black"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <p
          ref={subtitleRef}
          className="text-sm font-medium uppercase tracking-wider text-gold/70"
        >
          Engineering Services
        </p>
        <h2
          ref={headingRef}
          className="mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
        >
          Comprehensive Solutions for{" "}
          <span className="text-gold">Sustainable Infrastructure</span>
        </h2>
        <p
          ref={introRef}
          className="mt-5 max-w-2xl text-lg text-white/70"
        >
          From energy audits to renewable integration, smart buildings to green
          finance — we deliver end-to-end engineering excellence across six core
          practice areas.
        </p>
      </div>
    </section>
  );
}
