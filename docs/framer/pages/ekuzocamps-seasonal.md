# /ekuzocamps-seasonal

**Framer nodeId:** CzNR6aatw
**Type:** Waitlist stub form
**Background:** White
**Layout:** Absolute positioning (anomaly — all children use position:absolute)

## Purpose

Minimal waitlist capture page for EKUZO Camps. Not a full program landing page — camps are not yet live. Collects name and email, submitting via the Webhook override (Make.com).

## Sections

### 1. Form (nodeId: RRsvYr74m)
Centered, max-width 1232px, padding 188px top/bottom.

**Heading**
- Text: "EKUZOCAMPS"
- Style: `/Display/Heading 5`

**Fields:**

| Field | Type | Required |
|---|---|---|
| Name | Text input | Yes |
| Email | Text input | Yes |

**Submit button:** "Get notified when available" — ButtonForm (componentId: F2EGNLJac), white bg, red text `rgb(249,37,36)`

### 2. FooterBannerSection (BNRkYbJEX)
- Copy: "Enroll into a transformational program today"
- Standard footer banner

## Notes

- This is a stub/waitlist page — EKUZO Camps is not yet available.
- Button style is inverted vs other CTAs (white bg, red text instead of red bg, white text).
- All elements use `position: absolute` — same layout anomaly as the Teams pages.
- Per project memory: a full Camps page is planned (see project_camps_direction.md — designed in Variant.com as a wireframe).
- Next.js implementation: Render a simple waitlist form at `/ekuzocamps-seasonal`. Wire to Make.com webhook.
