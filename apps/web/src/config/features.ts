/**
 * Feature flags for page section visibility.
 *
 * Set a flag to `false` to remove a section from the page entirely.
 * Change the value and redeploy to toggle. All environments share these values.
 */

interface Features {
  hero: boolean;
  servicesBentoShowcase: boolean;
  servicesBento: boolean;
  servicesOverview: boolean;
  servicesShowcase: boolean;
  /** Legacy accordion card grid — disabled pending management sign-off */
  servicesCards: boolean;
  projectsPreview: boolean;
  contactCta: boolean;
}

export const features: Features = {
  hero: true,
  servicesBentoShowcase: false,
  servicesBento: true,
  servicesOverview: false,
  servicesShowcase: false,
  servicesCards: false,
  projectsPreview: false,
  contactCta: true,
} as const;
