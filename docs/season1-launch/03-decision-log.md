# 03 Decision log (Fable)

Most overrulable first. Inputs: `auditor-phase1.md`, `review-code-security.md` (CR-*), `05-defect-log.md` (D*).

| # | Decision | Rationale | Overrule if |
|---|---|---|---|
| 1 | **Abuse exposure accepted for launch** (CR-4, CR-5, D4, Auditor F6): no rate limit, unauthenticated games step, anyone can subscribe any email on a single opt-in list. | No welcome flow yet, so a bombed address gets nothing until Monday; fake Leads would show as a gap between Meta Leads and Klaviyo list growth in the daily readout, which already compares the two. A rate limit on Netlify needs new infra; honeypot covers naive bots. Revisit at the first sign of abuse or before the welcome flow goes live (double opt-in is the clean answer then). | Jamie wants double opt-in or a rate limit before spend. |
| 2 | **List-subscribe failure keeps returning ok and still sends the Lead** (CR-1 code path, D3, Auditor F1). Make the thrown-error path match the HTTP-error path (log, continue). | The parent's email and consent are recorded on the profile by the event; a failed subscribe can be backfilled from the "Season 01 Waitlist" metric. Returning 502 would make a key-scope problem turn every ad click into a failed sign-up. The real fix is upstream: **L2 is a hard gate on list membership**, not just the event. | Jamie prefers a hard failure. |
| 3 | **CR-1 root cause is most likely the Klaviyo key's scope** (no other route in the repo calls Klaviyo's subscription API; Aaron's two live sign-ups created events but no subscription). Human action H4: check Netlify function logs for "Klaviyo Season 01 list subscribe failed" (status 403 = scope), and if so create a Klaviyo private key with Subscriptions write + Lists write + Events write + Profiles write and swap it into Netlify. | Cheapest diagnosis is the log line; code is correct per Klaviyo's bulk-subscribe contract. | The log shows a 4xx other than 403 (then Relay fixes payload). |
| 4 | **Turn off the pixel's automatic events** (`fbq('set','autoConfig',false,pixelId)` before init) on the landing page and in `app/layout.tsx` (CR-3). | Automatic button-click events can send button text, and the game chips' text describes the child. The minors rule is absolute; we only need the explicit PageView and Lead. Also turn off "Automatic events" in Events Manager (human action H5) as the second lock. | Never; this is the child-data rule. |
| 5 | **Fix the landing font request** (D1). | It is a broken URL, not a design choice: the creative and Aaron's Figma use Bricolage Grotesque; with the fix the page matches the ads (see `screenshots/*-fontfix.png`). | Aaron says the fallback was intended. |
| 6 | **Client skips the browser Lead when the honeypot is filled** (CR-7) on landing and popup. | Keeps S1 true on both halves; two lines. | |
| 7 | **Small route hardening**: null body -> 400 (D2); `ad` allowlisted to `d1`..`d12` for `content_name` and the stored ad (D5); stale "mirrors /api/campaign/lead" comment corrected (CR-14). | Cheap, keeps Meta's content_name clean for per-ad reads. | |
| 8 | **Accepted minors, no change**: popup re-sign-up fires a new Lead (CR-6, rare); keyboard resubmit behind overlay reuses the event_id so Meta dedupes (D6); dev deploys send browser Leads to the live pixel (CR-8: campaign is paused, test volume is a handful, logged); 1.2 MB landing with inline images and internal design notes in source (CR-9, Aaron's lane, post-launch follow-up; notes contain no child names or sensitive detail, checked); `age` step and `firstName` unused (CR-14, harmless); `SEASON_ONE_MODE` is build-time (CR-15); invalid or missing `?ad=` renders d1 (Auditor F3, ads always pass `ad`, utm_content is the ground truth); pre-existing D7, D8. | Each is low impact or outside this launch's lane; listed in the review guide. | |
| 9 | **Popup auto-opens full screen on mobile** (CR-10, possible Google interstitial demotion). | Aaron's design, confirmed by Jamie as intended for waitlist mode. Raised to Jamie as a decision, not changed. | Jamie wants it softened for SEO. |
| 10 | **`/season1` rewrite is a launch gate** (CR-2): L1 must return 200 on the dev deploy before the ads point at it; fallback is a netlify.toml 200 redirect or pointing ads at `/roadshow/landing.html?ad=dN`. | Untested on Netlify's runtime. | |
| 11 | Requirement changes accepted from the Auditor: P5 widened to the full waitlist-mode behavior (Sentry tested P4/P5 matrix); S1 reworded to both halves; T6 property contract as built (`kid_games` unprefixed, Aaron's naming). Others noted, not adopted. | Keeps the spec honest about what ships. | |

## Jamie's rulings, 2026-10-10 14:05 CT (supersede the Steward and Parent findings)

- **Creative and copy are Aaron's and locked for launch.** No Story edits. Steward ST-1 to ST-19 and Parent PX-1 to PX-12 are closed as "owner's call": the blocking items are settled by Jamie's facts below, and the rest are logged for Aaron in `EKUZO/Marketing/ads/2026-10-season-one/notes-for-aaron.md`.
- ST-1: photo releases are clear for all 12; d3 Boys & Girls Club jerseys stay.
- ST-2, ST-7: Season 01 will likely run multiple games and EKUZO can support it; "the game they already love" and "Same game" stand. d1 block art is original and intended.
- ST-3: the jersey with gamer tag is a program default.
- ST-4: "limited" and "Save their spot" stand: partner capacity (university-affiliated cohorts) is finite, and the internal target is 100 per focus metro.
- ST-5: the coaches exist and appear in the nurture lead-up.
- ST-6: the d7 weekly parent note is real.
- PX-1, PX-3, PX-4, ST-8, ST-11, ST-12, ST-13, ST-10 (d10 text), CR-10 (mobile popup): Aaron's intentional choices.
- Decision 1 (abuse accepted) and decision 2 (subscribe failure does not fail the sign-up): approved.
- Decision 5 (font URL fix) kept as an engineering fix: it restores the font Aaron's CSS specifies and his ad images already use; flagged to Aaron with a one-line revert offered.

## Spec change SC-1, 2026-10-10 14:15 CT (from the approved targeting session)

Source: `EKUZO/Marketing/ads/2026-10-season-one/targeting-budget-decisions.md` Part 1 items 3 and 4,
approved by Jamie; handoff `2026-10-10-season1-meta-build-launch.md` "Update 2026-10-10" item 4.
Ad URLs will carry `&utm_term={{placement}}&utm_id={{ad.id}}&site={{site_source_name}}`, frozen at
first publish, so the web side must capture them before the ads go live.

- **T10 (new)** Landing page sends `utm_id` and `site` (plus existing utm_*) in `attribution`; the route stores `utm_id` and `site` on the "Season 01 Waitlist" event (utm_term already stored).
- **T11 (new)** The route records server-side parent geolocation (country, region, city, postal code from Netlify's `x-nf-geo` header) and device (os family, mobile/desktop from the user agent) on the Klaviyo event only. Never sent to Meta. Missing header = empty fields, never an error.
- Item 12 (price and PC lines on the page) is NOT adopted: Jamie locked Aaron's copy.
- Lead stays ungated by any child attribute (item 10): already true, unchanged.
