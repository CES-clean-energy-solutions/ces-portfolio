"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ExternalLink, ArrowRight, Lock, LockOpen } from "lucide-react";
import type { InnovationArea } from "@ces/content/data/innovation";
import { ImageLightbox } from "./ImageLightbox";
import { useSecretModeContext } from "@/contexts/SecretModeContext";

interface ServicesDetailModalProps {
  area: InnovationArea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ModalImageHero({ area }: { area: InnovationArea }) {
  // images[0] is always the title/hero image by convention
  const imageSrc =
    area.images[0]?.src ??
    `/images/services/placeholder-${area.id}.jpg`;

  return (
    <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-72">
      {/* Static image background */}
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />

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

export function ServicesDetailModal({
  area,
  open,
  onOpenChange,
}: ServicesDetailModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { isSecret, toggle } = useSecretModeContext();

  if (!area) return null;

  // images[0] is the title/hero image — gallery shows images[1+] only
  const validImages = area.images
    .slice(1)
    .filter((img) => img.src && (isSecret || img.confidential !== true));
  const hasStats =
    area.stats.metric !== "TBD" && area.stats.metricLabel !== "TBD";

  // Filter links based on secret mode (FR-3: confidential links hidden by default)
  const allLinks = area.links ?? [];
  const visibleLinks = isSecret
    ? allLinks
    : allLinks.filter((link) => link.confidential !== true);
  const hasLinks = visibleLinks.length > 0;

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
                {/* Scroll container — data-lenis-prevent stops Lenis from hijacking wheel events */}
                <div
                  ref={scrollContainerRef}
                  data-lenis-prevent
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
                      <ModalImageHero area={area} />
                    </div>

                    {/* Content body — order: gallery → resources → capabilities → stats → long description */}
                    <div className="relative px-5 pb-8 pt-4 sm:px-8 sm:pt-5 lg:px-10 lg:pb-10 lg:pt-6">
                      {/* Image gallery (images[1+] — title image excluded) */}
                      {validImages.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
                            Gallery
                          </h3>
                          <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            {validImages.map((img, i) => (
                              <figure
                                key={i}
                                className="group/gallery cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-80"
                                onClick={() => setLightboxIndex(i)}
                              >
                                {img.animated ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="eager"
                                    className="w-full rounded-lg transition-transform group-hover/gallery:scale-105"
                                  />
                                ) : (
                                  <div className="relative aspect-video overflow-hidden">
                                    <Image
                                      src={img.src}
                                      alt={img.alt}
                                      fill
                                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 550px"
                                      className="rounded-lg object-cover transition-transform group-hover/gallery:scale-105"
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

                      {/* Links / Resources */}
                      {hasLinks && (
                        <div className="mt-8">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
                            Resources
                          </h3>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <AnimatePresence initial={false}>
                              {visibleLinks.map((link) => (
                                <motion.a
                                  key={link.href}
                                  href={link.href}
                                  target={link.external ? "_blank" : undefined}
                                  rel={
                                    link.external
                                      ? "noopener noreferrer"
                                      : undefined
                                  }
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.2 }}
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
                                  <span className="flex items-center gap-1 text-sm text-white group-hover/link:text-brand-gold">
                                    {link.label}
                                    {/* Lock badge on confidential links when secret mode is active (FR-4) */}
                                    {isSecret && link.confidential && (
                                      <Lock className="w-3 h-3 text-brand-gold/60 ml-1 shrink-0" />
                                    )}
                                  </span>
                                  {link.external && (
                                    <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-white/40" />
                                  )}
                                </motion.a>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

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

                      {/* Long description — at the end so visuals land first */}
                      <Dialog.Description className="mt-8 text-base leading-relaxed text-white/80 sm:text-lg">
                        {area.longDescription}
                      </Dialog.Description>

                      {/* Hidden secret mode toggle — bottom-right of content body (FR-5, FR-6, FR-10) */}
                      <button
                        onClick={toggle}
                        aria-label="Toggle reference visibility"
                        aria-pressed={isSecret}
                        className={`absolute bottom-4 right-4 flex min-h-11 min-w-11 items-center justify-center rounded-full transition-all duration-300 ${
                          isSecret
                            ? "opacity-100 text-brand-gold"
                            : "opacity-20 text-white/40"
                        }`}
                      >
                        {isSecret ? (
                          <LockOpen className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <ImageLightbox
        images={validImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </Dialog.Root>
  );
}
