# PRD: SST Deployment Setup

## Introduction/Overview

Set up SST v3 deployment infrastructure so the CES marketing site can be deployed to AWS. The site is currently a hello-world Next.js 16 app in a Turborepo monorepo. SST v3 is installed (`^3.6.2` in root `devDependencies`) but no infrastructure config exists — no `sst.config.ts`, no `.sst/` directory, no `next.config.ts`. This PRD covers creating the minimum configuration to deploy the current site to a dev stage on AWS eu-central-1 (Frankfurt), validating the full pipeline before building features on top.

## Goals

1. Create a working `sst.config.ts` that deploys the Next.js app to AWS eu-central-1
2. Successfully deploy the current hello-world page to a dev stage and get a live CloudFront URL
3. Establish the correct project structure for SST (gitignore, next.config, standalone output)
4. Validate the SST → OpenNext → CloudFront → Lambda/S3 pipeline end-to-end

## User Stories

- As a developer, I want to run `pnpm deploy:dev` and get a live URL so I can verify the deployment pipeline works before building features.
- As a developer, I want production deploys to retain resources on removal so I don't accidentally delete a live site.
- As a developer, I want dev stages to auto-clean on removal so I don't accumulate unused AWS resources.

## Functional Requirements

1. **Delete typo file** — Remove `apps/web/nex.config.ts` (0 bytes, misspelled filename) if it exists.
2. **Create `sst.config.ts`** at repo root with:
   - App name: `ces-web`
   - Region: `eu-central-1` (Frankfurt, EU data residency)
   - Removal policy: `retain` for production, `remove` for all other stages
   - Home: `aws`
   - Single resource: `sst.aws.Nextjs` pointing to `apps/web`
   - No custom domain (deploys to CloudFront URL initially)
   - Return the site URL as output
3. **Create `apps/web/next.config.ts`** with `output: "standalone"` — required by OpenNext to bundle the Next.js server into a Lambda-compatible package.
4. **Update `.gitignore`** — append `.sst/` to prevent committing generated types and local SST state.
5. **Verify local build** — `pnpm --filter @ces/web build` must complete without errors before deploying.
6. **Deploy to dev stage** — `pnpm deploy:dev` must complete and output a working CloudFront URL.

## Non-Goals / Out of Scope

- Custom domain configuration (user will manage DNS manually in AWS console later)
- GitHub Actions CI/CD pipeline
- Pulumi state backend migration to S3 (using Pulumi Cloud free tier for now)
- `sst dev` local development mode setup
- Marimo notebook service (ECS/Fargate)
- Production deployment (dev stage only for validation)

## Design Considerations

No UI changes — this PRD is purely infrastructure. The deployed site should render the existing hello-world page identically to `pnpm dev`.

## Technical Considerations

### Prerequisites (user must complete before deployment)

- **AWS credentials** configured (`aws configure` or env vars `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`). IAM user/role needs broad permissions — `AdministratorAccess` is simplest for initial setup.
- **Free Pulumi account** at app.pulumi.com (SST prompts on first deploy if not authenticated).

### What `sst.aws.Nextjs` creates (~70 AWS resources)

- CloudFront distribution (CDN + request router)
- S3 bucket (static assets + ISR cache)
- Lambda functions (server, image optimization, revalidation)
- DynamoDB table (ISR tag tracking)
- SQS FIFO queue (stale-while-revalidate)
- IAM roles (per-function permissions)
- ACM certificate (SSL, only if custom domain is added later)

### Why `output: "standalone"` in next.config.ts

OpenNext requires this to bundle the Next.js server. Without it, the Lambda function won't have the correct file structure. This is the `output` option documented at nextjs.org/docs — it bundles server dependencies into a self-contained directory.

### State management

Pulumi Cloud (free tier) stores infrastructure state. State is essentially a JSON file tracking what AWS resources exist and their current configuration — similar to Terraform's `.tfstate`. This enables SST to diff changes on subsequent deploys.

### Timing and cost

- **First deploy:** ~3-5 minutes (creates all resources). Subsequent deploys: ~1-2 minutes (diff only).
- **Estimated monthly cost for dev stage:** < $1/month (mostly free tier). Static site with minimal Lambda invocations.

## Success Metrics

1. `pnpm --filter @ces/web build` completes without errors
2. `pnpm deploy:dev` completes and outputs a CloudFront URL (format: `https://d1234abcd.cloudfront.net`)
3. Visiting the CloudFront URL shows the "CES Clean Energy Solutions" page (gold text on black background)
4. `pnpm type-check` still passes after changes
5. `pnpm lint` still passes after changes

## Open Questions

1. Should we scope down the IAM permissions from `AdministratorAccess` to a minimum policy now, or defer that to a security hardening task later?
2. Does the user want to set up `sst dev` (local dev against real AWS) as a follow-up task?
3. When the user is ready for a custom domain, will it be a subdomain (e.g., `dev.ces-energy.com`) or a separate domain?

## Files to Create/Modify

| File | Action |
|------|--------|
| `/tasks/prd-sst-deployment.md` | Create (this PRD) |
| `apps/web/nex.config.ts` | Delete (if exists) |
| `sst.config.ts` | Create |
| `apps/web/next.config.ts` | Create |
| `.gitignore` | Edit (append `.sst/`) |

## Current Status

**Completed:**
- [x] `tasks/prd-sst-deployment.md` — this PRD
- [x] `sst.config.ts` — created at repo root
- [x] `apps/web/next.config.ts` — created with `output: "standalone"`
- [x] `.gitignore` — `.sst/` added
- [x] `apps/web/nex.config.ts` — already absent, no action needed
- [x] `pnpm --filter @ces/web build` — passes (standalone output)
- [x] `pnpm type-check` — passes

**Not started — requires manual setup first:**
- [ ] Configure AWS credentials (`aws configure` or set `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`). IAM user/role needs `AdministratorAccess` for initial setup.
- [ ] Create free Pulumi account at https://app.pulumi.com (SST prompts on first deploy)
- [ ] Run `pnpm deploy:dev` and verify CloudFront URL serves the hello-world page

**Known issue (pre-existing, unrelated):**
- `pnpm lint` fails — no eslint config exists in the project yet

## Verification Checklist

1. `pnpm --filter @ces/web build` — no errors
2. `pnpm deploy:dev` — outputs a CloudFront URL
3. Visit CloudFront URL — shows hello-world page
4. `pnpm type-check` — passes
5. `pnpm lint` — passes
