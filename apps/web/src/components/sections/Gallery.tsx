"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// PLACEHOLDER — replace with real project data
const PROJECTS = [
  { title: "Project Alpha", color: "oklch(0.2 0.02 85)" },
  { title: "Project Beta", color: "oklch(0.18 0.01 60)" },
  { title: "Project Gamma", color: "oklch(0.22 0.02 120)" },
  { title: "Project Delta", color: "oklch(0.17 0.01 200)" },
  { title: "Project Epsilon", color: "oklch(0.2 0.02 300)" },
  { title: "Project Zeta", color: "oklch(0.19 0.01 30)" },
];

const CARD_WIDTH = 400; // px on desktop
const CARD_GAP = 24; // px

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      ScrollTrigger.matchMedia({
        // Desktop: pinned horizontal scroll
        "(min-width: 1024px)": function () {
          const track = trackRef.current;
          if (!track) return;

          const totalScrollWidth =
            track.scrollWidth - window.innerWidth;

          gsap.to(track, {
            x: -totalScrollWidth,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              pin: true,
              scrub: 1,
              // Pin for the distance of the horizontal overflow
              end: () => `+=${totalScrollWidth}`,
              invalidateOnRefresh: true,
            },
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="overflow-hidden bg-brand-black px-4 py-24 sm:px-6 md:py-32 lg:px-0 lg:py-0"
    >
      {/* Section heading — visible outside the scroll track */}
      <div className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 md:mb-16 lg:mb-0 lg:px-8 lg:pt-40 lg:pb-12">
        <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Projects
        </h2>
      </div>

      {/* Desktop: horizontal scroll track */}
      <div
        ref={trackRef}
        className="
          flex flex-col gap-4
          md:flex-row md:gap-0 md:overflow-x-auto md:scroll-snap-type-x md:snap-x md:snap-mandatory
          lg:flex-nowrap lg:gap-6 lg:overflow-visible lg:snap-none lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]
        "
      >
        {PROJECTS.map((project, i) => (
          <GalleryCard key={project.title} project={project} index={i} />
        ))}

        {/* Spacer so the last card can reach center on desktop */}
        <div
          aria-hidden
          className="hidden lg:block lg:shrink-0"
          style={{ width: `calc(100vw - ${CARD_WIDTH}px - 4rem)` }}
        />
      </div>
    </section>
  );
}

function GalleryCard({
  project,
  index,
}: {
  project: { title: string; color: string };
  index: number;
}) {
  return (
    <motion.div
      // Mobile/tablet: fade-in via Motion. Desktop: GSAP handles scroll.
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="
        w-full shrink-0 snap-center
        md:w-[85vw]
        lg:w-[400px]
      "
    >
      <div
        className="flex aspect-[4/3] items-end rounded-lg border border-border p-6"
        style={{ backgroundColor: project.color }}
      >
        <h3 className="text-xl font-semibold text-white">{project.title}</h3>
      </div>
    </motion.div>
  );
}
