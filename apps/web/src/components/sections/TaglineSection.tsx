"use client";

import Image from "next/image";
import { motion } from "motion/react";
import cesChevron from "@repo/ui/assets/ces-chevron-no-pad.svg";

export default function TaglineSection() {
  return (
    <section className="w-full bg-brand-black px-8 py-4">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-center text-xl font-light text-white lg:text-2xl">
          <p className="leading-relaxed">
            <span className="font-semibold text-brand-gold">CES</span> is turning engineering expertise into custom software. Decades of domain knowledge into tools that work fast.
          </p>
          <p className="mt-3 leading-relaxed">
            Besides the engineering and consultancy services, we are ready to support your business leveraging via cutting-edge software delivery.
          </p>
          <p className="mt-3 leading-relaxed">
            Stay tuned to this site for new developments.{" "}
            <Image
              src={cesChevron}
              alt=""
              className="inline h-[1em] w-auto align-middle"
              priority={false}
            />
          </p>
        </div>
      </motion.div>
    </section>
  );
}
