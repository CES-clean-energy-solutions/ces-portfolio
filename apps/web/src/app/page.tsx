import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import { ServicesShowcase as ServicesBentoShowcase } from "@/components/sections/services-bento/ServicesShowcase";
import { ServicesBento } from "@/components/sections/services-bento/ServicesBento";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { ServicesShowcase } from "@/components/sections/services/ServicesShowcase";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { ServicesSection } from "@/components/sections/ServicesSection";
import ContactCta from "@/components/sections/ContactCta";
import { services } from "@ces/content/data/services";
import { innovations } from "@ces/content/data/innovation";
import { features } from "@/config/features";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {features.hero && <Hero />}
        {features.servicesBento && (
          <ServicesBento innovations={innovations} />
        )}
        {features.servicesBentoShowcase && (
          <ServicesBentoShowcase innovations={innovations} />
        )}
        {features.servicesOverview && <ServicesOverview />}
        {features.servicesShowcase && <ServicesShowcase services={services} />}
        {features.projectsPreview && <ProjectsPreview />}
        {features.servicesCards && <ServicesSection />}
        {features.contactCta && <ContactCta />}
      </main>
      <footer className="border-t border-border bg-brand-black px-4 py-8 text-center text-sm text-muted">
        &copy; {new Date().getFullYear()} CES Clean Energy Solutions
      </footer>
    </>
  );
}
