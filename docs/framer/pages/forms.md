# /forms

**Framer nodeId:** QxCSkgabT
**Status:** Draft
**Type:** Design reference / form library page
**Root breakpoint:** Desktop (1200px) — not DesktopLarge
**Layout:** Vertical stack of 4 form variants on a single canvas

## Purpose

This is a design reference page containing all form variants used across the site. Not a public-facing page — functions as a Framer design canvas for form design and testing. The forms here are the canonical definitions; the `/ekuzo100-4-week-intro` and `/ekuzocamps-seasonal` pages pull their form content from these designs.

---

## Form Variants

### Form 1: Start a conversation (nodeId: TP4H_frFd)
Used for school/organization outreach (the "Start a conversation" CTA seen on /pedagogy and elsewhere).

| Field | Type | Required |
|---|---|---|
| Name | Text | Yes |
| Organization | Text | No |
| Toggle | Toggle component (iisrDee_L, variant H4LUEc1uL) | — |
| What are you hoping to explore | Text | No |

**Button:** "Submit" — white bg, red text `rgb(249,37,36)`

---

### Form 2: EKUZO100 (nodeId: GnGUmdFNW)
Enrollment form for the E100 intro program.

| Field | Type | Required |
|---|---|---|
| Parent name | Text | Yes |
| Parent email | Text | Yes |
| Student name | Text | Yes |
| Student age | Radio: 10-12 / 13-15 / 16-18 | Yes |
| Student gender | Radio: Male / Female / Non-binary | Yes |
| Main games student plays | Text | No |
| Schedule preference | Radio: Afternoon (4:00–5:30 PM) / Evening (7:00–8:30 PM) | No |

**Button:** "Next" — red bg, white text

---

### Form 3: EKUZOTEAMS (nodeId: Re2Vsb9Pg)
Enrollment form for EKUZO Teams program. Identical to EKUZO100 except:
- Heading: "EKUZOTEAMS"
- Schedule preference adds **"During school day"** as a third option

| Field | Type | Required |
|---|---|---|
| Parent name | Text | Yes |
| Parent email | Text | Yes |
| Student name | Text | Yes |
| Student age | Radio: 10-12 / 13-15 / 16-18 | Yes |
| Student gender | Radio: Male / Female / Non-binary | Yes |
| Main games student plays | Text | No |
| Schedule preference | Radio: Afternoon / Evening / **During school day** | No |

**Button:** "Next" — red bg, white text

---

### Form 4: EKUZOCAMPS (nodeId: yYjLJXNXR)
Waitlist form for camps (not yet live).

| Field | Type | Required |
|---|---|---|
| Name | Text | Yes |
| Email | Text | Yes |

**Button:** "Get notified when available" — white bg, red text

---

## Notes

- All forms use ButtonForm component (F2EGNLJac, variant aquU0L5jX).
- All forms wire to the Make.com webhook via the Webhook.tsx override.
- The Toggle component in Form 1 (iisrDee_L, variant H4LUEc1uL) likely toggles between parent/school contact type — exact behavior requires reading the Toggle component definition.
- **Key difference between EKUZO100 and EKUZOTEAMS forms:** EKUZOTEAMS adds "During school day" as a schedule option, reflecting that school teams run during school hours.
- Next.js: These 4 forms should be implemented as React components, likely with a shared base form component and program-specific field extensions.
