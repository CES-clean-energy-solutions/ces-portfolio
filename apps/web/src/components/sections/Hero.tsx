"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// PLACEHOLDER — replace with real content
const HEADLINE = "Engineering Tomorrow's Energy";
const SUBHEADLINE =
  "Vienna-based consultancy delivering sustainable solutions for buildings, cities, and infrastructure worldwide.";

export default function Hero() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      ScrollTrigger.matchMedia({
        // Desktop: full character-level SplitText reveal
        "(min-width: 1024px)": function () {
          const split = SplitText.create(".hero-headline", {
            type: "chars,words",
            autoSplit: true,
          });

          const tl = gsap.timeline();

          tl.from(split.chars, {
            y: 80,
            opacity: 0,
            stagger: 0.03,
            duration: 0.8,
            ease: "power3.out",
          })
            .from(
              ".hero-subheadline",
              { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" },
              "-=0.3"
            )
            .from(
              ".hero-cta",
              { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" },
              "-=0.2"
            );
        },

        // Tablet: word-level split, shorter duration
        "(min-width: 768px) and (max-width: 1023px)": function () {
          const split = SplitText.create(".hero-headline", {
            type: "words",
            autoSplit: true,
          });

          const tl = gsap.timeline();

          tl.from(split.words, {
            y: 40,
            opacity: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: "power2.out",
          })
            .from(
              ".hero-subheadline",
              { opacity: 0, duration: 0.4, ease: "power2.out" },
              "-=0.2"
            )
            .from(
              ".hero-cta",
              { opacity: 0, duration: 0.3, ease: "power2.out" },
              "-=0.1"
            );
        },

        // Mobile: simple fade for entire block
        "(max-width: 767px)": function () {
          gsap.from(".hero-content", {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        },
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="flex min-h-screen items-center justify-center bg-brand-black px-4 pt-[var(--header-h)] sm:px-6 lg:px-8"
    >
      <div className="hero-content max-w-4xl text-center">
        <h1 className="hero-headline text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {HEADLINE}
        </h1>

        <p className="hero-subheadline mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">
          {SUBHEADLINE}
        </p>

        <div className="hero-cta mt-10">
          <button className="min-h-11 min-w-11 rounded-md bg-brand-gold px-8 py-3 text-sm font-semibold text-brand-black transition-opacity hover:opacity-90">
            Get in Touch
          </button>
        </div>
      </div>
    </section>
  );
}
