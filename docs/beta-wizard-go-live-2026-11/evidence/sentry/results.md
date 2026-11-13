# Sentry results: beta wizard, build/beta-wizard @ a386ee5 (base 737330f)

Run 2026-11-12 evening. Nothing outside evidence/sentry/ was edited. No git state changes. Port 3100 server stopped and confirmed free (curl 000, fuser empty).
Note: sentry/npm-test.txt was already tracked in git; I overwrote it with this run's last 40 lines (full output in npm-test-full.txt).

## Checks

PASS/FAIL counts: browser 145 PASS / 0 FAIL at 390x844 and 145 PASS / 0 FAIL at 1440x900 (qa-mobile.log, qa-desktop.log, qa-results-*.json). My first runs had harness bugs of my own (label toggling, CSS uppercase compare, init script outside try, a wrong expected count); fixed in qa.mjs and re-run in full. Adversarial: 15/15 (adversarial-run.txt).

| ID | What | Result | Evidence |
|---|---|---|---|
| T1 | `npm test`: 653 pass, 1 skipped, 0 fail (+ field-vitals 5/5) | PASS | npm-test-full.txt, npm-test.txt |
| T2 | `npx tsc --noEmit -p .` | PASS (exit 0, no output) | tsc.txt |
| T3 | `next build` with unit keys | PASS | build.log |
| C1 | Launch with `?src=karlin-email` sets `ekuzo_bsrc=karlin-email` (HttpOnly, SameSite=lax, Max-Age 30d, Secure) | PASS | cookies.txt |
| C2 | `/season1?src=`, `/season1/join?src=`, `/?src=` do not set it; bad tag, 41 chars, `<script>`, bot UA, `/season1/betaX` do not set it; `KARLIN-Email` is lowercased | PASS | cookies.txt |
| C3 | Cookie is also set on `/season1/beta?src=` and `/season1/beta/start?src=` (in scope) | PASS | cookies.txt |
| 2a | J1 at both viewports: launch, button tap, wizard, finish. Posts in order progress 0, 1, 2, then beta-wizard; one sessionId; final carries eventId, age as number, tz, times; wizard URL has no query | PASS x2 | J1-bodies-*.json, J1.* lines |
| 2a | End screen promises review, not a spot; localStorage cleared after finish | PASS x2 | J1.doneText, J1.lsCleared |
| 2b | Load: no post, no beta_wizard_* event, no localStorage key | PASS x2 | b.load |
| 2b | Script-set (autofill-like) values with no Continue: no post, no event, nothing stored | PASS x2 | b.autofill |
| 2b | Touch scroll (CDP touchStart on email field and on Continue, then move) and mouse drag/wheel on desktop: no post, still on screen 1 | PASS x2 | b.scroll |
| 2b | Continue posts stage 0 once; Back x2 posts nothing; GA step event once per step despite Back/forward; Enter in email advances and posts once; invalid email posts nothing | PASS x2 | b.* |
| 2b | beta_wizard_complete: not on load, not on 400/502/429/network abort/HTML 504/500, once after success | PASS x2 | c*.noComplete, c*.completeOnce |
| 2c | Each failure: parent stays on availability, red error shown, button back to "Send it", answers kept in localStorage, retry reuses the same eventId | PASS x2 (6 modes) | c*.stay, c*.sameEventId |
| 2c | What the parent sees: 400 shows server `error`; 429 and 502 show the founder-number text; abort and HTML 504 show "That didn't go through. Check your connection and try again."; 500 json shows its error | observed | c*.what lines |
| 2c | Double tap, click and Enter during an in-flight send (1.5 s): one final post, one complete | PASS x2 | slow.once |
| 2d | Reload on screens 2, 3, 4 reopens on the same screen with email, vows, name, age, plays, sports, power, fun fact, player card preview, times, note restored; time zone Pacific (changed from device Central) restored | PASS x2 | d.R1, d.R2, d.R3 |
| 2d | Reload on screen 1 with a typed, un-continued email: reopens empty on screen 1 (by design, nothing captured yet) | PASS (info) | d.R0 |
| 2d | Corrupt JSON, v:2, 15-day-old entry, missing `at`, localStorage getter throwing, all Storage methods throwing: page opens fresh, no error, wizard still completes. 13-day entry restores | PASS x2 | d.*.open/.finish |
| 2d | Tampered values (non-array lists, stage 99, stage "2", `<img onerror>` names, hostile sid): no page error, no script runs | PASS x2 | d.weirdTypes, d.xssName, d.hostileSid |
| 2d | After completing, a new visit starts fresh; second kid: new sessionId and new eventId | PASS x2 | d.fresh, d.twoKids |
| 2e | No recorded third-party request, vendor queue (fbq, clarity) or dataLayer carries the email, name, fun fact or note | PASS x2 | e.requests, vendor-*.json, J1.gaDump |
| 2e | GA4 content: set/config page_location (launch URL carries `?src=`), `beta_wizard_step {step:"email"|"expectations"|"player_card"}` x3, `beta_wizard_complete` (no params). Meta: init, autoConfig false, PageView only. Clarity: `event beta_wizard_complete`. | observed | J1.gaDump, J1.vendor |
| 2f | No uncaught page errors; no console errors from our page apart from 404s on `@2x` torn-paper images (see D5) and aborted third-party noise | PASS x2 | f.* |
| 2g | Screenshots: beta, launch, wizard email/expectations/player/availability/done/error at 390 and 1440 | done | screenshots/ (naming `{page}-{viewport}-{state}.png`) |
| 2h | /season1?ad=d19, /season1/join, /season1/join/jersey: 200, no page errors, no `ekz_beta_wiz` in HTML or DOM, no `ekuzo_bsrc` | PASS x2 | h.* |
| N7 | On localhost, localhost with `?s1qa=1`, and a netlify host: whole wizard run posts nothing and fires no GA beta events; no vendor request without `s1qa=1` | PASS x2 | N7.* |
| OFF | Offender check: hosts that got a response from the network = local ekuzo.gg only; every other request aborted (fonts.googleapis.com, googletagmanager, connect.facebook.net, clarity.ms) | PASS x2 | offender, e.hosts |
| 3a | Prototype-pollution keys in body, answers, attribution: no pollution, answers reduced to whitelisted keys | PASS | adversarial-run.txt |
| 3b | 100k-element arrays and 1 MB strings: 400 or capped at 40/120/500; Klaviyo body bounded | PASS | |
| 3c | Non-object and invalid JSON bodies: 400, nothing written | PASS | |
| 3d | Arrays/objects/null/bool where strings expected, for 9 wizard fields and 6 progress fields: never a 5xx; an array `step` does not reach the waitlist | PASS | |
| 3e | Unicode: RTL override, zero-width, ZWJ, emoji stripped from name; marks-only and emoji-only names refused; no lone surrogate at the 120 and 500 caps | PASS | |
| 3f | stage 1.5, "1", -1, 3, 4, 1e9, null, NaN, [1], {}, true: all 400; 0,1,2 accepted | PASS | |
| 3g | sessionId and eventId with `../`, SQL and CRLF reduced to `[A-Za-z0-9-]{1,64}`; id that cleans to nothing: progress 400, wizard derives `auto-` id | PASS | |
| 3h | Emails with CRLF, control chars, spaces, no TLD: 400 on both steps (a trailing `\n` is trimmed first, so it is accepted as the clean address) | PASS | |
| 3i | Hostile `ekuzo_bsrc` (script, markdown, 5 KB, capitals), `ekuzo_lc` (bad JSON, bad percent-encoding, 5 KB, markup), `ekuzo_origin`: source always `[a-z0-9_.:-]{1,60}`, attribution small | PASS | |
| 3j | beta-progress for an email that never completes: only progress rows and "Beta Wizard Progress" events, no family/player row | PASS | |
| 3k | Neither step reaches Discord, Graph API, Sheets (unset), a Klaviyo subscribe or list XGTv2F, or an `s1wl:` key (afterEach guard on every test) | PASS | |
| 3l | Logs (ok, db down, Klaviyo 500, Klaviyo throw, both down, 429, honeypot) contain no email, name, fun fact or note | PASS (see D8 caveat) | |
| 3m | 31st wizard post from one IP is a 429; 151st progress post is dropped with ok and writes nothing | PASS | |

## Protections and the line that implements them

| Protection | Where |
|---|---|
| Non-object body to 400; email length, regex, control chars | app/api/season-one/route.ts:478, 481 |
| Unknown step to 400 (an array or null `step` never reaches the waitlist) | route.ts:490 |
| Cross-site guard | route.ts:476 |
| Name charset and 40 cap | lib/season1/betaWizard.ts:73, 112 |
| Free text strips controls and `<>`, caps, trailing lone surrogate | betaWizard.ts:75-77 |
| Ids reduced to `[A-Za-z0-9-]` and 64 | betaWizard.ts:78 |
| Closed-set lists, at most 20 entries | betaWizard.ts:81-87 |
| Source tag `[a-z0-9_.:-]` and 60 | betaWizard.ts:167; cookie tag regex 46 and middleware.ts:61 |
| Bots get no `ekuzo_bsrc` | middleware.ts:61 |
| Honeypot | betaWizard.ts:354 (wizard), 457 (progress) |
| Stage must be integer 0..2; sessionId required | betaWizard.ts:459-461 |
| Progress answers whitelisted | betaWizard.ts:413-433 (called at 475) |
| 30/h per IP and 200/h global quiet | betaWizard.ts:67, 69, 334-345 |
| 150/h per IP for progress | betaWizard.ts:410, 465 |
| Logs print status or error name or db message, never fields | betaWizard.ts:240, 295-298, 342, 387, 462-470 |

## Defects

| ID | Sev | Type | Reproduction | Expected vs actual |
|---|---|---|---|---|
| D1 | major | accepted-risk-candidate (design) | `POST /api/season-one {step:"beta-progress", email:<any address>, sessionId:"x", stage:0}`, no ownership proof (adversarial test "progress is open to any email"; 150 posts per IP per hour) | Expected: a stranger cannot put an address on the drop-off list. Actual: a Klaviyo profile and a "Beta Wizard Progress" event are written for any address, with `beta_wizard_next_step` set. Harmless today (no pick-up email), but when the pick-up flow keys on that property it mails strangers' addresses. Gate the pick-up flow (double opt-in, or only send after a verified action) before enabling it |
| D2 | major | accepted-risk-candidate (design) | Complete a family, then post progress for the same email with a different sessionId (adversarial test "stranger posting progress for a completed family") | PROGRESS_SQL (betaWizard.ts:443-448) starts the row over and clears `completed_at`; the profile `beta_wizard_next_step` goes from "done" to "What the beta is". A finished family is again a drop-off, so the pick-up email would target it. Same class as red-team A2, and A4 is documented; this one is not in redteam-resolution.md. Fix when the signed link ships, or never clear completed_at from a progress post |
| D3 | minor | code-bug (race) | Parent finishes availability within about 3.5 s of the stage-2 progress post (Klaviyo cap EVENT_TIMEOUT_MS), or a restore re-post lands late | The profile can end on `beta_wizard_next_step: "Availability"` after "done" (profile writes are last-writer-wins across two requests; no completed guard on the Klaviyo side). Not reproduced live: no Klaviyo in this container |
| D4 | minor | code-bug / accepted-risk-candidate | Send fails with a lost response (the save actually succeeded), parent reloads, taps Send again (cFR.newEventId, both viewports) | The eventId is created per page load (start.html `sendId`), and the progress script does not keep it, so the resend is a new Klaviyo "Beta Wizard Completed" event and `submissions`+1 on the same player row. Same-page retries are deduped (c*.sameEventId) |
| D5 | minor | infra-gap | `curl -I http://127.0.0.1:3100/images/new%20torn%20paper/torn-paper-grey-top-1@2x.png` is 404 under `next start`; `%402x` is 200. The page CSS uses a raw `@` | The tear images 404 locally on beta, launch and wizard (header edge is square in my screenshots). Also referenced by unchanged /season1/join/jersey, so it is likely a `next start` quirk and not a regression. I cannot verify Netlify; check the live page once |
| D6 | minor | page (Aaron) | Read of start.html: `ekz_hp: ""` is hard-coded and there is no hidden input (known A3b) | Honeypot protects nothing on this page; server check stays. Still open |
| D7 | minor | page (Aaron), copy | Read: "about your player's spot", "spots depend on what lines up" | Already raised as B1 and left to Jamie's review; end screen itself says "review and email you either way". Nothing implies a guaranteed spot in the rendered end state |
| D8 | minor | accepted-risk-candidate | Code read: `console.error("... database save failed:", err.message)` at betaWizard.ts:240, 342, 470 | With a real Neon driver the message might echo query detail. The mock only returns "db down", so I could not test whether a real constraint or type error echoes a parameter (name, answers). Check one forced failure on the test database |
| D9 | minor | accepted-risk-candidate | adversarial "unicode" test: `note` of "hello ‮dlrow" is kept | Bidi override and zero-width characters survive in note and fun fact (only controls and `<>` are stripped), so a note can render reversed in Klaviyo or any internal view. Strip U+202A-202E, U+2066-2069 in freeText |
| D10 | minor | accepted-risk-candidate | adversarial: `email: "<script>x</script>@b.co"` returns 200 and is stored | The shared EMAIL_RE accepts markup characters in the local part (pre-existing, same for the waitlist). Safe only if every template escapes the address |
| D11 | minor | accepted-risk-candidate | Abandon a run on a shared device | The wizard keeps email, name, age, fun fact and note in localStorage for up to 14 days, sliding on each keystroke, and clears only on completion. Fine for a home phone; a library or school computer keeps a child's details |
| D12 | info | n/a | b.refwd: Back then forward re-posts stage 0 ([0,1,0]); restore re-posts the reached stage ([0,0,1,1,2,2,2]) | Server and Klaviyo `unique_id` make these idempotent for events; the profile props are rewritten each time |

No critical defects. No FAIL in any check I ran after fixing my own harness bugs.

## Could not test, and why

- Real GA4, Meta and Clarity beacons: the vendor scripts are aborted by the fail-closed harness, so no collect request ever exists. I inspected what the page hands them (dataLayer, fbq queue, clarity queue) and every attempted request URL. GA4 enhanced-measurement auto events (form_start, form_submit) are a property setting and cannot be seen here.
- Real Neon: SQL semantics (SAVE_SQL, PROGRESS_SQL, ON CONFLICT, xmax) were read, not executed; the mock honors the contract only. evidence/sql-on-neon-test.md is the author's.
- Real Klaviyo behavior (profile property merge order, dedupe by unique_id, whether metric flows reach profiles without consent): not testable; D3 is by code reading.
- The `ekuzo_bsrc` cookie round trip in the browser: Chrome refuses Secure cookies on http://ekuzo.gg:3100, so I verified the cookie by curl only and never saw it arrive on a wizard POST.
- Netlify specifics (`x-nf-client-connection-ip`, `x-nf-geo`, the 10 s function cap, CDN handling of `@` in paths).
- Safari/iOS in-app browser behavior: Chromium emulation only (touch, 390x844).
