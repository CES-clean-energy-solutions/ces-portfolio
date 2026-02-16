# Service Content

Each service has its own folder containing a `service.json` and any related assets (images, videos, posters).

## Folder Structure

```
services/
├── energy-efficiency/
│   ├── service.json          ← service data (required)
│   ├── bg.webm               ← video background, desktop (drop here)
│   ├── bg.mp4                ← video background, Safari fallback
│   ├── bg-mobile.mp4         ← video background, mobile
│   └── poster.jpg            ← video poster / fallback image
├── renewable-energy/
│   ├── service.json
│   └── ...
├── plant-engineering/
│   └── service.json
├── innovative-building/
│   └── service.json
├── research-development/
│   └── service.json
└── green-finance/
    └── service.json
```

## Adding a New Service

1. Create a new folder: `services/my-new-service/`
2. Add a `service.json` file (copy from an existing service as a template)
3. Drop any assets (videos, images) into the same folder
4. Reference assets with relative paths in the JSON: `"./bg.webm"`
5. **That's it** — the loader auto-discovers all subfolders

## Asset Paths

Use `./` relative paths in JSON to reference files in the same folder:

```json
"video": {
  "webm": "./bg.webm",
  "mp4": "./bg.mp4",
  "mp4Mobile": "./bg-mobile.mp4",
  "poster": "./poster.jpg"
}
```

The loader resolves these to public URLs at build time:
- `./bg.webm` → `/content/services/energy-efficiency/bg.webm`

**Important:** For assets to be served by the site, copy or symlink them into the Next.js public directory:
```
apps/web/public/content/services/{service-id}/
```

## JSON Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (must match folder name) |
| `slug` | string | URL path segment |
| `title` | string | English service name (< 40 chars) |
| `titleDe` | string | German translation |
| `icon` | string | Icon component ID |
| `cardSize` | `"standard"` / `"large"` / `"featured"` | Card visual prominence |
| `shortDescription` | string | 1 sentence (100-150 chars) |
| `longDescription` | string | 2-3 sentences (250-350 chars) |
| `subServices` | array | `[{"label": "...", "slug": "..."}]` |
| `stats.metric` | string | e.g. `"120+"` |
| `stats.metricLabel` | string | e.g. `"projects completed"` |
| `stats.secondary` | string | e.g. `"40% avg. energy reduction"` |
| `relatedProjectSlugs` | array | Links to portfolio case studies |
| `links` | array (optional) | `[{"label": "...", "href": "...", "external": false}]` |
| `video` | object | Video asset paths (relative or absolute) |
