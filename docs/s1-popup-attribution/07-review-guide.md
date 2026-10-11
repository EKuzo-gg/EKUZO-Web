# 07 Review guide (Fable)

## 60-second summary

- Popup sign-ups after an ad landing now keep the ad: `source: site-popup`, all utm_*, utm_id,
  site, `ad`, and a new `attribution_from` (`session`, `return-visit` within 7 days, `url`, `none`).
  Verified in a real browser (old code reproduces the Nampa bug) and live in Klaviyo (event
  `7wnxqja73rN`).
- `form_start` fires only on a real tap, key press or paste. Old code fired it once per form on
  autofill-like input, matching the GA4 "about twice per user" pattern. Expect `form_start`
  counts to drop sharply from this deploy; compare before/after, not to history one for one.
- Clarity's 1 `signup` for 2 sign-ups is not our call being lost on timing (queued and replayed
  when Clarity loads late, flushed by sendBeacon on an early close). It is lost only if Clarity
  never loads (blockers) or the page is killed with no pagehide. No code change.
- Meta pixel, CAPI and event_id: identical before and after. Nothing visible changed.
- Jamie approved release, 2026-10-11 12:28 CT ("feel free to push everything live").

## Decisions, most overrulable first

See `03-decision-log.md`: D1 latest ad landing wins in the session record; D2 only utm_* counts
as an ad touch; D3 the 7-day Season 01 record (Jamie's pick); D6 not done here: the landing page
does not set `ekuzo_s1_joined`, so a parent who signed up on /season1 can see the popup on the
site and a second sign-up would send a second Lead (recommended follow-up, Aaron's design call).

## Human checks after deploy (deferred to a person)

1. Phone, in the Instagram or Facebook app: open
   `https://ekuzo.gg/season1?ad=d5&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d5-a-showup&utm_term=test&utm_id=test&site=ig`,
   do nothing for 5 seconds (let autofill run), then in GA4 Realtime or DebugView: no
   `form_start`. Tap the email field: one `form_start`. Do not submit unless with a
   `team+s1test-1011...@ekuzo.gg` address (a submit fires a real Meta Lead).
2. Daily readout: exclude `team+s1test-1011` (two test profiles, events 7wnxqja73rN and
   7wnx9QA3qwi; neither is on list XGTv2F).
3. GA4: filter hostname `localhost` if any test traffic shows (defect D-004).
4. Profile links: EKUZO's Instagram/Facebook link to ekuzo.gg is likely untagged; a tagged URL
   (for example `?utm_source=instagram&utm_medium=social_profile`) would separate that path.

## Evidence

`04-evidence-ledger.md` (every ID, PASS), `evidence/` (Sentry runs, raw captures, N7 GA4 and
Clarity network table), `06-cleanup-ledger.md`. Screenshots (6 before/after pairs, 0 differing
pixels) in `EKUZO/Marketing/ads/2026-10-season-one/build/s1-popup-attribution/`. Production
`next build` passed (route `/season1` static, `/api/season-one` dynamic).
