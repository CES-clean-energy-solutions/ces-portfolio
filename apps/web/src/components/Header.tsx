"use client";

import { useState, useCallback } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { ExportPdfButton } from "./ExportPdfButton";
import type { InnovationArea } from "@ces/content/data/innovation";
import cesText from "@repo/ui/assets/ces-text-white.svg";
import cesChevron from "@repo/ui/assets/ces-chevron.svg";

interface HeaderProps {
  innovations: InnovationArea[];
}

export default function Header({ innovations }: HeaderProps) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 64) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const scrollToSection = useCallback((hash: string) => {
    closeMenu();
    // Small delay to let menu close animation start before scrolling
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [closeMenu]);

  const handleServiceClick = useCallback((serviceId: string) => {
    closeMenu();
    // Scroll to services section, then set hash to trigger modal via useModalHistory
    setTimeout(() => {
      const servicesEl = document.querySelector("#services");
      if (servicesEl) {
        servicesEl.scrollIntoView({ behavior: "smooth" });
      }
      // Set hash after a brief delay to let scroll complete
      setTimeout(() => {
        window.location.hash = `#${serviceId}`;
      }, 400);
    }, 100);
  }, [closeMenu]);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 h-[var(--header-h)] border-b border-border/50 bg-brand-black/80 backdrop-blur-md"
      >
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" aria-label="CES Clean Energy Solutions — home" className="relative block" style={{ height: 28, aspectRatio: "275.52 / 219.84" }}>
            <Image src={cesText} alt="" fill className="object-contain" priority />
            <Image src={cesChevron} alt="" fill className="object-contain" />
          </a>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="relative z-[60] flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </motion.header>

      {/* Slide-in menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[55] bg-black/60"
              onClick={closeMenu}
              aria-hidden
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-[56] flex h-full w-full max-w-sm flex-col overflow-y-auto bg-brand-gold"
              data-lenis-prevent
            >
              {/* Spacer for header height */}
              <div className="h-[var(--header-h)] shrink-0" />

              <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
                {/* Services */}
                <div className="mb-2">
                  <button
                    onClick={() => scrollToSection("#services")}
                    className="min-h-11 text-left text-xl font-bold text-brand-black transition-opacity hover:opacity-70"
                  >
                    Services
                  </button>

                  {/* Indented service list */}
                  <ul className="mt-1 space-y-0.5 pl-4">
                    {innovations.map((innovation) => (
                      <li key={innovation.id}>
                        <button
                          onClick={() => handleServiceClick(innovation.id)}
                          className="min-h-11 w-full py-1.5 text-left text-sm font-medium text-brand-black/80 transition-opacity hover:opacity-70"
                        >
                          {innovation.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact us — scrolls to #contact section */}
                <button
                  onClick={() => scrollToSection("#contact")}
                  className="min-h-11 text-left text-xl font-bold text-brand-black transition-opacity hover:opacity-70"
                >
                  Contact us
                </button>

                {/* Separator */}
                <div className="my-4 border-t border-brand-black/20" />

                {/* Print to PDF */}
                <ExportPdfButton
                  innovations={innovations}
                  className="inline-flex min-h-11 items-center gap-2 text-left text-lg font-semibold text-brand-black/80 transition-opacity hover:opacity-70"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
