# Blog-wide tracking pass (items 1 to 3): findings and decisions

Branch `build/blog-tracking-2026-10`, 2026-10-26. Handoff items 1 to 3 of
`knowledge-base/system/loops/handoffs/2026-10-24-ship-robux-and-session-end-posts.md`.

## What we found

1. **Blog sign-ups do count, and they are credited to the post.** The Season 01 popup sends
   GA4 `generate_lead` from the page it opened on, so `page_location` is the post. Proved in a
   guarded browser with the real gtag.js (evidence/ev, T2). The 2026-10-24 GA4 read of "1 key
   event from blog landings since April" reflects the volume of popup sign-ups on posts. We found
   no tracking gap in the lead itself. Clarity got nothing on a popup lead before this change.
2. **The "header / sticky / hero / footer" sessions were our own events.** Every GA4 event the
   site sent for CTA clicks and leads carried a parameter named `source`
   (`register_click {source:"header"}`, `generate_lead {source:"season_one_popup"}`). GA4 keeps a
   session's traffic source under the same key (`source`, `medium`, `campaign` in event_params),
   so those values surfaced as session sources. A gtag beacon sends it as `ep.source=header`
   (evidence/gtag-probe.mjs). The cause is the parameter name. CTA tracking parameters on internal
   links played no part: internal links carry `?cta=` and no utm.

## Decisions

| # | Decision | Who |
|---|---|---|
| T-D1 | Rename the GA4 parameter: `register_click` and `newsletter_signup` send `cta_source`, and `generate_lead` sends `lead_source` (`lib/analytics.ts`, and the /season1 landing page's one `generate_lead` line). Function signatures are unchanged | Claude |
| T-D2 | `trackLead` also sends Clarity `event generate_lead` and tag `lead_source` (covers the popup and the contact form) | Claude |
| T-D3 | Post engagement lives in `app/blog/BlogPostTracking.tsx`, mounted by a new `app/blog/layout.tsx` that adds no markup. `components/` is untouched (Aaron's lane) | Claude |
| T-D4 | `blog_link_click` listens for `click` in the capture phase. It skips modified clicks, nav, header, footer and dialogs, and same-page anchors (Sentry D1 and D2 fixed in cycle 1) | Claude |
| T-D5 | `blog_read_75` fires only on a scroll, ignores the first 800 ms (scroll restoration), and fires once per view | Claude |
| T-D6 | No `faq_open` on posts: post FAQs are open text, with no accordion | Claude |

## Needs Jamie (GA4 and Clarity admin, read-only until his go)

- Register event-scoped custom dimensions: `post_slug`, `link_type`, `link_path`, `lead_source`,
  `cta_source`. If an older custom dimension named `source` exists, it stops getting new data at
  deploy.
- Check `generate_lead` is marked as a key event.
- Internal and developer traffic: define the internal IP rule (Admin, Data streams, Configure tag
  settings, Define internal traffic) and activate the Internal Traffic data filter. Activate the
  Developer Traffic filter. Add `dev--ekuzo.netlify.app` (and `localhost`) under List unwanted
  referrals.
- Clarity: IP blocking for the team's IPs (Settings, IP blocking) if not already set.
- Accepted risk (Sentry D4): in Season 01 mode, `register_click` never fires (the popup takes
  /register clicks first), and `newsletter_signup` has no live trigger. Both resume when the mode
  is switched off.
