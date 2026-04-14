# GEO Schema Report — Program Pages (per-page)
Date: 2026-04-14
Scope: `/programs/ekuzo-camps`, `/programs/ekuzo100`, `/programs/ekuzo-teams`
Source of truth: `lib/schema.ts` (all schemas server-rendered via `components/JsonLd.tsx`)

All three pages inherit the same root `@graph` (`EducationalOrganization` + `WebSite` + `SiteNavigationElement`) from `app/layout.tsx`. That portion was already audited in `GEO-SCHEMA-REPORT.md` (Org-level score: 13/15, 6 `sameAs`, missing `address`/`contactPoint`/`areaServed`, `foundingDate` not ISO 8601). Those fixes apply to all three pages once made once. This report focuses on **per-page** schemas (Course, BreadcrumbList) and per-page issues.

---

## Summary Scores

| Page | Score | Course Completeness | Offers | CourseInstance dates | Canonical |
|---|---|---|---|---|---|
| `/programs/ekuzo-camps` | **75/100** | Partial | 1 Offer | ❌ none | ❌ null |
| `/programs/ekuzo100`    | **75/100** | Partial | 1 Offer | ❌ none | ❌ null |
| `/programs/ekuzo-teams` | **76/100** | Partial | 2 Offers ✅ | ⚠️ startDate only | ❌ null |

Score deltas are small because all three share the root graph and `buildBreadcrumbSchema`. Teams edges ahead by 1 point for the Offer array + `startDate`.

---

## Page 1 — `/programs/ekuzo-camps`

**Detected schemas** (all JSON-LD, server-rendered):
1. Root `@graph`: `EducationalOrganization` + `WebSite` + `SiteNavigationElement`
2. `Course` (`@id: https://ekuzo.gg/programs/ekuzo-camps#course`)
3. `BreadcrumbList`

**Course validation** (`lib/schema.ts:119`):

| Property | Status |
|---|---|
| `name` | ✅ "EKUZO Camp" |
| `url` | ✅ |
| `description` | ✅ |
| `provider` (`@id` ref → Org) | ✅ |
| `teaches` | ✅ 3 topics |
| `educationalLevel` | ✅ "Beginner to Intermediate" |
| `inLanguage` | ✅ "en" |
| `hasCourseInstance.courseMode` | ✅ "Online" |
| `hasCourseInstance.courseWorkload` | ✅ "PT15H" |
| `hasCourseInstance.startDate` | ❌ **Missing** |
| `hasCourseInstance.endDate` | ❌ Missing |
| `hasCourseInstance.instructor` | ❌ Missing (no coach bios yet) |
| `hasCourseInstance.location` | ❌ Missing (VirtualLocation) |
| `offers.price` | ✅ "199" USD |
| `offers.availability` | ✅ InStock |
| `offers.priceValidUntil` | ✅ "2026-06-30" |
| `offers.url` | ✅ /register |
| `review` / `aggregateRating` | ❌ Missing |

**Page-level issues:**
- `<link rel="canonical">` **missing** (this page will compete with itself across `dev--ekuzo.netlify.app` and `ekuzo.gg`). High-priority fix.
- `<title>` is strong ("EKUZO Camp — Level Up Your Game This Summer"). No issue.
- Word count 1,131 — healthy for a Course entity.

**Fix for this page specifically** (edit `lib/schema.ts:131`):

```ts
hasCourseInstance: {
  "@type": "CourseInstance",
  courseMode: "Online",
  courseWorkload: "PT15H",
  // Pick the next camp week as the canonical instance for schema
  startDate: "2026-06-15",
  endDate: "2026-06-19",
  location: {
    "@type": "VirtualLocation",
    url: `${SITE}/programs/ekuzo-camps/register`,
  },
  // Once /about exists:
  // instructor: [{ "@id": `${SITE}/about#coach-slug` }],
  description: "One-week camp, 3 hours per day, Monday–Friday",
},
```

If Camps runs multiple weeks, use an array of `CourseInstance` — one per week/slot — rather than trying to cram all of them into a single instance. That also lets you express different `startDate` + `availability` per slot, which mirrors the `WEEKS` data array on the page.

---

## Page 2 — `/programs/ekuzo100`

**Detected schemas**:
1. Root `@graph`
2. `Course` (`@id: .../ekuzo100#course`)
3. `BreadcrumbList`

**Course validation** (`lib/schema.ts:147`):

| Property | Status |
|---|---|
| `name` / `url` / `description` | ✅ |
| `provider` (Org ref) | ✅ |
| `teaches` | ✅ 3 topics |
| `hasCourseInstance.courseMode` | ✅ "Online" |
| `hasCourseInstance.courseWorkload` | ✅ "PT12H" |
| `hasCourseInstance.startDate` / `endDate` | ❌ **Missing** |
| `hasCourseInstance.instructor` | ❌ Missing |
| `hasCourseInstance.location` | ❌ Missing |
| `offers.price` | ✅ "100" USD |
| `offers.availability` | ✅ InStock |
| `offers.priceValidUntil` | ✅ "2026-06-30" |
| `review` / `aggregateRating` | ❌ Missing |

**Page-level issues:**
- Canonical missing (same as above).
- Word count 521 — on the thin side for a Course page. Not a schema issue, but flag for `/geo content`: add an FAQ section (2-3 Q&A), a "Who this is for" list, and a day-in-the-life paragraph. These also feed a future `FAQPage` schema on the page.
- `<title>` is clean.

**Fix** (edit `lib/schema.ts:159`):

```ts
hasCourseInstance: {
  "@type": "CourseInstance",
  courseMode: "Online",
  courseWorkload: "PT12H",
  startDate: "2026-05-04",    // next cohort
  endDate: "2026-05-31",
  location: {
    "@type": "VirtualLocation",
    url: `${SITE}/programs/ekuzo100/register`,
  },
  description: "4-week program, two 90-minute sessions per week",
},
```

EKUZO100 rolls monthly per CLAUDE.md, so once `/about` exists this is also the easiest place to add `instructor` refs — each cohort only has 1-2 coaches assigned.

---

## Page 3 — `/programs/ekuzo-teams`

**Detected schemas**:
1. Root `@graph`
2. `Course` (`@id: .../ekuzo-teams#course`)
3. `BreadcrumbList`

**Course validation** (`lib/schema.ts:175`):

| Property | Status |
|---|---|
| `name` / `url` / `description` | ✅ |
| `provider` (Org ref) | ✅ |
| `teaches` | ✅ 4 topics (has "Team coordination" — good differentiator) |
| `hasCourseInstance.courseMode` | ✅ "Online" |
| `hasCourseInstance.courseWorkload` | ✅ "PT48H" |
| `hasCourseInstance.startDate` | ✅ "2026-08-31" |
| `hasCourseInstance.endDate` | ❌ Missing |
| `hasCourseInstance.instructor` | ❌ Missing |
| `hasCourseInstance.location` | ❌ Missing |
| `offers` (array of 2) | ✅ Pay-in-full $576 + 4-payment $640 — correct use of Offer[] |
| `offers[*].name` | ✅ "Pay in full" / "4-payment plan" |
| `offers[*].description` | ✅ Explains discount and installment terms |
| `offers[*].priceValidUntil` | ✅ "2026-08-31" |
| `review` / `aggregateRating` | ❌ Missing |

**Page-level issues:**
- Canonical missing.
- `<title>` clean, description strong.
- Word count 663.

**Fix** (edit `lib/schema.ts:188`):

```ts
hasCourseInstance: {
  "@type": "CourseInstance",
  courseMode: "Online",
  courseWorkload: "PT48H",
  startDate: "2026-08-31",
  endDate: "2026-12-18",   // semester end
  location: {
    "@type": "VirtualLocation",
    url: `${SITE}/programs/ekuzo-teams/register`,
  },
  description: "Fall 2026 semester. Two 90-minute sessions per week, ~16 weeks.",
},
```

Teams is the most complete schema of the three and the offer modelling is genuinely good — keep it as the reference pattern if you add more paid programs.

---

## Cross-cutting fixes (apply once, helps all three pages)

These are single-file edits in `lib/schema.ts` that improve every program page simultaneously.

### 1. Add `VirtualLocation` to shared course fields

Right now `sharedCourseFields` (`lib/schema.ts:111`) only sets `@context`, `@type`, `provider`, `educationalLevel`, `inLanguage`. Consider moving `hasCourseInstance.courseMode: "Online"` and a default `location: { "@type": "VirtualLocation" }` up there too — it's the same for all three programs.

### 2. Add `review` to each Course from testimonial quotes

You already have 9 testimonial transcripts in `lib/testimonialTranscripts.ts`. Map 1–3 per program (e.g., Laura Hogan → Teams because she's an administrator; Rajitha/Becky → Camps because they're parents; student videos → EKUZO100) into `Review` nodes nested inside each Course:

```ts
review: [
  {
    "@type": "Review",
    author: { "@type": "Person", name: "Laura Hogan" },
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    reviewBody: testimonialTranscripts.lauraHoganMirusAcademy.slice(0, 240),
  },
],
```

Do NOT add `aggregateRating` unless you can publicly back the `reviewCount`. Google tightened self-serving review enforcement in 2024.

### 3. Add canonical tags

None of the three program pages has `<link rel="canonical">`. This is the single biggest non-schema win — right now dev preview and prod will split ranking/citation signals. Add to each page's Next.js `metadata` export:

```ts
export const metadata: Metadata = {
  title: "EKUZO Camp — Level Up Your Game This Summer",
  description: "...",
  alternates: { canonical: "https://ekuzo.gg/programs/ekuzo-camps" },
};
```

Or better, set it once in `app/layout.tsx` metadata with `metadataBase: new URL("https://ekuzo.gg")` and let inner pages inherit/override with relative canonicals.

### 4. Add `instructor` once `/about` exists

All three CourseInstance blocks are ready to reference `{ "@id": "${SITE}/about#coach-slug" }` as soon as the About page ships with coach `Person` schemas. This is the highest-value E-E-A-T signal available to a coaching brand — AI platforms use instructor credentials heavily for course citation.

---

## Priority Action List (program pages)

| # | Action | File | Effort | Impact |
|---|---|---|---|---|
| 1 | Add canonical to all 3 program pages | `app/programs/*/page.tsx` (or `layout.tsx` metadataBase) | 10 min | **High** |
| 2 | Add `startDate`/`endDate` + `VirtualLocation` to all 3 CourseInstance blocks | `lib/schema.ts:131,159,188` | 15 min | High |
| 3 | Add `review` nodes to each Course from testimonial quotes | `lib/schema.ts` | 20 min | Medium |
| 4 | Thicken `/programs/ekuzo100` copy (521 → ~900 words) + add FAQPage schema | page file + `lib/schema.ts` | 1 hr | Medium |
| 5 | Add `instructor` refs (blocked on `/about`) | `lib/schema.ts` | 10 min after About ships | High |
| 6 | Model Camps as array of CourseInstance (one per week) | `lib/schema.ts:131` | 30 min | Medium |

---

## Methodology

Fetched each program page via `python3 ~/.claude/skills/geo/scripts/fetch_page.py`. Parsed JSON-LD from server-rendered HTML, cross-referenced with `lib/schema.ts` source. Scored per the `/geo schema` rubric. Per-page differences are small because the root `@graph` is shared; commentary focuses on per-Course and per-page issues rather than repeating org-level findings.
