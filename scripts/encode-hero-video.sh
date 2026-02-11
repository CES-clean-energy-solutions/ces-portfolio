#!/bin/bash

# encode-hero-video.sh
# Encodes a video file into optimized MP4, WebM, and poster JPG for hero backgrounds
#
# Usage:
#   ./scripts/encode-hero-video.sh input.mp4 output-name
#
# Example:
#   ./scripts/encode-hero-video.sh veo3_pv_plant.mp4 hero-bg
#   -> Generates: hero-bg.mp4, hero-bg.webm, hero-bg-poster.jpg

set -e  # Exit on any error

# Check arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input-video> <output-basename>"
    echo ""
    echo "Example:"
    echo "  $0 source.mp4 hero-bg"
    echo "  -> Generates: hero-bg.mp4, hero-bg.webm, hero-bg-poster.jpg"
    exit 1
fi

INPUT="$1"
OUTPUT_BASE="$2"

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

echo "🎬 Encoding video: $INPUT"
echo "📦 Output basename: $OUTPUT_BASE"
echo ""

# Generate MP4 (H.264)
echo "1/3 Encoding MP4 (H.264)..."
ffmpeg -i "$INPUT" -an -c:v libx264 -crf 28 -preset slow \
  -vf "scale=1280:720" -movflags +faststart "${OUTPUT_BASE}.mp4" \
  -y -loglevel warning -stats

# Generate WebM (VP9)
echo "2/3 Encoding WebM (VP9)..."
ffmpeg -i "$INPUT" -an -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -vf "scale=1280:720" "${OUTPUT_BASE}.webm" \
  -y -loglevel warning -stats

# Generate poster frame
echo "3/3 Extracting poster frame..."
ffmpeg -i "${OUTPUT_BASE}.mp4" -ss 00:00:02 -frames:v 1 -q:v 2 \
  "${OUTPUT_BASE}-poster.jpg" \
  -y -loglevel warning

echo ""
echo "✅ Done! Generated:"
ls -lh "${OUTPUT_BASE}.mp4" "${OUTPUT_BASE}.webm" "${OUTPUT_BASE}-poster.jpg"
echo ""
echo "📁 Move to public directory:"
echo "   mv ${OUTPUT_BASE}.* apps/web/public/video/"
