"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import cesChevron from "@repo/ui/assets/ces-chevron.svg";
import type { InnovationArea } from "@ces/content/data/innovation";

interface InnovationBentoCardProps {
  area: InnovationArea;
  onClick: () => void;
}

export function InnovationBentoCard({ area, onClick }: InnovationBentoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const hasVideoSrc = !!area.video.webm;
  // Play on hover only on desktop without reduced-motion
  const canPlay = hasVideoSrc && !videoFailed && !isMobile && !prefersReducedMotion;

  // Fallback poster: first non-empty image from the images array
  const fallbackPosterSrc = area.images.find((img) => img.src)?.src ?? "";

  const handleLoadedMetadata = useCallback(() => {
    // Ensure frame 0 is rendered as the poster
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!canPlay || !videoRef.current) return;
    videoRef.current.play().catch(() => {
      // Autoplay blocked — frame 0 stays visible, no flash
    });
  }, [canPlay]);

  const handleMouseLeave = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  // Show the video element (for frame 0) unless it failed or there's no source
  const showVideo = hasVideoSrc && !videoFailed;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${area.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 outline-none ring-brand-gold focus-visible:ring-2 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]"
    >
      {/* Video as primary background — shows frame 0 at rest, plays on hover */}
      {showVideo && (
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="metadata"
          aria-hidden="true"
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={area.video.webm} type="video/webm" />
          {area.video.mp4 && (
            <source src={area.video.mp4} type="video/mp4" />
          )}
        </video>
      )}

      {/* Fallback image — only shown if video fails or no video source */}
      {!showVideo && fallbackPosterSrc && (
        <img
          src={fallbackPosterSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Title with chevron */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Image
            src={cesChevron}
            alt=""
            aria-hidden="true"
            className="h-4 w-4 sm:h-5 sm:w-5"
          />
          <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
            {area.title}
          </h3>
        </div>
        <p className="mt-1 line-clamp-2 pl-6 text-sm text-white/70 sm:pl-7">
          {area.shortDescription}
        </p>
      </div>
    </div>
  );
}
