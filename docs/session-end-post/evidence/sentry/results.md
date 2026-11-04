# Sentry results ledger (run against HEAD 84f398d, port 3101 next start of a fresh build; see note on 3100)

Server note: port 3100 was already held by a stale `next-server` (pid 5439, started 17:13, not Sentry's) serving an OLD build (listing used `-card.jpg`). Sentry's first-pass results were discarded and every browser/curl test re-run against its own server on 3101 (fresh build, `-card-clean.jpg` in listings). Sentry stopped only its own pid; 5439 was left alone.

| # | Req | Test | Evidence | Result |
|---|---|---|---|---|
| 0 | N/A | Fail-closed analytics guard recorded before functional tests (route 204 + host-resolver blackhole) | beacons.txt | PASS (0 beacons; analytics scripts do not load locally, S1_DEPLOY_CONTEXT unset) |
| 1a | P2 | Copy fidelity diff, rendered article vs v6 (blockquote stripped), 1765 vs 1921 words | copy-diff.txt, page-text-extracted.txt | PASS with 2 deltas: byline rail, table caption "How long a match lasts, and where to stop" (expected template/a11y additions); table cell dots and CSS uppercase of pull quote are extraction artifacts; one real text delta: Alsheail source gets a visible DOI URL (D3) |
| 1b | P3 | Labeled "Short answer:" is first paragraph after byline | page-text-extracted.txt | PASS |
| 2 | P1,P4,P5,P6,P7,P8 | H1 = "How do I get my kid off the game without a fight?"; H2s equal copy H2s (7) | render check | PASS |
| 2 | P5 | 1 table, caption, thead, scope=col/row headers, 6 tbody rows | render check | PASS |
| 2 | P6 | PullQuote div role=note, text equals copy | render check, crops | PASS |
| 2 | P7 | blockquote with attribution "A parent, replying on X" | render check | PASS (styling note D8) |
| 2 | P3 | ol with 5 items; FAQ 5 H3 items | render check | PASS |
| 3 | S1 | title "How to get your kid off video games without a fight" | head.txt | PASS |
| 3 | S1 | meta description length | head.txt | FAIL minor: 161 chars (target 150-160); known interim string (D1) |
| 3 | S2 | canonical = https://ekuzo.gg/blog/how-to-get-your-kid-off-video-games-without-a-fight | head.txt | PASS |
| 3 | P11 | og:image and twitter:image = -card.jpg, 1200x630 on disk; hero 1232x520; card-clean 1200x630; og:type article; robots index, follow | head.txt, schema-faq-check.txt | PASS |
| 3 | P11 | hero alt equals approved alt text | a11y-lint.txt | FAIL minor: differs from 02-copy-deck C4 (D2) |
| 3 | S7 | robots.txt: no Disallow for /blog or /_next/ (only /api/) | head.txt | PASS |
| 4 | S3,P8 | JSON-LD parses; BlogPosting (author @id #coach-karlin = Person Karlin Oei, 2026-11-04, image=card), BreadcrumbList Home>Blog>post, FAQPage 5 Q/A | jsonld.json | PASS |
| 4 | P8 | FAQPage Q/A equal visible FAQ and copy of record, exact | schema-faq-check.txt | PASS (5/5) |
| 4 | S3 | validator.schema.org | n/a | NOT RUN: validator needs the page reachable from the public web (local server only); to be run on the dev deploy |
| 5 | S4 | Visible "Updated November 4, 2026" = dateModified 2026-11-04 = sitemap lastmod 2026-11-04 | head.txt, sitemap-entry.txt | PASS |
| 5 | S5 | sitemap contains the URL; robux 0.6; /blog floor lastmod unchanged by this check | sitemap-entry.txt | PASS |
| 5 | S6,C1 | llms.txt entry present; 0 U+2014/U+2013 in "Blog and articles" section (lines 25-41) | llms-served.txt | PASS (2 pre-existing dashes: line 7 and line 13, outside the blog section) |
| 6 | P12 | /blog featured slot = new post, clean card renders, text not clipped; Robux not featured; one featured label; also listed in grid (existing template behavior: grid = all posts) | blog-1440.png, pages-console.json | PASS |
| 6 | P12 | Karlin author page lists the new post first | pages-console.json | PASS |
| 7 | P9,S9 | all internal hrefs 200; no utm_/source= on internal links; 9 source links target=_blank + rel noopener noreferrer | links.txt | PASS |
| 7 | P14,M1 | Season 01 link inside the post body | links.txt | OPEN: no inline Season 01 link on this branch (only Nav, sticky bar, FooterBanner, popup). Pending Jamie decision (D6) |
| 8 | M1 | stub gtag/clarity: page load fires 0 events; Clarity set page_type=blog, post_slug=<slug> | measurement.txt | PASS (stubbed; see D7) |
| 8 | M1 | wheel scroll over links fires 0 blog_link_click; blog_read_75 fires exactly once (also after re-scroll) | measurement.txt | PASS |
| 8 | M1 | click /parents link fires blog_link_click {post_slug, link_path:/parents, link_type:parents} | measurement.txt | PASS |
| 8 | M1 | touch swipe starting on a body link at 375: no navigation, 0 blog_link_click; read_75 at bottom | measurement.txt | PASS |
| 8 | M1 | real GA4/Meta/Clarity load and DebugView/Test Events | n/a | INFRA-GAP: analytics off locally (D7) |
| 9 | M1 | Season 01 popup opens ~2.5s after load at 375 (measured 3.14 s incl. networkidle), Close works; Esc closes at 1440 | popup-375.png, popup-1440.png, layout-metrics.json | PASS |
| 10 | V | Console/network errors from our pages: post, /blog, Karlin page: only the known torn-paper 404 | pages-console.json | PASS (accepted-risk D4) |
| 11 | V | Screenshots 375/768/1440 post and /blog | post-*.png, blog-*.png | PASS, viewed; see layout notes in report |
| 11 | V | No horizontal overflow at 375/768/1440; table fits at 375 without scroll | layout-metrics.json | PASS |
| 12 | A11y | hero alt present; 0 imgs without alt; heading order h1,h2.., FAQ h3 under h2; table scopes; no "here" links; pull quote white on black | a11y-lint.txt | PASS |
| 13 | C1 | em/en dash in rendered text 0; spaced hyphen 0; page.tsx and PullQuote.tsx 0 | a11y-lint.txt | PASS |
| 14 | N2,N3,N4 | diff limited to expected files; app/season1, lib/season1, app/api zero diff; components/ only PullQuote.tsx with WORKLOG note | git diff --stat | PASS |
| 15 | | npm test: 481 pass, 0 fail, 1 skipped; tsc --noEmit exit 0; next build exit 0 | npm-test.txt, tsc.txt, build.txt | PASS |
