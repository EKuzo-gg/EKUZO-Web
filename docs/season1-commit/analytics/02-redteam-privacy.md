---
title: "Season 01 analytics slice: red team, users, trust and privacy"
created: 2026-10-30
author: spec red-team agent (privacy lens), phase 1
reviews: 01-requirements.md (DRAFT), 00-scout-map.md
---

# Red team: users, trust and privacy

Governing rule (Jamie 2026-10-30): Clarity and our own pages may show kid names; nothing with a kid's name, age or likeness leaves our hands via URLs, GA4, Meta or ad platforms. Findings are ordered by severity. "Spec" means 01-requirements.md.

External facts used (retrieved 2026-10-30, worth a second look before freeze):
- Clarity FAQ (learn.microsoft.com/en-us/clarity/faq): "Clarity shouldn't be used on any websites/apps targeting users under the age of 18." "Content in the input boxes is masked in all modes." "Microsoft/Clarity has access to the data." URL parameter masking needs a support request and does not cover referrer or clicked URLs.
- Meta CAPI testing guidance, as quoted by a secondary source (weltpixel.com): events sent with a test event code "are not dropped" and are used for "targeting and ads measurement purposes". Not confirmed on Meta's own page.

## Critical

**1. Clarity with no masking breaks the live privacy promise.** Severity: critical.
- Evidence: privacy policy `app/privacy-policy/page.tsx` L123 (section 16, live since Oct 27): "We use advertising and analytics partners, who receive a parent's hashed email and purchase information. We never share a child's information with them." Spec S4 L28 puts Clarity (a Microsoft service with access to the data) on welcome, sign-up and crew with "No masking attributes added". Kid first names render as plain text, not inputs, so Balanced masking records them: welcome hero `welcome.html` L161 and `welcome/route.ts` L192-195, share button L168, receipt lines `route.ts` L196-201; crew named CTAs `crew.html` L204, L252, L255 (another family's kid); sign-up invite banner `signup.html` L246 and summary line L292 (another family's kid).
- Failure: a parent, a journalist or a regulator compares the policy line to a Clarity network trace on the welcome page and finds kid names going to an analytics partner. The rule permits it internally; the public text says the opposite.
- Resolution: park for Jamie. Default: change the spec to add `data-clarity-mask="true"` on the elements above (one attribute each; clicks, scroll and layout stay visible, names show as masked). Jamie can drop the masks once the policy names Clarity and session recording (see 7). Also add a must-not: no `clarity("identify", ...)` and no Clarity custom tag carrying a name, email or code.

**2. S4 would put Clarity on pages whose URLs carry kid names.** Severity: critical.
- Evidence: spec S4 L28 "the early-access pages if they still serve 200 in live". They do: every early-access route returns `redirectToBare`, a 200 page (`lib/season1/redirect.ts` L28). Their inbound URLs carry kid names by design (`redirect.ts` L3, "the old links carried kid names (?kid=, ?from=)"; old flow built `/season1/early-access/saved?kid=<name>` at `early-access/signup/signup.html` L155). `redirect.ts` L12: "No analytics load on this page." R1 L57 ("Every Season 01 page renders its tags") could also be read to cover `/season1/crew` and `/season1/terms`, which use the same redirect.
- Failure: Clarity (and, under a broad R1, GA4 or Pixel) records `?kid=Maya` from an old shared link. Direct breach of the rule for GA4/Meta and of the must-not at L90.
- Resolution: change the spec. Drop early-access from S4. R1 names the redirect pages as excluded, and a unit test asserts `redirectToBare` output contains no `googletagmanager`, `facebook`, `fbevents` or `clarity.ms`.

## Major

**3. Clarity on crew sends the family code and records likely kid visitors.** Severity: major.
- Evidence: spec S4 lists crew. `crew.html` L7 keeps `location.pathname`, so `/crew/<code>` is the page URL Clarity stores; spec must-not L90 forbids the family code in any URL sent to Clarity. Crew is the page most likely opened by a child: the share text is "<kid> just joined EKUZO Season 01. Join through this link" (`welcome.html` L220). The Clarity FAQ says not to use it on sites targeting under-18s. GA4 on crew already runs with Google Ads linked (scout L70, F2), so a kid's device can land in Ads remarketing lists.
- Resolution: change the spec. No Clarity on crew. GA4 on crew in live gets `allow_google_signals: false, allow_ad_personalization_signals: false` (same flags as QA mode), keeping the `/crew/` page_location override. Pixel stays off crew (already in S3).

**4. Pixel and Clarity read the raw URL; S2 protects GA4 only.** Severity: major.
- Evidence: S2 L26 whitelists GA4 `page_location`. The Pixel sends `location.href` as `dl` and Clarity stores the page URL as is. Join and sign-up strip only `kid` and `from` (`join.html` L7, `signup.html` L4). J1 (L79) sends parents from Klaviyo emails to join; Klaviyo can append `_kx`, a profile identifier, when onsite identification is on (check the account), and any future parameter (an email prefill, a code) would ride along.
- Failure: a parent identifier or a later-added sensitive parameter reaches Meta in `dl` and sits in Clarity, with no test catching it.
- Resolution: change the spec. Replace the kid/from strip on every Season 01 page with a whitelist strip in the head before `{{TAGS}}`: keep the eight S2 keys plus `src` and `s1qa`, drop the rest with `replaceState`. Middleware (S5) and the sign-up route (`src`) read the server-side URL first, so nothing is lost. `fbclid` stays so the Pixel can set `_fbc`. Unit test per template that the strip script precedes the tags.

**5. `autoConfig: false` is load-bearing and untested; it does not cover form scraping toggles.** Severity: major.
- Evidence: welcome's button reads "Share {{KID1}}'s link" (`welcome.html` L168). Pixel automatic events send button text unless `fbq('set','autoConfig',false,id)` runs before `init` (landing order `landing.html` L12-13). Automatic Advanced Matching is a separate dataset toggle, now off (scout L92); if anyone turns it on, fbevents scans inputs on sign-up (parent `given-name` L210; kid inputs labeled "First name" L261). The Google tag's automatic user-provided data detection is the same kind of dashboard switch.
- Failure: a well-meaning EMQ tweak in Events Manager or Google Ads sends kid first names (hashed) to Meta or Google, with no code change to review.
- Resolution: change the spec. tags.ts emits `set autoConfig false` before `init` in both live and QA renderings (unit test on order). R5 adds a network-log check on welcome and sign-up: no `SubscribedButtonClick`, no `cd[buttonText]`, no `ud[` parameters in `facebook.com/tr` requests. Release checklist: confirm AAM off and Google tag automatic user-provided data detection off; Jamie names who may change either.

**6. QA mode pollutes the live Meta dataset.** Severity: major.
- Evidence: D1 L15 and S1 L25 load the live Pixel `1284038230557204` in QA; browser Pixel events carry no test code. Scout L93-94: branch-deploy hosts already appear in the dataset, and Purchase counts (20 on 10-29) include test traffic. Per the secondary-source quote above, CAPI events with `test_event_code` are not dropped either.
- Failure: Sentry's and staff test Purchases, InitiateCheckouts and PageViews (tied to their own Facebook logins) enter production audiences and conversion counts; any later Purchase optimization learns from test buyers.
- Resolution: park for Jamie. Default: create a separate Meta test dataset; QA-mode Pixel and test-mode CAPI both send to it (`S1_META_PIXEL_QA_ID`), and R5/R6 are proven there. If Jamie declines, QA mode fires PageView only and R5/R6 are proven from the request log plus one live-host test order refunded by hand.

**7. Privacy policy does not disclose what the spec adds.** Severity: major.
- Evidence: section 8 (`page.tsx` L87): "EKUZO uses basic cookies and analytics to understand how our website is used and to improve it." Section 5 (L65) names Discord, Stripe and email providers only. Section 16 (L123) says partners receive "a parent's hashed email and purchase information". Not disclosed: session recording (Clarity, which Microsoft's own disclosure guidance expects), Meta Pixel and Google advertising cookies, page views and click IDs sent to ad partners, IP and device data. `/season1/terms` is retired (`app/season1/terms/route.ts` L4-11) and ToS section 23 carries no data terms, so the privacy policy is the right and only place; no terms gap.
- Resolution: park for Jamie (legal text is his call). One-line suggestions: section 8 "We use Google Analytics, Meta Pixel and Microsoft Clarity (which records how visitors use our pages, with typed entries masked)." Section 16 "Advertising partners receive a parent's hashed email, device and browsing information on our sign-up pages, and purchase information." Ship the policy edit before or with the release, not after.

**8. QA gate can fail open on static routes or misrouted hosts.** Severity: major.
- Evidence: `/season1` and `/season1/thanks` are `force-static` (`app/season1/route.ts` L11, `thanks/route.ts` L11), so no request Host exists at render. The nearest helper, `shareOrigin` (`lib/season1/httpGuard.ts` L55-59), defaults an empty host to `ekuzo.gg`. S1 makes tags independent of commit mode, so a test-mode build served on ekuzo.gg (Netlify split test, a mis-set alias) would fire live tags on test purchases.
- Resolution: change the spec. Static pages use the client hostname rule (S12 already does this for the landing; say so for thanks). Renderer treats a missing host as non-live (unit test). Live tags require host ekuzo.gg/www AND mode not `test`; mode `off` still measures, so the paused-page goal holds.

**9. Google Ads pings may survive QA flags; the GA4 filter waits until release.** Severity: major.
- Evidence: S1 relies on `allow_google_signals`/`allow_ad_personalization_signals` false; the Ads destination loads from the GA4 property link (scout L70, L112), which those flags may not stop. R3 has no fallback. D1 sets the Developer traffic filter Active only at release, so every QA `purchase` before then counts in production and can import into Google Ads.
- Resolution: change the spec. Set the filter Active now (no production event carries `debug_mode`). QA mode also sets `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})` before `config`. If R3 still shows `/pagead/`, QA uses a separate GA4 measurement id.

## Minor

**10. Referrers can carry what URLs cannot.** Severity: minor.
- Evidence: Pixel `rl`, GA4 `page_referrer` and Clarity record `document.referrer`. Welcome's referrer comes from Stripe or a bank page on redirect payment methods (scout L33); our own pages send origin only (`referrer-policy: origin`, crew route L101, signup route L98). Must-not L90 covers URLs, which should include referrers.
- Resolution: change the spec. R18 adds one run with a redirect-based method or 3DS test card checking `document.referrer` on welcome holds no client secret; GA4 config on welcome sets `page_referrer` to the origin.

**11. GA4 enhanced measurement side doors.** Severity: minor.
- Evidence: sign-up `<form id="f">` (`signup.html` L195) has no action, so GA4 form events send `form_destination` = full page URL, bypassing S2. History-change page_views are safe today only because every `replaceState` runs before gtag (welcome route L240, crew L7, signup L4).
- Resolution: accept if finding 4 lands (the URL is already whitelisted); add a template test that no history API call follows `{{TAGS}}`.

**12. Klaviyo carries kid data and now ad parameters.** Severity: minor.
- Evidence: Committed already sends `kid_name`, `kid_age`, `sibling_names` and profile `season1_kid_name` (`lib/season1/senders/klaviyo.ts` L45-47, L70-72, L87). S7 adds utm and first touch. Klaviyo is not on the rule's forbidden list, but it can sync segments to Meta and Google Ads, and its UTM settings can insert profile-level values that S2 and S4 would then pass to GA4 and Clarity.
- Resolution: park for Jamie. Default: Aaron confirms no Klaviyo ad-audience sync uses Committed properties and that Klaviyo UTM values are campaign-level only; note both in the release checklist.

**13. Parent trust details.** Severity: minor.
- Evidence and resolution: (a) the pending state refreshes every 4 s up to 30 times (`welcome/route.ts` L159-165), each a Pixel PageView and Clarity page; accept, but fire the Pixel PageView once per order on welcome. (b) Paid parents keep seeing waitlist ads; park for Jamie: exclude Purchase audiences from Lead ad sets (Aaron's call). (c) Pixel Purchase tells Meta the parent bought a kids program; acceptable once section 16 says so (finding 7). (d) S10 view token on 409 has the same bar as the existing reuse path (email, attemptId and kids signature, `app/api/season1/commit/route.ts` L281-292); accept. (e) S10 copy fix ("not charged" no longer shown after a possible charge) is a trust gain; accept.

**14. Kids' privacy law, careful-reviewer view.** Severity: minor.
- Evidence: the parent types all kid data; kids 9 to 17 may open crew and, through its "Join the team" button, sign-up (`crew.html` L195). Section 6 of the policy says programs are "designed for minors". A reviewer would ask whether ad tracking runs on pages a child is likely to open (COPPA mixed-audience view; Meta's terms bar data known to be from children under 13).
- Resolution: change the spec with findings 3 and 5 (no Pixel or Clarity on crew, ads signals off there, no form scraping). Accept Pixel on join and sign-up as parent-directed purchase pages. Park for Jamie: whether a California "sharing" notice is needed (likely under the CPRA thresholds today; revisit with growth).
