# Technical Architecture Reference

**A production-ready Next.js 16 monorepo template with SST deployment to AWS**

This document consolidates the technical stack, deployment architecture, and development workflows from the CES portfolio project into a reusable reference for future projects. Use this as a blueprint when starting new Next.js applications that require AWS deployment, monorepo structure, or scroll-driven animations.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Development Workflow](#development-workflow)
4. [Deployment with SST](#deployment-with-sst)
5. [Animation Stack](#animation-stack)
6. [Design System](#design-system)
7. [Environment Configuration](#environment-configuration)
8. [Cost Estimates](#cost-estimates)
9. [Key Decisions & Rationale](#key-decisions--rationale)
10. [Migration Guide](#migration-guide)

---

## Tech Stack Overview

### Core Framework

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | React framework with App Router, SSG/ISR/SSR, file-based routing |
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Language** | TypeScript | 5.7+ | Type-safe JavaScript |
| **React** | React | 19.1 | UI library with Server Components |
| **Bundler** | Turbopack | Built-in | Default bundler in Next.js 16 (2-5x faster than Webpack) |

### Styling & UI

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Styling** | Tailwind CSS | 4.0.6 | CSS-first utility framework (Rust-rewrite, `@theme` directive) |
| **Components** | shadcn/ui | Latest | Copy-paste component system (Radix UI + Tailwind) |
| **Primitives** | Radix UI | Latest | Accessible headless components |
| **Icons** | Lucide React | Latest | Icon library |

### Animation (Optional - for marketing sites)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Scroll animations** | GSAP + ScrollTrigger | 3.12.7 | Timeline-based, scroll-driven animations (now free) |
| **Component animations** | Motion | 12.4.7 | Declarative React animations (formerly Framer Motion) |
| **Smooth scroll** | Lenis | 1.1.20 | Smooth scrolling (desktop only) |
| **Particles** | tsparticles | 3.9.1 | Ambient background effects (optional) |

### Monorepo & Build

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Monorepo** | Turborepo | 2.4.4+ | Build system with caching, parallel execution |
| **Package manager** | pnpm | 9.15.4 | Fast, disk-efficient package manager with workspaces |

### Deployment

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Infrastructure** | SST v3 | 3.6.2+ | TypeScript IaC framework (Pulumi + Terraform) |
| **Adapter** | OpenNext | 3.9.8 | Next.js → AWS Lambda/S3 adapter (via SST) |
| **Cloud** | AWS | - | CloudFront, S3, Lambda, DynamoDB, SQS |
| **Region** | eu-central-1 | - | Frankfurt (EU data residency) |

### Analytics (Optional)

| Tool | Purpose |
|------|---------|
| Plausible | GDPR-compliant, cookie-free analytics (EUR-hosted) |

---

## Monorepo Architecture

### Directory Structure

```
project-root/
├── apps/
│   └── web/                      # Next.js 16 marketing site (port 4200)
│       ├── src/
│       │   ├── app/              # App Router pages
│       │   │   ├── layout.tsx    # Root layout
│       │   │   ├── page.tsx      # Homepage
│       │   │   ├── globals.css   # Tailwind v4 config + design tokens
│       │   │   ├── fonts.ts      # Self-hosted fonts
│       │   │   ├── sitemap.ts    # Auto-generated sitemap
│       │   │   └── robots.ts     # Auto-generated robots.txt
│       │   ├── components/       # React components
│       │   └── lib/              # Utilities
│       ├── public/               # Static assets
│       ├── next.config.ts        # Next.js config (output: "standalone")
│       └── package.json          # @app/web
├── packages/
│   ├── ui/                       # Shared component library
│   │   ├── src/
│   │   │   ├── components/       # shadcn/ui components
│   │   │   ├── assets/           # SVG logos, icons
│   │   │   └── index.ts          # Barrel exports
│   │   └── package.json          # @repo/ui
│   ├── config/                   # Shared ESLint + TS configs (optional)
│   └── utils/                    # Shared utilities (optional)
├── docs/                         # Architecture docs
├── sst.config.ts                 # Infrastructure definition
├── turbo.json                    # Turborepo pipeline config
├── pnpm-workspace.yaml           # Workspace definition
├── package.json                  # Root workspace
├── .env.example                  # Environment variables template
└── .env                          # Local environment (gitignored)
```

### Package Naming Convention

- **Apps**: `@app/web`, `@app/dashboard`, etc.
- **Internal packages**: `@repo/ui`, `@repo/utils`, `@repo/config`
- Use `workspace:*` protocol in package.json dependencies

### Workspace Configuration

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**`turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## Development Workflow

### Prerequisites

- **Node.js** 20+ (`node --version`)
- **pnpm** 9.15.4
  ```bash
  corepack enable
  corepack prepare pnpm@9.15.4 --activate
  ```

### Initial Setup

```bash
# Clone/init repository
git clone <repo-url>
cd <project>

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
# Edit .env and add AWS credentials (for deployment)
```

### Common Commands

```bash
# Development
pnpm dev                          # Run web app (port 4200 by default)
pnpm --filter @app/web dev        # Run specific app
pnpm --filter @repo/ui dev        # Run package in watch mode

# Build
pnpm build                        # Build all packages (Turborepo caching)
pnpm --filter @app/web build      # Build specific app

# Quality checks
pnpm lint                         # ESLint across monorepo
pnpm type-check                   # TypeScript check (no emit)

# Clean artifacts
pnpm clean                        # Remove .next, dist, .turbo

# shadcn/ui components (from apps/web/)
npx shadcn@latest init            # Initialize (one-time)
npx shadcn@latest add button card dialog navigation-menu
```

### Port Configuration

- Web app: `4200` (configured in `apps/web/package.json`: `next dev --turbopack -p 4200`)
- Dev containers: Forward port 8080 → 4200 (or adjust as needed)

---

## Deployment with SST

### What is SST?

**SST (Serverless Stack Toolkit)** is a TypeScript-native infrastructure-as-code framework built on:
- **Pulumi's engine** (orchestration layer)
- **Terraform AWS providers** (actual resource creation)
- **High-level components** that abstract 50-100 AWS resources into single declarations

Think of it as: **Terraform is LEGO bricks, SST is pre-built LEGO sets.**

### Architecture Flow

```
You write:      new sst.aws.Nextjs("Site", { path: "apps/web" })
                        ↓
SST expands:    ~70 AWS resources (CloudFront, S3, Lambda, DynamoDB, SQS, IAM, ACM)
                        ↓
Pulumi engine:  Plans changes, computes diff
                        ↓
Terraform:      Applies changes via AWS provider
                        ↓
AWS:            Resources created
```

### What Gets Created

`sst.aws.Nextjs` provisions:

| Resource | Purpose |
|----------|---------|
| **CloudFront** | CDN that routes requests to S3 (static) or Lambda (dynamic) |
| **S3 bucket** | Stores static assets (\_next/static/\*, images) + ISR cache |
| **Lambda (server)** | Handles SSR, API routes, App Router logic |
| **Lambda (image)** | Image optimization with Sharp (arm64) |
| **Lambda (revalidation)** | ISR background regeneration |
| **DynamoDB** | Tracks ISR cache tags for `revalidateTag()` |
| **SQS FIFO** | Queues stale-while-revalidate requests |
| **IAM roles** | Least-privilege permissions per function |
| **ACM certificate** | SSL/TLS for custom domain |

**Total:** ~70 resources per Next.js site

### Configuration

**`sst.config.ts`:**
```typescript
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "my-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",  // Store state in S3 (NOT Pulumi Cloud)
      providers: {
        aws: {
          region: "eu-central-1",  // Frankfurt for EU data residency
        },
      },
    };
  },
  async run() {
    // Optional: Fix for newer AWS accounts (Lambda Function URL access)
    // See: https://github.com/anomalyco/sst/issues/6397
    $transform(aws.lambda.FunctionUrl, (args, opts, name) => {
      new aws.lambda.Permission(`${name}InvokePermission`, {
        action: "lambda:InvokeFunction",
        function: args.functionName,
        principal: "*",
        statementId: "FunctionURLInvokeAllowPublicAccess",
      });
    });

    const site = new sst.aws.Nextjs("MyApp", {
      path: "apps/web",
      domain: {
        name: "example.com",
        dns: sst.aws.dns({ zone: "Z1234567890ABC" }),  // Route53 hosted zone ID
      },
    });

    return {
      url: site.url,
    };
  },
});
```

### State Management

SST v3 stores infrastructure state in **AWS S3** (not Pulumi Cloud). The S3 bucket is auto-created on first deploy. State tracks every resource and config for computing diffs.

**Valid state backends:**
- `home: "aws"` → S3 bucket (recommended for AWS)
- `home: "cloudflare"` → Cloudflare (for Cloudflare deployments)

**NOT supported:** `home: "pulumi"` (Pulumi Cloud)

### Environment Setup

**`.env.example`:**
```bash
# AWS credentials — IAM user with AdministratorAccess
# Create at: https://console.aws.amazon.com/iam/
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-central-1

# Note: SST v3 stores state in S3, NOT Pulumi Cloud. No Pulumi token needed.
```

**Security:** Never commit `.env` to git. Add to `.gitignore`.

### Deployment Commands

**Root `package.json` scripts:**
```json
{
  "scripts": {
    "deploy": "bash -c 'source .env && sst deploy --stage production'",
    "deploy:dev": "bash -c 'source .env && sst deploy --stage dev'",
    "remove": "bash -c 'source .env && sst remove --stage production'",
    "remove:dev": "bash -c 'source .env && sst remove --stage dev'",
    "diff": "bash -c 'source .env && sst diff --stage production'",
    "diff:dev": "bash -c 'source .env && sst diff --stage dev'",
    "sst:state": "bash -c 'source .env && sst state export --stage dev'",
    "sst:unlock": "bash -c 'source .env && sst unlock --stage dev'"
  }
}
```

**Deploy workflow:**
```bash
# First-time deploy (creates all resources)
pnpm deploy:dev          # ~3-5 minutes
pnpm deploy              # Production

# Preview changes before deploying
pnpm diff:dev            # Like `terraform plan`
pnpm diff

# Tear down infrastructure
pnpm remove:dev          # Deletes all dev resources
pnpm remove              # Production (retained if removal: "retain")

# View deployed resources
pnpm sst:state           # Export state as JSON

# Release stuck deployment lock
pnpm sst:unlock
```

### Stages (Environments)

| Stage | Command | Removal Policy | Purpose |
|-------|---------|----------------|---------|
| `dev` | `pnpm deploy:dev` | `remove` | Development/testing (fully deleted on teardown) |
| `production` | `pnpm deploy` | `retain` | Production (resources preserved even after `sst remove`) |

### Next.js Config for Lambda

**`apps/web/next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",  // Required for Lambda deployment
  turbopack: {},
};

export default nextConfig;
```

The `output: "standalone"` setting creates a self-contained server bundle optimized for Lambda.

### OpenNext (Behind the Scenes)

**OpenNext** is the open-source adapter that converts `next build` output into AWS-compatible packages. Current version: **@opennextjs/aws v3.9.8**.

SST calls OpenNext automatically during `sst deploy`. You don't run it directly.

**What OpenNext does:**
1. Runs `next build` in standalone mode
2. Converts `.next/` output into:
   - Server Lambda handler (Node.js)
   - Image optimization Lambda (Sharp on arm64)
   - Revalidation Lambda (ISR background regeneration)
   - Static assets for S3
   - CloudFront cache config

**Support:** All Next.js 15-16 features (App Router, ISR, middleware, `"use cache"`, streaming, image optimization)

---

## Animation Stack

### When to Use Animations

Animations are **optional** and primarily for marketing sites, portfolios, and landing pages. Skip this section for dashboards, admin panels, or SaaS applications.

### The Three-Layer Model

| Layer | Library | Responsibility |
|-------|---------|----------------|
| **Smooth scrolling** | Lenis | Normalizes scroll input, buttery feel (desktop only) |
| **Scroll-driven animations** | GSAP ScrollTrigger | Pinning, scrubbing, timelines, text splitting |
| **Component animations** | Motion | Declarative mount/exit, gestures, layout transitions |

### Installation

```bash
pnpm add gsap @gsap/react motion lenis
```

### GSAP: Now 100% Free

As of **April 30, 2025**, all previously premium GSAP plugins are **free for everyone** (including commercial use) after Webflow acquired GreenSock. Current version: **GSAP v3.14.1**.

**Free plugins include:**
- **ScrollTrigger** — scroll-driven animations
- **SplitText** — split text into chars/words (completely rewritten, 50% smaller)
- **MorphSVG, DrawSVG, Flip, Draggable, ScrambleText** — and more

**License:** GreenSock "No Charge" license (free for all websites, restricted from competing animation tools)

### Integration Pattern

**1. Lenis + GSAP Synchronization** (Desktop Only)

```tsx
// components/SmoothScroll.tsx
"use client"
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // Only enable on desktop (1024px+)
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (!isDesktop) return

    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => { lenis.destroy() }
  }, [])

  return <>{children}</>
}
```

**2. GSAP with React Hook**

```tsx
// components/HeroSection.tsx
"use client"
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export default function HeroSection() {
  const container = useRef()

  useGSAP(() => {
    const split = SplitText.create(".hero-title", { type: "chars, words" })
    gsap.from(split.chars, {
      y: 100, opacity: 0, stagger: 0.05, duration: 1,
      scrollTrigger: { trigger: ".hero-title", start: "top 80%" }
    })
  }, { scope: container })

  return <section ref={container}>...</section>
}
```

**Key pattern:** Use `useGSAP()` hook (from `@gsap/react`) instead of `useEffect`. It automatically cleans up animations via `gsap.context()`.

### Mobile-First Animation Strategy

Heavy animations consume battery and cause frame drops on mid-range devices. Use adaptive complexity:

| Device | Lenis | ScrollTrigger | SplitText | Motion |
|--------|-------|---------------|-----------|--------|
| **Desktop (lg+)** | ✅ On | ✅ Full (pin, scrub) | ✅ Chars | ✅ Full |
| **Tablet (md)** | ❌ Off | ⚠️ Simplified (no pin) | ⚠️ Words only | ✅ Full |
| **Phone** | ❌ Off | ❌ Off (fade-in only) | ❌ Off | ⚠️ Reduced |

**Implementation:**
```jsx
useGSAP(() => {
  ScrollTrigger.matchMedia({
    "(min-width: 1024px)": function() {
      // Desktop: full cinematic experience
      gsap.from(".hero", { y: 100, opacity: 0, duration: 1.2 })
    },
    "(min-width: 768px) and (max-width: 1023px)": function() {
      // Tablet: simplified
      gsap.from(".hero", { opacity: 0, duration: 0.6 })
    },
    "(max-width: 767px)": function() {
      // Mobile: minimal or none
      gsap.set(".hero", { opacity: 1 })
    }
  })
})
```

**Respect user preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Tailwind v4: `motion-reduce:transition-none`

### Motion for Component Animations

```tsx
import { motion, AnimatePresence } from "motion/react"

// Fade-in on scroll
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
  Content
</motion.div>

// Exit animations (modals, etc.)
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

### Rule: Never Conflict

**Critical:** Never animate the same property on the same element with both GSAP and Motion simultaneously. Pick one library per element.

---

## Design System

### Tailwind CSS v4

Released **January 22, 2025**, Tailwind v4 is a Rust rewrite with **3.5-5x faster builds**. The biggest change: **no more `tailwind.config.js`** — everything is configured in CSS.

### Configuration

**`apps/web/src/app/globals.css`:**
```css
@import "tailwindcss";

/* Design tokens */
:root {
  --brand-primary: oklch(0.55 0.22 262);     /* Example: Purple */
  --brand-secondary: oklch(0.75 0.12 85);    /* Example: Gold */
  --brand-black: oklch(0 0 0);
  --brand-white: oklch(1 0 0);

  /* shadcn/ui semantic tokens */
  --background: oklch(1 0 0);
  --foreground: oklch(0.1 0 0);
  --primary: var(--brand-primary);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.96 0.01 262);
  --muted: oklch(0.96 0.01 262);
  --accent: oklch(0.95 0.05 262);
  --border: oklch(0.88 0.04 262);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.12 0 0);
  --foreground: oklch(0.95 0 0);
  /* ... dark mode tokens */
}

/* Bridge CSS variables to Tailwind utilities */
@theme inline {
  --color-brand-primary: var(--brand-primary);
  --color-brand-secondary: var(--brand-secondary);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}
```

**Usage:**
```tsx
<div className="bg-primary text-primary-foreground">
  Primary colored box
</div>
```

### OKLCH Color Space

Tailwind v4 uses **OKLCH** (Oklab Lightness Chroma Hue) for wider gamut and perceptually uniform colors.

**Convert hex to OKLCH:** [oklch.com](https://oklch.com)

### shadcn/ui Components

**shadcn/ui is NOT a component library** — it's a **code distribution system**. You copy source code into your project.

**Installation:**
```bash
cd apps/web
npx shadcn@latest init
```

**Add components:**
```bash
npx shadcn@latest add button card dialog navigation-menu sheet
```

Components appear in `apps/web/src/components/ui/`. You own the code — customize freely.

**Built on:**
- **Radix UI** — accessible headless primitives
- **Tailwind CSS** — styling
- **class-variance-authority** — variant management

### Self-Hosted Fonts

Use `next/font` to self-host fonts (zero external requests, GDPR-friendly, zero layout shift).

**`apps/web/src/app/fonts.ts`:**
```typescript
import localFont from 'next/font/local'

export const brandFont = localFont({
  src: [
    { path: './fonts/BrandFont-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/BrandFont-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-brand',
  display: 'swap',
})
```

**Apply in layout:**
```tsx
import { brandFont } from './fonts'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={brandFont.variable}>
      <body>{children}</body>
    </html>
  )
}
```

**Register in CSS:**
```css
@theme {
  --font-brand: var(--font-brand);
}
```

**Use:**
```tsx
<h1 className="font-brand">Heading</h1>
```

---

## Environment Configuration

### Required Variables

**`.env` (local development + deployment):**
```bash
# AWS credentials for SST deployment
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=eu-central-1

# Optional: Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
```

### IAM User Setup

1. Create IAM user at [console.aws.amazon.com/iam](https://console.aws.amazon.com/iam/)
2. Attach policy: `AdministratorAccess` (scope down later for production)
3. Create access key → programmatic access
4. Add keys to `.env`

**Security:**
- Never commit `.env` to git (add to `.gitignore`)
- Use **OIDC** for CI/CD (GitHub Actions, GitLab CI) instead of long-lived keys
- Scope down IAM permissions after initial setup

---

## Cost Estimates

### Dev Stage (Low Traffic)

| Service | Usage | Cost |
|---------|-------|------|
| **CloudFront** | 1GB transfer, 10k requests | Free tier |
| **Lambda** | 100k requests/month | Free tier |
| **S3** | 5GB storage, 10k requests | $0.12/month |
| **DynamoDB** | < 25 GB, < 200M requests | Free tier |
| **SQS** | < 1M requests | Free tier |
| **Route53** | 1 hosted zone | $0.50/month |

**Total:** **< $1/month** (mostly AWS free tier)

### Production (10k visitors/month)

| Service | Usage | Cost |
|---------|-------|------|
| CloudFront | 50GB transfer | $4.25 |
| Lambda | 500k requests | Free tier |
| S3 | 20GB storage | $0.46 |
| DynamoDB | On-demand | $2 |
| Route53 | 1 hosted zone + queries | $1 |

**Total:** **~$8-12/month**

### Scaling

SST auto-scales. Lambda concurrency, CloudFront edge locations, and DynamoDB on-demand capacity handle traffic spikes automatically.

---

## Key Decisions & Rationale

### Why Next.js 16?

- **App Router** is production-ready with React Server Components
- **Turbopack** (default bundler) is 2-5x faster than Webpack
- **Best-in-class DX** with fast refresh, TypeScript support, file-based routing
- **Deployment flexibility** via OpenNext (not locked to Vercel)

### Why SST over Terraform/CDK?

| Dimension | SST v3 | Terraform | AWS CDK |
|-----------|--------|-----------|---------|
| **Language** | TypeScript | HCL | TypeScript |
| **Next.js deployment** | 1 component = 70 resources | 500+ lines manual | 200+ lines manual |
| **Local dev** | `sst dev` (real AWS, local code) | None | None |
| **Resource linking** | Automatic IAM + SDK | Manual | Manual |
| **Learning curve** | Hours | Days | Days |
| **State storage** | S3 (AWS) or Pulumi Cloud | S3/remote backend | CloudFormation |

**Use SST when:**
- Deploying Next.js, Astro, Remix, or serverless apps
- Solo developer or small team
- TypeScript-first workflow
- Need fast iteration

**Use Terraform when:**
- Multi-cloud (AWS + GCP + Azure)
- Enterprise compliance requires HCL
- Large DevOps team already fluent in Terraform
- Managing traditional non-serverless infrastructure

### Why Turborepo + pnpm?

- **Turborepo** provides content-aware caching (only rebuild changed code) and parallel execution
- **pnpm** is faster and more disk-efficient than npm/yarn (hardlinks instead of copies)
- **pnpm workspaces** + Turborepo = best-in-class monorepo DX

### Why Tailwind v4?

- **CSS-first config** is more maintainable than JS config
- **Rust rewrite** = 3.5-5x faster builds
- **OKLCH color space** for wider gamut and perceptually uniform colors
- **Built-in features** (nesting, container queries) — no extra plugins

### Why shadcn/ui?

- **Own the code** — no dependency lock-in, full customization
- **Radix UI primitives** — accessible, headless, production-ready
- **Copy-paste pattern** — only include what you need
- **Tailwind-native** — integrates seamlessly

### Why Animation Stack (GSAP + Motion + Lenis)?

- **GSAP** is now free (was $100+/year) after Webflow acquisition
- **Motion** (formerly Framer Motion) is industry-standard for React animations
- **Lenis** provides smooth scroll without reinventing the wheel
- **Separation of concerns** — each library handles one layer

---

## Migration Guide

### Adapting This Template for a New Project

**1. Clone and clean:**
```bash
git clone <this-repo> my-new-project
cd my-new-project
rm -rf .git && git init
rm -rf apps/web/src/app/* apps/web/public/*
rm -rf packages/ui/src/assets/* packages/ui/src/components/*
```

**2. Update `sst.config.ts`:**
```typescript
app(input) {
  return {
    name: "my-new-app",  // Change this
    // ...
  };
},
async run() {
  const site = new sst.aws.Nextjs("MyNewApp", {
    path: "apps/web",
    domain: {
      name: "my-domain.com",  // Change this
      dns: sst.aws.dns({ zone: "Z1234567890ABC" }),  // Your Route53 hosted zone
    },
  });
}
```

**3. Update package names:**
- Root `package.json`: Change `"name": "ces-project"` → `"my-project"`
- `apps/web/package.json`: Change `"name": "@ces/web"` → `"@app/web"`
- `packages/ui/package.json`: Keep `"name": "@repo/ui"`

**4. Brand tokens in `apps/web/src/app/globals.css`:**
- Replace color values in `:root`
- Add your brand fonts to `apps/web/src/app/fonts.ts`

**5. Deploy:**
```bash
cp .env.example .env
# Add AWS credentials to .env
pnpm install
pnpm build
pnpm deploy:dev
```

### Removing Animation Stack (for dashboards/SaaS)

If you don't need scroll-driven animations:

**1. Uninstall:**
```bash
pnpm remove gsap @gsap/react motion lenis @tsparticles/engine @tsparticles/react @tsparticles/slim
```

**2. Remove imports/components:**
- Delete `components/SmoothScroll.tsx`
- Delete `components/ParticlesBackground.tsx`
- Remove animation-related imports from `layout.tsx`

**3. Simplify to CSS transitions:**
```css
/* apps/web/src/app/globals.css */
* {
  transition: all 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

### Adding a Dashboard App

**1. Create new app:**
```bash
cd apps
npx create-next-app@latest dashboard --typescript --tailwind --eslint --app --src-dir
```

**2. Update workspace:**
```json
// apps/dashboard/package.json
{
  "name": "@app/dashboard",
  "scripts": {
    "dev": "next dev --turbopack -p 4201"
  },
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

**3. Add to SST:**
```typescript
// sst.config.ts
async run() {
  const site = new sst.aws.Nextjs("Web", { path: "apps/web" });
  const dashboard = new sst.aws.Nextjs("Dashboard", { path: "apps/dashboard" });

  return {
    webUrl: site.url,
    dashboardUrl: dashboard.url,
  };
}
```

---

## Further Reading

### Official Documentation

- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)
- **SST:** [sst.dev/docs](https://sst.dev/docs)
- **Turborepo:** [turbo.build/repo/docs](https://turbo.build/repo/docs)
- **Tailwind CSS v4:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui:** [ui.shadcn.com/docs](https://ui.shadcn.com/docs)
- **GSAP:** [gsap.com/docs/v3](https://gsap.com/docs/v3)
- **Motion:** [motion.dev/docs/react](https://motion.dev/docs/react)
- **OpenNext:** [opennext.js.org/aws](https://opennext.js.org/aws)

### Learning Resources

- **Next.js Learn:** [nextjs.org/learn](https://nextjs.org/learn) — free project-based course
- **Pro Next.js:** [pronextjs.dev](https://pronextjs.dev) — Jack Herrington's advanced course
- **Road to Next:** [roadtonext.com](https://roadtonext.com) — Robin Wieruch's book (Next.js 15+/React 19)
- **SST Examples:** [github.com/sst/ion/tree/dev/examples](https://github.com/sst/ion/tree/dev/examples)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-21 | Initial consolidated reference from CES project |

---

**This document is maintained as a living reference. Update versions, costs, and patterns as the ecosystem evolves.**
