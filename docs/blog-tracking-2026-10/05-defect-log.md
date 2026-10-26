# Defect log: blog tracking (T1-T7)

## D1 CLOSED (retest passed, repair cycle 1) HIGH, code-bug: blog_link_click never fires on a normal click of any real link
- File: app/blog/BlogPostTracking.tsx, `onClick`: `if (e.defaultPrevented || e.button !== 0) return;`
- Cause: every in-post link and Keep Reading card is a Next `<Link>`. Next's onClick calls `preventDefault()` for a normal client-side navigation before the event bubbles to the `document` listener, so the handler always bails out.
- Repro: open /blog/should-i-buy-my-kid-robux, click `article a[href="/parents"]`, `article a[href="/blog/should-you-ban-fortnite"]` or the Keep Reading card `a[href="/blog/gaming-programs-for-kids"]` (mouse or touch tap). Result: no `blog_link_click` in dataLayer or GA4 beacons. A document click listener logs `defaultPrevented=true`. Scripts: t4.mjs, t4a.mjs, t_touch.mjs. Evidence: ev/T4_mouse.json, ev/T4_probe_defaultPrevented.json, ev/T4_touch.json.
- Effect: T4 positives all fail; the event measures nothing except modified clicks (D2).
- Suggested direction (for builder): drop the `defaultPrevented` test, or listen in the capture phase; keep the other filters.

## D2 CLOSED (retest passed, repair cycle 1) MEDIUM, code-bug: modified clicks fire blog_link_click
- Same handler checks only `e.button`; no ctrl/meta/shift/alt check. Ctrl+click and Shift+click on the real /parents Link fire the event (Next does not preventDefault for them) while a plain click does not, so today the metric is inverted. Ctrl, Meta, Shift and Alt all fire on plain anchors.
- Repro: t4c.mjs (real link) and t4.mjs ctl_plain_mod_*. Evidence: ev/T4_real_link_modifiers.json. Fixing D1 alone makes this worse; fix both together.

## D3 CLOSED as pre-existing, out of scope (FooterBanner) LOW, code-bug: 404 asset on every page
- `/images/new%20torn%20paper/torn-paper-red-top-2@2x.png` returns 404 (components/sections/FooterBanner.tsx:74; file missing from public/images/new torn paper). Produces a console error on post, /blog, /parents, author pages. Not caused by the tracking change.

## D4 OPEN, goes to Jamie. MEDIUM, accepted-risk / infra-gap: register_click and newsletter_signup cannot be observed live with SEASON_ONE_MODE on
- app/layout.tsx and StickyCTA gate the blog sticky bar and blog newsletter popup off in Season 01 mode, so newsletter_signup has no live trigger. SeasonOneTrigger.tsx (capture-phase click handler, `stopPropagation`) swallows clicks on any `/register` link and opens the popup, so TrackedRegisterLink's onClick (register_click) never runs: `/programs/ekuzo100` hero CTA click gave no `register_click` (dbg4.mjs). T1's `cta_source` for those two events was verified statically in the built chunks only. Product decision whether losing register_click during Season 01 is acceptable; pre-existing behaviour, not introduced by this change.

## Notes (not defects)
- GA4 beacon `dl` is `http://localhost/<path>` without the :3312 port (real gtag.js behaviour); path equals the post URL.
- Meta Lead eventID check passed (same UUID in fbq call and API body).
