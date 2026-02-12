"use client";
import { useState, useCallback } from "react";
import { ServiceCard } from "./ServiceCard";
import type { ServiceCategory } from "@ces/content/data/services";

interface ServicesGridProps {
  services: ServiceCategory[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transition-all duration-300">
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            isExpanded={expandedId === service.id}
            onToggle={() => handleToggle(service.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
