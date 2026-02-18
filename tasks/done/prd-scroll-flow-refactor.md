# PRD: Scroll Flow Refactor — Full-Screen Service Sections

## 1. Introduction / Overview

The CES portfolio homepage currently scrolls from Hero → Services Card Grid → Gallery → Stats → CTA. This PRD refactors the scroll flow into a cinematic, vertical-slideshow experience where each of the 6 engineering services gets its own full-screen, video-backed section.

**New scroll order:**

```
Hero → Services Overview (pinned text) → 6 Full-Screen Services (pin+scrub+crossfade)
→ Projects (4 items) → Services Card Grid (placeholder) → ContactCta → Footer
```

The existing interactive card grid is preserved but relocated to the end of the page and labeled as a placeholder for management review.

## 2. Goals

| # | Goal | Measurable |
|---|------|-----------|
| G1 | Create an immersive "vertical slideshow" scroll experience for the 6 services | Each service occupies 100vh with pinned scroll and video background |
| G2 | Reuse existing JSON data from `packages/content/data/services/*.json` | All 6 JSON files drive the full-screen sections (title, description, stats, sub-services, links, video) |
| G3 | Maintain mobile performance budgets (LCP < 2.5s, JS < 150KB initial) | Pin+scrub on desktop only (lg+); mobile gets simple fade-in 100vh sections |
| G4 | Smooth crossfade transitions between service sections | Services blend from one to the next via opacity transitions on both content and video |
| G5 | Preserve the existing card grid as a placeholder section | Card grid moves to after Projects, labeled "PLACEHOLDER" visually |

## 3. User Stories

- **US1:** As a **sales engineer**, I want to scroll through each service as a full-screen cinematic presentation so that I can show clients our capabilities one-by-one in meetings.
- **US2:** As a **mobile user**, I want the service sections to load fast and scroll smoothly so that I don't experience jank or long load times on a phone.
- **US3:** As a **desktop visitor**, I want smooth pin-and-scrub transitions between services so that the site feels polished and professional.
- **US4:** As a **marketing manager**, I want the placeholder card grid preserved at the bottom so that I can compare it against the new full-screen layouts and provide feedback.
- **US5:** As a **content editor**, I want the full-screen sections populated from the same JSON files as the cards so that I only update content in one place.

## 4. Functional Requirements

### 4.1 Page Section Order

| # | Requirement |
|---|-------------|
| FR1 | The page renders sections in this exact order: **Header → Hero → Services Overview → Service 1 → Service 2 → Service 3 → Service 4 → Service 5 → Service 6 → Projects → Card Grid (placeholder) → ContactCta → Footer** |
| FR2 | The **Stats section is removed** from the page flow (stats are now displayed within each full-screen service section) |

### 4.2 Services Overview Section (Pinned Text Reveal)

| # | Requirement |
|---|-------------|
| FR3 | A new section appears after the Hero containing the heading "Comprehensive Solutions for Sustainable Infrastructure" and the intro paragraph |
| FR4 | On desktop (lg+, ≥1024px): The section **pins** to the viewport. Text animates in (fade + vertical slide, or GSAP SplitText character reveal). After the animation completes, the section **unpins** and releases into the first service section |
| FR5 | On mobile/tablet: The section is a simple block (no pinning). Text fades in via Motion `whileInView` |
| FR6 | The pinned scroll distance should be approximately **50vh** (enough to read but not tediously long) |

### 4.3 Full-Screen Service Sections (Pin + Scrub + Crossfade)

| # | Requirement |
|---|-------------|
| FR7 | There are exactly **6 full-screen service sections**, one per `ServiceCategory` from the JSON data, rendered in the same order as the `services` array |
| FR8 | Each section occupies **100vh** (full viewport height) |
| FR9 | **Desktop (lg+):** Each section uses GSAP ScrollTrigger with `pin: true` and `scrub: true`. As the user scrolls, content animates in (fade + slide). When the scrub completes, the current section crossfades out and the next section crossfades in |
| FR10 | **Crossfade implementation:** The 6 services are stacked in a single pinned container. Scroll progress (0–1 across 6 segments) controls which service is visible. At each transition point, the outgoing service's opacity goes from 1→0 while the incoming goes 0→1. Video backgrounds crossfade simultaneously |
| FR11 | **Mobile/tablet (<1024px):** No pinning. Each service is a regular `min-h-screen` section. Content fades in via Motion `whileInView`. Video plays inline as a background (muted, autoplay, playsinline) |
| FR12 | Each full-screen service section displays these fields from the JSON: **title**, **titleDe** (as a subtle subtitle), **longDescription**, **sub-services list** (all items, not truncated), **stats** (metric, metricLabel, secondary), and **links** (if present) |
| FR13 | The **video background** for each service uses the `video` object from JSON: WebM for Chrome/Firefox, MP4 fallback for Safari, `poster` as the initial frame. On mobile, use `mp4Mobile` |
| FR14 | A dark overlay sits between the video and the text content for readability. Use `bg-black/60` or similar — tune for legibility |
| FR15 | **`prefers-reduced-motion`:** If enabled, disable pinning, disable scrub, disable crossfade. Show sections as simple stacked blocks with no animation |
| FR16 | The `icon` field from JSON should be displayed in each full-screen section (reuse the existing `ServiceIcon` component) |

### 4.4 Projects Section

| # | Requirement |
|---|-------------|
| FR17 | The Projects section renders **exactly 4 project cards** from the existing Gallery placeholder data |
| FR18 | Layout: 2×2 grid on desktop, single column on mobile |
| FR19 | Keep existing Motion `whileInView` fade-in animations from the current Gallery component |
| FR20 | Add a "View All Projects" link/button below the grid (can be a placeholder `href="#"` for now) |

### 4.5 Card Grid Section (Placeholder)

| # | Requirement |
|---|-------------|
| FR21 | The existing `ServicesSection` component (with `ServicesGrid` and `ServiceCard`) is moved to appear **after** the Projects section |
| FR22 | Add a visible **"PLACEHOLDER"** label — a banner/badge above the section heading. Suggested: `<div className="bg-yellow-500/20 text-yellow-400 text-sm font-mono px-4 py-2 rounded mb-4">PLACEHOLDER — Section under review by management</div>` |
| FR23 | The expand/collapse interaction is **preserved** as-is |
| FR24 | The section no longer includes the "Engineering Services / Comprehensive Solutions..." heading (that text now lives in the Services Overview section at FR3) |

### 4.6 Scroll & Animation Integration

| # | Requirement |
|---|-------------|
| FR25 | Lenis smooth scroll continues to operate as-is (desktop ≥1024px only) and must sync with the new GSAP ScrollTrigger pins |
| FR26 | Use `ScrollTrigger.matchMedia()` to separate desktop (pin+scrub) from mobile (no pin) behavior |
| FR27 | All GSAP animations use the `useGSAP()` hook from `@gsap/react` for proper cleanup |
| FR28 | Total pinned scroll distance for the 6 services should be approximately **600vh** (100vh per service × 6). This is the scrub range the user scrolls through while the container is pinned |
| FR29 | Lazy-load video elements — only load the video `<source>` for the currently visible service and its immediate neighbors (prev/next). Use `IntersectionObserver` or GSAP's `onEnter`/`onLeave` callbacks |

## 5. Non-Goals / Out of Scope

| # | Non-Goal |
|---|----------|
| NG1 | **Real project data** — Projects section uses existing placeholder data. Real content is a separate task |
| NG2 | **Service detail pages** — The full-screen sections do not link to dedicated `/services/[slug]` pages yet |
| NG3 | **Horizontal scroll or carousel** — No horizontal scrolling on any breakpoint |
| NG4 | **CMS integration** — Content stays in JSON files. No headless CMS in this scope |
| NG5 | **Contact form** — The CTA section keeps its current placeholder. Form implementation is separate |
| NG6 | **New video assets** — Reuse existing video paths from JSON. Placeholder/hero videos are fine where service-specific videos don't exist yet |
| NG7 | **Refactoring the old `Services.tsx`** — The file at `components/sections/Services.tsx` (the one I was mistakenly editing) can be deleted or ignored. The real components are `ServicesSection.tsx`, `ServicesGrid.tsx`, `ServiceCard.tsx` |

## 6. Design Considerations

### Layout Structure (Desktop, lg+)

```
┌─────────────────────────────────┐
│           HERO (100vh)          │  ← existing, unchanged
├─────────────────────────────────┤
│    SERVICES OVERVIEW (pinned)   │  ← new: heading + intro text, pin ~50vh
│    "Comprehensive Solutions..." │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   PINNED SERVICE CONTAINER│  │  ← 100vh pinned container
│  │                           │  │     user scrolls through 600vh
│  │   ┌─ Service 1 (active) ─┐│  │     of scrub distance
│  │   │  [video bg]           ││  │
│  │   │  [dark overlay]       ││  │     crossfade: opacity 1→0
│  │   │  [title, desc, stats] ││  │     while next goes 0→1
│  │   └───────────────────────┘│  │
│  │                           │  │
│  │   Service 2..6 (stacked,  │  │
│  │   opacity: 0, waiting)    │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│     PROJECTS (4 cards, 2×2)     │  ← simplified Gallery
├─────────────────────────────────┤
│   CARD GRID [PLACEHOLDER]       │  ← existing ServicesSection, relocated
├─────────────────────────────────┤
│          CONTACT CTA            │  ← existing, unchanged
├─────────────────────────────────┤
│            FOOTER               │  ← existing, unchanged
└─────────────────────────────────┘
```

### Content Layout Within Each Full-Screen Service

```
┌──────────────────────────────────────────┐
│  [VIDEO BACKGROUND — full bleed]         │
│  [DARK OVERLAY — bg-black/60]            │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  [ServiceIcon]                   │    │
│  │  Title (text-4xl/5xl, white)     │    │
│  │  TitleDe (text-lg, white/50)     │    │
│  │                                  │    │
│  │  ┌─────────┬──────────┬───────┐  │    │
│  │  │Long     │Sub-      │Stats  │  │    │
│  │  │Descrip- │services  │       │  │    │
│  │  │tion     │list      │Metric │  │    │
│  │  │         │          │Label  │  │    │
│  │  │         │          │       │  │    │
│  │  │         │          │Links  │  │    │
│  │  └─────────┴──────────┴───────┘  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [Progress indicator: dots or bar]       │
└──────────────────────────────────────────┘
```

### Visual Design Notes

- **Progress indicator:** A row of 6 dots (or a thin progress bar) fixed at the bottom of the pinned container showing which service is active. Active dot uses `brand-gold`, inactive uses `white/30`
- **Typography:** Service title should be large and bold (`text-4xl lg:text-5xl`). German subtitle (`titleDe`) is a muted, smaller line for visual texture
- **Content grid:** 3-column on desktop (description | sub-services | stats+links), 1-column stacked on mobile
- **Video:** Muted, autoplay, loop, playsinline. Poster image shown until video loads

### Color Palette (from globals.css)

- Gold accents: `oklch(0.75 0.12 85)` / `text-gold`
- Backgrounds: `bg-black` / `bg-black/60` overlay
- Text: `text-white`, `text-white/70` for secondary

## 7. Technical Considerations

### Component Architecture

```
app/page.tsx (Server Component)
├── Header
├── Hero                              ← existing, "use client"
├── ServicesOverview                   ← NEW, "use client" (GSAP pin)
├── ServicesShowcase                   ← NEW, "use client" (GSAP pin+scrub)
│   ├── ServiceSlide × 6              ← NEW, renders one full-screen service
│   └── ServiceProgressDots           ← NEW, shows active service indicator
├── ProjectsPreview                   ← NEW (simplified Gallery, 4 items)
├── ServicesSection [PLACEHOLDER]     ← MOVED from position 2 → here
│   └── ServicesGrid → ServiceCard    ← existing, unchanged
├── ContactCta                        ← existing, unchanged
└── Footer
```

### Key Implementation Details

1. **Single pinned container for all 6 services (FR10):** Don't create 6 separate pinned sections (that causes scroll-jacking issues). Instead, create ONE container that pins for 600vh of scroll. Use scroll progress (0–1) to determine which service is active:
   - Progress 0.000–0.167: Service 1
   - Progress 0.167–0.333: Service 2
   - Progress 0.333–0.500: Service 3
   - Progress 0.500–0.667: Service 4
   - Progress 0.667–0.833: Service 5
   - Progress 0.833–1.000: Service 6

2. **Crossfade math:** Within each segment, use a sub-progress (0–1) to animate:
   - 0.0–0.7: Content is fully visible (opacity 1)
   - 0.7–1.0: Crossfade — current fades out, next fades in

3. **Video lazy loading (FR29):** Set `<video preload="none">` by default. When a service becomes active (or adjacent), set `preload="auto"` and call `.play()`. When 2+ services away, call `.pause()` and reset.

4. **GSAP ScrollTrigger setup pattern:**
   ```
   ScrollTrigger.matchMedia({
     "(min-width: 1024px)": () => {
       // Pin container, scrub through 600vh, crossfade logic
     },
     "(max-width: 1023px)": () => {
       // No pin. Each ServiceSlide gets a simple whileInView fade
     }
   });
   ```

5. **File cleanup:** Delete or deprecate `apps/web/src/components/sections/Services.tsx` (the old placeholder file). The real components live in `services/` subdirectory.

### Performance

- **Video preloading:** Only the active service + neighbors load video. This prevents loading 6 videos simultaneously
- **Mobile:** No Lenis, no pinning, no GSAP scrub. Motion `whileInView` only. Videos use `mp4Mobile` variant (smaller file)
- **Poster images:** Every video has a `poster` for instant visual while video buffers
- **Bundle:** GSAP + ScrollTrigger are already in the bundle. No new dependencies required

### Files to Create

| File | Type | Purpose |
|------|------|---------|
| `components/sections/ServicesOverview.tsx` | `"use client"` | Pinned heading + intro text reveal |
| `components/sections/services/ServicesShowcase.tsx` | `"use client"` | Pinned container for 6 full-screen services, GSAP scrub |
| `components/sections/services/ServiceSlide.tsx` | component | Single full-screen service layout (video + content) |
| `components/sections/services/ServiceProgressDots.tsx` | component | 6-dot progress indicator |
| `components/sections/ProjectsPreview.tsx` | component | Simplified Gallery showing 4 projects |

### Files to Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Reorder sections: insert ServicesOverview + ServicesShowcase after Hero, move ServicesSection after ProjectsPreview, remove Stats import |
| `ServicesSection.tsx` | Add PLACEHOLDER banner, remove heading text (moved to ServicesOverview) |
| `Gallery.tsx` | Either refactor into ProjectsPreview or keep and limit to 4 items |

### Files to Delete

| File | Reason |
|------|--------|
| `components/sections/Services.tsx` | Old placeholder, superseded by ServicesSection.tsx + new showcase components |
| `components/sections/Stats.tsx` | Stats are now embedded within each service slide (optional — could keep for reuse) |

## 8. Success Metrics

| # | Metric | Target |
|---|--------|--------|
| SM1 | All 6 services render as full-screen pinned sections on desktop | Visual verification |
| SM2 | Crossfade transitions are smooth (no flicker, no layout shift) | 60fps during transitions |
| SM3 | Mobile: sections scroll naturally with fade-in, no pinning | Test on iPhone Safari, Android Chrome |
| SM4 | LCP remains < 2.5s on mobile | Lighthouse audit |
| SM5 | Initial JS bundle stays < 150KB | Build output check |
| SM6 | `prefers-reduced-motion` disables all pinning and crossfade | Test with OS setting enabled |
| SM7 | Video loads lazily (only active + neighbors) | Network tab verification |
| SM8 | Placeholder card grid appears at bottom with visible label | Visual verification |

## 9. Open Questions

| # | Question | Impact |
|---|----------|--------|
| OQ1 | Should the progress dots be clickable (jump to a service) or purely visual? | Affects whether dots need click handlers + `scrollTo` |
| OQ2 | Should service sections have a subtle parallax effect on the video (slight zoom/pan while scrolling)? | More cinematic but adds complexity |
| OQ3 | What should happen to the Stats section (`Stats.tsx`)? Delete entirely, or keep the component for potential reuse elsewhere? | File cleanup scope |
| OQ4 | Should there be a "Skip to Projects" link visible during the pinned service scroll for users who don't want to scroll through all 6? | Accessibility / UX consideration |
| OQ5 | Real video assets — who is responsible for creating service-specific videos? Most services currently point to `hero-bg` video as placeholder | Content dependency |
