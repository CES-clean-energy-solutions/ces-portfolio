/**
 * Feature flags for page section visibility.
 *
 * Set a flag to `false` to remove a section from the page entirely.
 * Change the value and redeploy to toggle. All environments share these values.
 */

interface Features {
  hero: boolean;
  innovationShowcase: boolean;
  servicesOverview: boolean;
  servicesShowcase: boolean;
  /** Legacy accordion card grid — disabled pending management sign-off */
  servicesCards: boolean;
  projectsPreview: boolean;
  contactCta: boolean;
}

export const features: Features = {
  hero: true,
  innovationShowcase: true,
  servicesOverview: true,
  servicesShowcase: true,
  servicesCards: false, // disabled: awaiting management sign-off on new services UI
  projectsPreview: true,
  contactCta: true,
} as const;
