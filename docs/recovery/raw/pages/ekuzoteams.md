# EKUZOTeams (/ekuzoteams-semester-based) — Raw Framer Extraction
Extracted: 2026-03-25 | Framer nodeId: jc5S8rmHK | Canvas width: 1920px

---

## ⚠️ CRITICAL NOTE

This page in Framer contains **only an enrollment form** — no hero, no program marketing content, no copy sections. The page was never built as a full marketing page in Framer. The footer banner is also broken (positioned at `centerX="0%"` — off-screen).

This page needs to be built from scratch in Next.js. Reference the Programs Section component for the EKUZOTeams card copy, and the Camps page wireframe for structure inspiration.

---

## What's Here: Enrollment Form

**Heading:** "Enroll my gamer" (H5 style)

### Form Fields

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Parent name | Text input | Yes | — |
| Parent email | Text input | Yes | — |
| Student name | Text input | Yes | — |
| Student age | Radio group | Yes | 10–12 / 13–15 / 16–18 |
| Student gender | Radio group | Yes | Male / Female / Non-binary |
| Main games student plays | Text input | No | — |
| Schedule preference | Radio group | No | Afternoon (4:00–5:30 PM) / Evening (7:00–8:30 PM) / During school day |

### Submit
- Button: "Next" (red fill, white text)
- Component: `F2EGNLJac` (Button - Form)

### Layout
- Form is absolutely positioned at `centerX="50%"` `centerY="18%"` — buried
- Has a modal-scroll wrapper — suggests this was designed as an overlay/modal, not a page

---

## Footer Banner

- "Enroll into a transformational program today"
- **BROKEN** — positioned at `centerX="0%"` `centerY="0%"` (off-screen)

---

## What the EKUZOTeams Page SHOULD Have (from other sources)

Based on CLAUDE.md, the Programs Section component, and the schools page:

### Program Description (from ProgramsSection component props)
- School-based semester team program
- Complex pricing — "discuss before building" per CLAUDE.md
- Runs during or after school hours
- Students meet in person with an onsite proctor; EKUZO coaches lead online
- School partnership required
- Credit-bearing elective option

### Form Data Captured (useful for Next.js enrollment flow)
- Parent name + email
- Student name, age (10–12 / 13–15 / 16–18), gender
- Games they currently play
- Schedule preference (afternoon / evening / during school)
- Multi-step form ("Next" button suggests step 1 of multiple)

### Note on Commerce
- CLAUDE.md flags EKUZOTeams as "complex pricing, discuss before building"
- Do NOT build payment flow for this yet
- Contact form → Make.com webhook is sufficient for v1

---

## Build Direction for Next.js

This page needs to be built from scratch. Suggested structure:

1. **Hero** — Black or red bg, "EKUZO Teams" H1, tagline
2. **What it is** — School-based, semester format, team structure
3. **How it works** — School setup → EKUZO coaches online → team play
4. **Who it's for** — Schools, grades 6–12
5. **Outcomes** — Attendance, engagement, belonging (from schools page ticker)
6. **Enrollment CTA** — "Start a conversation" (contact modal) not direct purchase
7. **FAQ** — School-specific questions
8. **Footer Banner** — School-specific copy

---

## Breakpoints

- DesktopLarge: 1920px (primary)
- Desktop: 1200px
- Tablet: 810px
- Phone: 390px
