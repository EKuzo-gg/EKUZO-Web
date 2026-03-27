# /coaching

**Framer nodeId:** rvhUJqp10
**Status:** Draft
**Type:** Pedagogy sub-page — coaching methodology
**Background:** White (hero) / alternating light grey and black sections
**Layout:** In-flow vertical stack

## Purpose

Deep-dive into EKUZO's coaching philosophy. Per the user, this is a **template for the pedagogy children** — meaning pages like `/pedagogy/coaching`, `/pedagogy/reflection`, etc. will follow this structural pattern.

---

## Sections

### 1. Hero (nodeId: tZWM3v0Tr)
- **Background:** White
- **Padding:** 188px top/bottom
- **Layout:** Horizontal, centered, max-width 1232px

**Two decorative full-bleed images:**
- Left (bottom-anchored, 660×560): `https://framerusercontent.com/images/9sPAo9LK8h4hOfBqfXDwkeH2k.png`
- Right (top-anchored, 660×560): `https://framerusercontent.com/images/Ji5DBCPzDGRkg3TihZZopS1HewI.png`

**Copy:**
- H2: "COACHING" (`/Display/Heading 2` — Tungsten Narrow Black)
- Body L: "Meeting every learner where they are."

**Torn paper divider** at bottom of hero:
- `https://framerusercontent.com/images/8aXKGdobnlhGV66LFUcbTboN6xg.png`

---

### 2. Why Coaching Works (nodeId: b7hmLylyw)
- **Background:** `/Grey/Light Grey`
- **Padding:** 144px top, 188px bottom
- **Decorative bg image:** `https://framerusercontent.com/images/5I9cKE5vflntneL84TuEElhs3QI.png`

**Copy:**
- H5: "Every great athlete has a coach."
- Body: "Every successful team has a mentor guiding them. Research across education is clear: coaching is one of the most effective ways to learn. At Ekuzo, coaching is at the center of our model. Our coaches are collegiate esports athletes or former professionals who know the game inside and out, but more importantly, they know how to connect with students"

---

### 3. Testimonial (nodeId: C5hSjvNUg)
- **Component:** TestimonialsSection (yY5pfBKjH), variant `cQaERloUl`
- **Quote:** "A coach is someone who can give correction without causing resentment."
- **Attribution:** John Wooden
- `XTam18xjQ="false"` — hides the video testimonials, shows text quote only

---

### 4. How Coaching Builds Growth (nodeId: hSn4XyinI)
- **Background:** `/Grey/Light Grey`
- **Padding:** 144px top, 240px bottom

**Large card heading (HowItWorksSectionLargeCard — J5646SU6d):**
- Title: "How Coaching Builds Growth"
- Body: "Coaching turns feedback into transformation. It gives structure to practice and purpose to reflection. In games and in learning, growth happens fastest when students can:"

**3-step cards (Card component — iop5RYIDR, variant l_51U7a4c):**

| Step | Title | Description |
|---|---|---|
| 1 | Observe | See what happened and why it mattered |
| 2 | Reflect | Get feedback and discuss it safely. |
| 3 | Adjust | Apply insights in the next round. |

**Visual:** Decorative circle/arc background images + step illustration images scattered around cards.

**White2 torn paper divider** at bottom (cllBPIiNd).

---

### 5. Meeting the Learner Where They Are (nodeId: e0WrhOR6l)
- **Background:** White
- **Padding:** 188px all sides
- **Layout:** Vertical stack, max-width 1232px

**Red panel (left):**
- H4: "Meeting the Learner Where They Are" (`/Display/Heading 4`)
- Body L: "One student joined without ranked experience; they were quiet, hesitant, and unsure."

**Story image panel** (background: `https://framerusercontent.com/images/gWpXw5tP65onfWnJW7bPW1HEo4.jpg`, 399px tall):
- Overlay card with story text:
  > "His coach didn't push him into competition right away; instead, they focused on team communication and game sense. By the third week, he was calling plays mid-match, the same player teachers said 'never spoke up in class.'"
- **Button:** "Read more stories" → `/blog` (G_7udIwcU, variant GiVk3uoHD)

**Decorative image:** `https://framerusercontent.com/images/bEJjMvkURhb7lziHBNuEvuTyDI.png` (character illustration)

**Black-1 torn paper divider** at bottom (xXXvJAqHn).

---

### 6. Connected Pedagogies (nodeId: TgNWoa_4_)
- **Background:** `/Black/Black`
- **Padding:** 144px top, 188px bottom

**H4:** "Connected pedagogies"

**3 dark cards (Card component — mTrbgx1O_, variant beiSYiz3X):**

| Title | Description |
|---|---|
| Motivation | Coaches help students see progress before they feel it. |
| Social learning | Feedback becomes conversation — learning happens together. |
| Correct Difficulty | Guidance keeps challenge in the "just right" zone for each player. |

**Torn paper image** at bottom: `https://framerusercontent.com/images/FeQi62FV9fxmeo1VbqJoycOyQM.png`

---

### 7. FooterBannerSection (BNRkYbJEX)
- Copy: "Enroll into a transformational program today"
- `kylqqg5uj="false"` — no dual CTA; standard footer only

---

## Notes

- **Template role:** This page is the structural template for pedagogy children pages. The Observe/Reflect/Adjust framework and 3-card "Connected pedagogies" section can be reused across sub-topics (e.g., `/pedagogy/reflection`, `/pedagogy/motivation`).
- **Section 5 story** is a strong testimonial-style vignette — could pull from CMS Blog posts or be hardcoded per topic.
- No Rive animation on this page.
- The hero's two large decorative images (left-bottom and right-top anchored) create a visual frame — this layout pattern is unique to this page.
- The "Connected pedagogies" section mirrors the same black 3-card layout used on `/games` ("League of Legends strikes that balance") and `/ekuzo-team` ("A Real Team Season").
- Next.js: Static page at `/coaching`. If used as a template for pedagogy children, create a layout component from this structure.
