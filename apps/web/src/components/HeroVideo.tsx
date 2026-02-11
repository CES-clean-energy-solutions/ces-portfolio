"use client";

import { useEffect, useRef, useState } from "react";

interface VideoSource {
  webm: string;
  mp4: string;
  poster: string;
}

interface HeroVideoProps {
  videos?: VideoSource[];
  playbackRate?: number; // 1.0 = normal speed, 0.5 = half speed, 0.75 = 75% speed
}

const DEFAULT_VIDEOS: VideoSource[] = [
  {
    webm: "/video/hero-bg.webm",
    mp4: "/video/hero-bg.mp4",
    poster: "/video/hero-poster.jpg",
  },
  {
    webm: "/video/hero-bg-future-construction.webm",
    mp4: "/video/hero-bg-future-construction.mp4",
    poster: "/video/hero-bg-future-construction.jpg",
  },
];

export default function HeroVideo({
  videos = DEFAULT_VIDEOS,
  playbackRate = 0.5, // 50% speed for slower, more cinematic feel
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const currentVideo = videos[currentVideoIndex];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Set playback rate
  useEffect(() => {
    if (prefersReducedMotion || !videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate, prefersReducedMotion]);

  // Handle video ended - switch to next video in sequence
  useEffect(() => {
    if (prefersReducedMotion || !videoRef.current) return;

    const video = videoRef.current;

    const handleEnded = () => {
      // Move to next video (or loop back to first)
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [prefersReducedMotion, videos.length]);

  // Cross-fade effect at video transitions
  useEffect(() => {
    if (prefersReducedMotion || !videoRef.current) return;

    const video = videoRef.current;
    const fadeDuration = 1.2; // longer fade for smoother transitions

    const handleTimeUpdate = () => {
      if (!video.duration) return;

      const timeRemaining = video.duration - video.currentTime;

      if (timeRemaining <= fadeDuration && timeRemaining > 0) {
        // Fade out as we approach the end
        const progress = 1 - timeRemaining / fadeDuration;
        setVideoOpacity(1 - progress);
      } else if (video.currentTime < fadeDuration) {
        // Fade in at the start
        const progress = video.currentTime / fadeDuration;
        setVideoOpacity(progress);
      } else {
        setVideoOpacity(1);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [prefersReducedMotion]);

  // Reload video when currentVideoIndex changes
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Reset opacity to 0 so new video fades in smoothly
    setVideoOpacity(0);

    // Load and play the new video
    video.load();
    video.playbackRate = playbackRate;
    video.play().catch(() => {
      // Autoplay might be blocked - this is fine for background videos
    });
  }, [currentVideoIndex, playbackRate]);

  // If user prefers reduced motion, show static poster of first video
  if (prefersReducedMotion) {
    return (
      <img
        src={videos[0].poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      preload="auto"
      poster={currentVideo.poster}
      className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-400"
      style={{ zIndex: 0, opacity: videoOpacity }}
      aria-hidden="true"
    >
      <source src={currentVideo.webm} type="video/webm" />
      <source src={currentVideo.mp4} type="video/mp4" />
    </video>
  );
}
