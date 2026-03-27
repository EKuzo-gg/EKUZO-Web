# EKUZOCamps (/ekuzocamps-seasonal) — Live Site Capture
Captured: 2026-03-25 | URL: ekuzo.gg/ekuzocamps-seasonal

---

## ⚠️ CRITICAL NOTE

This page in Framer is a **waitlist/coming-soon form only** — no hero, no program marketing content, no nav. The page is live but functions as a placeholder until the full Camps page is built.

This page needs to be built from scratch in Next.js. Reference:
- The Variant.com wireframe for structure (see memory: `project_camps_direction.md`)
- EKUZO visual style system for design
- Other program pages (ekuzo100, parents) for content inspiration

---

## What's Live: Waitlist Form

**Page title:** "EKUZOCamps – Seasonal | EKUZO"
**Scroll height:** ~1651px (very short — 2 viewports)
**Nav:** NOT present on this page — no top navigation bar

### Form
- **Heading:** "EKUZOCAMPS" (large, H-style, black, uppercase, Tungsten-style)
- **Fields:**
  | Field | Type | Required | Placeholder |
  |-------|------|----------|-------------|
  | Name | Text | Yes (red asterisk) | "Jane Smith" |
  | Email | Text | Yes (red asterisk) | "jane@school.com" |
- **Submit button:** "Get notified when available" — red filled, full width (~1100px)
- **Background:** White, centered layout, generous top padding (~100px above heading)

### Footer Banner
- Standard variant: "Enroll into a transformational program today"
- CTA: "Start a conversation" — white outline on red
- Red torn-paper divider at top
- Two B&W cutout figures (teen boy in school jacket pointing, girl in plaid)
- White torn-paper divider at bottom

### No standard footer
The regular footer with nav columns and EKUZO wordmark does not appear — page ends at footer banner.

---

## What the EKUZOCamps Page SHOULD Have (from build direction)

The Camps page needs to be a full marketing page. Based on CLAUDE.md and the Variant.com wireframe:

### Program Description
- Seasonal day camp format (school breaks: winter, spring, summer)
- In-person + online hybrid (or fully online — TBD)
- Short duration: 1 week or multi-day intensive
- Age: 10–18
- Games: Multiple titles

### Suggested Build Structure
1. **Hero** — Red or white bg, "EKUZO Camps" H1, tagline about seasonal gaming
2. **What it is** — Camp format, duration, who it's for
3. **How it works** — Schedule, activities, coaching
4. **Dates + pricing** — Upcoming camp sessions (dynamic CMS or static)
5. **Testimonials** — Parent/student feedback
6. **Enrollment CTA** — Either waitlist (if no sessions open) or direct enrollment
7. **FAQ** — Camp-specific questions
8. **Footer Banner** — Standard or camp-specific copy

### Commerce note
- If camp dates are available: Stripe checkout for enrollment
- If no dates open: waitlist form (name + email → Make.com webhook → Beehiiv)

---

## Build Direction

**Do NOT** replicate this waitlist form as the final page.

The live /ekuzocamps-seasonal URL should eventually render a full marketing page. The waitlist form pattern (name + email + "Get notified") is appropriate only during pre-launch.

For v1 of the Next.js rebuild: build the full marketing page but keep the waitlist form as the enrollment CTA (since no camp dates are currently scheduled).

---

## Breakpoints
- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
