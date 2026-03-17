# PRD: PDF Export Layout Redesign
## Status: In Progress
## Last Updated: 2026-03-17

---

## 1. Overview

The PDF portfolio export generates a downloadable document used by CES sales engineers
during client presentations. The current layout renders each service with a background
image, text columns, and separate gallery pages — producing too many pages and wasting
space. This redesign collapses each service to a single page with a clear structure:
full-width title bar at the top, then a two-column body with text on the left and two
images (with captions) stacked on the right. Gallery pages are eliminated entirely.

---

## 2. Goals

**G1** — Each innovation/service occupies exactly one PDF page.
**G2** — Every service page uses a consistent two-column layout: title full-width, then
left column (description + capabilities) and right column (two images with captions).
**G3** — Eliminate the separate gallery pages that currently follow each section page.
**G4** — Images displayed on service pages are `images[1]` and `images[2]` (the first two
non-hero images), not `images[0]` (the card/hero image).
**G5** — Image captions render below each image inside the image cell.

---

## 3. User Stories

**US-1** — As a sales engineer, I want each service on a single page so I can flip through
the PDF quickly in a meeting without navigating gallery pages.

**US-2** — As a sales engineer, I want to see project images alongside the description so
clients get visual context without me switching pages.

**US-3** — As a sales engineer, I want consistent page structure across all services so the
document feels polished and professional.

---

## 4. Functional Requirements

**FR-1** — The PDF generator shall render exactly one page per innovation entry (plus the
cover page, contact page, and impressum page).

**FR-2** — Each service page shall have a full-width title bar at the top of the page
displaying the innovation title in the CES gold accent color (`#D4A843`).

**FR-3** — Below the title, the page body shall be divided into two columns at a 50/50
split:
- **Left column:** long description text at top; capabilities list (`subItems`) below it.
- **Right column:** `images[1]` at top (with its caption below); `images[2]` below that
  (with its caption below).

**FR-4** — If `images[1]` or `images[2]` is absent for a given service, the corresponding
image cell shall render a neutral placeholder (dark rectangle with no text) rather than
crashing or leaving broken markup.

**FR-5** — Captions shall render as small text (`~9px`, colour `#aaaaaa`) directly below
their respective image, inside the image cell.

**FR-6** — The `PdfGalleryPage` component shall no longer be rendered by the generator.
Gallery pages shall be removed from the PDF output.

**FR-7** — The `PdfSectionPage` component shall be replaced by a new `PdfServicePage`
component (or rewritten in-place) implementing the new layout. The old background-image
approach shall be removed.

**FR-8** — Stats box (metric/label/secondary) shall be removed from the service page if
it was previously present. Space is at a premium; stats are not needed with images visible.

**FR-9** — The cover page, contact page, and impressum page shall remain unchanged.

**FR-10** — The generator shall pre-load `images[1]` and `images[2]` as base64 data URIs
(same pattern used for `images[0]` today) before rendering the component.

---

## 5. Non-Goals / Out of Scope

- Changing the cover page, contact page, or impressum page design.
- Adding more than two images per service page.
- Supporting variable image counts (the layout assumes exactly two; FR-4 handles missing ones).
- Changing the PDF page dimensions (landscape A4, 1122×794px stays).
- Changing the colour scheme or brand palette.
- Making the PDF interactive (links, bookmarks, etc.).

---

## 6. Design Considerations

**Page structure (landscape A4):**

```
┌─────────────────────────────────────────────────────────┐
│  Title bar — full width, gold text on dark background   │
├─────────────────────────────┬───────────────────────────┤
│  Long description           │  [Image 1]                │
│                             │  caption text             │
│  ─────────────────          │  ───────────────────────  │
│  Capabilities               │  [Image 2]                │
│  › Sub-item 1               │  caption text             │
│  › Sub-item 2               │                           │
│  ...                        │                           │
└─────────────────────────────┴───────────────────────────┘
```

- Background: `#000000` or `#0a0a0a` (consistent with current dark theme)
- Title bar: slightly lighter dark background (`#111`) or a subtle gold-tinted bar; title
  text in `#D4A843` at ~36–40px
- Left column body text: white, ~11px, generous line-height
- Capabilities list: white with `›` bullet, ~11px
- Images: fill their cell width, cropped/covered, with a fixed aspect ratio (roughly 16:9)
- Caption: `#aaaaaa`, ~9px, below the image, max 2 lines

---

## 7. Technical Considerations

**Existing files to modify:**
- `apps/web/src/lib/pdf-generator.ts` — remove gallery page rendering, change section
  rendering to pass `images[1]` and `images[2]` (not `images[0]`) as data URIs.
- `apps/web/src/components/pdf/PdfSectionPage.tsx` — rewrite layout (or rename to
  `PdfServicePage.tsx` for clarity).
- `apps/web/src/components/pdf/PdfGalleryPage.tsx` — can be deleted or left as dead code
  (delete preferred).

**Image pre-loading pattern (already established):**
```ts
const img1DataUri = section.images[1] ? await loadImageAsDataUri(section.images[1].src) : null;
const img2DataUri = section.images[2] ? await loadImageAsDataUri(section.images[2].src) : null;
```
The `loadImageAsDataUri` helper already exists in `pdf-generator.ts`.

**Styling constraint:** All styles must be inline `React.CSSProperties` — no CSS files,
no Tailwind classes. `html2canvas` only captures inline styles reliably.

**html2canvas colour constraint:** OKLCH CSS variables must be replaced with hex before
capture. The existing `injectColorOverrides()` function handles this; no new work needed.

**No new npm packages required.** `jspdf` and `html2canvas` are already installed.

---

## 8. Success Metrics

- PDF page count = `1 (cover) + N (services) + 1 (contact) + 1 (impressum)` where N is
  the number of enabled innovations.
- All service pages render without errors or blank image cells when at least 2 non-hero
  images exist in the data.
- Visual review: layout matches the ASCII wireframe above on a printed/viewed PDF.

---

## 9. Open Questions

- **Q1** — Should the capabilities list wrap to a second column if `subItems` is long
  (>8 items)? Default assumption: single column, truncate gracefully. *(owner: product)*
- **Q2** — Should the title bar background be pure black or a slightly lighter shade to
  differentiate it from the page body? Default: `#111111` title bar, `#0a0a0a` body.

---

## Implementation

### Pre-flight Requirements

None — no new packages required. `jspdf` and `html2canvas` are already installed.

No new environment variables required.

---

### Relevant Files

- `apps/web/src/lib/pdf-generator.ts` — orchestrates page rendering; gallery pages removed, image loading updated to use `images[1]`/`images[2]`
- `apps/web/src/components/pdf/PdfSectionPage.tsx` — rewritten with new two-column layout (title bar + text left / images right)
- ~~`apps/web/src/components/pdf/PdfGalleryPage.tsx`~~ — deleted

### Notes

- No test runner configured. Validate by running `pnpm dev`, clicking Export PDF, and
  visually inspecting the output.
- Keep the page container size at exactly **1122×794px** (landscape A4 at 96 DPI) — the
  generator relies on this for accurate `html2canvas` capture.
- All component styles must be inline `React.CSSProperties` — no Tailwind or external CSS.

### Tasks

- [x] 1.0 Rewrite `PdfSectionPage.tsx` with new two-column layout
  - [x] 1.1 Add a full-width title bar section at the top (gold text `#D4A843`, dark background `#111111`, ~36px font)
  - [x] 1.2 Create the two-column body: left 50% for text, right 50% for images; use `display: flex`, `flexDirection: row`
  - [x] 1.3 Left column: render `longDescription` at top (white, ~11px, line-height 1.6); render `subItems` list below with `›` bullets
  - [x] 1.4 Right column: top half renders image 1 (`img1DataUri` prop) in a fixed-height container using `objectFit: cover`; caption below in `#aaaaaa` ~9px
  - [x] 1.5 Right column: bottom half renders image 2 (`img2DataUri` prop) in the same pattern; caption below
  - [x] 1.6 Handle missing images: if `img1DataUri` or `img2DataUri` is null, render a dark placeholder rectangle (`background: #1a1a1a`)
  - [x] 1.7 Remove the stats box (`metric`/`metricLabel`/`secondary`) from the component — no longer needed
  - [x] 1.8 Remove the background image overlay that was on the old section page
  - [x] 1.9 Ensure the root container is exactly `1122px × 794px` with `overflow: hidden`

- [x] 2.0 Update `pdf-generator.ts` to load `images[1]` and `images[2]`
  - [x] 2.1 In the section rendering loop, load `section.images[1]` as a data URI (use existing `loadImageAsDataUri`); store as `img1DataUri`
  - [x] 2.2 Load `section.images[2]` as a data URI the same way; store as `img2DataUri`
  - [x] 2.3 Pass `img1DataUri`, `img1Caption` (`section.images[1]?.caption ?? ''`), `img2DataUri`, `img2Caption` as props to the updated `PdfSectionPage` component
  - [x] 2.4 Remove all gallery page rendering code from the generator (the `PdfGalleryPage` import and the loop that renders gallery pages)
  - [x] 2.5 Remove the `images[0]` background data URI loading for section pages (no longer needed)

- [x] 3.0 Clean up `PdfGalleryPage.tsx`
  - [x] 3.1 Delete `apps/web/src/components/pdf/PdfGalleryPage.tsx`
  - [x] 3.2 Remove the import of `PdfGalleryPage` from `pdf-generator.ts`

- [ ] 4.0 Type-check and smoke-test
  - [x] 4.1 Run `pnpm type-check` — resolve any TypeScript errors from prop changes
  - [ ] 4.2 Run the dev server (`pnpm dev`) and trigger Export PDF — confirm no runtime errors in console
  - [ ] 4.3 Open the downloaded PDF and verify: correct page count, two-column layout on service pages, images visible with captions, no gallery pages

### Progress Log

| Date | Task | Notes |
|------|------|-------|
| 2026-03-17 | 1.1–1.9 | Rewrote PdfSectionPage with title bar + two-column layout (text left, images right) |
| 2026-03-17 | 2.1–2.5 | Updated pdf-generator: loads images[1]/images[2], removed gallery page loop |
| 2026-03-17 | 3.1–3.2 | Deleted PdfGalleryPage.tsx, removed import |
| 2026-03-17 | 4.1 | pnpm type-check passes clean |
