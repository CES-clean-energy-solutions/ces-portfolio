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
packages/content/  → @ces/content — portfolio data (projects, case studies)
docs/              → technical-architecture.md (913-line tech brief), BRAND.md
tasks/             → PRDs and task lists (generated via skills)
scripts/           → helper scripts (video encoding, asset copying, state parsing)
```

Internal packages use `workspace:*` protocol (e.g., `"@repo/ui": "workspace:*"`).

**Turborepo configuration** (`turbo.json`): `build` task outputs are cached (`.next/**`, `dist/**`), `lint` and `type-check` depend on upstream builds, `dev` is persistent and never cached. Task dependencies ensure packages build before dependents.

**Content package** (`@ces/content`) exports structured data via `@ces/content/data/*` path:
- `data/innovation.ts` — primary data model for service/innovation entries. Auto-discovers `section-description.json` files under `data/innovation/{id}/` (any filename works, not just that one). Relative paths (`./`) in JSON are resolved to `/content/innovation/{id}/` public URLs at load time.
- `data/innovation/{id}/` — per-service asset folders. Each has a `section-description.json` with title, description, images, links, stats, and sub-services.
- `data/services.ts` — legacy service categories (some overlap with innovation data). The `video` field is deprecated; use `images` array instead.
- `data/services/` — static assets copied to `apps/web/public/content/services/` via the `prebuild` script.

**Innovation data schema** (key fields not obvious from the type):
- `images[0]` — **always the title/card image** by convention. Displayed as hero in modal, card background in bento, background in showcase slide. Gallery shows only `images[1+]`.
- `InnovationImage.confidential?: boolean` — hidden unless Secret Mode is active
- `InnovationImage.animated?: boolean` — renders as `<img>` with `loading="eager"` (supports animated GIFs; `next/image` strips animation)
- `InnovationLink.confidential?: boolean` — hides resource links in modal unless Secret Mode active
- `InnovationLink.external?: boolean` — opens in new tab

**Asset pipeline:** The `prebuild` script in `apps/web/package.json` runs `scripts/copy-service-assets.sh` before every build. This copies servable assets (videos, images) from the content package into Next.js's public directory. The script is necessary because SST's asset bundler can't follow symlinks. It skips JSON files and source materials, copying only web-ready assets.

Planned but not yet created: `apps/marimo/` (Python notebook server), `apps/dashboard/`, `packages/config/`, `packages/utils/`.

## Commands

```bash
# Development
pnpm dev                    # runs web app on port 4200 (via --filter @ces/web)
pnpm --filter @ces/web dev  # same as above (explicit)
# Note: devcontainer forwards port 8080, but the app runs on 4200 internally

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

# Helper scripts (in scripts/ directory)
bash scripts/encode-hero-video.sh       # encode videos for hero section
bash scripts/encode-service-video.sh    # ⚠️ DEPRECATED: video backgrounds replaced with static images
bash scripts/copy-service-assets.sh     # copies images/assets from content package to public/ (runs automatically in prebuild)
pnpm sst:state                          # export and parse SST state (requires deployed stack)
```

**Note:** No testing infrastructure is currently configured (no Jest/Vitest, no test scripts). Tests can be added in the future if needed.

## Architecture Decisions

**Rendering strategy:** Almost everything is SSG (static). ISR via `"use cache"` directive for CMS-managed content only. SSR is avoided. CSR reserved for interactive widgets behind `"use client"`. Contact forms use SSG page + Server Action.

**Server Components are the default.** Only use `"use client"` for: menus (state toggle), forms (onChange), lightboxes (click), scroll animations (useGSAP/useEffect), carousels. Keep client components small and leaf-level.

**Feature flags:** `apps/web/src/config/features.ts` exports two objects:
- `features` — boolean flags for page sections (hero, servicesShowcase, projectsPreview, etc.)
- `serviceFlags` — per-service visibility map (`{ [serviceId]: boolean }`) used in `page.tsx` to filter which innovations appear in the bento grid and header nav

Toggle by changing the config and redeploying. All environments share these flags. Import via `@/config/features`.

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

## Recent Architecture Changes (2026-03-09)

**Video backgrounds replaced with static images:** Service/innovation sections previously used video backgrounds with WebM/MP4 sources. These have been replaced with static images from the `images` array in the data files for improved mobile performance. The `video` field in `innovation.ts` is deprecated but retained for backwards compatibility. Components now use the first image from the `images` array, falling back to `/images/services/placeholder-[id].jpg`.

**Navigation simplified:** Header now displays only two links (Services, Contact) visible on all breakpoints. No hamburger menu or collapsing behavior. Header also includes `ExportPdfButton` and auto-hides when scrolling down >64px (Motion `useScroll` + `useMotionValueEvent`), re-appears on scroll up.

**Footer with legal modals:** New Footer component (`Footer.tsx`) with five legal links (Impressum, Company Data, Data Protection, Compliance, Certifications) that open Radix Dialog modals. Placeholder content needs client replacement (see `docs/CONTENT-GUIDE.md`).

**Contact section restructured:** Three-box layout with Contact Us (full width emphasized), Who We Are (50%), and How We Work (50%). All boxes stack vertically on mobile.

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

Large features follow a structured workflow using custom commands (skills) available via the Skill tool:

**Available skills:**
- `prd` — Create a PRD with embedded task list for a feature or project
- `implement` — Implement tasks from a PRD file, tracking progress in-place
- `implement-all` — Implement ALL tasks from a PRD file without pausing, tracking progress in-place
- `checkpoint` — Save a progress checkpoint (update PRD status and git commit)
- `next-steps` — Analyze current state and propose logical next steps for development
- `screenshot` — View and analyze the latest screenshot(s) from `.screenshots/` folder

Typical workflow: `/prd <feature>` → `/implement` or `/implement-all` → `/checkpoint` after completing milestones

## Component Organization

```
apps/web/src/components/              → standalone utilities
  Header.tsx                          → auto-hide header; Services/Contact links + ExportPdfButton
  Footer.tsx                          → legal footer with modal links (Impressum, etc.)
  ExportPdfButton.tsx                 → triggers multi-page PDF export (jspdf + html2canvas)
  SmoothScroll.tsx                    → Lenis wrapper (desktop-only)
  ParticlesBackground.tsx             → tsparticles ambient effect (desktop-only)
  HeroVideo.tsx                       → hero background video component
  modals/
    LegalModal.tsx                    → Radix Dialog for footer legal content
apps/web/src/components/sections/     → page sections (rendered in order on /)
  Hero.tsx                            → hero with layered logo animation + particle bg
  TaglineSection.tsx                  → CES tagline/mission statement with chevron
  services-bento/                     → services/innovations bento grid
    ServicesBento.tsx                 → main bento grid layout (id="services")
    ServicesBentoCard.tsx             → individual service card (uses images[0] as background)
    ServicesShowcase.tsx              → full-screen scroll showcase
    ServicesSlide.tsx                 → individual slide with static image background
    ServicesDetailModal.tsx           → modal: hero image, gallery carousel, resource links
    ServicesGallery.tsx               → hero image + auto-advancing thumbnail strip (8s interval, progress bar)
    ServicesMediaCard.tsx             → media card within services detail view
    ManualResourceModal.tsx           → modal for manually adding resource links
    ImageLightbox.tsx                 → full-screen lightbox with keyboard nav (←/→/Esc)
  ContactCta.tsx                      → three-box layout (Contact Us, Who We Are, How We Work)
  Gallery.tsx                         → placeholder section (not integrated into page.tsx)
apps/web/src/contexts/
  SecretModeContext.tsx               → React context for confidential content visibility
apps/web/src/hooks/
  useSecretMode.ts                    → localStorage-backed toggle; always resets to false on load
```

**Secret Mode:** A lock/unlock toggle in `ServicesDetailModal` controls visibility of content marked `confidential: true` in the data. Default is locked (hidden). State is stored in localStorage but resets to `false` on every page load — intentional for safe client presentations. Access via `useSecretModeContext()`.

**PDF Export:** `ExportPdfButton` dynamically imports `lib/pdf-generator.ts` (lazy, reduces initial bundle). Generator captures pages with `html2canvas` and stitches them into a landscape A4 PDF via `jspdf`. OKLCH colors are overridden with hex equivalents before capture (html2canvas limitation).

**Note:** Components in `services-bento/` consume `@ces/content/data/innovation`. The `video` field in the data is deprecated; components use static images from the `images` array. `images[0]` is the title/hero image by convention.

Desktop-only interactive components (`ParticlesBackground`) are loaded via `next/dynamic` with `ssr: false` and fade in after the hero entrance animation completes.

## Devcontainer

`.devcontainer/` provides a ready-to-go dev environment: Node 22, pnpm 9.15.4, AWS CLI v2, `dig`/`nslookup`, ESLint, Prettier, Tailwind CSS IntelliSense, Claude Code extension. `postCreateCommand` runs `pnpm install`.

**Port forwarding:** The devcontainer forwards port 8080 to the host, but `pnpm dev` runs the Next.js dev server on port 4200 internally. Access the site at `http://localhost:8080` (forwarded) or `http://localhost:4200` (direct).

**Claude settings:** `.claude/` is a symlink to `/agentic-central` (external persistent mount). Project settings (`settings.json`) and custom commands (`commands/`) live here and survive container rebuilds. User-specific settings can be placed in `claude.json` which gets copied to `~/.claude.json` on container start.

## Environment Variables

Copy `.env.example` to `.env` and fill in required values:

```bash
AWS_ACCESS_KEY_ID=        # IAM user with deploy permissions
AWS_SECRET_ACCESS_KEY=    # IAM secret key
AWS_REGION=eu-central-1   # Must match sst.config.ts region
```

**Note:** SST v3 stores state in S3 (not Pulumi Cloud). No Pulumi token needed. The `.env` file is sourced automatically by deployment scripts.

**Security:** Never commit `.env` to git. The file is in `.gitignore`.

## Key Files

- `docs/technical-architecture.md` — comprehensive 913-line tech brief covering all stack decisions, rendering strategies, animation patterns, deployment, and content management. **Read this first** when implementing new features.
- `docs/BRAND.md` — brand colors (logo vs web palette), typography, logo anatomy and file inventory
- `docs/CONTENT-GUIDE.md` — guide for replacing placeholder content (footer legal text, contact section text, service images). **User reference for content updates.**
- `apps/web/src/app/globals.css` — design token source of truth (CSS custom properties + `@theme inline`)
- `apps/web/src/app/layout.tsx` — root layout
- `apps/web/next.config.ts` — Next.js config (`output: "standalone"` for Lambda)
- `sst.config.ts` — infrastructure definition (domain, CDN, Lambda permissions)
- `packages/ui/src/index.ts` — shared UI barrel export (currently empty, ready for components)
- `packages/ui/src/assets/` — all logo SVGs (imported via `@repo/ui/assets/*`)
- `packages/content/data/innovation.ts` — service/innovation data model and auto-discovery loader (`images[0]` convention, `confidential` flags, `animated` flag for GIFs)
- `apps/web/src/contexts/SecretModeContext.tsx` — Secret Mode provider (confidential content gating)
- `apps/web/src/lib/pdf-generator.ts` — PDF export logic (html2canvas + jspdf, color space overrides)
