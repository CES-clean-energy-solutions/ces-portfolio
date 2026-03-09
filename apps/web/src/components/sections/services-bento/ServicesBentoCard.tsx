"use client";

import { useCallback } from "react";
import Image from "next/image";
import cesChevron from "@repo/ui/assets/ces-chevron.svg";
import type { InnovationArea } from "@ces/content/data/innovation";

interface ServicesBentoCardProps {
  area: InnovationArea;
  onClick: () => void;
}

export function ServicesBentoCard({ area, onClick }: ServicesBentoCardProps) {
  // Use first image from images array, or fallback to placeholder
  const imageSrc = area.images.find((img) => img.src)?.src ?? `/images/services/placeholder-${area.id}.jpg`;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${area.title}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 outline-none ring-brand-gold focus-visible:ring-2 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.02]"
    >
      {/* Static image background */}
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        priority={false}
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Title with chevron */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Image
            src={cesChevron}
            alt=""
            aria-hidden="true"
            className="h-4 w-4 sm:h-5 sm:w-5"
          />
          <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
            {area.title}
          </h3>
        </div>
        <p className="mt-1 line-clamp-2 pl-6 text-sm text-white/70 sm:pl-7">
          {area.shortDescription}
        </p>
      </div>
    </div>
  );
}
