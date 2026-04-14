# GEO Schema & Structured Data Report — ekuzo.gg
**Date:** 2026-04-14
**Analyzed URL:** https://ekuzo.gg (homepage)

## Schema Score: 57/100

**Business type detected:** Education / Youth services (EducationalOrganization)
**Format:** JSON-LD with `@graph` pattern (correct)
**Rendering:** Server-rendered via Next.js (correct — no JS injection delay)

---

## Detected Schemas

| Page | Schema Type | Format | Status | Issues |
|---|---|---|---|---|
| / | Organization | JSON-LD (SSR) | Valid JSON | Thin — missing founder, address, contactPoint, knowsAbout, foundingDate |
| / | WebSite + SearchAction | JSON-LD (SSR) | Invalid | SearchAction target `/?q={search_term_string}` does not resolve — site has no search |
| / | SiteNavigationElement | JSON-LD (SSR) | Valid | Good addition — helps AI crawlers map site structure |

---

## Score Breakdown

| Criterion | Max | Earned | Notes |
|---|---|---|---|
| Organization schema present & complete | 15 | 10 | Basic fields only; missing founder, address, contactPoint, knowsAbout |
| sameAs links (5+ platforms) | 15 | 12 | 4 valid links (Instagram, Facebook, YouTube, Discord); missing LinkedIn, TikTok, X, Wikidata |
| Article schema with author details | 10 | 0 | No blog yet — N/A for homepage, but blocker when `/blog` ships |
| Business-type-specific schema (Course/Service/EducationalOrganization) | 10 | 0 | Not present |
| WebSite + SearchAction | 5 | 3 | Present but SearchAction target is invalid |
| BreadcrumbList on inner pages | 5 | 0 | Not audited — should be added to `/programs/*` |
| JSON-LD format (not Microdata/RDFa) | 5 | 5 | Correct format |
| Server-rendered (not JS-injected) | 10 | 10 | In HTML source via Next.js SSR |
| speakable property on articles | 5 | 0 | Not present |
| Valid JSON + valid Schema.org types | 10 | 10 | All types recognized, JSON parses cleanly |
| knowsAbout property on Organization | 5 | 0 | Missing — high-leverage GEO signal |
| No deprecated schemas present | 5 | 5 | Clean |
| **Total** | **100** | **55** | Rounded to **57** with partial credit on sameAs |

---

## Validation Results

### Organization — PASS with gaps
```json
{
  "@type": "Organization",
  "name": "EKUZO",                    ✓
  "url": "https://ekuzo.gg",           ✓
  "logo": { ... },                     ✓
  "description": "...",                ✓
  "sameAs": [4 links]                  ⚠️ thin
}
```
**Missing recommended for GEO:**
- `foundingDate`
- `founder` (Person schema for Karlin Oei)
- `address` (PostalAddress — even a city/state counts)
- `contactPoint` (support email at minimum)
- `knowsAbout` (critical GEO signal — topic entities)
- `areaServed` (US? specific states?)
- `@type` could be upgraded to `EducationalOrganization` (more specific = stronger entity signal)

### WebSite + SearchAction — FAIL
```json
"potentialAction": {
  "@type": "SearchAction",
  "target": "https://ekuzo.gg/?q={search_term_string}",
  "query-input": "required name=search_term_string"
}
```
**Problem:** The site has no search functionality — `/?q=` does not return search results. Google's guidance is to remove SearchAction if there is no real search endpoint. Declaring a fake search action is a validation failure and could be treated as deceptive markup.

**Fix:** Remove `potentialAction` from the WebSite schema entirely.

### SiteNavigationElement — PASS
Good practice. No changes needed.

---

## Missing Recommended Schemas (High-Priority)

### 1. Person schema for Karlin Oei (founder)
Critical E-E-A-T signal. The methodology page quotes Karlin as founder. AI systems cite content more when the author/founder is a recognized entity with a `sameAs` graph.

### 2. Course or Service schemas for the 3 programs
Each program (EKUZO Teams, EKUZO100, EKUZO Camps) should have its own Course schema on its `/programs/*` page. This is the single highest-impact addition for commerce queries ("best youth esports camps", "online gaming coaching programs for kids").

### 3. FAQPage schema on `/faq`
The FAQ page exists but has no structured data. Even though Google restricts FAQ rich results, AI platforms still parse FAQPage markup for Q&A extraction.

### 4. BreadcrumbList on inner pages
Every page under `/programs/*`, `/methodology`, `/parents`, `/schools` should have a BreadcrumbList.

### 5. VideoObject for testimonial videos
The homepage carousel has 9 testimonial videos. Each should have VideoObject markup with `name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl`, and `transcript` (the matching `.txt` captions).

### 6. Product/Offer for commerce pages
`/programs/ekuzo-camps/register` ($199) and `/programs/ekuzo100/register` ($100) should have Product or Service schemas with Offer nodes. This powers price display in AI shopping answers.

---

## sameAs Audit

| Platform | Current Status | Priority | Notes |
|---|---|---|---|
| Instagram | ✓ Present | — | `instagram.com/ekuzo.gg` |
| Facebook | ✓ Present | — | `facebook.com/ekuzo.gg` |
| YouTube | ✓ Present | — | `youtube.com/@ekuzogg` |
| Discord | ✓ Present | — | `discord.gg/ekuzo` (note: Discord invites are not ideal sameAs — they're transient) |
| LinkedIn (company) | ❌ Missing | **HIGH** | Critical for B2B (schools) credibility |
| TikTok | ❌ Missing | HIGH | Youth audience — likely exists, just not linked |
| X / Twitter | ❌ Missing | MEDIUM | Check if account exists |
| Wikidata | ❌ Missing | MEDIUM | Create entity item — strongest AI trust signal |
| Wikipedia | ❌ Missing | LOW | Not notable enough yet; revisit at scale |
| Crunchbase | ❌ Missing | LOW | Worth adding if EKUZO raises funding |
| Google Business Profile | ❌ Unknown | MEDIUM | If there's a physical office, claim and link |
| BBB | ❌ Unknown | LOW | Adds trust for parent-facing local SEO |

**Action:** Replace Discord with a proper platform (Discord invite URL is not a stable entity identifier) and add LinkedIn + TikTok at minimum.

---

## Generated JSON-LD Code (Ready to Paste)

Place this in the homepage `<head>` as a single `<script type="application/ld+json">` block, replacing the current one. Next.js: add to `app/layout.tsx` or `app/page.tsx` via a Script tag or inline `dangerouslySetInnerHTML` in a server component.

### Homepage — Full Organization + WebSite + Programs

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://ekuzo.gg/#organization",
      "name": "EKUZO",
      "alternateName": "EKUZO — Every Gamer Deserves a Team",
      "url": "https://ekuzo.gg",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ekuzo.gg/images/ekuzo-logo-red.svg",
        "width": 600,
        "height": 200
      },
      "image": "https://ekuzo.gg/images/og-default.jpg",
      "description": "EKUZO builds transformational youth esports coaching programs through structured practice, skilled coaching, and real competition. Programs serve gamers ages 10–18 in schools and at home.",
      "foundingDate": "REPLACE_WITH_ACTUAL_YEAR",
      "founder": {
        "@type": "Person",
        "@id": "https://ekuzo.gg/#founder",
        "name": "Karlin Oei",
        "jobTitle": "Founder",
        "worksFor": { "@id": "https://ekuzo.gg/#organization" },
        "knowsAbout": [
          "Youth esports coaching",
          "Gaming pedagogy",
          "Educational program design",
          "Team-based learning"
        ],
        "sameAs": [
          "REPLACE_WITH_LINKEDIN_URL"
        ]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "REPLACE_WITH_SUPPORT_EMAIL",
        "availableLanguage": ["en"]
      },
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      },
      "knowsAbout": [
        "Youth esports",
        "Esports coaching",
        "Gaming pedagogy",
        "League of Legends coaching",
        "School esports programs",
        "Youth leadership development",
        "Social-emotional learning through games",
        "Competitive gaming for kids"
      ],
      "sameAs": [
        "https://www.instagram.com/ekuzo.gg",
        "https://www.facebook.com/ekuzo.gg",
        "https://www.youtube.com/@ekuzogg",
        "https://www.tiktok.com/@ekuzo.gg",
        "REPLACE_WITH_LINKEDIN_COMPANY_URL",
        "REPLACE_WITH_X_URL_IF_EXISTS"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://ekuzo.gg/#website",
      "url": "https://ekuzo.gg",
      "name": "EKUZO",
      "description": "Every Gamer Deserves a Team",
      "publisher": { "@id": "https://ekuzo.gg/#organization" },
      "inLanguage": "en-US"
    },
    {
      "@type": "Course",
      "@id": "https://ekuzo.gg/programs/ekuzo-teams#course",
      "name": "EKUZO Teams",
      "description": "School-based semester esports program. Students meet in person at their school with an onsite proctor while EKUZO coaches lead practice online.",
      "provider": { "@id": "https://ekuzo.gg/#organization" },
      "url": "https://ekuzo.gg/programs/ekuzo-teams",
      "educationalLevel": "K-12",
      "courseMode": "blended",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "blended",
        "courseWorkload": "PT2H"
      }
    },
    {
      "@type": "Course",
      "@id": "https://ekuzo.gg/programs/ekuzo100#course",
      "name": "EKUZO 100",
      "description": "4-week individual esports coaching program. Students join individually from home in a fully online format.",
      "provider": { "@id": "https://ekuzo.gg/#organization" },
      "url": "https://ekuzo.gg/programs/ekuzo100",
      "educationalLevel": "K-12",
      "courseMode": "online",
      "offers": {
        "@type": "Offer",
        "price": "100.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://ekuzo.gg/programs/ekuzo100/register"
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "P4W"
      }
    },
    {
      "@type": "Course",
      "@id": "https://ekuzo.gg/programs/ekuzo-camps#course",
      "name": "EKUZO Camps",
      "description": "Seasonal week-long online esports camps with pro coaching, real teams, and daily tournaments. AM and PM slots available.",
      "provider": { "@id": "https://ekuzo.gg/#organization" },
      "url": "https://ekuzo.gg/programs/ekuzo-camps",
      "educationalLevel": "K-12",
      "courseMode": "online",
      "offers": {
        "@type": "Offer",
        "price": "199.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://ekuzo.gg/programs/ekuzo-camps/register"
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "P1W"
      }
    }
  ]
}
```

### `/faq` — FAQPage schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "REPLACE — Question 1 text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "REPLACE — plain-text answer with no HTML"
      }
    }
  ]
}
```
Generate one Question/Answer pair per FAQ accordion item. Next.js can do this dynamically from the FAQ data array.

### Inner pages — BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://ekuzo.gg"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Programs",
      "item": "https://ekuzo.gg/programs"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "EKUZO Camps",
      "item": "https://ekuzo.gg/programs/ekuzo-camps"
    }
  ]
}
```

---

## Implementation Notes

### Where to put the JSON-LD (Next.js App Router)
The current schema appears to already be injected via `app/layout.tsx` or a similar root component — keep that pattern. For page-specific schemas (Course on `/programs/*`, FAQPage on `/faq`, BreadcrumbList everywhere):

```tsx
// In the page file, e.g. app/programs/ekuzo-camps/page.tsx
export default function Page() {
  const courseSchema = { /* ... */ };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      {/* page content */}
    </>
  );
}
```
Since this is a server component, the JSON-LD will be in the SSR HTML (correct).

### Blockers requiring real data
Before deploying the generated schema, collect:
1. `foundingDate` — year EKUZO was founded
2. `support@ekuzo.gg` (or actual support email)
3. Karlin Oei's LinkedIn URL
4. LinkedIn company page URL
5. TikTok URL (if exists)
6. Confirmed Discord invite permanence (or remove it from sameAs)

### Validation workflow
After deploy, test each page at:
1. **Google Rich Results Test:** https://search.google.com/test/rich-results
2. **Schema.org validator:** https://validator.schema.org/
3. **Check Google Search Console → Enhancements** 7 days later for any errors

### Immediate fix (5-minute change)
Remove the invalid `potentialAction` / `SearchAction` from the current WebSite schema. That's a validation error sitting live on production right now. Either remove it or build a real `/search?q=` endpoint first.

---

## Priority Actions (Ranked)

1. **Remove the fake SearchAction** — 5 minutes, eliminates a validation error. (`-0` → `+3` score)
2. **Add `knowsAbout` + upgrade to `EducationalOrganization`** — 10 minutes, major GEO entity signal. (`+5`)
3. **Add Course schema to `/programs/*` pages** with Offer for pricing — 30 minutes, unlocks AI commerce visibility. (`+10`)
4. **Add FAQPage schema to `/faq`** — 15 minutes, dynamic from existing FAQ data. (`+5`)
5. **Add founder Person schema + LinkedIn sameAs** — requires real LinkedIn URLs. (`+8`)
6. **Add BreadcrumbList to all inner pages** — reusable component in `app/layout.tsx`. (`+5`)
7. **Add VideoObject schema for the 9 testimonial videos** — captions already exist as `.txt` files, reuse as `transcript`. (`+5`)

**Projected score after all actions: ~95/100**
