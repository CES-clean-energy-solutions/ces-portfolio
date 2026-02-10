# PRD: Scroll-Driven Animated Homepage Scaffold

## 1. Introduction / Overview

The CES marketing site currently has a bare placeholder homepage (a single `<h1>` on a black background). All animation libraries (GSAP, Motion, Lenis) are installed but not initialized. This PRD defines the **first implementation pass** of the homepage: a dark-themed, scroll-driven page with 5 content sections, placeholder content (gray boxes and lorem ipsum), and the full animation infrastructure wired up.

The goal is to build the **scroll mechanics and animation timing** — not final content. Think of it as the skeleton that content later hangs on. When this is done, you should be able to scroll through a visually distinct, smoothly animated page that demonstrates every animation pattern the final site will use.

### What "scroll-driven" means

Instead of a flat page where content is just stacked, certain sections respond to scroll position:
- Text reveals as you scroll into view (characters animate in one by one)
- A gallery section "pins" in place and scrolls horizontally as you scroll vertically
- Numbers count up when they enter the viewport
- The navigation bar hides when scrolling down and reappears when scrolling up
- On desktop, scroll feels buttery-smooth (Lenis library intercepting scroll events)

---

## 2. Goals

| # | Goal | Measurable criteria |
|---|------|-------------------|
| G1 | Initialize the animation infrastructure | Lenis smooth scroll active on desktop (≥1024px), disabled on mobile/tablet. GSAP ticker synced with Lenis. |
| G2 | Build 5 homepage sections with distinct animations | Hero, Services, Project Gallery, Stats, Contact CTA — each with working scroll-triggered animation. |
| G3 | Implement adaptive animation complexity | Desktop gets full animations, tablet gets simplified, mobile gets minimal (fade-in only). Verified with browser devtools responsive mode. |
| G4 | Respect accessibility | `prefers-reduced-motion` disables all animations. Touch targets ≥44x44px. |
| G5 | Stay within performance budgets | Initial JS bundle <150KB. No layout shift from animations (CLS <0.1). |
| G6 | Set up Inter font via next/font | Self-hosted, zero external requests, CSS variable `--font-inter` available. |
| G7 | Build a sticky hide-on-scroll navigation header | Logo placeholder + nav links. Hides on scroll-down, reveals on scroll-up. |

---

## 3. User Stories

**US1 — Desktop visitor:**
As a visitor on a laptop, I want to experience smooth scrolling and cinematic text reveals so that the site feels premium and engaging.

**US2 — Mobile sales engineer:**
As a sales engineer on an iPad, I want the page to scroll natively without jank so I can quickly show project references to a client.

**US3 — Accessibility user:**
As a user with `prefers-reduced-motion` enabled, I want all animations disabled so the page doesn't cause discomfort.

**US4 — Developer (future self):**
As a developer adding real content later, I want each section to be a self-contained component with clearly marked placeholder content so I can swap in real copy without touching animation logic.

---

## 4. Functional Requirements

### 4.1 — Animation Infrastructure (layout-level)

| # | Requirement |
|---|------------|
| FR1 | Create a `SmoothScroll` client component that initializes Lenis on desktop only (`min-width: 1024px`). On smaller viewports, it renders children without Lenis. |
| FR2 | Inside `SmoothScroll`, sync Lenis with GSAP's ticker: `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add((time) => lenis.raf(time * 1000))`. |
| FR3 | Register GSAP plugins globally once: `gsap.registerPlugin(ScrollTrigger, SplitText)`. Do this at module scope in `SmoothScroll`, not inside effects. |
| FR4 | Wrap `{children}` in `SmoothScroll` inside `layout.tsx`. The layout itself remains a Server Component — `SmoothScroll` is the `"use client"` boundary. |
| FR5 | When `prefers-reduced-motion: reduce` is active, skip Lenis initialization AND set `ScrollTrigger.config({ limitCallbacks: true })` or disable scroll-triggered animations entirely. |

### 4.2 — Font Setup

| # | Requirement |
|---|------------|
| FR6 | Configure Inter via `next/font/google` in a `fonts.ts` file. Export as a CSS variable `--font-inter`. |
| FR7 | Apply the font variable to `<html>` in `layout.tsx`. Register in `globals.css` inside `@theme inline` as `--font-sans: var(--font-inter)`. |
| FR8 | Set `font-family: var(--font-sans)` on `body` in `globals.css`. |

### 4.3 — Navigation Header

| # | Requirement |
|---|------------|
| FR9 | Create a `Header` client component. Fixed position, full-width, dark background (`bg-brand-black`), gold accent. Contains a text placeholder for logo (left) and 4-5 placeholder nav links (right). |
| FR10 | Use Motion's `useScroll` + `useMotionValueEvent` (or `useTransform`) to detect scroll direction. On scroll-down, translate the header upward out of view (`translateY: -100%`). On scroll-up, slide it back in. Transition duration ~300ms. |
| FR11 | Header should have `z-50` to stay above all content. Use a subtle border-bottom or backdrop-blur to distinguish from content beneath it. |
| FR12 | On mobile, nav links collapse — but for this pass, just hide them below `lg:` breakpoint. No hamburger menu yet. |

### 4.4 — Section 1: Hero

| # | Requirement |
|---|------------|
| FR13 | Full viewport height (`min-h-screen`). Dark background. Centered content block with: a large headline (placeholder text, e.g. "Engineering Tomorrow's Energy"), a subheadline (1 sentence of lorem), and a CTA button placeholder (gold background, black text). |
| FR14 | **Desktop animation:** Use GSAP `SplitText` to split the headline into characters. Animate characters in from below (`y: 80, opacity: 0`) with stagger (`0.03s`). Subheadline fades in after headline completes. CTA fades in last. This plays on page load, not scroll-triggered. |
| FR15 | **Tablet animation:** Split headline into words only (not characters). Simpler fade-up with shorter duration. |
| FR16 | **Mobile animation:** No SplitText. Simple opacity fade-in for the entire headline block. |
| FR17 | Use `ScrollTrigger.matchMedia()` to switch between desktop/tablet/mobile animation variants. |

### 4.5 — Section 2: Services

| # | Requirement |
|---|------------|
| FR18 | Dark charcoal background (slightly lighter than hero to create visual separation). Section heading "Services" (placeholder). Below it, a grid of 4-6 placeholder cards (gray boxes with placeholder text inside). |
| FR19 | Cards use a responsive grid: 1 column on mobile, 2 on tablet (`md:`), 3 on desktop (`lg:`). |
| FR20 | **Animation:** Use Motion `whileInView` on each card with staggered delay. Cards fade in and translate up (`y: 40 → 0`, `opacity: 0 → 1`). Stagger ~0.1s between cards. `viewport={{ once: true, amount: 0.3 }}` so animation triggers when 30% of the card is visible, and only plays once. |
| FR21 | On `prefers-reduced-motion`, cards render at final position immediately (no animation). |

### 4.6 — Section 3: Project Gallery (Horizontal Scroll)

| # | Requirement |
|---|------------|
| FR22 | This section contains 6-8 placeholder project cards (large gray rectangles, ~400x300px, with a placeholder title overlaid). |
| FR23 | **Desktop (lg+):** GSAP ScrollTrigger pins the section. As the user scrolls vertically, the cards translate horizontally (left). The section stays pinned for `(number of cards - 1) * card width` worth of scroll distance. Uses `scrub: 1` for smooth scroll-linked movement. |
| FR24 | **Tablet (md):** No pinning. Cards in a horizontally scrollable container with CSS `scroll-snap-type: x mandatory`. Each card has `scroll-snap-align: center`. Show a peek of the next card (card width ~85vw). |
| FR25 | **Mobile:** Cards stack vertically in a single column. Simple fade-in animation via Motion `whileInView`. |
| FR26 | The horizontal scroll calculation: the inner container width minus the viewport width determines total scroll distance. Pin duration equals this distance. |

### 4.7 — Section 4: Stats / Numbers

| # | Requirement |
|---|------------|
| FR27 | Dark background. A row of 3-4 stat items (e.g. "500+", "30", "15") with small labels beneath ("Projects", "Years Experience", "Countries"). Use a flex or grid layout, centered. |
| FR28 | **Animation:** When the section scrolls into view (GSAP `ScrollTrigger` with `onEnter`), numbers count up from 0 to their target value over ~2 seconds. Use `gsap.to()` with an object target and `snap` for integer rounding, then update the DOM text content via a ref. |
| FR29 | Count-up animation plays once only (`once: true` on ScrollTrigger or a flag). |
| FR30 | Numbers should be large (`text-5xl` or bigger) and gold-colored. Labels are smaller, muted white/gray. |

### 4.8 — Section 5: Contact CTA

| # | Requirement |
|---|------------|
| FR31 | Full-width section with dark background. A centered headline ("Let's Build Something" or similar placeholder), a short lorem paragraph, and a large CTA button (gold). |
| FR32 | **Animation:** Simple fade-in-up using Motion `whileInView`. Headline first, paragraph second, button third (staggered via `transition.delay`). |
| FR33 | Below the CTA section, add a minimal footer with placeholder text (company name, year). No animation needed. |

### 4.9 — Component Architecture

| # | Requirement |
|---|------------|
| FR34 | Each section is its own file in `src/components/sections/` (e.g., `Hero.tsx`, `Services.tsx`, `Gallery.tsx`, `Stats.tsx`, `ContactCta.tsx`). |
| FR35 | Animated sections are `"use client"` components. The homepage `page.tsx` remains a Server Component that composes them. |
| FR36 | The `SmoothScroll` wrapper lives at `src/components/SmoothScroll.tsx`. |
| FR37 | The `Header` component lives at `src/components/Header.tsx`. |
| FR38 | Placeholder content (text, card count, stat values) is defined as constants at the top of each section file, clearly marked with `// PLACEHOLDER — replace with real content`. |

---

## 5. Non-Goals (Out of Scope)

- **Real content** — no actual CES copy, project data, or images. All content is placeholder.
- **Responsive images** — no `next/image` usage. Gray `<div>`s with aspect ratios stand in for images.
- **Dark/light mode toggle** — site is dark-only for now.
- **Hamburger mobile menu** — nav links simply hide below `lg:`. Full mobile nav is a separate task.
- **Page transitions** — no View Transitions or route animation. Single page only.
- **SEO metadata** — basic metadata exists, no enhancements in this pass.
- **Plausible analytics** — installed but not wired up in this pass.
- **Contact form functionality** — CTA button is a dead placeholder.
- **shadcn/ui components** — this pass uses raw Tailwind. shadcn components come when we build real UI.
- **Footer** — minimal text only, no links or layout.

---

## 6. Design Considerations

### Visual structure (top to bottom)

```
┌──────────────────────────────────┐
│  HEADER (fixed, hides on scroll) │  z-50, dark bg, gold accent
├──────────────────────────────────┤
│                                  │
│         HERO (100vh)             │  SplitText character reveal
│   headline / sub / CTA           │  plays on load
│                                  │
├──────────────────────────────────┤
│                                  │
│       SERVICES (auto height)     │  Motion whileInView cards
│   section title + card grid      │  staggered fade-up
│                                  │
├──────────────────────────────────┤
│                                  │
│     PROJECT GALLERY (pinned)     │  GSAP ScrollTrigger
│   horizontal scroll of cards     │  pin + scrub on desktop
│                                  │
├──────────────────────────────────┤
│                                  │
│        STATS (auto height)       │  GSAP count-up on enter
│   3-4 big numbers in a row       │
│                                  │
├──────────────────────────────────┤
│                                  │
│      CONTACT CTA (auto height)   │  Motion whileInView
│   headline / text / button       │  fade-up stagger
│                                  │
├──────────────────────────────────┤
│  FOOTER (minimal)                │  no animation
└──────────────────────────────────┘
```

### Color palette for this pass

| Element | Color |
|---------|-------|
| Page background | `brand-black` / `oklch(0 0 0)` |
| Section backgrounds | Alternate between `#000000` and `#0a0a0a` (slight contrast) |
| Text (primary) | White `oklch(1 0 0)` |
| Text (muted) | `oklch(0.6 0 0)` — gray |
| Accent / CTA | `brand-gold` / `oklch(0.75 0.12 85)` |
| Placeholder cards | `oklch(0.15 0 0)` — dark gray rectangles |
| Card borders | `oklch(0.25 0 0)` — subtle edge |

### Spacing

- Sections: `py-24` on mobile, `py-32` on tablet, `py-40` on desktop
- Content max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## 7. Technical Considerations

### Animation library responsibilities (never overlap)

| What to animate | Use this | NOT this |
|----------------|----------|----------|
| Scroll-linked motion (pin, scrub, progress) | GSAP ScrollTrigger | Motion |
| Text splitting (chars, words, lines) | GSAP SplitText | — |
| Component mount/exit, gestures, hover | Motion | GSAP |
| Smooth scroll | Lenis | GSAP ScrollSmoother |

**Critical rule:** Never animate the same CSS property on the same element with both GSAP and Motion. They will fight and produce glitchy results.

### GSAP in React — the `useGSAP` hook

Always use `useGSAP()` from `@gsap/react` instead of `useEffect`. It:
- Creates a `gsap.context()` automatically (scopes animations to a container ref)
- Cleans up all GSAP tweens, timelines, and ScrollTriggers on unmount
- Is SSR-safe (no-ops during server render)

Pattern:
```tsx
"use client"
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export function MySection() {
  const container = useRef<HTMLElement>(null)

  useGSAP(() => {
    // All GSAP code here — scoped to container
    gsap.from(".my-element", { opacity: 0, y: 50 })
  }, { scope: container })

  return <section ref={container}>...</section>
}
```

### Lenis + GSAP sync (critical integration)

```tsx
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)        // Lenis tells GSAP about scroll position
gsap.ticker.add((time) => lenis.raf(time * 1000)) // GSAP drives Lenis's animation frame
gsap.ticker.lagSmoothing(0)                      // Disable lag smoothing for sync
```

Without this, ScrollTrigger animations will be out of sync with Lenis's smoothed scroll position.

### File structure

```
apps/web/src/
├── app/
│   ├── fonts.ts              ← Inter font config
│   ├── globals.css           ← existing design tokens (update with font)
│   ├── layout.tsx            ← add SmoothScroll wrapper + font class
│   └── page.tsx              ← compose sections (Server Component)
├── components/
│   ├── SmoothScroll.tsx      ← Lenis + GSAP ticker ("use client")
│   ├── Header.tsx            ← sticky nav ("use client")
│   └── sections/
│       ├── Hero.tsx          ← GSAP SplitText ("use client")
│       ├── Services.tsx      ← Motion whileInView ("use client")
│       ├── Gallery.tsx       ← GSAP ScrollTrigger pin ("use client")
│       ├── Stats.tsx         ← GSAP count-up ("use client")
│       └── ContactCta.tsx    ← Motion whileInView ("use client")
```

### Performance notes

- `SplitText` and `ScrollTrigger` are tree-shakeable from `gsap` — import from `gsap/ScrollTrigger`, not the full bundle.
- For below-fold sections, consider `next/dynamic` with `ssr: false` in a future optimization pass (not required now since content is placeholder).
- The horizontal gallery pin calculation must account for the header height if the header is fixed. Use `offsetTop` or a CSS variable for header height.

### Known gotcha: `ScrollTrigger.refresh()`

After all sections mount and content is laid out, call `ScrollTrigger.refresh()` to recalculate positions. Lenis also needs this after layout changes. A `useEffect` in the page or `SmoothScroll` component with a slight delay (`requestAnimationFrame`) handles this.

---

## 8. Success Metrics

| Metric | How to verify |
|--------|--------------|
| Smooth scroll works on desktop Chrome/Firefox/Safari | Manual test — scroll feels buttery, no native scroll bar jumping |
| Smooth scroll is OFF on mobile/tablet viewport | Resize browser below 1024px — native scroll behavior |
| Hero text reveals character by character on desktop | Visual — characters animate in from below with stagger |
| Hero simplifies on tablet (word-level) and mobile (fade) | Use devtools responsive mode at 768px and 375px |
| Services cards stagger in on scroll | Scroll to services section — cards appear one by one |
| Gallery pins and scrolls horizontally on desktop | Scroll through gallery — section pins, cards move left |
| Gallery is swipeable on tablet, stacked on mobile | Test at 768px (snap scroll) and 375px (vertical stack) |
| Stats count up from 0 when scrolled into view | Scroll to stats — numbers animate from 0 to target |
| `prefers-reduced-motion` disables all animation | Enable in OS/browser — everything renders at final state |
| Header hides on scroll-down, shows on scroll-up | Scroll down — header slides up. Scroll up — it returns. |
| No console errors or warnings | Check browser console during full page scroll |
| Page loads without FOUC (flash of unstyled content) | Inter font applies immediately via `next/font` |

---

## 9. Open Questions — Resolved

| # | Question | Decision |
|---|---------|----------|
| 1 | Header height: CSS variable or auto-detect? | **CSS variable `--header-h: 64px`** on `:root`. Sections and ScrollTrigger offsets reference it. Cleaner than magic numbers. |
| 2 | Gallery card count: 6 or 8? | **6 cards.** Enough for a dramatic horizontal scroll, not so many it feels tedious. |
| 3 | SplitText `autoSplit` or manual resize? | **Use `autoSplit: true`.** Modern SplitText (v3.14+) re-splits on resize automatically. Less code, handles edge cases. |
| 4 | Scroll progress indicator? | **Defer.** Polish item. Not core to the scaffold. Add as a separate task later. |
| 5 | Section transitions: gradient or hard cut? | **Hard cuts with alternating shades** (`#000` / `#0a0a0a`). Simple, and the slight contrast creates enough visual separation. |
