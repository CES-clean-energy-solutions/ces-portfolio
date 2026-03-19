import jsPDF from "jspdf";
import type { InnovationArea } from "@ces/content/data/innovation";

// ─── Page geometry (landscape A4) ───────────────────────────────────────────
const W = 297;        // mm — page width
const H = 210;        // mm — page height

const HEADER_H = 20;  // mm — service page header bar height (logo + title)
const PAD_X    = 10;  // mm — horizontal page margin
const PAD_Y    = 6;   // mm — vertical body padding (top & bottom)
const COL_GAP  = 7;   // mm — gap between left and right columns

const RIGHT_COL_W = 132;                                  // mm — image column width
const LEFT_COL_W  = W - PAD_X * 2 - COL_GAP - RIGHT_COL_W; // mm — text column width (~138)

// Right-column image sizing — two images stacked with equal height
const BODY_TOP     = HEADER_H + PAD_Y;
const BODY_H       = H - HEADER_H - PAD_Y * 2;
const IMG_GAP      = 6;                        // mm — gap between the two image blocks
const IMG_BLOCK_H  = (BODY_H - IMG_GAP) / 2;
const IMG_H        = 74;                       // mm — rendered image height (≈ 16:9 for 132mm width)
const CAPTION_OFFSET = 3;                      // mm — gap between image bottom and caption baseline

// ─── Image compression tiers ────────────────────────────────────────────────
const TITLE_IMG_MAX_W  = 1600; // px — hero image spans full page width
const COLUMN_IMG_MAX_W = 1000; // px — column images are 132mm wide
const JPEG_QUALITY     = 0.80;
const GRADIENT_STEPS   = 24;   // number of strips for gradient fade simulation

// ─── CES Brand colours ─────────────────────────────────────────────────────
const GOLD      = "#f8c802";   // CES brand gold (logo chevron)
const BLACK     = "#000000";   // PDF background
const WHITE     = "#ffffff";
const NEAR_WHITE: [number, number, number] = [235, 235, 235];
const GRAY      = "#999999";   // lighter gray for captions/footers

// ─── Logo paths (relative to public/) ───────────────────────────────────────
const LOGO_SVG_WHITE = "/content/ces-logo-full-white.svg";

// ─── Static copy ─────────────────────────────────────────────────────────────
const CONTACT = {
  name:     "Klaus Kogler, DI (FH), MSc",
  role:     "Head of Unit, LEED AP, Estidama PQP",
  phone:    "+43 664 601 692 32",
  email:    "k.kogler@ic-ces.at",
  whoWeAre: `CES clean energy solutions is a Vienna-based engineering and consulting firm, founded in 2009. We deliver integrated solutions for energy efficiency, renewable energy, sustainable buildings, and environmental engineering — from feasibility study through construction supervision and beyond.\n\nWorking with partners within the iC group of companies spanning 850+ professionals across multiple disciplines, our clients get deep specialist knowledge in energy and environment backed by the full breadth of a multidisciplinary engineering organisation. One team, one point of responsibility.\n\nWe work where the transition is happening. Our projects span Austria, Germany, Ukraine, the Western Balkans, Central Asia, and Saudi Arabia, with further experience in the Caribbean and West Africa. We partner with international financial institutions like the EBRD and NEFCO, the European Union, governments at every level, and private industry.\n\nOur competences cover five interconnected areas: Green Economy, Resource Efficiency & Circular Economy, Environmental & Social Compatibility, Sustainable Buildings, and Sustainable Energy & Plants.`,
  howWeWork: `Complex problems demand integrative thinking. We involve all stakeholders early, map every boundary condition, and work through alternatives systematically before committing to a path. Our approach follows what we call the better way — three principles that guide our delivery.\n\nWe solve systemically: identifying root causes and structural problems rather than applying short-term fixes. We stay ahead: actively tracking and adopting innovations from research, regulation, and market developments. And we deliver what works: feasible processes, methods, and tools that ensure transparency and measurable gain.\n\nOur services span the full project lifecycle — from R&D and project preparation through environmental and social assessment, detailed design, construction supervision, investment programme management, and sustainable urban certification.\n\nWhether supervising large-scale heat pumps in Vienna, managing EU-funded infrastructure reconstruction in Ukraine, or certifying buildings to LEED standards in Tbilisi, the method stays consistent: rigorous engineering, honest assessment, integrated delivery.`,
};

const LEGAL = {
  companyData: [
    "CES Clean Energy Solutions GmbH",
    "Commercial Register: FN 12345x",
    "UID: ATU12345678",
    "Vienna Commercial Court",
    "",
    "Managing Director: [Name]",
    "Registered Office: Vienna, Austria",
    "",
    "Contact:",
    "Email: office@ic-ces.engineering",
    "Phone: +43 (0) 1234 5678",
    "Web: portfolio.ic-ces.engineering",
  ],
  impressum: [
    "Content Responsibility:",
    "CES Clean Energy Solutions GmbH",
    "",
    "Disclaimer:",
    "All information provided is for general informational purposes only.",
    "We make no warranties about completeness, reliability, or suitability.",
    "",
    "Copyright:",
    "© 2026 CES Clean Energy Solutions GmbH. All rights reserved.",
    "",
    "Data Protection:",
    "We process personal data in accordance with GDPR.",
    "See our privacy policy at portfolio.ic-ces.engineering",
  ],
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface PdfImage {
  dataUri: string;
  width: number;   // px after compression
  height: number;  // px after compression
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Downscale and JPEG-compress an image via off-screen canvas.
 * Returns the data URI plus the output pixel dimensions.
 */
function compressImage(
  img: HTMLImageElement,
  maxWidth: number,
  quality: number
): PdfImage {
  let w = img.naturalWidth;
  let h = img.naturalHeight;

  if (w > maxWidth) {
    h = Math.round(h * (maxWidth / w));
    w = maxWidth;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);

  return {
    dataUri: canvas.toDataURL("image/jpeg", quality),
    width: w,
    height: h,
  };
}

/**
 * Fetch an image URL, downscale it, and return as a compressed JPEG data URI
 * plus pixel dimensions for aspect-ratio calculations.
 */
async function loadImageAsDataUri(
  src: string,
  maxWidth: number = COLUMN_IMG_MAX_W,
  quality: number = JPEG_QUALITY
): Promise<PdfImage | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const originalKB = (blob.size / 1024).toFixed(0);

    const blobUrl = URL.createObjectURL(blob);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = blobUrl;
    });

    const result = compressImage(img, maxWidth, quality);
    URL.revokeObjectURL(blobUrl);

    const compressedKB = (result.dataUri.length * 0.75 / 1024).toFixed(0);
    console.log(`PDF: ${src} — ${originalKB} KB → ~${compressedKB} KB (${img.naturalWidth}×${img.naturalHeight} → ${result.width}×${result.height})`);

    return result;
  } catch (err) {
    console.warn(`PDF: could not load image ${src}:`, err);
    return null;
  }
}

/**
 * Rasterize an SVG file to a high-resolution PNG data URI via canvas.
 * renderWidth controls the output resolution (higher = crisper in PDF).
 */
async function loadSvgAsDataUri(
  svgSrc: string,
  renderWidth: number = 800
): Promise<PdfImage | null> {
  try {
    const res = await fetch(svgSrc);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svgText = await res.text();

    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const renderHeight = Math.round(renderWidth / aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, renderWidth, renderHeight);
    URL.revokeObjectURL(url);

    const dataUri = canvas.toDataURL("image/png");
    console.log(`PDF: SVG ${svgSrc} → ${renderWidth}×${renderHeight}px PNG`);

    return { dataUri, width: renderWidth, height: renderHeight };
  } catch (err) {
    console.warn(`PDF: could not load SVG ${svgSrc}:`, err);
    return null;
  }
}

/**
 * Render wrapped text, respecting a max-width and optional line cap.
 * Returns the Y position immediately after the last rendered line.
 */
function addText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineSpacing: number,
  maxLines?: number
): number {
  if (!text?.trim()) return y;
  const lines = pdf.splitTextToSize(text.trim(), maxWidth) as string[];
  const visible = maxLines ? lines.slice(0, maxLines) : lines;
  visible.forEach((line, i) => pdf.text(line, x, y + i * lineSpacing));
  return y + visible.length * lineSpacing;
}

/** Draw a solid filled rectangle. */
function fillRect(
  pdf: jsPDF,
  x: number, y: number, w: number, h: number,
  hex: string
) {
  pdf.setFillColor(hex);
  pdf.rect(x, y, w, h, "F");
}

/**
 * Simulate a vertical gradient overlay by drawing horizontal strips
 * with opacity interpolating from `startOpacity` to `endOpacity`.
 */
function gradientOverlay(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  totalH: number,
  color: string,
  startOpacity: number = 0,
  endOpacity: number = 1,
  steps: number = GRADIENT_STEPS
) {
  const stripH = totalH / steps;
  try {
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const opacity = startOpacity + t * (endOpacity - startOpacity);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdf.setGState((pdf as any).GState({ opacity }));
      fillRect(pdf, x, y + i * stripH, w, stripH + 0.2, color); // +0.2 overlap to avoid gaps
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity: 1.0 }));
  } catch {
    // GState unavailable — solid fallback
    fillRect(pdf, x, y, w, totalH, color);
  }
}

/**
 * Draw a dark semi-transparent overlay (uniform opacity).
 */
function darkOverlay(pdf: jsPDF, x: number, y: number, w: number, h: number, opacity = 0.55) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity }));
    fillRect(pdf, x, y, w, h, BLACK);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity: 1.0 }));
  } catch {
    fillRect(pdf, x, y, w, h, BLACK);
  }
}

// ─── Page renderers ──────────────────────────────────────────────────────────

function renderCoverPage(pdf: jsPDF, date: string, logo: PdfImage | null) {
  fillRect(pdf, 0, 0, W, H, BLACK);

  // Vertical gold rule
  pdf.setFillColor(GOLD);
  pdf.rect(PAD_X, 28, 0.5, 154, "F");

  // Logo (SVG-rasterized, high-res)
  if (logo) {
    const logoW = 90;
    const logoH = logoW * (logo.height / logo.width);
    pdf.addImage(logo.dataUri, "PNG", PAD_X + 7, 32, logoW, logoH);
  } else {
    // Fallback: text-only wordmark
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(48);
    pdf.setTextColor(GOLD);
    pdf.text("CES", PAD_X + 7, 65);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(GOLD);
    pdf.setCharSpace(3.5);
    pdf.text("CLEAN ENERGY SOLUTIONS", PAD_X + 7, 78);
    pdf.setCharSpace(0);
  }

  // Title — "Innovative Services Portfolio"
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(GOLD);
  pdf.text("Innovative Services Portfolio", PAD_X + 7, 115);

  // Gold rule
  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.35);
  pdf.line(PAD_X + 7, 120, PAD_X + 160, 120);

  // Tagline
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("Connect with the future of sustainable engineering", PAD_X + 7, 129);

  // Date
  pdf.setFontSize(9);
  pdf.setTextColor(GRAY);
  pdf.text(`Generated: ${date}`, PAD_X + 7, 138);

  // Bottom-right URL
  pdf.setFontSize(9);
  pdf.setTextColor(GRAY);
  pdf.text("portfolio.ic-ces.engineering", W - PAD_X, H - 8, { align: "right" });
}

function renderServicePage(
  pdf: jsPDF,
  section: InnovationArea,
  heroImg: PdfImage | null,
  img1: PdfImage | null,
  img1Caption: string,
  img2: PdfImage | null,
  img2Caption: string,
  logo: PdfImage | null
) {
  // 1. Fill entire page with black background
  fillRect(pdf, 0, 0, W, H, BLACK);

  // 2. Hero image — fill width, maintain aspect ratio, positioned from top
  if (heroImg) {
    const imgHeightMm = W * (heroImg.height / heroImg.width);
    pdf.addImage(heroImg.dataUri, "JPEG", 0, 0, W, imgHeightMm);

    // Mask: uniform 40% over top 75%, then ramp 40% → 100% in bottom 25%
    const imgBottom = Math.min(imgHeightMm, H);
    const blendBreak = HEADER_H + (imgBottom - HEADER_H) * 0.75;
    const zone2H = imgBottom - blendBreak;

    // Flat 40% mask from header to 75% mark
    darkOverlay(pdf, 0, HEADER_H, W, blendBreak - HEADER_H, 0.4);
    // Ramp 40% → 100% in bottom quarter
    gradientOverlay(pdf, 0, blendBreak, W, zone2H, BLACK, 0.4, 1.0);
  }

  // 3. Header bar — fully opaque mask for clean logo/title area
  fillRect(pdf, 0, 0, W, HEADER_H, BLACK);

  // 4. Title text (left)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(GOLD);
  pdf.text(section.title, PAD_X, HEADER_H / 2 + 3);

  // 5. Logo (top-right)
  if (logo) {
    const logoH = HEADER_H - 4; // 16mm tall, fits in header
    const logoW = logoH * (logo.width / logo.height);
    pdf.addImage(logo.dataUri, "PNG", W - PAD_X - logoW, 2, logoW, logoH);
  }

  // Thin separator line
  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.3);
  pdf.line(0, HEADER_H, W, HEADER_H);

  // ── Body layout ────────────────────────────────────────────────────────────
  const bodyY   = BODY_TOP;
  const leftX   = PAD_X;
  const rightX  = PAD_X + LEFT_COL_W + COL_GAP;
  let   curY    = bodyY;

  // ── Left column: overview ──────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(GOLD);
  pdf.setCharSpace(1.5);
  pdf.text("OVERVIEW", leftX, curY);
  pdf.setCharSpace(0);
  curY += 4.5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(WHITE);
  const desc = section.longDescription?.trim() || "Content coming soon.";
  curY = addText(pdf, desc, leftX, curY, LEFT_COL_W, 4.5);
  curY += 5;

  // Divider
  pdf.setDrawColor("#333333");
  pdf.setLineWidth(0.2);
  pdf.line(leftX, curY, leftX + LEFT_COL_W, curY);
  curY += 5;

  // ── Left column: capabilities ─────────────────────────────────────────────
  if (section.subItems.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(GOLD);
    pdf.setCharSpace(1.5);
    pdf.text("CAPABILITIES", leftX, curY);
    pdf.setCharSpace(0);
    curY += 5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    for (const item of section.subItems) {
      if (curY > H - PAD_Y - 4) break;
      pdf.setTextColor(GOLD);
      pdf.text("›", leftX, curY);
      pdf.setTextColor(...NEAR_WHITE);
      addText(pdf, item.label, leftX + 5, curY, LEFT_COL_W - 5, 4.5, 1);
      curY += 5;
    }
  }

  // ── Right column: two images ──────────────────────────────────────────────
  const img1Y = bodyY;
  const img2Y = bodyY + IMG_BLOCK_H + IMG_GAP;

  function drawImageBlock(
    image: PdfImage | null,
    caption: string,
    imgY: number
  ) {
    if (image) {
      pdf.addImage(image.dataUri, "JPEG", rightX, imgY, RIGHT_COL_W, IMG_H);
    } else {
      fillRect(pdf, rightX, imgY, RIGHT_COL_W, IMG_H, "#1a1a1a");
    }
    if (caption.trim()) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(GRAY);
      addText(pdf, caption, rightX, imgY + IMG_H + CAPTION_OFFSET + 3.5, RIGHT_COL_W, 3.8, 2);
    }
  }

  drawImageBlock(img1, img1Caption, img1Y);
  drawImageBlock(img2, img2Caption, img2Y);
}

function renderContactPage(pdf: jsPDF) {
  fillRect(pdf, 0, 0, W, H, BLACK);

  // ── Contact Us box (full width, top) ────────────────────────────────────────
  const boxX = PAD_X;
  const boxW = W - PAD_X * 2;
  const boxY = 12;
  const boxH = 42;

  // Border
  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(boxX, boxY, boxW, boxH, 2, 2, "S");

  // "Contact Us" heading
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(WHITE);
  pdf.text("Contact Us", W / 2, boxY + 12, { align: "center" });

  // Name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(WHITE);
  pdf.text(CONTACT.name, W / 2, boxY + 20, { align: "center" });

  // Role
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(GOLD);
  pdf.text(CONTACT.role, W / 2, boxY + 25, { align: "center" });

  // Department
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...NEAR_WHITE);
  pdf.text("Innovative Building Services Engineering and RTD Services", W / 2, boxY + 30, { align: "center" });

  // Phone + Email side by side
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(GOLD);
  pdf.text(CONTACT.phone, W / 2 - 5, boxY + 37, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(GOLD);
  pdf.text(CONTACT.email, W / 2 + 5, boxY + 37, { align: "left" });

  // ── Two-column: Who We Are + How We Work ────────────────────────────────────
  const colGap = COL_GAP;
  const colW   = (boxW - colGap) / 2;
  const col1X  = PAD_X;
  const col2X  = PAD_X + colW + colGap;
  const colTop = boxY + boxH + 8;

  // Who We Are
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(WHITE);
  pdf.text("Who We Are", col1X, colTop);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...NEAR_WHITE);
  addText(pdf, CONTACT.whoWeAre, col1X, colTop + 6, colW, 3.6);

  // How We Work
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(WHITE);
  pdf.text("How We Work", col2X, colTop);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...NEAR_WHITE);
  addText(pdf, CONTACT.howWeWork, col2X, colTop + 6, colW, 3.6);

  // Footer
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(GRAY);
  pdf.text("portfolio.ic-ces.engineering", W - PAD_X, H - 8, { align: "right" });
}

function renderImpressumPage(pdf: jsPDF, date: string) {
  fillRect(pdf, 0, 0, W, H, BLACK);

  // Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(GOLD);
  pdf.text("Legal Information", PAD_X, 28);

  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(PAD_X, 31.5, PAD_X + 52, 31.5);

  const colW  = (W - PAD_X * 2 - COL_GAP) / 2;
  const col2X = PAD_X + colW + COL_GAP;
  const hdrY  = 44;
  const bodyStart = 52;
  const lineH = 5;

  // Col 1 — Company Data
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("Company Data", PAD_X, hdrY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...NEAR_WHITE);
  LEGAL.companyData.forEach((line, i) => {
    pdf.text(line, PAD_X, bodyStart + i * lineH);
  });

  // Col 2 — Impressum
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("Impressum", col2X, hdrY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...NEAR_WHITE);
  LEGAL.impressum.forEach((line, i) => {
    pdf.text(line, col2X, bodyStart + i * lineH);
  });

  // Footer
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY);
  pdf.text(`Generated: ${date}`, PAD_X, H - 8);
  pdf.text("portfolio.ic-ces.engineering", W - PAD_X, H - 8, { align: "right" });
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function generatePortfolioPdf(innovations: InnovationArea[]): Promise<void> {
  const t0 = performance.now();
  console.log("PDF: starting generation…");

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Pre-fetch the SVG logo (rasterized at high resolution for crisp rendering)
  const logo = await loadSvgAsDataUri(LOGO_SVG_WHITE, 800);

  // 1. Cover
  renderCoverPage(pdf, date, logo);
  console.log("PDF: cover ✓");

  // 2. One page per service
  for (const section of innovations) {
    pdf.addPage();

    const [heroImg, img1, img2] = await Promise.all([
      section.images[0]?.src ? loadImageAsDataUri(section.images[0].src, TITLE_IMG_MAX_W, JPEG_QUALITY) : null,
      section.images[1]?.src ? loadImageAsDataUri(section.images[1].src, COLUMN_IMG_MAX_W, JPEG_QUALITY) : null,
      section.images[2]?.src ? loadImageAsDataUri(section.images[2].src, COLUMN_IMG_MAX_W, JPEG_QUALITY) : null,
    ]);

    renderServicePage(
      pdf, section,
      heroImg,
      img1, section.images[1]?.caption ?? "",
      img2, section.images[2]?.caption ?? "",
      logo
    );
    console.log(`PDF: ${section.title} ✓`);
  }

  // 3. Contact
  pdf.addPage();
  renderContactPage(pdf);
  console.log("PDF: contact ✓");

  // 4. Impressum
  pdf.addPage();
  renderImpressumPage(pdf, date);
  console.log("PDF: impressum ✓");

  pdf.save("CES Portfolio.pdf");

  const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
  console.log(`PDF: done — ${innovations.length + 3} pages in ${elapsed}s`);
}
