// Service data model for CES portfolio site
//
// Each service lives in its own folder: ./services/{id}/service.json
// Drop images, videos, and other assets alongside the JSON.
// Relative paths (e.g. "./bg.webm") in JSON are resolved to
// public-servable paths at load time: /content/services/{id}/bg.webm
//
// To add a new service: create a new folder with a service.json file.
// The loader auto-discovers all subfolders — no manual imports needed.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types (safe to import from client components via `import type`)
// ---------------------------------------------------------------------------

export interface SubService {
  label: string;
  slug: string;
}

export interface ServiceLink {
  label: string;
  href: string;
  external?: boolean;
}

export type CardSize = "standard" | "large" | "featured";

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  titleDe: string;
  icon: string;
  cardSize: CardSize;
  shortDescription: string;
  longDescription: string;
  subServices: SubService[];
  stats: {
    metric: string;
    metricLabel: string;
    secondary: string;
  };
  relatedProjectSlugs: string[];
  links?: ServiceLink[];
  video: {
    webm: string;
    mp4: string;
    mp4Mobile: string;
    poster: string;
    placeholder?: string;
  };
}

// ---------------------------------------------------------------------------
// Dynamic loader — scans ./services/ for subfolders, reads service.json
// ---------------------------------------------------------------------------

/** Base path for serving service assets from Next.js public/ */
const PUBLIC_ASSET_BASE = "/content/services";

/**
 * Resolve relative paths (./bg.webm) to public-servable paths
 * (/content/services/energy-efficiency/bg.webm).
 * Absolute paths are left untouched.
 */
function resolveAssetPaths(
  data: Record<string, unknown>,
  serviceId: string
): Record<string, unknown> {
  const resolved = { ...data };

  if (resolved.video && typeof resolved.video === "object") {
    const video = { ...(resolved.video as Record<string, string>) };
    for (const key of Object.keys(video)) {
      if (typeof video[key] === "string" && video[key].startsWith("./")) {
        video[key] = `${PUBLIC_ASSET_BASE}/${serviceId}/${video[key].slice(2)}`;
      }
    }
    resolved.video = video;
  }

  return resolved;
}

function findServicesDir(): string {
  // Walk up from cwd to find the monorepo root containing packages/content.
  // process.cwd() can be apps/web/ (Next.js build) or the repo root (turbo).
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = join(dir, "packages/content/data/services");
    try {
      readdirSync(candidate);
      return candidate;
    } catch {
      dir = join(dir, "..");
    }
  }
  throw new Error(
    "Could not find packages/content/data/services/ — " +
      `searched from ${process.cwd()} up 5 levels`
  );
}

function loadAllServices(): ServiceCategory[] {
  const servicesDir = findServicesDir();

  const entries = readdirSync(servicesDir, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return folders.map((folder) => {
    const folderPath = join(servicesDir, folder.name);
    const files = readdirSync(folderPath);
    const jsonFile = files.find((f) => f.endsWith(".json"));

    if (!jsonFile) {
      throw new Error(
        `No JSON file found in services/${folder.name}/. ` +
          `Each service folder must contain exactly one .json file.`
      );
    }

    const raw = readFileSync(join(folderPath, jsonFile), "utf-8");
    const data = JSON.parse(raw);
    const resolved = resolveAssetPaths(data, folder.name);

    return resolved as unknown as ServiceCategory;
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/** All service categories, loaded from ./services/{id}/service.json */
export const services: ServiceCategory[] = loadAllServices();

export function getServiceById(id: string): ServiceCategory | undefined {
  return services.find((s) => s.id === id);
}

export function getServiceBySlug(slug: string): ServiceCategory | undefined {
  return services.find((s) => s.slug === slug);
}
