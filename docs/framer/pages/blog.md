# /blog

**Framer nodeId:** yEIHmvXz2
**Type:** Blog index page
**Background:** White
**Layout:** Absolute positioning (same anomaly as Teams/Camps pages)

## Sections

### 1. Hero (nodeId: jp8qg7F1B)
- Background: White
- Padding: 240px top, 144px bottom, 40px sides
- Layout: vertical stack, gap 80px, centered

**Heading**
- Text: "STORIES OF GAMING AND GROWTH"
- Style: `/Display/Heading 2`
- Tungsten Narrow Black display font

**Featured Blog Card**
- Component: BlogFeatureCard (componentId: YXsorOdcL), variant `wR7LgXi_z`
- Linked to `/blog/:slug` (CMS dynamic route)
- Positioned at centerX=-8% (slightly left-offset)

**Torn Paper Divider**
- Image: `https://framerusercontent.com/images/UwEdPCYKBFqm11QEIdAIeUNK8c.png`
- Positioned at bottom of hero (centerY=73%), zIndex=1, full width

### 2. All Blogs Section (nodeId: rBriAjS7R)
- Background: White
- Padding: 144px top, 188px bottom, 40px sides
- top: 1488px (absolute)

**Heading**
- Text: "All blogs"
- Style: `/Display/Heading 4`

**Blog Filter + Grid**
- Component: BlogFilterSection (componentId: t00hdMrB6), variant `w5eh9PNfW`
- maxWidth: 1232px, centered
- Handles CMS-driven blog list with filter functionality

### 3. FooterBannerSection (BNRkYbJEX)
- Copy: "Enroll into a transformational program today"
- Standard footer banner

## CMS Integration

Blog posts come from the CMS collection. See `/docs/framer/cms/blog.md` for field schema.

Dynamic route: `/blog/:slug` (linked from BlogFeatureCard and BlogFilterSection items).

## Notes

- All sections use `position: absolute` — same layout anomaly as Teams, Camps pages.
- The BlogFeatureCard is slightly left-offset (centerX=-8%) which may be intentional for visual balance or a Framer artifact.
- The torn paper image at bottom of hero uses the same pattern as other section dividers across the site.
- Next.js implementation:
  - `/blog` — static index page
  - `/blog/[slug]` — dynamic CMS-driven post page
  - BlogFilterSection likely handles tag/category filtering via URL params or client-side state
