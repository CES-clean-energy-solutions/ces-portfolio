import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { ServicesShowcase } from "@/components/sections/services/ServicesShowcase";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { ServicesSection } from "@/components/sections/ServicesSection";
import ContactCta from "@/components/sections/ContactCta";
import { services } from "@ces/content/data/services";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesOverview />
        <ServicesShowcase services={services} />
        <ProjectsPreview />
        <ServicesSection />
        <ContactCta />
      </main>
      <footer className="border-t border-border bg-brand-black px-4 py-8 text-center text-sm text-muted">
        &copy; {new Date().getFullYear()} CES Clean Energy Solutions
      </footer>
    </>
  );
}
