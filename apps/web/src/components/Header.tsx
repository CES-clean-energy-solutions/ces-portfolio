"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { ExportPdfButton } from "./ExportPdfButton";
import type { InnovationArea } from "@ces/content/data/innovation";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

interface HeaderProps {
  innovations: InnovationArea[];
}

export default function Header({ innovations }: HeaderProps) {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Hide when scrolling down past header height, show when scrolling up
    if (latest > previous && latest > 64) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-[var(--header-h)] border-b border-border/50 bg-brand-black/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* PLACEHOLDER — replace with logo component */}
        <span className="text-lg font-bold tracking-tight text-white">
          CES<span className="text-brand-gold">.</span>
        </span>

        {/* Nav links — visible on all breakpoints */}
        <ul className="flex items-center gap-6 sm:gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-brand-gold focus-visible:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <ExportPdfButton innovations={innovations} className="text-sm font-medium text-white/80" />
          </li>
        </ul>
      </nav>
    </motion.header>
  );
}
