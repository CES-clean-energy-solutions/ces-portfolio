# PRD: CES Innovation Section

**Status:** Draft
**Date:** 2026-02-18
**Author:** Claude Code

---

## 1. Introduction / Overview

CES has a distinct technical capability set — computational simulation, building modeling, climate analysis, green finance — that differs from its core engineering services and deserves its own visual identity on the site.

This feature adds a **CES Innovation** section to the homepage, positioned immediately after the Hero and before the ServicesOverview section. It uses the same scroll mechanic as the existing ServicesShowcase (pinned full-screen, horizontal GSAP scroll on desktop; stacked full-screen panels on mobile) and the same data architecture (folder-based JSON in `packages/content`).

Each of the four innovation areas is presented as a full-screen slide with: a branded title, video background, image/GIF media cards, description text, stats chips, sub-items list, and optional links.

---

## 2. Goals

1. **Brand differentiation** — communicate CES's computational and analytical capabilities as a separate, premium offering from standard engineering services.
2. **Structural parity with services** — reuse the established scroll pattern and data architecture so future developers can reason about the codebase consistently.
3. **Asset-ready from day one** — placeholder assets allow the section to ship `true` in feature flags immediately; real video/images drop in without code changes.
4. **Mobile performance** — section respects the site's < 500 KB initial page weight budget; videos are not auto-loaded on mobile.

---

## 3. User Stories

1. **As a sales engineer** presenting to a client, I want to scroll through CES Innovation slides so that I can visually introduce each analytical capability without leaving the main site.

2. **As a prospective client** viewing the site on a phone, I want each innovation area to be clearly readable as a stacked panel so that I can understand CES's capabilities even without the full desktop experience.

3. **As a developer** adding a fifth innovation area in future, I want to drop a new folder into `packages/content/data/innovation/` so that it appears automatically without touching component code.

4. **As a developer** replacing placeholder video with real assets, I want to swap a file path in a JSON file so that the update requires no component changes.

---

## 4. Functional Requirements

### 4.1 Page Position

**FR-1:** The CES Innovation section must be rendered in `page.tsx` immediately after `<Hero />` and before `<ServicesOverview />`.

**FR-2:** A feature flag `innovationShowcase: true` must be added to `apps/web/src/config/features.ts`. The section is visible by default.

---

### 4.2 Data Architecture (`packages/content`)

**FR-3:** Create `packages/content/data/innovation.ts` as the data loader. It must mirror the pattern in `packages/content/data/services.ts`: auto-discover subdirectories in `packages/content/data/innovation/`, read a single `.json` file per folder, resolve relative asset paths to public-servable URLs.

**FR-4:** Define the following TypeScript types in `innovation.ts`:

```ts
export interface InnovationSubItem {
  label: string;
  slug: string;
}

export interface InnovationLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface InnovationImage {
  src: string;        // resolved to /content/innovation/{id}/{filename}
  alt: string;
  animated?: boolean; // true for animated GIFs — disables lazy decode
}

export interface InnovationArea {
  id: string;
  slug: string;
  order: number;        // manual display order (1-based); loader sorts ascending
  title: string;        // e.g. "Building Innovation Modeling"
  shortDescription: string;
  longDescription: string;
  subItems: InnovationSubItem[];
  stats: {
    metric: string;
    metricLabel: string;
    secondary: string;
  };
  links?: InnovationLink[];
  video: {
    webm: string;
    mp4: string;
    mp4Mobile: string;
    poster: string;
    placeholder?: string; // low-res LQIP for initial paint
  };
  images: InnovationImage[]; // 0–N supplementary images/GIFs shown as media cards
}
```

**FR-5:** Asset path resolution must handle both `video` fields (same as services) AND `images[].src` fields. Relative paths (`./filename.gif`) must be resolved to `/content/innovation/{id}/filename.gif`.

**FR-6:** Export `innovations: InnovationArea[]` and `getInnovationById(id)` / `getInnovationBySlug(slug)` from `innovation.ts`. Export path must be `@ces/content/data/innovation` (matching the services pattern). The loader must sort the loaded array by `area.order` ascending before returning — folder discovery order (alphabetical) must be ignored.

**FR-7:** Create the four starter JSON files in the following folders. Each must be valid against the `InnovationArea` type. Placeholder values are acceptable for all fields:

| Folder | `id` | `title` |
|---|---|---|
| `packages/content/data/innovation/building-innovation-modeling/` | `building-innovation-modeling` | `Building Innovation Modeling` |
| `packages/content/data/innovation/climate-analysis/` | `climate-analysis` | `Climate Analysis` |
| `packages/content/data/innovation/computational-simulations/` | `computational-simulations` | `Computational Simulations` |
| `packages/content/data/innovation/green-finance/` | `green-finance` | `Green Finance` |

**FR-8:** Each starter JSON must use the following shared placeholder video paths until real assets are produced:
```json
"video": {
  "webm": "/content/services/research-development/research-development-video.webm",
  "mp4": "",
  "mp4Mobile": "",
  "poster": ""
}
```
Each starter JSON must also include one `images` entry with an empty `src` (`""`) so the array field is present and typed correctly from day one. The component must silently skip rendering any image card where `src` is an empty string.

---

### 4.3 Section Title Format

**FR-9:** Each slide's title must render in two parts:

```
CES Innovation  [ces-chevron.svg]  {area.title}
```

- `CES Innovation` — fixed label, muted/secondary colour
- `ces-chevron.svg` from `@repo/ui/assets/ces-chevron.svg` — rendered as an `<img>` or inline SVG at a fixed size (e.g. `h-5 w-auto`), gold colour preserved
- `{area.title}` — the innovation area name, primary/white colour, larger weight

**FR-10:** The title must be a single semantic heading element (e.g. `<h2>`) containing all three parts inline.

---

### 4.4 Scroll Behaviour (Desktop ≥ 1024px)

**FR-11:** The section must use GSAP ScrollTrigger with a pinned container, identical in mechanic to `ServicesShowcase.tsx`:
- The section container is pinned while the user scrolls
- The inner track of slides translates horizontally as scroll progresses
- One slide per innovation area; 4 slides total
- Scrub ratio and ease must match `ServicesShowcase` for visual consistency

**FR-12:** The section must use `useGSAP()` from `@gsap/react` (not `useEffect`) and must clean up via the returned context. GSAP plugins used must be registered with `gsap.registerPlugin()` inside the hook.

---

### 4.5 Mobile Behaviour (< 1024px)

**FR-13:** On mobile/tablet, the section must render as vertically stacked full-screen panels — no horizontal scroll, no GSAP pinning. Each panel fades in on scroll (Motion or simple GSAP opacity trigger).

**FR-14:** Video must NOT autoplay or preload on mobile (`preload="none"` on `<video>` elements). The `mp4Mobile` field exists for a lower-bitrate mobile variant when assets are ready.

---

### 4.6 Media Cards (Images and GIFs)

**FR-15:** Each slide must display `area.images` as a set of media cards overlaid or alongside the main video background. If `images` is empty, no card area is rendered.

**FR-16:** Images with `animated: true` must NOT use `loading="lazy"` or `decoding="async"` on the underlying `<img>` — these attributes interfere with GIF animation start. Use `loading="eager"` for animated assets.

**FR-17:** Media cards must be visually consistent with the style of the service card media area — dark background, rounded corners, subtle border.

---

### 4.7 Video Background

**FR-18:** The video background mechanic must be identical to `ServiceSlide.tsx`: `<video>` with `autoPlay muted loop playsInline`, showing `poster` image until video loads.

**FR-19:** When `video.webm` or `video.mp4` is an empty string (placeholder state), the component must render only the `poster` image (or a solid dark placeholder `div`) without attempting to create a `<source>` element with an empty `src`.

---

### 4.8 Feature Flag

**FR-20:** Add `innovationShowcase: boolean` to the `Features` interface in `apps/web/src/config/features.ts`.

**FR-21:** Default value: `true`.

**FR-22:** Wrap the section render in `page.tsx` with `{features.innovationShowcase && <InnovationShowcase innovations={innovations} />}`.

---

## 5. Non-Goals / Out of Scope

- **Individual detail pages** for each innovation area (e.g. `/innovation/climate-analysis`) — homepage section only.
- **CMS or non-developer content editing** — JSON files in git, developer workflow only.
- **Search / filtering** of innovation areas — 4 items, no filter needed.
- **Animation differences** from ServicesShowcase — the scroll mechanic is intentionally identical; no new animation patterns.
- **Internationalisation** — English only; no `titleDe` field required (unlike services).
- **Analytics events** per slide — Plausible is already configured; no innovation-specific events in scope.
- **Modifying ServicesShowcase** — that component is unchanged.

---

## 6. Design Considerations

**DC-1: Title hierarchy.** "CES Innovation" + chevron + area name must visually read as one compound heading. `CES Innovation` should be noticeably smaller/lighter than the area name so the area name is the focal point. Suggested: `CES Innovation` in `text-sm font-normal text-white/50`, chevron at `h-4`, area title in `text-4xl font-bold text-white`.

**DC-2: Chevron colour.** `ces-chevron.svg` uses the gold fill (`#f8c802`) natively. Do not apply Tailwind colour filters to it — let the SVG colour stand.

**DC-3: Placeholder state.** When video is empty, render a dark gradient placeholder (`bg-gradient-to-br from-zinc-900 to-zinc-800`) so the slide doesn't look broken during development.

**DC-4: Media card layout.** Cards are rendered **inside the slide**, overlaid on the video background. Aim for 2–3 cards per slide at most on desktop. Cards must not obscure the primary title or description. Suggested layout: text content anchored to the bottom-left of the slide; media cards positioned in the right half, vertically centred, with semi-transparent dark backing so they read against any video content.

**DC-5: Consistency with ServicesShowcase.** Font sizes, spacing, and the overall dark aesthetic must match the services slides so both sections feel like one design system.

---

## 7. Technical Considerations

**TC-1: Component file locations.** New components live at:
```
apps/web/src/components/sections/innovation/
  InnovationShowcase.tsx   ← main section (mirrors ServicesShowcase.tsx)
  InnovationSlide.tsx      ← single slide (mirrors ServiceSlide.tsx)
  InnovationMediaCard.tsx  ← new: image/GIF card component
```

**TC-2: Data import.** `InnovationShowcase` receives `innovations: InnovationArea[]` as a prop, loaded server-side in `page.tsx` via `import { innovations } from "@ces/content/data/innovation"`. This keeps the component free of direct filesystem imports and testable in isolation.

**TC-3: `packages/content` package exports.** The `@ces/content` package exports data via path aliases. Verify that `packages/content/package.json` includes an `exports` entry for `./data/innovation` (mirroring the `./data/services` entry).

**TC-4: Lenis / smooth scroll.** The existing `SmoothScroll.tsx` wrapper initialises Lenis at layout level and syncs with ScrollTrigger. No changes to that integration are needed — `InnovationShowcase` will benefit from Lenis automatically.

**TC-5: `"use client"` boundary.** `InnovationShowcase.tsx` must be a Client Component (`"use client"`) because it uses GSAP hooks. `page.tsx` remains a Server Component — it only passes serialisable `InnovationArea[]` props.

**TC-6: GSAP ScrollTrigger cleanup.** The `useGSAP` context must be scoped to the section container ref so ScrollTrigger instances are killed when the component unmounts. Pattern to follow is exactly `ServicesShowcase.tsx` lines using `scope` option.

**TC-7: Image optimisation.** For non-GIF images, use `next/image` with appropriate `sizes` prop. For animated GIFs, use a plain `<img>` tag (next/image does not support animated GIFs). The `animated` boolean on `InnovationImage` signals which tag to use.

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Section renders on homepage with `innovationShowcase: true` | Yes |
| All 4 innovation areas display with correct titles | Yes |
| Desktop horizontal scroll works (pinned, scrubbed) | Yes |
| Mobile shows stacked panels, no horizontal scroll | Yes |
| Video placeholder state (empty src) renders without console errors | Yes |
| Adding a 5th JSON folder auto-adds a 5th slide with no component changes | Yes |
| `InnovationArea` TypeScript type errors on malformed JSON | Yes |
| Feature flag `false` removes section from DOM entirely | Yes |
| LCP impact on mobile < 100ms additional vs baseline | Yes |

---

## 9. Open Questions

| # | Question | Status |
|---|---|---|
| 1 | What is the canonical display order of the 4 areas? Alphabetical by folder name (current default) or manually specified via an `order` field in JSON? | **Resolved: manual `order` field in JSON, loader sorts ascending** |
| 2 | Should `images` cards appear inside the slide (overlaid on video) or as a separate visual strip? The layout is TBD pending real asset arrival. | **Resolved: inside the slide, overlaid on video, positioned right half** |
| 3 | Is there a `titleDe` (German title) needed for CES Innovation areas to match the `ServiceCategory` schema? | **Resolved: no — `InnovationArea` is English-only, no `titleDe` field** |
| 4 | Should innovation areas link to dedicated sub-pages in a future sprint? If so, `slug` should be reserved now (it is). | Open |
| 5 | What placeholder video/poster should ship with the starter JSON — a shared `placeholder.webm` in `/public/`, or empty strings with CSS fallback? | **Resolved: reuse existing `/content/services/research-development/research-development-video.webm` as placeholder for all four starter JSONs** |
