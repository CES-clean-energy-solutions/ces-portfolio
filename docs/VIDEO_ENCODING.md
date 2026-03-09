# Video Encoding Guide

This document provides complete ffmpeg workflows for encoding web-optimized videos. Includes ready-to-use scripts for both simple hero backgrounds and advanced service videos with mobile variants.

## Quick Start

```bash
# Simple hero video (720p, 3 outputs)
./encode-hero-video.sh input.mp4

# Advanced service video (540p/270p, slow motion, 5 outputs)
./encode-service-video.sh input.mp4 output/folder
```

## Installation

### Option 1: Install ffmpeg locally (host machine)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg libvpx-dev

# macOS
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### Option 2: Add ffmpeg to devcontainer

If working in a devcontainer, add ffmpeg to your Dockerfile:

```dockerfile
# In .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install ffmpeg with VP9 support
RUN apt-get update && \
    apt-get install -y ffmpeg libvpx-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

Then rebuild the container. This ensures all team members have ffmpeg available for video processing.

## Target Specifications

- **Resolution:** 1280x720 (720p) - balances quality and file size for hero backgrounds
- **File size targets:**
  - MP4: ~660 KB
  - WebM: ~874 KB
  - Poster JPG: ~118 KB
- **No audio:** All hero videos are muted (`-an` flag)
- **Optimization:** MP4 uses `faststart` flag for streaming playback

## Encoding Commands

### MP4 (H.264)
Primary format for Safari and legacy browser support.

```bash
ffmpeg -i veo3_pv_plant.mp4 -an -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1280:720" -movflags +faststart hero-bg.mp4
```

**Parameters:**
- `-an` — Remove audio track
- `-c:v libx264` — H.264 video codec (universal compatibility)
- `-crf 28` — Constant Rate Factor (quality). Range: 18-32 (lower = better quality, larger file)
- `-preset slow` — Encoding speed vs compression (slower = smaller file, better quality)
- `-vf "scale=1280:720"` — Resize to 720p (exact dimensions, may crop if aspect ratio differs)
- `-movflags +faststart` — Move metadata to file start for faster streaming playback

### WebM (VP9)
Modern format with better compression. Served first to Chrome, Firefox, Edge.

```bash
ffmpeg -i veo3_pv_plant.mp4 -an -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -vf "scale=1280:720" hero-bg.webm
```

**Parameters:**
- `-c:v libvpx-vp9` — VP9 codec (better compression than H.264)
- `-crf 35` — Quality for VP9. Range: 30-40 (higher = smaller file)
- `-b:v 0` — Variable bitrate mode (let CRF control quality)

### Poster Frame
Static JPEG fallback shown during video load or for `prefers-reduced-motion` users.

```bash
ffmpeg -i hero-bg.mp4 -ss 00:00:02 -frames:v 1 -q:v 2 hero-poster.jpg
```

**Parameters:**
- `-ss 00:00:02` — Extract frame at 2 seconds (adjust to pick a representative frame)
- `-frames:v 1` — Extract only 1 frame
- `-q:v 2` — JPEG quality scale 2-31 (2 = highest quality, ~118 KB)

## File Placement

Encoded files go in:
```
apps/web/public/video/
├── hero-bg.mp4
├── hero-bg.webm
└── hero-poster.jpg
```

## Aspect Ratio Handling

If your source video has a different aspect ratio than 16:9 (1280:720), you have two options:

### Option 1: Maintain aspect ratio (letterbox/pillarbox)
```bash
-vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2"
```

### Option 2: Crop to fill (no black bars)
```bash
-vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720"
```

## Quality Tuning

If file sizes are too large or quality is poor, adjust CRF values:

| Target | MP4 CRF | WebM CRF | Notes |
|--------|---------|----------|-------|
| Higher quality, larger files | 23-26 | 30-33 | Use for detailed/complex scenes |
| Balanced (current) | 28 | 35 | Good starting point |
| Smaller files, lower quality | 30-32 | 37-40 | Use for simple/abstract backgrounds |

## Complete Encoding Scripts

### Script 1: Simple Hero Video (`encode-hero-video.sh`)

For basic background videos: 720p, no slow motion, 3 outputs (MP4 + WebM + poster).

```bash
#!/bin/bash
# encode-hero-video.sh
# Encodes a video into web-optimized formats for hero backgrounds
#
# Usage: ./encode-hero-video.sh input-video.mp4
#
# Output (written to current directory):
#   {basename}.mp4         - H.264, 720p, ~660 KB (Safari/iOS)
#   {basename}.webm        - VP9, 720p, ~874 KB (Chrome/Firefox)
#   {basename}-poster.jpg  - JPEG, 720p, ~118 KB (fallback)

set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <input-video>"
    echo ""
    echo "Example:"
    echo "  $0 raw/background.mp4"
    exit 1
fi

INPUT="$1"
BASENAME=$(basename "$INPUT" .mp4)

if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' not found"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed"
    echo "Install with: sudo apt-get install ffmpeg"
    exit 1
fi

echo "Encoding hero video: $INPUT"
echo "Output basename: $BASENAME"
echo ""

# Step 1: MP4 (H.264) - Safari/iOS
echo "1/3 Encoding MP4 (H.264, 720p)..."
ffmpeg -i "$INPUT" \
  -an \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -vf "scale=1280:720" \
  -movflags +faststart \
  "${BASENAME}.mp4" \
  -y -loglevel warning -stats

# Step 2: WebM (VP9) - Chrome/Firefox
echo "2/3 Encoding WebM (VP9, 720p)..."
ffmpeg -i "$INPUT" \
  -an \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -vf "scale=1280:720" \
  "${BASENAME}.webm" \
  -y -loglevel warning -stats

# Step 3: Poster frame
echo "3/3 Extracting poster frame..."
ffmpeg -i "${BASENAME}.mp4" \
  -ss 00:00:02 \
  -frames:v 1 \
  -q:v 2 \
  "${BASENAME}-poster.jpg" \
  -y -loglevel warning

echo ""
echo "✓ Done! Generated:"
ls -lh "${BASENAME}.mp4" "${BASENAME}.webm" "${BASENAME}-poster.jpg"
echo ""
echo "File sizes:"
echo "  MP4:      $(du -h "${BASENAME}.mp4" | cut -f1)"
echo "  WebM:     $(du -h "${BASENAME}.webm" | cut -f1)"
echo "  Poster:   $(du -h "${BASENAME}-poster.jpg" | cut -f1)"
echo ""
```

**Usage:**
```bash
chmod +x encode-hero-video.sh
./encode-hero-video.sh raw/background.mp4
# Outputs: background.mp4, background.webm, background-poster.jpg
```

---

### Script 2: Advanced Service Video (`encode-service-video.sh`)

For service videos: 540p/270p, slow motion (0.5x speed), 5 outputs including mobile variant.

```bash
#!/bin/bash
# encode-service-video.sh
# Encodes service background videos with slow motion, multiple formats, and mobile variants.
#
# Usage:
#   ./encode-service-video.sh <input-video> <output-folder>
#
# Examples:
#   # Encode from raw source into a service folder:
#   ./encode-service-video.sh raw/wind-turbine.mp4 content/services/renewable-energy
#
#   # Encode and replace existing bg.mp4 in a folder:
#   ./encode-service-video.sh content/services/plant-engineering/bg.mp4 content/services/plant-engineering
#
# Output files (all written to the output folder):
#   bg.webm          - VP9, 540p, 0.5x speed, ~500-1500 KB (desktop, Chrome/Firefox)
#   bg.mp4           - H.264, 540p, 0.5x speed, ~600-1800 KB (desktop, Safari/iOS)
#   bg-mobile.mp4    - H.264, 270p, 0.5x speed, ~200-500 KB (mobile)
#   poster.jpg       - JPEG, 540p, ~50-150 KB (video poster)
#   placeholder.jpg  - JPEG, 32px wide, ~2-5 KB (blur-up placeholder)

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input-video> <output-folder>"
    echo ""
    echo "Example:"
    echo "  $0 raw/turbine.mp4 content/services/renewable-energy"
    exit 1
fi

INPUT="$1"
OUTDIR="$2"

if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' not found"
    exit 1
fi

if [ ! -d "$OUTDIR" ]; then
    echo "Error: Output directory '$OUTDIR' not found"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed"
    echo "Install with: sudo apt-get install ffmpeg"
    exit 1
fi

echo "Encoding service video: $INPUT"
echo "Output directory: $OUTDIR"
echo ""

# Step 1: Create slow-motion version (0.5x speed, 15 seconds)
echo "1/6 Creating slow-motion version (0.5x speed, 15s)..."
SLOWED="/tmp/service-video-slowed-$$.mp4"
ffmpeg -i "$INPUT" \
  -filter:v "setpts=2.0*PTS" \
  -an \
  -t 15 \
  "$SLOWED" \
  -y -loglevel warning -stats

# Step 2: WebM (VP9) - primary desktop format
echo "2/6 Encoding WebM (VP9, 540p)..."
ffmpeg -i "$SLOWED" \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -c:v libvpx-vp9 \
  -crf 35 -b:v 0 \
  -speed 2 \
  -an \
  "${OUTDIR}/bg.webm" \
  -y -loglevel warning -stats

# Step 3: MP4 (H.264) - Safari/iOS desktop fallback
echo "3/6 Encoding MP4 (H.264, 540p)..."
ffmpeg -i "$SLOWED" \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -profile:v main \
  -movflags +faststart \
  -an \
  "${OUTDIR}/bg.mp4" \
  -y -loglevel warning -stats

# Step 4: Mobile MP4 (H.264, 270p, low bitrate)
echo "4/6 Encoding mobile MP4 (H.264, 270p)..."
ffmpeg -i "$SLOWED" \
  -vf "scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:-1:-1:color=black" \
  -c:v libx264 \
  -preset slow \
  -crf 30 \
  -profile:v baseline \
  -level 3.0 \
  -movflags +faststart \
  -an \
  "${OUTDIR}/bg-mobile.mp4" \
  -y -loglevel warning -stats

# Step 5: Poster image (540p JPEG)
echo "5/6 Extracting poster frame..."
ffmpeg -i "$SLOWED" \
  -ss 2 \
  -frames:v 1 \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -q:v 2 \
  "${OUTDIR}/poster.jpg" \
  -y -loglevel warning

# Step 6: Placeholder (tiny, for blur-up effect)
echo "6/6 Creating placeholder..."
ffmpeg -i "$SLOWED" \
  -ss 2 \
  -frames:v 1 \
  -vf "scale=32:-1" \
  -q:v 8 \
  "${OUTDIR}/placeholder.jpg" \
  -y -loglevel warning

# Cleanup temp file
rm "$SLOWED"

echo ""
echo "✓ Done! Generated:"
ls -lh "${OUTDIR}/bg.webm" \
       "${OUTDIR}/bg.mp4" \
       "${OUTDIR}/bg-mobile.mp4" \
       "${OUTDIR}/poster.jpg" \
       "${OUTDIR}/placeholder.jpg"
echo ""
echo "File sizes:"
echo "  WebM (desktop):  $(du -h "${OUTDIR}/bg.webm" | cut -f1)"
echo "  MP4 (desktop):   $(du -h "${OUTDIR}/bg.mp4" | cut -f1)"
echo "  MP4 (mobile):    $(du -h "${OUTDIR}/bg-mobile.mp4" | cut -f1)"
echo "  Poster:          $(du -h "${OUTDIR}/poster.jpg" | cut -f1)"
echo "  Placeholder:     $(du -h "${OUTDIR}/placeholder.jpg" | cut -f1)"
echo ""
```

**Usage:**
```bash
chmod +x encode-service-video.sh
./encode-service-video.sh raw/turbine.mp4 content/services/renewable-energy
# Outputs 5 files in content/services/renewable-energy/
```

---

## Script Comparison

| Feature | Hero Script | Service Script |
|---------|-------------|----------------|
| **Resolution** | 720p (1280x720) | 540p desktop + 270p mobile |
| **Slow motion** | No | Yes (0.5x speed) |
| **Duration** | Full input | Trimmed to 15s |
| **Outputs** | 3 files | 5 files |
| **Mobile variant** | No | Yes (270p, low bitrate) |
| **Placeholder** | No | Yes (32px blur-up) |
| **Use case** | Simple backgrounds | Service cards, complex layouts |
| **Total size** | ~1.5 MB | ~1-3 MB (desktop) + ~200-500 KB (mobile) |

**Choose hero script** for: Full-screen backgrounds, landing pages, simple hero sections

**Choose service script** for: Card backgrounds, mobile-heavy sites, cinematic slow-motion effects

---

### Hero Background Video

After encoding with `encode-hero-video.sh`, use in a full-screen hero:

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  poster="/video/hero-poster.jpg"
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/video/hero-bg.webm" type="video/webm" />
  <source src="/video/hero-bg.mp4" type="video/mp4" />
</video>
```

### Service Card Video (with Mobile Variant)

After encoding with `encode-service-video.sh`, use responsive sources:

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  poster="/services/renewable-energy/poster.jpg"
  className="absolute inset-0 w-full h-full object-cover"
>
  {/* Desktop: WebM for Chrome/Firefox */}
  <source
    src="/services/renewable-energy/bg.webm"
    type="video/webm"
    media="(min-width: 1024px)"
  />
  {/* Desktop: MP4 for Safari */}
  <source
    src="/services/renewable-energy/bg.mp4"
    type="video/mp4"
    media="(min-width: 1024px)"
  />
  {/* Mobile: Lightweight 270p MP4 */}
  <source
    src="/services/renewable-energy/bg-mobile.mp4"
    type="video/mp4"
  />
</video>
```

**With blur-up placeholder** (styled-components example):

```tsx
const VideoContainer = styled.div`
  background-image: url('/services/renewable-energy/placeholder.jpg');
  background-size: cover;
  filter: blur(20px);
  transition: filter 0.3s ease;

  video {
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  &[data-loaded="true"] {
    filter: blur(0);
    video {
      opacity: 1;
    }
  }
`;
```

## Performance Notes

- **Preload strategy:** WebM is preloaded in `<head>` via `<link rel="preload">`
- **Browser selection:** Modern browsers pick WebM (better compression), Safari/legacy fall back to MP4
- **Reduced motion:** Component automatically serves static poster JPG when `prefers-reduced-motion: reduce`
- **Total bandwidth:** ~1.5 MB (video + poster), spread across CDN edge cache

## Troubleshooting

**"Unknown encoder 'libvpx-vp9'"**
- Ensure ffmpeg was installed with VP9 support (`libvpx-dev` package)
- Rebuild devcontainer if using Docker-based workflow (see Installation section)

**Video won't play in Safari**
- Ensure MP4 uses H.264 codec and AAC audio (or no audio with `-an`)
- Verify `movflags +faststart` is present

**File size too large**
- Increase CRF value (28 → 30 for MP4, 35 → 37 for WebM)
- Reduce resolution: `scale=960:540` (540p) or `scale=854:480` (480p)
- Use faster preset: `slow` → `medium` (less compression efficiency)

**Loop has visible seam**
- Extract first/last frames and verify they're similar: `ffmpeg -i video.mp4 -vf select='eq(n\,0)' -frames:v 1 first.jpg`
- Adjust cross-fade duration in `HeroVideo.tsx` (increase `fadeDuration`)
- Slow down playback with `playbackRate` prop (makes loop less noticeable)

---

## Best Practices & Pro Tips

### Compression Strategy
- **Dark overlays forgive compression** — If placing dark gradients or blur filters over video, use higher CRF (35-40 for VP9, 30-32 for H.264)
- **Test on target device** — Compression artifacts look different on phone screens vs desktop monitors
- **Motion = worse compression** — Fast-moving footage (particle sims, rotating turbines) needs lower CRF than slow pans

### Browser Optimization
- **Serve WebM first** — Modern browsers get smaller WebM, Safari falls back to MP4
- **Preload critical videos** — Add to `<head>`: `<link rel="preload" as="video" href="hero.webm">`
- **Lazy-load below-fold** — Use Intersection Observer for videos not immediately visible
- **Respect `prefers-reduced-motion`** — Show static poster image for accessibility

### Mobile Considerations
- **Mobile gets MP4 only** — WebM support is spotty on older iOS devices
- **Use 270p for mobile** — Tiny phone screens don't need 540p/720p resolution
- **Keep mobile videos under 500 KB** — Cellular data is expensive

### Workflow Tips
- **Keep raw originals** — Archive uncompressed source files separately (don't commit to git)
- **Version control outputs** — Commit compressed videos to git (they're optimized and small)
- **Batch process** — Run scripts overnight for large video libraries
- **Document CRF choices** — Note which CRF values worked best for each video type

### DevContainer Integration
If adding ffmpeg to your devcontainer setup:

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install ffmpeg with VP9 support
RUN apt-get update && \
    apt-get install -y \
        ffmpeg \
        libvpx-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Optional: Install mediainfo for video analysis
RUN apt-get update && \
    apt-get install -y mediainfo \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

Then in `.devcontainer/devcontainer.json`:
```json
{
  "build": {
    "dockerfile": "Dockerfile"
  },
  "postCreateCommand": "pnpm install"
}
```

Rebuild container: **Cmd/Ctrl + Shift + P** → "Dev Containers: Rebuild Container"

---

## Quick Command Reference

```bash
# Get video info
ffmpeg -i video.mp4

# Extract specific frame
ffmpeg -i video.mp4 -ss 00:00:05 -frames:v 1 frame.jpg

# Trim video (first 10 seconds)
ffmpeg -i video.mp4 -t 10 -c copy trimmed.mp4

# Speed up 2x
ffmpeg -i video.mp4 -filter:v "setpts=0.5*PTS" fast.mp4

# Slow down 0.5x
ffmpeg -i video.mp4 -filter:v "setpts=2.0*PTS" slow.mp4

# Convert to GIF (use sparingly, large files)
ffmpeg -i video.mp4 -vf "fps=10,scale=480:-1:flags=lanczos" output.gif

# Check which codecs are available
ffmpeg -codecs | grep -E "(vp9|h264)"
```
