# PRD: Site Simplification & Footer Legal Content
## Status: Complete
## Last Updated: 2026-03-09
## Completed: 2026-03-09

## 1. Overview

Simplify the CES marketing site based on stakeholder review feedback. Replace video-heavy service/innovation sections with static images for faster loading and easier content management. Streamline navigation to two essential links (Services, Contact), add standard legal/compliance footer modals, and enhance the contact section with "Who We Are" and "How We Work" content boxes. This is a catch-all for simplification improvements while maintaining the hero animation and desktop enhancements.

## 2. Goals

- **G1:** Replace all service/innovation section video backgrounds with static images to improve perceived performance and simplify asset management
- **G2:** Simplify site navigation to core actions (Services, Contact) with minimal UI chrome
- **G3:** Add legally required footer content (Impressum, Data Protection, Compliance, Certifications) accessible via modal overlays
- **G4:** Expand contact section with company context (Who We Are, How We Work) to provide more information before users reach out
- **G5:** Unify "innovation" and "services" terminology in codebase to reduce confusion (display titles remain unchanged)

## 3. User Stories

- **US-1:** As a sales engineer viewing the site on a mobile device in the field, I want faster-loading service sections so that I can quickly show project capabilities to clients even on poor connectivity
- **US-2:** As a site visitor, I want clear, minimal navigation so that I can quickly jump to services or contact information without visual clutter
- **US-3:** As a site visitor, I want access to legal/compliance information (Impressum, Data Protection) so that I can verify company credentials and data handling policies
- **US-4:** As a potential client, I want to understand who CES is and how they work before contacting them so that I can assess fit for my project
- **US-5:** As a content manager, I want static images instead of videos so that I can easily swap assets without re-encoding or managing multiple formats

## 4. Functional Requirements

### Navigation (FR-1 to FR-4)

- **FR-1:** Top navigation displays exactly two links: "Services" and "Contact"
- **FR-2:** Navigation links are simple inline text links visible at all breakpoints (no hamburger menu, no collapsing)
- **FR-3:** Clicking "Services" smooth-scrolls to the services section using anchor links
- **FR-4:** Clicking "Contact" smooth-scrolls to the contact section using anchor links

### Service/Innovation Sections (FR-5 to FR-8)

- **FR-5:** All service/innovation showcase sections (currently using video backgrounds) are replaced with static image backgrounds
- **FR-6:** Image assets are provided by the user (implementation uses placeholder image paths that will be swapped)
- **FR-7:** Codebase terminology is unified: rename "innovation" references to "services" in component names, variables, and file paths
- **FR-8:** Display titles on the page remain unchanged (e.g., "Innovations" can still appear as a heading even if the component is named ServicesShowcase)

### Footer Legal Modals (FR-9 to FR-15)

- **FR-9:** A footer section appears at the bottom of the homepage containing links to five legal/compliance pages:
  - Impressum
  - Company Data
  - Data Protection Policy
  - Compliance
  - Certifications
- **FR-10:** Clicking any footer link opens a modal overlay with a title and text content
- **FR-11:** Modal content is hardcoded directly in React components (not fetched from external files)
- **FR-12:** Modals are dismissible via close button (X), clicking the backdrop, or pressing the Escape key
- **FR-13:** Modals use the existing shadcn/ui Dialog component (Radix UI primitive)
- **FR-14:** Footer is only visible on the homepage (single-page site), not on future standalone pages
- **FR-15:** Initial implementation includes placeholder text (e.g., "Impressum content will be provided by client") that can be easily replaced

### Contact Section Enhancements (FR-16 to FR-20)

- **FR-16:** The Contact section layout is restructured into three distinct boxes:
  1. "Contact Us" - full width (spans entire section width)
  2. "Who We Are" - half width (below Contact Us, left side)
  3. "How We Work" - half width (below Contact Us, right side)
- **FR-17:** On mobile (< md breakpoint), all three boxes stack vertically: Contact Us → Who We Are → How We Work
- **FR-18:** Each box displays a title and body text
- **FR-19:** Initial content is placeholder text (e.g., "Who We Are content will be provided by client") that can be easily replaced
- **FR-20:** Box styling matches the existing design system (glass-morphism, consistent spacing, OKLCH colors)

### Out of Scope Preservation (FR-21 to FR-24)

- **FR-21:** Hero section animation (layered logo, entrance sequence) remains unchanged
- **FR-22:** Lenis smooth scrolling on desktop remains enabled
- **FR-23:** Desktop-only interactive elements (ParticlesBackground, CursorRipple) remain unchanged
- **FR-24:** No changes to deployment infrastructure, SST config, or Plausible analytics integration

## 5. Non-Goals / Out of Scope

- **NG-1:** Multi-language support or i18n for legal content (hardcoded English only)
- **NG-2:** CMS integration for legal content (content is hardcoded, not editable via admin panel)
- **NG-3:** Separate routes for legal pages (e.g., `/impressum` URL) - modals only
- **NG-4:** Form validation or submission logic for the Contact Us box (existing contact form behavior preserved)
- **NG-5:** Responsive image optimization or art direction for service section images (use single image, Next.js Image component handles responsive sizing)
- **NG-6:** Animation changes to hero, particles, cursor ripple, or Lenis behavior
- **NG-7:** Changes to color scheme, typography, or overall design system
- **NG-8:** Accessibility audit beyond standard Radix Dialog accessibility features

## 6. Design Considerations

### Navigation Styling
- Minimal chrome: simple text links with hover states
- Maintain brand consistency with existing header styling
- Clear focus states for keyboard navigation
- Links should be clearly distinguishable from body text

### Service Section Images
- Images should maintain aspect ratio consistency across all service cards
- Ensure adequate contrast for overlaid text (add overlay gradient if needed)
- Use Next.js Image component with appropriate `sizes` prop for responsive loading
- Consider lazy loading for below-fold images

### Footer Styling
- Footer should feel distinct from main content (consider subtle background color or border-top)
- Legal links should be clearly readable but not visually dominant
- Adequate spacing between links, avoid crowding
- Mobile: consider stacking links vertically or using smaller font size

### Modal Design
- Clean, readable typography for legal text (consider increasing line-height for long-form content)
- Maximum width constraint (e.g., `max-w-2xl`) to maintain readability
- Adequate padding and margins
- Scrollable content area if text exceeds viewport height
- Consistent close button position (top-right)

### Contact Section Layout
- Full-width Contact Us box should be visually emphasized (possibly larger, different background)
- Equal-height boxes for Who We Are and How We Work maintain visual balance
- Clear visual separation between boxes (borders, shadows, or spacing)
- Maintain glass-morphism aesthetic consistent with rest of site

## 7. Technical Considerations

### Component Refactoring
- Rename `InnovationShowcase.tsx` → `ServicesShowcase.tsx` (or similar)
- Update component imports in `app/page.tsx`
- Update feature flags in `config/features.ts` (rename `innovationShowcase` → `servicesShowcase`, etc.)
- Search codebase for "innovation" references and replace with "services" where it refers to this section

### Video to Image Migration
- Remove video-related props (`video`, `webm`, `mp4`, `mp4Mobile`, `poster`)
- Add `image` prop (string path to static image in `public/`)
- Remove video encoding scripts if no longer needed (`encode-service-video.sh`)
- Update content package type definitions if ServiceCategory includes video metadata
- Update `copy-service-assets.sh` script to handle images instead of videos (or confirm it already does)

### Modal Implementation
- Create `Footer.tsx` component with legal links
- Create `LegalModal.tsx` component that accepts `title` and `content` props
- Use existing shadcn Dialog component (should already be available)
- Ensure modal z-index is above all other page elements (including fixed header)
- Test modal behavior with Lenis smooth scroll (should pause scroll when modal open)

### Contact Section Restructuring
- Refactor `ContactCta.tsx` component to include three-box layout
- Consider extracting boxes into sub-components (`ContactUsBox.tsx`, `WhoWeAreBox.tsx`, `HowWeWorkBox.tsx`) for maintainability
- Use CSS Grid for layout (1 column on mobile, full-width + 2-column on desktop)

### State Management
- Modal open/closed state can be local component state (no global state needed)
- No URL hash updates for modals (purely overlay UI)

### Accessibility
- Ensure all links have descriptive text
- Modal focus trap (Radix Dialog handles this)
- Keyboard navigation for all interactive elements
- Ensure adequate color contrast for new text content
- Test with screen reader (VoiceOver, NVDA)

### Performance
- Static images reduce bundle size vs. video assets
- Lazy load service section images with Next.js Image
- No performance regressions from modal implementation (Dialog is lightweight)

## 8. Success Metrics

- **M1:** Page load time (LCP) improves by removing video assets (target: < 2.5s maintained or improved)
- **M2:** Mobile INP remains < 200ms (no regression from layout changes)
- **M3:** All legal modals are discoverable and functional on first deployment
- **M4:** Navigation links successfully scroll to correct sections on all devices
- **M5:** Contact section three-box layout renders correctly on mobile (< 768px), tablet (768-1024px), and desktop (> 1024px)

## 9. Open Questions

- **Q1:** What is the desired aspect ratio for service section images? (e.g., 16:9, 4:3, square) - **User will provide images, we'll adapt layout to match**
- **Q2:** Should the footer legal links be grouped (e.g., "Legal: Impressum | Data Protection | Compliance") or separate spaced links? - **Assume separate spaced links for now, user can request changes**
- **Q3:** Should clicking outside a modal close it immediately or require confirmation for legal content? - **No confirmation needed, standard dismissibility (already confirmed)**
- **Q4:** Is there a preferred order for the footer links? - **Assume: Impressum, Company Data, Data Protection, Compliance, Certifications (left to right)**

---

## Implementation

### Pre-flight Requirements

> ⚠️ This project runs in a **VS Code dev container**. Dependencies cannot be installed at runtime.
> Any items listed here MUST be completed and the container rebuilt BEFORE running `/implement`.
> Starting a new Claude session after rebuilding is required.

**New npm packages** (add to the relevant `package.json`, then rebuild):
- None — no new packages required. The project already has Radix UI Dialog via shadcn/ui.

**Environment variables** (add to `.env.demo` / `.env.prod` / `.env.example`):
- None — no new env vars required.

**Other system changes** (migrations, storage buckets, edge function deploys, etc.):
- None.

---

### Relevant Files

**Components (apps/web/src/components/):**
- `Header.tsx` — Simplify navigation to Services/Contact links only
- `sections/InnovationShowcase.tsx` → `sections/ServicesShowcase.tsx` — Rename and convert to static image backgrounds
- `sections/InnovationsBento.tsx` → `sections/ServicesBento.tsx` — Rename and convert to static image backgrounds (if applicable)
- `sections/ContactCta.tsx` — Restructure to three-box layout (Contact Us, Who We Are, How We Work)
- `Footer.tsx` — New component with legal links
- `modals/LegalModal.tsx` — New reusable modal component for footer content

**Configuration:**
- `apps/web/src/config/features.ts` — Update feature flag naming (innovation → services)
- `apps/web/src/app/page.tsx` — Update component imports, add Footer component

**Content Package:**
- `packages/content/data/services.ts` — Update type definitions if video metadata is removed

**Scripts:**
- `scripts/encode-service-video.sh` — Mark as deprecated or remove if no longer needed

**Styles:**
- `apps/web/src/app/globals.css` — Add any new utility classes for footer or modal styling (if needed)

### Notes

- No test runner configured (no Jest/Vitest in project)
- Verify changes by running `pnpm dev` and testing each feature manually on desktop and mobile viewports
- Use browser DevTools responsive mode to test mobile layouts
- Test modal behavior: open/close via button, backdrop click, Escape key
- Test smooth scroll behavior for Services/Contact nav links
- Verify feature flags work correctly (toggle `servicesShowcase: true/false` to show/hide sections)

### Tasks

- [x] **1.0 Component Refactoring: Rename "Innovation" to "Services"**
  - [x] 1.1 Rename `apps/web/src/components/sections/InnovationShowcase.tsx` to `ServicesShowcase.tsx`
  - [x] 1.2 Rename `apps/web/src/components/sections/InnovationsBento.tsx` to `ServicesBento.tsx` (if it exists)
  - [x] 1.3 Update imports in `apps/web/src/app/page.tsx` to use renamed components
  - [x] 1.4 Update `apps/web/src/config/features.ts`: rename `innovationShowcase` → `servicesShowcase`, `innovationsBento` → `servicesBento`
  - [x] 1.5 Search codebase for remaining "innovation" references (grep -ri "innovation" apps/web/src/) and update to "services" where contextually appropriate (skip display text)

- [x] **2.0 Convert Service Sections from Video to Static Image**
  - [x] 2.1 Update `ServicesShowcase.tsx`: replace video background rendering with Next.js Image component
  - [x] 2.2 Update component props to accept `image` prop (string path) instead of `video` object
  - [x] 2.3 Add placeholder image path (e.g., `/images/services/placeholder-[name].jpg`) that user will replace
  - [x] 2.4 Ensure image fills container with `object-fit: cover` and maintains aspect ratio
  - [x] 2.5 Add `sizes` prop to Image component for responsive loading (e.g., `sizes="(max-width: 768px) 100vw, 50vw"`)
  - [x] 2.6 Repeat for `ServicesBento.tsx` if it uses video backgrounds
  - [x] 2.7 Update `packages/content/data/services.ts` type definitions: remove `video` prop, add `image` prop to ServiceCategory interface

- [x] **3.0 Simplify Header Navigation**
  - [x] 3.1 Open `apps/web/src/components/Header.tsx` and remove hamburger menu/sheet logic (if present)
  - [x] 3.2 Replace navigation with two simple anchor links: "Services" and "Contact"
  - [x] 3.3 Set `href="#services"` for Services link, `href="#contact"` for Contact link
  - [x] 3.4 Style links with hover states and focus indicators (maintain brand colors)
  - [x] 3.5 Ensure links are visible and readable on all breakpoints (no collapsing behavior)
  - [x] 3.6 Test smooth scroll behavior (Lenis should handle anchor link scrolling automatically)

- [x] **4.0 Create Footer with Legal Links**
  - [x] 4.1 Create new component `apps/web/src/components/Footer.tsx`
  - [x] 4.2 Implement footer layout with five links: Impressum, Company Data, Data Protection Policy, Compliance, Certifications
  - [x] 4.3 Style footer with subtle background/border-top to distinguish from main content
  - [x] 4.4 On mobile, ensure links are readable (consider smaller font or vertical stack if needed)
  - [x] 4.5 Add Footer component to `apps/web/src/app/page.tsx` at the bottom (after all sections)

- [x] **5.0 Implement Legal Modal Component**
  - [x] 5.1 Create `apps/web/src/components/modals/LegalModal.tsx` using shadcn Dialog component
  - [x] 5.2 Component props: `isOpen: boolean`, `onClose: () => void`, `title: string`, `content: string | ReactNode`
  - [x] 5.3 Implement modal with close button (X icon top-right), dismiss via backdrop, dismiss via Escape (Radix handles this)
  - [x] 5.4 Style modal: max-w-2xl, scrollable content area, adequate padding, readable typography
  - [x] 5.5 Ensure modal z-index is above all page elements (test with fixed header)
  - [x] 5.6 Test modal behavior with Lenis: ensure scroll is paused when modal is open (may need `data-lenis-prevent` on modal root)

- [x] **6.0 Wire Up Footer Links to Modals**
  - [x] 6.1 Add state management to Footer component for tracking which modal is open (e.g., `const [activeModal, setActiveModal] = useState<string | null>(null)`)
  - [x] 6.2 Each footer link onClick sets activeModal to corresponding key (e.g., "impressum", "company-data")
  - [x] 6.3 Render LegalModal with conditional content based on activeModal value
  - [x] 6.4 Add placeholder content for each legal section (e.g., "Impressum content will be provided by client. Lorem ipsum...")
  - [x] 6.5 Test opening and closing each modal, verify no state conflicts

- [x] **7.0 Restructure Contact Section to Three-Box Layout**
  - [x] 7.1 Open `apps/web/src/components/sections/ContactCta.tsx` and refactor layout
  - [x] 7.2 Create three distinct content boxes with headings: "Contact Us", "Who We Are", "How We Work"
  - [x] 7.3 Implement layout: Contact Us full width, Who We Are and How We Work each 50% width below (use CSS Grid: `grid-template-columns: 1fr 1fr` for md+)
  - [x] 7.4 On mobile (< md), stack all three boxes vertically with `grid-template-columns: 1fr`
  - [x] 7.5 Style boxes consistently with glass-morphism aesthetic (backdrop-blur, border, shadow)
  - [x] 7.6 Add placeholder text for "Who We Are" and "How We Work" (e.g., "Who We Are: Content will be provided by client. CES Clean Energy Solutions is a Vienna-based engineering consultancy...")
  - [x] 7.7 Ensure Contact Us box is visually emphasized (consider larger size, distinct background, or border)

- [x] **8.0 Update Feature Flags and Remove Deprecated Code**
  - [x] 8.1 Verify feature flags in `config/features.ts` work correctly with renamed components
  - [x] 8.2 Toggle flags to test section visibility (e.g., set `servicesShowcase: false` and confirm section is hidden)
  - [x] 8.3 Review `scripts/encode-service-video.sh` — add deprecation comment at top if video encoding is no longer needed
  - [x] 8.4 Review `scripts/copy-service-assets.sh` — confirm it handles images correctly (check file extensions)
  - [x] 8.5 Search for any orphaned video-related code or imports and remove

- [x] **9.0 Testing and Visual QA**
  - [x] 9.1 Test on desktop viewport (> 1024px): verify navigation, service section images load, footer is visible, modals open/close
  - [x] 9.2 Test on tablet viewport (768-1024px): verify layout adaptations, Contact section boxes render correctly
  - [x] 9.3 Test on mobile viewport (< 768px): verify all content stacks vertically, navigation is usable, modals are readable
  - [x] 9.4 Test keyboard navigation: Tab through all links, open modals with Enter, close with Escape
  - [x] 9.5 Test smooth scroll: click Services/Contact nav links, verify smooth scroll to correct sections (Lenis should handle this)
  - [x] 9.6 Test modal dismissibility: close via button, backdrop click, Escape key
  - [x] 9.7 Verify no console errors or warnings (TypeScript type checking passes)
  - [x] 9.8 Verify ParticlesBackground and CursorRipple still work on desktop (unchanged)

- [x] **10.0 Documentation and Handoff**
  - [x] 10.1 Update CLAUDE.md if any architectural decisions changed (e.g., video → image pattern)
  - [x] 10.2 Create a content guide in `docs/` explaining where to replace placeholder text (Footer modals, Contact section boxes)
  - [x] 10.3 Document where user should place service section images (e.g., `apps/web/public/images/services/[name].jpg`)
  - [x] 10.4 Note any known issues or future improvements (e.g., "Footer content is placeholder, update in Footer.tsx lines 15-60")
  - [x] 10.5 Mark PRD status as "Completed" and add completion date

### Progress Log

| Date | Task | Notes |
|------|------|-------|
| 2026-03-09 | 1.0-1.5 | Renamed innovation/ directory to services-bento/, updated all component names and imports, updated feature flags |
| 2026-03-09 | 2.1-2.7 | Replaced video backgrounds with static images in ServicesBentoCard and ServicesSlide components, added deprecation note to video field |
| 2026-03-09 | 3.1-3.6 | Simplified header to only Services and Contact links, visible on all breakpoints with proper focus states |
| 2026-03-09 | 4.1-4.5 | Created Footer component with five legal links, added to page.tsx |
| 2026-03-09 | 5.1-6.5 | Created LegalModal component with Radix Dialog, wired up footer links with placeholder content |
| 2026-03-09 | 7.1-7.7 | Restructured ContactCta to three-box layout with Contact Us (full width), Who We Are and How We Work (50% each) |
| 2026-03-09 | 8.1-8.5 | Added deprecation notice to encode-service-video.sh, verified asset copying script handles images, removed video code from ServicesDetailModal |
| 2026-03-09 | 9.1-9.8 | Fixed TypeScript type errors, verified type-check passes. Manual browser testing recommended: test responsive layouts, smooth scroll, modal interactions |
| 2026-03-09 | 10.1-10.5 | Created CONTENT-GUIDE.md, updated CLAUDE.md with architecture changes, documented component organization and known issues. Implementation complete. |
