"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { InnovationArea } from "@ces/content/data/innovation";
import { ServicesBentoCard } from "./ServicesBentoCard";
import { ServicesDetailModal } from "./ServicesDetailModal";

interface ServicesBentoProps {
  innovations: InnovationArea[];
}

export function ServicesBento({ innovations }: ServicesBentoProps) {
  const [selectedArea, setSelectedArea] = useState<InnovationArea | null>(null);

  return (
    <section
      id="services"
      className="bg-brand-black px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Innovative Services{" "}
            <span className="text-brand-gold">at CES</span>
          </h2>
        </motion.div>

        {/* Equal grid — flex-based so partial last row centers naturally */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          {innovations.map((area, i) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="w-full md:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.875rem)]"
            >
              <ServicesBentoCard
                area={area}
                onClick={() => setSelectedArea(area)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      <ServicesDetailModal
        area={selectedArea}
        open={selectedArea !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedArea(null);
        }}
      />
    </section>
  );
}
