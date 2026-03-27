# Blog (/blog) — Live Site Capture
Captured: 2026-03-25 | URL: ekuzo.gg/blog

---

## Section Order

1. Hero (black bg, "STORIES OF GAMING AND GROWTH")
2. Featured Post Card (horizontal split, red left / image right)
3. "All blogs" grid (filter panel + post cards)
4. Footer Banner + Footer

---

## Section 1: Hero

**Background:** Black `rgba(0, 0, 0, 1)`
**Nav:** Black bg — EKUZO white wordmark, nav links white, "Start a conversation" white OUTLINE button (not red filled — black background)

### Copy
- **H1:** "STORIES OF GAMING AND GROWTH"
  - Tungsten Narrow Black, very large (~200px+), white, uppercase
  - 2 lines, centered (or full-width)

---

## Section 2: Featured Post Card

Directly below hero, no divider — sits at same vertical level as hero bottom.

**Layout:** Horizontal split — ~50% red left panel / ~50% full-bleed image right
**Size:** Full-width card, ~399px height

### Left panel (red bg)
- Diamond corner cut: white 80×80 square rotated -45° at top-left corner
- **Eyebrow:** "BLOG" — small uppercase label
- **H5:** "Our Family's Esports Journey with EKUZO and the K1ng"
  - White bold text
- **Excerpt:** "My son Ryan was always a happy kid in his early years."
  - White, smaller body text
- **Link:** `/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng`

### Right panel (image)
- Full-bleed photo: esports venue — girl in EKUZO jersey at gaming setup (multiple monitors, colorful lighting, gaming peripherals)
- Diamond corner cut at bottom-right

---

## Section 3: "All Blogs" Grid

**Background:** White
**Layout:** 3-column grid — left column filter panel, right 2 columns post cards

### Filter panel (left column)
- Background: Black card
- **Label:** "Filter by"
- **Filter options (clickable, white text):**
  - all
  - case studies
  - testimonials

### Blog post cards (2 cards total)

**Card 1 — K1ng story**
- Image: Esports venue, 2 players at gaming stations (man and teen, colorful lighting)
- **Category:** "CASE STUDY" — small uppercase
- **Title:** "Our Family's Esports Journey wit..." (truncated)
- **Author:** "by Lisa Holt" — red "by" + author name
- Card background: White, subtle border/shadow

**Card 2 — Conquering my Mountain**
- Image: Outdoor campus/event, young woman in foreground, group photo at tournament venue (golden hour)
- **Category:** "TESTIMONIAL" — small uppercase
- **Title:** "Conquering my Mountain and Giant..." (truncated)
- **Author:** "by John Hay" — red "by" + author name

### Card layout notes
- Cards appear side-by-side (2 columns)
- Filter panel occupies ~1/3 width on left
- Post cards use image at top, metadata below
- No pagination — only 2 posts

---

## Footer Banner

Standard variant: "Enroll into a transformational program today"
- CTA: "Start a conversation" (white outline on red)
- Red torn-paper divider at top
- Standard B&W cutout figures

---

## Key Design Notes

- Blog hero uses same massive Tungsten display style as /faqs
- Nav button changes to WHITE OUTLINE on black backgrounds (hero/FAQ pages) — not red filled
- Featured post card uses diamond-corner cut motif — same as /parents blog section
- Filter system: 3 categories (all / case studies / testimonials) — drives CMS tag display
- Only 2 published posts — grid is sparse, filter barely useful at current volume
- "by [Author]" uses red "by" — consistent CMS field styling across the site
- Card title is truncated with ellipsis — need adequate character limit in Next.js

---

## Breakpoints

- DesktopLarge: 1920px
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
