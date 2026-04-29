# GEO Schema & Structured Data Report — ekuzo.gg (production)

**Target:** `https://ekuzo.gg` (production)
**Date:** 2026-04-14
**Branch / commit:** `main` @ `f721d54` (identical to `dev` — the schema pass has been merged and deployed)
**Pages audited:** `/`, `/programs/ekuzo-camps`, `/programs/ekuzo100`, `/programs/ekuzo-teams`
**Related reports:**
- `reports/2026-04-14-schema-pre-push.md` (78/100 baseline, before the second pass)
- `reports/2026-04-14-schema-post-push.md` (83/100, `dev--ekuzo.netlify.app` audit)

---

## Schema Score: 83/100

Production now matches the `dev--ekuzo.netlify.app` preview audited earlier today. Same composite score, same commit, same rendered JSON-LD. No regressions between the preview and production deploys. **This is the current live-site baseline.**

| Criterion | Weight | Awarded | Status vs dev audit |
|---|---:|---:|---|
| Organization / Person schema complete | 15 | **15** | Same |
| sameAs links (5+ platforms) | 15 | **15** | Same |
| Article schema + author details | 10 | **0** | Same — deferred until blog ships |
| Business-type-specific schema (Course) | 10 | **10** | Same |
| WebSite + SearchAction | 5 | **3** | Same — SearchAction intentionally absent |
| BreadcrumbList on inner pages | 5 | **5** | Same |
| JSON-LD format | 5 | **5** | Same |
| Server-rendered (not JS-injected) | 10 | **10** | Same — `has_ssr_content: true` on all 4 pages |
| `speakable` property on Article | 5 | **0** | Same — deferred |
| Valid JSON + valid Schema.org types | 10 | **10** | Same — 0 parse errors across 4 pages |
| `knowsAbout` on Organization / Person | 5 | **5** | Same |
| No deprecated schemas | 5 | **5** | Same |
| **Total** | **100** | **83** | |

---

## Production Verification

### Canonical URLs

All four pages render a production canonical in the HTML source:

| Page | `<link rel="canonical" href=...>` |
|---|---|
| `/` | `https://ekuzo.gg` |
| `/programs/ekuzo-camps` | `https://ekuzo.gg/programs/ekuzo-camps` |
| `/programs/ekuzo100` | `https://ekuzo.gg/programs/ekuzo100` |
| `/programs/ekuzo-teams` | `https://ekuzo.gg/programs/ekuzo-teams` |

`metadataBase: new URL("https://ekuzo.gg")` + per-page `alternates.canonical` is resolving correctly.

### SSR confirmation

`fetch_page.py` reports `has_ssr_content: true` and `errors: []` on all four pages. Every `<script type="application/ld+json">` block is in the server-rendered `<head>`. No client-side injection.

### Detected Schemas (production HTML)

#### Homepage (`https://ekuzo.gg`)
| Block | Nodes | Notes |
|---|---|---|
| 1 | `EducationalOrganization`, `WebSite`, `SiteNavigationElement`, 3× `Person` | Org: `foundingDate: "2021"`, full `PostalAddress`, 2 `contactPoint` entries, 6 `sameAs`. Each coach Person has 1 `sameAs`. |
| 2 | 9× `VideoObject` (consolidated `@graph`) | Real 2026 `uploadDate` on every entry: 2026-01-12, 2026-01-27, 2026-02-03, 2026-02-16, 2026-02-25, 2026-03-04, 2026-03-12, 2026-03-19, 2026-03-27 |

#### `/programs/ekuzo-camps`
| Block | Nodes | Notes |
|---|---|---|
| 1 | Root graph (Org + coaches) | Same as homepage |
| 2 | `Course` (EKUZO Camp) | `startDate: 2026-05-18`, `endDate: 2026-08-06`, `location: VirtualLocation`, 3 instructors (@id → Karlin/Sebastien/Nuri), 1 offer (`price: 199`, `priceValidUntil: 2026-08-06`), 3 parent reviews |
| 3 | `BreadcrumbList` | 3 items: Home → Programs → EKUZO Camp |

#### `/programs/ekuzo100`
| Block | Nodes | Notes |
|---|---|---|
| 1 | Root graph | Same |
| 2 | `Course` (EKUZO100) | `startDate: 2026-06-02`, `endDate: 2026-06-30`, `location: VirtualLocation`, 2 instructors, 1 offer (`price: 100`), 4 student reviews (Student 1..4) |
| 3 | `BreadcrumbList` | 3 items |

#### `/programs/ekuzo-teams`
| Block | Nodes | Notes |
|---|---|---|
| 1 | Root graph | Same |
| 2 | `Course` (EKUZO Teams) | `startDate: 2026-08-31`, `endDate: 2026-12-18`, `location: VirtualLocation`, 2 instructors, 2 offers (pay-in-full $576, installment plan $640), 2 school reviews (Mirus Academy, Monroe Day School) |
| 3 | `BreadcrumbList` | 3 items |

### Coach Person sameAs (verified in production HTML)

| Coach | sameAs |
|---|---|
| Karlin "Faith" Oei | https://www.linkedin.com/in/karlinoei/ |
| Sebastien "ZzLegendary" DeMontigny | https://lol.fandom.com/wiki/Zz_(Sebastien_Demontigny) |
| Nuri "Teemo Time" Je | https://www.linkedin.com/in/nuri-je/ |

---

## Dev → Prod Parity

Both `origin/dev` and `origin/main` are at commit `f721d54`. Everything documented in `reports/2026-04-14-schema-post-push.md` applies equally to production:

- Organization entity is complete (address, contactPoint array, founder @id, 8 knowsAbout topics)
- 3 coach Person nodes in the root `@graph` on every page
- CourseInstance enrichment (location + dates + instructor arrays) on all 3 programs
- Review nodes attached to each Course with `itemReviewed` cross-reference
- Real VideoObject uploadDates on all 9 testimonials
- Canonical URLs + noindex on register/success via layout.tsx server shims
- Post-review fixes: Camps `priceValidUntil` aligned to endDate, `foundingDate` year-only, Sebastien/Nuri `sameAs` added, EKUZO100 student reviews relabeled 1..4

---

## Gap Analysis — Same 17 Points as Dev

All three gaps are the same as the dev audit. They are unchanged by the production deploy because they are blocked on content work, not schema work:

| Missing | Points | Unblocked by |
|---|---:|---|
| Article + author details | 10 | Shipping `/blog/[slug]` |
| `speakable` property on Article | 5 | Shipping `/blog/[slug]` |
| Full `SearchAction` | 2 | Building a real `/search` endpoint, or accepting the cap |

**Effective score against buildable-today items: 83/85.**

---

## Recommended Next Steps

1. **Paste production URLs into https://validator.schema.org/** for the final belt-and-suspenders check (0 errors / 0 warnings expected). See the interpretation note below about item counts.
2. **Monitor Google Search Console** over the next 2–4 weeks for Course rich-result impressions on `/programs/ekuzo-camps`, `/programs/ekuzo100`, `/programs/ekuzo-teams`. The enriched CourseInstance (location + dates + instructors) is what unlocks those.
3. **Queue an `Article` + `speakable` builder** in `lib/schema.ts` as soon as the blog route ships — this is the 15-point unlock.
4. **Consider a Wikidata item for EKUZO.** It is the single highest-authority `sameAs` link we can add and is not blocked on any content work, just community process.

### Validator interpretation note

Schema.org's validator deduplicates heavily `@id`-referenced entities in its summary view. The homepage typically reports "13 items" and `/programs/ekuzo-camps` reports "6 items" — the actual entity counts are higher. The `EducationalOrganization` and `Karlin` Person nodes are present in the rendered HTML but folded into their references (from `Course.provider`, `CourseInstance.instructor`, `Organization.founder`, etc.) in the validator UI. **0 errors / 0 warnings is the real signal**, not the item count. To confirm the full graph is present, view the raw rendered HTML and search for `<script type="application/ld+json">` or run `python3 ~/.claude/skills/geo/scripts/fetch_page.py <url> page`.

---

## Commit History (live on production)

```
f721d54  Docs: archive schema reports under reports/, add post-push audit
25fad16  Schema: post-review fixes (priceValidUntil, foundingDate, sameAs, student labels)
463afc1  Docs: WORKLOG + CLAUDE.md for second schema pass
cafb784  Schema: Replace placeholder VideoObject uploadDates with real dates
9b6393a  Schema: Review nodes on Courses from testimonial transcripts
06f4fe9  Schema: CourseInstance location + startDate/endDate + instructors
0bba97d  Schema: Organization updates + canonical URLs + coach Person nodes
```
