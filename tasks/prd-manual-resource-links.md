# PRD: Manual Resource Links ("Coming Soon" Overlay)
## Status: In Progress
## Last Updated: 2026-03-18

## 1. Overview
Sales engineers present CES innovation demos to clients, but management doesn't want all demo links to be live-clickable — some are still in development. A new `Resources - MANUAL:` section in the content text files produces resource entries that, instead of navigating to a URL, open a small "Coming Soon" overlay modal with the tool's logo, name, and a copy-to-clipboard secret feature. This lets sales engineers show a polished "coming soon" card to clients while secretly copying the real URL for their own use.

## 2. Goals
- **G1:** Allow content authors to mark specific resource links as "manual/coming soon" via a simple text-file convention (`Resources - MANUAL:`)
- **G2:** Display a compact overlay modal instead of navigating to the URL when a manual resource is clicked
- **G3:** Enable sales engineers to secretly copy the real demo URL to clipboard by clicking the CTA text
- **G4:** Coexist with existing `Resources:` (live links) — both types can appear in the same section

## 3. User Stories
- **US-1:** As a content author, I want to add `Resources - MANUAL:` entries in section text files so that demo links appear as "coming soon" instead of live links.
- **US-2:** As a sales engineer presenting to a client, I want to see a polished "coming soon" card when I click a manual resource, so the client sees we have upcoming tools without accessing unfinished demos.
- **US-3:** As a sales engineer, I want to secretly copy the real demo URL by clicking the CTA text, so I can quickly access the demo myself when needed.
- **US-4:** As a sales engineer, I want the overlay to auto-dismiss shortly after copying, so I can continue my presentation smoothly.

## 4. Functional Requirements
- **FR-1:** The sync command (`/sync-innovation-images`) must parse a new `Resources - MANUAL:` section in text files, using the same CSV format as `Resources:` (`icon-filename, label, url`).
- **FR-2:** `Resources - MANUAL:` entries produce `InnovationLink` objects with a new `manual: true` property in the JSON output.
- **FR-3:** Both `Resources:` and `Resources - MANUAL:` sections can coexist in the same text file. They are parsed independently and merged into the same `links` array.
- **FR-4:** The `InnovationLink` TypeScript interface must add an optional `manual?: boolean` field.
- **FR-5:** In `ServicesDetailModal`, links with `manual: true` render as buttons (not anchor tags) that open an overlay modal instead of navigating.
- **FR-6:** The overlay modal is a small centered card with dark glass-morphism styling (consistent with the detail modal's design language). It contains:
  - The resource icon/logo at the top (if available)
  - The tool/service name
  - A CTA line: "Coming soon — ask for early access"
- **FR-7:** Clicking the CTA text copies the link's real `href` URL to the system clipboard and shows a brief "Copied!" confirmation (inline text change, no separate toast).
- **FR-8:** The overlay auto-dismisses ~1.5s after the URL is copied. It can also be dismissed manually via clicking outside or an X button.
- **FR-9:** The overlay appears on top of the existing detail modal (higher z-index), with a semi-transparent backdrop.
- **FR-10:** Manual resource links use the same confidential/secret-mode filtering as regular links (if `confidential: true`, hidden unless secret mode is active).

## 5. Non-Goals / Out of Scope
- No changes to how regular `Resources:` (live links) work
- No admin UI for toggling manual/live — this is controlled entirely by the text file format
- No analytics tracking for copy events
- No server-side clipboard API — client-side `navigator.clipboard` only
- No changes to PDF export (manual links can render the same as regular links in PDF)

## 6. Design Considerations
- The overlay modal should be visually compact (~320px wide max) — it sits on top of the already-open detail modal
- Use the same border/glass styling (`border-white/10`, `bg-neutral-950/90 backdrop-blur`) as the detail modal
- The CTA text should have a subtle hover state (brand-gold color) to hint it's interactive without being obvious to onlookers
- Motion animation: fade-in/scale for the overlay, consistent with existing modal transitions
- Mobile: overlay should be centered with appropriate padding, not full-screen

## 7. Technical Considerations
- **Data layer change:** Add `manual?: boolean` to `InnovationLink` interface in `packages/content/data/innovation.ts`
- **Sync command change:** Update parsing rules in the sync command markdown to handle `Resources - MANUAL:` as a new section header
- **Component change:** New `ManualResourceModal` component (or inline in `ServicesDetailModal`) using Radix Dialog for the overlay
- **Clipboard API:** Use `navigator.clipboard.writeText()` — widely supported, but wrap in try/catch for graceful degradation
- **No new dependencies** — Radix Dialog is already available, Motion is already used

## 8. Success Metrics
- Sales engineers can present innovation pages without clients accidentally navigating to unfinished demos
- Copy-to-clipboard works reliably across Chrome, Safari, Firefox on desktop and mobile
- No visual regression in existing resource link rendering

## 9. Open Questions
- None — all questions resolved in discovery phase.

---

## Implementation

### Pre-flight Requirements

> ⚠️ This project runs in a **VS Code dev container**. Dependencies cannot be installed at runtime.
> Any items listed here MUST be completed and the container rebuilt BEFORE running `/implement`.
> Starting a new Claude session after rebuilding is required.

**New npm packages:** None — no new packages required.

**Environment variables:** None — no new env vars required.

**Other system changes:** None.

---

### Relevant Files
- `packages/content/data/innovation.ts` — Add `manual?: boolean` to `InnovationLink` interface
- `packages/content/data/innovation/*/section-description.json` — Will contain `manual: true` on links when synced
- `.claude/commands/sync-innovation-images-ces-portfolio.md` — Add `Resources - MANUAL:` parsing rules
- `apps/web/src/components/sections/services-bento/ServicesDetailModal.tsx` — Render manual links differently, add overlay modal
- `apps/web/src/components/sections/services-bento/ManualResourceModal.tsx` — New overlay component

### Notes
- No test runner configured — manual testing via `pnpm dev`
- After implementation, run `/sync-innovation-images` on any section with `Resources - MANUAL:` entries to verify JSON output

### Tasks
- [x] 1.0 Data model update
  - [x] 1.1 Add `manual?: boolean` field to `InnovationLink` interface in `packages/content/data/innovation.ts` with JSDoc comment explaining its purpose
- [ ] 2.0 Update sync command documentation
  - [ ] 2.1 Add `Resources - MANUAL:` section header to the "Section Text File Format" canonical structure example
  - [ ] 2.2 Add parsing rules for `Resources - MANUAL:` — same CSV format as `Resources:`, but output JSON includes `"manual": true` on each link entry
  - [ ] 2.3 Update the field order documentation to show `Resources` → `Resources - MANUAL:` → `Description` (both optional, either or both can appear)
  - [ ] 2.4 Add a worked example showing a section with both types, e.g.:
    ```
    Resources:
    logo.jpg, CES Services, https://ic-ces.at/our_services/project-development-project-preparation/

    Resources - MANUAL:
    ce_tool_logo.png, Circular economy assessment tool, https://dev-ce.ic-ces.at/en
    ```
    Resulting JSON merges both into `links[]` — regular entry has no `manual` field, MANUAL entry has `"manual": true`
  - [ ] 2.5 Update the "JSON resource entry" template to show the `manual` variant
- [ ] 3.0 Create ManualResourceModal component
  - [ ] 3.1 Create `apps/web/src/components/sections/services-bento/ManualResourceModal.tsx` — a Radix Dialog overlay with: resource icon (next/image, if available), tool name, "Coming soon — ask for early access" CTA text
  - [ ] 3.2 Style as a compact centered card (~max-w-xs) with dark glass-morphism (`bg-neutral-950/90 backdrop-blur-xl border border-white/10 rounded-xl`)
  - [ ] 3.3 Implement clipboard copy on CTA text click: `navigator.clipboard.writeText(href)`, show inline "Copied!" confirmation replacing the CTA text briefly
  - [ ] 3.4 Implement auto-dismiss: close the overlay ~1.5s after successful copy
  - [ ] 3.5 Implement manual dismiss: click outside (backdrop) or X button closes the overlay
  - [ ] 3.6 Add Motion entrance/exit animation (opacity + scale, ~200ms)
- [ ] 4.0 Integrate into ServicesDetailModal
  - [ ] 4.1 In the links rendering section of `ServicesDetailModal.tsx`, render `manual: true` links as `<button>` elements (not `<a>`) that open `ManualResourceModal` instead of navigating
  - [ ] 4.2 Style manual link buttons identically to regular link anchors (same border, padding, icon layout) so they're visually consistent in the grid
  - [ ] 4.3 Add state management for which manual link is currently open (`useState<InnovationLink | null>`)
  - [ ] 4.4 Ensure manual links respect the same `confidential` / secret-mode filtering as regular links
- [ ] 5.0 Validation and cleanup
  - [ ] 5.1 Verify that a section-description.json with `"manual": true` links renders correctly — manual links open overlay, regular links navigate normally
  - [ ] 5.2 Verify clipboard copy works and "Copied!" feedback displays, then overlay auto-dismisses
  - [ ] 5.3 Verify both `Resources:` and `Resources - MANUAL:` entries coexist in a single section's JSON
  - [ ] 5.4 Verify mobile rendering — overlay is centered and not full-screen, dismiss gestures work

### Progress Log
| Date | Task | Notes |
|------|------|-------|
| 2026-03-18 | 1.1 | Added `manual?: boolean` to `InnovationLink` interface |
