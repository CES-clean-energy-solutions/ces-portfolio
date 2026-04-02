"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Send } from "lucide-react";

export default function ContactCta() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${company} about Innovative Services at CES`);
    const body = encodeURIComponent(
      `Name: ${name}\nE-Mail: ${email}\nMobile: ${mobile}\nCompany: ${company}\n\n${message}`
    );
    window.location.href = `mailto:office@ic-ces.at?subject=${subject}&body=${body}`;
  }

  return (
    <section
      className="bg-brand-black px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:gap-10">
          {/* Who We Are + How We Work (above contact) */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            {/* Who We Are */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
            >
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                Who We Are
              </h3>
              <p className="mt-4 leading-relaxed text-white/80">
                CES clean energy solutions is a Vienna-based company for technical consulting and advanced engineering solutions, founded in 2008. We deliver integrated innovative solutions for energy efficiency, renewable energy, sustainable buildings, and environmental engineering.
                <br />
                <br />
                Being a strong partner within the international iC group of companies' networks - well-known for spanning more than 850+ professionals across multiple disciplines, allows our clients to get access to a broad specialist knowledge backed by the full breadth of a multidisciplinary engineering organisation. One team, one vision, one clear responsibility.
                <br />
                <br />
                We work on a global scale by having international project presence in Austria, Germany, Ukraine, the Western Balkans, Central Asia, and Saudi Arabia, as well as experience in the Caribbean and West Africa. International financial institutions like the World Bank, IFC, EBRD, KfW, the European Union, as well as national governments, and private industry belong to our long-term clients.
                <br />
                <br />
                Our engineering competences cover four interconnected areas within the frame of the Green Economy Transition: [1] Resource Efficiency &amp; Circular Economy [2] Environmental &amp; Social Compatibility [3] Sustainable Buildings, and [4] Energy &amp; Plants.
              </p>
            </motion.div>

            {/* How We Work */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
            >
              <h3 className="text-2xl font-bold text-white md:text-3xl">
                How We Work
              </h3>
              <p className="mt-4 leading-relaxed text-white/80">
                <strong className="text-white">Systems Thinking:</strong> complex topics demand a strong integrative thinking. We involve all relevant stakeholders from the beginning, consider every boundary condition, and work systematically through all possible alternatives, before committing to the desired path.
                <br />
                <br />
                <strong className="text-white">We work systemically</strong>: by identifying root causes and structural problems rather than just applying short-term fixes. We stay ahead: actively tracking and adopting innovations from research, applying regulations, and current market developments.
                <br />
                <br />
                <strong className="text-white">Our services span the full project lifecycle</strong>: from R&amp;D and project preparation through environmental and social assessment, detailed design, construction supervision, investment programme management, and sustainable urban certifications.
                <br />
                <br />
                Regardless of the project size, we deliver professional and integrated solutions.
              </p>
            </motion.div>
          </div>

          {/* Contact Us Box (Full Width, now last) */}
          <motion.div
            id="contact"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="scroll-mt-24 rounded-2xl border-2 border-brand-gold/30 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl backdrop-blur-sm md:p-10 lg:p-12"
          >
            <h2 className="text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Contact Us
            </h2>

            <div className="mx-auto mt-8 max-w-2xl">
              <p className="text-center text-xl font-bold text-white sm:text-2xl">
                <span className="text-brand-gold">CES</span> clean energy solutions GesmbH
              </p>
              <p className="mt-2 text-center text-sm text-white/70">
                Schönbrunner Straße 297, 1120 Vienna, Austria
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-white/70">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-white/70">
                    E-Mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-mobile" className="mb-1 block text-sm font-medium text-white/70">
                    Mobile
                  </label>
                  <input
                    id="contact-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+43 123 456 789"
                    className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-company" className="mb-1 block text-sm font-medium text-white/70">
                    Company
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-white/70">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-brand-gold focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-black transition-opacity hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Send Email
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-white/50">
                or email us directly at{" "}
                <a
                  href="mailto:office@ic-ces.at"
                  className="text-brand-gold underline underline-offset-2 hover:opacity-80"
                >
                  office@ic-ces.at
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
