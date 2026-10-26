# Blog-wide tracking pass: requirements (branch build/blog-tracking-2026-10)

Combined build (Robux branch + tracking branch) served at http://localhost:3312. Source /home/claude/combined.
Changed: lib/analytics.ts, app/blog/BlogPostTracking.tsx (new), app/blog/layout.tsx (new), app/season1/landing.html (one line), docs/season-one-tracking.md.

- T1 No GA4 event sent by the site carries a parameter named `source`, `medium` or `campaign` (check the gtag beacons: no `ep.source`, `ep.medium`, `ep.campaign`). register_click and newsletter_signup carry `ep.cta_source`; generate_lead carries `ep.lead_source`.
- T2 Season 01 popup sign-up on a blog post (/blog/should-i-buy-my-kid-robux, first visit, popup opens after about 2.5 s): with /api/season-one answered locally {"ok":true} (never reach the real API), one GA4 generate_lead fires with ep.lead_source=season_one_popup and dl = the post URL; Clarity receives ("event","generate_lead") and ("set","lead_source","season_one_popup"); the Meta Lead call keeps its eventID.
- T3 On a post: Clarity receives ("set","page_type","blog") and ("set","post_slug","<slug>"). Not on /blog or /blog/author/karlin-oei.
- T4 blog_link_click fires once per click on an in-post link to /parents (link_type parents), to another post (post), and on a Keep Reading card (post), with post_slug and link_path. It does NOT fire for: nav links, footer links, links inside the popup dialog, external links, a same-page anchor, a pointerdown/touchstart that turns into a scroll (touch-scroll case: start a touch scroll on a link), a right-click or a modified click.
- T5 blog_read_75 fires exactly once after scrolling past 75% of the article, never on page load, never on a reload that restores a deep scroll position within 800 ms, not again on further scrolling, and not on /blog or author pages.
- T6 /season1 landing page: generate_lead now carries lead_source (static check of app/season1/landing.html plus the served /season1 HTML).
- T7 No console errors from our pages on the post, /blog, /parents and /season1; the existing unit suites still pass (evidence already in /home/claude/qa/tracking/unit-tests.txt).
