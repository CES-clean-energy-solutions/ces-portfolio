"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import cesLogoWhite from "@repo/ui/assets/ces-logo-full-white.svg";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const ParticlesBackground = dynamic(
  () => import("@/components/ParticlesBackground"),
  { ssr: false }
);

const CursorRipple = dynamic(() => import("@/components/CursorRipple"), {
  ssr: false,
});

// PLACEHOLDER — replace with real content
const HEADLINE = "Engineering Tomorrow's Energy";
const SUBHEADLINE =
  "Vienna-based consultancy delivering sustainable solutions for buildings, cities, and infrastructure worldwide.";

export default function Hero() {
  const container = useRef<HTMLElement>(null);
  const [showParticles, setShowParticles] = useState(false);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      ScrollTrigger.matchMedia({
        // Desktop: full character-level SplitText reveal
        "(min-width: 1024px)": function () {
          const split = SplitText.create(".hero-headline", {
            type: "chars,words",
            autoSplit: true,
          });

          const tl = gsap.timeline();

          tl.from(".hero-logo", {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          })
            .from(
              split.chars,
              {
                y: 80,
                opacity: 0,
                stagger: 0.03,
                duration: 0.8,
                ease: "power3.out",
              },
              "-=0.2"
            )
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

          tl.from(".hero-logo", {
            scale: 0.9,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          })
            .from(
              split.words,
              {
                y: 40,
                opacity: 0,
                stagger: 0.06,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.1"
            )
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

      // Fade in particles after hero text animation finishes (~1.5s)
      if (isDesktop) {
        gsap.delayedCall(1.5, () => setShowParticles(true));
      }
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative flex min-h-screen items-center justify-center bg-brand-black px-4 pt-[var(--header-h)] sm:px-6 lg:px-8"
    >
      {/* Mobile/tablet fallback: subtle green radial gradient (zero JS) */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.15 0.05 150) 0%, oklch(0 0 0) 70%)",
        }}
      />

      {/* Desktop: also show gradient as base, particles layer on top */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.15 0.05 150) 0%, oklch(0 0 0) 70%)",
        }}
      />

      {/* Particles fade in over 1s after GSAP hero animation completes */}
      {showParticles && (
        <div className="absolute inset-0 z-0 animate-[fadeIn_1s_ease-out_forwards]">
          <ParticlesBackground />
        </div>
      )}

      {/* Cursor water ripple — above particles, below content */}
      {showParticles && (
        <div className="absolute inset-0 z-10 animate-[fadeIn_1s_ease-out_forwards]">
          <CursorRipple containerRef={container} />
        </div>
      )}

      <div className="hero-content relative z-20 max-w-4xl text-center">
        <Image
          src={cesLogoWhite}
          alt="CES Clean Energy Solutions"
          width={280}
          height={224}
          priority
          className="hero-logo mx-auto mb-8 h-auto w-48 sm:w-56 md:w-64 lg:w-72"
        />

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
