import jsPDF from "jspdf";
import type { InnovationArea } from "@ces/content/data/innovation";

// ─── Page geometry (landscape A4) ───────────────────────────────────────────
const W = 297;        // mm — page width
const H = 210;        // mm — page height

const TITLE_H = 28;   // mm — service page title bar height
const PAD_X   = 10;   // mm — horizontal page margin
const PAD_Y   = 6;    // mm — vertical body padding (top & bottom)
const COL_GAP = 7;    // mm — gap between left and right columns

const RIGHT_COL_W = 132;                                  // mm — image column width
const LEFT_COL_W  = W - PAD_X * 2 - COL_GAP - RIGHT_COL_W; // mm — text column width (~138)

// Right-column image sizing — two images stacked with equal height
const BODY_H       = H - TITLE_H - PAD_Y * 2; // 170mm
const IMG_GAP      = 6;                        // mm — gap between the two image blocks
const IMG_BLOCK_H  = (BODY_H - IMG_GAP) / 2;  // 82mm per block
const IMG_H        = 74;                       // mm — rendered image height (≈ 16:9 for 132mm width)
const CAPTION_OFFSET = 3;                      // mm — gap between image bottom and caption baseline

// ─── Image compression tiers ────────────────────────────────────────────────
const TITLE_IMG_MAX_W  = 1600; // px — title bar spans full page width
const COLUMN_IMG_MAX_W = 1000; // px — column images are 132mm wide
const JPEG_QUALITY     = 0.80;

// ─── CES Brand colours ─────────────────────────────────────────────────────
const GOLD      = "#f8c802";   // CES brand gold (logo chevron)
const DARK_TEAL = "#1b2e2a";   // CES brand black / dark teal
const WHITE     = "#ffffff";
const NEAR_WHITE: [number, number, number] = [235, 235, 235];
const GRAY      = "#999999";   // lighter gray for contrast on dark teal

// ─── Logo path (relative to public/) ────────────────────────────────────────
const LOGO_SRC = "/content/ces-logo-white-bg.jpg";

// ─── Static copy ─────────────────────────────────────────────────────────────
const CONTACT = {
  email:    "office@ic-ces.engineering",
  phone:    "+43 (0) 1234 5678",
  location: "Vienna, Austria",
  website:  "portfolio.ic-ces.engineering",
  whoWeAre: `CES Clean Energy Solutions is a Vienna-based engineering consultancy specialising in sustainable urban development, energy efficiency, and environmental engineering. Our multidisciplinary team combines deep technical expertise with innovative digital methods to deliver integrated solutions for the built environment.`,
  howWeWork: `We operate at the intersection of engineering and technology, leveraging BIM, computational simulation, and data-driven design to optimise building performance. Our collaborative approach ensures seamless integration with architectural teams, contractors, and stakeholders throughout project lifecycles.`,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Downscale and JPEG-compress an image via off-screen canvas.
 * If the image is already smaller than maxWidth, it's still re-encoded as JPEG.
 */
function compressImage(
  img: HTMLImageElement,
  maxWidth: number,
  quality: number
): string {
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

  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Fetch an image URL, downscale it, and return as a compressed JPEG data URI.
 * Returns null if the fetch or decode fails.
 */
async function loadImageAsDataUri(
  src: string,
  maxWidth: number = COLUMN_IMG_MAX_W,
  quality: number = JPEG_QUALITY
): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const originalKB = (blob.size / 1024).toFixed(0);

    // Decode via HTMLImageElement (works in all browsers)
    const blobUrl = URL.createObjectURL(blob);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = blobUrl;
    });

    const dataUri = compressImage(img, maxWidth, quality);
    URL.revokeObjectURL(blobUrl);

    const compressedKB = (dataUri.length * 0.75 / 1024).toFixed(0); // base64 → bytes approx
    console.log(`PDF: ${src} — ${originalKB} KB → ~${compressedKB} KB (${img.naturalWidth}×${img.naturalHeight} → max ${maxWidth}px)`);

    return dataUri;
  } catch (err) {
    console.warn(`PDF: could not load image ${src}:`, err);
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
 * Draw a dark semi-transparent overlay (brand dark teal) on the current page.
 * Falls back to a solid dark fill on browsers that don't support GState.
 */
function darkOverlay(pdf: jsPDF, x: number, y: number, w: number, h: number, opacity = 0.65) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity }));
    fillRect(pdf, x, y, w, h, DARK_TEAL);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity: 1.0 }));
  } catch {
    fillRect(pdf, x, y, w, h, "#1a2b25");
  }
}

// ─── Page renderers ──────────────────────────────────────────────────────────

function renderCoverPage(pdf: jsPDF, date: string, logoDataUri: string | null) {
  fillRect(pdf, 0, 0, W, H, DARK_TEAL);

  // Logo image (if available)
  if (logoDataUri) {
    // Logo JPG is roughly 4:3 aspect. Render ~80mm wide in the upper-left area.
    const logoW = 80;
    const logoH = 60;
    pdf.addImage(logoDataUri, "JPEG", PAD_X + 7, 30, logoW, logoH);
  } else {
    // Fallback: text-only wordmark
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(72);
    pdf.setTextColor(GOLD);
    pdf.text("CES", PAD_X + 7, 70);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(WHITE);
    pdf.setCharSpace(3.5);
    pdf.text("CLEAN ENERGY SOLUTIONS", PAD_X + 7, 84);
    pdf.setCharSpace(0);
  }

  // Vertical gold rule
  pdf.setFillColor(GOLD);
  pdf.rect(PAD_X, 28, 0.4, 154, "F");

  // "Portfolio" label — positioned below logo
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(26);
  pdf.setTextColor(160, 160, 160);
  pdf.text("Portfolio", PAD_X + 7, 108);

  // Gold rule
  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.35);
  pdf.line(PAD_X + 7, 116, PAD_X + 110, 116);

  // Tagline
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(GRAY);
  pdf.text("Engineering for a sustainable future", PAD_X + 7, 124);

  // Date
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY);
  pdf.text(`Generated: ${date}`, PAD_X + 7, 131);

  // Bottom-right URL
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY);
  pdf.text("portfolio.ic-ces.engineering", W - PAD_X, H - 8, { align: "right" });
}

function renderServicePage(
  pdf: jsPDF,
  section: InnovationArea,
  img0DataUri: string | null,
  img1DataUri: string | null,
  img1Caption: string,
  img2DataUri: string | null,
  img2Caption: string
) {
  // Page background
  fillRect(pdf, 0, 0, W, H, DARK_TEAL);

  // ── Title bar ──────────────────────────────────────────────────────────────
  if (img0DataUri) {
    pdf.addImage(img0DataUri, "JPEG", 0, 0, W, TITLE_H);
    darkOverlay(pdf, 0, 0, W, TITLE_H, 0.68);
  } else {
    fillRect(pdf, 0, 0, W, TITLE_H, "#111111");
  }

  // Title text
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(GOLD);
  pdf.text(section.title, PAD_X, TITLE_H / 2 + 3.5);

  // Thin separator line
  pdf.setDrawColor("#2a2a2a");
  pdf.setLineWidth(0.2);
  pdf.line(0, TITLE_H, W, TITLE_H);

  // ── Body layout ────────────────────────────────────────────────────────────
  const bodyY   = TITLE_H + PAD_Y;
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
  pdf.setDrawColor("#2a2a2a");
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
      if (curY > H - PAD_Y - 4) break;   // guard against page overflow
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
    dataUri: string | null,
    caption: string,
    imgY: number
  ) {
    if (dataUri) {
      pdf.addImage(dataUri, "JPEG", rightX, imgY, RIGHT_COL_W, IMG_H);
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

  drawImageBlock(img1DataUri, img1Caption, img1Y);
  drawImageBlock(img2DataUri, img2Caption, img2Y);
}

function renderContactPage(pdf: jsPDF) {
  fillRect(pdf, 0, 0, W, H, WHITE);

  // Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(DARK_TEAL);
  pdf.text("Get In Touch", PAD_X, 28);

  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(PAD_X, 31.5, PAD_X + 58, 31.5);

  const colW  = (W - PAD_X * 2 - COL_GAP * 2) / 3;
  const col2X = PAD_X + colW + COL_GAP;
  const col3X = PAD_X + colW * 2 + COL_GAP * 2;
  const hdrY  = 46;
  const bodyStart = 54;

  // Col 1 — Contact details
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("Contact Us", PAD_X, hdrY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK_TEAL);
  pdf.text(CONTACT.email,    PAD_X, bodyStart);
  pdf.text(CONTACT.phone,    PAD_X, bodyStart + 6);
  pdf.text(CONTACT.location, PAD_X, bodyStart + 12);
  pdf.text(CONTACT.website,  PAD_X, bodyStart + 18);

  // Col 2 — Who We Are
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("Who We Are", col2X, hdrY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK_TEAL);
  addText(pdf, CONTACT.whoWeAre, col2X, bodyStart, colW, 5);

  // Col 3 — How We Work
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("How We Work", col3X, hdrY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK_TEAL);
  addText(pdf, CONTACT.howWeWork, col3X, bodyStart, colW, 5);

  // Footer
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY);
  pdf.text("portfolio.ic-ces.engineering", W - PAD_X, H - 8, { align: "right" });
}

function renderImpressumPage(pdf: jsPDF, date: string) {
  fillRect(pdf, 0, 0, W, H, WHITE);

  // Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(DARK_TEAL);
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
  pdf.setTextColor("#333333");
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
  pdf.setTextColor("#333333");
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

  // Pre-fetch the logo for the cover page
  const logoDataUri = await loadImageAsDataUri(LOGO_SRC, 400, JPEG_QUALITY);

  // 1. Cover
  renderCoverPage(pdf, date, logoDataUri);
  console.log("PDF: cover ✓");

  // 2. One page per service
  for (const section of innovations) {
    pdf.addPage();

    const [img0, img1, img2] = await Promise.all([
      section.images[0]?.src ? loadImageAsDataUri(section.images[0].src, TITLE_IMG_MAX_W, JPEG_QUALITY) : null,
      section.images[1]?.src ? loadImageAsDataUri(section.images[1].src, COLUMN_IMG_MAX_W, JPEG_QUALITY) : null,
      section.images[2]?.src ? loadImageAsDataUri(section.images[2].src, COLUMN_IMG_MAX_W, JPEG_QUALITY) : null,
    ]);

    renderServicePage(
      pdf, section,
      img0,
      img1, section.images[1]?.caption ?? "",
      img2, section.images[2]?.caption ?? ""
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
