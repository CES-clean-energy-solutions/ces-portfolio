"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronNoPad } from "@/components/icons/ChevronIcon";
import { InnovationMediaCard } from "./InnovationMediaCard";
import type {
  InnovationArea,
  InnovationSubItem,
  InnovationLink,
} from "@ces/content/data/innovation";

interface InnovationSlideProps {
  area: InnovationArea;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Video background — inline here (no shared component needed; same pattern
// as ServiceVideo but simpler: no fade-out, just fade-in on active)
// ---------------------------------------------------------------------------

interface VideoBackgroundProps {
  video: InnovationArea["video"];
  isActive: boolean;
}

function VideoBackground({ video, isActive }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;
    const FADE = 1.5;
    const t = el.currentTime;
    const dur = el.duration;
    if (t < FADE) setOpacity(t / FADE);
    else if (t > dur - FADE) setOpacity((dur - t) / FADE);
    else setOpacity(1);
  }, []);

  const handleEnded = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      setOpacity(0);
      el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
      setOpacity(0);
    }
  }, [isActive]);

  // No video src — render dark gradient placeholder
  const hasVideo = Boolean(video.webm || video.mp4);

  if (!hasVideo) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
    );
  }

  // Respect reduced motion — show poster or gradient
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return video.poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={video.poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover transition-none"
      style={{ opacity }}
      muted
      playsInline
      preload="none"
      poster={video.poster || undefined}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    >
      {isMobile ? (
        video.mp4Mobile ? (
          <source src={video.mp4Mobile} type="video/mp4" />
        ) : null
      ) : (
        <>
          {video.webm && <source src={video.webm} type="video/webm" />}
          {video.mp4 && <source src={video.mp4} type="video/mp4" />}
        </>
      )}
    </video>
  );
}

// ---------------------------------------------------------------------------
// Slide
// ---------------------------------------------------------------------------

export function InnovationSlide({ area, isActive }: InnovationSlideProps) {
  const visibleImages = area.images.filter((img) => img.src !== "");

  return (
    <div className="absolute inset-0 flex items-end pb-16 lg:items-center lg:pb-0">
      {/* Video / gradient background */}
      <VideoBackground video={area.video} isActive={isActive} />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Compound heading: "CES Innovation [chevron] Title"
            Font size lives on h2 so h-[1em] on the SVG tracks it exactly. */}
        <h2 className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          <span>CES Innovation</span>
          <ChevronNoPad className="h-[3.15rem] w-[1.5rem] sm:h-[4.2rem] sm:w-[2rem] lg:h-[5.25rem] lg:w-[2.5rem] flex-shrink-0" />
          <span>{area.title}</span>
        </h2>

        {/* Two-column content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column: description + sub-items + stats + links */}
          <div className="flex flex-col gap-6">
            <p className="leading-relaxed text-white/90">
              {area.longDescription}
            </p>

            {/* Sub-items */}
            {area.subItems.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gold">
                  Capabilities
                </h3>
                <ul className="space-y-2">
                  {area.subItems.map((item: InnovationSubItem) => (
                    <li
                      key={item.slug}
                      className="flex items-start gap-2 text-sm text-white"
                    >
                      <span className="mt-1 text-brand-gold">→</span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div>
              <div className="text-3xl font-bold text-brand-gold">
                {area.stats.metric}
              </div>
              <div className="mt-1 text-sm text-white">
                {area.stats.metricLabel}
              </div>
              <div className="mt-1 text-xs text-white/60">
                {area.stats.secondary}
              </div>
            </div>

            {/* Links */}
            {area.links && area.links.length > 0 && (
              <div className="flex flex-col gap-2">
                {area.links.map((link: InnovationLink, idx: number) => (
                  <a
                    key={idx}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                      link.external
                        ? "text-brand-gold hover:text-brand-gold/80"
                        : "text-white hover:text-brand-gold"
                    }`}
                  >
                    {link.label}
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          link.external
                            ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            : "M9 5l7 7-7 7"
                        }
                      />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right column: media cards (desktop only, hidden on mobile) */}
          {visibleImages.length > 0 && (
            <div className="hidden items-center justify-center lg:flex">
              <div className="grid w-full max-w-md gap-4">
                {visibleImages.slice(0, 3).map((image, idx) => (
                  <InnovationMediaCard key={idx} image={image} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
