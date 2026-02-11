"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

/**
 * Ambient green particle animation for the hero section.
 * Particles spiral outward from center using move.spin.
 * Adaptive config: more particles/features on larger screens, optimized for mobile.
 */
export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);
  const [viewport, setViewport] = useState<"phone" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  // Detect viewport size and update particle config
  useEffect(() => {
    const updateViewport = () => {
      if (window.innerWidth >= 1024) {
        setViewport("desktop");
      } else if (window.innerWidth >= 768) {
        setViewport("tablet");
      } else {
        setViewport("phone");
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Mix of greens + CES brand gold, weighted toward brighter values
  const particleColors = [
    "#0f7a4d",
    "#14a365",
    "#14a365",
    "#1bcc7e",
    "#1bcc7e",
    "#22f598",
    "#22f598",
    "#D4A843", // CES brand gold
    "#D4A843",
    "#e6c366", // lighter gold
  ];

  const options: ISourceOptions = useMemo(() => {
    // Adaptive config based on viewport
    const config = {
      desktop: {
        particleCount: 150,
        fpsLimit: 60,
        linksEnabled: true,
        connectEnabled: true,
      },
      tablet: {
        particleCount: 80,
        fpsLimit: 60,
        linksEnabled: false, // Disable links to reduce GPU load
        connectEnabled: false,
      },
      phone: {
        particleCount: 40,
        fpsLimit: 30, // Lower FPS on mobile to save battery
        linksEnabled: false,
        connectEnabled: false,
      },
    }[viewport];

    return {
      fullScreen: { enable: false },
      background: { color: "transparent" },
      detectRetina: true,
      fpsLimit: config.fpsLimit,

      particles: {
        number: {
          value: config.particleCount,
          density: { enable: true, width: 1920, height: 1080 },
        },
        color: { value: particleColors },
        shape: { type: "circle" },
        size: {
          value: { min: 1.5, max: 5 },
        },
        opacity: {
          value: { min: 0.6, max: 1 },
        },
        move: {
          enable: true,
          direction: "none",
          speed: { min: 0.15, max: 0.4 }, // 50% slower for more calm, ambient feel
          outModes: { default: "out" },
          spin: {
            enable: true,
            acceleration: 0,
          },
        },
        links: {
          enable: config.linksEnabled,
          distance: 120,
          color: "#D4A843",
          opacity: 0.3,
          width: 1,
          blink: true,
        },
      },

      interactivity: {
        events: {
          onHover: {
            enable: config.connectEnabled || false,
            mode: "grab",
          },
        },
        modes: {
          grab: {
            distance: 150,
            links: {
              color: "#FFEA00", // Electric gold - brighter than logo gold for moonshot effect
              opacity: 0.8,      // High opacity creates "energized" moonshot effect
              width: 2,          // Thicker than particle links (1px) for more presence
            },
          },
        },
      },
    };
  }, [viewport]);

  if (!ready) return null;

  return (
    <Particles
      id="hero-particles"
      options={options}
      className="absolute inset-0 z-0"
    />
  );
}
