# Atlas-2 self-test (S3 items 1 to 6)

## Changes
- `join-b.html`, `join-jersey.html`: line 6 robots meta replaced by `<!--SEO:start-->{{SEO}}<!--SEO:end-->` (once, inside `<head>`).
- `lib/season1/joinPage.ts`: `seo?: { indexable }`. Not indexable (default): exactly `<meta name="robots" content="noindex">`. Indexable: constant canonical `https://ekuzo.gg/season1/join`, meta description, JSON-LD script.
- `lib/schema.ts`: `JOIN_CANONICAL`, `escapeJsonLd` (escapes `<`, U+2028, U+2029), `buildJoinSchemaGraph(open)` (Course with provider `ORG_ID`, courseMode online, Offer price 580 USD, description from offer.ts, InStock/SoldOut by `open`, validFrom/validThrough from offer.ts; BreadcrumbList; no FAQPage), `joinJsonLdScript`.
- Routes: `/join` has `const indexable = isLiveHost(host) && mode === "live"`; `/join/b` and `/join/jersey` have `const indexable = false`. `x-robots-tag: noindex` is sent only when not indexable.
- `app/sitemap.ts`: `/season1/join`, lastModified 2026-11-05, weekly, 0.8.
- `public/llms.txt` line 15: ages 9 to 17, twice a week for 90 minutes, mid January to May 2027 all agree with offer.ts. No change, no price added.

## Tests (tsc: no errors outside generated `.next/types`; npm test: my suites pass)
- joinRoutesMatch: code equal except the `const indexable` line (asserted exactly), SEO markers once in `<head>`, 3 modes x 5 hosts x 2 query strings (bare and `?src=x&utm_source=y`): indexable only for live mode on ekuzo.gg and www.ekuzo.gg, bodies equal outside the SEO block, headers equal except x-robots-tag, /b and /jersey always noindex, canonical always bare. Two mutation checks (price edit outside block, header drift) fail the comparison as intended.
- joinPage SEO suite: default noindex block, indexable JSON-LD contents from offer.ts, closed (mode off and after closeAt) stays indexed with SoldOut, hostile-string escape test.
- sitemap.test: holds /season1/join, none of /season1, /join/b, /join/jersey, /join/signup; robots.txt has no /season1 Disallow; llms.txt agrees with offer.ts.
- Known unrelated failures: 7 subtests in `POST /api/season-one` (seasonOneRoute.test.ts), the sign-up API builder's files, not touched here.

## Built copy (/tmp/claude-0/atlas2-build, next build + start on 3160)
The build inlines `S1_DEPLOY_CONTEXT` from `CONTEXT` (next.config.mjs), so the live case was built with `CONTEXT=production` and fake live keys in `.env.production.local`. Server stopped by PID, no stray next-server.
| Host | mode | x-robots-tag | robots meta | canonical |
|---|---|---|---|---|
| ekuzo.gg (`?src=x&utm_source=y`) | live | absent | absent | https://ekuzo.gg/season1/join |
| www.ekuzo.gg | live | absent | absent | https://ekuzo.gg/season1/join |
| localhost:3160 | live env, non-live host so off | noindex | noindex | none |
| ekuzo.gg and localhost, qa.env (test mode) | test | noindex | noindex | none |
Evidence files: `live-*.headers`, `live-*.html`, `live-ekuzo.gg.seo-block.txt`, `live-ekuzo.gg.jsonld.json`, `testmode-*`. JSON-LD parsed with Python `json.loads`: @graph = [Course, BreadcrumbList], no `<` in the block.
