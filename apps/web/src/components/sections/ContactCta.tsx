"use client";

import { motion } from "motion/react";
import { Phone, Mail } from "lucide-react";

export default function ContactCta() {
  return (
    <section
      id="contact"
      className="bg-brand-black px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl font-bold text-white md:text-4xl lg:text-5xl"
        >
          Your Contact Person
        </motion.h2>

        {/* Contact card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
        >
          <p className="text-xl font-bold text-white sm:text-2xl">
            Dipl.-Ing. Klaus Kogler
          </p>
          <p className="mt-1 text-sm text-brand-gold">
            Buildings and Urban Development
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="tel:+4366460169232"
              className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-brand-gold px-5 py-3 text-sm font-semibold text-brand-black transition-opacity hover:opacity-90"
            >
              <Phone className="h-4 w-4" />
              +43 664 601 692 32
            </a>
            <a
              href="mailto:k.kogler@ic-ces.at"
              className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-brand-gold px-5 py-3 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/10"
            >
              <Mail className="h-4 w-4" />
              k.kogler@ic-ces.at
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
