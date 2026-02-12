// Server Component - Services section wrapper
import { services } from "@ces/content/data/services";
import { ServicesGrid } from "./services/ServicesGrid";

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative py-20 sm:py-28 lg:py-36 bg-black"
    >
      {/* Section header - server rendered, zero JS */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-16 sm:mb-20">
        <p className="text-sm uppercase tracking-wider text-gold/70 font-medium">
          Engineering Services
        </p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4">
          Comprehensive Solutions for{" "}
          <span className="text-gold">Sustainable Infrastructure</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-white/70">
          From energy audits to renewable integration, smart buildings to green
          finance — we deliver end-to-end engineering excellence across six core
          practice areas.
        </p>
      </div>

      {/* Services grid - client component with state */}
      <ServicesGrid services={services} />
    </section>
  );
}
