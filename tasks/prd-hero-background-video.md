# PRD: Hero Background Video

## 1. Introduction / Overview

The CES portfolio hero section currently uses a radial gradient as its base background, with animated particles and a cursor ripple effect layered on top (desktop only). This feature adds a looping ambient background video of a photovoltaic / sustainable-energy community — generated with Veo 3 — behind all existing layers. The video conveys clean energy at scale without competing for the animated text overlay and logo entrance.

The video plays on **all viewports** (desktop, tablet, phone). A semi-transparent dark overlay sits between the video and the particle/content layers to ensure text legibility. Users with `prefers-reduced-motion` see a static poster image instead.

**Key constraint:** The video files already exist and are compressed:
- `hero-bg.mp4` — 660 KB
- `hero-bg.webm` — 874 KB
- `hero-poster.jpg` — 118 KB (static fallback frame)

These are currently in `apps/web/src/assets/` and must be moved to `public/video/` for CDN serving.

## 2. Goals

| Goal | Metric |
|------|--------|
| Add cinematic depth to hero without hurting performance | LCP remains < 2.5s on 4G throttled connection |
| Video loads instantly on desktop | Video `canplay` event fires within 1s of page load (preloaded) |
| Zero bandwidth waste on reduced-motion users | No video bytes downloaded when `prefers-reduced-motion: reduce` is active |
| Clean visual loop | No visible jump or stutter at the loop point (cross-fade masks seam) |
| Maintain existing animation stack | Particles + CursorRipple continue to render on desktop, layered above the darkened video |

## 3. User Stories

1. **As a site visitor on desktop**, I want to see a cinematic looping video of a solar community behind the hero text so that I immediately associate CES with large-scale clean energy.

2. **As a sales engineer on a phone in a client meeting**, I want the video to play smoothly even on mobile so that the hero section feels premium regardless of device.

3. **As a user with motion sensitivities**, I want the video to be replaced by a static image so that the page doesn't trigger discomfort.

4. **As a developer maintaining the site**, I want the video component to be self-contained and respect the existing animation layer stack so that I can modify the hero without breaking the video or vice versa.

## 4. Functional Requirements

### 4.1 Asset relocation
- **FR-1:** Move `hero-bg.mp4`, `hero-bg.webm`, and `hero-poster.jpg` from `apps/web/src/assets/` to `apps/web/public/video/`.
- **FR-2:** Remove the original `A_sustainable_energy_202602111559_688pb.mp4` source file from `src/assets/` (it's the uncompressed original, 2.7 MB, not needed in the build).

### 4.2 Video element
- **FR-3:** Render an HTML `<video>` element inside the hero section with these attributes:
  - `autoPlay` — starts playing as soon as enough data is buffered
  - `muted` — required for autoplay to work in all browsers without user gesture
  - `loop` — video restarts after ending
  - `playsInline` — prevents iOS from hijacking into fullscreen
  - `poster="/video/hero-poster.jpg"` — shown while video loads or if it fails
  - `preload="auto"` — browser should download the full video eagerly (files are < 1 MB)
- **FR-4:** Provide two `<source>` children inside the `<video>` element:
  - `<source src="/video/hero-bg.webm" type="video/webm">` (listed first — WebM is smaller and better supported in modern browsers)
  - `<source src="/video/hero-bg.mp4" type="video/mp4">` (fallback for Safari < 16 and legacy browsers)
- **FR-5:** The video must cover the entire hero section without letterboxing or pillarboxing. Use CSS `object-fit: cover` and `object-position: center` on the `<video>` element, with `absolute` positioning and `inset-0` to fill the container.

### 4.3 Layer stack (z-index order, bottom to top)
- **FR-6:** The hero section's visual layers must stack in this order:
  1. **Video** (`z-0`) — looping background video, `absolute inset-0`
  2. **Dark overlay** (`z-10`) — semi-transparent black layer for text legibility
  3. **Particles** (`z-20`) — existing `ParticlesBackground` (desktop only, fades in after hero animation)
  4. **CursorRipple** (`z-30`) — existing cursor water ripple (desktop only, fades in with particles)
  5. **Content** (`z-40`) — logo, headline, CTA button

  The existing radial gradient divs (mobile and desktop) should be **removed** — the video + dark overlay replaces them as the background treatment.

### 4.4 Dark overlay
- **FR-7:** Place a `<div>` between the video and the particle layer with:
  - `background-color: black`
  - `opacity: 0.45` (45% — tune visually, but start here)
  - `absolute inset-0`
  - This ensures white text and the gold logo remain legible over any frame of the video.

### 4.5 Loop cross-fade
- **FR-8:** Implement a soft cross-fade at the video loop point to mask any visible seam. Approach:
  - Listen for the `timeupdate` event on the `<video>` element.
  - When the current time reaches within ~0.5s of the video's `duration`, begin fading the video's opacity from 1 to 0 over ~0.4s (CSS transition or GSAP tween).
  - On the `seeked` or `playing` event after loop restart, fade opacity back from 0 to 1 over ~0.4s.
  - The poster image (or the dark overlay over black) shows through during the brief dip, which reads as a subtle pulse rather than a jump cut.
  - **Alternative (simpler):** If the loop is tested and found to be seamless, skip this and just use native `loop`. The cross-fade is a safety net.

### 4.6 Reduced motion
- **FR-9:** If `window.matchMedia('(prefers-reduced-motion: reduce)')` matches:
  - Do **not** render the `<video>` element at all (no bytes downloaded).
  - Instead, render an `<img>` (or `next/image`) with `src="/video/hero-poster.jpg"` as a static background, using the same `absolute inset-0 object-cover` styling as the video.
  - The dark overlay still renders on top of the poster image.
- **FR-10:** Use Tailwind's `motion-reduce:` utility or a JS check — but since the video element itself must be conditionally rendered (not just paused), a runtime `matchMedia` check in the component is required to prevent the video from being added to the DOM at all.

### 4.7 Responsive behavior
- **FR-11:** The video plays on **all viewports** — desktop, tablet, and phone. No viewport-gated rendering.
- **FR-12:** On phone viewports (< 768px), consider adding `preload="metadata"` instead of `preload="auto"` to let the browser decide whether to eagerly fetch the full video. At 660 KB this is optional — note it as a tuning knob, not a hard requirement.

### 4.8 Performance
- **FR-13:** The video element must not block or delay LCP. The existing `priority` hero images (logo SVGs) are the LCP candidates — the video is decorative background and should not compete.
- **FR-14:** Add a `<link rel="preload" as="video" href="/video/hero-bg.webm" type="video/webm">` in the `<head>` (via Next.js `metadata` or a `<Head>` tag) to hint the browser to start fetching the video early. Only preload the WebM (primary format); don't preload both.

### 4.9 Accessibility
- **FR-15:** The `<video>` element must have `aria-hidden="true"` since it is purely decorative (no informational content, no audio track).
- **FR-16:** Do not add any play/pause controls to the video — it is ambient background, not user-controlled media.

## 5. Non-Goals / Out of Scope

- **Video generation or editing** — the Veo 3 video is final. No re-rendering, color grading, or trimming.
- **Audio** — the video is silent (`muted`). No audio track, no volume controls.
- **User controls** — no play/pause/scrub UI. The video is ambient, not interactive media.
- **Adaptive bitrate / multiple resolutions** — at < 1 MB total, a single resolution per format is sufficient. No HLS/DASH streaming.
- **Video on other sections** — this feature is hero-only.
- **Replacing particles or CursorRipple** — both remain on desktop, layered above the video.
- **Offline caching of video** — service worker / PWA caching of the video is a separate concern.

## 6. Design Considerations

- **Visual hierarchy:** The video is the lowest visual layer — it sets mood, not demands attention. The dark overlay + particle layer ensure the logo and headline remain the focal point.
- **Color harmony:** The Veo 3 clip features warm sunset tones and green foliage. The 45% black overlay will desaturate these, pushing them into the background. The gold chevron and brand-gold CTA button will pop against this muted warm palette.
- **Poster frame:** `hero-poster.jpg` shows the same sunset / PV community scene. It's 118 KB and serves triple duty: video `poster` attribute (shown while buffering), reduced-motion static fallback, and the brief flash visible during loop cross-fade.
- **Loop feel:** The cross-fade at loop boundaries should feel like a gentle "breathing" pulse — not a jarring cut. If the native loop is clean enough on testing, the cross-fade can be removed as an optimization.

## 7. Technical Considerations

### Component structure
- Create a new `HeroVideo.tsx` client component in `apps/web/src/components/` (needs `"use client"` for `matchMedia` check and `timeupdate` event listener).
- Import `HeroVideo` in `Hero.tsx` and place it as the first child inside the `<section>`, before the overlay and particle layers.
- This keeps the video logic isolated — the Hero component just positions it.

### Why `public/video/` not `src/assets/`
- Files in `public/` are served as-is from the CDN (CloudFront via SST). No webpack processing, no base64 inlining risk, proper `Cache-Control` headers.
- Files in `src/assets/` go through webpack's asset pipeline, which is designed for images and small files — not 660 KB video blobs. Webpack might inline them as data URLs or add unnecessary hashing overhead.
- `public/` paths are stable (`/video/hero-bg.webm`) and can be preloaded in `<head>`.

### Browser compatibility
- **WebM (VP9):** Supported in Chrome, Firefox, Edge, Opera, Safari 16.4+. Listed first as primary.
- **MP4 (H.264):** Universal fallback. Every browser supports this.
- The `<source>` fallback chain means the browser picks the first format it supports.

### GSAP integration
- The existing `useGSAP()` hook in Hero.tsx manages the text entrance animation. The video component is independent — it doesn't need GSAP coordination since it preloads and plays immediately.
- The loop cross-fade can use either CSS transitions (`transition: opacity 0.4s`) or a lightweight GSAP tween. CSS transitions are preferred to avoid coupling the video to GSAP.

### SST / CloudFront
- Files in `public/` are deployed to the S3 static asset bucket by `sst.aws.Nextjs`. CloudFront serves them with long-lived cache headers. No additional SST config needed.
- The `<link rel="preload">` hint will cause CloudFront to serve the video from edge cache on subsequent visits.

## 8. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| LCP on desktop | < 2.5s (no regression from current) | Lighthouse / WebPageTest |
| LCP on mobile (4G) | < 3.0s | Lighthouse with 4G throttle |
| Video plays within | < 2s of page load on broadband | Manual testing, `canplay` event timestamp |
| CLS | 0 (no layout shift from video) | Lighthouse |
| Total initial page weight | < 1.5 MB (current ~500 KB + ~900 KB video) | DevTools Network tab |
| Reduced-motion users | 0 video bytes transferred | DevTools with `prefers-reduced-motion` emulated |
| Loop seam | Invisible or masked by cross-fade | Visual QA on Chrome, Safari, Firefox |

## 9. Open Questions

1. **Overlay opacity tuning:** 45% is a starting point. Should this be adjustable via a CSS custom property (`--video-overlay-opacity`) for easy visual tuning, or hardcoded after visual QA?
2. **Video duration:** How long is the Veo 3 clip? If it's very short (< 5s), the cross-fade might fire too frequently and feel distracting. May need to test and adjust the fade timing.
3. **Future videos:** If CES wants to rotate hero videos (e.g., seasonal or per-service), should the component accept the video source as a prop now, or hardcode the paths and refactor later?
4. **Preload on mobile:** At 660 KB, preloading on all devices is reasonable. But if analytics later show mobile users on very slow connections, should we add a "data saver" check (`navigator.connection.saveData`) to skip the video?
