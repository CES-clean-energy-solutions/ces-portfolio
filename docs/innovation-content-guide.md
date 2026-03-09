# Innovation Content Guide

How to create, edit, and publish content for the Innovation section on the CES portfolio site.

## Where Content Lives

```
packages/content/data/innovation/
├── building-information-modeling/
│   ├── section-description.json    ← content + metadata
│   ├── 001-wasserbaulabor.png      ← gallery images
│   ├── 002-slxmep.jpeg
│   └── 003-pbs.png
├── climate-analysis/
│   ├── section-description.json
│   ├── climate-analysis-bg.webm    ← background video
│   ├── 001-wind-speed.png
│   └── 002-solar-analysis.png
├── computational-daylight-analysis/
│   └── ...
├── computational-fluid-dynamics/
│   └── ...
└── green-finance/
    └── ...
```

Each innovation area is a **folder**. Inside the folder: one `.json` file and any media files (images, videos).

---

## JSON Structure

Every folder must contain **exactly one `.json` file** (name doesn't matter, but we use `section-description.json` by convention).

### Template

Copy this and fill in your values:

```json
{
  "id": "your-area-id",
  "slug": "your-area-id",
  "order": 6,
  "title": "Your Area Title",
  "shortDescription": "One sentence shown on the card and under the title in the modal.",
  "longDescription": "Full paragraph shown in the modal body. Can be several sentences. Describe what the team does, which tools and methods are used, and what outcomes the client gets.",
  "subItems": [
    { "label": "Capability One", "slug": "capability-one" },
    { "label": "Capability Two", "slug": "capability-two" }
  ],
  "stats": {
    "metric": "40+",
    "metricLabel": "projects delivered",
    "secondary": "across 12 countries"
  },
  "links": [],
  "video": {
    "webm": "./your-video.webm",
    "mp4": "",
    "mp4Mobile": "",
    "poster": ""
  },
  "images": [
    {
      "src": "./001-screenshot.png",
      "alt": "Describe what the image shows for accessibility",
      "caption": "Longer explanation shown below the image in the gallery.",
      "animated": false
    }
  ]
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier, kebab-case (e.g. `climate-analysis`). Must match `slug`. |
| `slug` | Yes | Same as `id`. Used for URL routing. |
| `order` | Yes | Display order on the page. `1` = first card. No duplicates. |
| `title` | Yes | Display name on the card and modal header. |
| `shortDescription` | Yes | One sentence. Shown on the card below the title and in the modal subtitle. |
| `longDescription` | Yes | Full paragraph. Shown in the modal body. Write for a client audience. |
| `subItems` | Yes | Array of capabilities. Each needs a `label` (display text) and `slug` (kebab-case identifier). Shown as a bulleted list in the modal. Aim for 5-8 items. |
| `stats.metric` | Yes | The headline number (e.g. `"40+"`, `"1M+"`, `"3"`). Use `"TBD"` if not ready. |
| `stats.metricLabel` | Yes | What the number means (e.g. `"projects delivered"`). Use `"TBD"` if not ready. |
| `stats.secondary` | Yes | Extra context line below the stat. Can be empty string `""`. |
| `links` | No | Array of external links with optional thumbnails. See "Links" below. |
| `video` | Yes | Background video object. See "Videos" below. |
| `images` | Yes | Array of gallery images. See "Images" below. |

---

## Videos

The video plays as a background on the card (on hover) and autoplays in the modal header.

### Requirements

| Property | Value |
|----------|-------|
| Format | `.webm` (VP9 codec preferred) |
| Duration | 5-15 seconds, looped |
| Resolution | 1920x1080 recommended |
| Audio | None (videos play muted) |
| File size | Keep under 5 MB for fast loading |

### How to reference

Place the video file in your innovation folder and use a **relative path**:

```json
"video": {
  "webm": "./my-video.webm",
  "mp4": "",
  "mp4Mobile": "",
  "poster": ""
}
```

The build system resolves `./my-video.webm` to `/content/innovation/your-area-id/my-video.webm` automatically.

### Sharing a video from another area

If you don't have a unique video, you can reference one from the services folder using an **absolute path**:

```json
"video": {
  "webm": "/content/services/research-development/bg.webm",
  "mp4": "",
  "mp4Mobile": "",
  "poster": ""
}
```

Currently BIM, Daylight, and CFD share the R&D background video this way.

### What happens on the site

- **Card (thumbnail):** Video frame 0 is shown as a still. On desktop hover, the video plays. On mobile, it stays frozen on frame 0.
- **Modal (detail page):** Video autoplays silently in a loop at the top, with the title overlaid.
- **Fallback:** If the video fails to load, the first image from `images` is shown instead.

---

## Images

Images appear in the "Gallery" section of the modal.

### Requirements

| Property | Value |
|----------|-------|
| Formats | `.png`, `.jpg`, `.jpeg` (PNG preferred for screenshots/diagrams) |
| Animated | `.gif` supported — set `"animated": true` |
| Resolution | At least 1200px wide for sharp rendering |
| Aspect ratio | 16:9 preferred (displayed in `aspect-video` containers) |
| File size | Keep under 500 KB per image. Compress PNGs with tools like TinyPNG. |

### How to reference

Place image files in your innovation folder. Use a **relative path** starting with `./`:

```json
"images": [
  {
    "src": "./001-my-screenshot.png",
    "alt": "Short description of what the image shows",
    "caption": "Longer explanation displayed below the image.",
    "animated": false
  }
]
```

### Naming convention

Prefix with a number to control display order: `001-`, `002-`, `003-`, etc.

### Image fields

| Field | Required | Description |
|-------|----------|-------------|
| `src` | Yes | Relative path to the image file (`./filename.png`) |
| `alt` | Yes | Accessibility text. Describe the image content for screen readers. |
| `caption` | No | Explanatory text shown below the image in the gallery. |
| `animated` | No | Set `true` for animated GIFs. Uses `<img>` tag instead of Next.js optimized `<Image>`. Default: `false`. |

### Candidate images

If you have raw/working images that shouldn't be published, put them in a `candidates/` subfolder. This folder is **not copied** to the site.

```
your-area/
├── section-description.json
├── 001-final-image.png         ← published
├── candidates/                 ← NOT published
│   ├── draft-v1.png
│   └── draft-v2.png
```

---

## Links

Optional external links shown in a "Resources" section in the modal. Only add these if you have a live demo, tool, or relevant external page.

```json
"links": [
  {
    "label": "Weather Analysis Tool",
    "href": "https://climate-dev.ic-ces.engineering/tools/weather",
    "external": true,
    "image": "./weather-tool-thumbnail.png",
    "imageAlt": "Screenshot of the Weather Analysis tool"
  }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `label` | Yes | Link text (e.g. "Live Demo", "Documentation") |
| `href` | Yes | Full URL |
| `external` | No | `true` opens in a new tab. Default: `false`. |
| `image` | No | Relative path to a small thumbnail (displayed at 64px width). |
| `imageAlt` | No | Alt text for the thumbnail. Falls back to `label` if omitted. |

---

## Stats

A highlighted metric box shown in the modal. Use it for an impressive number.

```json
"stats": {
  "metric": "1M+",
  "metricLabel": "sensor points per run",
  "secondary": "massively parallel via custom cloud orchestration"
}
```

- **`metric`**: The big number. Keep it short (`"40+"`, `"3"`, `"1M+"`).
- **`metricLabel`**: What the number means. One short phrase.
- **`secondary`**: Extra context line (optional, can be `""`).
- Set all three to `"TBD"` if you don't have stats yet — the stats box will be hidden.

---

## How To: Add a New Innovation Area

1. **Create a folder** in `packages/content/data/innovation/`:
   ```
   packages/content/data/innovation/your-new-area/
   ```
   Use kebab-case for the folder name.

2. **Create `section-description.json`** inside the folder. Copy the template above and fill it in.

3. **Add media files** (video + images) to the same folder.

4. **Set the `order` field** to the next number (check existing areas to avoid duplicates).

5. **Build and verify:**
   ```bash
   pnpm build
   ```
   The build will fail if:
   - The folder has no `.json` file
   - The folder has more than one `.json` file
   - Required fields are missing

6. **Test locally** by running `pnpm dev` and checking the site.

That's it — the loader auto-discovers new folders. No code changes needed.

---

## How To: Update an Existing Area

1. Edit the `section-description.json` in the relevant folder.
2. Add/remove/replace image or video files as needed.
3. Run `pnpm build` to verify.

---

## How To: Reorder Cards

Change the `order` field in each area's JSON. Cards display in ascending order (1 = first).

---

## Current Areas

| Order | Folder | Title | Video | Images | Stats |
|-------|--------|-------|-------|--------|-------|
| 1 | `building-information-modeling` | BIM MEP Engineering | Shared (R&D) | 3 | Complete |
| 2 | `climate-analysis` | Climate Analysis | Custom | 2 + 1 link thumbnail | Complete |
| 3 | `computational-daylight-analysis` | Computational Daylight Analysis | Shared (R&D) | 3 | Complete |
| 4 | `computational-fluid-dynamics` | Computational Fluid Dynamics | Shared (R&D) | 4 | Complete |
| 5 | `green-finance` | Green Finance | Custom | Placeholder only | TBD |

---

## Checklist for New Content

- [ ] Folder created with kebab-case name
- [ ] `section-description.json` present with all required fields
- [ ] `id` and `slug` match the folder name
- [ ] `order` is unique and correct
- [ ] Video file is `.webm`, under 5 MB, and referenced with `./` path
- [ ] All images are referenced with `./` paths
- [ ] All images have `alt` text
- [ ] Stats are filled in (or set to `"TBD"` to hide)
- [ ] `pnpm build` passes
- [ ] Tested locally with `pnpm dev`
