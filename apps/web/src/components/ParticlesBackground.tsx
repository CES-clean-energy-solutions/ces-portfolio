"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

/**
 * Ambient green particle animation for the hero section.
 * Particles spiral outward from center using move.spin.
 * Desktop-only — loaded via next/dynamic with ssr: false.
 */
export default function ParticlesBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
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

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },
      detectRetina: true,
      fpsLimit: 60,

      particles: {
        number: {
          value: 150,
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
          speed: { min: 0.2, max: 0.6 },
          outModes: { default: "bounce" },
          spin: {
            enable: true,
            acceleration: 1,
          },
        },
        links: {
          enable: true,
          distance: 120,
          color: "#D4A843",
          opacity: 0.3,
          width: 1,
          blink: true,
        },
      },

      interactivity: {
        events: {
          onHover: { enable: false },
        },
      },
    }),
    []
  );

  if (!ready) return null;

  return (
    <Particles
      id="hero-particles"
      options={options}
      className="absolute inset-0 z-0"
    />
  );
}
