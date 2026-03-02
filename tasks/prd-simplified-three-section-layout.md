# PRD: Simplified Three-Section Layout

## Status: In Progress
## Last Updated: 2026-03-02

## 1. Overview

Management finds the current portfolio site too advanced and complicated for field use. This PRD describes a major simplification: reduce the homepage to exactly three sections — Hero, Innovations, and Contact. The Hero retains its current cinematic entrance animation. The Innovations section replaces the complex scroll-driven carousels with a clean bento grid of clickable rectangles (one per innovation area), each with a video background that plays on hover and a poster fallback. Clicking a rectangle opens a full-screen modal with detailed content. The Contact section is updated with real CES contact information. All other sections (Services, Projects) are hidden via feature flags for potential future restoration.

## 2. Goals

- **G1:** Reduce cognitive load — management and sales engineers see only three clear sections when scrolling.
- **G2:** Maintain visual polish — video-backed bento cards with hover-to-play create a "cool" first impression without overwhelming complexity.
- **G3:** Preserve existing work — hide (don't delete) current sections so they can be restored if strategy changes.
- **G4:** Mobile-first — bento grid and modals must work flawlessly on phones/iPads in low-connectivity meeting rooms.
- **G5:** Fast iteration — simple component architecture makes future content updates trivial.

## 3. User Stories

- **US-1:** As a sales engineer, I want to scroll through a simple page with Hero → Innovations → Contact so that I can quickly orient a client without navigating complex UI.
- **US-2:** As a sales engineer, I want to tap an innovation rectangle to see a full-screen detail overlay so that I can dive deeper during a presentation without leaving the page.
- **US-3:** As a sales engineer, I want each innovation card to play a short video on hover (desktop) so the page feels dynamic and impressive to clients.
- **US-4:** As a manager, I want the page to feel clean and professional — not like a tech demo — so it represents CES's brand appropriately.
- **US-5:** As a mobile user, I want the bento grid to restack into a single or two-column layout so cards are easily tappable.

## 4. Functional Requirements

- **FR-1:** Homepage renders exactly three sections in order: Hero, Innovations, Contact. No other sections are visible.
- **FR-2:** Feature flags for `servicesOverview`, `servicesShowcase`, `projectsPreview` are set to `false`. Feature flags for `hero`, `contactCta` remain `true`. A new flag `innovationsBento` is set to `true`. The existing `innovationShowcase` flag is set to `false`.
- **FR-3:** Innovations section displays a bento grid of 5 innovation areas:
  1. Climate Analysis
  2. Green Finance
  3. BIM MEP Engineering
  4. Computational Fluid Dynamics
  5. Computational Daylight Analysis
- **FR-4:** Each bento card displays:
  - Innovation title (text overlaid on the card)
  - Background: poster/static image by default; video plays on hover (desktop) or on viewport entry (mobile).
  - Visual hover state: subtle scale or brightness shift.
- **FR-5:** Clicking/tapping a bento card opens a full-screen modal overlay containing:
  - Close button (top-right corner, always visible)
  - Innovation title
  - Long description text
  - Capabilities/sub-items list
  - Stats (metric + label)
  - Links (if any, with thumbnails where available)
  - Image gallery (scrollable, showing the innovation's images array)
  - Close on Escape key and clicking outside content area.
- **FR-6:** Modal uses scroll lock on the body when open (prevent background scrolling).
- **FR-7:** Contact section updated with real content:
  - Heading: "Your contact persons" (or similar)
  - Contact: Dipl.-Ing. Klaus Kogler
  - Role: Buildings and Urban Development
  - Phone: +43 664 601 692 32
  - Email: k.kogler@ic-ces.at
  - Retain CTA button style for phone/email actions.
- **FR-8:** Animations:
  - Hero: unchanged (keep current GSAP entrance, particles, etc.)
  - Innovations section: subtle fade-in on scroll (Motion `whileInView`), hover effects on cards.
  - Contact section: simple fade-in on scroll.
  - No scroll-driven pinning or scrubbing anywhere except existing Hero.
- **FR-9:** Equal grid layout (all cards same size — each innovation is equally important):
  - Desktop (lg+): 3-column grid, equal-sized cards. 5 cards = top row of 3, bottom row of 2 (centered or left-aligned).
  - Tablet (md): 2-column grid, equal-sized cards.
  - Mobile: single-column stack, full-width cards.
- **FR-10:** Responsive video handling: on mobile, use `mp4Mobile` if available, otherwise poster image only. On desktop, prefer webm, fallback to mp4, fallback to poster.

## 5. Non-Goals / Out of Scope

- **NG-1:** No changes to the Hero section animation or content.
- **NG-2:** No new content pages or routes (modals only, no `/innovations/[slug]` routes).
- **NG-3:** No contact form — just contact info display with clickable phone/email.
- **NG-4:** No changes to Services or Projects component code — only feature flag toggling.
- **NG-5:** No changes to the content data structure in `@ces/content` — reuse existing innovation JSON data as-is.
- **NG-6:** No Lenis smooth-scroll changes — keep existing behavior.
- **NG-7:** No SEO changes (OG images, structured data) in this iteration.

## 6. Design Considerations

**Equal Grid Layout (Desktop):**
```
┌────────┬────────┬────────┐
│   1    │   2    │   3    │
│        │        │        │
├────────┼────────┼────────┘
│   4    │   5    │
│        │        │
└────────┴────────┘
```
- All 5 cards are identical size — no card is visually prioritized over another.
- Bottom row of 2 cards can be centered beneath the 3-column row, or left-aligned (user preference).
- Card aspect ratio: ~16:9 or ~3:2 (cinematic, landscape-oriented).

**Card Styling:**
- Rounded corners (`rounded-xl` or `rounded-2xl`)
- Dark overlay gradient on bottom half for text readability over video/images
- Title in white, bold, positioned bottom-left with padding
- On hover (desktop): video plays, slight scale-up (`scale-[1.02]`), overlay lightens slightly
- Cursor: pointer

**Full-Screen Modal:**
- Background: semi-transparent black backdrop (`bg-black/80`)
- Content: dark card (`bg-neutral-950`) centered, max-width ~1000px, max-height ~90vh, scrollable
- Close button: `X` icon, top-right, fixed within modal, white on dark
- Entrance animation: fade + slight scale-up (Motion `animate`)
- Exit animation: fade out
- Uses Radix Dialog primitive (already available via shadcn/ui pattern)

**Color Palette:** Stick to existing brand tokens — black backgrounds, Web Gold accents, white text.

**Accessibility:**
- Modal traps focus (Radix Dialog handles this)
- Cards have `role="button"` and `aria-label`
- Videos have `aria-hidden="true"` (decorative)
- Touch targets ≥ 44×44px
- `prefers-reduced-motion`: no video autoplay, no hover scale, instant transitions

## 7. Technical Considerations

**Component Architecture:**
- New: `InnovationsBento.tsx` — client component, bento grid container
- New: `InnovationBentoCard.tsx` — client component, individual card with video/hover logic
- New: `InnovationDetailModal.tsx` — client component, full-screen modal using Radix Dialog
- Modify: `ContactCta.tsx` — update content with real contact info
- Modify: `apps/web/src/config/features.ts` — toggle flags
- Modify: `apps/web/src/app/page.tsx` — wire in new `InnovationsBento` section

**Data Source:** Reuse `loadAllInnovations()` from `@ces/content/data/innovation`. No schema changes needed. All 5 innovation areas already have rich content — titles, descriptions, capabilities/sub-items, stats, links (some with thumbnails), and image galleries. The modal must display all of this existing content faithfully.

**Video Strategy:**
- Climate Analysis has a unique video (`climate-analysis-bg.webm`)
- Green Finance has a local video (`green-finance-video.webm`) — needs JSON update to reference it
- BIM, CFD, Daylight share the research-development video — acceptable for now but can be differentiated later
- First frame of video or first image from `images` array serves as poster fallback
- Videos are short loops, played at 50% speed, muted, `playsinline`

**Modal Implementation:** Use Radix `Dialog` (available via shadcn/ui `npx shadcn@latest add dialog`). This gives us focus trapping, escape-to-close, aria attributes, and portal rendering for free.

**Dependencies:**
- shadcn/ui `dialog` component (if not already added) — needs `npx shadcn@latest add dialog`
- No new external dependencies required

**Performance:**
- Videos lazy-load (`preload="none"`) and only play on hover/viewport
- Images in modal use `next/image` with appropriate `sizes`
- Bento cards use `loading="lazy"` for below-fold poster images
- Modal content renders on demand (not pre-rendered in DOM)

## 8. Success Metrics

- **SM-1:** Management approves the simplified layout in a review meeting.
- **SM-2:** Page loads under 2.5s LCP on mobile (same or better than current).
- **SM-3:** Sales engineers can navigate Hero → tap innovation → view details → close → Contact in under 10 seconds.
- **SM-4:** Zero scroll-jank or animation stutter on iPad Safari.

## 9. Deployment

**Branch:** `simple-layout` (already created)
**Subdomain:** `innovation.ic-ces.engineering`
**DNS Zone:** Same as portfolio — `Z07972313GVRF4SEMXLOL` (ic-ces.engineering hosted zone)
**SST Stage:** Use stage name (e.g., `innovation`) to deploy alongside the existing `production` stage. Update `sst.config.ts` to conditionally set the domain based on stage.

**Important:** Deployment is run from the HOST machine, not from the dev container. The PRD only covers SST config changes — the user will run `pnpm deploy` from host.

## 10. Open Questions

- **OQ-1:** Should we add a second contact person, or is Klaus Kogler the sole contact for now?
- ~~**OQ-2:**~~ **Resolved:** Section heading is "Innovative Services at CES" (or similar), displayed above the grid.
- **OQ-3:** Are the shared research-development videos acceptable for BIM/CFD/Daylight cards, or should we source unique videos before launch?
- ~~**OQ-4:**~~ **Resolved:** Yes — wire `green-finance-video.webm` into the Green Finance JSON. (Covered in task 1.3.)

---

## Implementation

### Relevant Files

**New Files:**
- `apps/web/src/components/sections/innovation/InnovationsBento.tsx` — Bento grid container with scroll animation
- `apps/web/src/components/sections/innovation/InnovationBentoCard.tsx` — Individual bento card (video hover, click handler)
- `apps/web/src/components/sections/innovation/InnovationDetailModal.tsx` — Full-screen Radix Dialog modal with innovation details

**Modified Files:**
- `apps/web/src/config/features.ts` — Toggle feature flags
- `apps/web/src/app/page.tsx` — Add InnovationsBento, remove/hide other sections
- `apps/web/src/components/sections/ContactCta.tsx` — Update with real CES contact info
- `packages/content/data/innovation/green-finance/section-description.json` — Fix video reference to use local file

**Infrastructure:**
- `sst.config.ts` — Update domain config to support `innovation.ic-ces.engineering` subdomain based on stage

**Existing Files (read-only reference):**
- `packages/content/data/innovation.ts` — Data loader (reuse as-is)
- `packages/content/data/innovation/*/section-description.json` — Innovation data (5 areas)
- `apps/web/src/components/sections/Hero.tsx` — Unchanged
- `apps/web/src/app/globals.css` — Design tokens reference

### Notes

- shadcn/ui dialog component may need to be added: `npx shadcn@latest add dialog` — **tell user to run this, do NOT run it directly**
- Test with: `pnpm build && pnpm lint && pnpm type-check`
- Dev server: user runs `pnpm dev` themselves (port 4200)
- No new external npm dependencies required beyond shadcn/ui dialog

### Tasks

- [x] 1.0 Setup and feature flag configuration
  - [x] 1.1 Update `apps/web/src/config/features.ts`: set `servicesOverview: false`, `servicesShowcase: false`, `projectsPreview: false`, `innovationShowcase: false`. Add new flag `innovationsBento: true`.
  - [x] 1.2 Check if shadcn/ui `dialog` component exists in the project. If not, inform user to run `npx shadcn@latest add dialog` and wait for confirmation. **→ @radix-ui/react-dialog already installed.**
  - [x] 1.3 Fix `packages/content/data/innovation/green-finance/section-description.json` to reference `./green-finance-video.webm` instead of the shared research-development video.

- [x] 2.0 Create InnovationBentoCard component
  - [x] 2.1 Create `apps/web/src/components/sections/innovation/InnovationBentoCard.tsx` as a client component.
  - [x] 2.2 Implement card layout: relative container, video/poster background, gradient overlay, title text bottom-left.
  - [x] 2.3 Implement desktop hover behavior: play video on mouseenter, pause on mouseleave, scale-up transition.
  - [x] 2.4 Implement mobile behavior: use first image from innovation's `images` array as static poster (no video autoplay on mobile to save bandwidth).
  - [x] 2.5 Add `prefers-reduced-motion` support: no video, no scale, static poster only.
  - [x] 2.6 Add accessibility: `role="button"`, `tabIndex={0}`, `aria-label`, keyboard enter/space to open.

- [x] 3.0 Create InnovationDetailModal component
  - [x] 3.1 Create `apps/web/src/components/sections/innovation/InnovationDetailModal.tsx` using Radix Dialog (shadcn/ui).
  - [x] 3.2 Implement modal layout: full-screen overlay (`bg-black/80`), centered scrollable content card (`bg-neutral-950`, max-w ~1000px).
  - [x] 3.3 Render innovation title, long description, sub-items/capabilities list.
  - [x] 3.4 Render stats section (metric + label + secondary text).
  - [x] 3.5 Render links section (with thumbnails where available via `next/image`).
  - [x] 3.6 Render image gallery — horizontal scroll or grid of innovation images using `next/image`.
  - [x] 3.7 Add close button (X icon, top-right), Escape key close, backdrop click close (Radix handles these).
  - [x] 3.8 Add entrance/exit animations (Motion: fade + scale).

- [x] 4.0 Create InnovationsBento container component
  - [x] 4.1 Create `apps/web/src/components/sections/innovation/InnovationsBento.tsx` as a client component.
  - [x] 4.2 Load innovation data using `loadAllInnovations()` from `@ces/content/data/innovation` (pass as props from page).
  - [x] 4.3 Implement equal grid layout with flexbox: 3-column desktop (centered partial row), 2-column tablet, 1-column mobile.
  - [x] 4.4 Map each innovation to an `InnovationBentoCard`, manage selected state for modal open/close.
  - [x] 4.5 Add section-level scroll animation: fade-in cards with stagger using Motion `whileInView`.
  - [x] 4.6 Add section heading "Innovative Services at CES" above grid — style with Web Gold accent.

- [x] 5.0 Update Contact section
  - [x] 5.1 Update `apps/web/src/components/sections/ContactCta.tsx` with real content: heading "Your Contact Person", contact card for Klaus Kogler (name, title, phone, email).
  - [x] 5.2 Make phone number a clickable `tel:` link and email a clickable `mailto:` link with proper touch target sizes (44×44px min).
  - [x] 5.3 Keep simple fade-in animation on scroll (Motion `whileInView`).

- [x] 6.0 Wire up page.tsx and integrate
  - [x] 6.1 Update `apps/web/src/app/page.tsx`: import `InnovationsBento`, load innovation data, pass as props. Conditionally render based on `features.innovationsBento` flag.
  - [x] 6.2 Verify feature flag gating hides Services, Projects, and old Innovation sections.
  - [x] 6.3 Ensure scroll flow is smooth: Hero → Innovations Bento → Contact → Footer with no gaps or jarring transitions.

- [ ] 7.0 SST deployment configuration
  - [ ] 7.1 Update `sst.config.ts` to conditionally set domain based on stage: `innovation` stage → `innovation.ic-ces.engineering`, `production` stage → `portfolio.ic-ces.engineering`. Use the same hosted zone ID for both.
  - [ ] 7.2 Verify config builds without errors (`pnpm build` in root).

- [ ] 8.0 Polish and testing
  - [ ] 8.1 Run `pnpm build` — fix any build errors.
  - [ ] 8.2 Run `pnpm lint` and `pnpm type-check` — fix any issues.
  - [ ] 8.3 Test responsive layout at mobile (375px), tablet (768px), desktop (1440px) breakpoints.
  - [ ] 8.4 Test modal open/close behavior, scroll lock, focus trapping, keyboard navigation.
  - [ ] 8.5 Test video hover-to-play on desktop, poster fallback on mobile.
  - [ ] 8.6 Test `prefers-reduced-motion` behavior.
  - [ ] 8.7 Verify page weight stays under 500KB initial load budget.

### Progress Log

| Date | Task | Notes |
|------|------|-------|
| 2026-03-02 | 1.1 | Feature flags updated — hid services/projects/old innovation, added innovationsBento |
| 2026-03-02 | 1.2 | @radix-ui/react-dialog already in package.json — no install needed |
| 2026-03-02 | 1.3 | Green Finance video reference fixed to local ./green-finance-video.webm |
| 2026-03-02 | 2.0 | InnovationBentoCard created — video hover, poster fallback, a11y, reduced-motion |
| 2026-03-02 | 3.0 | InnovationDetailModal created — Radix Dialog, fade+scale animation, gallery, stats, links |
| 2026-03-02 | 4.0 | InnovationsBento container created — flexbox grid with centered partial row, staggered fade-in |
| 2026-03-02 | 5.0 | ContactCta updated — Klaus Kogler contact card with tel: and mailto: links |
| 2026-03-02 | 6.0 | page.tsx wired up — InnovationsBento integrated, feature flags verified |
