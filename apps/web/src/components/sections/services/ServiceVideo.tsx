"use client";
import { useRef, useEffect, useState, useCallback } from "react";

interface ServiceVideoProps {
  video: {
    webm: string;
    mp4: string;
    mp4Mobile: string;
    poster: string;
  };
  isActive: boolean;
}

/** Seconds to fade in at start and fade out before end */
const FADE_DURATION = 1.5;

export function ServiceVideo({ video, isActive }: ServiceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [opacity, setOpacity] = useState(0);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Fade based on current playback position
  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;

    const t = el.currentTime;
    const dur = el.duration;

    if (t < FADE_DURATION) {
      // Fade in
      setOpacity(t / FADE_DURATION);
    } else if (t > dur - FADE_DURATION) {
      // Fade out
      setOpacity((dur - t) / FADE_DURATION);
    } else {
      setOpacity(1);
    }
  }, []);

  // Loop with crossfade: when video ends, reset and replay
  const handleEnded = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }, []);

  // Play/pause lifecycle
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

  // Respect reduced motion - show poster only
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return (
      <img
        src={video.poster}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover transition-none"
      style={{ opacity }}
      muted
      playsInline
      preload="none"
      poster={video.poster}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      // Slow playback to 50% speed for cinematic effect
      onLoadedMetadata={() => {
        if (videoRef.current) {
          videoRef.current.playbackRate = 0.5;
        }
      }}
    >
      {isMobile ? (
        <source src={video.mp4Mobile} type="video/mp4" />
      ) : (
        <>
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </>
      )}
    </video>
  );
}
