# Assets Inventory

Extracted from Framer project XML. All component IDs, code file IDs, and CDN URLs are accurate as of extraction date (2026-03-25).

---

## Pages

| Path | nodeId |
|---|---|
| / | augiA20Il |
| /programs | hsGVu9apR |
| /parents | duNUzONol |
| /games | HMqJHm3uj |
| /about | ODMztkQ5r |
| /faqs | wbwKCVQlP |
| /ekuzoteams-semester-based | jc5S8rmHK |
| /ekuzo100-4-week-intro | lUz6fAJxV |
| /ekuzocamps-seasonal | CzNR6aatw |
| /terms-of-service | I3pvCXQOv |
| /privacy-policy | N5AbZjoIZ |
| /schools | IPSPrK_wp |
| /pedagogy | QRvASvvHF |
| /ekuzo100 | IACUTKl5t |
| /ekuzo-team | hgW7CkVpp |
| /coaching | rvhUJqp10 |
| /blog | yEIHmvXz2 |
| /blog/:slug | s57VwuSv9 |
| /forms | QxCSkgabT |

---

## Components

| nodeId | Name | Notes |
|---|---|---|
| G_7udIwcU | Button | |
| Z9OcG4X2A | Eyebrows | Eyebrow label component |
| sCSPy3XNh | List | |
| WSTEvGlIk | Card | |
| mTrbgx1O_ | Card | Duplicate name — separate component |
| rtb4ovQgf | Faq Section - Question | |
| HnNOtigLD | Ecosystem Section - Card | |
| DEPSJeeiY | Header | Site-wide nav header |
| iop5RYIDR | Card | Third Card variant |
| QsAFUtqlA | Our Approach Section | Reused across most pages |
| QVJuYtM47 | Programs Section | |
| BNRkYbJEX | Footer Banner Section | Primary footer (used on most pages) |
| x3eHpc90M | Faq Section | Wraps FAQ accordion |
| DdV4_HJre | Video Card Section | Desktop video carousel |
| iiumyo07V | Button Scroll | Scroll-to CTA button |
| J5646SU6d | How it works Section - Large Card | |
| jpjISij1R | Ten Pillars Section - Card | Used on /pedagogy |
| jIXIWTsEJ | Faq Single | |
| E33B1To0_ | Faq Section - Question - Safety | Category-specific FAQ accordion |
| bWYqlYUpG | Faq Section - Question - Program | Category-specific FAQ accordion |
| nSe7o8gij | Faq Section - Question - Outcomes | Category-specific FAQ accordion |
| PT1R5edWn | Faq Section - Question - Cost & Value | Category-specific FAQ accordion |
| PQAPBF0g1 | Faq Section - Question - Enrollment | Category-specific FAQ accordion |
| R2ws9cJ3i | Blog Card | CMS blog grid card |
| t00hdMrB6 | Blog Filter Section | Blog index filter + grid |
| eBYd_25ww | Video Card Section Mobile | Mobile video carousel |
| IwVl9EEIz | Footer Banner Section | Alternate footer (used on /pedagogy, /ekuzo100) |
| oQxBiSoT9 | Blog Page - Button | |
| FnwdX463o | Ecosystem - Desktop Section 🛑 Deprecated | Do not use |
| CtnHFUGGT | Ecosystem - Mobile Section 🛑 Deprecated | Do not use |
| yY5pfBKjH | Testimonials Section | |
| cllBPIiNd | White-2 | Torn paper divider |
| yEFYiUimY | Black-3 | Torn paper divider |
| VZgZ8tZvl | Black-2 | Torn paper divider |
| lgis88RSC | White-1 | Torn paper divider |
| UdVin8rIr | Red-1 | Torn paper divider |
| xCwzWyfvL | Scroll-Button | Fixed scroll CTA |
| xXXvJAqHn | Black-1 | Torn paper divider |
| SjKkfkeMv | Video - Popup | Video lightbox/modal |
| F2EGNLJac | Button - Form | Form submit button |
| YXsorOdcL | Blog Feature Card | Featured blog card (hero) |
| iisrDee_L | Toggle | |
| nRsTqcN_b | Form Modal | Enrollment form modal wrapper |
| uej9tbzM3 | Left - Image | Zigzag image-left card |
| qVNIekiWp | School - Card | School enrollment path card (/ekuzo-team) |
| hdru6dLe5 | Home - Card | Home enrollment path card (/ekuzo-team) |
| zBGrVgqJp | Mobile - Ecosystem | Mobile ecosystem section |
| Q7_Lcju10 | Open Modal Button | Opens enrollment modal |
| wVUDECIsO | Enroll my Gamer popup | Enrollment popup/modal |
| jXgTuvJAK | Terms | Legal text component (terms/privacy pages) |

---

## Component XML Files

Fully extracted XML saved to `/docs/framer/system/components/`:

| File | nodeId | Description |
|---|---|---|
| Header.xml | DEPSJeeiY | Site nav — logo, 5 nav links, "Start a conversation" CTA |
| FooterBannerSection.xml | BNRkYbJEX | Red pre-footer CTA with customizable H4 heading (prop `ibdR1RB7I`) |
| EnrollMyGamerPopup.xml | wVUDECIsO | 1024px enrollment modal — 3 program links |
| OurApproachSection.xml | QsAFUtqlA | White section — eyebrow, H4 heading, 3 list items, body copy, Black3 divider |
| ProgramsSection.xml | QVJuYtM47 | Sticky-scroll 3-card programs overview |
| TestimonialsSection.xml | yY5pfBKjH | Red section — Karlin Oei quote, Red1 dividers top/bottom |
| blog-slug.xml | s57VwuSv9 | Blog post template — H4 title, hero image, author byline, "Keep reading" 3-col grid |

---

## Code Components (Rive Animations)

| codeFileId | Path | Used On | Notes |
|---|---|---|---|
| Xdh5h_y | Rive_Animation/Eco_system.tsx | / (home) | Desktop, SCROLL_PX=10000, artboard "Main - Desktop" |
| dDNDl2J | Rive_Animation/Eco_system_Mobile.tsx | / (home, mobile) | Mobile, scroll 0–500, uses `.get-actions-scroll-container` |
| frGiDQi | Rive_Animation/Home_schools.tsx | /programs /parents /schools /ekuzo100 | Desktop, SCROLL_PX=14000, same .riv as Eco_system |
| mpHBfzw | Rive_Animation/Home_Schools_Mobile.tsx | /programs /parents /schools (mobile) | Mobile variant of Home_schools |

## Code Overrides

| codeFileId | Path | Purpose |
|---|---|---|
| mvZUv8R | Rive_Animation/Scroll_Section.tsx | Appends `.get-actions-scroll-container` class to scroll container |
| LH7jPb8 | CMS/CMS_Limit_Words.tsx | Truncates CMS text to 33 chars with ellipsis |
| sZN32Oi | Webhook.tsx | POSTs form data to Make.com webhook |
| GGMYz6h | Disable_auto.tsx | Resets ModalScroll scrollTop to 0 on mount |
| qKQSlH5 | Disable_auto_1.tsx | Extended version: resets ModalScroll + ModalScroll2 |

---

## Rive Animation Files

| File | CDN URL | Used By |
|---|---|---|
| ekuso_creative_web__brand__ecosystem_desktop_V02riv.riv | https://ucarecdn.com/bd3c483c-3091-435f-95fc-a3000425b676/ekuso_creative_web__brand__ecosystem_desktop_V02riv.riv | Eco_system.tsx, Home_schools.tsx |
| ekuso_creative_web__brand__ecosystem_mobileriv.riv | https://ucarecdn.com/225a3e68-12b9-41bc-ab0b-0c5ec40bd732/ekuso_creative_web__brand__ecosystem_mobileriv.riv | Eco_system_Mobile.tsx, Home_Schools_Mobile.tsx |
| D693XtxMBjnOWB0t8DkBPKck.riv | Embedded in /programs page | Programs hero Rive (not a code component — embedded directly) |

### Rive State Machine Config

| Component | Artboard | State Machine | Input | Progress Range |
|---|---|---|---|---|
| Eco_system.tsx | Main - Desktop | State Machine 1 | ScrollProgressIllo | 0–1000 |
| Eco_system_Mobile.tsx | Main - Mobile | State Machine 1 | ScrollProgressIllo | 0–500 |
| Home_schools.tsx | Main - Desktop | State Machine 1 | ScrollProgressIllo | 0–1000 |
| Home_Schools_Mobile.tsx | Main - Mobile | State Machine 1 | ScrollProgressIllo | 0–500 |

---

## Key CDN Assets

### Image Placeholder
- Generic placeholder: `https://ucarecdn.com/2a1f2380-75f3-4948-8fda-e8abc808e1ca/GenericPlaceholder.png`

### Torn Paper Dividers (framerusercontent.com)
Used as `<img>` or background images between sections.
- White2, Black2, Black3, Black1, Red1, White1 — component variants used as section dividers

### Videos (CMS-hosted)
9 mp4 files hosted on framerusercontent.com/assets/ — see /docs/framer/cms/videos.md for full list.

### Blog Images
Hosted on framerusercontent.com/images/ — see /docs/framer/cms/blog.md for URLs.

---

## Fonts

| Font | Role | Framer ID | Next.js Fallback |
|---|---|---|---|
| Tungsten Narrow Black | Display headings (H1–H3) | CUSTOMV2 | Bebas Neue (Google Fonts) |
| Test Die Grotesk A Regular | Body text | CUSTOMV2 | Inter |
| Test Die Grotesk A Medium | Body medium | CUSTOMV2 | Inter (500) |
| Test Die Grotesk A Bold | Body bold, H4 | CUSTOMV2 | Inter (700) |
| Test Die Grotesk C Bold | H5 headings | CUSTOMV2 | Inter (700) |

---

## Webhook

- **Make.com webhook URL:** `https://hook.us2.make.com/xl4bb6oyilsj8cugl8dgal5446a1jfj3`
- Used by: Webhook.tsx override on all enrollment/contact forms
- Payload: FormData fields + `pageUrl` + `submittedAt`
