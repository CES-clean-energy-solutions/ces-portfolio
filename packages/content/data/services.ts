// Service data model for CES portfolio site
// JSON files are the source of truth — edit individual files in ./services/

// Auto-load all service JSON files
import energyEfficiency from "./services/energy-efficiency.json";
import renewableEnergy from "./services/renewable-energy.json";
import plantEngineering from "./services/plant-engineering.json";
import innovativeBuilding from "./services/innovative-building.json";
import researchDevelopment from "./services/research-development.json";
import greenFinance from "./services/green-finance.json";

export interface SubService {
  label: string;
  slug: string; // for future dedicated sub-service pages
}

export interface ServiceLink {
  label: string; // e.g. "Detail Page", "Live Demo", "Interactive Model"
  href: string; // internal route or external URL
  external?: boolean; // true for external URLs (opens in new tab)
}

export type CardSize = "standard" | "large" | "featured";

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  titleDe: string; // German subtitle for visual texture
  icon: string; // reference to SVG component name
  cardSize: CardSize; // visual prominence in grid layout
  shortDescription: string; // 1 sentence, visible in collapsed state on desktop
  longDescription: string; // 2-3 sentences, visible in expanded state
  subServices: SubService[];
  stats: {
    metric: string; // e.g. "120+"
    metricLabel: string; // e.g. "projects"
    secondary: string; // e.g. "40% avg. energy reduction"
  };
  relatedProjectSlugs: string[]; // links to portfolio items
  links?: ServiceLink[]; // optional array of related pages/demos
  video: {
    webm: string; // "/video/services/renewable-energy-bg.webm"
    mp4: string; // "/video/services/renewable-energy-bg.mp4"
    mp4Mobile: string; // "/video/services/renewable-energy-bg-mobile.mp4"
    poster: string; // "/video/services/renewable-energy-poster.jpg"
    placeholder?: string; // base64 data URI for blur-up
  };
}

// Type-safe service array (TypeScript validates JSON structure at build time)
export const services: ServiceCategory[] = [
  energyEfficiency,
  renewableEnergy,
  plantEngineering,
  innovativeBuilding,
  researchDevelopment,
  greenFinance,
] as ServiceCategory[];

// Helper to get service by ID or slug
export function getServiceById(id: string): ServiceCategory | undefined {
  return services.find((s) => s.id === id);
}

export function getServiceBySlug(slug: string): ServiceCategory | undefined {
  return services.find((s) => s.slug === slug);
}
