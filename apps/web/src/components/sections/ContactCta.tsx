"use client";

import { motion } from "motion/react";
import { Phone, Mail } from "lucide-react";

export default function ContactCta() {
  return (
    <section
      id="contact"
      className="bg-brand-black px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* Three-box layout: Contact Us (full width), Who We Are + How We Work (50% each) */}
        <div className="grid grid-cols-1 gap-8 md:gap-10">
          {/* Contact Us Box (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-2xl border-2 border-brand-gold/30 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-sm md:p-10 lg:p-12"
          >
            <h2 className="text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Contact Us
            </h2>

            <div className="mx-auto mt-8 max-w-2xl text-center">
              <p className="text-xl font-bold text-white sm:text-2xl">
                Dipl.-Ing. Klaus Kogler
              </p>
              <p className="mt-1 text-sm text-brand-gold">
                Buildings and Urban Development
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="tel:+4366460169232"
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-black transition-opacity hover:opacity-90"
                >
                  <Phone className="h-4 w-4" />
                  +43 664 601 692 32
                </a>
                <a
                  href="mailto:k.kogler@ic-ces.at"
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-brand-gold px-6 py-3 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10"
                >
                  <Mail className="h-4 w-4" />
                  k.kogler@ic-ces.at
                </a>
              </div>
            </div>
          </motion.div>

          {/* Two-column grid for Who We Are and How We Work */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            {/* Who We Are Box (Half Width on Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
            >
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                Who We Are
              </h3>
              <p className="mt-4 leading-relaxed text-white/80">
                CES clean energy solutions is a Vienna-based engineering and consulting firm, founded in 2009. We deliver integrated solutions for energy efficiency, renewable energy, sustainable buildings, and environmental engineering — from feasibility study through construction supervision and beyond.
                <br />
                <br />
                Working with partners within the iC group of companies spanning 850+ professionals across multiple disciplines, our clients get deep specialist knowledge in energy and environment backed by the full breadth of a multidisciplinary engineering organisation. One team, one point of responsibility.
                <br />
                <br />
                We work where the transition is happening. Our projects span Austria, Germany, Ukraine, the Western Balkans, Central Asia, and Saudi Arabia, with further experience in the Caribbean and West Africa. We partner with international financial institutions like the EBRD and NEFCO, the European Union, governments at every level, and private industry.
                <br />
                <br />
                Our competences cover five interconnected areas: Green Economy, Resource Efficiency & Circular Economy, Environmental & Social Compatibility, Sustainable Buildings, and Sustainable Energy & Plants.
              </p>
            </motion.div>

            {/* How We Work Box (Half Width on Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
            >
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                How We Work
              </h3>
              <p className="mt-4 leading-relaxed text-white/80">
                Complex problems demand integrative thinking. We involve all stakeholders early, map every boundary condition, and work through alternatives systematically before committing to a path. Our approach follows what we call the better way — three principles that guide our delivery.
                <br />
                <br />
                We solve systemically: identifying root causes and structural problems rather than applying short-term fixes. We stay ahead: actively tracking and adopting innovations from research, regulation, and market developments. And we deliver what works: feasible processes, methods, and tools that ensure transparency and measurable gain.
                <br />
                <br />
                Our services span the full project lifecycle — from R&D and project preparation through environmental and social assessment, detailed design, construction supervision, investment programme management, and sustainable urban certification.
                <br />
                <br />
                Whether supervising large-scale heat pumps in Vienna, managing EU-funded infrastructure reconstruction in Ukraine, or certifying buildings to LEED standards in Tbilisi, the method stays consistent: rigorous engineering, honest assessment, integrated delivery.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
