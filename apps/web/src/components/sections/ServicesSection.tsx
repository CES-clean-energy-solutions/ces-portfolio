// Server Component - Services card grid (PLACEHOLDER — relocated to end of page)
import { services } from "@ces/content/data/services";
import { ServicesGrid } from "./services/ServicesGrid";

export function ServicesSection() {
  return (
    <section
      id="services-cards"
      className="relative py-20 sm:py-28 lg:py-36 bg-black"
    >
      {/* Placeholder banner */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-10">
        <div className="rounded bg-yellow-500/20 px-4 py-2 text-sm font-mono text-yellow-400">
          PLACEHOLDER — Section under review by management
        </div>
      </div>

      {/* Services grid - client component with state */}
      <ServicesGrid services={services} />
    </section>
  );
}
