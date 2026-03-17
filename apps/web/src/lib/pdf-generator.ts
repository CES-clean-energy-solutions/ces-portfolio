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

// ─── Brand colours ───────────────────────────────────────────────────────────
const GOLD  = "#D4A843";
const WHITE = "#ffffff";
const NEAR_WHITE: [number, number, number] = [230, 230, 230];
const GRAY  = "#aaaaaa";

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
 * Fetch an image URL and return it as a base64 data URI.
 * Returns null if the fetch fails (e.g. missing file).
 */
async function loadImageAsDataUri(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`PDF: could not load image ${src}:`, err);
    return null;
  }
}

/** Detect image format from data URI prefix. */
function imgFormat(dataUri: string): string {
  if (dataUri.startsWith("data:image/png"))  return "PNG";
  if (dataUri.startsWith("data:image/webp")) return "WEBP";
  if (dataUri.startsWith("data:image/gif"))  return "GIF";
  return "JPEG";
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
 * Draw a dark semi-transparent overlay on the current page
 * (used to darken title-bar background images for text legibility).
 * Falls back to a solid dark fill on browsers that don't support GState.
 */
function darkOverlay(pdf: jsPDF, x: number, y: number, w: number, h: number, opacity = 0.65) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity }));
    fillRect(pdf, x, y, w, h, "#000000");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf.setGState((pdf as any).GState({ opacity: 1.0 }));
  } catch {
    // GState unavailable — draw a slightly lighter solid fallback
    fillRect(pdf, x, y, w, h, "#1a1a1a");
  }
}

// ─── Page renderers ──────────────────────────────────────────────────────────

function renderCoverPage(pdf: jsPDF, date: string) {
  fillRect(pdf, 0, 0, W, H, "#000000");

  // Vertical gold rule
  pdf.setFillColor(GOLD);
  pdf.rect(PAD_X, 28, 0.4, 154, "F");

  // "CES" wordmark
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(72);
  pdf.setTextColor(GOLD);
  pdf.text("CES", PAD_X + 7, 88);

  // Subtitle with letter-spacing approximated via character tracking
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(WHITE);
  pdf.setCharSpace(3.5);
  pdf.text("CLEAN ENERGY SOLUTIONS", PAD_X + 7, 102);
  pdf.setCharSpace(0);

  // "Portfolio" label
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(26);
  pdf.setTextColor(160, 160, 160);
  pdf.text("Portfolio", PAD_X + 7, 120);

  // Gold rule
  pdf.setDrawColor(GOLD);
  pdf.setLineWidth(0.35);
  pdf.line(PAD_X + 7, 128, PAD_X + 110, 128);

  // Tagline
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(GRAY);
  pdf.text("Engineering for a sustainable future", PAD_X + 7, 136);

  // Date
  pdf.setFontSize(8);
  pdf.setTextColor(GRAY);
  pdf.text(`Generated: ${date}`, PAD_X + 7, 143);

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
  fillRect(pdf, 0, 0, W, H, "#0a0a0a");

  // ── Title bar ──────────────────────────────────────────────────────────────
  if (img0DataUri) {
    pdf.addImage(img0DataUri, imgFormat(img0DataUri), 0, 0, W, TITLE_H);
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
      pdf.addImage(dataUri, imgFormat(dataUri), rightX, imgY, RIGHT_COL_W, IMG_H);
    } else {
      fillRect(pdf, rightX, imgY, RIGHT_COL_W, IMG_H, "#1a1a1a");
    }
    if (caption.trim()) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(GRAY);
      // Allow up to 2 lines of caption
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
  pdf.setTextColor("#000000");
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
  pdf.setTextColor("#222222");
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
  pdf.setTextColor("#222222");
  addText(pdf, CONTACT.whoWeAre, col2X, bodyStart, colW, 5);

  // Col 3 — How We Work
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(GOLD);
  pdf.text("How We Work", col3X, hdrY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor("#222222");
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
  pdf.setTextColor("#000000");
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

  // 1. Cover
  renderCoverPage(pdf, date);
  console.log("PDF: cover ✓");

  // 2. One page per service
  for (const section of innovations) {
    pdf.addPage();

    const [img0, img1, img2] = await Promise.all([
      section.images[0]?.src ? loadImageAsDataUri(section.images[0].src) : null,
      section.images[1]?.src ? loadImageAsDataUri(section.images[1].src) : null,
      section.images[2]?.src ? loadImageAsDataUri(section.images[2].src) : null,
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
