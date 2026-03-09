# Content Replacement Guide

This guide explains where to replace placeholder content with real text and images for the CES portfolio site.

## Legal Footer Content

**Location:** `apps/web/src/components/Footer.tsx`

**Lines to update:** 21-72 (the `LEGAL_CONTENT` object)

Replace the placeholder text for each of the five legal sections:

1. **Impressum** (lines 21-31)
   - Company registration details
   - Managing directors
   - VAT ID
   - Contact information
   - Regulatory authority

2. **Company Data** (lines 32-42)
   - Full legal name and address
   - Registration numbers
   - Bank details (if applicable)
   - Insurance information
   - Professional memberships

3. **Data Protection Policy** (lines 43-55)
   - Data collection practices
   - Data usage
   - GDPR rights
   - Data protection officer contact
   - Cookie policy
   - Third-party processors

4. **Compliance** (lines 56-67)
   - Industry standards adherence
   - Quality management systems
   - Environmental certifications
   - Code of conduct
   - Anti-corruption policies
   - Health and safety standards

5. **Certifications** (lines 68-79)
   - ISO certifications (9001, 14001, etc.)
   - Industry-specific certifications
   - Professional memberships
   - Accreditations
   - Awards and recognitions

## Contact Section Content

**Location:** `apps/web/src/components/sections/ContactCta.tsx`

### Contact Information (lines 21-31)
Currently displays:
- Name: `Dipl.-Ing. Klaus Kogler`
- Title: `Buildings and Urban Development`
- Phone: `+43 664 601 692 32`
- Email: `k.kogler@ic-ces.at`

Update these if needed.

### Who We Are (lines 51-61)
**Current placeholder:** "Who We Are content will be provided by client..."

Replace with a 2-3 paragraph description of CES, including:
- Company overview and specialization
- Team expertise and qualifications
- Project history and achievements
- Geographic reach and recognition

### How We Work (lines 71-81)
**Current placeholder:** "How We Work content will be provided by client..."

Replace with a 2-3 paragraph description of CES's process, including:
- Collaborative approach and methodology
- Tools and techniques used
- Value proposition and differentiators
- Project lifecycle involvement (concept → implementation)

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
