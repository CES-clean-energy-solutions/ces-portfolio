import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
import { features, serviceFlags } from "@/config/features";

const visibleInnovations = innovations.filter(
  (a) => serviceFlags[a.id as keyof typeof serviceFlags] !== false
);

export default function Home() {
  return (
    <>
      <Header innovations={visibleInnovations} />
      <main>
        {features.hero && <Hero />}
        {features.servicesBento && (
          <ServicesBento innovations={visibleInnovations} />
        )}
        {features.servicesBentoShowcase && (
          <ServicesBentoShowcase innovations={visibleInnovations} />
        )}
        {features.servicesOverview && <ServicesOverview />}
        {features.servicesShowcase && <ServicesShowcase services={services} />}
        {features.projectsPreview && <ProjectsPreview />}
        {features.servicesCards && <ServicesSection />}
        {features.contactCta && <ContactCta />}
      </main>
      <Footer />
    </>
  );
}
