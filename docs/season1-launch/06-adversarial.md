# 06 Adversarial pass (Phase 6)

Sentry, 2026-10-10. Target: `release/season1` HEAD ca6e745, built from `git archive` in an isolated copy (`/home/claude/s1-adv`, real `next start`, dummy Stripe env). Klaviyo and Meta calls were replaced by a logging fetch mock preloaded with `NODE_OPTIONS=--require` (`/home/claude/s1-tests/fetch-mock.cjs`); nothing left the sandbox. Harness code: `/home/claude/s1-tests/adv-http.mjs`, `adv-browser.mjs` (outside the repo).

Scope rule: decisions 1 (abuse accepted: no rate limit, unauthenticated games/age steps, anyone can subscribe any address), 2 (subscribe failure still 200 plus Lead) and 8 (accepted minors: re-sign-up fires a new Lead, keyboard resubmit reuses the event_id, etc.) are not re-reported as findings. They appear below only where the observed behavior is worse than the decision text describes, or as a one-line confirmation that behavior matches.

Severity values: CRITICAL, MAJOR, MINOR. Type: code-bug, infra-gap, accepted-risk. Result: no CRITICAL, 2 MAJOR, 5 MINOR.

Evidence files (all under `evidence/`): `adv-route-http.txt` (route, A1 to A13), `adv-middleware.txt` (middleware), `adv-browser.txt` (landing and popup, BA1 to BA9). SC-1 verification evidence is in `sc1-*` (see `04-evidence-ledger.md` T10, T11).

## A. Automatable now (done, results below)

### MAJOR

**ADV-1 | MAJOR | code-bug | Owner: Relay | Evidence: `adv-route-http.txt` A13**
No outbound fetch in `app/api/season-one/route.ts` has a timeout or `AbortSignal`. Measured with the upstream mock:
- Klaviyo event never answers: the route never answers (client gave up at 14 s, 0 bytes). Nothing else is attempted.
- Klaviyo subscribe never answers after the event was accepted: same hang. The event is recorded, the list subscribe may or may not be, the parent gets no response, and because the browser Lead fires only on an ok response there is no Lead at all for a sign-up that did land in Klaviyo.
- Meta never answers after Klaviyo succeeded: hang again. Both Klaviyo writes are done; the parent sees nothing and the function is held open.
- Slow but finite (8 s on Klaviyo or on Meta): the parent waits 8 s on a disabled button, then gets 200. Fine on its own, but it is the same path as the hang.

Why this is worse than decisions 2 and 8 describe: decision 2 covers an upstream that returns an error or throws. A stalled upstream (a Klaviyo or Graph API brownout, which is exactly when you do not want the sign-up path to depend on them) never reaches those branches. Under Netlify's synchronous function limit (10 s default, 26 s max) the parent sees the platform's 502/504 page instead of the route's JSON; the landing handles a non-ok response (shows the retry message, B03b/B12), but the retry re-sends the Klaviyo event (unique_id contains `Date.now()`), so every stalled attempt can double-count the sign-up in Klaviyo, and a stalled Meta call also delays and then loses the parent's confirmation although they are already on the list. During a paid push, a long brownout also fills function concurrency with hanging invocations.

Suggested fix: `AbortSignal.timeout(~4000)` on the Klaviyo event (failure maps to the existing 502), on the subscribe (treat like the HTTP-error path, decision 2) and on the CAPI call (log and continue, return 200; CAPI is best effort and the browser Lead is independent). The route harness has no timer case today; Sentry will add C32 (hung upstream resolves within the timeout, status per branch) on the retest.

**ADV-2 | MAJOR | code-bug | Owner: Atlas | Evidence: `adv-browser.txt` BA6, BA7**
The landing forms have no `method`, no `action`, and no inline `onsubmit`. They depend entirely on the inline script calling `preventDefault`. Whenever that script is not running, a submit is a native GET to `/season1?email=<address>&ekz_hp=`. Two reproducible ways:
- JavaScript disabled (BA7): the hero is empty, the form is visible and a submit lands on `/season1?email=nojs%40example.com&ekz_hp=`. Nothing is saved and nothing tells the parent so.
- The script crashed (BA6, reproduced with `?ad=__proto__`, see ADV-3; in the wild also an old in-app webview that throws on newer syntax): the static form HTML is still there and the same GET happens.

In the crashed-script case the head Pixel snippet still runs on the new document, and the standard Meta PageView sends the full page URL, now containing the parent's email in clear text, to Meta (Clarity likewise records the URL). In the no-JS case the `<noscript>` pixel image sends only the referrer origin under the default policy, so the email stays in browser history, server and CDN access logs and any analytics that read the URL, but is not sent to Meta by the tag. That breaks Meta's rule against PII in URLs, bypasses the hashing in the CAPI path, and the page the parent lands on is the hero again, not a confirmation, so they also believe it failed. Traffic is mostly Facebook and Instagram in-app browsers, which is where script breakage is likeliest.

Probability is low (needs a script failure), the fix is small, and the harm is a policy and privacy one involving a parent's email in a child-audience funnel, hence MAJOR (borderline; Fable may downgrade after B-6 and B-7). Suggested fix: `onsubmit="return false"` on both forms (works if the main script later crashes), `method="post"` as a belt so any native submit keeps the email out of the URL, and a `<noscript>` line telling the parent to enable JavaScript. Sentry's BA6/BA7 are the retest cases.

### MINOR

**ADV-3 | MINOR | code-bug | Owner: Atlas | Evidence: `adv-browser.txt` BA5**
`?ad=__proto__`, `?ad=constructor` and the percent-encoded `%5F%5Fproto%5F%5F` crash the landing script with `TypeError: Cannot read properties of undefined (reading 'bgs')` (the `T[id]` variant table is looked up with a plain object index, so prototype names resolve to a non-variant). The hero stays blank; with ADV-2 unfixed this also opens the email-in-URL path. The line is `let id = (qs.get("ad")||"d1").toLowerCase()...; if(!T[id]) id="d1"` (landing.html line 978), so only names that are already lowercase prototype members slip past the guard; `toString`, `hasOwnProperty`, `valueOf` are lowercased to names that do not exist and fall back to d1 correctly. Only reachable by a crafted link, and the only victim is whoever clicks it. Fix: validate with `/^d(1[0-2]|[1-9])$/` like the route does, or `Object.prototype.hasOwnProperty.call(T, id)`.

**ADV-4 | MINOR | code-bug | Owner: Relay | Evidence: `adv-route-http.txt` A10**
Any `step` other than exactly `"games"` or `"age"` falls through to a full sign-up (Klaviyo event, subscribe, CAPI Lead). Observed for `"foo"`, `["games"]` and `"GAMES"`. A casing or typo bug in a future client change would silently create Leads instead of failing. Fix: reject an unrecognized non-empty `step` with 400.

**ADV-5 | MINOR | code-bug | Owner: Relay | Evidence: `adv-route-http.txt` A5, A11, A12**
Free text is stored as sent. `kidGames` accepts an email address or an HTML anchor plus script (up to 200 chars) and writes it to the Klaviyo profile and event. The email check accepts `"quoted"@example.com`, `<a@b.com>`, `a..b@example.com`, `a@b.com.`, emoji local parts and a trailing NUL (`a@example.com\u0000`); IDN (`münchen.de`) and `+tag` addresses pass unchanged and the Meta `em` hash matches lower/trim of the same string (correct). Decision 1 already accepts that a third party can write `kid_games` onto someone else's profile; the part not covered is that the value can be HTML or a link and, once Story's welcome flow personalizes with `kid_games`, would be rendered into a parent's inbox. Fix: allowlist `kidGames` to the chip labels (the landing and popup chips are a fixed list) and tighten the email regex to reject control characters. Klaviyo's own handling of a NUL address is a live check (B-5 below).

**ADV-6 | MINOR | code-bug | Owner: Relay | Evidence: `adv-route-http.txt` A6, A8, A9**
Client-supplied values reach Meta without validation: `eventSourceUrl` passes `javascript:` and `data:` URLs and foreign hosts through as `event_source_url` (capped at 1000 chars); an `fbclid` inside any URL is turned into `fbc` (so a scripted request can claim any click id); `eventId` accepts CR/LF and up to 100 chars; `x-forwarded-for` first entries are forwarded as `client_ip_address` unvalidated. `__proto__` and `constructor` keys in the body and in `attribution` do not pollute and do not leak into Klaviyo bodies (A12). Impact is bounded to the sender's own request and to dataset hygiene (an invalid value can make Meta drop that single event), consistent with decision 1, so MINOR. On Netlify `x-nf-client-connection-ip` is set at the edge, which makes the ip spoof an infra question (B-3 below). Fix: require `eventSourceUrl` to be https on an ekuzo.gg or netlify.app host, restrict `eventId` to `[A-Za-z0-9_-]{1,100}`, and validate IPs before forwarding.

### Passed or matches an accepted decision (no finding)

- **ADV-7 | accepted-risk (decisions 1, 8) | A1, BA2.** 20 parallel identical sign-ups: 20 statuses 200, 20 Klaviyo events (distinct unique_ids), 20 subscribes, 20 CAPI Leads sharing one event_id; max latency 136 ms; no errors or crashes. 20 distinct emails behave the same. Two forms submitted in one tick send two POSTs with one eventId and produce one browser Lead. This is what decision 8 describes.
- **ADV-8 | accepted-risk (decision 1) | A3.** No origin check: a cross-origin text/plain POST from another site is accepted (no ACAO header, so the page cannot read the answer). Same exposure as a scripted POST. text/plain and missing content-type JSON, BOM and a fake gzip header are accepted; form-encoded and multipart bodies are cleanly rejected with 400 and no outbound calls.
- **Methods (A4):** GET, HEAD, PUT, DELETE, PATCH return 405 with no outbound calls; OPTIONS returns 204 with `Allow: OPTIONS, POST`.
- **Bodies (A2):** 1 MB and 10 MB bodies with a valid email return 200 (10 MB in 105 ms) on local `next start`, which has no body limit. Netlify rejects synchronous payloads above about 6 MB at the edge: live check (B-2).
- **Cookies (A7):** `_fbc` 600 chars is capped at 500, malformed `%` escape gives empty `_fbp` with no throw, 100 duplicate cookies and a 12 KB cookie header are handled, CR/LF in a cookie stays inside the JSON string.
- **Header abuse (A6):** garbage or 8 KB `x-nf-geo` gives empty geo fields and 200 (T11 holds under abuse); huge JSON geo is capped at 80 chars per field; an 8 KB user agent is capped at 400 chars and classified other/desktop.
- **Middleware (`adv-middleware.txt`):** no open redirect and no loop. `/register` and the four program register routes 307 to a same-origin `?join=season-one` URL; `?x=//evil.com`, `?join=//evil.com`, `?next=//evil.com` stay as inert query values (the existing `join` is replaced by `season-one`); `//register`, `///register`, `/\register`, `/.//register` are normalized by Next with 308 to same-origin paths; `//evil.com/register` 308s to `/evil.com/register` (same origin); `Host` and `X-Forwarded-Host` spoofs do not change the Location host; `/REGISTER`, `%2F`-encoded and `%00` variants 404. `/?join=season-one` returns 200 with no redirect (0 hops). Redirect chains settle in at most one hop.
- **Landing:** fast double click and Enter spam on a slow API sends one POST and one Lead (BA1). Offline then online on the real network path (BA3): error shown, no Lead, button re-enabled, retry reuses the same eventID, exactly one Lead, and the browser eventID equals the server's CAPI `event_id` end to end. Back/forward after success: no extra Lead in the Playwright document (BA4). `?preview=done` on a live host (www.ekuzo.gg mapped): no main POST and no Lead; a chip tap POSTs a games step with an empty email which the server answers 400 (BA8, already D6).
- **Popup (BA9):** reopen and resubmit in a new page load sends a second Lead with a fresh eventId (CR-6, accepted, decision 8). ESC during a pending request closes the popup and the request still completes once and still fires its Lead. ESC followed by a failed request: no Lead, and the parent is not told (they dismissed it). Both are minor and accepted.

## B. Deferred to the live human pass (cannot be settled in the sandbox)

| # | What to check | Why not here | Owner |
|---|---|---|---|
| B-1 | Real bfcache restore after a successful sign-up on iOS Safari and Android Chrome: Lead must not refire, confirmation state should survive or the form should reset cleanly. Code review: no `pageshow` handler, `leadSent` stays true in a restored page, so no refire is expected. | Playwright's Chromium runs with bfcache disabled (BA4 note). | Fable (human) |
| B-2 | Body-size behavior on Netlify: a 7 MB and a 1 MB POST to `/api/season-one` on the dev deploy (expect the edge to reject above about 6 MB and the route to accept 1 MB). | Local `next start` has no limit. | Chronos |
| B-3 | Header trust on Netlify: send `x-nf-client-connection-ip`, `x-forwarded-for` and `x-nf-geo` from outside to the dev deploy and confirm the platform overwrites or strips them (ADV-6 ip spoof, T11 geo). Also confirm the real `x-nf-geo` shape (base64 JSON, expected keys) lands in the Klaviyo event (T11 live half). | Needs the real edge. | Chronos |
| B-4 | Function timeout in practice (ADV-1): what the parent sees on the dev deploy when the route exceeds the platform limit, and that the landing shows the retry message for the platform's HTML error page. Safest after the timeout fix, using a deliberately slow stand-in rather than breaking Klaviyo. | Needs the real platform timeout. | Chronos |
| B-5 | Klaviyo's handling of the odd addresses and values from ADV-5 (NUL, `<a@b.com>`, HTML in `kid_games`): does the event 400 (then the parent sees 502), and does a Klaviyo template render `kid_games` escaped. | No Klaviyo access by design. | Story, Fable |
| B-6 | No-JS and crashed-script behavior in the real Facebook and Instagram in-app browsers on iOS and Android (ADV-2): does anything older than the supported floor fail to parse the inline script. | Needs devices. | Fable (human) |
| B-7 | Pixel Helper on the live URL after an ADV-2 style native submit, to confirm Meta receives the URL with the email (the sandbox stub cannot show what the real SDK sends). | Real `fbevents.js` is stubbed here. | Fable (human) |

## C. Retest plan for repairs

ADV-1: add C32 to the route harness (hung Klaviyo event, hung subscribe, hung Meta; each must resolve inside the timeout with the status the branch calls for). ADV-2/3: rerun BA5, BA6, BA7 (all three must pass: no crash on prototype names; a native submit or a no-JS submit must not put the email in the URL). ADV-4/5/6: add cases to C22-style tables (unknown step 400; chip allowlist; eventSourceUrl and eventId validation).

## D. Cycle 2 retest (HEAD f413246, 2026-10-10)

Fresh `git archive` copy (`/home/claude/s1-qa4`), real `next start` with the Klaviyo/Meta fetch mock (now honoring `init.signal` like real fetch). Result: ADV-1, ADV-2, ADV-3, ADV-4, ADV-5, ADV-6 all CLOSED (defect rows D9 to D12). Nothing open at CRITICAL or MAJOR.

| ADV | Retest | Evidence |
|---|---|---|
| ADV-1 (D9) | CLOSED. Stalled event: 502 at 3.5 s, no subscribe, no CAPI. Stalled subscribe: 200 at 2.5 s, Lead sent, failure logged. Stalled Meta: 200 at 2.0 s. Worst case (event 3.3 s, subscribe and Meta stalled): 200 at 7.8 s, under the 10 s platform limit (2.2 s margin). Everything stalled: 502 at 3.5 s. Games and age steps also time out cleanly. Same on a real server. | `cycle2-route-harness.txt` C32a to C32e; `cycle2-adv-route-http.txt` A13 |
| ADV-2 (D10) | CLOSED. Forms carry `method=post action=javascript:void(0) onsubmit=return false`. Three crash variants (script dies at the first statement, dies mid-way before handlers attach, fetch missing) and JS disabled: URL unchanged, no `email=`, text still in the field, no POST. | `cycle2-adv-browser.txt` BA6b, BA7 |
| ADV-3 (D11) | CLOSED. `__proto__`, `constructor`, encoded `__proto__` render the d1 fallback, no page error. Note: BA6 can no longer crash the script through `ad=__proto__`, so the crash cases moved to BA6b (injected failures). | `cycle2-adv-browser.txt` BA5, BA6 |
| ADV-4 (D12) | CLOSED. 15 unknown or malformed `step` values give 400 with zero fetches; absent step still signs up; games and age unchanged. | C33 |
| ADV-5 (D12) | CLOSED. kidGames sanitized (email, anchor and script, URL, `javascript:`, CRLF, markdown link, template syntax, NUL all defanged to plain words); non-strings 400; all 7 chips intact on the landing end to end. Control-character emails (NUL, C0, DEL, C1, CR/LF) rejected; IDN, +tag, padded, apostrophe still accepted. | C34, C35, `cycle2-chips-e2e.txt`, A5, A11 |
| ADV-6 (D12) | CLOSED for what it asked: `javascript:`, `data:`, `file:`, relative and `//` URLs dropped (and no fbc derived); tab and newline removed; eventId `[A-Za-z0-9-]` and 64 chars (browser UUID and fallback id pass through unchanged, BA3 shows the browser eventID still equals the server `event_id`); garbage, 8 KB, script-tag, port-suffixed IPs not sent (valid IPv4 and IPv6 kept). | C15, C36, A6, A8, A9 |

Residuals, all MINOR and consistent with decision 1 (they affect only the sender's own request), not re-opened: a foreign https host is accepted as `event_source_url` and its `fbclid` becomes `fbc` (the fbclid value is not format-checked, so `fb.1.<ms>.\"><img...` reaches Meta inside a JSON string); zero-width and bidi characters pass the email check (Klaviyo decides); a timed-out Klaviyo event can still have landed upstream, so a parent's retry may add a second event; a no-JS visitor sees an empty hero with a form that does nothing. Deferred live checks B-1 to B-7 are unchanged; B-4 (platform timeout) is now much lower risk because the route answers on its own by 8 s at worst.
