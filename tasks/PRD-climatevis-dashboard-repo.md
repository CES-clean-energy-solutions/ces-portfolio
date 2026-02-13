# PRD: climatevis-dashboard Repository

**Project:** Marimo Notebook Infrastructure for CES
**Repository:** `climatevis-dashboard` (separate from ces-portfolio monorepo)
**Version:** 1.0
**Date:** 2026-02-12
**Status:** Implementation Ready

---

## 1. Purpose & Scope

This document defines the setup and architecture for the **`climatevis-dashboard` repository**, a dedicated Python environment for developing, deploying, and exporting marimo notebooks for CES Clean Energy Solutions.

### What This Repo Does

1. **Develops marimo notebooks** in Python 3.11+ with pandas, plotly, EPW parsers
2. **Deploys full marimo environment** to AWS ECS Fargate via SST v3 (engineers access at `marimo.ces.engineering`)
3. **Exports WASM demos** to static HTML for marketing (copied to `ces-portfolio` monorepo)
4. **Manages data assets** in S3 (EPW files, datasets, images)

### What This Repo Does NOT Do

- ❌ Handle portfolio website (that's `ces-portfolio` monorepo)
- ❌ Serve WASM demos (that's CloudFront via portfolio)
- ❌ Manage CES branding assets (imported from `@repo/ui` if needed)

### Key Interfaces

**With `ces-portfolio` monorepo:**
- Export WASM files → copy to `apps/web/public/demos/`
- Service card links point to these demos

**With AWS:**
- ECS Fargate runs Docker container with marimo server
- S3 bucket stores EPW files and datasets
- CloudWatch logs capture errors

---

## 2. Technology Stack

### Core Languages
- **Python 3.11+** — Notebooks, data processing, marimo runtime
- **TypeScript 5.x** — SST v3 deployment configuration (`deploy/sst.config.ts`)
- **Bash** — Export scripts, deployment automation

### Python Dependencies
```txt
marimo~=0.10.0          # Interactive notebook framework
pandas~=2.2.0           # Data manipulation
numpy~=1.26.0           # Numerical computing
plotly~=5.20.0          # Interactive charts
boto3~=1.34.0           # AWS S3 SDK
pyepw~=0.1.0            # EPW (EnergyPlus Weather) parser
polars~=0.20.0          # Optional: faster than pandas
```

### TypeScript Dependencies
```json
{
  "devDependencies": {
    "sst": "^3.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Infrastructure
- **SST v3** — Infrastructure as Code (Pulumi engine + Terraform AWS providers)
- **AWS ECS Fargate** — Containerized marimo deployment (1 vCPU, 2 GB RAM)
- **AWS S3** — Data storage (EPW files, datasets)
- **AWS ALB** — Application Load Balancer (optional, adds EUR 16/month)
- **Docker** — Container runtime, local dev via docker-compose

### DevOps Tools
- **pnpm** — Package manager for TypeScript/SST dependencies
- **pip** — Python package manager
- **Docker & docker-compose** — Local development and containerization

---

## 3. Repository Structure

```
climatevis-dashboard/
├── README.md                          # Setup, development, deployment guide
├── .gitignore                         # Python, Node, SST, Docker artifacts
├── .python-version                    # 3.11 or 3.12
│
├── notebooks/
│   ├── demos/                         # WASM-exportable notebooks (marketing)
│   │   ├── solar_calculator.py        # PV system ROI calculator
│   │   ├── climate_dashboard.py       # EPW visualization
│   │   └── building_energy.py         # Building energy analysis
│   │
│   └── analysis/                      # Docker-only notebooks (engineering)
│       ├── energyplus_simulation.py   # Heavy compute, native deps
│       ├── ml_training.py             # Model training
│       └── data_pipeline.py           # ETL workflows
│
├── data/
│   ├── examples/                      # Sample data (< 1 MB, committed to Git)
│   │   ├── vienna.epw                 # Sample weather file
│   │   ├── solar_panel_specs.json     # Panel database
│   │   └── building_reference.csv     # Sample building data
│   │
│   └── README.md                      # S3 upload instructions
│
├── dist/                              # WASM export outputs (gitignored)
│   ├── solar-calculator.html
│   ├── climate-dashboard.html
│   └── building-energy.html
│
├── scripts/
│   ├── export-wasm.sh                 # Export all demos to dist/
│   ├── copy-to-portfolio.sh           # Copy WASM exports to monorepo
│   └── upload-data-s3.sh              # Upload EPW files to S3
│
├── deploy/                            # SST v3 infrastructure
│   ├── package.json                   # SST + TypeScript dependencies
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json                  # TypeScript config for SST
│   └── sst.config.ts                  # ECS + S3 + ALB definition
│
├── requirements.txt                   # Python dependencies
├── pyproject.toml                     # Optional: pip-tools or poetry
├── Dockerfile                         # Multi-stage build for ECS
├── docker-compose.yml                 # Local dev: marimo + MinIO (S3 mock)
└── .devcontainer/
    └── devcontainer.json              # VS Code dev container config
```

---

## 4. Setup Instructions

### Prerequisites

- **Python 3.11+** installed (`python --version`)
- **Node.js 20+** installed (`node --version`)
- **pnpm 9+** installed (`pnpm --version`)
- **Docker** installed and running
- **AWS CLI v2** configured with credentials
- **Git** installed

### Initial Setup

```bash
# 1. Clone repository
git clone git@github.com:ces-org/climatevis-dashboard.git
cd climatevis-dashboard

# 2. Python environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. TypeScript/SST environment
cd deploy
pnpm install
cd ..

# 4. Verify installations
marimo --version       # Should show 0.10.x
python -c "import pandas, plotly, boto3; print('Python deps OK')"
cd deploy && pnpm sst version && cd ..  # Should show SST 3.x
```

### Environment Variables

Create `.env` file in repository root:

```bash
# AWS credentials (for local dev and SST deployment)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-central-1

# S3 bucket name (populated after first SST deploy)
MARIMO_DATA_BUCKET=marimo-data-production

# Optional: Custom domain
MARIMO_DOMAIN=marimo.ces.engineering
```

**Security:** Never commit `.env` to Git. Use AWS Secrets Manager or SST secrets for production.

---

## 5. Development Workflow

### Local Notebook Development

```bash
# Activate Python environment
source .venv/bin/activate

# Edit notebook interactively
marimo edit notebooks/demos/solar_calculator.py

# Browser opens at http://localhost:2718
# Make changes, test interactivity, save
```

### Local Docker Development (Full Stack)

```bash
# Start marimo + MinIO (S3 mock)
docker-compose up

# Access marimo: http://localhost:7860
# Access MinIO console: http://localhost:9001 (admin/admin123)

# Upload test data to MinIO
aws --endpoint-url http://localhost:9000 s3 cp data/examples/vienna.epw s3://marimo-data/weather/

# Stop services
docker-compose down
```

### Export to WASM

```bash
# Export single notebook
marimo export html-wasm notebooks/demos/solar_calculator.py \
  --output dist/solar-calculator.html \
  --mode edit

# Export all demos
./scripts/export-wasm.sh

# Verify exports
ls -lh dist/
# Should see .html files < 500 KB each

# Test exported HTML
python -m http.server 8000 --directory dist/
# Open http://localhost:8000/solar-calculator.html
```

### Copy to Portfolio Monorepo

```bash
# Manual copy (MVP workflow)
./scripts/copy-to-portfolio.sh /path/to/ces-portfolio

# Or manually:
cp dist/*.html /path/to/ces-portfolio/apps/web/public/demos/

# Commit in portfolio repo
cd /path/to/ces-portfolio
git add apps/web/public/demos/
git commit -m "Update marimo WASM demos"
```

---

## 6. Deployment

### Deploy to AWS ECS Fargate

```bash
# From deploy/ directory
cd deploy

# Install SST dependencies (first time only)
pnpm install

# Deploy to dev stage
pnpm sst deploy --stage dev

# Expected output:
# ✓ MarimoData bucket created: marimo-data-dev
# ✓ MarimoNotebooks ECS service created
# ✓ Application Load Balancer created
# Outputs:
#   endpoint: https://marimo-dev-alb-123456.eu-central-1.elb.amazonaws.com
#   bucket: marimo-data-dev

# Deploy to production
pnpm sst deploy --stage production

# Outputs:
#   endpoint: https://marimo-prod-alb-789012.eu-central-1.elb.amazonaws.com
#   bucket: marimo-data-production
```

### Verify Deployment

```bash
# Check ECS service health
curl https://MARIMO_ALB_URL/health
# Expected: {"status": "ok"}

# Access marimo UI
open https://MARIMO_ALB_URL

# Check CloudWatch logs
pnpm sst logs --stage production

# Check cost
aws ce get-cost-and-usage \
  --time-period Start=2026-02-01,End=2026-02-28 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter '{"Tags":{"Key":"app","Values":["marimo"]}}'
```

### Upload Data to S3

```bash
# Upload EPW files
./scripts/upload-data-s3.sh production

# Or manually:
aws s3 cp data/examples/vienna.epw \
  s3://marimo-data-production/weather/vienna.epw \
  --content-type "text/plain"

aws s3 cp data/examples/berlin.epw \
  s3://marimo-data-production/weather/berlin.epw \
  --content-type "text/plain"

# List uploaded files
aws s3 ls s3://marimo-data-production/weather/ --recursive
```

### Rollback

```bash
# Rollback to previous deployment
cd deploy
pnpm sst deploy --stage production --rollback

# Or destroy and redeploy
pnpm sst remove --stage dev
pnpm sst deploy --stage dev
```

---

## 7. SST v3 Configuration

### File: `deploy/sst.config.ts`

```typescript
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "climatevis-marimo",
      home: "aws",  // Only valid option for AWS (NOT "pulumi")
      region: "eu-central-1",
    };
  },
  async run() {
    // S3 bucket for weather data and large datasets
    const dataBucket = new sst.aws.Bucket("MarimoData", {
      public: false,
      transform: {
        bucket: {
          // Enable versioning for data recovery
          versioning: { enabled: true },
          // Lifecycle rules to manage costs
          lifecycleRules: [
            {
              id: "archive-old-data",
              enabled: true,
              transitions: [
                {
                  days: 90,
                  storageClass: "INTELLIGENT_TIERING",
                },
              ],
            },
          ],
        },
      },
      cors: [
        {
          allowedOrigins: [
            "https://portfolio.ic-ces.engineering",
            "https://dev.portfolio.ic-ces.engineering",
          ],
          allowedMethods: ["GET"],
          allowedHeaders: ["*"],
          maxAge: 3600,
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
        NODE_ENV: "production",
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
        healthyThreshold: 2,
        unhealthyThreshold: 3,
      },
      dev: {
        // Disable ECS deployment in dev mode, use local docker-compose
        command: "docker-compose up",
        directory: "../",
      },
    });

    // Optional: Custom domain via Route 53
    // Uncomment when DNS is configured
    /*
    const domain = new sst.aws.Router("MarimoDomain", {
      domain: {
        name: "marimo.ces.engineering",
        dns: sst.cloudflare.dns(),  // Or sst.aws.dns() for Route 53
      },
      routes: {
        "/*": marimoService.url,
      },
    });
    */

    // CloudWatch alarms for monitoring
    const highMemoryAlarm = new sst.aws.Alarm("HighMemory", {
      metric: {
        namespace: "AWS/ECS",
        metricName: "MemoryUtilization",
        dimensions: {
          ServiceName: marimoService.name,
        },
        statistic: "Average",
      },
      threshold: 80,
      evaluationPeriods: 2,
      comparisonOperator: "GreaterThanThreshold",
    });

    return {
      endpoint: marimoService.url,
      bucket: dataBucket.name,
      // domain: domain.url,  // Uncomment when using custom domain
    };
  },
});
```

### File: `deploy/package.json`

```json
{
  "name": "climatevis-deploy",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "deploy:dev": "sst deploy --stage dev",
    "deploy:prod": "sst deploy --stage production",
    "diff:dev": "sst diff --stage dev",
    "diff:prod": "sst diff --stage production",
    "remove:dev": "sst remove --stage dev",
    "remove:prod": "sst remove --stage production",
    "logs": "sst logs --stage production",
    "state": "sst state export --stage production",
    "unlock": "sst unlock --stage production"
  },
  "devDependencies": {
    "sst": "^3.0.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0"
  }
}
```

### File: `deploy/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": ["sst.config.ts"],
  "exclude": ["node_modules", ".sst"]
}
```

---

## 8. Docker Configuration

### File: `Dockerfile`

```dockerfile
# Multi-stage build for optimized image size

# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Install runtime dependencies (curl for health checks)
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY notebooks/ ./notebooks/
COPY data/examples/ ./data/examples/

# Create health check endpoint
RUN echo '#!/bin/bash\ncurl -f http://localhost:7860/ || exit 1' > /health-check.sh \
    && chmod +x /health-check.sh

# Expose marimo port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/health-check.sh"]

# Run marimo server
# --mode run = read-only for viewers (no code editing)
# --mode edit = full editing capabilities (engineers only)
CMD ["marimo", "run", "--host", "0.0.0.0", "--port", "7860", "--mode", "edit", "notebooks/"]
```

### File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  marimo:
    build: .
    ports:
      - "7860:7860"
    environment:
      - AWS_ACCESS_KEY_ID=minioadmin
      - AWS_SECRET_ACCESS_KEY=minioadmin
      - AWS_ENDPOINT_URL=http://minio:9000
      - MARIMO_DATA_BUCKET=marimo-data
    volumes:
      # Mount notebooks for live editing
      - ./notebooks:/app/notebooks
      - ./data:/app/data
    depends_on:
      - minio

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web console
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 5s
      retries: 3

  # Optional: Create bucket on startup
  minio-init:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://minio:9000 minioadmin minioadmin; do
        sleep 1;
      done;
      mc mb local/marimo-data --ignore-existing;
      mc anonymous set download local/marimo-data/weather;
      exit 0;
      "

volumes:
  minio-data:
```

---

## 9. Scripts

### File: `scripts/export-wasm.sh`

```bash
#!/bin/bash
# Export all demo notebooks to WASM HTML

set -e

NOTEBOOKS_DIR="notebooks/demos"
DIST_DIR="dist"

# Activate virtual environment
source .venv/bin/activate

# Create dist directory
mkdir -p "$DIST_DIR"

# Export each notebook
for notebook in "$NOTEBOOKS_DIR"/*.py; do
  filename=$(basename "$notebook" .py)
  echo "Exporting $filename..."

  marimo export html-wasm "$notebook" \
    --output "$DIST_DIR/${filename}.html" \
    --mode edit

  # Check file size
  size=$(du -h "$DIST_DIR/${filename}.html" | cut -f1)
  echo "  ✓ Exported: ${filename}.html ($size)"
done

echo "✓ All demos exported to $DIST_DIR/"
ls -lh "$DIST_DIR/"
```

### File: `scripts/copy-to-portfolio.sh`

```bash
#!/bin/bash
# Copy WASM exports to portfolio monorepo

set -e

PORTFOLIO_PATH="${1:-../ces-portfolio}"
DIST_DIR="dist"
DEST_DIR="$PORTFOLIO_PATH/apps/web/public/demos"

if [ ! -d "$PORTFOLIO_PATH" ]; then
  echo "Error: Portfolio repo not found at $PORTFOLIO_PATH"
  echo "Usage: ./scripts/copy-to-portfolio.sh /path/to/ces-portfolio"
  exit 1
fi

# Create destination directory
mkdir -p "$DEST_DIR"

# Copy HTML files
echo "Copying WASM exports to portfolio..."
cp -v "$DIST_DIR"/*.html "$DEST_DIR/"

echo "✓ Copied to $DEST_DIR"
echo ""
echo "Next steps:"
echo "  cd $PORTFOLIO_PATH"
echo "  git add apps/web/public/demos/"
echo "  git commit -m 'Update marimo WASM demos'"
echo "  pnpm deploy"
```

### File: `scripts/upload-data-s3.sh`

```bash
#!/bin/bash
# Upload EPW files and datasets to S3

set -e

STAGE="${1:-production}"
BUCKET="marimo-data-$STAGE"
DATA_DIR="data/examples"

echo "Uploading data to s3://$BUCKET..."

# Upload EPW files
for epw in "$DATA_DIR"/*.epw; do
  filename=$(basename "$epw")
  echo "  Uploading $filename..."
  aws s3 cp "$epw" "s3://$BUCKET/weather/$filename" \
    --content-type "text/plain" \
    --metadata-directive REPLACE
done

# Upload JSON/CSV files
for file in "$DATA_DIR"/*.{json,csv}; do
  [ -e "$file" ] || continue
  filename=$(basename "$file")
  content_type="application/json"
  [[ "$filename" == *.csv ]] && content_type="text/csv"

  echo "  Uploading $filename..."
  aws s3 cp "$file" "s3://$BUCKET/data/$filename" \
    --content-type "$content_type" \
    --metadata-directive REPLACE
done

echo "✓ Upload complete"
aws s3 ls "s3://$BUCKET/" --recursive
```

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

---

## 10. Success Criteria

**Repository Setup Complete When:**
- [ ] Python 3.11+ environment working
- [ ] TypeScript/SST environment working
- [ ] Docker Compose runs locally (marimo + MinIO)
- [ ] 2 demo notebooks created (solar calculator, climate dashboard)
- [ ] WASM export succeeds, files < 500 KB
- [ ] ECS deployment succeeds, endpoint accessible
- [ ] S3 bucket created, CORS working
- [ ] Data uploaded (Vienna, Berlin, Dubai EPW files)
- [ ] CloudWatch logs visible
- [ ] Cost < EUR 50/month after 1 week

**Ready to Copy to `ces-portfolio` When:**
- [ ] WASM exports tested in browser (interactive elements work)
- [ ] EPW data fetch works from S3 (check Network tab)
- [ ] File sizes validated (< 500 KB per demo)
- [ ] CES branding applied (black bg, gold accents)

---

## Quick Reference: Common Commands

```bash
# Local Development
source .venv/bin/activate
marimo edit notebooks/demos/solar_calculator.py
docker-compose up
docker-compose down

# Export & Copy
./scripts/export-wasm.sh
./scripts/copy-to-portfolio.sh /path/to/ces-portfolio

# Deployment
cd deploy
pnpm sst deploy --stage dev
pnpm sst deploy --stage production
pnpm sst logs --stage production --tail
pnpm sst remove --stage dev

# Data Management
./scripts/upload-data-s3.sh production
aws s3 ls s3://marimo-data-production/ --recursive
```

---

**This PRD should be committed to the `climatevis-dashboard` repository root as `PRD.md` for reference during setup and development.**
