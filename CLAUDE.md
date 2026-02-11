# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CES Clean Energy Solutions — a scroll-driven marketing site for a Vienna-based engineering consultancy (energy, environment, sustainable urban development). The site is the sales team's primary reference tool when presenting to clients in the field. Mobile performance is a hard requirement — sales engineers pull up project references on phones/iPads in meeting rooms with potentially poor connectivity.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, React 19, Turbopack as default bundler)
- **Styling:** Tailwind CSS v4 (CSS-first config with `@theme` directive — no `tailwind.config.js`)
- **Components:** shadcn/ui (Radix UI primitives, copy-paste pattern, `npx shadcn@latest add <component>`)
- **Animation:** GSAP 3.12.7 + @gsap/react (scroll-driven timelines), Motion 12.4.7 (declarative React animations), Lenis 1.1.20 (smooth scroll, desktop-only), tsparticles (ambient particle background, desktop-only, lazy-loaded)
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

# Deployment (SST v3) — requires .env with AWS credentials
pnpm deploy:dev             # sst deploy --stage dev
pnpm deploy                 # sst deploy --stage production
pnpm diff:dev               # preview changes before deploying (like terraform plan)
pnpm diff                   # preview production changes
pnpm remove:dev             # tear down dev stage
pnpm remove                 # tear down production stage
pnpm refresh:dev            # sync local state with actual AWS resources
pnpm sst:state              # export full state as JSON (see all resources)
pnpm sst:secret             # list secrets for dev stage
pnpm sst:unlock             # release stuck deployment lock

# Clean
pnpm clean                  # removes .next, dist, .turbo artifacts

# shadcn/ui components
npx shadcn@latest init      # initialize in apps/web
npx shadcn@latest add button card dialog navigation-menu sheet
```

## Architecture Decisions

**Rendering strategy:** Almost everything is SSG (static). ISR via `"use cache"` directive for CMS-managed content only. SSR is avoided. CSR reserved for interactive widgets behind `"use client"`. Contact forms use SSG page + Server Action.

**Server Components are the default.** Only use `"use client"` for: menus (state toggle), forms (onChange), lightboxes (click), scroll animations (useGSAP/useEffect), carousels. Keep client components small and leaf-level.

**Tailwind v4 tokens** are defined in `apps/web/src/app/globals.css` using CSS custom properties + `@theme inline` block. No separate tailwind config file exists. Colors use OKLCH color space.

**Brand colors:**
- Web Gold: `oklch(0.75 0.12 85)` / `#D4A843` (muted, for CTAs/accents on screen)
- Logo Gold: `#f8c802` (bright saturated, for chevron mark in logo SVGs)
- Logo Dark Teal: `#1a2b25` (letterforms and subtitle text in logo SVGs)
- Black: `#000000` (backgrounds, body text)

**Logo assets** in `packages/ui/src/assets/`:
- `ces-logo-full.svg` — complete logo (text + gold chevron + subtitle)
- `ces-logo-full-white.svg` — complete logo, white text variant for dark backgrounds
- `ces-text.svg` — "ces" letterforms only (dark teal `#1a2b25`)
- `ces-text-white.svg` — "ces" letterforms, white (`#ffffff`), full viewBox for layered stacking
- `ces-subtitle.svg` — "CLEAN ENERGY SOLUTIONS" subtitle (dark teal)
- `ces-subtitle-white.svg` — subtitle, white, full viewBox for layered stacking
- `ces-chevron.svg` — gold chevron/arrow mark only (full viewBox `0 0 275.52 219.84`)
- `ces-logo-white-bg.jpg`, `ces-logo-grey-bg.jpg` — raster references

The Hero section uses the three white/gold part SVGs layered absolutely in a container with matching `aspectRatio`. All three share viewBox `0 0 275.52 219.84` so they self-align when stacked. Import via `@repo/ui/assets/<filename>`.

**Path alias:** `@/*` maps to `apps/web/src/*` (configured in tsconfig).

**Fonts:** Self-hosted via `next/font` (zero external requests, GDPR-friendly). Config in `apps/web/src/app/fonts.ts`. No Google Fonts CDN.

**Next.js output:** `output: "standalone"` in `apps/web/next.config.ts` — required for SST/Lambda deployment.

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

SST v3 uses Pulumi's engine + Terraform AWS providers under the hood. It does **NOT** use CloudFormation or Pulumi Cloud. State is stored in S3 (`home: "aws"` — the only valid option for AWS; `"pulumi"` is NOT supported). Resources are created directly via AWS APIs.

`sst.aws.Nextjs` component creates ~70 resources (CloudFront, S3, Lambda, DynamoDB, SQS, IAM, ACM). Config lives in `sst.config.ts`.

```
User → CloudFront (CDN) → S3 (static assets) or Lambda (SSR/API/image optimization)
ISR cache → S3 + DynamoDB (tag-based revalidation) + SQS FIFO (stale-while-revalidate)
```

**SST CLI** is installed as a devDependency — use `pnpm sst <command>` (no global install needed). Key commands: `deploy`, `remove`, `diff`, `refresh`, `state export`, `secret`, `unlock`.

**Known issue:** Newer AWS accounts (post mid-2024) block public Lambda Function URL access by default. The `$transform` block in `sst.config.ts` adds the missing `lambda:InvokeFunction` permission. See SST #6397.

**Domain:** `portfolio.ic-ces.engineering` is live. The hosted zone ID (`Z07972313GVRF4SEMXLOL`) is hardcoded in `sst.config.ts` to bypass `ListHostedZonesByName` lookups. The deploy IAM user has programmatic-only access (keys in `.env`, no console).

Marimo notebooks: separate containerized Python service, proxied via Next.js `rewrites` under `/demos/*` or embedded via iframe.

## Workflow: PRDs and Task Lists

Large features follow a structured workflow using custom commands in `.claude/commands/`:

1. `/prd <feature>` — generates a PRD with clarifying questions, saves to `/tasks/prd-[name].md`
2. `/generate-tasks` — converts a PRD into a numbered task list at `/tasks/tasks-prd-[name].md`
3. `/process-task-list` — works through tasks one sub-task at a time, pausing for user approval between each

## Component Organization

```
apps/web/src/components/              → standalone utilities
  Header.tsx                          → site header/nav
  SmoothScroll.tsx                    → Lenis wrapper (desktop-only)
  ParticlesBackground.tsx             → tsparticles ambient effect (desktop-only)
  CursorRipple.tsx                    → pointer-follow ripple (desktop-only)
apps/web/src/components/sections/     → page sections (rendered in order on /)
  Hero.tsx                            → hero with layered logo animation + particle bg
  Services.tsx, Gallery.tsx, Stats.tsx, ContactCta.tsx
```

Desktop-only interactive components (`ParticlesBackground`, `CursorRipple`) are loaded via `next/dynamic` with `ssr: false` and fade in after the hero entrance animation completes.

## Devcontainer

`.devcontainer/` provides a ready-to-go dev environment: Node 22, pnpm 9.15.4, AWS CLI v2, `dig`/`nslookup`, ESLint, Prettier, Tailwind CSS IntelliSense, Claude Code extension. `postCreateCommand` runs `pnpm install`.

## Key Files

- `docs/technical-architecture.md` — comprehensive 871-line tech brief covering all stack decisions, rendering strategies, animation patterns, deployment, and content management. **Read this first** when implementing new features.
- `docs/BRAND.md` — brand colors (logo vs web palette), typography, logo anatomy and file inventory
- `apps/web/src/app/globals.css` — design token source of truth (CSS custom properties + `@theme inline`)
- `apps/web/src/app/layout.tsx` — root layout
- `apps/web/next.config.ts` — Next.js config (`output: "standalone"` for Lambda)
- `sst.config.ts` — infrastructure definition (domain, CDN, Lambda permissions)
- `packages/ui/src/index.ts` — shared UI barrel export (currently empty, ready for components)
- `packages/ui/src/assets/` — all logo SVGs (imported via `@repo/ui/assets/*`)
