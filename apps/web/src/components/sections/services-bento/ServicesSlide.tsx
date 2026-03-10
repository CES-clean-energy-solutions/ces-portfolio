"use client";

import Image from "next/image";
import { ChevronNoPad } from "@/components/icons/ChevronIcon";
import { ServicesGallery } from "./ServicesGallery";
import type {
  InnovationArea,
  InnovationSubItem,
  InnovationLink,
} from "@ces/content/data/innovation";

interface ServicesSlideProps {
  area: InnovationArea;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Static image background — replaces video for performance
// ---------------------------------------------------------------------------

interface ImageBackgroundProps {
  imageSrc: string;
  alt?: string;
}

function ImageBackground({ imageSrc, alt = "" }: ImageBackgroundProps) {
  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="100vw"
      className="object-cover"
      priority={false}
      quality={85}
    />
  );
}

// ---------------------------------------------------------------------------
// Slide
// ---------------------------------------------------------------------------

export function ServicesSlide({ area, isActive }: ServicesSlideProps) {
  const visibleImages = area.images.filter((img) => img.src && !img.background);
  // Prefer dedicated background image; fall back to first non-confidential gallery image
  const backgroundImage =
    area.images.find((img) => img.background)?.src ??
    area.images.find((img) => img.src && !img.confidential)?.src ??
    `/images/services/placeholder-${area.id}.jpg`;

  return (
    <div className="relative flex min-h-screen items-start py-20 lg:absolute lg:inset-0 lg:items-center lg:py-0">
      {/* Static image background */}
      <ImageBackground imageSrc={backgroundImage} />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Compound heading: "CES Information [chevron] Title"
            Font size lives on h2 so h-[1em] on the SVG tracks it exactly. */}
        <h2 className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          <span>CES Services</span>
          <ChevronNoPad className="h-[3.15rem] w-[1.5rem] sm:h-[4.2rem] sm:w-[2rem] lg:h-[5.25rem] lg:w-[2.5rem] flex-shrink-0" />
          <span>{area.title}</span>
        </h2>

        {/* Two-column content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left column: description + sub-items + stats + links */}
          <div className="flex flex-col gap-6">
            <p className="leading-relaxed text-white/90">
              {area.longDescription}
            </p>

            {/* Sub-items */}
            {area.subItems.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-gold">
                  Capabilities
                </h3>
                <ul className="space-y-2">
                  {area.subItems.map((item: InnovationSubItem) => (
                    <li
                      key={item.slug}
                      className="flex items-start gap-2 text-sm text-white"
                    >
                      <span className="mt-1 text-brand-gold">→</span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div>
              <div className="text-3xl font-bold text-brand-gold">
                {area.stats.metric}
              </div>
              <div className="mt-1 text-sm text-white">
                {area.stats.metricLabel}
              </div>
              <div className="mt-1 text-xs text-white/60">
                {area.stats.secondary}
              </div>
            </div>

            {/* Links */}
            {area.links && area.links.length > 0 && (
              <div className="flex flex-col gap-3">
                {area.links.map((link: InnovationLink, idx: number) =>
                  link.image ? (
                    // Card thumbnail variant — image preview on the left
                    <a
                      key={idx}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group flex items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-brand-gold/40 hover:bg-white/10"
                    >
                      <div className="relative h-[60px] w-[106px] flex-shrink-0 overflow-hidden">
                        <Image
                          src={link.image}
                          alt={link.imageAlt ?? link.label}
                          fill
                          className="object-cover"
                          sizes="106px"
                        />
                      </div>
                      <span className="flex flex-1 items-center gap-2 pr-4 text-sm font-medium text-white transition-colors group-hover:text-brand-gold">
                        {link.label}
                        <svg
                          className="h-4 w-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </span>
                    </a>
                  ) : (
                    // Plain text link variant
                    <a
                      key={idx}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        link.external
                          ? "text-brand-gold hover:text-brand-gold/80"
                          : "text-white hover:text-brand-gold"
                      }`}
                    >
                      {link.label}
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            link.external
                              ? "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              : "M9 5l7 7-7 7"
                          }
                        />
                      </svg>
                    </a>
                  )
                )}
              </div>
            )}
          </div>

          {/* Right column: gallery (desktop) */}
          {visibleImages.length > 0 && (
            <div className="hidden items-center justify-center lg:flex">
              <div className="w-full max-w-md">
                <ServicesGallery images={visibleImages} isActive={isActive} />
              </div>
            </div>
          )}

          {/* Mobile: single hero image below text */}
          {visibleImages.length > 0 && (
            <div className="relative aspect-video overflow-hidden rounded-lg lg:hidden">
              {visibleImages[0].animated ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={visibleImages[0].src}
                  alt={visibleImages[0].alt}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={visibleImages[0].src}
                  alt={visibleImages[0].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
