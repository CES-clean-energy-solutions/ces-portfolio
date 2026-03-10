# PRD: Confidential References — "Secret Mode" for Service Detail Modals
## Status: Draft
## Last Updated: 2026-03-10

---

## 1. Overview

The service detail modals display reference links (project demos, tools, case studies) alongside each innovation area. Some of these references are confidential — not suitable for all client audiences — while others are public. Currently there is no distinction in the data or UI. This feature adds a `confidential` flag to reference links in the content data, and a hidden "secret mode" toggle in the modal. When a sales engineer activates secret mode, all confidential references become visible. The state is persisted to `localStorage` so the engineer only unlocks once per device. Clients never see the unlock affordance; it is invisible to the casual eye.

---

## 2. Goals

- **G1** — Add a `confidential` boolean field to the `InnovationLink` data model so authors can tag sensitive references in JSON.
- **G2** — Confidential references are hidden by default when the modal opens; only public links render.
- **G3** — A discreet, hidden tap zone inside each service detail modal toggles "secret mode" for that session device-wide.
- **G4** — Secret mode persists across browser sessions via `localStorage`, so sales engineers don't re-unlock on every visit.
- **G5** — When secret mode is active, confidential links are visually distinguished from public ones (e.g. a subtle lock badge) so the engineer knows they are viewing privileged content.

---

## 3. User Stories

- **US-1** — As a sales engineer, I want to reveal confidential project references during a client meeting without appearing to toggle anything suspicious, so I can control what the client sees.
- **US-2** — As a content author, I want to mark individual links as `confidential: true` in the JSON file, so I can manage sensitivity per-link without restructuring the data.
- **US-3** — As a sales engineer, I want my unlock state remembered on my device, so I don't have to re-activate on every visit.
- **US-4** — As a sales engineer, I want a visual indicator that secret mode is active, so I know I'm viewing all references.
- **US-5** — As a content author, I want confidential links to fall back gracefully to hidden if the flag is missing, so unmarked links default to public.

---

## 4. Functional Requirements

- **FR-1** — The `InnovationLink` interface in `packages/content/data/innovation.ts` must gain an optional `confidential?: boolean` field. Omitting the field is equivalent to `false` (public).
- **FR-2** — `ServicesDetailModal` must read a global "secret mode" boolean from a React context (or custom hook backed by `localStorage`).
- **FR-3** — When secret mode is `false`, only links where `confidential !== true` are rendered in the Resources section. Links with `confidential: true` are not rendered and leave no visible placeholder.
- **FR-4** — When secret mode is `true`, all links (public + confidential) are rendered. Confidential links display a small lock icon badge so the engineer can distinguish them.
- **FR-5** — The hidden unlock affordance is a small, low-opacity element placed in the modal footer area (bottom-right corner of the modal card). It must be visually unobtrusive — no label, no tooltip, opacity ≤ 20% when locked.
- **FR-6** — Clicking/tapping the affordance toggles secret mode globally (affects all service modals). The affordance changes appearance to indicate active state (e.g. lock icon becomes gold at full opacity).
- **FR-7** — Secret mode state is stored in `localStorage` under the key `ces-secret-mode` as a JSON boolean string. It is read on app mount and kept in sync via a custom hook `useSecretMode`.
- **FR-8** — The `useSecretMode` hook must export `{ isSecret: boolean, toggle: () => void }`.
- **FR-9** — No server-side rendering of secret mode state. The hook must initialize with `false` on the server and read `localStorage` on the client only (avoids hydration mismatch).
- **FR-10** — The unlock affordance must meet the 44×44px minimum touch target requirement, but the visible area can be smaller (use padding/invisible hit area).

---

## 5. Non-Goals / Out of Scope

- No authentication or password protection — this is a convenience toggle, not a security control. Confidential content is still delivered to the browser; it is only hidden by UI state.
- No per-service or per-modal independent unlock state — one global toggle covers all modals.
- No admin UI for managing the `confidential` flag — authors edit JSON directly.
- No audit logging of when secret mode is activated.
- No expiry timer on the unlock state (beyond clearing `localStorage`).
- No changes to the bento cards, gallery images, or any content outside the "Resources" links section.

---

## 6. Design Considerations

- **Hidden affordance placement:** Bottom-right corner of the modal card, inside the content body padding zone. A `<Lock>` / `<LockOpen>` icon from `lucide-react` at `w-4 h-4`, wrapped in a 44×44px invisible button. Default: `opacity-20 text-white/40`. Active: `opacity-100 text-brand-gold`.
- **Confidential link badge:** A `<Lock className="w-3 h-3 text-brand-gold/60" />` icon appended after the link label. Subtly communicates privileged status without being alarming.
- **Transition:** Use `AnimatePresence` from Motion to fade confidential links in/out when mode toggles, matching the existing modal animation style.
- **Accessibility:** The secret button should have `aria-label="Toggle reference visibility"` and `aria-pressed={isSecret}` so it is operable by keyboard/screen reader (even though it's visually hidden).

---

## 7. Technical Considerations

- **Data location:** Six JSON files under `packages/content/data/innovation/{id}/section-description.json`. The `links` array in each file will gain `"confidential": true` on applicable entries.
- **Type update:** `InnovationLink` in `packages/content/data/innovation.ts` needs `confidential?: boolean`.
- **`useSecretMode` hook:** Lives at `apps/web/src/hooks/useSecretMode.ts`. Uses `useState` + `useEffect` pattern to safely read `localStorage` on client only.
- **Context vs prop-drilling:** Secret mode is global, so a lightweight React context (`SecretModeProvider`) wraps the app in `layout.tsx` and exposes `useSecretMode()`. This avoids prop-drilling through `ServicesBento → ServicesDetailModal`.
- **No new npm packages required** — `lucide-react` (already installed) provides the `Lock`/`LockOpen` icons. `localStorage` is native.

---

## 8. Success Metrics

- Sales engineers can reveal confidential references in under 3 taps without the client noticing.
- Zero confidential links visible on fresh page load (secret mode defaults to `false`).
- Unlock persists across page refreshes and new browser tabs on the same device.
- No hydration errors in the Next.js SSR build.

---

## 9. Open Questions

- **OQ-1** — Which specific links across the six services should be marked `confidential: true`? The PRD assumes content authors (or the product owner) will tag these in the JSON. The feature ships with all existing links remaining `confidential: false` (public) until authors decide.
- **OQ-2** — Should there be a visible "you are in secret mode" indicator outside the modal (e.g. a subtle indicator in the header) so the engineer always knows the global state? Currently proposed as modal-only.

---

## Implementation

### Pre-flight Requirements

> No new npm packages required — all dependencies (`lucide-react`, `localStorage`, React context) are already available.

**New npm packages:** None — no new packages required.

**Environment variables:** None — no new env vars required.

**Other system changes:** None.

---

### Relevant Files

- `packages/content/data/innovation.ts` — Add `confidential?: boolean` to `InnovationLink` interface
- `packages/content/data/innovation/{id}/section-description.json` — Six data files where `confidential: true` can be applied to links (authors tag them; implementation leaves existing links as public)
- `apps/web/src/hooks/useSecretMode.ts` — New hook: reads/writes `localStorage`, returns `{ isSecret, toggle }`
- `apps/web/src/contexts/SecretModeContext.tsx` — New context provider wrapping the hook
- `apps/web/src/app/layout.tsx` — Wrap app with `SecretModeProvider`
- `apps/web/src/components/sections/services-bento/ServicesDetailModal.tsx` — Consume `useSecretMode`, filter links, render lock affordance + badges

### Notes

- No test runner is currently configured. Verify manually: open a service modal, confirm confidential links are hidden; activate secret mode, confirm they appear with lock badges; refresh page, confirm mode is remembered.
- The `useSecretMode` hook must guard against `typeof window === 'undefined'` to avoid SSR crashes.

### Tasks

- [ ] 1.0 Update data model
  - [ ] 1.1 Add `confidential?: boolean` to the `InnovationLink` interface in `packages/content/data/innovation.ts`
  - [ ] 1.2 Verify TypeScript build passes with `pnpm type-check` — no errors expected since the field is optional

- [ ] 2.0 Create `useSecretMode` hook
  - [ ] 2.1 Create `apps/web/src/hooks/useSecretMode.ts` — initialise state as `false` on server, read `localStorage` key `ces-secret-mode` on client in `useEffect`
  - [ ] 2.2 Implement `toggle()` function that flips the boolean and writes to `localStorage`
  - [ ] 2.3 Export type `SecretMode = { isSecret: boolean; toggle: () => void }`

- [ ] 3.0 Create `SecretModeContext` and wire into layout
  - [ ] 3.1 Create `apps/web/src/contexts/SecretModeContext.tsx` — wrap `useSecretMode` in a React context with a `SecretModeProvider` component and a `useSecretModeContext` consumer hook
  - [ ] 3.2 Add `"use client"` directive to the context file (context relies on `localStorage`)
  - [ ] 3.3 Import and wrap the app with `<SecretModeProvider>` in `apps/web/src/app/layout.tsx`

- [ ] 4.0 Update `ServicesDetailModal` — filtering and lock affordance
  - [ ] 4.1 Import `useSecretModeContext` in `ServicesDetailModal.tsx`
  - [ ] 4.2 In the Resources section, filter `area.links` so links where `confidential === true` are excluded when `isSecret === false`
  - [ ] 4.3 When `isSecret === true`, render all links and append a `<Lock className="w-3 h-3 text-brand-gold/60 ml-1 shrink-0" />` badge inline after the label for confidential links
  - [ ] 4.4 Add the hidden toggle button in the modal content body (bottom-right, inside the padding zone): a 44×44px button containing `Lock` (locked) or `LockOpen` (unlocked) icon, `opacity-20` when locked and `opacity-100 text-brand-gold` when unlocked
  - [ ] 4.5 Wire the button's `onClick` to `toggle()` from context
  - [ ] 4.6 Wrap confidential link entries in `<AnimatePresence>` so they fade in/out smoothly when mode changes

- [ ] 5.0 Integration check
  - [ ] 5.1 Manually verify: open any service modal → Resources section shows only public links (or no Resources section if all links are confidential and none exist yet)
  - [ ] 5.2 Manually verify: click the hidden lock affordance → confidential links appear with lock badge, affordance turns gold
  - [ ] 5.3 Manually verify: refresh the page → secret mode state is remembered, confidential links still visible
  - [ ] 5.4 Manually verify: click the affordance again → confidential links hide, affordance returns to dim state
  - [ ] 5.5 Run `pnpm type-check` and confirm zero TypeScript errors

### Progress Log

| Date | Task | Notes |
|------|------|-------|
| | | |
