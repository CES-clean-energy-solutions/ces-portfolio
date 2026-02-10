"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";

// PLACEHOLDER — replace with real nav links
const NAV_LINKS = ["Services", "Projects", "About", "Contact"];

export default function Header() {
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

        {/* Nav links — hidden below lg */}
        <ul className="hidden gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="text-sm text-muted transition-colors hover:text-brand-gold"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
