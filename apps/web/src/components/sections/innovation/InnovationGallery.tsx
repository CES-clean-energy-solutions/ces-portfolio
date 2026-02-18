"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import type { InnovationImage } from "@ces/content/data/innovation";

const AUTO_ADVANCE_MS = 8_000;

interface InnovationGalleryProps {
  images: InnovationImage[];
  isActive: boolean;
}

/**
 * Hero + thumbnail strip gallery for innovation slides.
 *
 * - Single hero image with cross-fade transitions
 * - Always-visible caption below hero
 * - Thumbnail row with opacity-based active state + gold progress bar
 * - Auto-advance every 8 s (resets on interaction, pauses when slide inactive)
 * - Lightbox on hero click (Radix Dialog)
 */
export function InnovationGallery({ images, isActive }: InnovationGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const hasMultiple = images.length > 1;

  // Reset to first image when the slide becomes active
  useEffect(() => {
    if (isActive) setActiveIndex(0);
  }, [isActive]);

  // -----------------------------------------------------------------------
  // Auto-advance timer — only runs when slide is active and > 1 image
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!isActive || !hasMultiple) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [isActive, hasMultiple, activeIndex, images.length]);

  // -----------------------------------------------------------------------
  // Progress bar — CSS transition reset trick
  // -----------------------------------------------------------------------
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar || !isActive || !hasMultiple) return;

    // Instantly reset to 0
    bar.style.transition = "none";
    bar.style.width = "0%";

    // Force reflow, then animate to 100%
    void bar.offsetWidth;
    bar.style.transition = `width ${AUTO_ADVANCE_MS}ms linear`;
    bar.style.width = "100%";
  }, [activeIndex, isActive, hasMultiple]);

  const handleThumbnailClick = useCallback((idx: number) => {
    setActiveIndex(idx);
    // activeIndex change resets the timer via the useEffect dependency
  }, []);

  const activeImage = images[activeIndex];
  if (!activeImage) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Hero image — click to open lightbox */}
      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-black/40"
            title="Click to enlarge"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {activeImage.animated ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 450px"
                    priority={activeIndex === 0}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </Dialog.Trigger>

        {/* Lightbox */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6">
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-4 top-4 flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>

            <div className="relative aspect-video w-full max-w-4xl">
              {activeImage.animated ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              )}
            </div>

            {activeImage.caption && (
              <p className="mt-4 max-w-2xl text-center text-sm leading-relaxed text-white/80">
                {activeImage.caption}
              </p>
            )}

            <Dialog.Description className="sr-only">
              {activeImage.alt}
            </Dialog.Description>
            <Dialog.Title className="sr-only">Image detail</Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Caption strip */}
      {activeImage.caption ? (
        <p className="min-h-[2.5rem] px-1 text-xs leading-snug text-white/70">
          {activeImage.caption}
        </p>
      ) : (
        hasMultiple && <div className="min-h-[2.5rem]" />
      )}

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="flex flex-row gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleThumbnailClick(idx)}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={idx === activeIndex}
              className={`relative flex-shrink-0 overflow-hidden rounded transition-opacity ${
                idx === activeIndex ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
            >
              {img.animated ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.src}
                  alt=""
                  className="h-14 w-20 object-cover"
                />
              ) : (
                <Image
                  src={img.src}
                  alt=""
                  width={80}
                  height={56}
                  className="h-14 w-20 object-cover"
                  sizes="80px"
                />
              )}

              {/* Progress bar — only under active thumbnail */}
              {idx === activeIndex && (
                <div
                  ref={progressRef}
                  className="absolute bottom-0 left-0 h-0.5 bg-brand-gold"
                  style={{ width: "0%" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
