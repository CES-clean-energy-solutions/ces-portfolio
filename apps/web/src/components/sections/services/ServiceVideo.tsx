"use client";
import { useRef, useEffect, useState } from "react";

interface ServiceVideoProps {
  video: {
    webm: string;
    mp4: string;
    mp4Mobile: string;
    poster: string;
  };
  isActive: boolean;
}

export function ServiceVideo({ video, isActive }: ServiceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Play/pause lifecycle
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, video will show poster
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
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

  // Video plays on all viewports - adaptive source selection
  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster={video.poster}
    >
      {isMobile ? (
        // Phone: H.264 only (universal hardware decode, better battery)
        <source src={video.mp4Mobile} type="video/mp4" />
      ) : (
        // Desktop/tablet: WebM primary, MP4 fallback
        <>
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </>
      )}
    </video>
  );
}
