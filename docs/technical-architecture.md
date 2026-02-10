# CES Clean Energy Solutions: Complete Technical Brief for a High-Impact Scroll-Driven Marketing Site

**This brief covers every technology decision, architecture pattern, and implementation detail needed to build an impactful, scroll-driven marketing website for a Vienna-based engineering consultancy.** The stack centers on Next.js 16 with the App Router, deployed to AWS via SST and OpenNext, animated with GSAP + Motion + Lenis, styled with Tailwind CSS v4 and shadcn/ui, organized in a Turborepo monorepo, and tracked with GDPR-compliant Plausible Analytics. Each section explains core concepts from first principles, provides practical configuration, and links to the best official documentation.

The site must perform flawlessly on mobile devices and tablets -- the primary consumption context for sales engineers presenting project references to clients on-site.

---

## 1. Next.js 16 and the rendering model that powers everything

Next.js is a React framework that handles routing, rendering, bundling, and optimization. As of February 2026, **Next.js 16.1.6** is the current stable release (shipped October 2025), with React 19.2 under the hood and Turbopack as the default bundler. The App Router (`/app` directory) is the only recommended architecture for new projects -- the Pages Router receives no new features.

### Rendering strategies for a marketing site

Every page in a Next.js site uses one of four rendering strategies. For a marketing/portfolio site, the choice is straightforward:

**SSG (Static Site Generation)** pre-renders pages into HTML at build time. The HTML sits on a CDN and loads instantly. This is the **default behavior** in the App Router -- any page that doesn't fetch dynamic data is automatically static. Homepage, About, Services, and Portfolio pages should all be SSG. Use `generateStaticParams()` to pre-render dynamic routes like `/projects/[slug]`.

**ISR (Incremental Static Regeneration)** extends SSG by allowing pages to revalidate in the background after a time interval. A page serves stale content instantly while regenerating behind the scenes. In Next.js 16, ISR is subsumed by the new **`"use cache"` directive** -- you mark a component or page with `"use cache"` and set `cacheLife('hours')` or `cacheLife('days')` to control revalidation. This is ideal for blog posts or case studies managed through a CMS.

**SSR (Server-Side Rendering)** generates HTML on every request. For a marketing site, SSR is almost never needed -- use it only for personalized or geo-targeted content. Enable it with `export const dynamic = 'force-dynamic'`.

**CSR (Client-Side Rendering)** sends an empty shell and renders via JavaScript in the browser. Avoid CSR for any SEO-relevant content. Reserve it for interactive widgets like embedded calculators or admin dashboards behind authentication.

| Page type | Strategy | Why |
|-----------|----------|-----|
| Homepage, About, Services | SSG | Static content, instant load, zero server cost |
| Portfolio case studies | SSG with `generateStaticParams` | Pre-render all projects at build time |
| Blog posts (CMS-managed) | ISR via `"use cache"` | Content updates without full rebuilds |
| Contact form | SSG page + Server Action | Static page, server-side form handler |
| Admin/analytics dashboard | CSR | SEO irrelevant, fully interactive |

### App Router file-based routing

The `app/` directory maps folders to URL segments. Special filenames define behavior:

```
app/
├── layout.tsx            → Root layout (wraps ALL pages, includes <html>, <body>)
├── page.tsx              → Homepage (/)
├── about/page.tsx        → /about
├── projects/
│   ├── page.tsx          → /projects (listing)
│   └── [slug]/page.tsx   → /projects/:slug (dynamic)
├── (marketing)/          → Route Group (no URL segment, just organization)
│   ├── layout.tsx        → Shared layout for marketing pages
│   └── services/page.tsx → /services
├── loading.tsx           → Suspense loading fallback
├── error.tsx             → Error boundary (must be "use client")
├── not-found.tsx         → Custom 404
├── sitemap.ts            → Auto-generated /sitemap.xml
└── robots.ts             → Auto-generated /robots.txt
```

**Layouts** (`layout.tsx`) persist across navigations -- the header and footer render once and never re-mount as users navigate. **Loading states** (`loading.tsx`) use React Suspense to show instant fallback UI while pages stream in. **Error boundaries** (`error.tsx`) catch runtime errors and offer a `reset()` function. Route Groups `(parentheses)` organize code without affecting URLs.

### Server Components vs Client Components

**Server Components are the default.** They run only on the server, produce HTML, and ship zero JavaScript to the browser. They cannot use `useState`, `useEffect`, `onClick`, or any browser API.

**Client Components** are marked with `"use client"` at the top of a file. They still SSR for initial HTML but also hydrate in the browser for interactivity. The `"use client"` directive acts as a boundary -- everything the file imports becomes client code.

A marketing site is **overwhelmingly Server Components**. You only need `"use client"` for: mobile hamburger menus (state toggle), contact forms (validation/onChange), image lightboxes (click handlers), scroll-triggered animations (useEffect/useGSAP), carousels (state), and analytics hooks. Keep these components small and leaf-level. Your pages, layouts, and most content remain server-rendered with zero client JavaScript.

### Key APIs for marketing sites

**Metadata API** is critical for SEO. Export a `metadata` object or `generateMetadata()` function from any `page.tsx` or `layout.tsx`. It supports title templates (`"%s | CES Clean Energy"`), Open Graph images, Twitter cards, canonical URLs, and robots directives. Metadata merges hierarchically from root layout through nested layouts to pages.

**`next/image`** automatically serves responsive WebP/AVIF images with lazy loading and blur placeholders. It prevents Cumulative Layout Shift by requiring dimensions. Use `priority` on above-fold hero images.

**`next/font`** self-hosts any Google or local font at build time -- zero external requests, zero layout shift, GDPR-friendly. Fonts are downloaded once during build and served from the same domain.

### What's new in Next.js 16

The biggest changes: **Turbopack is now the default bundler** (2-5x faster builds), **Cache Components** with `"use cache"` replace implicit caching and experimental PPR, the **React Compiler is stable** (automatic memoization), `middleware.ts` is renamed to `proxy.ts` (runs on Node.js, not Edge), and React 19.2 enables **View Transitions** for animated page navigations and the **`<Activity>`** component for hiding UI while preserving state.

### Best learning resources

The **official Next.js Learn course** at nextjs.org/learn is the best starting point -- free, project-based, and App Router-focused. For deeper understanding: **Jack Herrington's Pro Next.js** (pronextjs.dev) covers Server Component patterns, **Road to Next** by Robin Wieruch (roadtonext.com) is up-to-date for Next.js 15+/React 19, and **JavaScript Mastery** on YouTube builds complete projects with Next.js 16. The official documentation at **nextjs.org/docs** is the primary reference for every API.

---

## 2. The animation trifecta: Lenis, GSAP, and Motion

Three libraries combine to create the scroll-driven, cinematic experience seen on award-winning agency sites and portfolio showcases. Each handles a distinct layer: **Lenis** for smooth scrolling, **GSAP** for timeline-based and scroll-driven animations, and **Motion** for declarative React component animations.

### Lenis: the smooth scroll foundation

Lenis (Latin for "smooth") is a lightweight scroll library by **Darkroom Engineering** (formerly Studio Freight). Current version: **v1.3.17**. Unlike CSS-transform approaches, Lenis is built on `scrollTo`, keeping native scroll APIs intact while normalizing input across trackpads, mouse wheels, and touch.

Install with `npm i lenis`. The `lenis/react` sub-package provides a `<ReactLenis>` wrapper for Next.js. Key features include `autoRaf` for automatic animation frame management, `data-lenis-prevent` to exclude elements (modals, code blocks) from smooth scrolling, and built-in anchor link support. Lenis is used by **GTA VI, Microsoft Design, Shopify Supply**, and Metamask.

**Mobile considerations:** Lenis should be **disabled on mobile and tablet** by default. Native touch scrolling on iOS and Android is already smooth and optimized for battery life. Overriding it with a JavaScript-driven smooth scroller introduces input lag, breaks momentum scrolling, disables rubber-banding at page boundaries, and drains battery. The recommended pattern is to check viewport width on mount and conditionally initialize Lenis only on desktop (`window.matchMedia('(min-width: 1024px)')`).

Documentation: **lenis.darkroom.engineering** and **github.com/darkroomengineering/lenis**.

### GSAP: now 100% free after Webflow acquisition

**This is the biggest change in the animation ecosystem.** On October 15, 2024, Webflow acquired GreenSock. On **April 30, 2025**, all previously premium "Club GSAP" plugins became completely free for everyone, including commercial use. Current version: **GSAP v3.14.1**.

The plugins that were previously $100+/year and are now free include:

- **ScrollTrigger** -- scroll-driven animations with pinning, scrubbing, snapping, and progress tracking
- **SplitText** -- split text into characters, words, and lines for staggered reveal animations (completely rewritten: 50% smaller, 14 new features including `autoSplit` for responsive re-splitting)
- **ScrollSmoother** -- GSAP's own smooth scroll solution (alternative to Lenis)
- **MorphSVG** -- morph between SVG shapes
- **DrawSVG** -- animate SVG stroke drawing
- **Flip** -- FLIP animation technique for layout transitions
- **Draggable + Inertia** -- drag physics
- **ScrambleText** -- randomized text decode effects
- **GSDevTools** -- visual timeline debugging
- **CustomEase, CustomBounce, CustomWiggle** -- custom easing curves

The `gsap-trial` npm package is deprecated -- everything is now in the standard `gsap` package. Licensing uses the GreenSock "No Charge" license at gsap.com/standard-license -- free for all websites and commercial use, with the restriction that you can't use it in competing animation tools.

**GSAP in React/Next.js** uses the `@gsap/react` package (v2.1.2) which provides the **`useGSAP()` hook** -- a drop-in replacement for `useEffect` that automatically cleans up all GSAP animations, ScrollTriggers, and SplitText instances via `gsap.context()`. It scopes selectors to a container ref and is SSR-safe. Requires `"use client"` in Next.js App Router.

```jsx
"use client"
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

Documentation: **gsap.com/docs/v3**, **gsap.com/resources/React**, and the free announcement at **webflow.com/blog/gsap-becomes-free**.

### Motion: declarative React animations

Motion (formerly Framer Motion) was rebranded on **November 12, 2024** when creator Matt Perry spun it off from Framer as an independent project at **motion.dev**. Current version: **v12.32.0**. Install as `motion`, import from `"motion/react"`. Now supports React, Vue, and vanilla JavaScript.

Key features for marketing sites: **variants** for orchestrating staggered animations across component trees, **AnimatePresence** for exit animations (critical for page transitions and modals), **`whileInView`** for scroll-triggered entrance animations, **`useScroll` + `useTransform`** for parallax effects, **layout animations** with `layoutId` for shared element transitions, and **gesture props** (`whileHover`, `whileTap`, `drag`) for interactive elements.

Documentation: **motion.dev/docs/react**.

### How the three libraries work together

| Layer | Library | Responsibility |
|-------|---------|----------------|
| Smooth scrolling | Lenis | Normalizes scroll input, buttery-smooth feel |
| Scroll-driven animations | GSAP ScrollTrigger | Pinning, scrubbing, timelines, text splitting |
| Component animations | Motion | Declarative mount/exit, gestures, layout transitions |

The critical integration pattern synchronizes Lenis with GSAP's ticker:

```jsx
"use client"
// components/SmoothScroll.tsx
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScroll({ children }) {
  useEffect(() => {
    // Only enable on desktop -- mobile native scroll is superior
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

This ensures every smoothed scroll position update triggers ScrollTrigger recalculations, keeping both systems in perfect sync. Initialize Lenis once at the layout level, use GSAP for imperative complex animations (timelines, scroll sequences, text splitting), and use Motion for declarative React animations (state changes, gestures, exit animations). **Never animate the same property on the same element with both GSAP and Motion simultaneously.**

A practical architecture for a marketing site:

```
layout.tsx â†’ SmoothScroll provider (Lenis, desktop only)
â”œâ”€â”€ Hero â†’ GSAP SplitText + ScrollTrigger for text reveal
â”œâ”€â”€ Features â†’ Motion whileInView for staggered card entrances
â”œâ”€â”€ Horizontal Gallery â†’ GSAP ScrollTrigger pin + horizontal scrub (vertical swipe on mobile)
â”œâ”€â”€ Stats Counter â†’ GSAP ScrollTrigger onEnter callback
â”œâ”€â”€ Testimonials â†’ Motion AnimatePresence for carousel (swipe-enabled on touch)
â””â”€â”€ Navigation â†’ Motion useScroll for scroll-direction hide/show
```

---

## 3. Mobile-first design: the sales engineer's field tool

The CES website is not just a marketing brochure -- it is the sales team's primary reference tool when presenting to clients in the field. A sales engineer standing in a meeting room in Riyadh, Pristina, or Berlin needs to pull up project references on a phone or iPad instantly, with zero friction. This makes mobile performance a hard requirement, not a nice-to-have.

### Design principles for mobile/tablet

**Touch targets**: All interactive elements (buttons, links, navigation items, cards) must meet the 44x44px minimum recommended by Apple's HIG and WCAG 2.1 AAA. Tailwind's `min-h-11 min-w-11` (44px) should be a utility applied to every tappable element.

**Thumb-zone navigation**: On phones, primary actions belong in the bottom third of the screen (the natural thumb reach zone). Consider a bottom navigation bar on mobile that collapses to a hamburger on tablet and a full horizontal nav on desktop. Radix UI's `NavigationMenu` (via shadcn/ui) supports responsive patterns out of the box.

**Content-first hierarchy**: On mobile, strip away decorative elements. The hero section shows the headline, a single project image, and a CTA -- not a parallax video background. Project cards become a single-column stack with large thumbnails and readable text. The sales engineer needs to find "that airport project in Sofia" in three taps maximum.

**Offline resilience**: In client offices with poor WiFi, the site should still feel fast. SSG pages cached by CloudFront help enormously. Consider adding a lightweight service worker (via `next-pwa` or `@serwist/next`) to cache the portfolio index and project pages for offline browsing. This makes the site function as a pseudo-PWA for field use.

### Responsive layout strategy with Tailwind CSS v4

Tailwind v4 uses a mobile-first breakpoint system. All styles without a prefix apply to mobile; larger viewports are additive:

| Prefix | Min-width | Target device |
|--------|-----------|---------------|
| *(none)* | 0px | Phones (portrait) |
| `sm:` | 640px | Phones (landscape), small tablets |
| `md:` | 768px | Tablets (portrait, e.g. iPad Mini) |
| `lg:` | 1024px | Tablets (landscape), laptops |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Large desktop |

The practical pattern for a project portfolio grid:

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {projects.map(p => <ProjectCard key={p.slug} project={p} />)}
</div>
```

This renders one column on phones (easiest to scan quickly), two on tablets, and three on desktops.

### Adaptive animation strategy

Heavy scroll animations are a desktop luxury. On mobile, they consume battery, cause frame drops on mid-range devices, and compete with the operating system's own scroll handling. The strategy:

| Animation type | Desktop (lg+) | Tablet (md) | Phone |
|---|---|---|---|
| Lenis smooth scroll | On | Off | Off |
| GSAP ScrollTrigger pin/scrub | Full | Simplified (no pin) | Off -- use simple fade-in |
| GSAP SplitText character animation | Full | Word-level only | Off -- use CSS fade |
| Motion whileInView | Full | Full | Reduced (shorter duration, less stagger) |
| Horizontal scroll sections | Scroll-jacked | Horizontal swipe (CSS snap) | Vertical stack |
| Parallax backgrounds | On | Subtle | Off (`background-attachment: fixed` breaks on iOS) |
| Video backgrounds | Autoplay | Poster image + play button | Poster image only |

Implement this with a `useMediaQuery` hook or `window.matchMedia` checks inside `useGSAP()`. GSAP's `ScrollTrigger.matchMedia()` is purpose-built for this:

```jsx
useGSAP(() => {
  ScrollTrigger.matchMedia({
    // Desktop: full cinematic experience
    "(min-width: 1024px)": function() {
      gsap.from(".hero-title", { y: 100, opacity: 0, duration: 1.2 })
      // Pin, scrub, SplitText, etc.
    },
    // Tablet: simplified
    "(min-width: 768px) and (max-width: 1023px)": function() {
      gsap.from(".hero-title", { opacity: 0, duration: 0.6 })
    },
    // Mobile: minimal
    "(max-width: 767px)": function() {
      gsap.set(".hero-title", { opacity: 1 }) // Just show it
    }
  })
})
```

### Touch interaction patterns

**Swipe gestures**: Use Motion's `drag` prop for carousels and image galleries. `drag="x"` with `dragConstraints` creates a natural swipeable gallery that responds to both touch and mouse:

```jsx
<motion.div
  drag="x"
  dragConstraints={{ left: -totalWidth, right: 0 }}
  dragElastic={0.1}
  className="flex gap-4"
>
  {images.map(img => <ProjectImage key={img.id} {...img} />)}
</motion.div>
```

**Scroll snap for horizontal sections**: Instead of scroll-jacking on mobile, use native CSS scroll snap for horizontal project showcases. It's GPU-accelerated, respects momentum scrolling, and works with accessibility tools:

```css
.project-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; /* iOS momentum */
}
.project-carousel > * {
  scroll-snap-align: center;
  flex-shrink: 0;
  width: 85vw; /* Peek at next card */
}
```

### Performance budgets for mobile

Target these Core Web Vitals on a mid-range Android device (Moto G Power) over a 4G connection:

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | `priority` on hero image, preload critical fonts |
| FID (First Input Delay) / INP | < 200ms | Minimize client JS, lazy-load animation libs |
| CLS (Cumulative Layout Shift) | < 0.1 | `next/image` with explicit dimensions, `next/font` |
| Total page weight (initial) | < 500 KB | SSG HTML + critical CSS + hero image; defer animations |
| JS bundle (initial) | < 150 KB | Code-split animation libs, `"use client"` only where needed |

**Critical mobile optimizations**:
- **Lazy-load GSAP and Motion**: Use `next/dynamic` with `ssr: false` for animation-heavy sections below the fold. The hero section loads instantly as static HTML; animation libraries hydrate as the user scrolls.
- **Responsive images**: Use `next/image` with `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` so mobile devices download appropriately sized images (not the 2400px desktop version).
- **Font subsetting**: If using a brand font, subset it to Latin characters only. A full weight of Inter is ~100 KB; Latin-only is ~15 KB.
- **`prefers-reduced-motion`**: Respect the OS-level accessibility setting. Users who enable "Reduce Motion" (iOS) or "Remove Animations" (Android) should get instant state changes with no transitions. Tailwind v4 supports this: `motion-reduce:transition-none`.

### PWA-lite for offline field use

A full Progressive Web App is overkill, but a lightweight service worker that caches the portfolio shell makes the site usable in poor-connectivity environments:

```typescript
// next.config.js -- using @serwist/next
const withSerwist = require("@serwist/next").default({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});
module.exports = withSerwist({ /* ...rest of config */ });
```

Cache strategy: **NetworkFirst** for HTML pages (always try fresh, fall back to cache), **CacheFirst** for static assets (`/_next/static/`, images, fonts). This means a sales engineer who visited the site once on hotel WiFi can still browse project pages during a client meeting with no connectivity.

---

## 4. Turborepo monorepo for a solo developer

Turborepo is a **Rust-powered build system for JavaScript/TypeScript monorepos** by Vercel. Current version: **v2.8.2** (February 2026). It provides content-aware caching (never rebuilds unchanged code), parallel task execution, remote caching, and the `--affected` flag to run tasks only for packages changed since the last commit.

### Recommended directory structure

```
ces-project/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/              # Next.js 16 marketing site
â”‚   â”œâ”€â”€ marimo/           # Python notebook server (see note below)
â”‚   â””â”€â”€ dashboard/        # Admin API / dashboard
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ ui/               # Shared React components + brand assets
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/    # Button, Card, etc.
â”‚   â”‚   â”‚   â”œâ”€â”€ assets/        # SVG logos, icons as React components
â”‚   â”‚   â”‚   â””â”€â”€ index.ts       # Barrel exports
â”‚   â”‚   â””â”€â”€ package.json       # @repo/ui
â”‚   â”œâ”€â”€ config/           # Shared ESLint + TypeScript configs
â”‚   â”‚   â”œâ”€â”€ eslint/
â”‚   â”‚   â””â”€â”€ typescript/
â”‚   â””â”€â”€ utils/            # Shared functions, constants, types
â”œâ”€â”€ turbo.json
â”œâ”€â”€ package.json          # Root workspace
â”œâ”€â”€ pnpm-workspace.yaml
â””â”€â”€ tsconfig.base.json
```

The `turbo.json` pipeline configuration defines task dependencies (`"build"` depends on `"^build"` -- build dependencies first), persistent dev tasks, and output directories for caching. Consumer apps reference shared packages via `"@repo/ui": "workspace:*"` in their package.json.

**Python apps (Marimo) in Turborepo**: Turborepo only manages JavaScript/TypeScript. For `apps/marimo`, either keep it outside Turborepo's task graph (run it separately with Docker Compose) or create a minimal `package.json` with npm scripts wrapping Python commands -- Turborepo can then orchestrate it alongside JS apps, though caching won't be effective.

**Asset management**: Store brand assets (SVG logos, icons) in `packages/ui/assets/` alongside UI components. Export SVGs as React components from `@repo/ui`. For project photos and raster images, keep them in `apps/web/public/images/` since they're specific to the marketing site and benefit from `next/image` optimization. shadcn/ui has **monorepo support** (added December 2024) -- the CLI works within workspace packages.

Documentation: **turborepo.dev/docs** and the crafting guide at **turborepo.dev/docs/crafting-your-repository**.

---

## 5. AWS deployment with SST and OpenNext -- no Vercel required

### SST v3: TypeScript infrastructure as code

SST (Serverless Stack) is an open-source framework for deploying full-stack applications on AWS using TypeScript. **SST v3** replaced the underlying AWS CDK/CloudFormation engine with **Pulumi + Terraform providers**, eliminating CloudFormation's slow deployments, resource limits, and state management pain. All infrastructure is defined in a single `sst.config.ts` file.

Deploying a complete Next.js site is one line:

```typescript
// sst.config.ts
export default $config({
  app(input) {
    return {
      name: "ces-web",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: { aws: { region: "eu-central-1" } }, // Frankfurt for EU data residency
    };
  },
  async run() {
    const site = new sst.aws.Nextjs("CESWeb", {
      domain: "ces-energy.com",
    });
    return { url: site.url };
  },
});
```

That single `sst.aws.Nextjs` component creates approximately **70 AWS resources**: CloudFront distribution, S3 bucket, Lambda functions, DynamoDB table, SQS queue, IAM roles, and SSL certificates. SST's **resource linking** (`link: [bucket]`) auto-grants IAM permissions and exposes resources in application code via `Resource.MyBucket.name`.

Documentation: **sst.dev/docs** and the Next.js guide at **sst.dev/docs/start/aws/nextjs/**.

### OpenNext: the bridge between Next.js and AWS

OpenNext is the open-source adapter that converts Next.js build output into deployment-ready packages for AWS. Current version: **@opennextjs/aws v3.9.8**. It supports all Next.js 15 features including App Router, ISR, middleware, image optimization, streaming, and `"use cache"`.

OpenNext runs `next build` in standalone mode, then converts the `.next/` output into:

- **Server function** -- Next.js server wrapped in a Lambda-compatible handler
- **Image optimization function** -- Sharp-based image processing on arm64 Lambda
- **Revalidation function** -- Handles ISR background regeneration
- **Static assets** -- Pre-built files for S3
- **Warmer function** -- Periodically invokes Lambda to prevent cold starts

SST pins the OpenNext version to each SST release. You typically don't interact with OpenNext directly -- SST handles it.

Documentation: **opennext.js.org/aws** and **github.com/opennextjs/opennextjs-aws**.

### The full AWS architecture

```
User Request â†’ CloudFront (CDN, global edge)
                 â”œâ”€â”€ /_next/static/* â†’ S3 (immutable hashed assets, long cache)
                 â”œâ”€â”€ /favicon.ico, /images/* â†’ S3 (public files)
                 â”œâ”€â”€ /_next/image â†’ Lambda (arm64, sharp-based optimization)
                 â””â”€â”€ All other routes â†’ Lambda (server function, SSR + API)

Server Lambda:
  â”œâ”€â”€ ISR cache reads/writes â†’ S3
  â”œâ”€â”€ Tag-based revalidation â†’ DynamoDB
  â””â”€â”€ Stale-while-revalidate â†’ SQS FIFO â†’ Revalidation Lambda
```

**CloudFront** acts as the CDN and request router, using behaviors to direct static asset requests to S3 and dynamic requests to Lambda. **S3** stores both static assets and the ISR cache. **Lambda** handles SSR, API routes, and image optimization -- with optional Lambda@Edge for edge-location rendering. **DynamoDB** tracks revalidation tags for `revalidateTag()` and `revalidatePath()`. **SQS FIFO** queues revalidation requests for stale-while-revalidate behavior.

For the **Marimo notebook server** (containerized Python), use SST's `Cluster` and `Service` components (ECS Fargate):

```typescript
const vpc = new sst.aws.Vpc("CESVpc");
const cluster = new sst.aws.Cluster("CESCluster", { vpc });
cluster.addService("MarimoService", {
  dev: { command: "marimo run notebook.py" },
  // Dockerfile in apps/marimo
});
```

ECS Fargate starts at ~**EUR 12/month** for 0.25 vCPU and 512MB. App Runner is also possible via low-level `aws.apprunner.Service` but lacks SST's high-level resource linking.

### Why SST over Terraform for this project

| Dimension | SST v3 | Terraform |
|-----------|--------|-----------|
| Language | TypeScript (same as your app) | HCL (separate DSL to learn) |
| Deploying Next.js | 1 component = ~70 resources | Write each resource manually |
| Developer experience | `sst dev` runs infrastructure + frontend together | Separate tooling for local dev |
| Resource linking | `link: [bucket]` auto-grants IAM + SDK access | Manual IAM policies + env vars |
| Lambda bundling | Automatic | Custom scripts needed |
| Learning curve for a solo dev | Hours | Days to weeks |

**Terraform wins when**: you need multi-cloud (AWS + GCP + Azure), enterprise compliance requires it, you have a dedicated DevOps team fluent in HCL, or you're managing traditional non-serverless infrastructure. For a **solo developer shipping a Next.js site on AWS**, SST is dramatically faster to learn and operate.

### CI/CD with GitHub Actions

SST recommends OIDC (OpenID Connect) authentication -- no long-lived AWS credentials in GitHub secrets:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: curl -fsSL https://sst.dev/install | bash
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::ACCOUNT_ID:role/ces-deploy-role
          aws-region: eu-central-1
      - run: npx sst deploy --stage production
```

SST also offers its own **Console** (console.sst.dev) with autodeploy on git push, PR preview environments, and log viewing -- free for <= 350 active resources.

---

## 6. Design system with shadcn/ui and Tailwind CSS v4

### shadcn/ui: own the component code

shadcn/ui is **not a component library** -- it's a code distribution system. Instead of `npm install`, you run `npx shadcn@latest add button` and the source code is copied into your project's `components/ui/` directory. Components are built on **Radix UI** accessible primitives, styled with Tailwind CSS. You own the code entirely -- customize anything, no dependency lock-in.

Current status: **106,000+ GitHub stars**, with monthly updates through early 2026 including Tailwind v4 support (February 2025), monorepo support (December 2024), shadcn CLI 3.0 (August 2025), and unified `radix-ui` package imports (February 2026).

Initialize: `npx shadcn@latest init`. Add components: `npx shadcn@latest add button card dialog navigation-menu`.

Documentation: **ui.shadcn.com/docs** and **ui.shadcn.com/docs/theming**.

### Tailwind CSS v4: CSS-first configuration

Released **January 22, 2025**, Tailwind v4 is a ground-up Rust rewrite. Full builds are **3.5-5x faster**, incremental builds **up to 100x faster**. The biggest conceptual change: **no more `tailwind.config.js`** -- everything is configured in CSS using the `@theme` directive.

```css
@import "tailwindcss";

@theme {
  --font-brand: "YourBrandFont", sans-serif;
  --color-brand-gold: oklch(0.75 0.12 85);
  --color-brand-black: oklch(0 0 0);
}
```

Variables defined in `@theme` automatically generate utility classes (`bg-brand-gold`, `text-brand-black`, `font-brand`) AND expose as CSS custom properties. The default color palette uses **OKLCH** for wider gamut and more perceptually uniform colors. Built-in features that previously required plugins: `@import` handling, vendor prefixing, CSS nesting, and container queries. No more `postcss-import` or `autoprefixer` dependencies.

Documentation: **tailwindcss.com/docs/theme** and **tailwindcss.com/blog/tailwindcss-v4**.

### Building the CES brand design system

The design system bridges three layers: brand tokens â†’ Tailwind utilities â†’ shadcn/ui components.

**Step 1: Define brand tokens as CSS variables** in `app/globals.css`:

```css
@import "tailwindcss";

:root {
  --brand-gold: oklch(0.75 0.12 85);       /* #D4A843 converted to oklch */
  --brand-black: oklch(0 0 0);

  /* shadcn/ui semantic tokens -- light mode */
  --background: oklch(1 0 0);
  --foreground: oklch(0.1 0 0);
  --primary: oklch(0.75 0.12 85);           /* Gold */
  --primary-foreground: oklch(0 0 0);       /* Black text on gold */
  --secondary: oklch(0.96 0.01 85);
  --accent: oklch(0.75 0.12 85);
  --muted: oklch(0.96 0.01 85);
  --border: oklch(0.88 0.04 85);
  --ring: oklch(0.75 0.12 85);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.12 0 0);
  --foreground: oklch(0.95 0 0);
  --primary: oklch(0.75 0.12 85);           /* Gold stays consistent */
  --primary-foreground: oklch(0 0 0);
}

@theme inline {
  --color-brand-gold: var(--brand-gold);
  --color-brand-black: var(--brand-black);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}
```

The `@theme inline` block bridges CSS variables to Tailwind utilities, enabling classes like `bg-primary` and `text-brand-gold`. Convert hex to OKLCH using **oklch.com**.

**Step 2: Self-host brand fonts** via `next/font`:

```typescript
// app/fonts.ts
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

Apply in root layout with `<html className={brandFont.variable}>`, then register in CSS: `@theme { --font-brand: var(--font-brand); }`. Fonts are downloaded at build time, served from the same domain -- zero external requests, zero layout shift, GDPR-friendly.

**Step 3: Add shadcn/ui components** -- they automatically use your `--primary`, `--background`, and other semantic tokens. Every `<Button variant="default">` renders in your brand gold.

For theme customization, **tweakcn.com** provides an interactive visual editor supporting Tailwind v4 + shadcn/ui.

---

## 7. Marimo demos: external hosting with proxy routing

Marimo notebooks run as a separate Python service -- they are **not part of the Next.js build**. The CES site links them in via URL rewrites so they appear under the same domain.

### Architecture

```
ces-energy.com/                â†’ Next.js (CloudFront â†’ Lambda/S3)
ces-energy.com/demos/solar     â†’ Marimo notebook (proxied to separate host)
ces-energy.com/demos/district  â†’ Marimo notebook (proxied to separate host)
```

Marimo runs as a standalone container (Docker on a small EC2, App Runner, or any VPS). Next.js `rewrites` in `next.config.js` proxy `/demos/*` to the Marimo host transparently -- the user never sees the underlying URL:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/demos/:path*',
        destination: `${process.env.MARIMO_HOST}/:path*`,
        // e.g. https://marimo.internal.ces-energy.com/:path*
      },
    ];
  },
};
```

The Marimo host can be anything: a EUR 5/month Hetzner VPS, an AWS App Runner service, or even a free-tier fly.io instance. The rewrite makes it appear seamless under `ces-energy.com/demos/`. No CORS issues, no iframe hacks, same-origin cookies if needed.

**Alternative: iframe embed.** If the rewrite approach causes issues with Marimo's asset paths, embed via `<iframe src="https://marimo.ces-energy.com/solar" />` in a Next.js page at `/demos/solar`. Less seamless but zero configuration conflicts.

---

## 8. SST and OpenNext: a Terraform/Pulumi veteran's perspective

You know Terraform and some Pulumi. Here's the honest assessment of where SST fits.

### What SST actually is

SST v3 is a **TypeScript-native Infrastructure-as-Code framework** built on top of **Pulumi's engine** and **Terraform providers**. That last part is critical -- SST doesn't replace Terraform's resource definitions, it uses them. Under the hood, SST calls Pulumi which calls Terraform providers to provision AWS resources. Your state is stored in Pulumi Cloud (free tier) or an S3 backend.

The value proposition is a library of **high-level components** (`sst.aws.Nextjs`, `sst.aws.Cluster`, `sst.aws.Bucket`, etc.) that compose dozens of low-level Terraform resources into a single declaration. Think of it as: Terraform is LEGO bricks, SST is pre-built LEGO sets with instructions.

### The SST -> Pulumi -> Terraform chain

```
You write:     sst.aws.Nextjs("CESWeb", { domain: "ces-energy.com" })
                    â†“
SST expands:   ~70 resources (CloudFront, S3, Lambda, DynamoDB, SQS, IAM, ACM...)
                    â†“
Pulumi engine: Plans and applies changes via Terraform AWS provider
                    â†“
AWS API calls: Actual resource creation/updates
```

State management: Pulumi stores state in its cloud backend by default (free for individual use). You can also use S3 as a backend (`pulumi login s3://my-state-bucket`) for full control.

### Honest pros and cons for someone who knows Terraform

**Where SST is genuinely better:**

- **Next.js deployment is solved.** The `sst.aws.Nextjs` component encapsulates OpenNext + CloudFront + Lambda + S3 + ISR cache + image optimization + revalidation queue. In Terraform, you'd write 500+ lines of HCL and maintain the OpenNext integration yourself. This alone justifies SST for this project.
- **`sst dev` is magic for local development.** It deploys real AWS resources (Lambda, S3, DynamoDB) but routes invocations to your local machine via IoT WebSocket. You test against real AWS services without mock stacks or LocalStack. Terraform has no equivalent.
- **Resource linking eliminates IAM busywork.** `link: [myBucket]` auto-generates the correct IAM policy AND injects the bucket name as a type-safe environment variable accessible via `import { Resource } from "sst"`. In Terraform, you'd write the IAM policy, the policy attachment, the environment variable block, and pray the permissions are correct.
- **Same language as your app.** TypeScript everywhere -- your Next.js site, your SST config, your Lambda functions, your CI pipeline. No context-switching to HCL.

**Where SST is honestly worse or riskier:**

- **Abstraction leak risk.** When an SST high-level component doesn't expose the knob you need (specific CloudFront behavior, Lambda reserved concurrency, custom S3 lifecycle rules), you drop down to raw Pulumi/Terraform resources. This works but you're now debugging at two abstraction layers. In pure Terraform, you always know exactly what you're getting.
- **Smaller ecosystem.** SST has ~100 high-level components. Terraform has 4,000+ providers and hundreds of thousands of community modules. If you need something SST doesn't wrap (e.g., a complex VPN setup, Transit Gateway, specific compliance controls), you write raw Pulumi resources -- which is essentially Pulumi-flavored Terraform.
- **Vendor coupling to SST project.** SST is maintained by a small team (Jay V and team at sst.dev). If the project stalls, you're on a custom framework over Pulumi over Terraform. Terraform and Pulumi are both backed by well-funded companies (HashiCorp/IBM and Pulumi Corp). That said, SST is open source (MIT) and worst case you could maintain a fork or migrate to raw Pulumi.
- **State in Pulumi Cloud by default.** For an Austrian company, you may want state stored in EU (S3 in eu-central-1). This requires configuring `pulumi login s3://...` which SST supports but doesn't default to.
- **Debugging deploy failures.** When something goes wrong, error messages come through SST â†’ Pulumi â†’ Terraform provider â†’ AWS API. The stack traces can be confusing. Pure Terraform errors are one layer deep.

### When to escape-hatch to raw resources

SST lets you mix high-level components with raw Pulumi/Terraform resources in the same config:

```typescript
// sst.config.ts
export default $config({
  async run() {
    // High-level SST component -- handles 70 resources
    const site = new sst.aws.Nextjs("CESWeb", {
      domain: "ces-energy.com",
    });

    // Raw Terraform resource via Pulumi -- full control
    const customBucket = new aws.s3.BucketV2("ReportsBucket", {
      bucket: "ces-client-reports",
      // Any Terraform aws_s3_bucket argument works here
    });

    // You can even import existing Terraform state
    // if migrating from a Terraform-managed setup
  },
});
```

This is the key insight: **SST doesn't prevent you from doing custom things.** It's an abstraction that you can punch through whenever needed. The high-level components save time on the 80% of infrastructure that's boilerplate (Next.js deployment, databases, queues). The 20% that's custom, you handle with raw resources using the same Terraform providers you already know.

### What is OpenNext, specifically?

OpenNext is the **open-source build adapter** that makes Next.js deployable outside Vercel. It's a standalone project (opennext.js.org) that SST uses internally.

The problem it solves: `next build` produces output optimized for Vercel's proprietary infrastructure. Server routes expect Vercel's edge runtime, ISR expects Vercel's cache layer, image optimization expects Vercel's image CDN. None of this works on raw AWS.

OpenNext runs after `next build` and transforms the output:

```
next build output (.next/)          OpenNext transforms to:
â”œâ”€â”€ server/                    â†’    Lambda handler (Node.js, compatible with Lambda runtime)
â”œâ”€â”€ static/                    â†’    S3 upload package (with cache headers)
â”œâ”€â”€ image-optimization/        â†’    Separate Lambda with Sharp for image processing
â”œâ”€â”€ ISR cache/                 â†’    S3-backed cache with DynamoDB tag tracking
â””â”€â”€ middleware/                â†’    CloudFront Function or Lambda@Edge
```

Current version: **@opennextjs/aws v3.9.8**. Supports all Next.js 15 features (App Router, ISR, streaming, `"use cache"`, image optimization, middleware). Next.js 16 support is in progress. SST pins a specific OpenNext version per release -- you don't manage it directly.

**You never run OpenNext yourself.** SST's `sst.aws.Nextjs` component calls it during `sst deploy`. If you wanted to use OpenNext without SST (e.g., with raw Terraform or CDK), you'd run `npx @opennextjs/aws build` and deploy the output directories yourself -- but that's significantly more work.

### Recommendation for this project

**Use SST for the Next.js site and any serverless infrastructure** (Lambda, S3, DynamoDB, SQS, CloudFront). The `sst.aws.Nextjs` component alone saves weeks of Terraform work.

**Use raw Pulumi resources (within SST) for anything custom** -- specific VPC configurations, security groups, App Runner for Marimo, or any resource SST doesn't have a high-level component for.

**Don't fight the abstraction.** If you find yourself constantly dropping to raw resources, that's a signal SST isn't the right tool for that specific piece of infrastructure. But for a Next.js marketing site + some supporting services, SST's sweet spot is exactly this use case.

---

## 9. Content management, images, and SEO

### Portfolio data: start with MDX and JSON

For a solo-developer portfolio site with 10-30 case studies, **MDX + JSON files in Git** is the optimal starting point. Zero cost, full TypeScript type safety, instant builds.

**JSON for structured metadata** -- project lists, tags, categories:

```typescript
// data/projects.ts
export const projects = [
  {
    slug: "sheikh-zayed-desert-learning-centre",
    title: "Sheikh Zayed Desert Learning Centre",
    client: "Al Ain Wildlife Park & Resort",
    location: "UAE",
    year: "2008-2010",
    category: "Innovative Building Technology",
    thumbnail: "/images/projects/szd-thumb.jpg",
    tags: ["LEED Platinum", "Estidama 5 Pearls", "Solar Cooling", "MEP Design"],
    featured: true,
  },
  // ... more projects from the reference deck
];
```

**MDX for narrative case studies** -- rich content with embedded React components. Use `@next/mdx` for local files in the `app/` directory, or `next-mdx-remote` for content stored in `/content`.

**When to consider a headless CMS**: Only when non-technical team members need to publish content. Top options: **Sanity** (generous free tier), **Strapi** (self-hostable in EU for GDPR), or **TinaCMS** (Git-based with visual editing).

### Image optimization

Configure `next/image` for maximum performance:

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 14400,
  },
};
```

Store high-resolution originals and let `next/image` handle responsive sizing, format conversion, and lazy loading. Use `priority` on hero images. Set `sizes` for responsive grids: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`. Use `placeholder="blur"` for blur-up loading.

### SEO implementation

**Root layout metadata**:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://ces-energy.com'),
  title: { default: 'CES Clean Energy Solutions', template: '%s | CES' },
  description: 'Vienna-based engineering consultancy for energy, environment, and sustainable urban development.',
  robots: { index: true, follow: true },
};
```

**Sitemap**: `app/sitemap.ts` dynamically lists all pages and projects. Served at `/sitemap.xml`.

**Structured data**: JSON-LD on pages -- `Organization` schema on homepage (name, Vienna address, logo, LinkedIn), `Service` for offerings, `Article` for case studies.

**OG image generation**: `app/projects/[slug]/opengraph-image.tsx` using `ImageResponse` from `next/og` for per-project social sharing images with brand styling.

---

## 10. Plausible Analytics for GDPR-compliant tracking

Plausible is a lightweight, **cookie-free, EU-hosted** analytics tool from Estonia. Tracking script is under **1 KB** (vs Google Analytics' 45 KB+). Directly addresses Austrian DPA rulings that found Google Analytics non-compliant with GDPR.

Counts unique visitors via daily-rotating hash: `hash(daily_salt + domain + IP + User-Agent)`. No cookies, no localStorage, no fingerprinting. Operates under legitimate interest (GDPR Art. 6(1)(f)) -- **no cookie consent banner needed**.

All data processed on **Hetzner servers in Falkenstein, Germany**.

### Integration

```typescript
// app/layout.tsx
import PlausibleProvider from 'next-plausible';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider
          domain="ces-energy.com"
          enabled={process.env.NODE_ENV === 'production'}
          trackOutboundLinks
          taggedEvents
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**EUR 9/month** cloud-hosted (recommended) or self-hosted via Docker for free.

---

## 11. Glossary of acronyms and tools

| Term | Full name | What it is |
|------|-----------|------------|
| **SSG** | Static Site Generation | Pre-render HTML at build time. Fastest, cheapest. |
| **SSR** | Server-Side Rendering | Generate HTML per request. For dynamic/personalized pages. |
| **ISR** | Incremental Static Regeneration | SSG + background revalidation after a time interval. |
| **CSR** | Client-Side Rendering | Render via JS in browser. For interactive dashboards, not SEO content. |
| **RSC** | React Server Components | Components that run only on server, ship zero JS to client. Default in App Router. |
| **App Router** | Next.js App Router | The `/app` directory routing system (replaces Pages Router). File-based. |
| **SST** | Serverless Stack Toolkit | TypeScript IaC framework on Pulumi/Terraform for AWS deployment. |
| **CDN** | Content Delivery Network | Edge cache (CloudFront) that serves static assets from nearest location. |
| **ISR cache** | -- | S3-backed cache for incrementally regenerated pages. |
| **OpenNext** | -- | Open-source adapter converting Next.js build output for AWS Lambda/S3. |
| **Turbopack** | -- | Rust-based bundler replacing Webpack in Next.js 16. 2-5x faster. |
| **Turborepo** | -- | Monorepo build system with caching. Manages multiple apps/packages. |
| **GSAP** | GreenSock Animation Platform | Timeline-based animation library. All plugins now free. |
| **ScrollTrigger** | -- | GSAP plugin for scroll-driven animations (pin, scrub, snap). |
| **SplitText** | -- | GSAP plugin for splitting text into chars/words/lines for animation. |
| **Lenis** | -- | Smooth scroll library. Desktop only; disable on mobile. |
| **Motion** | (formerly Framer Motion) | Declarative React animation library. Gestures, layout, exit animations. |
| **shadcn/ui** | -- | Copy-paste React component system built on Radix UI + Tailwind. |
| **Radix UI** | -- | Accessible headless component primitives (Dialog, Dropdown, etc.). |
| **MDX** | Markdown + JSX | Markdown files that can embed React components. |
| **OKLCH** | Oklab Lightness Chroma Hue | Perceptually uniform color space used in Tailwind v4. |
| **BIM** | Building Information Modeling | 3D digital representation of buildings (CES core competency). |
| **MEP** | Mechanical, Electrical, Plumbing | Building services engineering (CES core service). |
| **ESIA** | Environmental and Social Impact Assessment | Sustainability assessment for IFI-financed projects. |
| **IFI** | International Finance Institution | EIB, EBRD, World Bank -- CES helps clients secure financing. |
| **PWA** | Progressive Web App | Web app with offline capability via service worker. |
| **OIDC** | OpenID Connect | Auth protocol for GitHub Actions â†’ AWS (no stored credentials). |
| **HCL** | HashiCorp Configuration Language | Terraform's domain-specific language. |

---

## 12. Quick-start commands for Claude Code

When handing this project to Claude Code for implementation, provide these instructions:

```
Project: CES Clean Energy Solutions corporate marketing website
Stack: Next.js 16 (App Router) + Tailwind v4 + shadcn/ui + GSAP + Motion + Lenis
Monorepo: Turborepo with pnpm workspaces
Deploy: SST v3 to AWS eu-central-1

Initialize:
  npx create-turbo@latest ces-project --package-manager pnpm
  cd ces-project/apps/web
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
  npx shadcn@latest init
  npx shadcn@latest add button card dialog navigation-menu sheet
  pnpm add gsap @gsap/react motion lenis next-plausible

Brand tokens:
  Gold: oklch(0.75 0.12 85) / #D4A843
  Black: oklch(0 0 0) / #000000
  Background: oklch(1 0 0) / #FFFFFF

Key constraints:
  - Mobile-first responsive design (sales engineers present on iPad/phone)
  - Lenis smooth scroll: desktop only (disable on < 1024px)
  - GSAP ScrollTrigger: use matchMedia() for adaptive animation complexity
  - Respect prefers-reduced-motion
  - SSG for all marketing pages, no SSR
  - Marimo demos: external host, proxied via next.config.js rewrites at /demos/*
  - All images via next/image with responsive sizes attribute
  - Self-host fonts via next/font (no external requests for GDPR)
  - Plausible Analytics (cookie-free, no consent banner)

Reference content:
  - See 260126_CES_References_HighLevel_Presentation.pdf for project portfolio
  - 15 case studies spanning UAE, Qatar, Georgia, Europe, Kosovo, KSA, Rwanda
  - Services: Energy Efficiency, Sustainability, Plant Engineering, Renewable Energy,
    Innovative Building Technology, R&D
  - Core principles: Integrated Design, BIM Workflow, ISO certifications
  - Innovation: CFD simulation, microclimate, AI integration, circularity assessment
```