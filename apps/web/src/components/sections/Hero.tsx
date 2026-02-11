"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import cesText from "@repo/ui/assets/ces-text-white.svg";
import cesChevron from "@repo/ui/assets/ces-chevron.svg";
import cesSubtitle from "@repo/ui/assets/ces-subtitle-white.svg";
import HeroVideo from "@/components/HeroVideo";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const ParticlesBackground = dynamic(
  () => import("@/components/ParticlesBackground"),
  { ssr: false }
);

const HEADLINE = "Connect with the future of sustainable engineering";

export default function Hero() {
  const container = useRef<HTMLElement>(null);
  const [showParticles, setShowParticles] = useState(false);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      ScrollTrigger.matchMedia({
        // Desktop: full character-level SplitText reveal with staggered logo parts
        "(min-width: 1024px)": function () {
          const split = SplitText.create(".hero-headline", {
            type: "chars,words",
            autoSplit: true,
          });

          const tl = gsap.timeline();

          // Chevron scales in first (gold brand mark)
          tl.from(".hero-logo-chevron", {
            scale: 0.6,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.4)",
          })
            // "ces" text slides in from left
            .from(
              ".hero-logo-text",
              {
                x: -20,
                opacity: 0,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.2"
            )
            // Subtitle fades up from below
            .from(
              ".hero-logo-subtitle",
              {
                y: 15,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
              },
              "-=0.15"
            )
            // Headline chars cascade in
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
              ".hero-cta",
              { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" },
              "-=0.2"
            );

          // Repeating chevron pulse: ghost copy scales up and fades out
          const pulse = gsap.timeline({
            repeat: -1,
            repeatDelay: 1.5,
            delay: tl.duration() + 0.5,
          });
          pulse
            .set(".hero-logo-chevron-pulse", { x: 0, opacity: 0.5 })
            .to(".hero-logo-chevron-pulse", {
              x: 600,
              opacity: 0,
              duration: 4.9,
              ease: "power1.out",
            });
        },

        // Tablet: word-level split, simpler logo stagger
        "(min-width: 768px) and (max-width: 1023px)": function () {
          const split = SplitText.create(".hero-headline", {
            type: "words",
            autoSplit: true,
          });

          const tl = gsap.timeline();

          // All three logo parts fade in with slight stagger, no positional shifts
          tl.from(".hero-logo-chevron", {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          })
            .from(
              ".hero-logo-text",
              {
                opacity: 0,
                duration: 0.4,
                ease: "power2.out",
              },
              "-=0.25"
            )
            .from(
              ".hero-logo-subtitle",
              {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
              },
              "-=0.2"
            )
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
              ".hero-cta",
              { opacity: 0, duration: 0.3, ease: "power2.out" },
              "-=0.1"
            );

          // Chevron pulse for tablet - shorter distance
          const tabletPulse = gsap.timeline({
            repeat: -1,
            repeatDelay: 1.5,
            delay: tl.duration() + 0.5,
          });
          tabletPulse
            .set(".hero-logo-chevron-pulse", { x: 0, opacity: 0.5 })
            .to(".hero-logo-chevron-pulse", {
              x: 300,
              opacity: 0,
              duration: 4.9,
              ease: "power1.out",
            });
        },

        // Mobile: simple fade for entire block (logo parts fade together)
        "(max-width: 767px)": function () {
          const tl = gsap.timeline();

          tl.from(".hero-content", {
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          });

          // Chevron pulse for mobile - shortest distance
          const mobilePulse = gsap.timeline({
            repeat: -1,
            repeatDelay: 1.5,
            delay: tl.duration() + 0.5,
          });
          mobilePulse
            .set(".hero-logo-chevron-pulse", { x: 0, opacity: 0.5 })
            .to(".hero-logo-chevron-pulse", {
              x: 150,
              opacity: 0,
              duration: 4.9,
              ease: "power1.out",
            });
        },
      });

      // Fade in particles after hero text animation finishes (~1.5s)
      // Particles now work on all viewports with adaptive configs
      gsap.delayedCall(1.5, () => setShowParticles(true));
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative flex min-h-screen items-center justify-center bg-brand-black px-4 pt-[var(--header-h)] sm:px-6 lg:px-8"
    >
      {/* Background video (z-0) — looping ambient video or static poster */}
      <HeroVideo />

      {/* Dark overlay (z-10) — ensures text legibility over video */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 10,
          backgroundColor: "black",
          opacity: "var(--video-overlay-opacity)",
        }}
      />

      {/* Particles fade in over 1s after GSAP hero animation completes (z-20) */}
      {showParticles && (
        <div className="absolute inset-0 animate-[fadeIn_1s_ease-out_forwards]" style={{ zIndex: 20 }}>
          <ParticlesBackground />
        </div>
      )}

      <div className="hero-content relative max-w-4xl text-center" style={{ zIndex: 40 }}>
        {/* Layered logo: three SVG parts stacked absolutely, sharing the same viewBox */}
        <div
          className="hero-logo relative mx-auto mb-8 w-48 sm:w-56 md:w-64 lg:w-72"
          style={{ aspectRatio: "275.52 / 219.84" }}
        >
          <Image
            src={cesText}
            alt="CES Clean Energy Solutions"
            fill
            priority
            className="hero-logo-text object-contain"
          />
          <Image
            src={cesChevron}
            alt=""
            fill
            className="hero-logo-chevron object-contain"
          />
          {/* Ghost chevron: duplicate that scales up + fades out in a repeating pulse */}
          <Image
            src={cesChevron}
            alt=""
            fill
            className="hero-logo-chevron-pulse pointer-events-none object-contain opacity-0"
          />
          <Image
            src={cesSubtitle}
            alt=""
            fill
            className="hero-logo-subtitle object-contain"
          />
        </div>

        <h1 className="hero-headline text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {HEADLINE}
        </h1>

        <div className="hero-cta mt-10">
          <button className="min-h-11 min-w-11 rounded-md bg-brand-gold px-8 py-3 text-sm font-semibold text-brand-black transition-opacity hover:opacity-90">
            Get in Touch
          </button>
        </div>
      </div>
    </section>
  );
}
