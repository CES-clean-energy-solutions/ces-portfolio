# PRD: Background Particle Animation — Spiraling Green Energy

## 1. Introduction / Overview

The hero section currently has a flat black background. This feature adds an animated particle system behind the hero content — green-tinted particles spiraling outward from the center, evoking **green energy, sustainability, and the circular economy**. The particles are subtle and ambient, serving as visual texture rather than a focal point. The hero headline remains the star.

### What this looks like

Imagine standing above a slow-motion explosion of green light particles — tiny dots ranging from dark forest green to bright emerald, drifting outward from the center of the hero in gentle spiral paths. On desktop, moving your mouse gently pushes nearby particles away (repel effect). The motion is slow and meditative, not frenetic.

### Why tsparticles

**tsparticles** (`@tsparticles/react`) is a mature particle animation library with a React wrapper, built-in orbital motion, mouse interaction support, and fine-grained config. It avoids writing custom Canvas 2D math from scratch while providing enough control to achieve the spiral effect.

**Bundle size concern:** The slim bundle is ~180-200KB minified. To stay within the <150KB initial JS budget, particles are:
1. **Lazy-loaded** via `next/dynamic` with `ssr: false` (not in the critical path)
2. **Desktop-only** — mobile/tablet get a static CSS gradient instead (saves battery, avoids jank)
3. **Loaded after hero text animates** — particles fade in after the GSAP SplitText reveal completes

---

## 2. Goals

| # | Goal | Measurable criteria |
|---|------|-------------------|
| G1 | Add a spiraling particle background to the hero section | Green particles visible behind hero content on desktop, animating outward from center. |
| G2 | Maintain mobile performance budget | Particles do NOT load on viewports <1024px. Initial JS bundle stays <150KB (particles lazy-loaded separately). |
| G3 | Mouse interaction on desktop | Cursor repels nearby particles within a ~100px radius on desktop. No touch interaction on tablet/mobile. |
| G4 | Respect `prefers-reduced-motion` | If enabled, particles render at static positions with no animation — or don't render at all. |
| G5 | Particles don't compete with hero text | Particle opacity stays low enough that the headline and subheadline remain easily readable. |

---

## 3. User Stories

**US1 — Desktop visitor:**
As a visitor on a laptop, I want to see subtle green particles spiraling behind the hero text so the site feels alive and reinforces the clean energy theme.

**US2 — Interactive desktop visitor:**
As a visitor moving my mouse over the hero, I want particles near my cursor to gently drift away so the page feels responsive and polished.

**US3 — Mobile sales engineer:**
As a sales engineer on an iPad, I want the hero to load fast without unnecessary particle animations so I can immediately show the headline to my client.

**US4 — Accessibility user:**
As a user with reduced motion preference, I want the particles to either be static or hidden so they don't cause visual discomfort.

---

## 4. Functional Requirements

### 4.1 — Package Installation & Setup

| # | Requirement |
|---|------------|
| FR1 | Install `@tsparticles/react` and `@tsparticles/slim` as dependencies in `apps/web`. The slim bundle includes basic particles, interactions (repulse), and movement updaters. |
| FR2 | Create a `ParticlesBackground` client component at `src/components/ParticlesBackground.tsx`. It must have `"use client"` directive. |
| FR3 | Initialize the tsparticles engine with `initParticlesEngine()` + `loadSlim()` inside a `useEffect`. Track initialization state with `useState`. Only render `<Particles>` after init completes. |

### 4.2 — Particle Configuration

| # | Requirement |
|---|------------|
| FR4 | **Particle count:** 60-80 particles. Set via `particles.number.value: 70`. |
| FR5 | **Colors — green gradient:** Particles randomly pick from a range of greens. Use `particles.color.value` as an array: `["#0a5c36", "#0f7a4d", "#14a365", "#1bcc7e", "#22f598"]` (dark forest → bright emerald). Each particle gets one color. |
| FR6 | **Particle size:** Random between 1-4px. `particles.size.value: { min: 1, max: 4 }`. |
| FR7 | **Particle opacity:** Random between 0.15 and 0.5. `particles.opacity.value: { min: 0.15, max: 0.5 }`. Low enough to not compete with text. |
| FR8 | **Outward spiral motion:** Configure `particles.move` with `direction: "outside"`, `speed: { min: 0.3, max: 1.0 }` (slow), `outModes: "destroy"` so particles disappear when leaving the canvas. New particles respawn at/near center via `emitters` config with position `{ x: 50, y: 50 }`. |
| FR9 | **Spiral path:** Use `particles.move.path` with a custom spiral/noise function, OR use `particles.move.direction: "outside"` combined with `particles.move.spin` / `particles.move.angle` to create rotational drift. The exact config may need tuning — the key visual is "outward + rotational" not just straight lines outward. |
| FR10 | **Mouse repel (desktop only):** `interactivity.events.onHover.enable: true`, `interactivity.events.onHover.mode: "repulse"`. `interactivity.modes.repulse.distance: 100`, `interactivity.modes.repulse.speed: 0.5` (gentle, not violent). |

### 4.3 — Integration with Hero Section

| # | Requirement |
|---|------------|
| FR11 | The `ParticlesBackground` component renders as an **absolutely positioned layer behind the hero content**. It fills the hero section dimensions (`position: absolute; inset: 0; z-index: 0`). Hero content has `position: relative; z-index: 10` to stay on top. |
| FR12 | **Desktop-only loading:** Use `next/dynamic` with `ssr: false` to import `ParticlesBackground`. Inside the hero component, conditionally render it only on desktop (check `window.matchMedia('(min-width: 1024px)')` or use a `useMediaQuery` hook). |
| FR13 | **Mobile/tablet fallback:** On viewports <1024px, instead of particles, show a subtle CSS radial gradient centered on the hero — dark green glow fading to black. Example: `radial-gradient(ellipse at center, oklch(0.15 0.05 150) 0%, oklch(0 0 0) 70%)`. This is zero-JS and conveys the green energy theme. |
| FR14 | **Fade-in after hero animation:** Particles should start with `opacity: 0` on the canvas wrapper and fade in over ~1s after the GSAP SplitText hero animation completes. Coordinate via a callback or a `setTimeout` matching the hero animation duration (~1.5s). |
| FR15 | **`prefers-reduced-motion`:** If active, do NOT load tsparticles at all. Show the static CSS gradient fallback instead (same as mobile). |

### 4.4 — Canvas Configuration

| # | Requirement |
|---|------------|
| FR16 | Set `fullScreen.enable: false` on tsparticles options so the canvas stays contained within the hero section, not fullscreen. |
| FR17 | Set `background.color: "transparent"` so the hero's black background shows through. |
| FR18 | Set `detectRetina: true` for sharp rendering on HiDPI displays. |
| FR19 | Set `fpsLimit: 60` to cap frame rate and save battery. |

---

## 5. Non-Goals (Out of Scope)

- **Particles on other sections** — hero only. Other sections stay clean.
- **Scroll-linked particle behavior** — particles don't respond to scroll position. They're a self-contained ambient animation.
- **Click/tap interactions** — no click effects (burst, attract, etc.). Mouse repel only.
- **3D depth / WebGL** — 2D canvas only. No Three.js.
- **Particle connections (lines between dots)** — no network/mesh effect. Individual particles only.
- **Custom particle shapes** — circles only. No leaf icons, energy symbols, etc. (could be a follow-up).
- **Performance profiling** — we'll eyeball 60fps on desktop. Formal Lighthouse auditing is a separate task.

---

## 6. Design Considerations

### Visual layering (hero section, top to bottom)

```
z-index stack:
  20  Hero text content (headline, subheadline, CTA)
  10  (future: any overlay or gradient if needed)
   0  ParticlesBackground <canvas> (absolute, inset 0)
  -   Hero section background (bg-brand-black)
```

### Color tokens for particles

| Name | Value | Usage |
|------|-------|-------|
| Green 1 (darkest) | `#0a5c36` | Forest green, most particles |
| Green 2 | `#0f7a4d` | Mid-dark |
| Green 3 | `#14a365` | Mid emerald |
| Green 4 | `#1bcc7e` | Bright emerald |
| Green 5 (lightest) | `#22f598` | Brightest, fewest particles (larger size bias) |

The majority of particles should be in the darker range (Green 1-3) with a few bright ones for visual interest. This is controlled by the random color pick from the array — weight it by repeating darker values: `["#0a5c36", "#0a5c36", "#0f7a4d", "#0f7a4d", "#14a365", "#1bcc7e", "#22f598"]`.

### Mobile fallback gradient

```css
/* Applied when viewport < 1024px or prefers-reduced-motion */
background: radial-gradient(
  ellipse at 50% 50%,
  oklch(0.15 0.05 150) 0%,   /* subtle dark green center */
  oklch(0 0 0) 70%            /* fades to pure black */
);
```

This gives a faint green aura at the center of the hero — zero JavaScript, same visual direction.

---

## 7. Technical Considerations

### Package architecture

```
@tsparticles/react    — React <Particles> component wrapper
       ↓ depends on
@tsparticles/engine   — Core engine (types, Container, Engine)
       ↓ loaded with
@tsparticles/slim     — Preset bundle: basic particles + interactions + movement
                        Includes: repulse, attract, colors, opacity, size, move
                        ~180-200KB minified, ~60KB gzipped
```

### Lazy loading strategy

```tsx
// In Hero.tsx — only load particles on desktop, after hero animation
import dynamic from "next/dynamic";

const ParticlesBackground = dynamic(
  () => import("@/components/ParticlesBackground"),
  { ssr: false }
);

// Inside Hero component:
const [showParticles, setShowParticles] = useState(false);

// After GSAP hero animation completes:
useGSAP(() => {
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isDesktop && !prefersReduced) {
    // Delay to let hero text animate first
    gsap.delayedCall(1.5, () => setShowParticles(true));
  }
  // ... rest of hero animation
}, { scope: container });
```

This means:
- **Mobile:** Particles JS never downloads. Zero cost.
- **Desktop:** Particles download in a separate chunk after initial paint. Hero text animates first (SSG HTML visible immediately), then particles fade in.

### tsparticles spiral motion — implementation approach

tsparticles doesn't have a built-in "outward spiral" preset. Two approaches:

**Approach A — `move.direction: "outside"` + `move.spin`:**
Use the built-in outward movement combined with spin to create rotational drift. Less precise spiral but simplest config.

**Approach B — Custom path plugin:**
Write a simple path generator function that calculates spiral coordinates. tsparticles supports custom `move.path.generator` where you return velocity vectors. This gives a true mathematical spiral (Archimedean or logarithmic).

**Recommended: Start with Approach A.** If the visual isn't spiral enough, iterate to Approach B. The PRD prioritizes "looks like outward spiral" over "mathematically perfect spiral."

### File structure changes

```
apps/web/src/
├── components/
│   ├── ParticlesBackground.tsx   ← NEW: tsparticles wrapper ("use client")
│   └── sections/
│       └── Hero.tsx              ← MODIFIED: add particles layer + dynamic import
```

### Interaction with existing animation stack

- **tsparticles owns the `<canvas>` element** — it manages its own animation loop via `requestAnimationFrame`.
- **GSAP owns the hero text animations** — SplitText, ScrollTrigger.
- **No overlap:** They animate different DOM elements. tsparticles never touches the hero text; GSAP never touches the canvas.
- **Coordination:** GSAP triggers `setShowParticles(true)` after the text reveal completes. That's the only touch point.

---

## 8. Success Metrics

| Metric | How to verify |
|--------|--------------|
| Green particles visible on desktop behind hero text | Visual — particles animate on page load (after text reveal) |
| Particles spiral/radiate outward from center | Visual — particles move from center toward edges with rotational drift |
| Mouse repel works on desktop | Move cursor over hero — nearby particles push away |
| No particles on mobile/tablet (<1024px) | Resize to 768px — only CSS gradient visible, no `<canvas>` in DOM |
| No particles with `prefers-reduced-motion` | Enable in OS — no canvas rendered, gradient fallback only |
| Particles fade in after hero text animation | Watch page load — headline animates first, then particles appear ~1.5s later |
| Hero text remains readable over particles | Text contrast unaffected — particles are low opacity behind text |
| No console errors | Check browser console during full page interaction |
| Smooth 60fps on desktop | Visual — no frame drops or jank during particle animation |

---

## 9. Open Questions — Resolved

| # | Question | Decision |
|---|---------|----------|
| 1 | `@tsparticles/slim` vs `@tsparticles/basic` + specific plugins? | **Use `@tsparticles/slim`.** It includes repulse interaction which we need. Lazy-loaded so it doesn't impact initial bundle. |
| 2 | True mathematical spiral vs approximate outward + spin? | **Start with outward + spin (Approach A).** Iterate to custom path if visual isn't spiral enough. |
| 3 | Emitter position for respawning particles? | **Center of hero** (`x: 50, y: 50` in percent). Particles spawn at center and radiate outward. |
| 4 | Should particles react to scroll (parallax/speed change)? | **No.** Self-contained ambient animation. Keep it simple. |
| 5 | Particle lifetime / how long before they despawn? | **Destroy on leaving canvas** (`outModes: "destroy"`). Emitter continuously respawns new ones at center. Keeps density stable. |
