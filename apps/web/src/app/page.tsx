import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Gallery from "@/components/sections/Gallery";
import Stats from "@/components/sections/Stats";
import ContactCta from "@/components/sections/ContactCta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <Stats />
        <ContactCta />
      </main>
      <footer className="border-t border-border bg-brand-black px-4 py-8 text-center text-sm text-muted">
        &copy; {new Date().getFullYear()} CES Clean Energy Solutions
      </footer>
    </>
  );
}
