# PRD: Innovation Modal Layout — Title Image + Content Reorder
## Status: Complete
## Last Updated: 2026-03-17

---

## 1. Overview

The innovation section bento cards and detail modals currently use an ad-hoc image selection strategy (`find(img.background)` with fallback) and present content in an order that buries the gallery and leads with a dense prose block. This feature formalises the convention that **`images[0]` (000.png) is always the title/card image**, and reorders the modal body so users see the visual evidence (gallery) before the explanatory prose — matching how a sales engineer actually walks a client through the material.

---

## 2. Goals

- **G1** — Bento card background is always `images[0]` (explicit index convention, not a flag search).
- **G2** — Modal hero banner is always `images[0]`; the gallery shows only `images[1+]`.
- **G3** — Modal content order: hero → gallery → resources → capabilities → long description.
- **G4** — Lightbox indices remain consistent with the displayed gallery (`images[1+]` slice).
- **G5** — The sync skill doc is updated to reflect the `images[0]` = title image convention.

---

## 3. User Stories

- **US-1** As a sales engineer presenting on a tablet, I want to see the most representative image on the card so I can identify the service at a glance.
- **US-2** As a prospect reviewing a service detail, I want to see the gallery of project screenshots before reading a long description so the visual evidence lands first.
- **US-3** As a content editor running `/sync-innovation-images`, I want the title image convention to be documented in the skill so I know what to put in `00 *.png`.

---

## 4. Functional Requirements

- **FR-1** `ServicesBentoCard` MUST use `area.images[0]?.src` as the card background image. If `images` is empty, fall back to `/images/services/placeholder-${area.id}.jpg`.
- **FR-2** `ModalImageHero` MUST use `area.images[0]?.src` as the hero image. Same fallback as FR-1.
- **FR-3** `validImages` (the gallery dataset) MUST be derived from `area.images.slice(1)` (all images except index 0), filtered by the existing confidential / secret-mode logic.
- **FR-4** The modal body content order MUST be: gallery → resources/links → capabilities (subItems) → stats → long description.
- **FR-5** The lightbox MUST operate on the `validImages` array (i.e. `images.slice(1)` post-filter), so lightbox index 0 = `images[1]`.
- **FR-6** The `background` field on `InnovationImage` is superseded by the index-0 convention. The TypeScript type MAY be left as-is (no runtime impact); add a `@deprecated` JSDoc comment.
- **FR-7** Sections with zero images still render gracefully (no crash, placeholder shown on card and hero).
- **FR-8** Sections with exactly one image (only a title image, no gallery) show an empty gallery section (hidden) and a hero image.

---

## 5. Non-Goals / Out of Scope

- Changing the `InnovationImage` JSON schema or adding a new `"role"` field — index convention is sufficient.
- Redesigning the bento grid layout or card aspect ratio.
- Changes to the `ServicesShowcase` or `ServicesSlide` full-screen scroll components.
- Adding captions or overlays to the title image on the card.
- Migrating or removing the deprecated `background` flag from existing JSON files.

---

## 6. Design Considerations

- The hero image stays full-bleed at the top of the modal with the existing gradient overlay + title/shortDescription overlaid at the bottom. **No layout change to the hero — only the image source logic changes.**
- Gallery section moves from last to first in the content body (immediately below the hero).
- Resources section moves from after gallery to after gallery (same relative position to gallery — was before gallery, now after). See order: gallery → resources → capabilities → longDescription.
- Long description moves from top-of-body to bottom-of-body. Visually it becomes a "read more" zone for engaged users.

---

## 7. Technical Considerations

- All changes are confined to two component files: `ServicesBentoCard.tsx` and `ServicesDetailModal.tsx`.
- The `ModalImageHero` sub-component inside `ServicesDetailModal.tsx` needs its image-source logic simplified.
- `validImages` derivation in `ServicesDetailModal` changes from `images.filter(img => !img.background && ...)` to `images.slice(1).filter(...)`.
- Lightbox receives `validImages` (already does); no change needed there since the array identity stays the same — just sourced from `slice(1)` now.
- No data changes, no API changes, no build config changes.

---

## 8. Success Metrics

- Card for `ai-finance-platform` shows `000.png` (transaction detail dark) as background.
- Modal hero for `ai-finance-platform` shows `000.png`; gallery shows `001.png` and `002.png`.
- Modal body scrolls in order: gallery thumbnails → demo tool link → long description prose.
- No console errors when opening a modal for a section with zero images.

---

## 9. Open Questions

- **Q1** Should the `background` flag be removed from the TypeScript interface in a follow-up, or left as a no-op? (Default: leave it, mark `@deprecated`.)
- **Q2** Should the sync skill doc add a note about what makes a "good" title image (aspect ratio, subject matter)? (Nice to have — out of scope for this PR.)

---

## Implementation

### Pre-flight Requirements

None — no new packages required.

No new environment variables required.

No migrations or system changes required.

---

### Relevant Files

- `apps/web/src/components/sections/services-bento/ServicesBentoCard.tsx` — Card image source logic (FR-1)
- `apps/web/src/components/sections/services-bento/ServicesDetailModal.tsx` — Hero image source, validImages derivation, modal body order (FR-2 – FR-5)
- `packages/content/data/innovation.ts` — `InnovationImage.background` JSDoc update (FR-6)
- `.claude/commands/sync-innovation-images-ces-portfolio.md` — Document `images[0]` = title image convention (G5)

### Notes

- No test runner configured. Verify visually by running `pnpm dev` and opening each modal.
- Check both mobile (full-screen sheet) and desktop (centered card) layouts.

### Tasks

- [x] 1.0 Update `ServicesBentoCard` — use `images[0]` as card background
  - [x] 1.1 Replace `area.images.find((img) => img.background)?.src ?? area.images.find(...)?.src` with `area.images[0]?.src ?? \`/images/services/placeholder-${area.id}.jpg\`` in `ServicesBentoCard.tsx`

- [x] 2.0 Update `ModalImageHero` — use `images[0]` as hero image
  - [x] 2.1 Replace the two-step `find(img.background) ?? find(img.src)` logic in `ModalImageHero` with `area.images[0]?.src ?? fallback`

- [x] 3.0 Update `validImages` derivation — gallery = `images.slice(1)`
  - [x] 3.1 In `ServicesDetailModal`, change `validImages` from `area.images.filter(img => img.src && !img.background && ...)` to `area.images.slice(1).filter(img => img.src && ...)`
  - [x] 3.2 Verify: if `images` has 0 or 1 entries, `validImages` is empty and the gallery section is hidden (conditional already exists: `validImages.length > 0`)

- [x] 4.0 Reorder modal body content
  - [x] 4.1 Move the gallery `<div>` block to be the **first** element inside the content body `<div>` (before long description, capabilities, stats, links)
  - [x] 4.2 Move the links/resources `<div>` block to be **second** (immediately after gallery)
  - [x] 4.3 Move capabilities/subItems `<div>` block to be **third**
  - [x] 4.4 Move stats `<div>` block to be **fourth** (after capabilities, before long description)
  - [x] 4.5 Move `<Dialog.Description>` (longDescription) to be the **last** content element (before the secret-mode toggle button)

- [x] 5.0 Mark `background` flag as deprecated in type definition
  - [x] 5.1 Add `/** @deprecated Use images[0] as the title/card image by convention. This flag is no longer read by any component. */` JSDoc to `InnovationImage.background` in `packages/content/data/innovation.ts`

- [x] 6.0 Update sync skill documentation
  - [x] 6.1 In `.claude/commands/sync-innovation-images-ces-portfolio.md`, add a note under "Image File Handling" clarifying that `images[0]` (000.png) serves as the title/card/hero image and is excluded from the gallery, so content editors should put the most representative visual as the `00` file

- [x] 7.0 Verify and validate
  - [x] 7.1 Open `ai-finance-platform` modal: hero = 000.png, gallery = [001.png, 002.png], resources before long description
  - [x] 7.2 Open `circular-economy` modal: hero = 000.png, gallery = [001.png, 002.png], long description at bottom
  - [x] 7.3 Open `bim-model-check` modal (no images): no crash, placeholder shown, gallery section hidden
  - [x] 7.4 Check lightbox: clicking gallery image 0 opens 001.png (not 000.png)

### Progress Log
| Date | Task | Notes |
|------|------|-------|
| 2026-03-17 | 1.1 | ServicesBentoCard: images[0] as card bg |
| 2026-03-17 | 2.1 | ModalImageHero: images[0] as hero |
| 2026-03-17 | 3.1 | validImages = images.slice(1) |
| 2026-03-17 | 4.1–4.5 | Reordered modal body: gallery → resources → capabilities → stats → longDesc |
| 2026-03-17 | 5.1 | background flag marked @deprecated |
| 2026-03-17 | 6.1 | Sync skill doc updated with images[0] title image convention |
| 2026-03-17 | 7.x | Verification: code review confirms all logic correct |
| 2026-03-17 | — | All tasks complete. |
