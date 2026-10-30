---
title: "Season 01 analytics build, front end (Atlas)"
created: 2026-10-30
author: Atlas (front end), Jamie's Claude
spec: 01-requirements.md as amended by 02-resolution.md (S1 to S4, S8, S11, S12; C2 client part, C5, C6, C8 to C14, C14b, C16); copy 03-copy-deck.md
branch: season1-commit (on 66e310d, the server half by Relay)
---

# Atlas: front end of the analytics build

The server half (Relay: middleware `ekuzo_lc`, order attribution, drain, the F15 response codes) was already on the branch. This round covers the tags, templates, the sign-up client and the layout gate.

## Defaults used for points still open with Jamie

Each one can be flipped in one place.

| Point | Default built | Where to flip |
|---|---|---|
| P1 Clarity and kid names | Clarity runs on join, sign-up, welcome, thanks and the landing. It does not run on crew or on the redirect and early-access pages. Every element that prints a kid's name has `data-clarity-mask="true"` (list below). | `CLARITY_PAGES` in `lib/season1/tags.ts`. Masks are one attribute each. |
| P4 QA purchases | On non-live hosts in QA mode, Purchase and InitiateCheckout go out as `trackCustom('S1QA_Purchase' / 'S1QA_InitiateCheckout')`. PageView and ViewContent fire normally. | `QA_RENAME_CONVERSIONS` in `tags.ts` |
| D5 copy | The deck's recommended strings, word for word (below) | `signup.html`: `BUSY_LINE`, `IN_PROGRESS_MSG`, the `in_progress_other` branch of `serverErr` |

## What was built

### 1. `lib/season1/tags.ts` (S1, C12, C13, C11, S2, S3, S4, C9)

`renderTags({host, mode, page, orderRef, cookie})` renders the tags for join, sign-up, welcome and crew. Live tags need both of these:
- the raw Host is `ekuzo.gg` or `www.ekuzo.gg` (port ignored, through `isLiveHost` added to `mode.ts`);
- the mode is not `test`. Mode `off` still measures.

A missing host is non-live. A non-live render is a single script, the QA gate:
- **Turning QA on and off:** `?s1qa=1` sets the session cookie `s1_qa=1` (Path `/`, Secure on https). Until that cookie exists, nothing loads. `?s1qa=0` clears it.
- **GA4 in QA mode:** every event carries `debug_mode` (a gtag wrapper adds it). Consent defaults to denied for `ad_storage`, `ad_user_data` and `ad_personalization`, set before `config`. Config has `allow_google_signals:false` and `allow_ad_personalization_signals:false`.
- A live render never contains `debug_mode`, `consent`, `s1_qa`, `S1QA_` or the gate. A unit test checks this on all four pages.

Per page:

| Page | GA4 | Pixel `1284038230557204` | Clarity `wml8wll5ua` |
|---|---|---|---|
| Join | `page_location` = path plus the kept params only (utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, gclid, fbclid) | `set autoConfig false` before `init`, then PageView and ViewContent | Custom tags: `page`, `src`, `utm_campaign`, `utm_content` |
| Sign-up | Same as join | PageView. InitiateCheckout fires at the pay tap (item 6). | Same tags. The utm tags fall back to the `ekuzo_lc` cookie, read on the server. |
| Welcome | Same, plus `page_referrer` = origin (C14) | PageView once per order (`s1_pxpv_<ref>` guard). Purchase on the paid state (item 2). | Same tags |
| Crew | `/crew/` plus kept params. Signals and ad personalization off (C9). | none | none |
| Thanks (static) | Kept params only. `play` stays in the event param, not in `page_location`. | none | `page` tag |
| Landing (static) | Plain config, as before | `autoConfig` false before `init`, then PageView | Loader only; the landing sets its own tags |

- **Clarity tag values:** they must be printable ASCII, at most 100 characters, with no `@` and no run of 6 or more digits. So no emails or codes, and there is no `clarity('identify')`.
- **Helpers for the pages:**
  - `window.s1px(event, params, eventID)` is the Pixel conversion helper. It maps to S1QA_ in QA mode.
  - `window.s1once(key)` is a once-guard. It writes both localStorage and a cookie with Path `/season1` and a 1-year lifetime.
- **Static pages:** `renderStaticTags('thanks' | 'landing')` applies the same rule in the browser. It checks `location.hostname` against `^(www\.)?ekuzo\.gg$`, and everything else goes through the QA gate.
- **Address-bar allow list (C10):** `renderUrlAllow(extraKeys)` keeps the eight kept params plus `src` and `s1qa`, and drops everything else with `replaceState`. It also drops a hash that is not plain `[A-Za-z0-9_-]`. Thanks additionally keeps `play`, because its own script reads it.

### 2. Templates and routes (R1, C10, C16, ops 4)

- **Join, sign-up, crew, welcome, thanks:** the hard-coded gtag block is gone. Each head now has `{{URL_ALLOW}}` and then `{{TAGS}}`.
  - The allow list replaces the old kid/from strip on join and sign-up, and the full-query strip on crew.
  - Welcome's Stripe-return `replaceState` is still injected first, right after `<head>`.
- **How each route fills the placeholders** (all from the raw `host` header, the same way `currentMode` reads it):

| Route | How |
|---|---|
| Join | Fills both inside `renderJoin` (new `tags` option), so `joinPage.test`'s "no `{{` left" still holds |
| Sign-up, crew | `fillTags` (split/join, no `$` patterns) |
| Welcome | `TAGS` and `URL_ALLOW` are entries in its `vars`, so its placeholder pass fills them and can never erase them. The tags carry the order public id for the PageView guard. |

- **Welcome paid script:**
  - The GA4 `purchase` is unchanged.
  - It adds the Pixel `Purchase` through `s1px`: `eventID` = order public id, value from the server's `data-value`, currency USD, `content_name` "Season 01", `num_items`. It is guarded by `s1once('s1_px_<ref>')`, so it fires at most once per order.
  - It sends `season1_tap_to_welcome {ms}` from `s1_tap`. The key is removed on first read.
  - It clears `s1_attempt`, `s1_confirmed_*` and `s1_ic_*`.
- **Redirect pages** (`redirectToBare`, which includes early-access) stay tag-free. A unit test asserts there is no googletagmanager, facebook, fbevents, clarity.ms or gtag in their output.

### 3. Force-static pages (C12)

- **Landing:** `landing.html` drops its Pixel, Clarity and GA4 blocks and the `<noscript>` Pixel image (the image cannot be host-gated). It gets `{{TAGS}}`, which `app/season1/route.ts` fills at build.
- **Landing `LIVE` regex** is now `/(^|\.)ekuzo\.gg$|^localhost$/`, so `netlify.app` is gone. A branch deploy no longer posts to `/api/season-one` or fires Lead.
- **Thanks:** GA4 and Clarity, no Pixel.

### 4. `app/layout.tsx` (S12)

`const ANALYTICS_ON = process.env.S1_DEPLOY_CONTEXT === "production"` wraps the GA4, Pixel (including the noscript image) and Clarity blocks. The diff is 8 added lines, with the inner indentation left as it was.

On a local build (context empty), `/` and `/parents` serve no vendor tag. `/season1/join` on host ekuzo.gg still serves its own tags.

### 5. Timing (S8)

- **Sign-up:** stores `s1_tap` (`performance.timeOrigin + performance.now()`, falling back to `Date.now()`) at the pay tap.
- **Welcome:** on the paid state, sends `season1_tap_to_welcome {ms}` when 0 < ms < 1 h, then removes the key.

### 6. Sign-up client (C2, S11, money 14, S3/C6)

- **One attempt per tab.** The attempt is reused from `sessionStorage.s1_attempt` (same `[A-Za-z0-9-]{8,64}` rule as the server), so a reload or an in-app-browser back lands on the same attempt. The welcome paid state clears it.
- **`s1_confirmed_<attemptId>`** is set just before `confirmPayment`, with nothing awaited in between.
  - **Lead fix, 10-30 (was open item 3).** When `confirmPayment` (card or wallet, same code path) resolves with `r.error`, Stripe answered and nothing was charged, so the flag is cleared (`keepConfirmed(r)`, pure and unit tested). A later 429, `price_changed` or network error on that attempt then shows its normal message.
  - The flag stays when confirm throws, never resolves or redirects. It also stays on `payment_intent_unexpected_state`, because the PaymentIntent may already have succeeded (for example in another tab), so "not charged" would not be safe there.
- **Commit answers:** a pure function `commitNext(status, error, confirmed, retried)` is unit tested:

| Answer | Result |
|---|---|
| `in_progress` | Go to the confirmation |
| `in_progress_other` | The `serverErr` branch with D5 string 3. This is checked before the generic 409. |
| Confirmed flag set, then any non-OK answer | Go to the confirmation. A network error in the catch also goes there. |
| `attempt_busy`, first time | Retry once after 1.5 s with the same body and attempt |
| anything else | `serverErr`, unchanged. "Not charged" is shown only when the flag is absent. |

- **Going to the confirmation:**
  - It calls the wallet's `paymentFailed` first.
  - It shows D5 string 2 in the alert region (and in the wallet error line on the wallet path), keeps the button busy, and runs `location.replace('/season1/join/welcome')` after 1500 ms.
  - On the wallet path, `paymentFailed` now runs once before every message, through `pf()`.
  - The wallet error line now copies `formErr`'s HTML, so the masked kid-name span and the link carry over.
- **Busy line:** 2 s after busy starts, the label becomes "Still saving. Please stay here." and the same text goes once to the `role=status` region (`#liveErr`). The timer is cleared in `setBusy` (both ways), and so in `fail()`, and in the pageshow handler.
- **InitiateCheckout:**
  - It fires right after `season1_pay_submit`, once per attempt (`s1_ic_<attemptId>`).
  - Params: value, currency, content_name, num_items.
  - `eventID` = SHA-256 hex of the attempt id (SubtleCrypto). Without SubtleCrypto (an http page that is not localhost) it is sent without an eventID. It never carries the raw attempt id.

### Kid-name masks (P1)

- **Welcome:**
  - hero `h1`;
  - the share button (which also masks its `data-kid` and `data-link` attributes: Clarity 0.8.73 masks `data-` attributes and `href` inside masked elements, checked in its source);
  - a wrapper around `{{RECEIPT_LINES}}`;
  - the hidden "Help us build {{KID1}}'s team" line;
  - the `{{LINK_SHORT}}` line. This one holds the family code, not a name; I masked it too because crew is kept off Clarity for the same code.
- **Sign-up:**
  - `#invTxt` (the inviter's kid);
  - `#sum` (kid names and the invite name);
  - `#go` (the label reads "Save Maya's spot", so the busy label is masked in recordings too);
  - a span around the kid name in the `duplicate_kid` message.
- Typed inputs are masked by Clarity already.

## Round 2: Parent and Steward review (04-parent-steward.md findings 1, 2, 4, 5; lead 10-30)

- **Finding 1, calm status instead of an error.** The in-progress lines are no longer in the red `#formErr` alert.
  - They render in a new `<p id="payNote" class="note" hidden>`: the page's existing stone note box, ink text `rgb(51,51,51)` on `rgb(239,238,237)`.
  - The box sits outside the card section, so it shows on the wallet path too.
  - They are announced once through the polite `#liveErr` status region, via `showNote(msg, link)`.
  - The busy line's timer is stopped first, so the two never fight.
  - On a redirect the button stays busy and disabled (checked in the browser: `disabled`, `aria-busy=true`).
  - `in_progress_other` uses the same box with its text link, and the button is released there as before.
  - `clearErrs()` hides the box on the next tap.
- **Finding 2, copy.** One constant each:
  - `IN_PROGRESS_MSG` "Your payment is on its way. Taking you to your confirmation." This is shown only on a real 409 `in_progress`.
  - `CHECKING_MSG` "Checking on your payment. Taking you to your confirmation." This is the ambiguous case: the confirmed flag is set, then a non-409 failure or a network error. `commitNext` now returns `check` for it.
  - `IN_PROGRESS_OTHER_MSG` is unchanged.
- **Finding 5, hold.** `WELCOME_HOLD_MS=3000` before `location.replace`. The browser measured about 3.0 s from note to navigation.
- **Finding 4, age mask.** The kid age `<select class="f ag">` carries `data-clarity-mask="true"`.
  - No other sign-up element echoes a kid's age; the summary and the button show names only.
  - Welcome prints no age.
- **Screenshots recaptured** with real Stripe.js (test key, through the agent proxy), so the payment area is in frame: the Link row, "Or pay with card", and the filled card field.
  - The commit was mocked: 409 `in_progress` after 3.5 s.
  - While busy, the card field still looks editable (Stripe draws it in its own frame) and the Link button stays visible and tappable-looking. The page ignores a wallet tap while busy (`xp.on('click')` returns), so a second payment cannot start from it, but the area does not look frozen. Whether to dim it is a design call for Aaron.
  - Console: only the mocked 409.

## Copy (round 1; strings 2 and 3 superseded in round 2 above, string 1 unchanged)

1. Busy label after 2 s: `Still saving. Please stay here.`
2. `in_progress`: `Your payment is already going through. Taking you to your confirmation to check on it.` Then about 1.5 s, then the welcome page.
3. `in_progress_other`: `A payment for this email is already going through. Your receipt will arrive in your inbox when it's done. Questions? Text our founder.` "Text our founder" is an sms link built like the `duplicate_kid` line.

## Tests

| Run | Result |
|---|---|
| `npm run test:s1` | **337 / 337 pass** (was 274). New: `tags.test.ts` 40, `signupCommit.test.ts` 20, `welcomeStates.test.ts` +3 |
| `S1_DB_TESTS=1 node --env-file=.env.test.local scripts/run-tests.mjs lib/season1/__tests__` (J10) | **373 / 373 pass**, 81 suites, 0 fail, 0 skipped, 91 s (was 317). This run predates the lead fix; the fix adds 4 pure client tests and touches no server code. |
| `npm test` (all lib) | 431 pass, 1 skipped (pre-existing), 0 fail |
| `npx tsc --noEmit` | exit 0 |
| `npx eslint` on changed files | 0 errors (1 pre-existing `<img>` warning in layout) |
| `next build` with the test env | exit 0 |

**The tests bite:**
- With the new test files and the old code (stash), two suites fail.
- With the lead fix's clearing line removed, "decline then 429" and "decline then network error" both fail.

**What the new tests cover:**
- **Renderer and route output per host:**
  - On ekuzo.gg, all four route pages contain `G-8LM45PX53W`. Join, sign-up and welcome contain the Pixel init; crew does not.
  - On `season1-commit--ekuzo.netlify.app`, `ekuzo.netlify.app`, localhost, an empty host, a missing host and `ekuzo.gg.evil.example`, no vendor URL appears outside the QA gate, and the gate precedes every vendor URL.
  - The welcome paid state is checked through `welcomeStates`.
- **Order and history rules:** `autoConfig` comes before `init` in every Pixel rendering, including both landing branches. No `history.` call appears after `{{TAGS}}` in the templates, or after the first tag script in the rendered output. The allow list's behavior is tested in a vm.
- **Masks:** present on every element listed above.
- **Redirect pages:** tag-free.
- **Behavior runs in a vm** (rendered scripts executed against stub DOMs):
  - the QA gate with and without the flag;
  - `debug_mode` added to events;
  - S1QA_ mapping in QA;
  - PageView once per order on welcome;
  - the welcome paid script: one Purchase with the order id and the server's value, one tap timing, the attempt keys cleared, and nothing on reload;
  - the layout gate source;
  - the real `pay()` from the template, run against stub DOM, Stripe, fetch, sessionStorage and location. Four cases are covered:

    | Case | Result |
    |---|---|
    | Decline, then 429 on the same attempt | The normal 429 message, no navigation |
    | Decline, then a network error | "Not charged", no navigation |
    | Confirm throws | The flag stays and the parent goes to welcome |
    | A later 429 after that | Also goes to welcome |

## Browser run (Playwright chromium, built app, 390 and 1440)

**Setup:**
- Two `next start` servers on the test env:
  - `ekuzo.gg:3108` with `S1_COMMIT_MODE=off`: the live host, so live tags;
  - `season1-commit.ekuzo-branch.test:3107` and `localhost:3107`: test mode.
- Hosts were mapped with `--host-resolver-rules`. The real `season1-commit--ekuzo.netlify.app` cannot be mapped locally: `netlify.app` is HSTS-preloaded, so Chromium forces https. That exact host is covered by the unit tests.
- Vendor scripts were intercepted and fulfilled empty, so every URL in the log was requested by the page. Queues were read from `dataLayer`, `fbq.queue` and `clarity.q`.
- Full log: `evidence/atlas/browser-run.json`.

| Host | join | sign-up | welcome | crew | thanks | landing |
|---|---|---|---|---|---|---|
| ekuzo.gg (live) | gtag, fbevents, clarity | gtag, fbevents, clarity | gtag, fbevents, clarity | gtag only | gtag, clarity | gtag, fbevents, clarity |
| branch host, no flag | none | none | none | none | none | none |
| localhost, no flag | none | none | none | none | none | none |
| branch host `?s1qa=1` | gtag, fbevents, clarity | (pay flow) gtag, fbevents, clarity | | gtag only | gtag, clarity | |

**What the queues showed:**
- **Live join:** the address bar went from `?utm_source=meta&utm_campaign=s1&fbclid=AbC1&kid=Maya&_kx=zz` to `?utm_source=meta&utm_campaign=s1&fbclid=AbC1`. GA4 `page_location` carried the kept params only. The fbq queue was `set autoConfig, init, PageView, ViewContent`. Clarity got `page=join, utm_campaign=s1`.
- **Live crew:** `page_location` `/crew/?utm_source=sms` with signals off, and no fbq or clarity.
- **Live welcome:** `page_referrer` = origin.
- **QA mode:**
  - consent default denied;
  - config with `debug_mode`, signals off;
  - events `season1_signup_view` and `season1_pay_submit` carried `debug_mode`;
  - the pay tap queued `trackCustom S1QA_InitiateCheckout`.
- **InitiateCheckout on localhost (a secure context):**
  - `eventID` equals sha256(attemptId), checked in the page;
  - a second tap on the same attempt adds no second InitiateCheckout.
- **F15 flows (Stripe stubbed, commit mocked):**
  - **Busy line:** the label is "Saving their spot..." at 0.6 s and "Still saving. Please stay here." at 2.5 s, with `aria-busy=true`, disabled, and the status region set.
  - **409 `in_progress` at 3.2 s:** shows string 2, then `location.replace` to `/season1/join/welcome` 1.5 s later.
  - **503 `attempt_busy`:** exactly one retry, 1512 ms later, with the same attempt id. A 500 after that, with no confirmed flag, keeps the existing "not charged" line.
  - **Reload:** the reload reused `s1_attempt`.
  - **409 `in_progress_other`:** string 3 with the sms link, and the button released.
  - **A decline at 1.7 s:** never showed the busy line; the label was restored and the status region left empty.
- **Console:** no page errors anywhere. The only console errors are:
  - the 409 from the mocked commit;
  - 404s for the torn-paper images (`public/images/new torn paper/*@2x.png`) on join and crew. Local `next start` does not serve those paths. ekuzo.gg and the branch deploy both answer 200 for them, and the problem is unchanged by this build.

**Screenshots** (recaptured in round 2, with the payment area in frame):
- `evidence/atlas/signup-busy-390.png`, `signup-busy-1440.png`: the busy line above the filled card field and Link row;
- `evidence/atlas/signup-in-progress-390.png`, `signup-in-progress-1440.png`: the "on its way" note in the stone box under the busy button.

## Not proven here, and open

1. **Branch-deploy network proof is Sentry's** (C18: R2 to R5, R7, R12, R18). That means real `/g/collect` (`_dbg=1`), `facebook.com/tr` (`ev=Purchase&eid=<order>`, `S1QA_*`, and no `SubscribedButtonClick` / `cd[buttonText]` / `ud[`), and `clarity.ms/collect` on `season1-commit--ekuzo.netlify.app` with and without `?s1qa=1`. It also includes the 3DS referrer check and a paid welcome in a real browser. Here the vendor scripts were intercepted and the paid-state Purchase was proven in a vm.
2. **Resolved in round 2: styling of the in-progress line.** It is now the stone note box. Previous text: It renders in `#formErr`, which is red error text with `role=alert`. A neutral style may read better for "your payment is going through". This is a design call.
3. **Resolved (lead 10-30).** The confirmed flag is now cleared when Stripe answers a confirm with an error (see section 6).
   - The welcome failed state's "Try again" still keeps the same attempt, because only the paid state clears it. The lead accepted this.
4. **Thanks GA4 `page_location`** now follows S2, so it drops `play`. The `season1_play_answer` event still carries `play`. Before, GA saw the full URL.
5. **Landing:** the `<noscript>` Pixel image is gone, and the landing has no address-bar allow list, because its own script reads `ad=` and `site=`.
6. **Crew's address bar** now keeps the kept params; before, the whole query was stripped. GA4 needs them for `page_location`. There is no Pixel or Clarity on crew.
7. **Welcome without an order** (generic, or the pending state after a DB error) fires its Pixel PageView on every load, because there is no ref to guard on.
8. **P2** (privacy-policy lines) and the release checks (GA4 filter, Clarity masking mode, Meta AAM off, Google tag user-provided data off) are Jamie's and were not touched.
9. **Server and client should release together.** Relay's note 8 still applies until this commit is on the branch deploy.
