# Video Encoding Guide


```
# MP4
ffmpeg -i veo3_pv_plant.mp4 -an -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1280:720" -movflags +faststart hero-bg.mp4

# WebM
ffmpeg -i veo3_pv_plant.mp4 -an -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -vf "scale=1280:720" hero-bg.webm

# Poster
ffmpeg -i hero-bg.mp4 -ss 00:00:02 -frames:v 1 -q:v 2 hero-poster.jpg
```

This document provides ffmpeg commands for encoding hero background videos for the CES portfolio site.

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

## Batch Processing Multiple Videos

```bash
#!/bin/bash
# encode-hero-video.sh
INPUT=$1
BASENAME=$(basename "$INPUT" .mp4)

ffmpeg -i "$INPUT" -an -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1280:720" -movflags +faststart "${BASENAME}.mp4"

ffmpeg -i "$INPUT" -an -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -vf "scale=1280:720" "${BASENAME}.webm"

ffmpeg -i "${BASENAME}.mp4" -ss 00:00:02 -frames:v 1 -q:v 2 "${BASENAME}-poster.jpg"

echo "✓ Generated: ${BASENAME}.mp4, ${BASENAME}.webm, ${BASENAME}-poster.jpg"
```

Usage:
```bash
chmod +x encode-hero-video.sh
./encode-hero-video.sh veo3_pv_plant.mp4
```

## HeroVideo Component Usage

After encoding, reference the videos in your Hero section:

```tsx
<HeroVideo
  webmSrc="/video/hero-bg.webm"
  mp4Src="/video/hero-bg.mp4"
  posterSrc="/video/hero-poster.jpg"
  playbackRate={0.5}  // Slow down for smoother looping
/>
```

## Performance Notes

- **Preload strategy:** WebM is preloaded in `<head>` via `<link rel="preload">`
- **Browser selection:** Modern browsers pick WebM (better compression), Safari/legacy fall back to MP4
- **Reduced motion:** Component automatically serves static poster JPG when `prefers-reduced-motion: reduce`
- **Total bandwidth:** ~1.5 MB (video + poster), spread across CDN edge cache

## Troubleshooting

**"Unknown encoder 'libvpx-vp9'"**
```bash
# Install VP9 codec support
sudo apt-get install ffmpeg libvpx-dev
```

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
