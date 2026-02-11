# CES Clean Energy Solutions

Scroll-driven marketing site for a Vienna-based engineering consultancy (energy, environment, sustainable urban development). Built for mobile-first field use — sales engineers reference project portfolios on phones and iPads in client meetings.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Components | shadcn/ui (Radix UI primitives) |
| Animation | GSAP + ScrollTrigger, Motion, Lenis |
| Monorepo | Turborepo + pnpm workspaces |
| Deployment | SST v3 → AWS (eu-central-1) |

## Project Structure

```
apps/web/          → @ces/web — Next.js marketing site
packages/ui/       → @repo/ui — shared components and brand assets
docs/              → architecture docs, brand guidelines
tasks/             → PRDs and task lists
```

## Prerequisites

- **Node.js** 20+
- **pnpm** 9.15.4 — `corepack enable && corepack prepare pnpm@9.15.4 --activate`

## Development

```bash
pnpm install                    # install all dependencies
pnpm dev                        # dev server on http://localhost:8080
pnpm --filter @ces/web dev      # web app only on http://localhost:4200
pnpm build                      # production build (all packages)
pnpm type-check                 # tsc --noEmit across monorepo
```

## Deployment

Deployment uses **SST v3**, which orchestrates AWS infrastructure through the **Pulumi** engine with **Terraform AWS providers** under the hood. Here's how the pieces fit together:

### The Stack: SST → Pulumi → Terraform → AWS

**Terraform** is the industry-standard tool for defining cloud infrastructure as code. It uses "providers" — plugins that know how to talk to specific cloud APIs (AWS, GCP, Azure, etc). Terraform tracks what resources exist in a **state file** so it can diff your desired config against reality.

**Pulumi** does the same job as Terraform but lets you write infrastructure in real programming languages (TypeScript, Python, Go) instead of Terraform's HCL syntax. Pulumi can use Terraform's providers under the hood, getting access to the same AWS resources without reinventing the wheel.

**SST v3** is a framework built on top of Pulumi that provides higher-level components. Instead of manually wiring up 70+ AWS resources (CloudFront, S3, Lambda, DynamoDB, SQS, IAM roles...), you write `new sst.aws.Nextjs("Site", { path: "apps/web" })` and SST handles the rest via its **OpenNext** adapter, which converts a Next.js app into a Lambda-compatible deployment.

```
sst.config.ts  →  SST components  →  Pulumi engine  →  Terraform AWS provider  →  AWS resources
   (you write)      (high-level)      (orchestrator)      (API translator)          (~70 resources)
```

### What Gets Created

`sst.aws.Nextjs` provisions:
- **CloudFront** — CDN that routes requests to static assets or server functions
- **S3** — stores static files and ISR cache
- **Lambda** — runs server-side rendering, image optimization, and ISR revalidation
- **DynamoDB** — tracks ISR cache tags for targeted revalidation
- **SQS FIFO** — queues stale-while-revalidate requests
- **IAM roles** — least-privilege permissions per function

### State Management

SST stores infrastructure state in **AWS S3** (`home: "aws"` in `sst.config.ts`). This is a JSON file tracking every AWS resource and its config — analogous to Terraform's `.tfstate`. SST uses it to compute diffs on subsequent deploys (only change what changed). The S3 bucket is auto-created by SST's bootstrap process.

> **Note:** SST v3 only supports `"aws"` or `"cloudflare"` as state backends. It does **not** support Pulumi Cloud, despite using Pulumi's engine internally.

To view your deployed resources, use the **SST Console** at [console.sst.dev](https://console.sst.dev). It reads from the S3 state and shows all resources, functions, and logs.

### Lambda Function URL Fix

Newer AWS accounts (created after mid-2024) block public Lambda Function URL access by default. The `$transform` block in `sst.config.ts` adds the missing `lambda:InvokeFunction` permission to work around this. See [SST #6397](https://github.com/anomalyco/sst/issues/6397). This is safe to remove if AWS fixes the default or SST patches their component.

### Setup (One-Time)

1. Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
2. **AWS credentials** — create an IAM user with `AdministratorAccess` at [console.aws.amazon.com/iam](https://console.aws.amazon.com/iam/). Add the access key and secret to `.env`.
3. SST v3 stores state in S3, not Pulumi Cloud — no Pulumi token needed.

The `.env` file is gitignored. Deploy scripts source it automatically.

### Deploy Commands

```bash
pnpm deploy:dev      # deploy to dev stage (~3-5 min first time, ~1-2 min after)
pnpm deploy          # deploy to production stage
```

Dev stages use `removal: "remove"` — resources are fully deleted on teardown. Production uses `removal: "retain"` — resources are preserved even if you run `sst remove`, preventing accidental deletion.

### Cost

Dev stage: **< $1/month** (mostly AWS free tier). Static site with minimal Lambda invocations.

## Key Files

| File | Purpose |
|------|---------|
| `sst.config.ts` | Infrastructure definition (SST v3) |
| `apps/web/next.config.ts` | Next.js config (`output: "standalone"` for Lambda) |
| `apps/web/src/app/globals.css` | Design tokens (Tailwind v4 `@theme`) |
| `docs/technical-architecture.md` | Full architecture reference (871 lines) |
| `docs/BRAND.md` | Brand colors, typography, logo |
| `tasks/` | PRDs and implementation task lists |
