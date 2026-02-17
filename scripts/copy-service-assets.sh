#!/bin/bash

# copy-service-assets.sh
# Copies servable assets (videos, images) from content package into
# the Next.js public directory so they can be served as static files.
#
# Skips: service.json, raw-source.*, README.md, *.png (Gemini placeholders)
#
# This runs automatically as a prebuild step. The symlink approach
# doesn't work with SST's asset bundler (EISDIR error).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE="${REPO_ROOT}/packages/content/data/services"
DEST="${REPO_ROOT}/apps/web/public/content/services"

if [ ! -d "$SOURCE" ]; then
  echo "Error: Source directory not found: $SOURCE"
  exit 1
fi

# Remove old symlink or directory
if [ -L "$DEST" ]; then
  rm "$DEST"
elif [ -d "$DEST" ]; then
  rm -rf "$DEST"
fi

mkdir -p "$DEST"

# Copy only servable assets from each service folder
for SERVICE_DIR in "$SOURCE"/*/; do
  SERVICE_ID="$(basename "$SERVICE_DIR")"
  SERVICE_DEST="${DEST}/${SERVICE_ID}"
  mkdir -p "$SERVICE_DEST"

  # Copy video and image files, skip JSON/raw/docs
  for FILE in "$SERVICE_DIR"*.{webm,mp4,jpg}; do
    [ -f "$FILE" ] || continue
    BASENAME="$(basename "$FILE")"

    # Skip raw source videos
    case "$BASENAME" in
      raw-source*) continue ;;
    esac

    cp "$FILE" "$SERVICE_DEST/$BASENAME"
  done
done

echo "Copied service assets to $DEST"
ls -d "$DEST"/*/
