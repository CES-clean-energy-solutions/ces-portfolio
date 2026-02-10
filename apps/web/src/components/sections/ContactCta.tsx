"use client";

import { motion } from "motion/react";

// PLACEHOLDER — replace with real content
const HEADLINE = "Let's Build Something";
const BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

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
          {HEADLINE}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
        >
          {BODY}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="mt-10"
        >
          <button className="min-h-11 min-w-11 rounded-md bg-brand-gold px-8 py-3 text-sm font-semibold text-brand-black transition-opacity hover:opacity-90">
            Contact Us
          </button>
        </motion.div>
      </div>
    </section>
  );
}
