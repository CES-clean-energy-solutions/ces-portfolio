import { ServiceIcon } from "./icons";
import { ServiceVideo } from "./ServiceVideo";
import type {
  ServiceCategory,
  SubService,
  ServiceLink,
} from "@ces/content/data/services";

interface ServiceSlideProps {
  service: ServiceCategory;
  isActive: boolean;
}

export function ServiceSlide({ service, isActive }: ServiceSlideProps) {
  return (
    <div className="absolute inset-0 flex items-center">
      {/* Video background */}
      <ServiceVideo video={service.video} isActive={isActive} />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Icon + Title */}
        <div className="mb-8 flex items-start gap-4">
          <div className="h-14 w-14 flex-shrink-0 lg:h-16 lg:w-16">
            <ServiceIcon iconId={service.icon} active={true} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {service.title}
            </h3>
            <p className="mt-1 text-base text-white/40 lg:text-lg">
              {service.titleDe}
            </p>
          </div>
        </div>

        {/* 3-column content grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {/* Column 1: Long description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="leading-relaxed text-white/90">
              {service.longDescription}
            </p>
          </div>

          {/* Column 2: Sub-services */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">
              Services
            </h4>
            <ul className="space-y-2">
              {service.subServices.map((sub: SubService) => (
                <li
                  key={sub.slug}
                  className="flex items-start gap-2 text-sm text-white"
                >
                  <span className="mt-1 text-gold">→</span>
                  <span>{sub.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Stats + Links */}
          <div>
            {/* Stats */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-gold">
                {service.stats.metric}
              </div>
              <div className="mt-1 text-sm text-white">
                {service.stats.metricLabel}
              </div>
              <div className="mt-2 text-xs text-white/80">
                {service.stats.secondary}
              </div>
            </div>

            {/* Links */}
            {service.links && service.links.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {service.links.map((link: ServiceLink, idx: number) => (
                  <a
                    key={idx}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                      link.external
                        ? "text-gold hover:text-gold/80"
                        : "text-white hover:text-gold"
                    }`}
                  >
                    {link.label}
                    {link.external ? (
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
