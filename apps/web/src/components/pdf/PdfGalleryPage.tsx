import type { InnovationArea } from "@ces/content/data/innovation";

export interface GalleryImage {
  dataUri: string;
  caption?: string;
  alt: string;
}

interface PdfGalleryPageProps {
  section: InnovationArea;
  images: GalleryImage[]; // up to 4 — remaining slots render blank
}

function CesLogo() {
  return (
    <svg
      viewBox="0 0 275.52 219.84"
      style={{ width: "28px", height: "22px", flexShrink: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M137.76 0 L275.52 109.92 L137.76 219.84 L0 109.92 Z" fill="#D4A843" />
      <path d="M137.76 38 L237.52 109.92 L137.76 181.84 L38 109.92 Z" fill="#0a0a0a" />
    </svg>
  );
}

// Page: 1122 × 794px
// Padding: 50px sides, 40px top/bottom → content: 1022 × 714px
// Header: 56px + 14px gap
// Image grid: 714 - 70 = 644px tall, split into 2 rows with 14px gap
// Row height: (644 - 14) / 2 = 315px; caption: 22px; image div: 293px
// Col width: (1022 - 14) / 2 = 504px

const IMG_W = 504;
const IMG_H = 293;
const CAPTION_H = 22;
const GAP = 14;

export function PdfGalleryPage({ section, images }: PdfGalleryPageProps) {
  // Always render exactly 4 slots
  const slots: (GalleryImage | null)[] = [
    images[0] ?? null,
    images[1] ?? null,
    images[2] ?? null,
    images[3] ?? null,
  ];

  return (
    <div
      style={{
        width: "1122px",
        height: "794px",
        backgroundColor: "#0a0a0a",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#ffffff",
        padding: "40px 50px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: `${GAP}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(212,168,67,0.35)",
          paddingBottom: "12px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <CesLogo />
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#D4A843" }}>
            {section.title}
          </span>
        </div>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Project Gallery
        </span>
      </div>

      {/* 2×2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${IMG_W}px ${IMG_W}px`,
          gridTemplateRows: `${IMG_H + CAPTION_H + 6}px ${IMG_H + CAPTION_H + 6}px`,
          gap: `${GAP}px`,
        }}
      >
        {slots.map((img, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Image or empty placeholder */}
            <div
              style={{
                width: `${IMG_W}px`,
                height: `${IMG_H}px`,
                borderRadius: "3px",
                backgroundColor: "#1a1a1a",
                border: img ? "none" : "1px solid rgba(255,255,255,0.06)",
                backgroundImage: img ? `url(${img.dataUri})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Caption */}
            <p
              style={{
                fontSize: "9.5px",
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.45)",
                margin: 0,
                height: `${CAPTION_H}px`,
                overflow: "hidden",
              }}
            >
              {img?.caption ?? img?.alt ?? ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
