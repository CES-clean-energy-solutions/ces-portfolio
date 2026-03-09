# PRD: Portfolio PDF Export
## Status: Implementation Complete (Manual Testing Required)
## Last Updated: 2026-03-09

## 1. Overview

The portfolio site needs a one-click PDF export feature that generates a professionally formatted, print-ready PDF of the entire portfolio content. This serves the sales team's primary use case: downloading a high-quality portfolio document for client meetings, offline presentations, and email follow-ups. The PDF will maintain the site's visual branding (background images, gold accents, typography) while optimizing for landscape A4 printing.

## 2. Goals

**G1:** Enable sales team to generate a complete portfolio PDF in under 30 seconds with a single button click.

**G2:** Produce a print-ready PDF that maintains visual branding and is suitable for client presentations.

**G3:** Ensure the PDF includes all innovation/service sections with consistent formatting across landscape A4 pages.

**G4:** Provide clear user feedback during PDF generation with loading state and success/error handling.

**G5:** Keep implementation client-side to avoid server costs and enable offline functionality.

## 3. User Stories

**US-1:** As a sales engineer, I want to download the portfolio as a PDF so that I can present it to clients in meetings without internet connectivity.

**US-2:** As a sales engineer, I want the PDF to maintain the site's visual branding so that clients receive a consistent brand experience.

**US-3:** As a sales engineer, I want each innovation section on its own page so that I can easily reference specific capabilities during presentations.

**US-4:** As a sales engineer, I want the PDF filename to be descriptive ("CES Portfolio.pdf") so that clients can find it easily in their downloads folder.

**US-5:** As a site visitor, I want immediate feedback when clicking "Print to PDF" so that I know the system is working and how long to wait.

## 4. Functional Requirements

**FR-1:** A "Print to PDF" button must be added to the header navigation, positioned after the "Contact" link, visible on all breakpoints (mobile, tablet, desktop).

**FR-2:** Clicking the button must trigger client-side PDF generation using jsPDF and html2canvas libraries.

**FR-3:** The button must show a loading state during generation: spinner icon + "Generating PDF..." text, with the button disabled to prevent multiple clicks.

**FR-4:** The PDF must be named "CES Portfolio.pdf" when downloaded to the user's browser.

**FR-5:** The PDF must use landscape A4 orientation (297mm x 210mm) for all pages.

**FR-6:** The PDF must include the following content in order:
- **Cover page:** Hero section styling with "CES Portfolio" title, gold chevron logo, and tagline
- **Innovation/Service sections:** One page per section (6 pages total), each showing:
  - Section title
  - Main background image (from main-bg.*)
  - Short description
  - Key stats (if available)
  - List of capabilities (subItems)
- **Contact page:** Contact information, "Who We Are" text, "How We Work" text
- **Impressum page:** Company legal information (Impressum content from footer)

**FR-7:** Empty sections (e.g., Green Finance with no images) must still be included in the PDF with placeholder text: "Content coming soon."

**FR-8:** The PDF must render background images at sufficient resolution for printing (minimum 150 DPI equivalent).

**FR-9:** Color scheme must match the website: black backgrounds, gold accents (`#D4A843`), white text, using the same OKLCH color tokens.

**FR-10:** Typography must match the website fonts (Inter for body, appropriate hierarchy for headings).

**FR-11:** On successful PDF generation, show a success toast notification: "PDF downloaded successfully."

**FR-12:** On error (generation failure, timeout, browser incompatibility), show an error toast: "Failed to generate PDF. Please try again or use a modern browser."

**FR-13:** The PDF must be generated entirely in the browser with no server requests (except for loading the libraries).

**FR-14:** Links in the PDF must be rendered as plain text (no clickable links, static content only).

**FR-15:** The button must work on desktop browsers (Chrome, Firefox, Safari, Edge). Mobile browser support is best-effort (may show "not supported on mobile" message).

## 5. Non-Goals / Out of Scope

**NG-1:** Selective section export (checkboxes to choose which sections to include). Future enhancement.

**NG-2:** Custom PDF branding or templates (user-editable covers, headers/footers). Future enhancement.

**NG-3:** Server-side PDF generation (Puppeteer, AWS Lambda). Out of scope for initial implementation.

**NG-4:** Interactive PDF features (clickable links, form fields, navigation). Static PDF only.

**NG-5:** PDF editing or annotation features. Download-only.

**NG-6:** Multi-language PDF support. English only for now.

**NG-7:** Email delivery of PDF (send directly from site). User must download and send manually.

**NG-8:** Analytics tracking of PDF downloads. May be added later via Plausible custom events.

## 6. Design Considerations

**Button Design:**
- Matches existing header link style (white text, hover gold)
- Icon: Download or FileText icon from lucide-react
- Mobile: May show icon-only variant to save space
- Loading state: Spinner replaces icon, text changes to "Generating..."

**PDF Layout:**
- Landscape A4 (297mm x 210mm = 1122px x 794px at 96 DPI)
- Margins: 20mm all sides for safe printing area
- Typography scale: H1 = 32pt, H2 = 24pt, body = 12pt, captions = 10pt
- Two-column layout where appropriate (capabilities lists, contact info)
- Full-bleed background images with dark overlay for text legibility

**Cover Page:**
- Centered logo composition (chevron + text)
- Full-page background image (hero particle effect or gradient)
- Title: "CES Portfolio"
- Subtitle: "Clean Energy Solutions — Engineering Consultancy"
- Footer: Date generated, website URL

**Section Pages:**
- Full-page background image (main-bg.*)
- Dark gradient overlay (bottom 50%) for text legibility
- Content area: White text on semi-transparent black panel
- Left side: Title, description, stats
- Right side: Capabilities list (2-column grid)

**Contact Page:**
- White background with black text (inverted for contrast)
- Three-column layout: Contact info | Who We Are | How We Work
- Gold accent borders and icons

**Impressum Page:**
- Simple text-only layout
- Two-column for readability
- Small footer: "Generated from portfolio.ic-ces.engineering"

## 7. Technical Considerations

**Libraries:**
- **jsPDF** (v2.5.2+): Core PDF generation library, supports A4 landscape, fonts, images
- **html2canvas** (v1.4.1+): Converts DOM elements to canvas for embedding in PDF
- Install as dependencies in `apps/web/package.json`

**Architecture:**
- New component: `ExportPdfButton.tsx` in `apps/web/src/components/`
- New utility: `apps/web/src/lib/pdf-generator.ts` with core export logic
- Integrate button into existing `Header.tsx` component
- Use `"use client"` directive (needs DOM access, user interaction)

**Implementation Strategy:**
1. Render hidden DOM elements for PDF content (styled specifically for print)
2. Use html2canvas to capture each page as a canvas
3. Convert canvas to image data URI
4. Add images to jsPDF document as full-page images
5. Trigger browser download via `doc.save()`

**Performance:**
- Target generation time: 15-30 seconds for 9-page portfolio
- Use `Promise.all()` to parallelize canvas generation where possible
- Show progress indicator (estimated time: 20-30 seconds)
- Implement timeout (60 seconds) with error message

**Browser Compatibility:**
- Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Detect WebP support, canvas API, Blob API before attempting generation
- Show "Your browser doesn't support PDF export" error if incompatible

**Content Source:**
- Read data from `@ces/content/data/innovation` (same source as website)
- Read footer legal content from existing footer components
- No new API endpoints or data fetching required

**Image Handling:**
- Images must be loaded and embedded as base64 data URIs
- Use `crossOrigin="anonymous"` when loading images to avoid CORS issues
- Fall back to placeholder gradient if image fails to load
- Compress images to JPEG (quality 85) to reduce PDF file size

**Error Handling:**
- Wrap generation in try/catch with user-friendly error messages
- Log detailed errors to console for debugging
- Show retry button on failure

## 8. Success Metrics

**M1:** PDF generation success rate > 95% (track via error logs)

**M2:** Average generation time < 30 seconds (measure client-side, log to console)

**M3:** PDF file size < 10 MB (target 5-8 MB for 6-section portfolio)

**M4:** Sales team adoption: Track downloads via Plausible custom event (future enhancement)

**M5:** Zero user-reported bugs or formatting issues in first 30 days post-launch

## 9. Open Questions

**Q1:** Should we add a "Preview PDF" mode that opens the PDF in a new tab before downloading? (Resolution: No, out of scope for V1. Direct download is simpler.)

**Q2:** Do we need to support portrait orientation as an option? (Resolution: No, landscape only for initial release.)

**Q3:** Should we watermark the PDF with "Generated on [date]"? (Resolution: Yes, add footer to cover page.)

**Q4:** What happens if user's browser blocks pop-ups/downloads? (Resolution: Show error message: "Please allow downloads from this site.")

---

## Implementation

### Pre-flight Requirements

> ⚠️ This project runs in a **VS Code dev container**. Dependencies cannot be installed at runtime.
> Any items listed here MUST be completed and the container rebuilt BEFORE running `/implement`.
> Starting a new Claude session after rebuilding is required.

**New npm packages** (add to `apps/web/package.json`, then rebuild):
- `jspdf` (^2.5.2) — Core PDF generation library
- `html2canvas` (^1.4.1) — DOM to canvas conversion for image embedding
- `@types/jspdf` (dev dependency) — TypeScript types for jsPDF

**Environment variables:**
None — no new env vars required.

**Other system changes:**
None.

---

### Relevant Files

**New files:**
- `apps/web/src/components/ExportPdfButton.tsx` — Button component with loading state
- `apps/web/src/lib/pdf-generator.ts` — Core PDF generation logic
- `apps/web/src/components/pdf/PdfCoverPage.tsx` — Hidden component for cover page rendering
- `apps/web/src/components/pdf/PdfSectionPage.tsx` — Hidden component for section page rendering
- `apps/web/src/components/pdf/PdfContactPage.tsx` — Hidden component for contact page rendering
- `apps/web/src/components/pdf/PdfImpressumPage.tsx` — Hidden component for impressum page rendering

**Modified files:**
- `apps/web/src/components/Header.tsx` — Integrate ExportPdfButton
- `apps/web/package.json` — Add dependencies

---

### Notes

- No tests initially (PDF generation is visual, hard to unit test)
- Manual testing required: generate PDF, verify formatting, print test
- Test browsers: Chrome, Firefox, Safari
- Test on large portfolios (all 6 sections with images)

---

### Tasks

- [x] 1.0 Setup and Dependencies
  - [x] 1.1 Add jspdf, html2canvas, @types/jspdf to apps/web/package.json
  - [x] 1.2 Rebuild dev container (user action)
  - [x] 1.3 Verify packages installed with `pnpm list jspdf html2canvas`

- [x] 2.0 Create PDF Button Component
  - [x] 2.1 Create ExportPdfButton.tsx with Download icon from lucide-react
  - [x] 2.2 Implement loading state (spinner, disabled, text change to "Generating...")
  - [x] 2.3 Add click handler that calls PDF generation function
  - [x] 2.4 Style to match header link style (white text, hover gold)
  - [x] 2.5 Add mobile-responsive variant (icon-only on small screens)

- [x] 3.0 Integrate Button into Header
  - [x] 3.1 Import ExportPdfButton into Header.tsx
  - [x] 3.2 Add button after "Contact" link in navigation
  - [x] 3.3 Verify button appears on all breakpoints
  - [x] 3.4 Test hover states and accessibility (keyboard navigation)

- [x] 4.0 Create PDF Template Components
  - [x] 4.1 Create PdfCoverPage.tsx (hidden div, landscape A4 dimensions, hero styling)
  - [x] 4.2 Create PdfSectionPage.tsx (accepts InnovationArea props, renders title/description/stats/capabilities)
  - [x] 4.3 Create PdfContactPage.tsx (three-column layout with contact info, who we are, how we work)
  - [x] 4.4 Create PdfImpressumPage.tsx (legal content from footer)
  - [x] 4.5 Style all components with inline styles (no Tailwind, CSS must be inline for html2canvas)

- [x] 5.0 Implement Core PDF Generation Logic
  - [x] 5.1 Create pdf-generator.ts with main `generatePortfolioPdf()` function
  - [x] 5.2 Implement page rendering: create hidden container, render template components
  - [x] 5.3 Implement canvas capture: use html2canvas to capture each page
  - [x] 5.4 Implement PDF assembly: create jsPDF doc, add canvas images as pages
  - [x] 5.5 Implement download trigger: doc.save('CES Portfolio.pdf')
  - [x] 5.6 Add cleanup: remove hidden container after generation

- [x] 6.0 Load and Embed Content Data
  - [x] 6.1 Import innovation data from @ces/content/data/innovation
  - [x] 6.2 Load main background images for each section
  - [x] 6.3 Load footer legal content (impressum, company data)
  - [x] 6.4 Handle missing/empty sections (show "Content coming soon" placeholder)
  - [x] 6.5 Load and embed logo SVGs as base64 data URIs

- [x] 7.0 Image Processing and Optimization
  - [x] 7.1 Implement image loading with crossOrigin="anonymous" to avoid CORS
  - [x] 7.2 Convert images to base64 data URIs for embedding
  - [x] 7.3 Implement JPEG compression (quality 85) to reduce file size
  - [x] 7.4 Add fallback gradient background if image load fails
  - [x] 7.5 Ensure images render at minimum 150 DPI equivalent

- [x] 8.0 Error Handling and User Feedback
  - [x] 8.1 Wrap generation in try/catch with detailed error logging
  - [x] 8.2 Add browser compatibility check (canvas API, Blob API)
  - [x] 8.3 Implement 60-second timeout with user-friendly error message
  - [x] 8.4 Show success toast: "PDF downloaded successfully"
  - [x] 8.5 Show error toast: "Failed to generate PDF. Please try again."
  - [x] 8.6 Add console logging for debugging (generation time, file size)

- [ ] 9.0 Testing and Refinement
  - [ ] 9.1 Test PDF generation with all sections populated
  - [ ] 9.2 Test with empty sections (Green Finance placeholder)
  - [ ] 9.3 Verify landscape A4 dimensions (297mm x 210mm)
  - [ ] 9.4 Print test: verify margins, text legibility, image quality
  - [ ] 9.5 Test on Chrome, Firefox, Safari
  - [ ] 9.6 Test mobile (show "not supported" or degrade gracefully)
  - [ ] 9.7 Verify PDF file size < 10 MB
  - [ ] 9.8 Verify generation time < 30 seconds

- [x] 10.0 Final Polish
  - [x] 10.1 Add "Generated on [date]" footer to cover page
  - [x] 10.2 Add website URL footer to cover page
  - [x] 10.3 Verify all typography matches website (Inter font)
  - [x] 10.4 Verify all colors match (black bg, gold accents #D4A843)
  - [ ] 10.5 Final visual QA: compare PDF to website screenshots (requires manual testing)

---

### Progress Log

| Date | Task | Notes |
|------|------|-------|
| 2026-03-09 | 1.1-1.3 | Added jspdf, html2canvas, @types/jspdf to package.json and verified installation |
| 2026-03-09 | 2.1-2.5 | Created ExportPdfButton component with loading state and mobile-responsive design |
| 2026-03-09 | 3.1-3.4 | Integrated ExportPdfButton into Header after Contact link |
| 2026-03-09 | 4.1-4.5 | Created all PDF template components (Cover, Section, Contact, Impressum) with inline styles |
| 2026-03-09 | 5.1-5.6 | Implemented core PDF generation logic with html2canvas and jsPDF |
| 2026-03-09 | 6.1-6.5 | Added content loading for innovation data, images, and legal content |
| 2026-03-09 | 7.1-7.5 | Implemented image processing with base64 encoding and JPEG compression |
| 2026-03-09 | 8.1-8.6 | Added error handling, browser compatibility checks, and logging |
| 2026-03-09 | 10.1-10.4 | Verified all polish requirements: date/URL footers, Inter font, brand colors |
