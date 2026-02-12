#!/bin/bash

# encode-service-video.sh
# Encodes service card background videos with slow motion, multiple formats, and mobile variants
#
# Usage:
#   ./scripts/encode-service-video.sh input.mp4 output-name
#
# Example:
#   ./scripts/encode-service-video.sh raw/wind-turbine.mp4 renewable-energy
#   -> Generates: renewable-energy-bg.webm, -bg.mp4, -bg-mobile.mp4, -poster.jpg, -placeholder.jpg

set -e  # Exit on any error

# Check arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input-video> <output-basename>"
    echo ""
    echo "Example:"
    echo "  $0 raw/wind-turbine.mp4 renewable-energy"
    echo "  -> Generates service video assets in apps/web/public/video/services/"
    exit 1
fi

INPUT="$1"
NAME="$2"
OUTDIR="apps/web/public/video/services"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' not found"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed"
    echo "Install with: sudo apt-get install ffmpeg"
    exit 1
fi

# Create output directory
mkdir -p "$OUTDIR"

echo "🎬 Encoding service video: $INPUT"
echo "📦 Output basename: $NAME"
echo "📁 Output directory: $OUTDIR"
echo ""

# Step 1: Create slow-motion version (0.5x speed, 15 seconds)
echo "1/6 Creating slow-motion version (0.5x speed)..."
SLOWED="/tmp/${NAME}-slowed.mp4"
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
  "${OUTDIR}/${NAME}-bg.webm" \
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
  "${OUTDIR}/${NAME}-bg.mp4" \
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
  "${OUTDIR}/${NAME}-bg-mobile.mp4" \
  -y -loglevel warning -stats

# Step 5: Poster image (540p JPEG)
echo "5/6 Extracting poster frame..."
ffmpeg -i "$SLOWED" \
  -ss 2 \
  -frames:v 1 \
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:-1:-1:color=black" \
  -q:v 2 \
  "${OUTDIR}/${NAME}-poster.jpg" \
  -y -loglevel warning

# Step 6: Placeholder (tiny, for blur-up effect)
echo "6/6 Creating placeholder..."
ffmpeg -i "$SLOWED" \
  -ss 2 \
  -frames:v 1 \
  -vf "scale=32:-1" \
  -q:v 8 \
  "${OUTDIR}/${NAME}-placeholder.jpg" \
  -y -loglevel warning

# Cleanup temp file
rm "$SLOWED"

echo ""
echo "✅ Done! Generated:"
ls -lh "${OUTDIR}/${NAME}-bg.webm" \
       "${OUTDIR}/${NAME}-bg.mp4" \
       "${OUTDIR}/${NAME}-bg-mobile.mp4" \
       "${OUTDIR}/${NAME}-poster.jpg" \
       "${OUTDIR}/${NAME}-placeholder.jpg"
echo ""
echo "📊 File sizes:"
echo "  WebM (desktop):  $(du -h "${OUTDIR}/${NAME}-bg.webm" | cut -f1)"
echo "  MP4 (desktop):   $(du -h "${OUTDIR}/${NAME}-bg.mp4" | cut -f1)"
echo "  MP4 (mobile):    $(du -h "${OUTDIR}/${NAME}-bg-mobile.mp4" | cut -f1)"
echo "  Poster:          $(du -h "${OUTDIR}/${NAME}-poster.jpg" | cut -f1)"
echo "  Placeholder:     $(du -h "${OUTDIR}/${NAME}-placeholder.jpg" | cut -f1)"
echo ""
