# Legal Pages — Live Site Capture
Captured: 2026-03-25

---

## Privacy Policy (/privacy-policy)

**URL:** ekuzo.gg/privacy-policy
**Scroll height:** ~10,276px
**Page title:** "Privacy Policy | EKUZO"

### Layout
- **Nav:** Standard white bg nav (red wordmark, red "Start a conversation" filled button)
- **Background:** White `rgb(255, 255, 255)` throughout — single column
- **H4:** "Privacy Policy" — 64px, bold, black
- **Body:** Standard legal text, single-column, no section divisions with colored backgrounds
- No footer banner — page ends with standard white footer

### Key design notes
- No colored hero section — page starts with white nav directly into content
- Single-column text layout, no sidebar
- Standard footer (not footer banner)

---

## Terms of Service (/terms-of-service)

**URL:** ekuzo.gg/terms-of-service
**Scroll height:** ~9,524px
**Page title:** "Terms of service | EKUZO"

### Layout
- Identical structure to Privacy Policy
- **Nav:** Standard white bg nav
- **Background:** White throughout — single column
- **H4:** "Terms of service" (inferred — matches privacy policy pattern)
- **Body:** Standard legal text, single-column
- Standard footer

---

## Build Notes

Both legal pages are minimal:
- No hero section, no colored backgrounds, no decorative elements
- In Next.js: simple `<article>` or prose layout with standard nav/footer
- Content: render from CMS or static MDX — not complex enough to need a full page component
- Use Tailwind prose plugin for body text formatting
