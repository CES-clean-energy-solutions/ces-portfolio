# Service Content Files

Each JSON file represents one service card on the CES portfolio website. Marketing and Engineering teams can edit these files directly.

## File Structure

```
services/
├── energy-efficiency.json
├── renewable-energy.json
├── plant-engineering.json
├── innovative-building.json
├── research-development.json
└── green-finance.json
```

## Field Reference

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier (kebab-case) | `"energy-efficiency"` |
| `slug` | string | URL-friendly path segment | `"energy-efficiency-management"` |
| `title` | string | English service name | `"Energy Efficiency & Management"` |
| `titleDe` | string | German translation (for visual texture) | `"Energieeffizienz & Management"` |
| `icon` | string | Icon component reference | `"energy-efficiency"` |
| `cardSize` | string | Card visual prominence: `"standard"`, `"large"`, `"featured"` | `"standard"` |
| `shortDescription` | string | 1 sentence summary (collapsed state) | `"Comprehensive energy audits..."` |
| `longDescription` | string | 2-3 sentences (expanded state) | `"We analyze energy consumption..."` |
| `subServices` | array | List of specialized offerings | `[{"label": "...", "slug": "..."}]` |
| `stats.metric` | string | Primary metric value | `"120+"` |
| `stats.metricLabel` | string | Metric description | `"projects completed"` |
| `stats.secondary` | string | Supporting metric | `"40% avg. energy reduction"` |
| `relatedProjectSlugs` | array | Links to portfolio case studies | `["project-slug-1", "project-slug-2"]` |
| `links` | array (optional) | Related demos/pages | `[{"label": "...", "href": "...", "external": false}]` |
| `video.webm` | string | WebM video path (desktop) | `"/video/services/name-bg.webm"` |
| `video.mp4` | string | MP4 video path (desktop) | `"/video/services/name-bg.mp4"` |
| `video.mp4Mobile` | string | MP4 video path (mobile) | `"/video/services/name-bg-mobile.mp4"` |
| `video.poster` | string | Fallback poster image | `"/video/services/name-poster.jpg"` |
| `video.placeholder` | string (optional) | Base64 blur-up data URI | `"data:image/jpeg;base64,..."` |

## Editing Guidelines

### Text Content
- **`title`**: Keep under 40 characters (mobile display)
- **`shortDescription`**: 1 sentence, 100-150 characters
- **`longDescription`**: 2-3 sentences, 250-350 characters
- Use active voice, present tense
- Avoid jargon unless client-facing teams use it

### Card Sizes
- **`"standard"`**: Default 1-column card (most services)
- **`"large"`**: 2-column span (hero services like Renewable Energy)
- **`"featured"`**: Reserved for promotional campaigns

### Links
Add optional links to demos, notebooks, or detail pages:
```json
"links": [
  {
    "label": "Solar Calculator Demo",
    "href": "/demos/solar-calculator",
    "external": false
  },
  {
    "label": "Urban AI Notebook",
    "href": "https://marimo.ces.engineering/urban-ai",
    "external": true
  }
]
```

### Video Assets
Place video files in `/public/video/services/`:
- **WebM** (preferred for desktop, best compression)
- **MP4** (fallback, required for Safari/iOS)
- **MP4 Mobile** (optimized resolution/bitrate for mobile)
- **Poster** (JPEG/PNG, visible before video loads)

Video naming convention: `{service-id}-bg.{ext}`

## Validation

After editing, run type checking to ensure JSON structure is valid:

```bash
pnpm --filter @ces/content type-check
```

TypeScript will report any missing fields or incorrect types.

## Questions?

Contact the web engineering team if you need:
- New fields added to the data model
- Custom card layouts beyond standard/large/featured
- Help with video optimization or encoding
