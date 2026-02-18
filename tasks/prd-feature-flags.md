# PRD: Feature Flag Config for Page Sections

**Status:** Draft
**Date:** 2026-02-18
**Author:** Claude Code

---

## 1. Introduction / Overview

The CES portfolio site is under active development. Page sections are frequently added, revised, or temporarily removed as content strategy evolves. Currently there is no structured mechanism to hide a section — it requires either commenting out JSX in `page.tsx` or returning `null` directly from the component, both of which are ad-hoc and easy to lose track of.

This feature introduces a single `features.ts` configuration file that acts as the canonical list of which page sections are currently active. A developer can disable any section by changing one boolean and redeploying.

---

## 2. Goals

1. **Single source of truth** — all section visibility decisions live in one file, not scattered across component files and `page.tsx`.
2. **Legible** — a developer unfamiliar with the codebase can open `features.ts` and immediately understand which sections are enabled or disabled and why.
3. **Type-safe** — TypeScript enforces that every section has an explicit flag; adding a new section requires adding a flag (no accidental omissions).
4. **Zero runtime overhead** — flags are evaluated at build time; disabled sections produce no HTML, no JS bundle contribution, no network requests.
5. **No new dependencies** — implemented in plain TypeScript with no third-party libraries.

---

## 3. User Stories

1. **As a developer**, I want to disable the legacy services card grid by changing one value in one file, so that I don't have to hunt through `page.tsx` or component files to find where to comment things out.

2. **As a developer**, I want all section flags listed in one place even if currently all are enabled, so that when I need to hide a section in future I know exactly where to go.

3. **As a developer onboarding to this project**, I want to open `features.ts` and immediately understand which sections are live and which are hidden, without reading the entire page component.

4. **As a developer**, I want TypeScript to tell me if I add a new section to `page.tsx` without adding a corresponding flag, so that sections are never accidentally undocumented.

---

## 4. Functional Requirements

### 4.1 The `features.ts` file

**FR-1:** Create the file at `apps/web/src/config/features.ts`.

**FR-2:** The file must export a single `const` object named `features` with a boolean flag for every section rendered in `page.tsx`. Initial flags:

| Flag key | Corresponding section | Default value |
|---|---|---|
| `hero` | `Hero` | `true` |
| `servicesOverview` | `ServicesOverview` | `true` |
| `servicesShowcase` | `ServicesShowcase` | `true` |
| `servicesCards` | `ServicesSection` (old card grid) | `false` |
| `projectsPreview` | `ProjectsPreview` | `true` |
| `contactCta` | `ContactCta` | `true` |

**FR-3:** The object must be typed with an explicit `Features` interface where every value is `boolean`. The interface must be defined in the same file.

**FR-4:** Each flag must have an inline comment explaining what section it controls and — if currently disabled — a brief note on why (e.g. `// disabled: awaiting management sign-off`).

**FR-5:** The `features` object must use `as const` so TypeScript infers literal `true`/`false` types, not the wider `boolean` type.

### 4.2 Consumption in `page.tsx`

**FR-6:** Import `features` into `apps/web/src/app/page.tsx`.

**FR-7:** Each section render in `page.tsx` must be conditionally wrapped:
```tsx
{features.servicesCards && <ServicesSection />}
```

**FR-8:** When a flag is `false`, the section must contribute no output to the DOM — no wrapper elements, no comments, nothing.

**FR-9:** The `page.tsx` order of section renders must remain unchanged; flags only control presence, not order.

### 4.3 Disabled section behaviour

**FR-10:** When a section is disabled via its flag, its component file must NOT be modified. The component remains importable and functional; only `page.tsx` skips rendering it.

**FR-11:** No dev-mode placeholder is rendered for disabled sections. They are completely absent.

### 4.4 Adding future sections

**FR-12:** The `Features` interface in `features.ts` must be updated whenever a new section is added to `page.tsx`. This is a manual convention enforced by code review, not an automated check (out of scope for this PRD).

---

## 5. Non-Goals / Out of Scope

- **Per-environment flags** — all environments (dev, staging, prod) use the same flag values. Changing a flag for one environment means editing the file and redeploying that environment separately.
- **Runtime toggling** — flags are baked in at build time. No admin UI, no CMS integration, no API endpoint to flip flags without a redeploy.
- **A/B testing** — no variant support, no user bucketing, no analytics integration.
- **Dev-mode visual placeholders** — disabled sections return nothing; no styled "HIDDEN" banners.
- **Non-section config** — this file controls section visibility only. Feature flags for other behaviours (e.g. analytics, animations) are out of scope.
- **Modifying section component files** — components are not changed. Only `features.ts` and `page.tsx` are touched.

---

## 6. Design Considerations

None — this feature has no visual output. The only design consideration is code readability:

- The `features.ts` file should be short, scannable, and self-contained. Keep comments terse.
- Flags should be named after their logical purpose (`servicesCards`) not their component name (`ServicesSection`) so the flag name survives a component rename.

---

## 7. Technical Considerations

**TC-1:** `features.ts` is a plain TypeScript module (no `"use client"` or `"use server"` directives). It is a Server Component-compatible import.

**TC-2:** Because flags use `as const`, TypeScript infers `features.servicesCards` as literal `false`, not `boolean`. JSX conditional `{features.servicesCards && <ServicesSection />}` will be statically eliminated — no dead code at runtime.

**TC-3:** This pattern does not prevent the section's JS bundle from being included in the initial page load (tree-shaking at the import level is not guaranteed for JSX). If bundle size becomes a concern, use `next/dynamic` with `ssr: false` instead of a static import — but that is a separate optimisation task.

**TC-4:** File location `apps/web/src/config/` follows the conventional Next.js pattern for non-component, non-hook utility files. The `config/` directory does not currently exist and must be created.

**TC-5:** `page.tsx` is a Server Component. The import of `features.ts` adds zero client-side JS.

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Developer can disable a section with a 1-line change | Yes |
| `features.ts` lists every section in `page.tsx` | Yes (verified by code review) |
| No new runtime dependencies introduced | Yes |
| `ServicesSection` (cards) is disabled by default | Yes |
| Type error if `Features` interface key is missing a value | Yes |

---

## 9. Open Questions

| # | Question | Status |
|---|---|---|
| 1 | Should `Gallery` and `Stats` sections (currently not on the homepage) get flag slots now, or only when added to `page.tsx`? | Open |
| 2 | Is there a lint rule or CI check we could add to enforce that every section import in `page.tsx` has a corresponding `features` flag? | Open — out of scope for this PRD but worth a follow-up task |
