# PRD: Video First-Frame Poster on Innovation Cards

## Status: Complete (pending manual testing 2.2–2.4)
## Last Updated: 2026-03-02

## 1. Overview

Innovation bento cards currently show a static PNG image as the background, with the video hidden until hover. This creates a visual disconnect — the poster image (a data chart or diagram) doesn't match the cinematic video that plays on hover. Instead, each card should display the **first frame of its video** as the resting state, then smoothly transition to playback on hover. This gives a consistent, professional look where hover simply "brings the card to life."

## 2. Goals

- **G1:** Every innovation card displays its video's first frame as the default visual.
- **G2:** On hover (desktop), the video plays seamlessly from frame 0 — no visual pop or flicker.
- **G3:** On mobile, the first frame remains static (no autoplay, saves bandwidth).
- **G4:** No build-time dependencies (no ffmpeg) — use runtime `preload="metadata"` to grab frame 0.

## 3. User Stories

- **US-1:** As a sales engineer viewing the page, I see each innovation card with a cinematic video frame (not a data chart), giving a polished first impression.
- **US-2:** As a desktop user, when I hover a card the video plays smoothly from where it already is — no flash or loading delay.

## 4. Functional Requirements

- **FR-1:** Each card renders a `<video>` element as the primary background (not an `<img>`).
- **FR-2:** Video uses `preload="metadata"` so the browser fetches the first frame and dimensions without downloading the full file.
- **FR-3:** Video `currentTime` is set to `0` on load via the `loadedmetadata` event to ensure frame 0 is displayed.
- **FR-4:** The video is **always visible** (no `opacity-0` toggle). At rest it shows the frozen first frame; on hover it plays.
- **FR-5:** On `mouseenter` (desktop): call `video.play()`. On `mouseleave`: call `video.pause()` and optionally reset `currentTime = 0` so the poster returns to the first frame.
- **FR-6:** On mobile (`< 1024px`): video still renders with `preload="metadata"` to show frame 0, but hover play is disabled. The card is a static frame.
- **FR-7:** `prefers-reduced-motion`: video shows frame 0 only. No play on hover.
- **FR-8:** Fallback: if the video fails to load (network error), fall back to the first image from the `images` array (current behavior).
- **FR-9:** Remove the separate poster `<img>` element — the video element itself serves as the poster.

## 5. Non-Goals / Out of Scope

- **NG-1:** No changes to the detail modal's media display.
- **NG-2:** No build-time poster extraction (no ffmpeg).
- **NG-3:** No changes to video content or sourcing new unique videos for shared-video cards.

## 6. Design Considerations

**Visual behavior:**
```
At rest:     [video frame 0 — frozen, cinematic still]
On hover:    [video plays from frame 0, looped, muted]
On leave:    [video pauses → resets to frame 0]
```

- The gradient overlay and title text remain unchanged on top of the video.
- The subtle scale-up on hover (`scale-[1.02]`) continues to work.
- Cards sharing the same video (BIM, CFD, Daylight) will look identical at rest — acceptable for now.

## 7. Technical Considerations

**Key change:** Replace the dual-element approach (hidden `<img>` + hidden `<video>`) with a single always-visible `<video>` element.

**`preload="metadata"`** tells the browser to fetch just enough data (headers, duration, dimensions, first frame) without buffering the full stream. This is bandwidth-friendly — roughly 50-200 KB per video instead of the full file.

**`loadedmetadata` event:** Set `currentTime = 0` in the handler to guarantee the browser renders frame 0. Some browsers may render a black frame without this nudge.

**Error handling:** Listen for the `error` event on the video. If it fires, set a `videoFailed` state flag and show the fallback `<img>` poster instead.

**Mouse leave reset:** Resetting `currentTime = 0` on mouse leave means the card always returns to the same first-frame poster. Without this, the card would freeze on whatever frame the user left on, creating inconsistency.

## 8. Success Metrics

- **SM-1:** All 5 cards show a cinematic video frame (not a data chart PNG) at rest.
- **SM-2:** No visible flash or black frame during the load → frame 0 → hover play sequence.
- **SM-3:** Network tab shows `preload="metadata"` requests (~50-200 KB each), not full video downloads, on initial page load.

## 9. Open Questions

None — scope is clear.

---

## Implementation

### Relevant Files

**Modified Files:**
- `apps/web/src/components/sections/innovation/InnovationBentoCard.tsx` — Rewrite video/poster logic

### Notes

- No new dependencies needed.
- Test with: `pnpm build && pnpm type-check`
- Dev server: user runs `pnpm dev` themselves

### Tasks

- [x] 1.0 Rewrite InnovationBentoCard video/poster logic
  - [x] 1.1 Remove the separate `<img>` poster element. The `<video>` element becomes the sole background.
  - [x] 1.2 Change `preload` from `"none"` to `"metadata"` so the browser fetches frame 0 and dimensions.
  - [x] 1.3 Remove the `opacity-0 group-hover:opacity-100` classes from the video — it should be always visible.
  - [x] 1.4 Add a `loadedmetadata` event handler that sets `videoRef.current.currentTime = 0` to ensure frame 0 renders.
  - [x] 1.5 Update `handleMouseLeave` to also reset `currentTime = 0` so the card returns to the first frame after hover.
  - [x] 1.6 Add an `error` event handler on the video: if the video fails to load, show the fallback image from `area.images[0]` instead.
  - [x] 1.7 On mobile and `prefers-reduced-motion`: still render the `<video>` with `preload="metadata"` (to show frame 0) but disable play on hover.

- [x] 2.0 Verify and test
  - [x] 2.1 Run `pnpm build` and `pnpm type-check` — fix any errors. **Both pass clean.**
  - [ ] 2.2 Manual: verify all 5 cards show a video frame (not a PNG chart) at rest.
  - [ ] 2.3 Manual: verify hover starts playback, leave resets to frame 0.
  - [ ] 2.4 Manual: verify no black flash during initial load on desktop and mobile.

### Progress Log

| Date | Task | Notes |
|------|------|-------|
| 2026-03-02 | 1.0 | Full rewrite: single `<video>` with preload=metadata, loadedmetadata→frame 0, error fallback |
| 2026-03-02 | 2.1 | pnpm build + type-check both pass clean |
| 2026-03-02 | — | All code tasks complete. Manual testing (2.2–2.4) pending. |
