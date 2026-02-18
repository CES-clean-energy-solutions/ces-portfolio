import Image from "next/image";
import type { InnovationImage } from "@ces/content/data/innovation";

interface InnovationMediaCardProps {
  image: InnovationImage;
}

/**
 * A single media card shown inside an innovation slide.
 * - Skips rendering entirely when src is empty (placeholder state).
 * - Uses plain <img> for animated GIFs (next/image does not support GIF animation).
 * - Uses next/image for static images.
 */
export function InnovationMediaCard({ image }: InnovationMediaCardProps) {
  // Empty src = placeholder state — render nothing
  if (!image.src) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm">
      {image.animated ? (
        // Plain <img> for animated GIFs — next/image strips animation
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          loading="eager"
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          width={400}
          height={280}
          className="h-full w-full object-cover"
          sizes="(max-width: 1024px) 0px, 400px"
        />
      )}
    </div>
  );
}
