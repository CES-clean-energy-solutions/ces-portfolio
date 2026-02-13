# PRD: Marimo Notebook Integration

**Feature:** Interactive Python notebooks for CES portfolio
**Version:** 0.2 (Reviewed)
**Date:** 2026-02-12
**Status:** Draft — requires decisions on open items before implementation

---

## Review Summary

> **Key finding:** The original draft contains an internal contradiction. Sections 4–5 commit to Docker-only (ECS Fargate) and explicitly rule out WASM. The second half then introduces a two-tier WASM + Docker strategy and recommends starting with WASM. The repo structure also shifts between two naming conventions (`public/private` vs. `demos/analysis`). This review consolidates toward the two-tier approach, which is the stronger architecture for CES's use cases.
>
> **Recommendation:** Adopt the two-tier strategy. Start with WASM-exported demos (zero cost, instant load, perfect for sales). Add Docker tier only when a concrete notebook requires native deps or large datasets. This keeps Phase 1 simple and cheap.

---

## 1. Introduction / Overview

CES Clean Energy Solutions needs interactive Python notebooks (marimo framework) integrated with the Next.js portfolio website, serving three audiences:

1. **Sales engineers** — presenting to clients on iPads/phones in the field
2. **Data scientists** — running internal analysis (weather data, ML models, EnergyPlus)
3. **Potential clients** — browsing the portfolio to evaluate CES's technical capabilities

Notebooks live in a separate repository (`climatevis-dashboard`) and are linked from the portfolio via service card links (already implemented in the Services section).

**Current state:** Portfolio has Services section with expandable cards, each supporting an optional `links[]` array. Infrastructure for notebooks does not yet exist.

**Desired state:** Clicking a service card link (e.g., "Solar Calculator Demo") opens an interactive marimo notebook — instant load, mobile-friendly, CES-branded.

---

## 2. Goals

### Primary Goals

| # | Goal | Measure |
|---|------|---------|
| G1 | Deploy 3–5 interactive demo notebooks accessible from portfolio | Notebooks live, links functional |
| G2 | Mobile performance: < 3s load on 4G, fully interactive on iPad/iPhone | CloudWatch RUM P95 |
| G3 | Infrastructure cost < EUR 50/month | AWS Cost Explorer |
| G4 | Deploying a new/updated notebook takes < 10 min | Stopwatch test |

### Secondary Goals

| # | Goal | Measure |
|---|------|---------|
| G5 | Public/private access control | Auth middleware functional |
| G6 | Analytics via Plausible (existing) | Custom events firing |
| G7 | Reusable patterns for adding notebooks without re-architecting | README + template |

### Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Load Time (P95) | < 3s | CloudWatch RUM |
| Uptime | > 99.9% | ECS health checks + UptimeRobot |
| Cost | < EUR 50/month | AWS Cost Explorer (tag: `app:marimo`) |
| Engagement | > 2 min avg session | Plausible custom events |
| Adoption | 50%+ of sales presentations | Quarterly survey |
| Error Rate | < 1% | CloudWatch logs + alarms |

> **[Comment]** The "50% of sales presentations" metric needs a baseline. Consider tracking current presentation tool usage before setting this target. Also: 1000+ page views in month 1 (from the original) is aggressive for a 60-person firm. Be realistic — even 100 meaningful views from qualified leads would be a win.

---

## 3. User Stories

### Sales Engineers (Mobile Performance Critical)

- **US-1:** As a sales engineer, I want to open an interactive solar calculator demo on my iPad during a client meeting so I can show real-time ROI calculations without a laptop.
- **US-2:** As a sales engineer, I want demos to load in < 3 seconds on hotel WiFi so I don't lose the client's attention.
- **US-3:** As a sales engineer, I want notebooks to work offline (cached) so I can present in buildings with poor connectivity.

> **[Comment]** US-3 (offline) is achievable with WASM exports but not with Docker-served notebooks. This is a strong argument for the WASM-first approach for sales demos.

### Data Scientists (Full Python Environment)

- **US-4:** As a CES data scientist, I want to run EnergyPlus Python analysis on 50 MB weather data files to generate building performance reports.
- **US-5:** As a data scientist, I want to use custom Plotly wrapper libraries for branded visualizations matching CES style.
- **US-6:** As a data scientist, I want to deploy updated notebooks weekly without waiting for IT support.

### Potential Clients (Discovery & Showcase)

- **US-7:** As a potential client, I want to interact with a live demo of CES's optimization algorithms to evaluate technical capabilities before engaging.
- **US-8:** As a client, I want to see CES's data visualization quality to assess if they can handle my project's reporting needs.
- **US-9:** As a client, I want demos to work on my phone while commuting.

### CES Management (Cost & Maintenance)

- **US-10:** As CES management, I want hosting to cost < EUR 50/month.
- **US-11:** As management, I want some notebooks to be private so sensitive analysis doesn't leak to competitors.
- **US-12:** As management, I want to track notebook engagement to measure ROI.

---

## 4. Architecture Decision: Two-Tier Deployment

### Tier 1 — WASM Notebooks (Static Export)

**For:** Interactive demos, lightweight visualizations, sales tools

| Aspect | Detail |
|--------|--------|
| Deployment | `marimo export html-wasm notebook.py --output dist/demo.html` |
| Hosting | S3 + CloudFront (existing portfolio infra) |
| Cost | EUR 0/month (absorbed by existing hosting) |
| Load time | ~100–500 ms |
| Offline | Yes (fully client-side, cacheable via service worker) |
| Limitations | 2 GB memory cap, pure Python only (no native C extensions), no multiprocessing |

**Use cases:** Solar calculator demos, energy efficiency visualizations, BIM viewer integrations, portfolio project deep-dives.

### Tier 2 — Docker Service (ECS Fargate)

**For:** Heavy data processing, ML workloads, large datasets, native dependencies

| Aspect | Detail |
|--------|--------|
| Deployment | SST v3 → ECS Fargate + ALB |
| Hosting | 1 vCPU, 2 GB RAM, always-on |
| Cost | ~EUR 35–45/month (Fargate + S3 + data transfer) |
| Load time | < 3s (warm), 30–60s cold start if task crashed |
| Offline | No |
| Capabilities | Full Python ecosystem, direct S3 access, persistent kernel state |

**Use cases:** Weather data analysis (large CSV/NetCDF), ML model training/inference, EnergyPlus simulations, notebooks with native dependencies.

> **[Comment — Decision]** Start with Tier 1 only. Add Tier 2 when a concrete notebook requires it. This keeps Phase 1 at zero incremental cost and validates the concept before committing to ongoing Fargate spend.

---

## 5. Functional Requirements

### FR-1: Repository Structure

- **FR-1.1:** Separate Git repo `climatevis-dashboard`, independent of `ces-portfolio` monorepo.
- **FR-1.2:** Directory structure:
  - `notebooks/demos/` — lightweight notebooks for WASM export
  - `notebooks/analysis/` — heavy notebooks for Docker service
- **FR-1.3:** `Dockerfile.marimo` for containerized deployment (Tier 2).
- **FR-1.4:** `deploy/sst.config.ts` for infrastructure-as-code (Tier 2).
- **FR-1.5:** Data assets (CSV, NetCDF) stored in S3, referenced via env vars.
- **FR-1.6:** Sample datasets (< 1 MB) committed to Git for demos.

### FR-2: Portfolio Integration (Service Card Links)

- **FR-2.1:** Update `packages/content/data/services.ts` to add `links[]` to relevant services.
- **FR-2.2:** WASM demos: `{ label: "Solar Calculator Demo", href: "/demos/solar-calc.html", external: false }`
- **FR-2.3:** Docker notebooks: `{ label: "Weather Analysis", href: "/demos/weather-analysis", external: false }`
- **FR-2.4:** Next.js config: correct MIME types for `.wasm` files; rewrites for `/demos/heavy/*` → Fargate URL.

### FR-3: WASM Deployment (Tier 1)

- **FR-3.1:** Export notebooks via `marimo export html-wasm`.
- **FR-3.2:** Copy exports to `apps/web/public/demos/` in portfolio repo.
- **FR-3.3:** Deploy via existing SST pipeline (`pnpm deploy`).
- **FR-3.4:** Service worker caching for repeat visits / offline capability.

### FR-4: Docker Deployment (Tier 2 — when needed)

- **FR-4.1:** ECS Fargate service: 1 vCPU, 2 GB RAM, auto-restart on failure.
- **FR-4.2:** ALB with health checks on `/health` endpoint.
- **FR-4.3:** S3 bucket `marimo-data-{stage}` for large datasets.
- **FR-4.4:** CloudWatch logs with 30-day retention.
- **FR-4.5:** Zero-downtime deployment (new task starts before old stops).
- **FR-4.6:** Rollback: `pnpm sst deploy --stage production --rollback`.

### FR-5: Authentication & Access Control

- **FR-5.1:** Public notebooks (`/demos/*.html`) — no login required.
- **FR-5.2:** Private notebooks (`/demos/heavy/*`) — require authentication.
- **FR-5.3:** Auth via Next.js middleware checking session cookie.
- **FR-5.4:** v1: simple shared password. Post-v1: SSO integration.

> **[Comment]** Simple password auth is fine for MVP but make sure the password isn't hardcoded in source. Use AWS Secrets Manager or SST secrets from day one.

### FR-6: Performance

- **FR-6.1:** WASM demos: < 500 ms load time (P95).
- **FR-6.2:** Docker notebooks: < 3s load time on 4G (P95).
- **FR-6.3:** Fully interactive on iOS Safari and Android Chrome.
- **FR-6.4:** Touch targets: 44x44px minimum.
- **FR-6.5:** Font sizes: 16px minimum (prevents iOS zoom).

### FR-7: Monitoring & Analytics

- **FR-7.1:** Plausible analytics: page views (same as portfolio).
- **FR-7.2:** Custom events: `notebook-loaded`, `notebook-interaction`, `notebook-error`.
- **FR-7.3:** CloudWatch alarms: task unhealthy, memory > 80%, error rate > 5%.

### FR-8: Developer Experience

- **FR-8.1:** Local dev: `marimo edit notebook.py` runs notebook locally.
- **FR-8.2:** Docker preview: `docker-compose up` runs full stack (marimo + MinIO for S3).
- **FR-8.3:** README with setup, development, deployment, troubleshooting.

---

## 6. Non-Goals / Out of Scope (v1)

- Horizontal scaling (single ECS task sufficient for < 100 concurrent users)
- Real-time collaboration (notebooks are read-only for viewers)
- Notebook creation in browser (all development in IDEs, deployed via Git)
- Custom domain for notebooks (accessible via Next.js proxy only)
- CI/CD pipeline (manual `pnpm deploy`; add GitHub Actions later if needed)
- Per-client white-labeling
- SSO integration (Okta/Auth0 deferred to post-v1)

### Future Enhancements (Post-v1)

- Notebook gallery page (`/notebooks` with search/filter)
- Inline iframe embeds in project case study pages
- User data upload (clients upload their own CSV — requires security review)
- GPU support for ML training (EC2, not Fargate)
- Scheduled cron jobs for report regeneration
- German translations for notebook UI

---

## 7. Design Considerations

### Brand Consistency

- Background: `#000000` (black)
- Accent: `#D4A843` (web gold) for buttons, highlights
- Typography: match portfolio fonts (CDN)
- Custom marimo CSS override in `notebook.css`
- CES logo in top-right corner

### User Flow (WASM Demo)

1. User browses portfolio → expands "Renewable Energy" service card
2. Clicks "Solar Calculator Demo" link
3. WASM notebook loads instantly from CloudFront
4. User adjusts sliders (panel size, electricity rate, etc.)
5. Real-time ROI calculation updates
6. Works offline on repeat visit (service worker cache)

### Error Handling

| Scenario | Response |
|----------|----------|
| WASM notebook fails to load | Friendly error + support email |
| Data file missing in S3 | Show sample data + banner "Using demo data" |
| ECS task crashed | ALB health check → restart task, maintenance page during rollout |
| Timeout > 30s | "Analysis taking longer than expected, please wait..." |

---

## 8. Technical Details

### SST v3 Integration

**Current portfolio stack:** SST v3 → OpenNext → Lambda + CloudFront

**Marimo Tier 1:** Static HTML in `apps/web/public/demos/` → CloudFront (zero additional infra)

**Marimo Tier 2:** SST v3 → ECS Fargate + ALB, linked via `MARIMO_ENDPOINT` env var

```typescript
// next.config.ts — WASM MIME types + Docker rewrites
export default {
  async rewrites() {
    return [
      {
        source: '/demos/heavy/:path*',
        destination: `${process.env.MARIMO_ENDPOINT}/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/demos/:path*.wasm',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' }
        ]
      },
      {
        source: '/demos/heavy/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      }
    ];
  }
};
```

### SST Config (Tier 2)

```typescript
// climatevis-dashboard/deploy/sst.config.ts
export default $config({
  app(input) {
    return {
      name: "climatevis-marimo",
      home: "aws",
      region: "eu-central-1"
    };
  },
  async run() {
    const dataBucket = new sst.aws.Bucket("MarimoData", {
      public: false
    });

    const notebooks = new sst.aws.Service("MarimoNotebooks", {
      image: { dockerfile: "../Dockerfile.marimo" },
      environment: {
        MARIMO_DATA_BUCKET: dataBucket.name,
        AWS_REGION: "eu-central-1"
      },
      link: [dataBucket],
      scaling: { min: 1, max: 2, cpuUtilization: 70 },
      memory: "2 GB",
      cpu: "1 vCPU"
    });

    return {
      endpoint: notebooks.url,
      bucket: dataBucket.name
    };
  }
});
```

### Dependencies

```
# requirements.txt
marimo==0.10.0
pandas==2.2.0
numpy==1.26.0
plotly==5.20.0
boto3==1.34.0
energyplus-python==0.4.0
```

> **[Comment]** Pin versions with `~=` instead of `==` to allow patch updates. Also: check whether `energyplus-python==0.4.0` actually exists on PyPI — EnergyPlus Python bindings have varied packaging over the years. Validate this before committing to the requirements file.

### Docker Image

- Base: `python:3.11-slim`
- Multi-stage build (compile deps in builder, copy to runtime)
- Layer caching: `requirements.txt` copied before source
- Target image size: < 500 MB

### Security

- ECS task in private subnet (ALB handles inbound)
- S3 bucket restricted to Fargate task IAM role
- Auth secret in AWS Secrets Manager (not env var)
- HTTPS only (ALB terminates SSL)
- Rate limiting: 100 req/min per IP on ALB
- WASM demos: no security risk (fully client-side) — but never embed sensitive data

---

## 9. Repository Structure

### `climatevis-dashboard` (separate repo)

```
climatevis-dashboard/
├── notebooks/
│   ├── demos/                # WASM-exportable notebooks
│   │   ├── solar_calc.py
│   │   ├── energy_viz.py
│   │   └── bim_viewer.py
│   └── analysis/             # Docker-served notebooks
│       ├── weather_processing.py
│       ├── ml_models.py
│       └── data_pipeline.py
├── data/
│   └── examples/             # Small sample data (< 1 MB, committed)
├── assets/
│   └── dist/                 # WASM build outputs
├── Dockerfile.marimo
├── requirements.txt
├── pyproject.toml
├── README.md
└── deploy/
    └── sst.config.ts
```

### `ces-portfolio` (existing monorepo — changes needed)

```
apps/web/
├── public/
│   └── demos/                # WASM exports copied here
│       ├── solar-calc.html
│       └── energy-viz.html
├── src/app/
│   └── demos/
│       └── [slug]/
│           └── page.tsx      # Wrapper for Docker-served notebooks
└── next.config.ts            # WASM headers + Docker rewrites
```

---

## 10. Cost Analysis

| Scenario | Monthly Cost |
|----------|-------------|
| **Tier 1 only (WASM)** — recommended for MVP | ~EUR 0 (existing infra) |
| **Tier 1 + Tier 2 (WASM + Docker)** | ~EUR 40–45 |

Breakdown for Tier 2: Fargate ~EUR 35, S3 ~EUR 2–5, data transfer ~EUR 1–3.

**When to add Tier 2:** When a notebook requires datasets > 100 MB, native C extensions, or compute time > 5 minutes.

---

## 11. Implementation Plan

### Phase 1: WASM MVP (Week 1)

1. Create `climatevis-dashboard` repo with structure above
2. Write 1–2 demo notebooks (solar calculator, energy visualization)
3. Export to WASM, copy to portfolio `public/demos/`
4. Add links to `services.ts`
5. Update `next.config.ts` for WASM MIME types
6. Deploy via existing SST pipeline
7. Validate mobile performance on iPad

### Phase 2: Docker Service (Week 2–3, only if needed)

1. Create `Dockerfile.marimo` with Python environment
2. Set up SST config in `climatevis-dashboard/deploy/`
3. Deploy to ECS Fargate
4. Upload weather data to S3
5. Add Next.js rewrites for `/demos/heavy/*`
6. Test via proxy

### Phase 3: Hardening (Week 4)

1. Add authentication for private notebooks
2. AWS Secrets Manager for auth secret
3. Rate limiting on ALB
4. CloudWatch alarms + health checks
5. Plausible custom events

---

## 12. Open Questions

### Blocking (must resolve before Phase 1)

| # | Question | Status |
|---|----------|--------|
| 1 | `climatevis-dashboard` repo — create from scratch? | **Confirmed: yes** |
| 2 | Can you provide 1–2 sample `.py` notebooks to validate deps and data formats? | Open |

### Blocking Phase 2

| # | Question | Status |
|---|----------|--------|
| 3 | Auth method for private notebooks — existing system (Okta/Auth0) or build simple password? | Open |
| 4 | Total size of weather data files? If > 10 GB, S3 cost increases. | Open |
| 5 | Are "Plotly wrappers" open-source or CES proprietary? If proprietary, how to distribute? | Open |
| 6 | Does EnergyPlus Python require native binaries (C extensions) or is it pure Python? | Open — **this determines whether WASM is viable for EnergyPlus notebooks** |

### Nice to Have

| # | Question | Status |
|---|----------|--------|
| 7 | Data refresh frequency (daily/weekly/monthly)? | Open |
| 8 | Export functionality for users (PDF, CSV, PNG)? | Open |
| 9 | German translations for notebook UI? | Open |
| 10 | Specific interaction events to track? | Open |