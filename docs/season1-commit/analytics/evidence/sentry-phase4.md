---
title: "Sentry phase 4: Season 01 analytics build on the branch deploy (test mode)"
created: 2026-10-30
author: Sentry (independent QA)
target: https://season1-commit--ekuzo.netlify.app (sk_test, Neon TEST DB ep-lively-boat-b4fak1h6, read-only)
code under test: 906a9ca (deploy confirmed; 7f789ef and c3e171d are docs only)
verdict: one must-not FAIL (family code reaches Google Ads), Meta Pixel rows BLOCKED by the Pixel's traffic permissions, everything else PASS
---

# Sentry phase 4: analytics build on the branch deploy

Test mode only. No live key, no vendor setting touched, nothing on `main` or `dev`. The database was read with SELECT inside a read-only transaction. Browser: Playwright Chromium (preinstalled), default headless settings. Every request URL per page was recorded, failed ones included. Raw, redacted logs: `sentry4/browser-runs.json`; scripts: `sentry4/scripts/`; screenshots: `sentry4/shots/`.

## Deploy check

- 15:46:09 UTC: `/season1/join` already had the QA gate and no hard-coded gtag. `googletagmanager.com` appears once, inside the gate script. But `/season1/join/signup` did not yet have `keepConfirmed`, so the deploy was still building 906a9ca.
- 15:47:20 UTC: sign-up has `keepConfirmed` twice (as in 906a9ca), and its `IN_PROGRESS_MSG` matches 906a9ca word for word. Every run below started at 15:51 or later.
- Note: Atlas's commit `64c6c20` (calm note, 3 s hold, age mask) appeared during my run in the shared working tree. It is local and not pushed. Nothing below tests it. I committed this evidence from a separate worktree on `origin/season1-commit`, so it was not pushed with this evidence.

## Vendor reachability from this container

| Vendor | Result |
|---|---|
| googletagmanager.com, google-analytics.com `/g/collect`, clarity.ms (tag, collect) | Load and send |
| connect.facebook.net | `fbevents.js` and `signals/config` load. **The Pixel then refuses to send**. The console says: `[Meta pixel] 1284038230557204 is unavailable on this website due to it's traffic permission settings`. Across every run there is **no `facebook.com/tr` request** and no `_fbp` cookie. This comes from the Pixel's traffic-permission allow list, so Jamie's browser would hit the same block on this host. |

Because of this block, Pixel behavior below is proven at the call level instead. A recorder wrapped `window.fbq` and only logged its arguments (Phase D). It did not change what fbq does.

## Ledger

| Req | Method | Observed | Result |
|---|---|---|---|
| Deploy | curl view-source, twice | Gate present, no hard-coded gtag, 906a9ca sign-up code live from 15:47:20 | PASS |
| R2/R16 no flag | Fresh contexts at 390 and 1440. Pages: join (with utms), sign-up, crew `/crew/44245013`, welcome (generic, and paid through the order cookie), thanks `?play=yes`, `/season1`, `/` (phases A and C) | **0 vendor requests** on every page, both widths | PASS |
| R2 with flag | `?s1qa=1` on join, then plain URLs | GA4, Pixel loader and Clarity load on join, sign-up, welcome and `/season1`. GA4 and Clarity load on thanks; crew loads GA4 only. `s1_qa=1` is a session cookie (Secure, no expiry) and persisted to sign-up, welcome, crew, thanks and landing without the param. `/` loads nothing even with the flag (layout is production-only) | PASS |
| R3 | GA4 hits in QA | Every `/g/collect` event carries `ep.debug_mode=true`, with `gcs=G10-` (ads consent denied) and `npa=1`. **No `_dbg=1` parameter** was seen. **Google Ads requests are present**: `pagead2.googlesyndication.com/ccm/collect?tid=AW-18509911105` mirrors every GA4 event on every tagged page, and `/measurement/conversion` fires on the purchase. No `doubleclick.net`. Recorded per C13/P4 | PASS with notes (DebugView: Jamie) |
| R4 | Join opened with `?s1qa=1&utm_source=meta&utm_campaign=t&fbclid=abc&kid=Sam&email=a@b.c` | Address bar became `?s1qa=1&utm_source=meta&utm_campaign=t&fbclid=abc`. GA4 `dl` = `/season1/join?utm_source=meta&utm_campaign=t&fbclid=abc`. Crew `dl` = `/crew/?utm_source=sms` | PASS |
| R5 network | `facebook.com/tr` | None sent (traffic permissions), so eid, `cd[buttonText]` and `ud[` cannot be inspected | BLOCKED |
| R5 calls | fbq recorder, Phase D (returning family, 390) | **Join:** `set autoConfig false` → `init` → `PageView` → `ViewContent` (once). **Sign-up:** set, init, PageView. At the pay tap: `trackCustom S1QA_InitiateCheckout` with eventID `248be11b…a18b3` = sha256(attemptId), verified. A retap on the same attempt after `price_changed` sent **no second IC**. **Welcome:** PageView, then `trackCustom S1QA_Purchase {value 80, USD, num_items 1}` with eventID `j86e3eb7cq` (order public id), once. **Reload:** set and init only, no PageView, no Purchase. **Crew and thanks:** no fbevents request at all | PASS (call level) |
| R7 | clarity.ms requests and DOM | Tag and collect load on join, sign-up, welcome, thanks and `/season1`; none on crew. **Masks in the DOM:** welcome h1, share button, link line, receipt wrapper, "Help us build" line; sign-up `#invTxt`, `#sum`, `#go`. **Decompressed Clarity payloads on welcome:** no kid name and no family code, while unmasked text ("Lock-in", "Paid today", "Text our founder") is present (positive control). The age `<select>` has **no** mask on 906a9ca; Atlas's unpushed 64c6c20 adds it. The order public id is unmasked in Clarity (informational) | PASS (dashboard and tags: post-release) |
| R8 | Cookie jar, Phase B | `ekuzo_lc` is HttpOnly, Secure, SameSite Lax, Path `/`, 30 days, with value `{"path":"/season1/join","ts":1793375523975,"utm_source":"meta","utm_campaign":"t","fbclid":"abc"}`. No kid or email. Later param-less pages left `ts` unchanged | PASS |
| R9 | `SELECT attribution FROM s1_orders` | **q2gyykcrem:** `{src:null, lc:{path, ts, utm_source:"meta", utm_campaign:"t", fbclid:"abc"}, first_touch:"paid_meta", fbp:null, fbc:"fb.1.1793375523975.abc"}`. **Returning family**, same family_id, 2 orders. Its second order **j86e3eb7cq** has its own `lc {klaviyo, email, t2, c2}` and `first_touch:"direct"`. `fbp` is null because the Pixel is blocked | PASS |
| R10 | `s1_outbox` | `meta_purchase` is `sent`, attempts 1, for all 6 paid orders. The stored payload is only order and PI ids (the CAPI body is built at send time), so fbp and fbc cannot be read from the outbox. The order carries the fbc that would be sent | PARTIAL (Test Events payload: Jamie / post-release) |
| R11 | Klaviyo, read-only | Two "Season 01 Committed" events on the test profile. **q2gyykcrem:** utm_source meta, utm_campaign t, utm_medium "", utm_content "", first_touch paid_meta. **j86e3eb7cq:** klaviyo, email, t2, c2, first_touch direct. Profile properties contain **no** utm_* or first_touch keys | PASS |
| R12 | GA4 `season1_tap_to_welcome` | Once per order: B 3506 ms, D 5722 ms (2.6 s injected delay plus a price retap), 3DS 7132 ms (includes the challenge). Not repeated on reload | PASS |
| R13 speed | Navigation timing, curl | **Welcome after the Stripe return:** responseEnd 1048 ms. **Paid welcome by curl:** TTFB 0.23 to 0.64 s (five runs). **Tap to welcome:** 3.5 s vs the 4.4 s baseline | PASS |
| R13 sends | Outbox `updated_at` vs `paid_at` | `klaviyo_committed` and `meta_purchase` were `sent` 0.4 to 0.6 s after `paid_at` on all 6 paid orders, each time **before** the welcome page loaded. So these were webhook drains. The `after()` fast path was never isolated: that needs the webhook delayed or disabled, which is a Stripe setting I may not change | PASS for sends; `after()` not proven |
| R13 drain route | curl | POST without secret: 503 `not_configured`. POST with a wrong secret: 503 (secret unset on the branch, as expected). GET: 405 | PASS (expected 503) |
| R14 F15, real browser | Phase E. Pay 4242; the welcome navigation is interrupted; Back; refill the card; retap | The retap commit got **409 `duplicate_kid`**, because the webhook had already marked the order paid about 10 s earlier. The client had the confirmed flag set, so 0.85 s later it showed "Your payment is already going through. Taking you to your confirmation to check on it." It replaced to welcome at 3.6 s, which shows "Great, Thessaly's in!". Stripe: **one** succeeded PI for that email | PASS (on 906a9ca the line is red `#formErr`; see defect 4) |
| R14 server path | API commit, Stripe test confirm, re-commit 0.3 s later (C2) | 409 `{"error":"in_progress"}` with a fresh `s1_order` cookie. Welcome with that cookie: PAID. One succeeded PI | PASS |
| R14 decline | Card 4000000000000002, 390 | Tap: "Your card has been declined.", busy released, no navigation. Retap (same secret, no new commit): "Your card was declined.", no navigation. `s1_confirmed_*` cleared. PI is `requires_payment_method` / `card_declined` | PASS |
| R15 | Commit delayed 2.6 s by route interception | 0.8 s: "Saving their spot...". 2.3 s: "Still saving. Please stay here.", with `aria-busy=true`, disabled, and the same text in `#liveErr`. The decline (busy about 1.85 s) never showed the line | PASS |
| R18 | Console and page errors, 390 and 1440, flag and no flag | **0 page errors anywhere.** Our-origin console errors are only the expected API answers the browser logs as 409 (`price_changed`, `duplicate_kid`). Third-party frame noise was excluded: Stripe 402 on the decline, hCaptcha CORS and the Stripe ACS CSP in the 3DS frame. `/` has legacy preload warnings | PASS |
| R18 shots | | `shots/signup-filled-{1440,390}`, `signup-busyline-390`, `signup-f15-inprogress-1440`, `signup-decline-390`, `welcome-paid-{1440,390}`, `welcome-f15-1440`, `welcome-3ds-1440`, `crew-qa-1440`, `crew-noflag-390` | done |
| C14 | 3DS card 4000002500003155, challenge completed | Welcome `document.referrer` = `https://season1-commit--ekuzo.netlify.app/` (origin only), and the address bar is clean. GA4 `dl` and `dr` on every hit hold no secret. A grep of all 269 vendor requests for `payment_intent_client_secret` and `_secret_`: none | PASS |
| Must-nots | Grep of every recorded vendor URL and body: kid names, parent name, test emails, `a@b.c`, the view token, the client secret, `pi_`, family codes | **FAIL: family code `44245013` sent to Google Ads.** `pagead2.googlesyndication.com/ccm/collect?tid=AW-18509911105&en=page_view&dl=…/crew/44245013` and `en=season1_invite_view&dl=…/crew/44245013`. Everything else clean | FAIL |
| R17 | `npm run test:s1` | Committed tree (clean worktree at 7f789ef): **334 / 334 pass**, 82 suites. With Atlas's local 64c6c20: 337 / 337 | PASS |

`npm run test:s1` tail (clean worktree at 7f789ef):

```
1..82
# tests 334
# suites 82
# pass 334
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 11025.015337
```

## Defects

1. **Major, Atlas (plus a Jamie decision).** The family code reaches Google Ads. The Google tag `G-8LM45PX53W` has a linked Google Ads destination, `AW-18509911105`. That destination sends its own `ccm/collect` hits with `dl` taken from the real URL, not from the GA4 `page_location` override. On crew it carries `/crew/<code>`. This breaks the must-not "no family code in any URL sent to GA4, Meta or Clarity" (Google). The live crew page runs the same GA4 tag, so production would do the same, with ads consent granted. Fix options:
   - `gtag('set', {page_location: …})` before `config`, so it applies to every destination; or
   - drop the code from the address bar before the tags load; or
   - Jamie unlinks the Ads destination from the Google tag.

   Also, Google Ads receives the `purchase` as a conversion (`/measurement/conversion`, with transaction_id and value). That is in QA here with consent denied; in live it is a real conversion feed. That conflicts with the D7 / P4 reading unless intended.
2. **Major, blocked, Jamie.** The Meta Pixel's traffic permissions block every non-allowed host. The R5 network rows, R6 dedupe, the R10 Test Events payload and any `_fbp` capture cannot be proven before release. Jamie can temporarily allow `season1-commit--ekuzo.netlify.app` on the Pixel, which is a vendor setting I did not touch. Otherwise these rows are proven after release on ekuzo.gg. In live there is no S1QA rename, so a QA order there counts as a real Purchase.
3. **Minor, Atlas.** In run D, the welcome paid state left `s1_confirmed_<attempt>` in sessionStorage although `s1_attempt` and `s1_ic_*` were cleared. The code walks `sessionStorage.key(i)` backwards while removing, and Chromium's key order can shift after `removeItem`. Collect the keys first, then remove. It is harmless today because the attempt id is gone, but the flag goes stale.
4. **Minor, Atlas, re-check needed.** On the deployed 906a9ca the in-progress line is red in `#formErr` (Parent and Steward finding 1, screenshot `signup-f15-inprogress-1440.png`), and the age `<select>` has no Clarity mask. Atlas's 64c6c20 is not pushed. Once it deploys, R14 copy and style and the R7 age mask need a re-run.
5. **Info, Atlas.** InitiateCheckout keeps the first tap's value ($100) when `price_changed` moves the total to $80. It fires once per attempt by design.
6. **Info, Relay (pre-existing).** `originClassifier` has no email bucket: `utm_source=klaviyo&utm_medium=email` gives `first_touch: "direct"`. Email-led first touches will read as direct.
7. **Info.** GA4 hits carry `ep.debug_mode=true` but no `_dbg=1`. Whether they appear in DebugView is Jamie's check.

## Rows that need Jamie's browser or the post-release check

- **R3:** GA4 DebugView shows the QA events (`ep.debug_mode`).
- **R5 network and R6:** `facebook.com/tr` with eid, no `cd[buttonText]` and no `ud[`, dedupe with CAPI. These need the Pixel allow list (defect 2) or the post-release check on ekuzo.gg.
- **R7:** Clarity dashboard tags and a recording (post-release).
- **R10:** Meta Test Events payload carries fbp and fbc.
- **R13:** `after()` fast path in isolation. Also the schedule after release: function log `s1-drain: status 200` once `S1_DRAIN_SECRET` is set; the drain route with the secret.
- **R14 copy and R7 age mask:** re-run after 64c6c20 deploys.
- **R19:** Jamie's phone.

## Test data left in place (test mode)

Paid orders:

| Order | Email | Run |
|---|---|---|
| q2gyykcrem ($100) and j86e3eb7cq ($80, sibling rate) | `team+s1test-sentry4-b-a306b9@ekuzo.gg` | B and D, same family |
| p8nd37r645 | `team+s1test-sentry4-f15-959c10@ekuzo.gg` | first F15 attempt, aborted by the script |
| x4avge5c33 | `team+s1test-sentry4-f15-ae9766@ekuzo.gg` | E |
| 8ayj9sfz8a | `team+s1test-sentry4-3ds-68bd4a@ekuzo.gg` | 3DS |
| 9rs89gewve | `team+s1test-sentry4-inprog-d79d92@ekuzo.gg` | server path |

Other:
- One pending declined order: ba2d8kvjey, `team+s1test-sentry4-dec-1a53c4@ekuzo.gg`.
- Stripe: one succeeded PI per paid order, and none extra (`sentry4/stripe-reads.log`).
- Klaviyo: Committed test events on the `team+s1test` profiles.
- Commit calls: 11 over three rate windows (4, 5, 2), no 429.

## Re-run at 76bf25e

Targeted re-run for the lead, under the same rules: test mode, read-only DB, evidence only. Code under test is 76bf25e. The branch head is 0b59110, which differs from 76bf25e only in `05-handoff.md`.

**Deploy check:** the crew route HTML had no `googletagmanager` and no QA gate from 16:26:30 UTC; all runs started after that. Sign-up serves `CHECKING_MSG` and `WELCOME_HOLD_MS=3000`, and join queues `gtag('set', …)` before `config`.

**Files:** logs in `sentry4/rerun-76bf25e/rerun-76bf25e.json` (redacted), Stripe reads in `sentry4/rerun-76bf25e/stripe-reads.log`, screenshots in `sentry4/rerun-76bf25e/shots/`, scripts in `sentry4/scripts/r2-*`.

| # | Check | Observed | Result |
|---|---|---|---|
| 1 | Crew `/crew/44245013?utm_source=sms`, with and without the flag, at 390 and 1440 | 0 vendor requests in all 4 runs. `typeof gtag`, `fbq` and `clarity` are all `undefined`. 0 page errors, 0 console errors. The join tap (`a.join`) lands on `/season1/join/signup`. With the flag, sign-up still loads its tags (12 vendor requests) | PASS |
| 2 | Google Ads hits on join, sign-up and welcome, plus a grep of every vendor request | There were 51 Ads hits (`ccm/collect` and `/measurement/conversion`). Their `dl`/`url` values are only the bare paths `/season1/join`, `/season1/join/signup` and `/season1/join/welcome`, and `dr` is the origin. The join used for this test was opened with `kid=Calvorne&email=a@b.c&fbclid=abc`. **Must-not grep over 224 vendor requests:** kid names, parent name, test emails, `a@b.c`, `kid=`, `email=`, `payment_intent`, `_secret_`, `pi_3`, `/crew/<code>`, family codes, `s1_order`, `s1_ref`. **0 hits** | PASS |
| 3a | R14, real 409 `in_progress` in the browser (390) | **Setup:** tap 1 commits; Stripe.js confirm is blocked on the client; the page reloads (same `s1_attempt`); the PI is confirmed through the Stripe test API, standing in for another tab; then the parent taps. **Server:** 409 `{"error":"in_progress"}` with an `s1_order` cookie. **Note:** after 0.7 s, "Your payment is on its way. Taking you to your confirmation." shows in `#payNote` (`rgb(51,51,51)` on `rgb(239,238,237)`). `#formErr` is empty, and `#liveErr` (`role=status`, `aria-live=polite`) holds the same text. The button stays `disabled`, `aria-busy=true`, "Saving their spot...". **Then:** 4.0 s from note to the welcome load event (3 s hold plus page load), "Great, Fennimore's in!". **Stripe:** 1 PI, succeeded | PASS |
| 3b | R14, back and retap in the browser (1440) | **Flow:** pay; the welcome navigation is interrupted; Back (`back_forward`); Stripe re-mounts the card, so it is refilled and terms re-ticked; retap 4.6 s after the confirm. **Server:** by then the webhook had marked the order paid, so it answered 409 `duplicate_kid`. **Client:** the confirmed flag was set, so it showed "Checking on your payment. Taking you to your confirmation." in the grey note box (polite, button busy), then the paid welcome, "Great, Calvorne's in!". **Stripe:** 1 PI, succeeded | PASS (see note A) |
| 3c | R14, forced ambiguous case | **Flow:** pay; the welcome navigation is interrupted; Back; the retap's commit fetch is aborted by route interception. **Note:** after 0.23 s, "Checking on your payment. Taking you to your confirmation." in the grey note box, polite region, button busy. **Then:** 4.0 s to the paid welcome, "Great, Dremmick's in!". **Stripe:** 1 PI, succeeded | PASS |
| 3d | Decline 4000000000000002, then retap | **Tap 1:** "Your card has been declined." **Retap:** "Your card was declined." Both times the note is hidden, the button is released and the page stays on sign-up. **Stripe:** `requires_payment_method` | PASS |
| 4 | Age select mask | `select.ag` has `data-clarity-mask="true"` in all 4 sign-up loads | PASS |
| 5 | sessionStorage after a paid welcome | 3a, 3b and 3c each leave only `_cltk`, `s1_warm_at` and `s1_card_open`. There is no `s1_attempt`, `s1_confirmed_*` or `s1_ic_*` | PASS |
| 6 | R2 regression with no flag, at 390 and 1440 | Join (with utms), sign-up, welcome (paid, through the order cookie), thanks and `/season1` each made 0 vendor requests, with 0 page errors | PASS |
| 7 | `npm run test:s1` at 0b59110 (= 76bf25e code) | `1..83`, tests 342, pass 342, fail 0 | PASS |

On sign-up, the only console errors are the browser's own resource lines for the expected answers. 3a and 3b log a 409, and 3c logs `ERR_FAILED` from the aborted fetch. There are no page errors.

**Note A, informational, no defect.** In a real browser, Back and retap takes about 4 to 5 s, because Stripe re-mounts the card and the terms box is not restored. The webhook marks the order paid within about 0.5 to 2 s. So a parent who goes back and retaps will usually see "Checking on your payment" (server `duplicate_kid`) rather than "on its way" (server `in_progress`). Both land on the paid welcome, and both strings are honest for the answer the server gave.

**Defects:** none at 76bf25e.

**Still open:**
- The Pixel network rows remain blocked by the Pixel's traffic permissions.
- Crew has no GA4 while `CREW_GA4=false`. Turning it back on needs the Ads destination unlinked first.

**Test data:** paid orders and the declined order, each with exactly one PI as listed in `rerun-76bf25e/stripe-reads.log`:

| Order | Email | Status |
|---|---|---|
| auazvq9qxz | `-inprog-4bddae` | paid |
| mgqsxndabs | `-inprog-415a80` | paid; that run stopped because terms were not re-ticked |
| 5yghccvfyy | `-inprog-87217d` | paid |
| g6y3k49pc5 | `-ambig-fdc423` | paid |
| zmvxwsef82 | `-inprog409-eca35c` | paid |
| pynpyyyc5c | `-decline-b6a42f` | declined, pending |

The emails are `team+s1test-sentry4r2-…@ekuzo.gg`. There were 7 commit calls and no 429.
