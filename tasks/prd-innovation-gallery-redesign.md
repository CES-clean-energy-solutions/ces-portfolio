# PRD: Innovation Section — Image Gallery Redesign

**Feature:** Thumbnails + Hero layout with captions and lightbox
**Status:** Draft
**Date:** 2026-02-18

---

## 1. Introduction / Overview

### Problem

The current Innovation slide right column renders up to 3 stacked `InnovationMediaCard` instances. Each card contains a fixed-height image (400×280px) plus a caption strip (~40px). With 3 cards this is already ~960px tall — taller than most viewport heights — and captions are squeezed. The CFD section now has 4 images; the 4th is silently dropped by a `slice(0, 3)` call and never shown.

### Goal

Replace the stacked card list with a **hero + thumbnail strip** pattern: one large image dominates the right column, a row of small thumbnails below lets the user navigate to any image, and a caption strip under the hero always shows the current image's description. A lightbox opens on hero click for full-screen detail.

This directly supports the primary use case: **a sales engineer showing simulation output to a client on an iPad in a meeting room** — they need to cycle quickly through technical images, read the caption without tapping anything, and zoom into detail on demand.

---

## 2. Goals

| # | Goal | Measurement |
|---|------|-------------|
| G1 | All images in a section are reachable | No image is truncated or hidden; `slice()` removed |
| G2 | Caption always visible without interaction | Caption renders below hero on every viewport ≥ 1024px |
| G3 | Single hero image visible on mobile | Phones (< 1024px) render the first image below the text block |
| G4 | Smooth image transition | Cross-fade < 200 ms, no layout shift (CLS = 0) |
| G5 | Lightbox on hero click | Hero click opens full-screen overlay; Escape / click-outside closes it |
| G6 | No vertical overflow | Right column fits within the slide viewport height on a 1024px screen |

---

## 3. User Stories

**US1** — As a sales engineer presenting on an iPad, I want to tap a thumbnail to swap the hero image so that I can quickly show the client the most relevant simulation result without scrolling.

**US2** — As a sales engineer, I want to read the image caption without tapping anything so that I can narrate the image confidently while the client reads along.

**US3** — As a sales engineer, I want to tap the hero image to open it fullscreen so that the client can see fine detail in a CFD heatmap or streamline plot.

**US4** — As a developer adding a new innovation section with 1 image, I want the thumbnail strip to disappear automatically so that I don't need to handle it in code.

**US5** — As a mobile user viewing the site on a phone, I want to see the first image of each section below the text content so that the section doesn't feel image-free.

---

## 4. Functional Requirements

### 4.1 Hero Image

**FR-01** The right column SHALL display a single "hero" image at a time.
**FR-02** The hero image SHALL use `next/image` with `object-cover` and a fixed aspect ratio of `16/9`.
**FR-03** For animated GIFs (`image.animated === true`), the hero SHALL use a plain `<img>` tag instead of `next/image` to preserve animation.
**FR-04** The hero image SHALL have a `cursor-pointer` style and a `title="Click to enlarge"` tooltip.
**FR-05** Clicking the hero SHALL open the lightbox (see §4.4).
**FR-06** When the active image changes, the hero SHALL cross-fade to the new image. The fade duration SHALL be 200 ms using Motion's `AnimatePresence` + `motion.div` with `opacity` variants.
**FR-07** During the cross-fade, the hero container dimensions SHALL NOT change (no layout shift). Implement by absolutely positioning the outgoing and incoming images inside a fixed-size container.

### 4.2 Caption Strip

**FR-08** Below the hero image, a caption strip SHALL always render the `caption` field of the currently active image.
**FR-09** If the active image has no `caption` (empty string or undefined), the strip SHALL be hidden (not an empty box).
**FR-10** Caption text style: `text-xs text-white/70 leading-snug`, consistent with the existing `InnovationMediaCard` caption style.
**FR-11** The caption strip SHALL have a minimum height that prevents layout shift when switching between images with and without captions. Use `min-h-[2.5rem]` (enough for two lines at `text-xs`).

### 4.3 Thumbnail Strip

**FR-12** When `visibleImages.length > 1`, a row of thumbnail images SHALL render below the caption strip.
**FR-13** When `visibleImages.length === 1`, the thumbnail strip SHALL NOT render.
**FR-14** Each thumbnail SHALL be a fixed size of `80×56px` (aspect ratio `16/9`), `object-cover`, `rounded`.
**FR-15** The active thumbnail SHALL render at full opacity (`opacity-100`).
**FR-16** Inactive thumbnails SHALL render at `opacity-40`.
**FR-17** Clicking a thumbnail SHALL set that image as active.
**FR-18** Thumbnails SHALL be keyboard-accessible: each thumbnail is a `<button>` with `aria-label="View image N"` and `aria-pressed` reflecting the active state.
**FR-19** The thumbnail strip SHALL be a horizontally scrolling flex row (`flex flex-row gap-2 overflow-x-auto`) to handle sections with many images without wrapping.

### 4.4 Lightbox

**FR-20** Clicking the hero SHALL open a full-screen modal overlay (`fixed inset-0 z-50`).
**FR-21** The overlay background SHALL be `bg-black/90`.
**FR-22** The lightbox SHALL display the full image using `next/image` with `fill` + `object-contain` (or plain `<img>` for GIFs).
**FR-23** The lightbox SHALL display the image caption below the image using `text-sm text-white/80`.
**FR-24** The lightbox SHALL close on: clicking the overlay background, pressing `Escape`, or clicking a close `×` button in the top-right corner.
**FR-25** The lightbox close button SHALL be `44×44px` minimum (touch target requirement from CLAUDE.md).
**FR-26** The lightbox SHALL be implemented with **Radix UI Dialog** (`@radix-ui/react-dialog` is already available via shadcn/ui). Do NOT build a custom focus-trap or portal — use Radix.
**FR-27** While the lightbox is open, body scroll SHALL be locked (Radix Dialog handles this automatically).

### 4.5 Mobile Behaviour (< 1024px)

**FR-28** On screens narrower than `1024px` (`lg` breakpoint), the thumbnail strip and lightbox trigger SHALL be hidden.
**FR-29** On screens narrower than `1024px`, the **first image** of `visibleImages` SHALL render below the text content as a single hero with no thumbnails, no caption strip, no click-to-zoom. Use `aspect-video rounded-lg overflow-hidden`.
**FR-30** If `visibleImages.length === 0`, nothing renders on mobile.

### 4.6 Auto-Advance Timer

**FR-34** When `visibleImages.length > 1` and `isActive === true`, the gallery SHALL auto-advance to the next image every **8 seconds**.
**FR-35** When the active image is the last in the array, auto-advance SHALL loop back to the first image.
**FR-36** When the user clicks a thumbnail, the 8-second timer SHALL **reset** (restart from 0). Auto-advance resumes 8 seconds after the last interaction.
**FR-37** When `isActive` becomes `false` (slide leaves viewport), the timer SHALL be **cleared**. When `isActive` becomes `true` again, the timer SHALL restart and `activeIndex` SHALL reset to `0`.
**FR-38** The timer SHALL be implemented with `useEffect` + `setInterval`, cleaned up on unmount. The interval dependency array SHALL include `activeIndex` and `isActive` so the timer resets on every change.
**FR-39** A **progress bar** SHALL render directly below the active thumbnail, indicating time remaining before auto-advance.
**FR-40** The progress bar SHALL be `2px` tall, `bg-brand-gold`, positioned absolutely below the active thumbnail button.
**FR-41** The bar SHALL animate from `width: 0%` to `width: 100%` over 8 seconds using a CSS `transition: width 8s linear`. On image change (timer or click), the bar SHALL instantly reset to `width: 0%` (remove transition, set width to 0, force reflow, re-add transition).
**FR-42** When `visibleImages.length === 1` or `isActive === false`, the progress bar SHALL NOT render.

### 4.7 Edge Cases

**FR-31** If `image.src` is empty string, that image SHALL be excluded from `visibleImages` (existing behaviour, keep it).
**FR-32** If all images have empty `src`, the right column SHALL be empty / not rendered.
**FR-33** The component SHALL handle `visibleImages` of length 1, 2, 3, 4, or more without layout breakage.

---

## 5. Non-Goals / Out of Scope

- **No swipe gesture on mobile** — the single mobile hero is static; swipe-to-advance is a future enhancement.
- **No video in the gallery** — the video background is a separate `VideoBackground` component and is not part of this redesign.
- **No caption editing UI** — captions are JSON-managed; no CMS or inline editing.
- **No lazy-loading strategy change** — `next/image` handles lazy loading; this PRD does not change the `sizes` prop strategy.
- **No changes to the left column** — description, sub-items, stats, and links are out of scope.
- **No changes to the JSON data schema** — `images[]` array with `src`, `alt`, `caption`, `animated` fields is already correct.
- **No keyboard navigation between images** (arrow keys) — out of scope for this iteration.

---

## 6. Design Considerations

### Layout structure (right column, desktop)

```
┌─────────────────────────────────┐
│                                 │
│         HERO IMAGE              │  aspect-video, rounded-lg
│         (click to zoom)         │  overflow-hidden
│                                 │
├─────────────────────────────────┤
│ Caption text here, always       │  text-xs white/70, min-h-[2.5rem]
│ visible below the hero image    │
├─────────────────────────────────┤
│ [thumb1] [thumb2] [thumb3] [4]  │  80×56px, gap-2, overflow-x-auto
└─────────────────────────────────┘
```

### Thumbnail active state

- Active: `opacity-100 ring-1 ring-white/40` (subtle white ring to avoid gold overwhelming the dark UI)
- Inactive: `opacity-40`
- Hover: `opacity-70 transition-opacity`

### Color / brand alignment

- Use existing tokens only: `text-brand-gold`, `text-white`, `text-white/70`, `text-white/40`, `bg-black/40`, `border-white/10`
- No new colors introduced

---

## 7. Technical Considerations

### Files to modify

| File | Change |
|------|--------|
| `apps/web/src/components/sections/innovation/InnovationSlide.tsx` | Replace `InnovationMediaCard` usage in right column with new `InnovationGallery` component; add mobile single-hero block |
| `apps/web/src/components/sections/innovation/InnovationMediaCard.tsx` | Delete or repurpose — its responsibility is absorbed by `InnovationGallery` |
| `apps/web/src/components/sections/innovation/InnovationGallery.tsx` | **New file** — contains hero, caption, thumbnail strip, and lightbox |

### Component structure

```
InnovationGallery (new, "use client")
  ├── state: activeIndex (useState)
  ├── HeroImage          — Motion AnimatePresence cross-fade
  ├── CaptionStrip       — plain div, driven by activeIndex
  ├── ThumbnailStrip     — renders when images.length > 1
  └── ImageLightbox      — Radix Dialog, opens on hero click
```

### Animations

- Cross-fade: `AnimatePresence mode="wait"` from Motion (`motion` package). Key the `motion.div` by `activeIndex` so AnimatePresence treats each image change as an unmount/mount.
- No GSAP involvement — this is a component-level UI animation, not a scroll-driven one. Consistent with the animation architecture in CLAUDE.md.

### `next/image` for hero

```tsx
<Image
  src={image.src}
  alt={image.alt}
  fill
  className="object-cover"
  sizes="(max-width: 1024px) 100vw, 450px"
  priority={activeIndex === 0}
/>
```

Wrap in a `relative` container with explicit aspect ratio via Tailwind `aspect-video`.

### Lightbox `next/image`

```tsx
// Inside Radix Dialog Content
<div className="relative w-full max-w-4xl aspect-video">
  <Image src={image.src} alt={image.alt} fill className="object-contain" sizes="100vw" />
</div>
```

### Dependencies

No new packages needed. All required libraries are already installed:
- `motion` — already used on site for declarative animations
- `@radix-ui/react-dialog` — available via shadcn/ui
- `next/image` — Next.js built-in

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| All images reachable | 4/4 CFD images visible and selectable |
| No vertical overflow | Right column height ≤ viewport height on iPad (1024×768) |
| Caption always present | Every active image with a caption shows it without interaction |
| Lightbox opens/closes | Works on click, Escape, and overlay tap |
| Mobile single image | First image renders below text on 390px viewport |
| No CLS | Caption strip min-height prevents layout shift on image change |
| No new packages | Zero new `package.json` entries |

---

## 9. Open Questions

| # | Question | Owner |
|---|----------|-------|
| OQ1 | Should the lightbox include prev/next navigation arrows so the user can page through all images without closing it? Not in scope per §5, but likely needed soon. | Product |
| OQ2 | The thumbnail strip uses `overflow-x-auto` — on iOS Safari this may show a scrollbar. Should we use `scrollbar-hide` utility? | Dev |
| OQ3 | For sections with video backgrounds, the hero image sits on top of a moving video. Does a 16/9 hero feel too heavy visually? Should the hero have a semi-transparent overlay on the container? | Design |
| OQ4 | Should the `animated` GIF path apply to thumbnails as well, or should thumbnails always be static first-frame? | Dev |
