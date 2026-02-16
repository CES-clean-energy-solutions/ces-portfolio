"use client";

import { motion } from "motion/react";
import { services } from "@ces/content/data/services";
import Link from "next/link";

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
        <h2 className="mb-12 text-3xl font-bold text-white md:mb-16 md:text-4xl lg:text-5xl">
          Services
        </h2>

        <div className="grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {services.map((service, i) => (
            <motion.article
              key={service.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className={`group relative overflow-hidden rounded-lg border border-border bg-secondary p-6 md:p-8 ${
                service.cardSize === "large" ? "md:row-span-2" : "md:row-span-1"
              } ${service.cardSize === "featured" ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              {/* Video Background (future enhancement) */}
              {/* <video className="absolute inset-0 h-full w-full object-cover opacity-20" ... /> */}

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-4">
                  <h3 className="mb-1 text-xl font-semibold text-brand-gold md:text-2xl">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/70">{service.titleDe}</p>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-muted md:text-base">
                  {service.shortDescription}
                </p>

                {/* Stats */}
                <div className="mb-6 rounded-md bg-black/30 p-4">
                  <div className="text-3xl font-bold text-brand-gold">
                    {service.stats.metric}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {service.stats.metricLabel}
                  </div>
                  {service.stats.secondary && (
                    <div className="mt-2 text-xs text-muted">
                      {service.stats.secondary}
                    </div>
                  )}
                </div>

                {/* Sub-services */}
                <div className="mb-4 flex-1">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Capabilities
                  </h4>
                  <ul className="space-y-1 text-sm text-muted">
                    {service.subServices.slice(0, 4).map((sub) => (
                      <li key={sub.slug} className="flex items-start">
                        <span className="mr-2 mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-brand-gold" />
                        {sub.label}
                      </li>
                    ))}
                    {service.subServices.length > 4 && (
                      <li className="text-xs text-muted-foreground">
                        +{service.subServices.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>

                {/* Links (if available) */}
                {service.links && service.links.length > 0 && (
                  <div className="mt-auto pt-4">
                    {service.links.map((link) =>
                      link.external ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-brand-gold hover:underline"
                        >
                          {link.label}
                          <svg
                            className="ml-1 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center text-sm text-brand-gold hover:underline"
                        >
                          {link.label}
                          <svg
                            className="ml-1 h-3 w-3"
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
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
