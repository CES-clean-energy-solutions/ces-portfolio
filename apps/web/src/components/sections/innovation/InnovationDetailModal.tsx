"use client";

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

export function InnovationDetailModal({
  area,
  open,
  onOpenChange,
}: InnovationDetailModalProps) {
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
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/80"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content
              asChild
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
                onClick={(e) => {
                  if (e.target === e.currentTarget) onOpenChange(false);
                }}
              >
                {/* Scroll container */}
                <div
                  className="flex min-h-full items-start justify-center px-4 py-8 sm:py-12"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) onOpenChange(false);
                  }}
                >
                  <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl sm:p-8 lg:max-w-6xl lg:p-10">
                    {/* Close button */}
                    <Dialog.Close asChild>
                      <button
                        className="absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>

                    {/* Title */}
                    <Dialog.Title className="pr-12 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                      {area.title}
                    </Dialog.Title>

                    {/* Short description as subtitle */}
                    <p className="mt-2 text-sm text-brand-gold sm:text-base">
                      {area.shortDescription}
                    </p>

                    {/* Long description */}
                    <Dialog.Description className="mt-6 text-base leading-relaxed text-white/80 sm:text-lg">
                      {area.longDescription}
                    </Dialog.Description>

                    {/* Capabilities / Sub-items */}
                    {area.subItems.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
                          Capabilities
                        </h3>
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
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
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
