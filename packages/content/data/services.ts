// Service data model for CES portfolio site

export interface SubService {
  label: string;
  slug: string; // for future dedicated sub-service pages
}

export interface ServiceLink {
  label: string; // e.g. "Detail Page", "Live Demo", "Interactive Model"
  href: string; // internal route or external URL
  external?: boolean; // true for external URLs (opens in new tab)
}

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  titleDe: string; // German subtitle for visual texture
  icon: string; // reference to SVG component name
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

// All 6 CES service categories
export const services: ServiceCategory[] = [
  {
    id: "energy-efficiency",
    slug: "energy-efficiency-management",
    title: "Energy Efficiency & Management",
    titleDe: "Energieeffizienz & Management",
    icon: "energy-efficiency",
    shortDescription:
      "Comprehensive energy audits and optimization strategies for industrial facilities, buildings, and infrastructure.",
    longDescription:
      "We analyze energy consumption patterns across industrial facilities, electrical systems, buildings, and airports to identify optimization opportunities. Our holistic approach combines technical audits with economic modeling to deliver measurable efficiency gains that improve both operational performance and environmental impact.",
    subServices: [
      { label: "Industrial Facilities", slug: "industrial-facilities" },
      { label: "Electrical Systems", slug: "electrical-systems" },
      { label: "Buildings & Urban Infrastructure", slug: "buildings-urban" },
      { label: "Airports", slug: "airports" },
    ],
    stats: {
      metric: "120+",
      metricLabel: "projects completed",
      secondary: "40% avg. energy reduction",
    },
    relatedProjectSlugs: [],
    video: {
      webm: "/video/hero-bg.webm",
      mp4: "/video/hero-bg.mp4",
      mp4Mobile: "/video/hero-bg.mp4", // using desktop version for now (660KB)
      poster: "/video/hero-poster.jpg",
    },
  },
  {
    id: "renewable-energy",
    slug: "renewable-energy",
    title: "Renewable Energy",
    titleDe: "Erneuerbare Energie",
    icon: "renewable-energy",
    shortDescription:
      "Design and integration of photovoltaic, solar thermal, geothermal, wind, hydro, and biomass energy systems.",
    longDescription:
      "From rooftop solar installations to large-scale wind farms, we provide end-to-end renewable energy solutions. Our multidisciplinary team handles feasibility studies, system design, grid integration, and performance monitoring to ensure optimal renewable energy deployment across diverse environments and scales.",
    subServices: [
      { label: "Photovoltaics", slug: "photovoltaics" },
      { label: "Solar Thermal", slug: "solar-thermal" },
      { label: "Geothermal", slug: "geothermal" },
      { label: "Wind & Hydropower", slug: "wind-hydro" },
      { label: "Biogas / Biomass / Biofuel", slug: "biogas-biomass" },
    ],
    stats: {
      metric: "850 MW",
      metricLabel: "renewable capacity planned",
      secondary: "35+ countries",
    },
    relatedProjectSlugs: [],
    links: [
      {
        label: "Solar Calculator Demo",
        href: "/demos/solar-calculator",
        external: false,
      },
    ],
    video: {
      webm: "/video/hero-bg.webm",
      mp4: "/video/hero-bg.mp4",
      mp4Mobile: "/video/hero-bg.mp4",
      poster: "/video/hero-poster.jpg",
    },
  },
  {
    id: "plant-engineering",
    slug: "plant-engineering",
    title: "Plant Engineering",
    titleDe: "Anlagentechnik",
    icon: "plant-engineering",
    shortDescription:
      "Integrated design of district heating/cooling, industrial facilities, utilities, cogeneration, and treatment plants.",
    longDescription:
      "We engineer complex energy and utility infrastructure from concept through commissioning. Our expertise spans district energy networks, industrial process facilities, combined heat and power systems, and water treatment plants — delivering integrated solutions that optimize resource efficiency and operational reliability.",
    subServices: [
      { label: "District Heating & Cooling", slug: "district-heating" },
      { label: "Industrial Facilities", slug: "industrial" },
      { label: "Utilities Supply / Discharge", slug: "utilities" },
      { label: "Cogeneration / Trigeneration", slug: "cogeneration" },
      { label: "Sewage Treatment Plants", slug: "sewage-treatment" },
    ],
    stats: {
      metric: "2.5 GW",
      metricLabel: "thermal capacity engineered",
      secondary: "50+ cities served",
    },
    relatedProjectSlugs: [],
    video: {
      webm: "/video/hero-bg.webm",
      mp4: "/video/hero-bg.mp4",
      mp4Mobile: "/video/hero-bg.mp4",
      poster: "/video/hero-poster.jpg",
    },
  },
  {
    id: "innovative-building",
    slug: "innovative-building-technology",
    title: "Innovative Building Technology",
    titleDe: "Innovative Gebäudetechnik",
    icon: "innovative-building",
    shortDescription:
      "Passive House design, autarch energy systems, advanced building management, and BIM coordination.",
    longDescription:
      "We push the boundaries of building performance through passive design principles, autonomous energy systems, intelligent automation, and digital modeling. Our BIM-centric approach ensures seamless coordination across disciplines while our focus on Passive House standards delivers buildings that consume 90% less energy than conventional construction.",
    subServices: [
      { label: "Passive House", slug: "passive-house" },
      { label: "Autarch Energy Systems", slug: "autarch-energy" },
      { label: "Building Management Systems", slug: "bms" },
      { label: "BIM", slug: "bim" },
    ],
    stats: {
      metric: "180+",
      metricLabel: "certified Passive House projects",
      secondary: "15 kWh/m²/yr avg. consumption",
    },
    relatedProjectSlugs: [],
    links: [
      {
        label: "BIM Viewer Demo",
        href: "/demos/bim-viewer",
        external: false,
      },
    ],
    video: {
      webm: "/video/hero-bg.webm",
      mp4: "/video/hero-bg.mp4",
      mp4Mobile: "/video/hero-bg.mp4",
      poster: "/video/hero-poster.jpg",
    },
  },
  {
    id: "research-development",
    slug: "research-development",
    title: "Research & Development",
    titleDe: "Forschung & Entwicklung",
    icon: "research-development",
    shortDescription:
      "Urban AI, circular economy, energy storage, carbon capture, and EU/international grant applications.",
    longDescription:
      "Our R&D practice drives innovation at the intersection of urban systems, sustainable materials, and advanced energy technologies. We lead research projects on AI-optimized city infrastructure, bio-economy integration, next-generation storage, and carbon capture — securing competitive EU and international funding for breakthrough solutions.",
    subServices: [
      { label: "Urban AI", slug: "urban-ai" },
      { label: "Circularity & Bio Economy", slug: "circularity" },
      { label: "Storage Technologies", slug: "storage" },
      { label: "Carbon Capture", slug: "carbon-capture" },
      { label: "EU & International Grants", slug: "grants" },
    ],
    stats: {
      metric: "€45M",
      metricLabel: "research funding secured",
      secondary: "20+ active projects",
    },
    relatedProjectSlugs: [],
    links: [
      {
        label: "Urban AI Notebook",
        href: "https://marimo.ces.engineering/urban-ai",
        external: true,
      },
    ],
    video: {
      webm: "/video/hero-bg.webm",
      mp4: "/video/hero-bg.mp4",
      mp4Mobile: "/video/hero-bg.mp4",
      poster: "/video/hero-poster.jpg",
    },
  },
  {
    id: "green-finance",
    slug: "sustainability-green-finance",
    title: "Sustainability & Green Finance",
    titleDe: "Nachhaltigkeit & Green Finance",
    icon: "green-finance",
    shortDescription:
      "LEED/BREEAM/DGNB certification, ESIA, nature-based solutions, IFI grant applications, and ESG reporting.",
    longDescription:
      "We bridge the gap between sustainable design and financial viability through comprehensive certification services, environmental impact assessments, and grant acquisition support. Our expertise in international sustainability frameworks and financing mechanisms helps clients access green capital while demonstrating measurable environmental and social impact.",
    subServices: [
      {
        label: "LEED / BREEAM / Estidama / DGNB Certification",
        slug: "certification",
      },
      { label: "ESIA", slug: "esia" },
      { label: "Nature-Based Solutions", slug: "nature-based" },
      { label: "IFI Grant Applications", slug: "ifi-grants" },
      { label: "Compliance & Reporting", slug: "compliance" },
    ],
    stats: {
      metric: "300+",
      metricLabel: "certified sustainable projects",
      secondary: "€1.2B green financing enabled",
    },
    relatedProjectSlugs: [],
    video: {
      webm: "/video/hero-bg.webm",
      mp4: "/video/hero-bg.mp4",
      mp4Mobile: "/video/hero-bg.mp4",
      poster: "/video/hero-poster.jpg",
    },
  },
];
