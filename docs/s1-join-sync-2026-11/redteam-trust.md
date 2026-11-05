# Red team: users, trust and privacy (spec 01-requirements.md)

Lens: what a parent sees, what leaks, what consent breaks, what the /join clone drops. Read-only review of the spec and the code on branch `build/s1-join-sync-funnel-fixes`. Severity: critical (do not ship), major (fix in spec), minor (note or small change).

## Findings

1. **Major, R3.1 / R3.2.** The repeat path skips the list subscription, but the existing route tolerates a failed subscribe (logs it, still returns ok). The Waitlist event has already written `season1_joined_at` by then.
   - Scenario: sign-up 1 writes the event, the subscribe times out, the parent sees "You're on the list". They retry within minutes (no email arrived). The lookup finds `season1_joined_at`, returns `repeat:true`, and nothing ever subscribes them. For 24 h they believe they are in and get no email.
   - Same hole for a parent who unsubscribed from the first note and re-signs up wanting email again: fresh affirmative submission, no resubscribe.
   - Change: the lookup must also read subscription state on the list (or the route always runs the idempotent subscribe call on the repeat path, which costs 2.5 s of the budget). Define repeat as "joined within 24 h AND subscribed to list XGTv2F". If not subscribed, run the subscribe step but still skip the Waitlist event and Lead. Add a test: joined_at set, not subscribed, subscribe is called.

2. **Major, R3.1 / R3.4 / R3.8.** Account enumeration. `{ok:true, repeat:true}` is a public yes/no oracle: anyone can POST any email and learn whether that person joined a youth esports waitlist in the last 24 h. Timing also differs (repeat skips three upstream calls, so it returns in roughly one second against several). There is no rate limit on the route.
   - Change: keep the response body identical for new and repeat (`{ok:true}`). Do the Lead and `generate_lead` dedupe client side: store a hash of the email plus timestamp in localStorage on success and skip the browser Lead when the same hash is under 24 h old. The server already dedupes CAPI (it sends nothing on repeat) and Meta dedupes by `event_id`. If the spec must keep the flag, only honor it when the request carries the `eventId` of an earlier attempt on that page (not knowable to a prober), and add a per-IP limit. Pad repeat latency or accept the timing oracle and say so.

3. **Major, R3.7.** The landing sets `ekuzo_s1_joined=1` for any sign-up. localStorage is per browser, not per person. Scenario: a parent signs up on a family iPad, school-lab or library computer; the spouse or the next person on that device never sees the site popup (J2), including people who never signed up. Likewise a parent who signs up for a second child with a different email (M2) is fine, but a different parent is invisible.
   - Change: record the email hash with the flag. The popup stays suppressed on that browser (cheap, and the joined parent is the common case), but document the tradeoff in the spec and make `?join=season-one` and the Enroll links still open the popup regardless (they do today; add a test so R3.7 does not regress it).

4. **Major, R3.1.** The repeat path writes nothing, so new data is dropped. Examples: a parent first joins via the popup (no ad, no hero), then via an ad within 24 h: the ad id, UTMs, hero answer and geo/tz that Karlin uses to pick a text time are lost. An attacker or friend who joined someone's email first (no confirmation, no double opt-in) blocks the real parent's attributed Lead for 24 h.
   - Change: on repeat, write a separate low-weight event (`Season 01 Waitlist Repeat`, properties: ad, hero, utm, where) with no profile `season1_joined_at` update and no flow trigger. Confirm no Klaviyo flow is keyed on that metric name. At minimum, fill `season1_ad` and geo on the profile only if currently blank.

5. **Minor, R3.4.** On repeat the landing shows "You're on the list. Check your inbox for a note from Karlin." A parent who retried because the note never came gets the same line and no path forward. Copy cannot differ per server flag without finding 2 (an oracle), so use the localStorage hash instead: if this browser already joined this email in 24 h, show "You're already on the list" with "check spam or Promotions, or text Karlin below". The Text Karlin card stays (R3.9).

6. **Major, R3.1 (filter).** The email goes into a Klaviyo filter string. `EMAIL_RE` is `[^\s@]+@...`, so `"`, `)` and `,` pass. A crafted email such as `a"),equals(email,"b@x.co` yields a malformed or altered filter. Klaviyo ANDs filters so it cannot broaden to another profile, but a 400 fails open and gets logged with the email.
   - Change: URL-encode the whole filter and escape `"` and `\`, or reject emails containing `"`, `(`, `)`, `,`, `\` before the lookup (tighten the lookup path only; do not change the sign-up regex). Add a test with a quote email.

7. **Major, logging / M6.** Existing code logs the full email on a missing key (`console.error(... email)`) and logs `await r.text()` from Klaviyo on failures. Klaviyo error bodies echo the filter, so a failed lookup would log the email and any profile detail it returned.
   - Change: add to the spec: the lookup logs status code and duration only, never the URL, body or email. Read only `season1_joined_at` (use `fields[profile]=...` sparse fields, so kid-adjacent properties such as `season1_kid_age`, `season1_text_phone` and `kid_games` never leave Klaviyo into function memory). Add a test that asserts the lookup request carries a sparse-fields param.

8. **Minor, R3.3.** `unique_id = email-metric-eventId` puts the email in an identifier; the current code already does this, so no new leak. But note the Klaviyo events API is async: the property is not readable for seconds, so two tabs or two devices with different `eventId`s both pass the 24 h check and both write a Lead. M1 only guarantees same-attempt retries. State that the 24 h rule is best effort within the read-after-write window.

9. **Minor, R3.2.** The worst case 9.2 s leaves 0.8 s of Netlify's 10 s for cold start and JSON parsing. A function timeout returns 504 after the event may already be written; the parent retries with the same `eventId` (R3.3 collapses it, good) but sees an error for a sign-up that worked. Lower the lookup cap to 800 ms or lower the event cap, and keep the ordering (lookup, event, subscribe, Lead).

10. **Minor, R3.9 / gap.** `step: "text-karlin"`, `age` and `games` accept any email with no proof it signed up, and write to that profile (phone, age band, games). A stranger can attach a number to someone else's profile and make Karlin text it. Pre-existing, so out of scope for W3, but the repeat work makes `savedEmail` reuse more common. Add a follow-up ticket: require the `eventId` (or a short-lived server nonce returned by the sign-up) on follow-up steps.

11. **Major, R2.3 / M7.** The honeypot returns a silent 200 and the landing then shows the normal confirmation. If a browser or password manager autofills `ekz_hp` (the reason W2 exists), a real parent sees "You're in" and is not. `autocomplete=off` plus the data-* flags reduce this but do not guarantee it.
   - Change: count honeypot drops (log line with no email) and alert on a spike; add the H2 check in a real iOS Safari autofill session. For the commit signup page (R2.4), confirm what the parent sees on a rejected `company` value, since a visible error beats a silent fake success on a paid flow.

12. **Major, W1 (clone fidelity).** `/join` becomes B, and J4 (Klaviyo email link to `/join?src=email`) lands real parents on a different page. What B drops against the old /join:
    - Last practice date ("May 6 Last practice"); B ends the timeline at "Mid Apr Final tournament", so the season end is only in the FAQ ("January to May").
    - Price on the CTAs: old "Save their spot · $100", "Lock in for $100"; B has "Join Season 01" and "Join the team!". The price appears only in the hero button and the pay accordion. An email parent may reach the sticky bar without the price.
    - "Your $100 covers [first month]" (`SEASON_LINE`) is gone; the pay accordion says "first month deposit" under a "Jan ... Today" tile, while the parent pays in Nov or Dec. Confusing for a parent expecting a charge in January. Note "Full refund until [lock-in]" survives in the timeline only.
    - "You get your link right after you save a spot" (friend credit) is gone.
    - "We help with setup in late November" became "before the first practice" (less specific; the timeline still says Late Nov).
    - B hardcodes "Save $60 off your first month" while the price comes from `OFFER`; it matches today ($160 minus $100) but drifts silently if `OFFER` changes.
    - Change: R1.6's "visible text diff is empty" only proves clone equality, not parent impact. Add an acceptance item: Jamie signs off on this delta list (the old-only copy above) before deploy, and replace the `$60` literal with a computed `{{FIRST_SAVE}}` in the shared template (this is a template edit, so call it out under the "shared template" rule in R1.1).

13. **Minor, R1.1 / R1.4.** Analytics: `/join` now sends `season1_join_view {variant:'b'}`, so GA4 can no longer separate the old /join audience (email, other sources) from /join/b traffic. Decision D1 accepts this; add a stable `page_path` check in the ledger so email-source parents are still segmentable by `src` (Clarity tags `src`, GA4 URLs keep `src` via URL_ALLOW).

14. **Minor, M6 / kid data.** The repeat response and lookup add no kid data to URLs, GA4 or Meta, which is correct. One caution: R3.1's lookup must not echo profile fields to the browser. State "response is exactly `{ok:true}` plus, if kept, `repeat`" and add a test asserting no other keys.

15. **Minor, R3.5.** Tying `eventId` to the email is right, but also clear the landing's saved `savedEmail` on a different email so Text Karlin never texts a number against the first parent's email after the second parent submits on the same page view. Add this to R3.5 (currently only `eventId` and the Lead guard are re-armed).

## Suggested spec edits (short)

- R3.1: repeat = joined within 24 h AND subscribed; otherwise subscribe without event or Lead.
- R3.1/R3.4: response body identical for new and repeat; browser-side hash dedupe for Pixel/GA4/Clarity; rate limit.
- R3.2: sparse fields, filter escaping, log status only, 800 ms cap.
- New R3.10: repeat writes a `Season 01 Waitlist Repeat` event so ad, UTMs and hero are not lost.
- R3.7: flag stores an email hash; `?join=` and Enroll links still open the popup.
- R1: add a parent-impact sign-off list (finding 12) and compute the $60 saving.
- R2.3: honeypot drop counter and an iOS autofill check at H2.
