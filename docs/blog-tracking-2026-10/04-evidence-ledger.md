# Tracking QA results (build at http://localhost:3312, production)
Evidence files in /home/claude/qa/tracking/ev/. Scripts: t_main.mjs, t_console.mjs, t4.mjs, t4a.mjs, t4c.mjs, t_touch.mjs, t5.mjs, t1.mjs, t1b.mjs (helper h.mjs).
GA4 beacons observed with the real gtag.js (analytics.google.com/g/collect). Note: beacon `dl` is `http://localhost/<path>` (no port, gtag behaviour); path matches the post.

| Req | Test | Evidence | Result |
|---|---|---|---|
| T1 | No `ep.source`/`ep.medium`/`ep.campaign` in any beacon across all runs (post, /blog, author, /programs/ekuzo100, /season1, popup, touch, reload) | ev/*.json scan (0 hits); static grep of app/components/lib for gtag/ga4 with source/medium/campaign keys: none | PASS |
| T1 | generate_lead carries `ep.lead_source` | popup: `generate_lead ep.lead_source=season_one_popup`; /season1: `generate_lead ep.lead_source=season_one_d1 ep.hero=none` (ev/T2_popup.json, ev/T1_T6_live.json) | PASS |
| T1 | register_click carries `ep.cta_source` | Live click on /programs/ekuzo100 hero CTA fires NO event: SeasonOneTrigger capture handler (SEASON_ONE_MODE on) stops propagation of /register link clicks and opens the popup (ev/T1_register_newsletter.json, dbg4). Static only: built chunk `register_click,{cta_source:e.source}` | PASS (static only) / see D4 |
| T1 | newsletter_signup carries `ep.cta_source` | Not reachable live: StickyCTA blog bar and blog NewsletterPopup are off in SEASON_ONE_MODE (only a footer form exists, untracked). Static only: built chunk `newsletter_signup,{cta_source:e.source,variant}` | PASS (static only) / see D4 |
| T2 | Popup sign-up on post, first visit, /api/season-one stubbed locally | GA4: `page_view`, `generate_lead ep.lead_source=season_one_popup` (exactly one, dl path = /blog/should-i-buy-my-kid-robux). Clarity q: `set page_type blog`, `set post_slug should-i-buy-my-kid-robux`, `event generate_lead`, `set lead_source season_one_popup`. fbq queue: `track Lead {content_name:season_one_popup} {eventID:92d368f5-57f4-40ed-94ff-0cdb661dde1f}`; same eventId in the /api/season-one body | PASS |
| T3 | Clarity tags on post | `set page_type blog`, `set post_slug <slug>` (ev/T2_popup.json) | PASS |
| T3 | Not on /blog, /blog/author/karlin-oei | Clarity q empty on both (ev/T3_blog.json, T3_author.json) | PASS |
| T4 | blog_link_click on in-post /parents link (real click) | NO event: GA beacons none, dataLayer none. document click listener sees `defaultPrevented=true` (Next Link already called preventDefault) (ev/T4_mouse.json pos_parents_REAL, ev/T4_probe_defaultPrevented.json) | FAIL (D1) |
| T4 | blog_link_click on in-post link to another post | NO event (pos_post_REAL) | FAIL (D1) |
| T4 | blog_link_click on Keep Reading card | NO event (pos_keepreading_REAL) | FAIL (D1) |
| T4 | Touch tap on in-post /parents link (CDP/tap, 375x812) | Navigated to /parents, NO event (ev/T4_touch.json touch_tap_real_link) | FAIL (D1) |
| T4 | Fires once per click (plain-anchor control) | one `blog_link_click ep.post_slug ep.link_path=/parents ep.link_type=parents` (and `/blog/should-you-ban-fortnite` type post) per click; plain anchors fire, so listener logic itself works | PASS (logic) |
| T4 must-not | nav link | none (real nav link and injected plain `<a>` in nav) | PASS |
| T4 must-not | footer link | none (real and plain) | PASS |
| T4 must-not | link in popup dialog | none (plain `<a href=/parents>` injected in [role=dialog]; popup has no native links) | PASS |
| T4 must-not | external link | none (real roblox link, plain https://example.org) | PASS |
| T4 must-not | same-page anchor (`#sec`) and same-path link | none | PASS |
| T4 must-not | right click, middle click | none (plain anchor, button 2 and 1) | PASS |
| T4 must-not | modified click (Ctrl, Meta, Shift, Alt) | FIRES `blog_link_click` for Ctrl/Meta/Shift/Alt on plain anchors, and for Ctrl and Shift on the REAL /parents link, while the plain click on the real link does not (ev/T4_mouse.json ctl_plain_mod_*, ev/T4_real_link_modifiers.json) | FAIL (D2) |
| T4 must-not | touch scroll starting on a link (CDP touchStart on link, touchMove up 200px, touchEnd) | page scrolled 747->1032 (plain link) and 7214->7484 (real link); no blog_link_click in dataLayer or beacons | PASS |
| T4 must-not | mouse drag off a link (no click) | none | PASS |
| T5 | Never on load | load + 8 s idle: no blog_read_75 (ev/T5.json A) | PASS |
| T5 | Fires once past 75% | threshold scrollY=5893.7 (article h 9058, vh 900). At thr-60: none; at thr+60: one `blog_read_75 ep.post_slug=should-i-buy-my-kid-robux`; after wheel scrolling, up/down, to bottom: still one (beacon list has one) | PASS |
| T5 | Reload restoring deep scroll | 5 reloads at scrollY 8000/6500/9500/8000/7000: restored to the same Y (scroll event at ~210-295 ms), 0 blog_read_75 after reload (dataLayer and beacons). Slow-JS-chunk reload (1.5 s delay): restoration at 1639 ms, still 0 events | PASS |
| T5 | Back-navigation restore | restored to y=3000, 0 events | PASS |
| T5 | Not on /blog, author | scroll to 50/80/100%: no event on either | PASS |
| T5 | Extra: SPA post-to-post nav | fresh slug event for the second post (`gaming-programs-for-kids`) after its own scroll; one per post | PASS |
| T6 | landing.html line 1399 | `gtag("event","generate_lead",{lead_source:"season_one_"+d.id,hero:HERO||"none"})` in file and in served /season1 HTML; live submit (stubbed API) emitted `ep.lead_source=season_one_d1` | PASS |
| T7 | Console errors (post, /blog, /parents, /season1, author) | no pageerrors. One 404 console error on post, /blog, /parents, author: `/images/new%20torn%20paper/torn-paper-red-top-2@2x.png` (FooterBanner.tsx, unchanged file). /season1 clean (ev/T7_console.json) | PASS with note (D3) |
| T7 | Unit suites | unit-tests.txt: all pass/0 fail (not re-run) | PASS |

## Retest, repair cycle 1 (capture-phase listener, modifier/button guard). Evidence: ev/RT_T4.json, ev/T2_popup.json, ev/T5.json (rt4.mjs, t_main.mjs, t5.mjs). Real links, no stubbing of navigation.
| Req | Test | Evidence | Result |
|---|---|---|---|
| T4 | Click in-post /parents | one `blog_link_click ep.post_slug=should-i-buy-my-kid-robux ep.link_path=/parents ep.link_type=parents` (dataLayer and beacon) | PASS (D1 closed) |
| T4 | Click in-post post link | one event, `ep.link_path=/blog/should-you-ban-fortnite ep.link_type=post` | PASS |
| T4 | Click Keep Reading card | one event, `ep.link_path=/blog/gaming-programs-for-kids ep.link_type=post` | PASS |
| T4 | Touch tap on /parents (375x812) | one event, `/parents`, `parents` | PASS |
| T4 | Ctrl, Meta, Shift, Alt click; middle click on real /parents link | 0 events each (D2 closed) | PASS |
| T4 | Nav link, footer link (real) | 0 events | PASS |
| T4 | External link (real roblox) | 0 events | PASS |
| T4 | Popup dialog link (dialog has no native links; plain `<a>` injected) | 0 events | PASS |
| T4 | Touch scroll starting on real link (scrollY 7214 -> 7399) | 0 events | PASS |
| T2 | Popup sign-up rerun | GA4 `generate_lead ep.lead_source=season_one_popup`; Clarity `set page_type blog`, `set post_slug ...`, `event generate_lead`, `set lead_source season_one_popup`; fbq Lead eventID 85514efa-... also in API body | PASS |
| T5 | Rerun (load, 75% once, 5 deep reloads + slow chunks, back, /blog, author, SPA nav) | same as first run: 0 events on load and reloads, one per post at 75%, none on /blog or author. Real-click `blog_link_click` also appears in the SPA-nav and back runs, as expected | PASS |
