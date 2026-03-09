# Content Replacement Guide

This guide explains where to replace placeholder content with real text and images for the CES portfolio site.

## ✅ Content Status

**Completed:**
- ✅ Impressum (Company Information)
- ✅ Company Data
- ✅ Compliance Policy
- ✅ Certifications
- ✅ Contact Section - Who We Are
- ✅ Contact Section - How We Work

**Pending:**
- ⚠️ Data Protection Policy (partial content, needs completion)
- 📷 Service section images (see section below)

---

## Legal Footer Content

**Location:** `apps/web/src/components/Footer.tsx`

**Lines to update:** 21-140 (the `LEGAL_CONTENT` object)

### ⚠️ Data Protection Policy - NEEDS COMPLETION

The Data Protection Policy section currently contains a placeholder note. It needs to be replaced with a comprehensive GDPR-compliant privacy policy that includes:

- What personal data CES collects and how it's collected
- Legal basis for processing personal data
- How CES uses collected data
- Your rights under GDPR (access, rectification, erasure, restriction, portability, objection)
- Data retention periods
- Data security measures implemented by CES
- Third-party data processors (if any)
- Cookie policy (if applicable)
- Contact information for the Data Protection Officer
- How to lodge a complaint with the Austrian supervisory authority (Datenschutzbehörde)

**To update:** Edit `apps/web/src/components/Footer.tsx`, find the `"data-protection"` section (around line 70), and replace the placeholder content with your complete privacy policy.

---

## ✅ Completed Sections

The following sections have been updated with real content and do not need changes (unless you want to revise them):

1. **✅ Impressum** - Company information, VAT ID, registration details, disclaimer, responsible person
2. **✅ Company Data** - Full company registration and contact details
3. **✅ Compliance Policy** - Complete CMS framework and policy statements
4. **✅ Certifications** - ISO 9001, 14001, and 45001 certificates with descriptions
5. **✅ Who We Are** - Company background, iC group affiliation, geographic reach, competences
6. **✅ How We Work** - Methodology, principles, service lifecycle, project examples

## ✅ Contact Section Content - COMPLETED

**Location:** `apps/web/src/components/sections/ContactCta.tsx`

### Contact Information
Current contact details:
- Name: `Dipl.-Ing. Klaus Kogler`
- Title: `Buildings and Urban Development`
- Phone: `+43 664 601 692 32`
- Email: `k.kogler@ic-ces.at`

If you need to update the contact person or details, edit these values in `ContactCta.tsx` (lines 21-31).

### ✅ Who We Are - Content Updated
Real content has been added covering:
- Company founding (2009) and core services
- iC group affiliation and team size
- Geographic reach and client partnerships
- Five competence areas

### ✅ How We Work - Content Updated
Real content has been added covering:
- "The better way" methodology
- Three guiding principles (systemic solutions, staying ahead, delivering what works)
- Full project lifecycle services
- Real project examples (Vienna, Ukraine, Tbilisi)

## Service Section Images

**Location:** Images should be placed in:
```
apps/web/public/images/services/
```

**Format:** JPG or PNG files

**Naming convention:** Use the service `id` from the data files:
- `/images/services/placeholder-[service-id].jpg`

For example, if your service has `id: "bim-engineering"`, place the image at:
```
apps/web/public/images/services/placeholder-bim-engineering.jpg
```

The components will automatically use the first image from the `images` array in `packages/content/data/innovation.ts`, but if no image is found, they'll fall back to `/images/services/placeholder-[id].jpg`.

### Recommended image specifications:
- **Format:** JPG (for photographs) or PNG (for graphics with transparency)
- **Dimensions:** Minimum 1920x1080 (16:9 aspect ratio preferred)
- **File size:** Keep under 500KB for optimal loading
- **Quality:** 80-85% JPEG quality is sufficient
- **Optimization:** Run images through imageoptim or similar before deploying

### Adding images to the innovation data:

Edit `packages/content/data/innovation/[service-id]/section-description.json` and ensure the `images` array has at least one entry:

```json
{
  "images": [
    {
      "src": "./main-image.jpg",
      "alt": "Description of the image for accessibility",
      "caption": "Optional caption text"
    }
  ]
}
```

The first image in this array will be used as the background for service cards and slides.

## Testing After Content Updates

After replacing content:

1. **Build the site:**
   ```bash
   pnpm build
   ```

2. **Run dev server:**
   ```bash
   pnpm dev
   ```

3. **Test in browser:**
   - Navigate to `http://localhost:8080` (or `:4200` depending on your setup)
   - Test all legal footer modals (click each link)
   - Scroll to Contact section, verify all three boxes display correctly
   - Verify service images load correctly
   - Test on mobile viewport (DevTools responsive mode)

4. **Check for issues:**
   - Browser console (F12) should show no errors
   - All images should load (no broken image icons)
   - Text should be readable with adequate contrast
   - Links should work and modals should open/close smoothly

## Deployment

Once content is updated and tested:

```bash
pnpm deploy:dev      # Deploy to development environment
# or
pnpm deploy          # Deploy to production
```

## Need Help?

- **For design/styling changes:** See `apps/web/src/app/globals.css` for design tokens
- **For layout changes:** Components are in `apps/web/src/components/`
- **For adding new sections:** See `docs/technical-architecture.md` for patterns
- **For questions:** Contact your development team or refer to `CLAUDE.md` for architecture overview
