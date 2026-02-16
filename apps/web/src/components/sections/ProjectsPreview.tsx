"use client";

import { motion } from "motion/react";

// Reuse existing Gallery placeholder data — limited to 4
const PROJECTS = [
  { title: "Project Alpha", color: "oklch(0.2 0.02 85)" },
  { title: "Project Beta", color: "oklch(0.18 0.01 60)" },
  { title: "Project Gamma", color: "oklch(0.22 0.02 120)" },
  { title: "Project Delta", color: "oklch(0.17 0.01 200)" },
];

export function ProjectsPreview() {
  return (
    <section
      id="projects"
      className="bg-brand-black px-4 py-24 sm:px-6 md:py-32 lg:px-8 lg:py-40"
    >
      <div className="mx-auto mb-12 max-w-7xl md:mb-16 lg:mb-20">
        <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Projects
        </h2>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            className="w-full"
          >
            <div
              className="flex aspect-[3/2] items-end rounded-lg border border-border p-8 md:aspect-[4/3] lg:p-10"
              style={{ backgroundColor: project.color }}
            >
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                {project.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All link */}
      <div className="mx-auto mt-10 max-w-7xl text-center">
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded border border-gold/30 px-6 py-3 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10"
        >
          View All Projects
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
