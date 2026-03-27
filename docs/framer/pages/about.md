# /about

**Framer nodeId:** ODMztkQ5r
**Status:** Draft
**Type:** Brand/philosophy page — "What Growth Through Games Really Requires"
**Background:** Red hero / alternating white and black sections
**Layout:** In-flow vertical stack

## Relationship to /games

The `/about` page and `/games` page share the same core concept and hero text. The `/about` draft appears to be a **more complete version** with an extended EcosystemSectionCard sequence (6 cards vs. the /games page approach) and adds a "What parents are saying" video testimonial section. Key differences from /games:
- /about has 6 EcosystemSectionCards (Motivation → Challenge → Team Context → Structure → Coaching & Reflection → Where All Comes Together)
- /about adds the VideoCardSection testimonials block before the footer
- /games has a ScrollButton fixed component and a Testimonial quote by "Karlin Oei, Founder EKUZO"

---

## Sections

### 1. Hero (nodeId: o31DSnWA9)
- **Background:** `/Red/Red`
- **Padding:** 188px top

**Copy:**
- H2: "What Growth Through Games Really Requires" (`/Display/Heading 2`)

**White1 torn paper divider** at bottom (lgis88RSC).

**Decorative image:** `https://framerusercontent.com/images/UfjqtSLCvajiLO8PI8MJak7cXTY.png`

---

### 2. Games Spark Motivation (nodeId: cXCHIA010)
- **Background:** White
- **Padding:** 144px top/bottom

**Copy:**
- H4: "Games spark motivation." (`/Display/Heading 4`)
- Body: "Structure turns it into growth. Students come to EKUZO through many different games, and we respect the passion they bring with them. But when it comes to teaching — helping students build confidence, leadership, and real-world skills — growth depends on more than just play."

---

### 3. Six EcosystemSectionCards (nodeId: mBP0MefNN)
- **Background:** White
- **Padding:** 144px top, 188px bottom
- **Component:** EcosystemSectionCard (HnNOtigLD), variant `VwEfdN1Q3` — sticky scroll layout (left image fixed, right cards scroll)

| # | Title | Body |
|---|---|---|
| 1 | MOTIVATION | Games work because students care. Motivation drives focus, persistence, and the willingness to try again. |
| 2 | Challenge | Games naturally push back. Failure isn't the end — it's feedback. |
| 3 | TEAM CONTEXT | When success depends on others, learning becomes social. Students practice communication, responsibility, and trust. |
| 4 | STRUCTURE | Without structure, progress is inconsistent. With structure, learning becomes intentional, coachable, and safe. |
| 5 | COACHING & REFLECTION | Coaching adds feedback, reflection, and leadership development. |
| 6 | Where All of This Comes Together | Many games support parts of this growth. Very few support it consistently, across different skill levels. |

**Black-1 torn paper divider** at bottom (xXXvJAqHn).

---

### 4. Why League of Legends (nodeId: WBk9YGI1z)
- **Background:** `/Black/Black`
- **Padding:** 144px top, 188px bottom

**H4:** "League of Legends strikes that balance"
**Subhead:** "That balance comes from 3 things:"

**3 dark cards (mTrbgx1O_, variant beiSYiz3X):**

| Title | Description |
|---|---|
| Strategic depth | Challenges students to think ahead, adapt, and make meaningful decisions. |
| Approachable mechanics | Easy to start, forgiving to learn, and accessible without overwhelming beginners. |
| Stable roles and systems | Clear roles and systems that make teamwork and leadership teachable. |

---

### 5. Where Other Games Fit (nodeId: jhtyyOAVm)
- **Background:** `/Red/Red`
- **Padding:** 144px top/bottom

**H4:** "Where other games fit"
**Body:** "Other games are often where students start."

**Game cards (TenPillarsSectionCard — jpjISij1R):**

| Game | Copy |
|---|---|
| MarioKart | Small wins spark big change. |
| Fortnite | Small wins spark big change. |
| Roblox | Small wins spark big change. |
| Experimentation & Feedback | and many other games |

**Closing line:** "EKUZO meets students through the games they love, but teaches through the game that allows growth to compound."

---

### 6. What Parents Are Saying (nodeId: wE4seFhAc)
- **Background:** White
- **Padding:** 188px all sides

**Red-1 torn paper divider** at top (UdVin8rIr).

**H4:** "What parents are saying"

**VideoCardSection** (DdV4_HJre, variant VOVSsOyvw) — CMS-driven video testimonials.

**Pull quote:**
> "It's structure, mentorship, and community all in one place."
> — Rudy May, EKUZO mom

---

### 7. FooterBannerSection (BNRkYbJEX)
- Copy: "Enroll into a transformational program today"
- `kylqqg5uj="true"` — dual CTA enabled

---

## Notes

- No Rive animation.
- The "about" path suggests this may eventually become the brand philosophy / how-it-works landing page.
- The EcosystemSectionCard sequence (6 cards) is the most complete articulation of EKUZO's pedagogical pillars in the Framer project — Motivation → Challenge → Team Context → Structure → Coaching & Reflection → Integration.
- Shares "Where other games fit" section with /games; note game descriptions are placeholder ("Small wins spark big change." used for all 3 games — needs real copy).
- Next.js: Static page at `/about`. The 6 EcosystemSectionCards could power a sticky-scroll section.
