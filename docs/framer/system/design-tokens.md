# EKUZO Framer Design Tokens

Extracted from Framer project via MCP on 2026-03-25.

---

## Text Styles

### Display / Headings

| Name | Font | Size | Weight | Line Height | Letter Spacing | Transform | Tag |
|------|------|------|--------|-------------|----------------|-----------|-----|
| /Display/Heading 1 | Tungsten Narrow Black | 256px | Black | 228px | 0px | uppercase | h1 |
| /Display/Heading 2 | Tungsten Narrow Black | 160px | Black | 140px | 3.2px | uppercase | h2 |
| /Display/Heading 3 | Tungsten Narrow Black | 120px | Black | 96px | 1.2px | uppercase | h3 |
| /Display/Heading 4 | Test Die Grotesk A Bold | 64px | Bold | 64px | -1.28px | none | h4 |
| /Display/Heading 5 | Test Die Grotesk C Bold | 40px | Bold | 48px | 0.8px | none | h5 |
| /Display/Heading 6 | Test Die Grotesk A Bold | 16px | Bold | 20px | 0.16px | none | h6 |

### Desktop Body

| Name | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| /Desktop Body/XS/Regular | Test Die Grotesk A Regular | 16px | Regular | 24px | 0.16px |
| /Desktop Body/XS/Medium | Test Die Grotesk A Medium | 16px | Medium | 24px | 0px |
| /Desktop Body/XS/Bold | Test Die Grotesk A Bold | 16px | Bold | 24px | 0px |
| /Desktop Body/S/Regular - Black | Test Die Grotesk A Regular | 20px | Regular | 28px | 0px |
| /Desktop Body/S/Regular - White | Test Die Grotesk A Regular | 20px | Regular | 28px | 0px |
| /Desktop Body/S/Medium | Test Die Grotesk A Medium | 20px | Medium | 28px | 0px |
| /Desktop Body/S/Bold | Test Die Grotesk A Regular | 20px | Regular | 28px | 0px |
| /Desktop Body/M/Regular | Test Die Grotesk A Regular | 24px | Regular | 34px | -0.24px |
| /Desktop Body/M/Medium | Test Die Grotesk A Medium | 24px | Medium | 34px | -0.24px |
| /Desktop Body/M/Bold | Test Die Grotesk A Bold | 24px | Bold | 34px | -0.24px |
| /Desktop Body/L/Regular | Test Die Grotesk A Regular | 28px | Regular | 38px | -0.56px |
| /Desktop Body/L/Medium | Test Die Grotesk A Medium | 28px | Medium | 38px | -0.56px |
| /Desktop Body/L/Bold | Test Die Grotesk A Bold | 28px | Bold | 38px | -0.56px |

### Labels

| Name | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| /Label/XS/Regular | Test Die Grotesk A Regular | 16px | Regular | 16px | 0.16px |
| /Label/XS/Medium | Test Die Grotesk A Medium | 16px | Medium | 16px | 0.16px |
| /Label/XS/Bold | Test Die Grotesk A Bold | 16px | Bold | 16px | 0.16px |
| /Label/S/Regular | Test Die Grotesk A Regular | 20px | Regular | 20px | 0.2px |
| /Label/S/Medium | Test Die Grotesk A Medium | 20px | Medium | 20px | 0.2px |
| /Label/M/Regular | Test Die Grotesk A Regular | 24px | Regular | 24px | 0.24px |
| /Label/M/Medium | Test Die Grotesk A Medium | 24px | Medium | 24px | 0.24px |

### Font Notes
- **Tungsten Narrow Black** = primary display font (licensed from typography.com). Next.js uses Bebas Neue as placeholder.
- **Test Die Grotesk A** = body/UI font (custom licensed). Next.js uses Inter as placeholder.
- **Test Die Grotesk C Bold** = used only for /Display/Heading 5.

---

## Color Styles

| Name | Path | Hex / RGBA |
|------|------|------------|
| Black | /Black/Black | #000000 |
| Black 70% | /Black/70% | rgba(0,0,0,0.7) |
| Black 60% | /Black/60% | rgba(0,0,0,0.6) |
| Black 50% | /Black/50% | rgba(0,0,0,0.5) |
| Black 40% | /Black/40% | rgba(0,0,0,0.4) |
| Light Grey | /Grey/Light Grey | #EFEECD → rgb(239,238,237) |
| Dark Grey | /Grey/Dark Grey | rgb(79,79,79) → #4F4F4F |
| Grey | /Grey/Grey | #CCCCCC |
| White | /White/White | #FFFFFF |
| White 70% | /White/70% | rgba(255,255,255,0.7) |
| White 60% | /White/60% | rgba(255,255,255,0.6) |
| White 50% | /White/50% | rgba(255,255,255,0.5) |
| White 40% | /White/40% | rgba(255,255,255,0.4) |
| Red | /Red/Red | rgb(249,37,36) → #F92524 |

### Color Notes
- **Red** (#F92524 / rgb(249,37,36)) = EKUZO brand red. Slightly warmer than pure red.
- **Light Grey** (rgb(239,238,237)) = off-white section background. In Next.js referenced as `bg-[#efeecd]` — confirm exact hex.
- No dark mode variants defined for any color style.
