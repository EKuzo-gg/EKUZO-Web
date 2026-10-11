# EKUZO Camps — Design Decision Log

## Open Decisions

### Hero Background Treatment
**Status:** Waiting on asset
**Context:** The hero currently uses a yellow (#faff00) background with a placeholder background video (`ekuzo-teams-hero.mp4`) at 15% opacity with `mix-blend-multiply`. The centered layout may feel too plain without a stronger visual element.

**Options to resolve once the camp-specific video arrives:**
1. **Full-screen background video** — keep current centered layout, swap in the new camp video asset (virtual session with gameplay, kids and coach playing end-stage of the game)
2. **Split layout with embedded video** — text left, video player panel on right (click-to-play or autoplay in a contained frame)
3. **Split layout with static hero image** — text left, strong photographic image on right, with video accessible via play button overlay
4. **Background video + foreground image overlay** — video behind, with a layered image element (e.g. coach/student photo, game screenshot) for additional depth

**Assigned to:** Teammate sourcing the video asset
**Decision maker:** Aaron (design lead)

---

## Resolved Decisions

### Hero Color
- **Decision:** Yellow (#faff00) per wireframe-zombie-1
- **Date:** 2026-03-25

### Section Order
- **Decision:** Follow wireframe-zombie-1 structure
- **Date:** 2026-03-25

### Hero Layout (interim)
- **Decision:** Centered layout with background video, pending asset arrival
- **Date:** 2026-03-25

---

## As-Built Reference — Original Camps Page Build Direction

> Moved from `CLAUDE.md` 2026-06-07. This was the build spec for the camps page; the build
> shipped (camps v2 promoted to canonical 2026-05-20, v1 archived at
> `docs/archive/ekuzo-camps-v1-pre-052026.tsx.txt`). Kept here as historical reference for how
> the page was structured, not as active direction.

**Source:** Variant.com wireframe (mood board → zombie wireframe). Built the structure from the wireframe but applied EKUZO's full visual style (red/black/white, Bebas Neue headings, torn paper dividers, brush art).

### Wireframe sections (in order)
1. **Hero** — "EKUZOCAMP" heading, tagline, stats bar (coaches/virtual/teams counts), hero video (`ekuzo-teams-hero.mp4` or camps-specific), "Register Now" + "Learn More" CTAs
2. **Value props** — 6 cards: Pro Coaches, Virtual, Teams, Practice, Growth, Balance
3. **Daily Schedule** — timeline: Check-in & Warm-up → Skill Drills → Tournament Play → VOD Review & Feedback
4. **Expert Coaches section** — image left, copy right, credentials
5. **Requirements** — Basic computer + headphones; League of Legends section with checklist
6. **Testimonials** — video testimonials (use our `/testimonial-videos/` assets)
7. **Registration form** — choose week (week cards with AM/PM slots + availability + price), parent info, gamer info, payment (Stripe Elements)
8. **FAQ accordion** — 5 common questions
9. **Footer CTA** — "Enroll into a transformational program today"

### Separate pages referenced from camps
- `/camps/schedule` — 6-week grid (Week 1-6, AM/PM slots, availability badges, prices)
- `/camps/checkout` — custom Stripe Elements checkout (credit card form + order summary sidebar + promo code)
- `/camps/success` — "LEVEL UP!" confirmation (booking summary, gamer name, status=Paid, total, receipt download, next steps: check inbox / join Discord / download game)

### Parents page (from wireframe — different from Framer /parents)
- "YOUR GAMER'S GROWTH IS OUR MISSION" hero
- Safety & Moderation Protocol (3 points with icons)
- Meet Our Lead Coaches (3 coach cards)
- Common Parent Questions (FAQ accordion)
- "Still Have Questions?" CTA (Contact Support + Schedule a Call)
