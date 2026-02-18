// Innovation area data model for CES portfolio site
//
// Each area lives in its own folder: ./innovation/{id}/section-description.json
// Drop images, videos, and other assets alongside the JSON.
// Relative paths (e.g. "./bg.webm") in JSON are resolved to
// public-servable paths at load time: /content/innovation/{id}/bg.webm
// Absolute paths (starting with "/") are left untouched.
//
// To add a new area: create a new folder with an section-description.json file.
// The loader auto-discovers all subfolders — no manual imports needed.
// Display order is controlled by the `order` field in each JSON file.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types (safe to import from client components via `import type`)
// ---------------------------------------------------------------------------

export interface InnovationSubItem {
  label: string;
  slug: string;
}

export interface InnovationLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface InnovationImage {
  src: string;
  alt: string;
  caption?: string;
  /** true for animated GIFs — component uses <img> with loading="eager" */
  animated?: boolean;
}

export interface InnovationArea {
  id: string;
  slug: string;
  /** Manual display order (1-based). Loader sorts ascending by this field. */
  order: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  subItems: InnovationSubItem[];
  stats: {
    metric: string;
    metricLabel: string;
    secondary: string;
  };
  links?: InnovationLink[];
  video: {
    webm: string;
    mp4: string;
    mp4Mobile: string;
    poster: string;
    placeholder?: string;
  };
  /** Supplementary images / animated GIFs shown as media cards inside the slide */
  images: InnovationImage[];
}

// ---------------------------------------------------------------------------
// Dynamic loader — scans ./innovation/ for subfolders, reads section-description.json
// ---------------------------------------------------------------------------

/** Base path for serving innovation assets from Next.js public/ */
const PUBLIC_ASSET_BASE = "/content/innovation";

/**
 * Resolve relative paths (./bg.webm) to public-servable paths
 * (/content/innovation/{id}/bg.webm).
 * Absolute paths (starting with "/") are left untouched.
 */
function resolveAssetPaths(
  data: Record<string, unknown>,
  areaId: string
): Record<string, unknown> {
  const resolved = { ...data };

  // Resolve video fields
  if (resolved.video && typeof resolved.video === "object") {
    const video = { ...(resolved.video as Record<string, string>) };
    for (const key of Object.keys(video)) {
      if (typeof video[key] === "string" && video[key].startsWith("./")) {
        video[key] = `${PUBLIC_ASSET_BASE}/${areaId}/${video[key].slice(2)}`;
      }
    }
    resolved.video = video;
  }

  // Resolve images[].src fields
  if (Array.isArray(resolved.images)) {
    resolved.images = (resolved.images as Array<Record<string, unknown>>).map(
      (img) => {
        if (typeof img.src === "string" && img.src.startsWith("./")) {
          return {
            ...img,
            src: `${PUBLIC_ASSET_BASE}/${areaId}/${img.src.slice(2)}`,
          };
        }
        return img;
      }
    );
  }

  return resolved;
}

function findInnovationDir(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = join(dir, "packages/content/data/innovation");
    try {
      readdirSync(candidate);
      return candidate;
    } catch {
      dir = join(dir, "..");
    }
  }
  throw new Error(
    "Could not find packages/content/data/innovation/ — " +
      `searched from ${process.cwd()} up 5 levels`
  );
}

function loadAllInnovations(): InnovationArea[] {
  const innovationDir = findInnovationDir();

  const entries = readdirSync(innovationDir, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory());

  const areas = folders.map((folder) => {
    const folderPath = join(innovationDir, folder.name);
    const files = readdirSync(folderPath);
    const jsonFile = files.find((f) => f.endsWith(".json"));

    if (!jsonFile) {
      throw new Error(
        `No JSON file found in innovation/${folder.name}/. ` +
          `Each innovation folder must contain exactly one .json file.`
      );
    }

    const raw = readFileSync(join(folderPath, jsonFile), "utf-8");
    const data = JSON.parse(raw);
    const resolved = resolveAssetPaths(data, folder.name);

    return resolved as unknown as InnovationArea;
  });

  // Sort by manual order field (ascending) — folder discovery order is ignored
  return areas.sort((a, b) => a.order - b.order);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All innovation areas, loaded from ./innovation/{id}/*.json, sorted by order */
export const innovations: InnovationArea[] = loadAllInnovations();

export function getInnovationById(id: string): InnovationArea | undefined {
  return innovations.find((a) => a.id === id);
}

export function getInnovationBySlug(slug: string): InnovationArea | undefined {
  return innovations.find((a) => a.slug === slug);
}
