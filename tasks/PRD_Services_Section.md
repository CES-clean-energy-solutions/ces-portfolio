# PRD: Services Section -- Expandable Service Cards

**Feature**: Services overview with animated, inline-expandable cards  
**Version**: 0.1 (Draft)  
**Date**: 2026-02-12  
**Status**: Implementation-ready  
**Depends on**: Hero section complete, base layout with SmoothScroll provider active

---

## 1. Goal

Present the six core CES engineering service areas as interactive cards that invite exploration without requiring page navigation. Each card must work as a self-contained unit -- collapsed for scanning, expanded for detail -- so a sales engineer in the field can walk a client through CES capabilities without leaving the page.

The section sits between the Hero/Introduction and the Portfolio on the main marketing page.

---

## 2. Service Taxonomy

Derived from the reference deck (pages 9--10, 13--14), the six top-level categories and their sub-services:

| # | Service | Sub-services |
|---|---------|-------------|
| 1 | Energy Efficiency & Management | Industrial Facilities, Electrical Systems, Buildings & Urban Infrastructure, Airports |
| 2 | Renewable Energy | Photovoltaics, Solar Thermal, Geothermal, Wind & Hydropower, Biogas/Biomass/Biofuel |
| 3 | Plant Engineering | District Heating & Cooling, Industrial Facilities, Utilities Supply/Discharge, Cogeneration/Trigeneration, Sewage Treatment Plants |
| 4 | Innovative Building Technology | Passive House, Autarch Energy Systems, Building Management Systems, BIM |
| 5 | Research & Development | Urban AI, Circularity & Bio Economy, Storage Technologies, Carbon Capture, EU & International Grants |
| 6 | Sustainability & Green Finance | LEED/BREEAM/Estidama/DGNB Certification, ESIA, Nature-Based Solutions, IFI Grant Applications, Compliance & Reporting |

Note: Category 6 merges the "Sustainability" (page 13) and "International Financing" (page 14) themes from the deck since they form a single value proposition for clients.

---

## 3. Data Model

### 3.1 Type Definition

```typescript
// data/services.ts
export interface SubService {
  label: string;
  slug: string; // for future dedicated sub-service pages
}

export interface ServiceLink {
  label: string; // e.g. "Detail Page", "Live Demo", "Interactive Model"
  href: string; // internal route or external URL
  external?: boolean; // true for external URLs (opens in new tab)
}

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  titleDe: string; // German subtitle for visual texture
  icon: string; // reference to SVG component name
  shortDescription: string; // 1 sentence, visible in collapsed state on desktop
  longDescription: string; // 2-3 sentences, visible in expanded state
  subServices: SubService[];
  stats: {
    metric: string; // e.g. "120+"
    metricLabel: string; // e.g. "projects"
    secondary: string; // e.g. "40% avg. energy reduction"
  };
  relatedProjectSlugs: string[]; // links to portfolio items
  links?: ServiceLink[]; // optional array of related pages/demos
}
```

### 3.2 Storage

JSON/TS file in the monorepo at `packages/content/data/services.ts`. Typed, co-located with the project data. No CMS needed at this stage.

The `relatedProjectSlugs` array connects services to portfolio items, enabling the "View Projects" CTA in the expanded card to filter the Portfolio section (or link to `/projects?service=renewable-energy`).

---

## 4. Component Architecture

### 4.1 File Structure

```
apps/web/src/
├── components/
│   └── sections/
│       └── services/
│           ├── ServicesSection.tsx        # Server Component (section wrapper)
│           ├── ServicesGrid.tsx           # "use client" -- state + animation logic
│           ├── ServiceCard.tsx            # "use client" -- individual card
│           ├── ServiceIcon.tsx            # Server Component -- SVG icon switcher
│           └── service-icons/
│               ├── EnergyEfficiencyIcon.tsx
│               ├── RenewableEnergyIcon.tsx
│               ├── PlantEngineeringIcon.tsx
│               ├── InnovativeBuildingIcon.tsx
│               ├── ResearchIcon.tsx
│               └── GreenFinanceIcon.tsx
```

### 4.2 Server vs Client Boundary

```
ServicesSection.tsx (Server Component)
  ├── Section header (h2, intro paragraph) -- pure HTML, zero JS
  └── ServicesGrid.tsx ("use client")
        └── ServiceCard.tsx ("use client") × 6
              └── ServiceIcon.tsx (Server Component, passed as children)
```

The `"use client"` boundary is at `ServicesGrid` because it owns the `expandedId` state. The icons are SVGs that can be server-rendered. The section header is purely static.

### 4.3 Key Component Contracts

**ServicesSection** (Server Component):
```tsx
// Imports data, renders section shell, passes to client grid
import { services } from "@ces/content/data/services";
import { ServicesGrid } from "./ServicesGrid";

export function ServicesSection() {
  return (
    <section id="services" className="relative py-20 sm:py-28 lg:py-36">
      {/* Section header -- server rendered, zero JS */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-16 sm:mb-20">
        <p className="text-label text-gold/50">Engineering Services</p>
        <h2 className="text-heading-2">...</h2>
        <p className="mt-5 max-w-xl text-body-secondary">...</p>
      </div>
      <ServicesGrid services={services} />
    </section>
  );
}
```

**ServicesGrid** (Client Component -- owns expand state):
```tsx
"use client";
import { useState, useCallback } from "react";
import { ServiceCard } from "./ServiceCard";
import type { ServiceCategory } from "@ces/content/data/services";

export function ServicesGrid({ services }: { services: ServiceCategory[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            isExpanded={expandedId === service.id}
            onToggle={() => handleToggle(service.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Interaction Pattern: Inline Expansion

### 5.1 The Problem

The presentation deck (page 10) shows a dense diagram with 30+ sub-services radiating outward. That works in a slide but is overwhelming on a webpage. We need progressive disclosure: show 6 clean cards, let the user expand one at a time to see detail.

### 5.2 Expansion Mechanics: GSAP Flip

Use GSAP `Flip` plugin to capture card positions before state change, apply the layout change, then animate from old positions to new positions. This produces a cinematic visual result where cards physically rearrange themselves to make space for the expanded card.

**How it works:**

1. User clicks a card
2. GSAP captures current positions/sizes of all `.service-card` elements
3. React state updates → card expands to full width, other cards reflow
4. GSAP animates all cards from their old positions to new positions

**Implementation:**

```tsx
// ServicesGrid.tsx
"use client";
import { useState, useCallback, useRef, useLayoutEffect } from "react";
import { Flip } from "gsap/Flip";
import gsap from "gsap";

gsap.registerPlugin(Flip);

export function ServicesGrid({ services }: { services: ServiceCategory[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const previousExpandedRef = useRef<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    if (!gridRef.current) return;

    // Capture state BEFORE React updates
    const state = Flip.getState(".service-card", { props: "transform,opacity" });

    // Update React state
    setExpandedId(prev => prev === id ? null : id);

    // Animate to new layout after React renders
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.04,
        absolute: true, // use position: absolute during animation
        scale: true,
        onEnter: elements => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: 0.3 }),
        onLeave: elements => gsap.to(elements, { opacity: 0, duration: 0.3 }),
      });
    });
  }, []);

  return (
    <div ref={gridRef} className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            isExpanded={expandedId === service.id}
            onToggle={() => handleToggle(service.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
```

**Why GSAP Flip:**

- **Smooth layout transitions**: Cards don't just pop into new positions, they slide/scale smoothly
- **Automatic calculation**: GSAP handles all the position math, works with any CSS layout (grid, flexbox)
- **Stagger support**: Cards animate in sequence (0.04s offset), not all at once
- **Mobile-friendly**: On single-column mobile, Flip still works (just vertical repositioning)
- **Absolute positioning during animation**: Flip temporarily uses `position: absolute` to move cards, then restores normal flow — prevents layout jank

**Grid layout behavior:**

The expanded card changes from `col-span-1` to `col-span-1 sm:col-span-2 lg:col-span-3` (full row width on desktop). When a card expands, CSS Grid reflows all subsequent cards below it. GSAP Flip captures the before/after positions and smoothly animates the transition.

### 5.3 Expand/Collapse Animation

Use **Motion** (`motion/react`) for the expand/collapse since it is a declarative state-driven animation on a React component. This follows the technical brief rule: "GSAP for scroll-driven, Motion for state-driven."

```tsx
import { motion, AnimatePresence } from "motion/react";

// Inside ServiceCard:
<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      key="expanded-content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.3, delay: 0.1 },
      }}
      className="overflow-hidden"
    >
      {/* Expanded content: description, sub-services, stats, CTA */}
    </motion.div>
  )}
</AnimatePresence>
```

Motion handles `height: "auto"` measurement automatically -- no manual `scrollHeight` calculation needed.

### 5.4 Mobile Behaviour

On mobile (single column), expansion is simpler: the card just grows taller in the vertical stack. No column spanning needed, no reflow of siblings. The expanded content is the same but stacked vertically rather than in a 3-column sub-grid.

---

## 6. Animated Icons

### 6.1 Approach

All six icons use the **CES chevron mark** as their base motif, rendered in **brand gold** (`oklch(0.75 0.12 85)` / `#D4A843`). Each icon adapts the chevron shape to represent its service -- the chevron becomes sun rays, a roofline, an upward arrow, etc. This keeps the icon set immediately recognisable as CES branding while giving each service a distinct identity.

Each icon is a custom SVG (~64x64 viewBox) with two visual states: dormant (collapsed card) and active (expanded card). The transition is driven by a single `active` boolean prop. Lightweight inline SVGs, not Lottie -- SSR-compatible, infinitely scalable, zero network cost.

### 6.2 Chevron Variants per Service

| Service | Chevron Adaptation | Dormant State | Active State |
|---------|-------------------|--------------|--------------|
| Energy Efficiency | Chevron as energy bolt / meter arrow | Muted gold stroke, static | Pulse rings radiate outward, chevron fills solid gold |
| Renewable Energy | Chevron repeated as sun rays radiating from center | Muted stroke, rays short | Rays extend outward, outer ring spins (CSS animation) |
| Plant Engineering | Chevron as rising steam / flow indicator | Muted stroke, static | Chevrons float upward in sequence (CSS keyframes) |
| Innovative Building | Chevron as building roofline / structural peak | Muted stroke, grid lines | Grid lines illuminate, chevron fills gold |
| R&D | Chevrons as orbital paths around a center node | Muted stroke, static orbits | Orbits rotate at different speeds, node pulses |
| Green Finance | Chevron as upward growth arrow / leaf vein | Muted stroke, static | Growth dots cascade upward along chevron path |

### 6.3 Animation Implementation

Use CSS animations (keyframes) within the SVG for continuous effects (spinning, floating, pulsing). Use inline `style` transitions for the dormant-to-active state change. This keeps the icons as pure Server Components that receive their `active` state as a prop -- no `"use client"` needed on the icons themselves.

```tsx
// ServiceIcon.tsx (Server Component)
export function ServiceIcon({ iconId, active }: { iconId: string; active: boolean }) {
  switch (iconId) {
    case "energy-efficiency": return <EnergyEfficiencyIcon active={active} />;
    // ... etc
  }
}
```

The `active` prop flows from the Client Component parent (ServiceCard) into the Server Component child. This is fine because the icon is rendered by the client boundary's render tree.

**Correction**: Since `active` changes dynamically on the client, the icon components will actually be rendered within the `"use client"` boundary of `ServiceCard`. They do not need their own `"use client"` directive, but they execute on the client. Keep them as plain function components (no hooks, no state) for simplicity.

### 6.4 prefers-reduced-motion

All CSS keyframe animations must respect the reduced motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  .service-icon * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Or via Tailwind v4: wrap animated elements with `motion-safe:animate-...` utilities.

---

## 7. Video Backgrounds on Expanded Cards

### 7.1 Concept

When a card expands, a slow-motion, low-resolution ambient video fills the card background behind the text content. This transforms the cards from static information panels into immersive micro-experiences -- a wind turbine slowly turning for Renewable Energy, cooling towers venting for Plant Engineering, a BIM model rotating for Innovative Building Technology.

The videos are atmospheric texture, not content. They run muted, looped, slowed down, with a dark overlay so text remains readable. Think: the background ambience of an Apple product page, not a YouTube embed.

### 7.2 Video Asset Pipeline (ffmpeg)

Each service needs four output assets derived from a single source video (10-30s of stock or custom footage):

| Asset | Format | Resolution | Use case |
|-------|--------|-----------|----------|
| `{service}-bg.webm` | VP9 WebM | 960x540 | Desktop/tablet background (primary) |
| `{service}-bg.mp4` | H.264 MP4 | 960x540 | Desktop/tablet Safari/iOS fallback |
| `{service}-bg-mobile.mp4` | H.264 MP4 | 480x270 | Phone background (all mobile browsers support H.264) |
| `{service}-poster.jpg` | JPEG | 960x540 | Preload poster for all viewports |

Video plays on all viewports -- desktop, tablet, and phone. The mobile variant is a smaller encode (270p, lower bitrate) to keep file size under 500 KB for the 15-second loop. At 270p behind a dark overlay on a 6-inch screen, the quality difference is invisible. WebM is skipped for mobile since H.264 has universal hardware decode support on phones (better battery life).

### 7.3 ffmpeg Conversion Commands

Create a `scripts/video-process.sh` in the monorepo root:

```bash
#!/bin/bash
# Usage: ./scripts/video-process.sh input.mp4 output-name
# Example: ./scripts/video-process.sh raw/wind-turbine.mp4 renewable-energy

INPUT=$1
NAME=$2
OUTDIR="apps/web/public/video/services"

mkdir -p $OUTDIR

# --- Step 1: Slow motion (0.5x speed) ---
# setpts=2.0 doubles frame duration = half speed
# Use minterpolate for frame interpolation (smoother slow-mo)
SLOWED="/tmp/${NAME}-slowed.mp4"
ffmpeg -i "$INPUT" \
  -filter:v "setpts=2.0*PTS,minterpolate='mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:fps=24'" \
  -an \
  "$SLOWED"

# --- Step 2: WebM (VP9) -- primary format ---
# CRF 35 = visually acceptable for background, tiny file
# -speed 2 = good quality/speed tradeoff for encoding
ffmpeg -i "$SLOWED" \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -c:v libvpx-vp9 \
  -crf 35 -b:v 0 \
  -speed 2 \
  -an \
  -t 15 \
  "${OUTDIR}/${NAME}-bg.webm"

# --- Step 3: MP4 (H.264) -- Safari/iOS fallback ---
# CRF 28 = comparable visual quality to VP9 CRF 35
ffmpeg -i "$SLOWED" \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -profile:v main \
  -movflags +faststart \
  -an \
  -t 15 \
  "${OUTDIR}/${NAME}-bg.mp4"

# --- Step 4: Poster image (JPEG) ---
# Extract frame at 2s mark, quality 85
ffmpeg -i "$SLOWED" \
  -ss 2 \
  -frames:v 1 \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -q:v 2 \
  "${OUTDIR}/${NAME}-poster.jpg"

# --- Step 5: Mobile MP4 (H.264, 270p, very low bitrate) ---
# Tiny encode for phone backgrounds. H.264 only -- universal HW decode on mobile.
ffmpeg -i "$SLOWED" \
  -vf "scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:-1:-1:color=black" \
  -c:v libx264 \
  -preset slow \
  -crf 30 \
  -profile:v baseline \
  -level 3.0 \
  -movflags +faststart \
  -an \
  -t 15 \
  "${OUTDIR}/${NAME}-bg-mobile.mp4"

# --- Step 6: Tiny placeholder for blur-up (optional) ---
# 32px wide, heavily compressed, inline as base64
ffmpeg -i "$SLOWED" \
  -ss 2 \
  -frames:v 1 \
  -vf "scale=32:-1" \
  -q:v 8 \
  "${OUTDIR}/${NAME}-placeholder.jpg"

echo "Done: ${OUTDIR}/${NAME}-bg.webm, .mp4, -poster.jpg, -placeholder.jpg"

# Cleanup
rm "$SLOWED"
```

**Key encoding decisions:**

- **Slow motion via `setpts=2.0*PTS`**: Doubles each frame's presentation timestamp, halving playback speed. The `minterpolate` filter generates intermediate frames so it doesn't look stuttery. For simpler/faster encoding, drop `minterpolate` and just use `setpts` -- the background blur will hide frame repetition.
- **VP9 CRF 35**: Aggressive compression that looks fine under a dark overlay. Typical output: 500KB-1.5MB for 15 seconds at 540p. WebM has better compression than H.264 at equivalent quality.
- **H.264 with `-movflags +faststart`**: Moves the moov atom to the start of the file so playback begins before full download. Critical for perceived performance.
- **15 second trim (`-t 15`)**: No need for longer loops in a background. Shorter = smaller = faster load.
- **No audio (`-an`)**: Strip audio track entirely. Saves bytes, prevents accidental sound.

### 7.4 Recommended File Size Targets

Guidelines, not hard limits. The dark overlay and blur treatment forgive aggressive compression -- adjust CRF values based on actual footage.

| Asset | Recommended target | Notes |
|-------|-------------------|-------|
| WebM (VP9, 15s, 540p, CRF 35) | ~500 KB - 1.5 MB | Desktop/tablet primary |
| MP4 (H.264, 15s, 540p, CRF 28) | ~800 KB - 2.5 MB | Desktop/tablet fallback (Safari) |
| MP4 Mobile (H.264, 15s, 270p, CRF 30) | ~200 KB - 500 KB | Phone -- all browsers |
| Poster JPG | ~30 - 60 KB | Preload poster |
| Placeholder JPG (32px) | < 1 KB | Base64 inline for blur-up |

Only one card is expanded at a time, so only one video is ever in flight. Footage with lots of motion (particle sims, turbine blades) compresses worse than slow pans -- bump CRF down a notch if it looks too blocky.

### 7.5 Data Model Extension

Add video fields to the `ServiceCategory` type:

```typescript
export interface ServiceCategory {
  // ... existing fields from Section 3 ...
  video: {
    webm: string;    // "/video/services/renewable-energy-bg.webm"
    mp4: string;     // "/video/services/renewable-energy-bg.mp4"
    mp4Mobile: string; // "/video/services/renewable-energy-bg-mobile.mp4"
    poster: string;  // "/video/services/renewable-energy-poster.jpg"
    placeholder?: string; // base64 data URI for blur-up
  };
}
```

### 7.6 Component Implementation

The video element lives inside `ServiceCard.tsx`, rendered only when expanded. It sits behind the content with absolute positioning and a dark overlay.

```tsx
// Inside ServiceCard expanded content:
<div className="relative overflow-hidden rounded-lg">
  {/* Video background -- desktop/tablet only */}
  {isExpanded && (
    <ServiceVideo
      video={service.video}
      isActive={isExpanded}
    />
  )}

  {/* Dark overlay for text readability */}
  <div className="absolute inset-0 bg-black/60 z-[1]" />

  {/* Content on top */}
  <div className="relative z-[2]">
    {/* ... description, sub-services, stats, CTA ... */}
  </div>
</div>
```

**ServiceVideo component:**

```tsx
"use client";
import { useRef, useEffect, useState } from "react";

interface ServiceVideoProps {
  video: { webm: string; mp4: string; mp4Mobile: string; poster: string };
  isActive: boolean;
}

export function ServiceVideo({ video, isActive }: ServiceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  // Respect reduced motion -- poster only
  if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return (
      <img
        src={video.poster}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    );
  }

  // Video plays on ALL viewports -- source selection adapts
  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster={video.poster}
    >
      {isMobile ? (
        // Phone: small H.264 only (universal HW decode, best battery)
        <source src={video.mp4Mobile} type="video/mp4" />
      ) : (
        // Desktop/tablet: WebM primary, MP4 fallback
        <>
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </>
      )}
    </video>
  );
}
```

**Key implementation details:**

- **Video on all viewports**: No more desktop-only gating. Every device gets the ambient video experience when a card expands.
- **Adaptive source selection**: Phones get the 270p H.264 encode (~200-500 KB), desktops/tablets get the 540p WebM or H.264 (~500 KB-2.5 MB). The `isMobile` check swaps the `<source>` elements, not the entire `<video>`.
- **H.264 baseline profile for mobile**: The mobile encode uses `-profile:v baseline -level 3.0` which guarantees hardware decode on every phone back to iPhone 5 and Android 4.x. Hardware decode = minimal battery impact.
- **`preload="none"`**: The video does not download until the card is expanded. No bandwidth wasted.
- **`playsInline`**: Required for iOS. Without it, iOS opens video in fullscreen player.
- **`prefers-reduced-motion`**: Users with reduced motion enabled get a static poster image instead. This is the only case where video is suppressed.
- **Play/pause lifecycle**: `.play()` on expand, `.pause()` + reset on collapse. The `.catch(() => {})` handles the rare autoplay rejection gracefully (falls back to poster).
- **Source order**: WebM first on desktop (smaller, better compression), MP4 as fallback. Phone gets only the mobile MP4.

### 7.7 Suggested Video Content per Service

| Service | Video concept | Source suggestion |
|---------|--------------|-------------------|
| Energy Efficiency | Slow aerial of industrial facility, thermal imaging overlay | Stock: Pexels/Pixabay (free) or Artgrid |
| Renewable Energy | Wind turbine blades turning slowly, or solar panel field with moving clouds | Stock: abundant free options |
| Plant Engineering | Steam/vapor rising from cooling infrastructure, pipes with flowing indicators | Stock or CES site visit footage |
| Innovative Building | BIM model rotation (screen capture from Revit/Navisworks), or smart building timelapse | CES internal -- screen record a BIM walkthrough |
| R&D | Abstract data visualization, particle simulation, or lab environment | Stock or generated (After Effects / Cavalry) |
| Green Finance | Nature timelapse (forest, water), transitioning to urban green architecture | Stock: nature timelapses are abundant |

The BIM model rotation for Innovative Building is particularly strong -- it directly showcases CES's core competency and no stock footage can replicate it. A 30-second screen recording from a real project, slowed to 0.5x and processed through the pipeline, would be unique and compelling.

### 7.8 Performance Guardrails

- **Only one video plays at a time**: Since only one card is expanded at a time (Section 5.2), only one video is ever loaded/playing.
- **Adaptive source selection**: Phones download the 270p encode (~300 KB), desktops/tablets get 540p (~1 MB). The bandwidth cost is proportional to the screen size that benefits from it.
- **Lazy load via conditional render**: The `<video>` element only enters the DOM when `isExpanded` is true. No hidden downloads.
- **Pause on collapse**: Explicit `.pause()` and `currentTime = 0` reset ensures no background CPU/GPU usage from invisible videos.
- **`prefers-reduced-motion`**: The only case where video is suppressed entirely -- show poster image instead (all viewports).
- **H.264 baseline on mobile**: Guarantees hardware decode = minimal battery impact. VP9 software decode on older phones would drain battery, which is why the mobile variant is H.264-only.
- **S3/CloudFront delivery**: Video files in `public/video/` are deployed as static assets to S3 with CloudFront edge caching. Set `Cache-Control: public, max-age=31536000, immutable` via SST's asset configuration since the filenames are stable.

---

## 8. Expanded Card Content Layout

When a card expands to full width (lg:col-span-3), the expanded content uses a 3-column sub-grid:

```
┌─────────────────────────────────────────────────────┐
│ [Icon] Title / German subtitle          [× close]   │  ← always visible
├─────────────────────────────────────────────────────┤
│  Description      │  Sub-services    │  Stats        │  ← expanded only
│  (2-3 sentences)  │  (bullet list)   │  (metric +    │
│                   │                  │   CTA button)  │
└─────────────────────────────────────────────────────┘
```

On mobile, this collapses to a single column stack: Description → Sub-services → Stats/CTA.

### 8.1 Tailwind Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  <div className="sm:col-span-2 lg:col-span-1">
    {/* Long description */}
  </div>
  <div>
    {/* Sub-services list */}
  </div>
  <div>
    {/* Stats + "View Projects →" CTA */}
  </div>
</div>
```

### 8.2 "View Projects" CTA

The CTA at the bottom-right of the expanded card links to the Portfolio section with a filter applied. Two implementation options:

**Option A -- Anchor link + URL param**: `href="/portfolio?service=renewable-energy"` or `href="#portfolio?service=renewable-energy"` with smooth scroll. The Portfolio section reads the param and pre-filters.

**Option B -- Shared state via context or URL hash**: A `useServiceFilter` hook in a context provider that both the Services section and Portfolio section subscribe to. Clicking "View Projects" scrolls to the Portfolio section and applies the filter.

Recommendation: Option A for simplicity. The Portfolio section parses `searchParams` on load.

### 8.3 Service Links (Detail Pages & External Demos)

Each service can optionally have multiple links to related content — internal detail pages (part of the monorepo), external resources (marimo notebooks, hosted tools), or demo applications. These links appear in the expanded card state only, alongside the "View Projects" CTA.

**Data model** (already updated in Section 3.1):

```typescript
export interface ServiceLink {
  label: string; // e.g. "Detail Page", "Live Demo", "Interactive Model"
  href: string; // internal route (/services/renewable-energy) or external URL
  external?: boolean; // true for external URLs (opens in new tab)
}

// ServiceCategory interface includes:
links?: ServiceLink[]; // optional array
```

**UI placement:**

Links appear in the Stats column of the expanded card, below the metric display and above or alongside the "View Projects" button. If a service has multiple links, they stack vertically with 8-12px spacing.

**Visual treatment:**

- **Internal links**: Standard link style with arrow icon (`→`), same-tab navigation
- **External links**: Subtle external icon (`↗`), `target="_blank" rel="noopener noreferrer"`, distinct color treatment (e.g., gold accent)
- **Link list**: If 2+ links, render as a vertical button group or stacked link list with icons

**Implementation:**

```tsx
// In ServiceCard.tsx expanded content, Stats column:
{service.links && service.links.length > 0 && (
  <div className="mt-4 flex flex-col gap-2">
    {service.links.map((link, idx) => (
      <a
        key={idx}
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        className={cn(
          "inline-flex items-center gap-2 text-sm font-medium transition-colors",
          link.external
            ? "text-gold hover:text-gold/80" // external = gold
            : "text-white/90 hover:text-white" // internal = white
        )}
      >
        {link.label}
        {link.external ? (
          <ExternalLinkIcon className="w-4 h-4" />
        ) : (
          <ArrowRightIcon className="w-4 h-4" />
        )}
      </a>
    ))}
  </div>
)}
```

**Use cases:**

| Service | Example links |
|---------|--------------|
| Energy Efficiency | `{ label: "Methodology", href: "/services/energy-efficiency", external: false }` |
| Renewable Energy | `{ label: "Solar Calculator", href: "https://solar-calc.ces.engineering", external: true }` |
| Innovative Building | `{ label: "BIM Demo", href: "/demos/bim-viewer", external: false }` (marimo notebook via Next.js rewrite) |
| R&D | `{ label: "Urban AI Notebook", href: "https://marimo.ces.engineering/urban-ai", external: true }` |

**Monorepo integration:**

- **Internal pages** (`/services/{slug}`): Create Next.js routes at `apps/web/src/app/services/[slug]/page.tsx`. These are part of the same deployment.
- **Marimo notebooks**: Two options:
  1. **Proxied via Next.js rewrite**: Run marimo server separately, add rewrite in `next.config.ts` to proxy `/demos/*` to marimo's localhost. Links use `/demos/notebook-name`.
  2. **Separate subdomain**: Deploy marimo to `marimo.ces.engineering` (separate SST stack or EC2 instance). Links use `https://marimo.ces.engineering/notebook-name`.

  Recommendation: Start with Next.js rewrite for dev, move to subdomain for production (cleaner separation, independent scaling).

**Optional vs Required:**

Links are **optional per service**. The `links` field can be `undefined` or an empty array if a service has no detail page or demo yet. This allows incremental rollout — launch the Services section with basic cards, add detail pages and demos over time as they're developed.

**Accessibility:**

- External link icon must have `aria-label="Opens in new tab"` or similar
- Links must be keyboard-accessible (already true for `<a>` tags)
- Link text should be descriptive ("Live Demo", not "Click here")

---

## 9. Scroll-triggered Entrance Animation

The service cards should fade/slide into view as the user scrolls to the section. This is a scroll-triggered animation, so per the technical brief rule, use **GSAP ScrollTrigger** (not Motion `whileInView`).

However, given that the cards are individual React components with client state, and the entrance animation is a simple staggered fade-in (not a complex timeline), **Motion `whileInView`** is the pragmatic choice here. Reserve GSAP ScrollTrigger for the section heading or more complex orchestration.

```tsx
// In ServicesGrid.tsx
import { motion } from "motion/react";

// Wrap each card:
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
>
  <ServiceCard ... />
</motion.div>
```

### 9.1 Adaptive Animation (per technical brief)

| Viewport | Entrance animation |
|----------|-------------------|
| Desktop (lg+) | Full stagger (0.08s per card), y: 24px slide-up |
| Tablet (md) | Reduced stagger (0.05s), y: 16px |
| Phone | Simple opacity fade, no stagger, no y-offset |

Implement via a `useReducedAnimations` hook that checks `prefers-reduced-motion` and viewport width, then adjusts the Motion transition props.

---

## 10. Performance Considerations

### 10.1 Bundle Impact

The Services section is a `"use client"` subtree. Its JS cost:

| Dependency | Approx. gzipped size | Notes |
|-----------|----------------------|-------|
| Motion (AnimatePresence + whileInView) | ~15 KB | Tree-shakeable, only import what is used |
| GSAP (Flip plugin) | ~8 KB | For layout transitions |
| React state (useState, useCallback) | 0 KB | Already in React bundle |
| SVG icons (6 inline) | ~3 KB total | No network requests |

Total incremental JS for this section: ~26 KB gzipped (GSAP + Motion). Well within the 150 KB initial budget from the technical brief since both libraries are likely already loaded for other sections. Video assets (500KB-1.5MB per service) are not part of the JS bundle -- they load on-demand only when a card is expanded (see Section 7.8).

### 10.2 Lazy Loading

If the Services section is below the fold (likely, after a full-viewport Hero), the entire `ServicesGrid` client component can be dynamically imported:

```tsx
import dynamic from "next/dynamic";
const ServicesGrid = dynamic(() =>
  import("./ServicesGrid").then(m => m.ServicesGrid),
  { ssr: true } // still SSR the HTML, just defer hydration
);
```

This defers the Motion + GSAP JS until the section is close to the viewport.

### 10.3 No Layout Shift

All cards have a fixed minimum height in collapsed state (enforced via `min-h-[180px]` or similar). The grid dimensions are deterministic from the SSR-rendered HTML. No CLS.

---

## 11. Accessibility

| Requirement | Implementation |
|------------|----------------|
| Keyboard navigation | Cards are `<button>` or have `role="button"` + `tabIndex={0}` + `onKeyDown` (Enter/Space) |
| ARIA expanded state | `aria-expanded={isExpanded}` on the card trigger |
| ARIA controls | `aria-controls="service-detail-{id}"` pointing to the expanded content `id` |
| Focus management | On expand, focus moves to the expanded content region |
| Reduced motion | All animations respect `prefers-reduced-motion` (instant state change, no transitions) |
| Screen reader | Expanded content is in the DOM (not display:none) but uses `aria-hidden` when collapsed, or rendered conditionally via AnimatePresence |
| Touch targets | Card click area is the full card surface (min 44px height). Close button (if separate) is min 44x44px |

---

## 12. Open Questions

1. ~~**Icon style**~~: **DECIDED** -- Use the CES chevron mark as the base motif across all 6 icons, in brand gold (`oklch(0.75 0.12 85)` / `#D4A843`). Each service icon derives from or incorporates the chevron shape (e.g. chevron as sun rays for Renewable Energy, chevron as building roofline for Innovative Building, chevron as upward growth arrow for Green Finance). This keeps the icon set visually cohesive, brand-aligned, and instantly recognisable as CES. The chevron animates between dormant (muted stroke, static) and active (gold fill, animated variant per service) states.

2. **Expanded card position**: Should the expanded card reorder itself to the top of the grid (CSS `order: -1`) or expand in-place? In-place is simpler and less disorienting. Top-reorder avoids the gap problem but requires GSAP Flip for smooth visual transition.

3. **Service detail pages**: Do we eventually want `/services/renewable-energy` as a dedicated page? If yes, the expanded card should include a "Learn more" link in addition to "View Projects". The data model already supports this via `slug`.

4. **German content**: The `titleDe` field is currently used for visual texture (small secondary label). Should the full description also be bilingual? If yes, add `longDescriptionDe` to the data model.

---

## 13. Implementation Sequence

1. **Data**: Create `packages/content/data/services.ts` with all 6 service objects (incl. video paths), typed
2. **Video pipeline**: Set up `scripts/video-process.sh`, source 6 ambient videos, run through pipeline to generate webm/mp4/poster/placeholder per service
3. **Icons**: Build 6 SVG icon components with dormant/active states (CSS transitions + keyframes)
4. **Card component**: `ServiceCard.tsx` with collapsed layout, Motion expand/collapse, `ServiceVideo` component
5. **Grid component**: `ServicesGrid.tsx` with state management, responsive grid
6. **Section wrapper**: `ServicesSection.tsx` as Server Component shell
7. **Entrance animation**: Add `whileInView` stagger to grid items
8. **Portfolio link**: Wire up "View Projects" CTA to portfolio filter (depends on Portfolio section PRD)
9. **Polish**: GSAP Flip for layout transitions (v2), icon animation refinement, a11y audit, video content review
