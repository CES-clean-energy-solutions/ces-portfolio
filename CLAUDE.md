# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CES Clean Energy Solutions — a scroll-driven marketing site for a Vienna-based engineering consultancy (energy, environment, sustainable urban development). The site is the sales team's primary reference tool when presenting to clients in the field. Mobile performance is a hard requirement — sales engineers pull up project references on phones/iPads in meeting rooms with potentially poor connectivity.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, React 19, Turbopack as default bundler)
- **Styling:** Tailwind CSS v4 (CSS-first config with `@theme` directive — no `tailwind.config.js`)
- **Components:** shadcn/ui (Radix UI primitives, copy-paste pattern, `npx shadcn@latest add <component>`)
- **Animation:** GSAP 3.12.7 + @gsap/react (scroll-driven timelines), Motion 12.4.7 (declarative React animations), Lenis 1.1.20 (smooth scroll, desktop-only)
- **Analytics:** Plausible via next-plausible (GDPR-compliant, cookie-free, no consent banner needed)
- **Monorepo:** Turborepo + pnpm workspaces
- **Deployment:** SST v3 → AWS eu-central-1 (OpenNext adapter, ~70 AWS resources per site)
- **Package manager:** pnpm 9.15.4 (enforced — no npm/yarn lock files)

## Monorepo Structure

```
apps/web/          → @ces/web — Next.js marketing site (port 4200)
packages/ui/       → @repo/ui — shared component library and brand assets
docs/              → technical-architecture.md (871-line tech brief), BRAND.md
tasks/             → PRDs and task lists (generated via /prd command)
```

Internal packages use `workspace:*` protocol (e.g., `"@repo/ui": "workspace:*"`).

Planned but not yet created: `apps/marimo/` (Python notebook server), `apps/dashboard/`, `packages/config/`, `packages/utils/`.

## Commands

```bash
# Development
pnpm dev                    # runs dev server on port 8080 (root, via next --turbopack)
pnpm --filter @ces/web dev  # runs web app only on port 4200

# Build & quality
pnpm build                  # turborepo build (all packages)
pnpm lint                   # eslint across monorepo
pnpm type-check             # tsc --noEmit across monorepo

# Single package
pnpm --filter @ces/web build
pnpm --filter @ces/web lint
pnpm --filter @repo/ui build

# Deployment (SST v3)
pnpm deploy:dev             # sst deploy --stage dev
pnpm deploy                 # sst deploy --stage production

# Clean
pnpm clean                  # removes .next, dist, .turbo artifacts

# shadcn/ui components
npx shadcn@latest init      # initialize in apps/web
npx shadcn@latest add button card dialog navigation-menu sheet
```

## Architecture Decisions

**Rendering strategy:** Almost everything is SSG (static). ISR via `"use cache"` directive for CMS-managed content only. SSR is avoided. CSR reserved for interactive widgets behind `"use client"`. Contact forms use SSG page + Server Action.

**Server Components are the default.** Only use `"use client"` for: menus (state toggle), forms (onChange), lightboxes (click), scroll animations (useGSAP/useEffect), carousels. Keep client components small and leaf-level.

**Tailwind v4 tokens** are defined in `apps/web/src/app/globals.css` using CSS custom properties + `@theme inline` block. No separate tailwind config file exists. Brand colors: Gold `oklch(0.75 0.12 85)` / `#D4A843`, Black `#000000`. Colors use OKLCH color space.

**Path alias:** `@/*` maps to `apps/web/src/*` (configured in tsconfig).

**Fonts:** Self-hosted via `next/font` (zero external requests, GDPR-friendly). No Google Fonts CDN.

## Animation Architecture

Three libraries with distinct responsibilities — **never animate the same property on the same element with both GSAP and Motion simultaneously**.

| Layer | Library | Responsibility |
|-------|---------|----------------|
| Smooth scrolling | Lenis | Normalizes scroll input, desktop only (≥1024px) |
| Scroll-driven animations | GSAP ScrollTrigger | Pinning, scrubbing, timelines, text splitting |
| Component animations | Motion | Declarative mount/exit, gestures, layout transitions |

**Critical integration:** Lenis must sync with GSAP's ticker (`lenis.on('scroll', ScrollTrigger.update)`). Initialize Lenis once at layout level.

**GSAP in React:** Use `useGSAP()` hook from `@gsap/react` (not `useEffect`) — it auto-cleans animations via `gsap.context()`. Requires `"use client"`. Register plugins with `gsap.registerPlugin()`.

**Adaptive animation strategy (mobile-first):**
- Desktop (lg+): Full cinematic experience (Lenis, ScrollTrigger pin/scrub, SplitText chars)
- Tablet (md): Simplified (no Lenis, no pin, word-level SplitText)
- Phone: Minimal (no Lenis, simple fade-in, no SplitText). Use `ScrollTrigger.matchMedia()`.
- Respect `prefers-reduced-motion` — use `motion-reduce:transition-none`.
- Lazy-load animation libs with `next/dynamic` + `ssr: false` for below-fold sections.

## Mobile Performance Budgets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Total page weight (initial) | < 500 KB |
| JS bundle (initial) | < 150 KB |

Touch targets: 44x44px minimum (`min-h-11 min-w-11`). Use `next/image` with `sizes` prop for responsive images. Use `priority` on hero images.

## Content Strategy

Portfolio data: MDX + JSON files in Git (not a CMS). Structured metadata in TypeScript (`data/projects.ts`), narrative case studies in MDX. Headless CMS only when non-technical editors need to publish.

SEO: Metadata API with title templates (`%s | CES`), `app/sitemap.ts` for auto-generated sitemap, JSON-LD structured data (Organization, Service, Article schemas), per-project OG images via `next/og`.

## Deployment Architecture (SST v3 → AWS)

SST uses Pulumi engine + Terraform AWS providers under the hood. `sst.aws.Nextjs` component creates ~70 resources (CloudFront, S3, Lambda, DynamoDB, SQS, IAM, ACM). Config lives in `sst.config.ts` (not yet created).

```
User → CloudFront (CDN) → S3 (static assets) or Lambda (SSR/API/image optimization)
ISR cache → S3 + DynamoDB (tag-based revalidation) + SQS FIFO (stale-while-revalidate)
```

Marimo notebooks: separate containerized Python service, proxied via Next.js `rewrites` under `/demos/*` or embedded via iframe.

## Workflow: PRDs and Task Lists

Large features follow a structured workflow using custom commands in `.claude/commands/`:

1. `/prd <feature>` — generates a PRD with clarifying questions, saves to `/tasks/prd-[name].md`
2. `/generate-tasks` — converts a PRD into a numbered task list at `/tasks/tasks-prd-[name].md`
3. `/process-task-list` — works through tasks one sub-task at a time, pausing for user approval between each

## Key Files

- `docs/technical-architecture.md` — comprehensive 871-line tech brief covering all stack decisions, rendering strategies, animation patterns, deployment, and content management. **Read this first** when implementing new features.
- `docs/BRAND.md` — brand colors, typography rules, logo location (`packages/ui/src/assets/ces-logo.svg`)
- `apps/web/src/app/globals.css` — design token source of truth (CSS custom properties + `@theme inline`)
- `apps/web/src/app/layout.tsx` — root layout
- `packages/ui/src/index.ts` — shared UI barrel export (currently empty, ready for components)
