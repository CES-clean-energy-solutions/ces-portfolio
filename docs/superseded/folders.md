ces-project/
├── package.json              ← root: orchestration only, no app code
├── pnpm-workspace.yaml       ← tells pnpm where the sub-projects live
├── turbo.json                ← tells Turborepo how to run tasks across sub-projects
├── sst.config.ts             ← AWS infrastructure definition (will add later)
│
├── apps/
│   └── web/
│       └── package.json      ← the actual Next.js website, its own dependencies
│
└── packages/
    └── ui/
        └── package.json      ← shared component library (shadcn/ui components, brand assets)