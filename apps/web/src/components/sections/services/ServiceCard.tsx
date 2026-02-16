"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ServiceIcon } from "./icons";
import { ServiceVideo } from "./ServiceVideo";
import { ChevronIcon } from "@/components/icons/ChevronIcon";
import type {
  ServiceCategory,
  SubService,
  ServiceLink,
} from "@ces/content/data/services";

interface ServiceCardProps {
  service: ServiceCategory;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function ServiceCard({
  service,
  isExpanded,
  onToggle,
  index,
}: ServiceCardProps) {
  // Track layout state separately to delay collapse
  const [layoutExpanded, setLayoutExpanded] = useState(isExpanded);

  useEffect(() => {
    if (isExpanded) {
      // Expand immediately
      setLayoutExpanded(true);
    } else {
      // Delay collapse until content fade completes (300ms)
      const timer = setTimeout(() => setLayoutExpanded(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <div
      className={`
        service-card relative overflow-hidden rounded-lg bg-black/40 backdrop-blur-sm
        border border-white/10 transition-all duration-500 ease-in-out
        ${layoutExpanded ? "col-span-1 sm:col-span-2 lg:col-span-3" : "col-span-1"}
      `}
    >
      {/* Card header - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-start gap-4 hover:bg-white/5 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`service-detail-${service.id}`}
      >
        {/* Icon */}
        <div className="w-12 h-12 flex-shrink-0">
          <ServiceIcon iconId={service.icon} active={isExpanded} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white">{service.title}</h3>
          <p className="text-sm text-white/70 mt-2 line-clamp-2">
            {service.shortDescription}
          </p>
        </div>

        {/* Expand/collapse indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 text-gold w-6 h-6"
        >
          <ChevronIcon className="w-full h-full" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            id={`service-detail-${service.id}`}
          >
            <div className="relative">
              {/* Video background */}
              <ServiceVideo video={service.video} isActive={isExpanded} />

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/60 z-1" />

              {/* Content grid — height varies by cardSize */}
              <div className={`relative z-2 px-6 pb-6 ${
                service.cardSize === "large" ? "pt-10 min-h-[400px]" :
                service.cardSize === "featured" ? "pt-12 min-h-[500px]" :
                "pt-8 min-h-[280px]"
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Column 1: Description */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-white leading-relaxed">
                      {service.longDescription}
                    </p>
                  </div>

                  {/* Column 2: Sub-services */}
                  <div>
                    <h4 className="text-sm font-semibold text-gold uppercase tracking-wide mb-3">
                      Services
                    </h4>
                    <ul className="space-y-2">
                      {service.subServices.map((sub: SubService, i: number) => (
                        <li key={i} className="text-sm text-white flex items-start gap-2">
                          <span className="text-gold mt-1">→</span>
                          <span>{sub.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Stats + Links + CTA */}
                  <div>
                    {/* Stats */}
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-gold">
                        {service.stats.metric}
                      </div>
                      <div className="text-sm text-white mt-1">
                        {service.stats.metricLabel}
                      </div>
                      <div className="text-xs text-white/80 mt-2">
                        {service.stats.secondary}
                      </div>
                    </div>

                    {/* Optional links */}
                    {service.links && service.links.length > 0 && (
                      <div className="mb-4 flex flex-col gap-2">
                        {service.links.map((link: ServiceLink, idx: number) => (
                          <a
                            key={idx}
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                            className={`
                              inline-flex items-center gap-2 text-sm font-medium transition-colors
                              ${
                                link.external
                                  ? "text-gold hover:text-gold/80"
                                  : "text-white hover:text-gold"
                              }
                            `}
                          >
                            {link.label}
                            {link.external ? (
                              <svg
                                className="w-4 h-4"
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
                            ) : (
                              <svg
                                className="w-4 h-4"
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
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* View Projects CTA */}
                    <a
                      href={`#portfolio?service=${service.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gold/20 border border-gold text-white font-medium text-sm hover:bg-gold hover:text-black transition-colors"
                    >
                      View Projects
                      <svg
                        className="w-4 h-4"
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
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
