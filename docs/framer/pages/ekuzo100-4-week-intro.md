# /ekuzo100-4-week-intro

**Framer nodeId:** lUz6fAJxV
**Type:** Enrollment form page (multi-field)
**Background:** White
**Layout:** In-flow vertical stack

## Purpose

Multi-field enrollment form for EKUZO programs. Collects parent and student info with radio groups for age, gender, and schedule preference. Submitted via the Webhook override (Make.com).

## Sections

### 1. Form (nodeId: xkkQKYHO_)
Centered horizontal stack, max-width 1232px, padding 188px top/bottom.

**Heading**
- Text: "Enroll my gamer"
- Style: `/Display/Heading 5`

**Fields (all required unless noted):**

| Field | Type | Options |
|---|---|---|
| Parent name | Text input | — |
| Parent email | Text input | — |
| Student name | Text input | — |
| Student age | Radio group | 10-12 / 13-15 / 16-18 |
| Student gender | Radio group | Male / Female / Non-binary |
| Main games student plays | Text input | Not required |
| Schedule preference | Radio group | Afternoon (e.g., 4:00–5:30 PM) / Evening (e.g., 7:00–8:30 PM) |

**Submit button:** "Next" — ButtonForm (componentId: F2EGNLJac), red bg `rgb(249,37,36)`, white text

### 2. FooterBannerSection (BNRkYbJEX)
- Copy: "Enroll into a transformational program today"
- Standard footer banner used across site

## Notes

- The "Schedule preference" radio group does NOT include "During school day" — that was in the previous session's summary but the live XML shows only Afternoon and Evening options.
- Form is wrapped in ModalScroll (nodeId: kv5QBW9Kx) — the Disable_auto.tsx override resets scroll to top on mount.
- No Rive animation on this page.
- This is the form target for CTAs like "Enroll my gamer" seen across the site.
- Next.js implementation: This should be a dedicated route `/ekuzo100-4-week-intro` rendering a full-page form. Wire to Make.com webhook using the Webhook.tsx logic.
