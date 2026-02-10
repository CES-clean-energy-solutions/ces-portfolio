"use client";

import { motion } from "motion/react";

// PLACEHOLDER — replace with real service data
const SERVICES = [
  { title: "Energy Efficiency", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Sustainability", description: "Sed do eiusmod tempor incididunt ut labore et dolore magna." },
  { title: "Plant Engineering", description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
  { title: "Renewable Energy", description: "Duis aute irure dolor in reprehenderit in voluptate velit." },
  { title: "Building Technology", description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa." },
  { title: "Research & Development", description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur." },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Services() {
  return (
    <section
      id="services"
      className="bg-[#0a0a0a] px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* PLACEHOLDER — replace with real heading */}
        <h2 className="mb-12 text-3xl font-bold text-white md:mb-16 md:text-4xl lg:text-5xl">
          Services
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="rounded-lg border border-border bg-secondary p-6 md:p-8"
            >
              <h3 className="mb-3 text-lg font-semibold text-brand-gold">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
