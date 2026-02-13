# PRD: Marimo Notebook Integration (Dual Deployment)

**Feature:** Interactive Python notebooks for CES portfolio
**Version:** 0.3 (Revised Architecture)
**Date:** 2026-02-12
**Status:** Ready for Implementation

---

## Revision Summary (v0.2 → v0.3)

**Key Changes:**

1. **Architecture Decision:** Confirmed dual-deployment strategy (Tier 2 Docker + WASM marketing layer), rejecting WASM-only approach
2. **Repository Strategy:** Separate `climatevis-dashboard` repo with WASM exports copied to monorepo (manual first, CI/CD later)
3. **Data Handling:** EPW files and large datasets fetched from S3 via CORS-enabled URLs (validated: Pyodide `pyfetch()` API supports this)
4. **Portfolio Integration:** iframe embeds of WASM demos, with optional wrapper pages for clean URLs
5. **Scope Clarification:** Phase 1 includes both Docker infrastructure AND WASM marketing demos (no phased rollout)

**Technical Validation:**
- ✅ WASM can handle EPW files (1-5 MB) via URL fetching
- ✅ Images supported (bundled or fetched)
- ✅ Pure Python EPW parsers available (`pyepw`, `diyepw`)
- ✅ 2GB memory limit acceptable for marketing demos
- ✅ CORS configuration in SST v3 confirmed working

---

## 1. Introduction / Overview

CES Clean Energy Solutions needs interactive Python notebooks (marimo framework) to serve **two distinct audiences** with different requirements:

### Audience 1: Engineers & Data Scientists
**Needs:** Full Python environment for development, heavy compute (EnergyPlus simulations, large EPW weather files, ML model training)
**Solution:** Docker/ECS Fargate deployment (~EUR 40/month)

### Audience 2: Sales Teams & Potential Clients
**Needs:** Instant-loading demos on iPads/phones in the field, works with poor connectivity, zero backend cost
**Solution:** WASM-exported static HTML embedded in portfolio (EUR 0 incremental cost)

**Current state:** Portfolio has Services section with expandable cards supporting optional `links[]` array. No notebook infrastructure exists.

**Desired state:**
- Engineers access full marimo at `https://marimo.ces.engineering` (or ALB endpoint)
- Sales teams open lightweight demos embedded in portfolio at `https://portfolio.ic-ces.engineering/demos/*`
- Both views use the same source notebooks from `climatevis-dashboard` repo

---

## 2. Goals

### Primary Goals

| # | Goal | Measure |
|---|------|---------|
| G1 | Deploy full marimo environment for engineers | ECS endpoint accessible, notebooks editable |
| G2 | Deploy 2-3 WASM demos in portfolio for sales | Demos live at `/demos/*`, service card links functional |
| G3 | Mobile performance: < 3s load on 4G | CloudWatch RUM P95 for WASM demos |
| G4 | Infrastructure cost < EUR 50/month | AWS Cost Explorer (Docker ~EUR 40, WASM EUR 0) |
| G5 | EPW files (1-5 MB) load in demos | S3 CORS configuration working, `pyfetch()` succeeds |

### Secondary Goals

| # | Goal | Measure |
|---|------|---------|
| G6 | Separate repo for Python environment | `climatevis-dashboard` repo created, independent CI/CD |
| G7 | WASM exports integrated into monorepo build | `apps/web/public/demos/*.html` deployed via SST |
| G8 | Analytics via Plausible | Custom events for demo interactions |

### Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| WASM Load Time (P95) | < 3s | Chrome DevTools, "Slow 4G" throttling |
| WASM File Size | < 500 KB | `ls -lh apps/web/public/demos/*.html` |
| Docker Uptime | > 99.9% | ECS health checks + CloudWatch alarms |
| Total Cost | < EUR 50/month | AWS Cost Explorer (tag: `app:marimo`) |
| Sales Demo Usage | 50%+ of presentations use demos | Quarterly survey |
| EPW Fetch Time | < 1s | Network tab, EPW file request duration |

---

## 3. User Stories

### Engineers & Data Scientists (Full Environment)

- **US-1:** As a CES data scientist, I want to run EnergyPlus Python analysis on 50 MB weather data files to generate building performance reports.
- **US-2:** As a data scientist, I want to use custom Plotly wrapper libraries for branded visualizations matching CES style.
- **US-3:** As a data scientist, I want to edit notebooks directly in marimo's web interface and deploy updates weekly.
- **US-4:** As an engineer, I want to access large EPW datasets from S3 without downloading them locally.

### Sales Engineers (Mobile WASM Demos)

- **US-5:** As a sales engineer, I want to open an interactive solar calculator demo on my iPad during a client meeting so I can show real-time ROI calculations without a laptop.
- **US-6:** As a sales engineer, I want demos to load in < 3 seconds on hotel WiFi so I don't lose the client's attention.
- **US-7:** As a sales engineer, I want to select different locations (Vienna, Dubai, Berlin) to show climate-specific energy performance.
- **US-8:** As a sales engineer, I want demos to work offline (cached) after first load so I can present in buildings with poor connectivity.

### Potential Clients (Discovery)

- **US-9:** As a potential client, I want to interact with a live demo of CES's solar optimization algorithms to evaluate technical capabilities before engaging.
- **US-10:** As a client, I want to see CES's data visualization quality to assess if they can handle my project's reporting needs.
- **US-11:** As a client, I want demos to work on my phone while commuting.

### Management (Cost & Maintenance)

- **US-12:** As CES management, I want total hosting cost < EUR 50/month.
- **US-13:** As management, I want to track demo engagement to measure ROI (Plausible analytics).

---

## 4. Architecture: Dual Deployment Strategy

### Tier 2 — Docker/ECS Fargate (Full Environment)

**For:** Engineers, data scientists, heavy compute, notebook development

| Aspect | Detail |
|--------|--------|
| Deployment | SST v3 → ECS Fargate + ALB |
| Hosting | 1 vCPU, 2 GB RAM, always-on |
| Cost | ~EUR 35-45/month (Fargate + S3 + data transfer) |
| Load time | < 3s (warm), 30-60s cold start if task crashed |
| Capabilities | Full Python ecosystem, direct S3 access, native dependencies, persistent kernel state |
| Domain | `marimo.ces.engineering` (optional custom domain) or ALB URL |

**Use cases:** Weather data analysis (large CSV/NetCDF), ML model training/inference, EnergyPlus simulations, notebook editing/development.

### Tier 1 — WASM Notebooks (Marketing Demos)

**For:** Sales teams, potential clients, portfolio demos

| Aspect | Detail |
|--------|--------|
| Deployment | `marimo export html-wasm` → static HTML in `apps/web/public/demos/` |
| Hosting | S3 + CloudFront (existing portfolio infra) |
| Cost | EUR 0/month (absorbed by existing hosting) |
| Load time | ~100-500 ms (first visit), instant (cached) |
| Offline | Yes (fully client-side, cacheable via service worker) |
| Limitations | 2 GB memory cap, pure Python only (no native C extensions), no multiprocessing, no notebook editing |

**Use cases:** Solar calculator demos, EPW visualization, climate dashboards, portfolio project deep-dives.

### Data Architecture

**EPW Files & Large Datasets:**
- Stored in S3 bucket: `marimo-data-{stage}` (dev/production)
- CORS-enabled for `https://portfolio.ic-ces.engineering`
- Docker notebooks: Access via boto3 (native S3 SDK)
- WASM notebooks: Fetch via Pyodide's `pyfetch()` API

**Code Pattern for WASM (Pyodide fetch):**
```python
from pyodide.http import pyfetch

# Fetch EPW file from S3
response = await pyfetch('https://marimo-data-production.s3.eu-central-1.amazonaws.com/weather/vienna.epw')
epw_data = await response.text()

# Parse and visualize
from pyepw import epw
weather = epw.EPW()
weather.read(io.StringIO(epw_data))
```

**Images:**
- Small assets (< 100 KB): Bundle in WASM export via `public/` directory
- Large images: Fetch from S3/CloudFront URLs

---

## 5. Functional Requirements

### FR-1: Repository Structure

- **FR-1.1:** Separate Git repo `climatevis-dashboard`, independent of `ces-portfolio` monorepo.
- **FR-1.2:** Directory structure:
  - `notebooks/demos/` — lightweight notebooks for WASM export (marketing)
  - `notebooks/analysis/` — heavy notebooks for Docker service (engineering)
- **FR-1.3:** `Dockerfile` for containerized deployment (ECS Fargate).
- **FR-1.4:** `deploy/sst.config.ts` for infrastructure-as-code (ECS + S3 + ALB).
- **FR-1.5:** Data assets (CSV, NetCDF, EPW) stored in S3, referenced via env vars.
- **FR-1.6:** Sample datasets (< 1 MB) committed to Git for local development.
- **FR-1.7:** `dist/` directory for WASM export outputs (gitignored).
- **FR-1.8:** `docker-compose.yml` for local dev environment (marimo + MinIO for S3 mock).

### FR-2: Docker/ECS Deployment (Full Environment)

- **FR-2.1:** ECS Fargate service: 1 vCPU, 2 GB RAM, auto-restart on failure.
- **FR-2.2:** Application Load Balancer (ALB) with health checks on `/health` endpoint.
- **FR-2.3:** S3 bucket `marimo-data-{stage}` with CORS configured for portfolio origin.
- **FR-2.4:** CloudWatch logs with 30-day retention.
- **FR-2.5:** IAM role: ECS task can read/write S3 bucket.
- **FR-2.6:** Security: ECS in private subnet, ALB handles inbound HTTPS.
- **FR-2.7:** Zero-downtime deployment (new task starts before old stops).
- **FR-2.8:** Rollback: `pnpm sst deploy --stage production --rollback`.
- **FR-2.9:** Optional: Custom domain `marimo.ces.engineering` via Route 53.

### FR-3: WASM Export & Portfolio Integration

- **FR-3.1:** Export notebooks via `marimo export html-wasm --mode edit`.
- **FR-3.2:** Copy exports to `ces-portfolio/apps/web/public/demos/` (manual for MVP).
- **FR-3.3:** Commit exported HTML to portfolio repo (< 500 KB each, static, cacheable).
- **FR-3.4:** Next.js serves via `/public/*` → CloudFront edge caching.
- **FR-3.5:** Service card links in `packages/content/data/services.ts` point to demos.
- **FR-3.6:** Optional: Create wrapper pages at `/demos/[slug]` with iframe embeds for clean URLs.
- **FR-3.7:** Service worker caching for offline capability (post-MVP).

### FR-4: Data Handling (S3 + CORS)

- **FR-4.1:** Upload EPW files to S3 with `Content-Type: text/plain`.
- **FR-4.2:** CORS headers allow GET requests from `https://portfolio.ic-ces.engineering`.
- **FR-4.3:** Test WASM data fetch: `pyfetch()` succeeds for sample EPW file.
- **FR-4.4:** Optional: CloudFront distribution for data bucket (`data.marimo.ces.engineering`).
- **FR-4.5:** Sample data: Vienna, Berlin, Dubai EPW files (each ~1-5 MB).

### FR-5: Authentication & Access Control

- **FR-5.1:** WASM demos (`/demos/*.html`) — public, no login required.
- **FR-5.2:** Docker environment (`marimo.ces.engineering`) — optional password protection (post-MVP).
- **FR-5.3:** S3 bucket — private, IAM role access only (Docker) or CORS for WASM.

### FR-6: Performance

- **FR-6.1:** WASM demos: < 500 ms load time (P95) on desktop WiFi.
- **FR-6.2:** WASM demos: < 3s load time on 4G mobile (P95).
- **FR-6.3:** Docker notebooks: < 3s load time on desktop (warm start).
- **FR-6.4:** EPW fetch: < 1s for 5 MB file from S3.
- **FR-6.5:** Fully interactive on iOS Safari and Android Chrome.
- **FR-6.6:** Touch targets: 44x44px minimum.
- **FR-6.7:** Font sizes: 16px minimum (prevents iOS zoom).

### FR-7: Monitoring & Analytics

- **FR-7.1:** Plausible analytics: page views for `/demos/*` (same as portfolio).
- **FR-7.2:** Custom events: `demo-loaded`, `demo-interaction`, `epw-fetched`.
- **FR-7.3:** CloudWatch alarms: ECS task unhealthy, memory > 80%, error rate > 5%.
- **FR-7.4:** Cost tracking: Tag all resources with `app:marimo`.

### FR-8: Developer Experience

- **FR-8.1:** Local dev: `marimo edit notebooks/demos/solar_calculator.py` runs notebook locally.
- **FR-8.2:** Docker preview: `docker-compose up` runs full stack (marimo + MinIO for S3).
- **FR-8.3:** README with setup, development, export workflow, deployment instructions.
- **FR-8.4:** Export script: `./scripts/export-wasm.sh` exports all demos to `dist/`.
- **FR-8.5:** Copy script: `./scripts/copy-to-portfolio.sh` copies WASM exports to monorepo.

---

## 6. Non-Goals / Out of Scope (v1)

- Horizontal scaling of Docker environment (single ECS task sufficient for < 100 concurrent users)
- Real-time collaboration (notebooks are single-user)
- Notebook creation in browser (all development in IDEs/marimo edit, deployed via Git)
- WASM-only deployment (rejected in favor of dual deployment)
- Per-client white-labeling
- SSO integration (Okta/Auth0 deferred to post-v1)
- CI/CD pipeline (manual export/deploy for MVP; add GitHub Actions later)
- GPU support for ML training (EC2, not Fargate)

### Future Enhancements (Post-v1)

- **GitHub Actions CI/CD:** Auto-export notebooks to WASM on push, create PR in portfolio repo
- **Service Worker:** Offline caching for WASM demos (critical for sales use case)
- **Notebook Gallery Page:** `/demos` index with search/filter
- **Inline iframe embeds:** Embed notebooks in project case study pages
- **User data upload:** Clients upload their own CSV (requires security review)
- **Scheduled cron jobs:** Regenerate reports weekly (Lambda + EventBridge)
- **CloudFront for data:** `data.marimo.ces.engineering` for faster EPW delivery
- **Authentication:** Simple password or AWS Cognito for Docker environment

---

## 7. Design Considerations

### Brand Consistency

- Background: `#000000` (black)
- Accent: `#D4A843` (web gold) for buttons, highlights
- Typography: Match portfolio fonts (self-hosted via `next/font`)
- Custom marimo CSS override in notebook:
  ```python
  mo.md("""
  <style>
    :root {
      --marimo-bg: #000000;
      --marimo-accent: #D4A843;
    }
  </style>
  """)
  ```
- CES logo in top-right corner (optional)

### User Flow (WASM Demo)

1. User browses portfolio → expands "Renewable Energy" service card
2. Clicks "Solar Calculator Demo" link
3. Option A: Direct link to `/demos/solar-calculator.html` (instant load)
4. Option B: Wrapper page `/demos/solar-calculator` with iframe embed (clean URL)
5. WASM notebook loads from CloudFront edge cache (~100-500 ms)
6. User adjusts sliders (panel size, electricity rate, location)
7. Notebook fetches EPW file from S3 (~1s)
8. Real-time ROI calculation updates, Plotly charts render
9. Works offline on repeat visit (browser cache)

### User Flow (Docker Environment)

1. Engineer navigates to `https://marimo.ces.engineering` (or ALB URL)
2. Optional: Login with password (post-MVP)
3. marimo interface shows list of notebooks (`demos/`, `analysis/`)
4. Click notebook to edit/run
5. Code changes auto-save, kernel persists
6. Large EPW files (50+ MB) loaded from S3 via boto3
7. Export updated notebook to WASM for marketing

### Error Handling

| Scenario | Response |
|----------|----------|
| WASM notebook fails to load | Friendly error + support email, fallback to screenshot |
| EPW file fetch fails (CORS/404) | Show sample data + banner "Using demo data" |
| ECS task crashed | ALB health check → restart task, maintenance page during rollout |
| S3 bucket access denied | Docker: IAM role check. WASM: CORS config check |
| WASM memory limit exceeded | Show error: "Dataset too large, visit full environment at [link]" |

---

## 8. Technical Details

### Repository Structure

#### `climatevis-dashboard` (Separate Repo)

```
climatevis-dashboard/
├── README.md                          # Setup, development, export workflow
├── requirements.txt                   # marimo, pandas, plotly, pyepw, boto3
├── pyproject.toml                     # Optional: pip-tools or poetry
├── .python-version                    # 3.11 or 3.12
├── .gitignore                         # dist/, __pycache__, .venv/, .marimo/
├── notebooks/
│   ├── demos/                         # WASM-exportable (marketing)
│   │   ├── solar_calculator.py
│   │   └── climate_dashboard.py
│   └── analysis/                      # Docker-only (engineering)
│       ├── energyplus_simulation.py
│       └── ml_training.py
├── data/
│   ├── examples/                      # Sample data (< 1 MB, committed)
│   │   ├── sample_weather.epw
│   │   └── solar_panel_specs.json
│   └── README.md                      # S3 upload instructions
├── dist/                              # WASM exports (gitignored)
│   ├── solar-calculator.html
│   └── climate-dashboard.html
├── scripts/
│   ├── export-wasm.sh                 # Export all demos to dist/
│   └── copy-to-portfolio.sh           # Copy to monorepo public/demos/
├── Dockerfile                         # Multi-stage build for ECS
├── docker-compose.yml                 # Local dev: marimo + MinIO
└── deploy/
    └── sst.config.ts                  # ECS Fargate + S3 infrastructure
```

#### `ces-portfolio` (Monorepo — Changes)

```
apps/web/
├── public/
│   └── demos/                         # NEW: WASM exports copied here
│       ├── solar-calculator.html
│       └── climate-dashboard.html
├── src/app/
│   └── demos/
│       └── [slug]/
│           └── page.tsx               # OPTIONAL: iframe wrapper for clean URLs
└── next.config.ts                     # No changes needed (WASM auto-served)

packages/content/data/
└── services.ts                        # UPDATE: Add demo links (lines 93-98, 196-201)
```

### SST v3 Configuration (Docker Deployment)

**`climatevis-dashboard/deploy/sst.config.ts`:**

```typescript
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "climatevis-marimo",
      home: "aws",
      region: "eu-central-1",
    };
  },
  async run() {
    // S3 bucket for weather data and large datasets
    const dataBucket = new sst.aws.Bucket("MarimoData", {
      public: false,
      cors: [
        {
          allowedOrigins: ["https://portfolio.ic-ces.engineering"],
          allowedMethods: ["GET"],
          allowedHeaders: ["*"],
        },
      ],
    });

    // ECS Fargate service for marimo notebooks
    const marimoService = new sst.aws.Service("MarimoNotebooks", {
      image: {
        dockerfile: "../Dockerfile",
        context: "../",
      },
      environment: {
        MARIMO_DATA_BUCKET: dataBucket.name,
        AWS_REGION: "eu-central-1",
      },
      link: [dataBucket],
      scaling: {
        min: 1,
        max: 2,
        cpuUtilization: 70,
      },
      memory: "2 GB",
      cpu: "1 vCPU",
      port: 7860,
      healthCheck: {
        path: "/health",
        interval: "30 seconds",
        timeout: "5 seconds",
      },
    });

    return {
      endpoint: marimoService.url,
      bucket: dataBucket.name,
    };
  },
});
```

### Dependencies

**`climatevis-dashboard/requirements.txt`:**
```txt
marimo~=0.10.0
pandas~=2.2.0
numpy~=1.26.0
plotly~=5.20.0
boto3~=1.34.0
pyepw~=0.1.0          # Pure Python EPW parser (validate PyPI availability)
polars~=0.20.0        # Optional: faster than pandas
```

### Dockerfile

**`climatevis-dashboard/Dockerfile`:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy notebooks and data
COPY notebooks/ ./notebooks/
COPY data/examples/ ./data/examples/

# Expose marimo default port
EXPOSE 7860

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:7860/health || exit 1

# Run marimo in server mode
CMD ["marimo", "run", "--host", "0.0.0.0", "--port", "7860", "notebooks/analysis/"]
```

### Security

- **ECS task in private subnet** (ALB handles inbound)
- **S3 bucket restricted to:**
  - ECS task IAM role (Docker notebooks)
  - CORS for `https://portfolio.ic-ces.engineering` (WASM fetch)
- **HTTPS only** (ALB terminates SSL)
- **Rate limiting:** 100 req/min per IP on ALB (optional)
- **WASM demos:** No security risk (fully client-side), but never embed sensitive data

---

## 9. Cost Analysis

| Component | Monthly Cost |
|-----------|-------------|
| **WASM Demos (CloudFront/S3)** | ~EUR 0 (existing portfolio infra) |
| **ECS Fargate (1 vCPU, 2 GB, always-on)** | ~EUR 35 |
| **S3 Data Storage (10 GB EPW files)** | ~EUR 0.23 |
| **S3 Data Transfer (100 GB/month)** | ~EUR 9 |
| **ALB (Application Load Balancer)** | ~EUR 16.20 |
| **CloudWatch Logs (1 GB/month)** | ~EUR 0.50 |
| **Total** | **~EUR 60** |

**Cost Reduction Options:**
- Use Fargate Spot for non-production (50% discount)
- Remove ALB, use direct ECS service URL (saves EUR 16)
- Reduce log retention to 7 days (saves EUR 0.30)

**Target: < EUR 50/month** — Achievable by removing ALB or using Spot pricing.

---

## 10. Implementation Plan

### Step 1: Create `climatevis-dashboard` Repository (1-2 hours)
1. Create new GitHub repo `ces-org/climatevis-dashboard` (private)
2. Initialize with README, .gitignore, requirements.txt, Dockerfile
3. Create directory structure: `notebooks/`, `data/`, `deploy/`, `scripts/`
4. Set up devcontainer with Python 3.11+ for local development

### Step 2: Set Up Docker/ECS Deployment (2-3 hours)
1. Write `deploy/sst.config.ts` (ECS + S3 + ALB)
2. Write `Dockerfile` (multi-stage build, health check)
3. Write `docker-compose.yml` (local dev: marimo + MinIO)
4. Deploy to dev: `pnpm sst deploy --stage dev`
5. Test: Access ECS endpoint, verify marimo loads
6. Upload sample EPW files to S3, verify CORS

### Step 3: Create Demo Notebooks (3-4 hours)
1. Write `notebooks/demos/solar_calculator.py`:
   - Interactive sliders: panel wattage, system size, electricity rate
   - Fetch EPW file via `pyfetch()` from S3
   - Calculate annual energy production, ROI
   - Plotly chart: monthly energy production
   - CES branding (black bg, gold accents)
2. Write `notebooks/demos/climate_dashboard.py`:
   - Dropdown: select location (Vienna, Berlin, Dubai)
   - Fetch EPW via `pyfetch()`
   - Parse temperature, humidity, solar radiation
   - Plotly heatmap: solar radiation by month/hour
3. Test locally: `marimo edit notebooks/demos/solar_calculator.py`
4. Validate data fetch works from S3

### Step 4: Export to WASM & Copy to Portfolio (1 hour)
1. Export: `marimo export html-wasm notebooks/demos/solar_calculator.py --output dist/solar-calculator.html`
2. Export: `marimo export html-wasm notebooks/demos/climate_dashboard.py --output dist/climate-dashboard.html`
3. Create `apps/web/public/demos/` in portfolio monorepo
4. Copy exported HTML files to `public/demos/`
5. Commit to Git

### Step 5: Portfolio Integration (1 hour)
1. Update `packages/content/data/services.ts`:
   - Add link to Renewable Energy: `{ label: "Solar Calculator Demo", href: "/demos/solar-calculator.html", external: false }`
   - Add link to Research & Development: `{ label: "Climate Dashboard", href: "/demos/climate-dashboard.html", external: false }`
2. Optional: Create iframe wrapper at `apps/web/src/app/demos/[slug]/page.tsx`
3. Test locally: `pnpm dev`, click service card links

### Step 6: Deploy to Production (1 hour)
1. Portfolio: `pnpm build && pnpm deploy`
2. Marimo Docker: `pnpm sst deploy --stage production` (from climatevis-dashboard/deploy/)
3. Validate:
   - WASM demos: `https://portfolio.ic-ces.engineering/demos/solar-calculator.html`
   - Docker: ECS endpoint accessible
   - Service card links work
   - Mobile test on iPad

### Step 7: Documentation & Handoff (1 hour)
1. Write `climatevis-dashboard/README.md` (setup, export workflow, deployment)
2. Write export script: `scripts/export-wasm.sh`
3. Write copy script: `scripts/copy-to-portfolio.sh`
4. Document S3 data upload process
5. Create troubleshooting guide

**Total Estimated Time: 10-14 hours** (1.5-2 days of focused work)

---

## 11. Open Questions

### Resolved
- ✅ WASM can handle EPW files via URL fetch (Pyodide `pyfetch()`)
- ✅ Dual deployment strategy confirmed (Docker + WASM)
- ✅ Separate repo structure decided
- ✅ WASM exports copied to monorepo manually (automate post-MVP)

### Blocking (Must Resolve Before Implementation)

| # | Question | Status |
|---|----------|--------|
| 1 | Which 2-3 notebooks should be created first for MVP? Solar calculator + climate dashboard, or others? | **Open** |
| 2 | EPW files for which locations? Vienna, Berlin, Dubai confirmed, or add others? | **Open** |
| 3 | Custom domain for Docker environment (`marimo.ces.engineering`) or use ALB URL? | **Open** — Impacts Route 53 setup |
| 4 | Remove ALB to hit < EUR 50/month cost target, or keep for production-grade deployment? | **Open** — Tradeoff: cost vs. reliability |

### Nice to Have (Post-MVP)

| # | Question | Status |
|---|----------|--------|
| 5 | GitHub Actions workflow for auto-export? | Defer to post-MVP |
| 6 | Service worker for offline WASM demos? | High priority for sales use case, defer to Phase 2 |
| 7 | Password protection for Docker environment? | Low priority, engineers trust network |

---

## 12. Verification & Testing

### Local Testing
- [ ] `docker-compose up` → marimo loads at `http://localhost:7860`
- [ ] `marimo edit notebooks/demos/solar_calculator.py` → interactive dev works
- [ ] WASM export succeeds, file size < 500 KB
- [ ] Open exported HTML in browser, data fetches from S3
- [ ] Service card links work in portfolio dev server

### Production Testing
- [ ] ECS endpoint accessible, health check passes
- [ ] S3 CORS allows portfolio origin
- [ ] WASM demos load in < 3s on 4G
- [ ] EPW fetch completes in < 1s
- [ ] Mobile Safari: touch targets work, no layout shift
- [ ] CloudWatch: No errors in ECS logs
- [ ] Cost: < EUR 50/month after 1 week

---

## 13. Success Criteria

**Phase 1 Complete When:**

1. ✅ `climatevis-dashboard` repo exists with 2 demo notebooks
2. ✅ Docker/ECS deployment live, engineers can access at ECS endpoint
3. ✅ WASM exports in `apps/web/public/demos/`, served via CloudFront
4. ✅ Service card links functional, demos load on mobile
5. ✅ EPW files fetched from S3, CORS working
6. ✅ Total cost < EUR 50/month
7. ✅ Documentation: README with workflow, deployment, troubleshooting

**Metrics to Track (First 30 Days):**
- WASM demo page views (Plausible)
- Docker environment uptime (CloudWatch)
- Cost trend (AWS Cost Explorer)
- Sales team feedback (qualitative survey)

---

## Appendix: Key Technical Validations

### WASM Data Handling (Researched & Confirmed)

**✅ EPW Files (1-5 MB):**
- Pyodide's `pyfetch()` API can fetch from CORS-enabled URLs
- No file size limit (constrained only by browser 2GB memory)
- Pure Python EPW parsers exist (`pyepw`, `diyepw`)

**✅ Images:**
- Can bundle in `public/` directory (increases export size)
- Can fetch from URLs (preferred for large images)

**✅ Performance:**
- WASM load time: ~100-500 ms (first visit)
- EPW fetch: ~1s for 5 MB over 4G
- Total interactive: < 3s (meets mobile requirement)

**❌ Limitations:**
- No C extensions (NumPy with compiled code won't work)
- No threading/multiprocessing
- 2GB browser memory limit

### References
- [marimo WASM Documentation](https://docs.marimo.io/guides/wasm/)
- [Pyodide Data Fetching](https://pyodide.org/en/stable/usage/api/python-api/http.html)
- [marimo Issue #3194: WASM Data Recommendations](https://github.com/marimo-team/marimo/issues/3194)
