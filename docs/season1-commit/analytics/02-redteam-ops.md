---
title: "Season 01 analytics and speed slice: red team, operations and failure lens"
created: 2026-10-30
author: Spec red team (operations and failure)
reviews: 01-requirements.md (draft), 00-scout-map.md, final/08-handoff.md, final/03-golive-log.md, dev-runbook.md
status: findings only; no code or spec edited
---

# Red team: operations and failure

Branch `season1-commit` at 7470102 plus an uncommitted money hotfix in the working tree (see 9). Severity: critical (the funnel stops or receipts are lost with no alarm), major (silent measurement loss, an unprovable gate, a risky release step), minor (cleanup). Money red team findings 1 to 5 are not repeated; finding 2 here adds the ops side of their finding 2.

## 1. Critical: S6 code deployed before migration 0005 stops every commit and burns outbox retries

- Evidence: `insertCommitRecords` writes the order inside one transaction (`lib/season1/db.ts` L625-695 at HEAD); the commit route turns any throw into 500 `server` (`commit/route.ts` catch at the end of `handle`). `ORDER_SQL` (`outboxLoad.ts` L20-38) is shared by Klaviyo, Meta and Discord sends. `MAX_ATTEMPTS = 5` and a row at 5 attempts is never selected again (`outbox.ts` L25, L218).
- Scenario: the branch deploy (test DB `ep-lively-boat`), the integration suite (same DB) or production gets code that names `s1_orders.attribution` before the column exists. Every sign-up returns 500 and shows the error copy; every send for already paid orders fails, and after five drains those rows are dead with no alert. The dev deploy shares the test DB, so Aaron's testing breaks too.
- Resolution (change the spec, release gate): (a) apply 0005 to the test DB with `npm run s1:migrate` before the first push of S6 code; (b) production: apply with `s1:migrate --live` or the SQL editor as on 10-29 (`03-golive-log.md` L15), recorded in `s1_migrations`, then read back `information_schema.columns` for `s1_orders.attribution` before asking Jamie for the push go; (c) the file is `alter table s1_orders add column if not exists attribution jsonb;` preceded by `set lock_timeout = '3s';` (nullable, no default: metadata only, no rewrite at 0.25 CU). Rollback with the column left in place is safe: old code never names it. Accept that part.

## 2. Critical: the S9 send path needs a trigger that works outside a page request, and the obvious one fails silently

- Evidence, `after()`: `@netlify/plugin-nextjs` 5.9.0 (2024-12-09) shipped "support after() (#2717)" ([changelog](https://raw.githubusercontent.com/opennextjs/opennextjs-netlify/main/CHANGELOG.md), [PR 2717](https://github.com/opennextjs/opennextjs-netlify/pull/2717)): it uses Netlify's `context.waitUntil` or holds the response stream open. Netlify `context.waitUntil` exists for functions deployed on or after 2025-03-20, and all async work counts toward the function's execution limit ([Functions API](https://docs.netlify.com/build/functions/api)). Next documents `after()` on adapters as platform-specific and driven by `waitUntil` ([after](https://nextjs.org/docs/app/api-reference/functions/after)). The plugin is unpinned (`netlify.toml` L5-6); npm latest is 5.16.5 (2026-10-28). Realistic verdict: supported today.
- Evidence, freeze mid-send: a send cut off by the execution limit leaves its row `sending`; stuck recovery runs only at the start of a later drain (`outbox.ts` L210-213). No scheduled drain exists (`netlify.toml`, no `netlify/` dir). The webhook drains once per Stripe event, global oldest 20 (`stripe-webhook/route.ts` L260). Webhook only is not enough (money red team 2).
- Trap in the money team's fix: a standalone Netlify scheduled function is bundled outside Next, so `S1_DEPLOY_CONTEXT` is not inlined (`next.config.mjs` L5-7 only affects the Next build; `mode.ts` L28-31 says runtime `CONTEXT` is unreliable). `getSql()` then throws "Refusing" on production (`db.ts` L38-40) and `drainOutbox` swallows it (`outbox.ts` L244-246): a drain that runs every 2 minutes and never sends, with no log line anyone reads. Also, schedules do not fire on branch deploys; only "Run now" in the Netlify UI does, and the limit is 30 s ([scheduled functions](https://docs.netlify.com/build/functions/scheduled-functions/)).
- Resolution (change the spec): put the drain in a Next route, `POST /api/season1/drain` (`runtime = "nodejs"`, secret header from a new `S1_DRAIN_SECRET` env var, `drainOutbox({limit: 50, budgetMs: 8000})`, returns counts only), and add a scheduled function of a few lines that only calls `fetch(process.env.URL + "/api/season1/drain")` with the secret. Prove the route on the branch deploy by curl with the secret (rows reach `sent` with the webhook endpoint disabled); prove the schedule after release from the function log and outbox `updated_at`. Welcome keeps an order-scoped drain inside `after()` (`drainOutbox({orderId, budgetMs: 3000})`, never awaited) as the accelerator. If the route plus schedule cannot ship today, S9 ships with the `after()` drain only and the must-not at L99 is reworded to "on the next drain" until it does.
- Park for Jamie (default: every 2 minutes): Neon suspends after 5 idle minutes and the plan is 250 compute hours at a fixed 0.25 CU (`03-golive-log.md` L46-48). A 2-minute schedule keeps the compute awake around the clock, about 0.25 x 730 = 183 CU-hours a month, inside the cap, and it also removes the Neon cold wake from the commit path (part of the 4.4 s baseline). A 10-minute schedule saves hours but delays a lost receipt by up to 10 minutes. If the autoscaling ceiling is ever raised again, the schedule overruns the cap.

## 3. Major: `/season1/thanks` is force-static, so the S1 host rule cannot run there and production can silently lose its tags

- Evidence: `app/season1/thanks/route.ts` L11 `force-static`; live headers 10-30: `cache-control: s-maxage=31536000`, `cache-status: "Netlify Durable"; hit`, age about 17 h (curl of ekuzo.gg). The HTML is rendered at build with no request. S12 gives the client hostname rule to the landing only.
- Scenario: the renderer runs with host undefined and emits the QA gate, so `season1_play_answer` (the Day 0 email answers) stops on ekuzo.gg with no error; or it emits live tags and branch deploys keep firing live GA4 (F2 not fixed there).
- Resolution (change the spec): thanks uses the same client rule as the landing (hostname check plus QA flag); R16 names both force-static pages; a unit test asserts neither template contains an unconditional vendor tag and both contain the client gate.

## 4. Major: welcome's own placeholder pass can erase `{{TAGS}}` and the purchase event with no test failing

- Evidence: `welcome/route.ts` L235 replaces every `{{KEY}}` with `vars[key] ?? ""`; crew leaves unknown keys (`crew/[code]/route.ts` L68); sign-up only splits `__S1_CONFIG__`. Tests that read templates (`welcomeCopy.test.ts`) would still pass.
- Scenario: the tag render runs after L235 (or `TAGS` is not in `vars`), so production welcome ships with no GA4, no Pixel, no Clarity: the GA4 `purchase` and the new Pixel Purchase vanish.
- Resolution (change the spec): R1 evidence is the route `GET` output, not the template: for join, sign-up, crew and welcome (paid state, via `welcomeStates.test.ts`), host `ekuzo.gg` contains `G-8LM45PX53W` and the Pixel init, host `season1-commit--ekuzo.netlify.app` contains no vendor URL outside the QA gate.

## 5. Major: S5 written after middleware L33 never runs for the parents it is for

- Evidence: `middleware.ts` L33 returns as soon as `ekuzo_origin` exists. J1 and J6 parents already have it from the landing.
- Scenario: the email click with utm_* arrives, the middleware returns early, `ekuzo_lc` is never written, and every waitlist conversion is attributed to nothing. Unit tests that start from an empty cookie jar pass.
- Resolution (change the spec): S5 runs before the first-touch early return and skips only known bots; add a test "existing `ekuzo_origin` plus utm_campaign writes `ekuzo_lc`, leaves `ekuzo_origin`". Caching is not a risk: the live landing returned a fresh `Set-Cookie: ekuzo_origin` on a Netlify Durable cache hit (curl 10-30), so middleware runs ahead of the cache and nothing is baked. The funnel pages are `private, no-store`. Accept.

## 6. Major: the 160-character cap can corrupt fbclid, and a bad cookie must never fail a commit or a send

- Evidence: S5 caps each value at 160; S6 builds `fbc` from `lc.fbclid`. fbclid has no documented maximum and current values often run long. The commit reads cookies with its own parser (`commit/route.ts` L80-88); Next encodes cookie values.
- Scenario: a truncated fbclid becomes an `fbc` Meta treats as modified, lowering match quality, the opposite of R10. A malformed or tampered `ekuzo_lc` or `_fbc` reaching `JSON.parse` in the commit turns a paying parent into a 500.
- Resolution (change the spec): utm_* capped at 160; fbclid and gclid kept whole up to 512 or dropped whole, never cut; whole cookie at most 2048 bytes encoded (drop `utm_term` first); landing path capped at 128 with `/crew/<code>` stored as `/crew/`. Commit parsing is decode plus parse in try/catch, any failure means `lc: null`. The Meta sender sends `fbp`/`fbc` only when they match `^fb\.\d\.\d{10,13}\.[^\s]{1,600}$`, otherwise omits them, so one odd value cannot burn the Purchase row's five attempts.

## 7. Major: one debug flag on production plus the Developer traffic filter is permanent data loss

- Evidence: D1 sets the GA4 Developer traffic filter Active at release; that filter drops events carrying `debug_mode`, and dropped events never come back.
- Scenario: an `s1_qa` cookie or `?s1qa=1` honored on ekuzo.gg, or a renderer bug, adds `debug_mode` to production events; once the filter is Active, all Season 01 GA4 data from that release is gone.
- Resolution (change the spec): must-not plus unit test: a live-host render never contains `debug_mode` or the QA script, with or without the flag and cookie. Release step 3 moves to after the production smoke shows `/g/collect` requests without `_dbg` (same day or next morning).

## 8. Major: R3 may be impossible as written; R6 cannot be proven on the branch deploy

- R3 evidence: the Ads pings for 18509911105 come from the GA4 property's linked destination, not the repo (scout 5, risk 12). `allow_google_signals: false` and `allow_ad_personalization_signals: false` are not documented to stop a linked Ads destination's `/pagead/` request. Park for Jamie (default): test on the branch deploy first; if `/pagead/` still appears with the flag, R3 becomes "nothing without the flag" (R2) and the few QA-session pings are accepted.
- R6 evidence: on the branch deploy the CAPI Purchase carries `test_event_code` (Test Events only) while the browser Pixel goes to the live dataset; Meta says Test Events activity "will still appear in your Meta Events Manager, ads reporting, and audience creation results" ([Test events tool](https://www.facebook.com/business/help/2040882565969969)). They never pair there, and every QA test Purchase is a real, unpaired browser Purchase in the live dataset. Resolution: R6 becomes a post-release check (finding 10); QA test payments that reach welcome are counted in the ledger and kept to two or three.

## 9. Major: an uncommitted money hotfix is editing the same lines S10 changes

- Evidence: `git status` 10-30: `commit/route.ts` +94/-17 and `db.ts` +23, uncommitted ("Hotfix 10-30", `IN_FLIGHT_PI`, `pendingPis`, new 503 `try_again` paths for an email-wide in-flight PI, a failed cancel and Stripe read errors). The spec's L299 reference is already stale.
- Scenario: both land in one release; an instant rollback for a tag problem also removes the double-charge fix; S10's 409 mapping misses the new 503 cases, which still reach the "not charged" fallthrough.
- Resolution (change the spec): the hotfix ships alone first (own build, smoke, go). This slice rebases on it, and S10 is re-specified against the hotfix's return points (which get 409 `in_progress`, which keep 503, which get no view cookie, per money red team 5).

## 10. Major: how each verification row actually gets proven, and what needs Jamie

- Container facts: the branch deploy answers 200 from here, and curl reaches googletagmanager, connect.facebook.net and clarity.ms today; but the 10-29 headless smoke logged analytics as blocked (`03-golive-log.md` L50). Sentry first confirms gtag.js and fbevents.js load in its browser; if not, the rows below run in Jamie's built-in browser pane (logged-in sessions, vendor hosts reachable).
- R2, R16: request log with and without `?s1qa=1` (blocked requests still show their URL). R3, R4, R12: `/g/collect` requests in the log (`_dbg=1`, `dl=` for page_location, `en=season1_tap_to_welcome` with `epn.ms`); no GA4 UI needed; a DebugView screenshot is optional and needs Jamie's Google login. R5: `facebook.com/tr` requests (`ev=Purchase&eid=<order id>`, `ev=InitiateCheckout&eid=<attemptId>`, none on reload); no Events Manager needed. R7: `clarity.ms/tag/wml8wll5ua` loads and the `clarity("set", ...)` calls run; the dashboard check (lag of hours, Jamie's login) is post-release. R10: outbox test plus the sent row. R11: Klaviyo connector `get_events` on the `team+s1test` profile. R6 after release: Meta dataset stats (the Meta tool used in scout 8) show Purchase from BROWSER and SERVER with total equal to paid orders, within 48 h. R19 and any vendor UI step: Jamie.
- Resolution: rewrite the evidence column this way; R6 and the Clarity dashboard leave the pre-release gate.

## 11. Major: release, smoke and rollback on a live funnel

- Order: hotfix release (9); then 0005 on test DB, branch build, gates; 0005 on production with read-back (1); `S1_DRAIN_SECRET` in Netlify Production (Jamie pastes); Jamie's go; push; deploy log read for the plugin version (12).
- Smoke within 10 minutes: the 10-29 16:40 list (`03-golive-log.md` L50) plus: view-source of join, sign-up, crew, welcome and thanks on ekuzo.gg has live tags and no `debug_mode`; the same pages on the branch host have none; curl of `/season1/join?utm_source=meta&utm_campaign=t&fbclid=x` with an `ekuzo_origin` cookie returns `Set-Cookie: ekuzo_lc` (HttpOnly, Secure, under 2 KB); drain route answers 401 without the secret; Jamie's phone (R19) from a utm link through sign-up to the payment sheet, then a read of that pending order's `attribution` in Neon (no charge needed); next real order: outbox rows `sent` within minutes.
- Rollback, tag or page problem: Netlify Deploys, previous published deploy, "Publish deploy" (seconds, no git); the GA4 filter stays off until fixed. Attribution or commit 500s: same instant rollback first (old code ignores the column), debug after; pending outbox rows are sent by the next drain or `npm run s1:outbox`. Do not drop the column. `S1_COMMIT_MODE` removal (75 s) stays the pause switch if the money path itself is in doubt.

## 12. Minor: unpinned runtime plugin between proof and release

- Evidence: `netlify.toml` L5-6 has no version; 5.16.5 shipped 10-28. `after()` is proven on whichever version built the branch deploy.
- Resolution (accept): record the plugin version from the branch and production deploy logs in the ledger; if they differ, re-check welcome-to-`sent` timing on the first real order. Pinning in `package.json` is a follow-up.

## 13. Minor: scope to cut for ASAP

- Cut Clarity on early-access pages: they are `redirectToBare` stubs now (`early-access/route.ts` L9-11). Cut Clarity on crew: it records `/crew/<code>`, against the must-not at L90.
- If the build slips, S3 and S4 (Pixel and Clarity on the funnel) go to a follow-up first: D7 keeps every campaign optimizing Lead on `/season1`, so nothing bids on them. Keep the parts whose data is lost forever if late: S5 to S7 (attribution), S2, S12/F2, and S9 to S11 (speed and F15).
- The D5 copy (busy line, in-progress message) is on the critical path: draft it now, in parallel with the build.
- Accept: production also answers on `ekuzo.netlify.app` and deploy permalinks, where route pages render no tags and layout pages (build context) render live ones.
