"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// --- Tuning constants ---
const RIPPLE_DURATION = 1400; // ms — total lifespan of one ripple
const RIPPLE_MAX_RADIUS = 120; // px — fully expanded outer ring
const RIPPLE_SPAWN_INTERVAL = 80; // ms — min time between new ripples
const RING_COUNT = 3; // concentric rings per ripple
const MAX_ACTIVE_RIPPLES = 15; // hard cap on simultaneous ripples
const MAX_OPACITY = 0.35; // peak opacity for any ring
const FADE_IN_FRACTION = 0.2; // first 20% of life = fade in

// Ring radii as fraction of current max radius (inner → outer)
const RING_RADIUS_FRACTIONS = [0.4, 0.7, 1.0];

// Ring line widths (inner → outer, thinnest on outer gold ring)
const RING_LINE_WIDTHS = [1.8, 1.4, 0.8];

// Ring colors: ice-blue inner, cyan middle, CES gold outer
const RING_COLORS = [
  "rgb(180, 235, 255)", // pale ice blue — crystal water center
  "rgb(140, 215, 245)", // sky cyan — water body
  "rgb(212, 168, 67)",  // CES gold #D4A843 — subtle brand tie-in
];

interface Ripple {
  x: number;
  y: number;
  startTime: number;
}

interface CursorRippleProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Crystal-water cursor ripple effect rendered on a full-hero canvas overlay.
 * Desktop-only (≥1024px), respects prefers-reduced-motion.
 * Uses GSAP ticker for the render loop — no standalone rAF.
 */
export default function CursorRipple({ containerRef }: CursorRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastSpawnRef = useRef(0);
  const tickerCallbackRef = useRef<((time: number) => void) | null>(null);

  // Cubic ease-out: fast start, gentle deceleration — like real water
  const easeOutCubic = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Gate: desktop only
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    if (!desktopQuery.matches) return;

    // Gate: respect reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Canvas sizing (retina-aware) ---
    const dpr = window.devicePixelRatio || 1;

    function sizeCanvas() {
      if (!container || !canvas || !ctx) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    sizeCanvas();

    const resizeObserver = new ResizeObserver(sizeCanvas);
    resizeObserver.observe(container);

    // --- Mouse move handler (spawns ripples) ---
    function onMouseMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawnRef.current < RIPPLE_SPAWN_INTERVAL) return;
      lastSpawnRef.current = now;

      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripples = ripplesRef.current;

      // Enforce cap — drop oldest if full
      if (ripples.length >= MAX_ACTIVE_RIPPLES) {
        ripples.shift();
      }

      ripples.push({ x, y, startTime: now });
    }

    container.addEventListener("mousemove", onMouseMove, { passive: true });

    // --- Render loop via GSAP ticker ---
    function renderFrame() {
      if (!ctx || !canvas) return;

      const now = performance.now();
      const ripples = ripplesRef.current;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      // Remove expired ripples (iterate backwards to safely splice)
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].startTime > RIPPLE_DURATION) {
          ripples.splice(i, 1);
        }
      }

      // Draw each active ripple
      for (let i = 0; i < ripples.length; i++) {
        const ripple = ripples[i];
        const elapsed = now - ripple.startTime;
        const progress = Math.min(elapsed / RIPPLE_DURATION, 1);
        const easedProgress = easeOutCubic(progress);
        const currentMaxRadius = easedProgress * RIPPLE_MAX_RADIUS;

        // Opacity: fade in during first 20%, fade out over remaining 80%
        let opacity: number;
        if (progress < FADE_IN_FRACTION) {
          opacity = (progress / FADE_IN_FRACTION) * MAX_OPACITY;
        } else {
          const fadeProgress =
            (progress - FADE_IN_FRACTION) / (1 - FADE_IN_FRACTION);
          opacity = MAX_OPACITY * (1 - fadeProgress);
        }

        // Draw concentric rings (inner → outer)
        for (let ring = 0; ring < RING_COUNT; ring++) {
          const radius = currentMaxRadius * RING_RADIUS_FRACTIONS[ring];
          if (radius < 1) continue; // skip sub-pixel rings

          // Outer ring slightly more transparent for subtlety
          const ringOpacity = ring === RING_COUNT - 1 ? opacity * 0.6 : opacity;

          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = RING_COLORS[ring];
          ctx.lineWidth = RING_LINE_WIDTHS[ring];
          ctx.globalAlpha = ringOpacity;
          ctx.stroke();
        }
      }

      // Reset alpha so it doesn't leak into next frame's clearRect
      ctx.globalAlpha = 1;
    }

    // Store ref so we can remove it on cleanup
    tickerCallbackRef.current = renderFrame;
    gsap.ticker.add(renderFrame);

    // --- Cleanup ---
    return () => {
      if (tickerCallbackRef.current) {
        gsap.ticker.remove(tickerCallbackRef.current);
        tickerCallbackRef.current = null;
      }
      container.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      ripplesRef.current = [];
    };
  }, [containerRef, easeOutCubic]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
