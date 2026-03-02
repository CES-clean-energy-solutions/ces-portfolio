#!/bin/bash

# copy-service-assets.sh
# Copies servable assets (videos, images) from content package into
# the Next.js public directory so they can be served as static files.
#
# Handles both services/ and innovation/ content folders.
# Skips: *.json, raw-source.*, README.md
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

# ---------------------------------------------------------------
# Innovation assets (images, videos)
# ---------------------------------------------------------------

INNO_SOURCE="${REPO_ROOT}/packages/content/data/innovation"
INNO_DEST="${REPO_ROOT}/apps/web/public/content/innovation"

if [ -d "$INNO_SOURCE" ]; then
  # Remove old
  if [ -L "$INNO_DEST" ]; then
    rm "$INNO_DEST"
  elif [ -d "$INNO_DEST" ]; then
    rm -rf "$INNO_DEST"
  fi

  mkdir -p "$INNO_DEST"

  for INNO_DIR in "$INNO_SOURCE"/*/; do
    INNO_ID="$(basename "$INNO_DIR")"
    INNO_DIR_DEST="${INNO_DEST}/${INNO_ID}"
    mkdir -p "$INNO_DIR_DEST"

    for FILE in "$INNO_DIR"*.{webm,mp4,jpg,jpeg,png,gif}; do
      [ -f "$FILE" ] || continue
      BASENAME="$(basename "$FILE")"

      case "$BASENAME" in
        raw-source*) continue ;;
      esac

      cp "$FILE" "$INNO_DIR_DEST/$BASENAME"
    done
  done

  echo "Copied innovation assets to $INNO_DEST"
  ls -d "$INNO_DEST"/*/
else
  echo "No innovation source directory found (skipping)"
fi
