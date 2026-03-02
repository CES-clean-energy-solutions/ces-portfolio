"use client";

import { useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import type { InnovationArea } from "@ces/content/data/innovation";

interface InnovationDetailModalProps {
  area: InnovationArea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ModalVideoHero({ area }: { area: InnovationArea }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});

    return () => {
      video.pause();
    };
  }, []);

  const hasVideo = !!area.video.webm || !!area.video.mp4;

  return (
    <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-72">
      {/* Video background */}
      {hasVideo && (
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          {area.video.webm && (
            <source src={area.video.webm} type="video/webm" />
          )}
          {area.video.mp4 && (
            <source src={area.video.mp4} type="video/mp4" />
          )}
        </video>
      )}

      {/* Dark gradient — stronger at bottom where text sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Gradient fade at bottom — blends into page bg */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950 to-transparent" />

      {/* Title + subtitle overlaid — anchored to bottom of video */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8 sm:px-8 sm:pb-10 lg:px-10 lg:pb-10">
        <Dialog.Title className="pr-12 text-2xl font-bold text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
          {area.title}
        </Dialog.Title>
        <p className="mt-1 text-sm text-brand-gold drop-shadow-md sm:text-base">
          {area.shortDescription}
        </p>
      </div>
    </div>
  );
}

export function InnovationDetailModal({
  area,
  open,
  onOpenChange,
}: InnovationDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!area) return null;

  const validImages = area.images.filter((img) => img.src);
  const hasStats =
    area.stats.metric !== "TBD" && area.stats.metricLabel !== "TBD";
  const hasLinks = area.links && area.links.length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop — hidden on mobile (modal is full-screen) */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/80 max-md:bg-black"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content
              asChild
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed inset-0 z-50"
              >
                {/* Scroll container — this is the element that scrolls */}
                <div
                  className="h-full overflow-y-auto overscroll-contain md:flex md:items-start md:justify-center md:px-6 md:py-10 lg:px-8 lg:py-12"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) onOpenChange(false);
                  }}
                >
                  {/*
                    Mobile: full-screen sheet (no radius, no margin, edge-to-edge)
                    Desktop: centered card with rounded corners
                  */}
                  <div className="relative min-h-full w-full bg-neutral-950 md:min-h-0 md:max-w-4xl md:rounded-2xl md:border md:border-white/10 md:shadow-2xl lg:max-w-6xl">
                    {/* Close button */}
                    <Dialog.Close asChild>
                      <button
                        className="absolute right-3 top-3 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:right-4 sm:top-4"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>

                    {/* Video hero with overlaid title */}
                    <div className="overflow-hidden md:rounded-t-2xl">
                      <ModalVideoHero area={area} />
                    </div>

                    {/* Content body */}
                    <div className="px-5 pb-8 pt-4 sm:px-8 sm:pt-5 lg:px-10 lg:pb-10 lg:pt-6">
                      {/* Long description */}
                      <Dialog.Description className="text-base leading-relaxed text-white/80 sm:text-lg">
                        {area.longDescription}
                      </Dialog.Description>

                      {/* Capabilities / Sub-items */}
                      {area.subItems.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
                            Capabilities
                          </h3>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {area.subItems.map((item) => (
                              <li
                                key={item.slug}
                                className="flex items-center gap-2 text-sm text-white/70"
                              >
                                <ArrowRight className="h-3 w-3 shrink-0 text-brand-gold" />
                                {item.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Stats */}
                      {hasStats && (
                        <div className="mt-8 rounded-xl bg-white/5 p-5">
                          <div className="text-3xl font-bold text-brand-gold sm:text-4xl">
                            {area.stats.metric}
                          </div>
                          <div className="mt-1 text-sm font-medium text-white">
                            {area.stats.metricLabel}
                          </div>
                          {area.stats.secondary && (
                            <div className="mt-1 text-xs text-white/50">
                              {area.stats.secondary}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Links */}
                      {hasLinks && (
                        <div className="mt-8">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
                            Resources
                          </h3>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {area.links!.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                target={link.external ? "_blank" : undefined}
                                rel={
                                  link.external
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                className="group/link flex items-center gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:border-brand-gold/40 hover:bg-white/5"
                              >
                                {link.image && (
                                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded">
                                    <Image
                                      src={link.image}
                                      alt={link.imageAlt ?? link.label}
                                      fill
                                      sizes="64px"
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <span className="text-sm text-white group-hover/link:text-brand-gold">
                                  {link.label}
                                </span>
                                {link.external && (
                                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-white/40" />
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image gallery */}
                      {validImages.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
                            Gallery
                          </h3>
                          <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            {validImages.map((img, i) => (
                              <figure key={i} className="overflow-hidden rounded-lg">
                                {img.animated ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="eager"
                                    className="w-full rounded-lg"
                                  />
                                ) : (
                                  <div className="relative aspect-video">
                                    <Image
                                      src={img.src}
                                      alt={img.alt}
                                      fill
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
                                      className="rounded-lg object-cover"
                                    />
                                  </div>
                                )}
                                {img.caption && (
                                  <figcaption className="mt-2 text-xs text-white/50">
                                    {img.caption}
                                  </figcaption>
                                )}
                              </figure>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
