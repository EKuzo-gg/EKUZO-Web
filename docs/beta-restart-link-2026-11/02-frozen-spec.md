# Frozen spec (frozen 2026-11-13 after the red team; changes after this line are logged at the bottom)

Read with `01-requirements.md` and `redteam-resolution.md`. Where this file and 01 differ, this file wins (01 predates the red team): validity is 14 days, resume is a tap, and the note, time zone and times are never returned.

## Token (`lib/season1/betaRestart.ts`, new)
`token = b64url(row id as 16 bytes) + b64url(HMAC-SHA256(key, "v1|" + rowId + "|" + sessionId))`: 22 + 43 = 65 characters of `[A-Za-z0-9_-]`. `key = HKDF-SHA256(refSecret(), salt "", info "ekuzo:beta-restart:v1", 32 bytes)`. Exports: `restartToken`, `parseRestartToken` (shape and decoded length, returns the uuid or null), `verifyRestartToken` (compares decoded bytes with timingSafeEqual), `restartLinkBase()` (production deploy context: `https://ekuzo.gg`; else `DEPLOY_PRIME_URL` when it matches `^https://[a-z0-9-]+--ekuzo\.netlify\.app$`; else null), `maskEmail` ("j•••@gmail.com": first character, three dots, the full domain), constants `RESTART_VALID_DAYS = 14`, cookie names `ekuzo_brt` (token, HttpOnly, `Path=/api/season1-beta`) and `ekuzo_brf` (flag, value `1`, readable, `Path=/season1/beta`), both `Max-Age=1800; Secure; SameSite=Lax`.

## Routes
1. `app/season1/beta/r/[token]/route.ts`: GET, `force-dynamic`, no imports beyond the cookie names and shape check (so a rollback can keep it). Good shape: append both cookies. Always `302`, relative `Location: /season1/beta/start`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`. No database call.
2. `app/api/season1-beta/restore/route.ts`: POST only, JSON body `{}` | `{confirm:true}` | `{clear:true}`. Order: Origin guard (same rule as `/api/season-one`; 403 before anything else), read `ekuzo_brt`, shape check, limiter (`s1br:ip:<hash>` 60 an hour, or one shared key `s1br:noip` when there is no client IP; 0.8 s cap, fail open), one select by id and livemode, signature check against the row's `session_id`.
   - `{clear:true}`, no cookie, bad shape, unknown row, bad signature, `updated_at` older than 14 days: `200 {ok:true,state:"none"}`, both cookies cleared.
   - `completed_at` set: `200 {ok:true,state:"done"}`, both cookies cleared. No email, no answers.
   - Valid and unfinished, no `confirm`: `200 {ok:true,state:"resume",emailMask,step}` where `step` is the next step number 1 to 3. Cookies kept. Nothing about the player.
   - Valid and unfinished, `confirm:true`: `200 {ok:true,state:"resume",email,sessionId,stage,answers}`; answers pass through `partialAnswers` and then lose `note`, `timeZone`, `tz` and `times`. Both cookies cleared. If the request has no `ekuzo_bsrc` cookie and the row's `attribution.src` matches `BETA_SRC_RE`, set `ekuzo_bsrc` with the options middleware uses.
   - Database error or timeout (2.5 s): `503 {ok:false}`, cookies kept.
   - Every answer: `Cache-Control: no-store`. The endpoint never writes to `s1_beta_progress`, Klaviyo or the sheet. Logs: state names and error codes only.

## Existing saves (additive)
- `handleBetaProgress`: after the save, when a row came back unfinished, in its own try/catch build `restartLinkBase() + "/season1/beta/r/" + restartToken(row.id, sessionId)` and add it as profile property `beta_restart_link`; on null base or any throw, leave the property out. `PROGRESS_SQL` already returns `id`.
- Completed wizard (`saveToKlaviyo`): add `beta_restart_link: "https://ekuzo.gg/season1/beta/start"`.
- `cleanPath` (attribution): collapse `/season1/beta/r/<anything>` to `/season1/beta/r/`.

## Page script (`lib/season1/betaProgressScript.ts`)
- Link arrival = flag cookie `ekuzo_brf` present. If this browser already holds a usable saved run, the saved run wins: POST `{clear:true}`, delete the flag, carry on as today. Otherwise POST `{}`; on 503 or a network error wait 1.5 s and try once more; delete the flag only after a 200.
  - `resume`: if the parent is still on the first screen and no field has been typed in, insert the panel above the first screen's content. Copy (final strings in `03-decision-log.md` D3): headline "Welcome back.", line "Your answers are saved under {emailMask}. Pick up where you left off?", buttons "Pick up where I left off" (class `btn`) and "Start fresh" (class `btn back`). Built with createElement and textContent only, in a `role="status"` container, using the page's own classes (`lede`, `acts`, `btn`). "Pick up": POST `{confirm:true}`, build the stored run from the answer (same session id), remove the panel, run the restore walk with the link flag set (no progress post, no `beta_wizard_step`), GA4 `beta_wizard_resume {step, via:"link"}`, focus the first field of the step. "Start fresh": POST `{clear:true}`, remove the panel.
  - `done`: show the page's last `[data-step]` section the way the page does after a send (all other steps hidden, progress dots in their final state), mark the run done, no posts, GA4 `beta_wizard_resume {step:"done", via:"link"}`. Never `beta_wizard_complete`.
  - `none`: one line above the first screen, `role="status"`: "That link has run out. Start below and your answers will save as you go."
- Same-device resume sends `via:"device"`.
- Time zone: on load, when the browser zone is in the table `BETA_ZONE_LABELS` (every US and Canadian IANA zone and the `US/` and `Canada/` aliases, mapped to Eastern, Central, Mountain, Pacific, Alaska, Hawaii or Other), set the select to that label; any other zone starting `America/`, `US/` or `Canada/` reads Other; anything else is left as the page set it. The table is exported from TypeScript and written into the script from that one object. The saved run records `tzSet` when the parent changes the select by hand; a restore sets the select only when `tzSet` is true; a link restore never does.
- GA4 calls in the script: `beta_wizard_step {step}`, `beta_wizard_resume {step, via}`. Nothing else, and no vendor but GA4.

## Tests (Sentry runs the whole suite; these are the new or changed ones)
Token: round trip, wrong session, wrong row, truncated, altered byte, 64 and 66 characters, non-uuid id never throws. Restore route: each state above including the 503 and cookie handling per state, Origin guard before cookie clearing, no `note`/`timeZone`/`tz`/`times` in a confirm answer, `done` carries no email or answers, expiry at 14 days, livemode mismatch reads `none`, the source cookie rule, no write statement issued. Redirect route: headers, both cookies, relative Location, bad shapes set no cookie. Progress: the property is present with a production context, absent on a throw and with no base, and a failing link build still sends the event; completion sets the plain address. `cleanPath` collapse. Script: parses, hooks intact, GA4 calls are the two shapes above, the panel is built without innerHTML, the zone table (Toronto, Winnipeg, Regina, Edmonton, Vancouver, Whitehorse, Halifax, St_Johns, Boise, Indiana/Indianapolis, Indiana/Tell_City, Kentucky/Louisville, Phoenix, Honolulu, Anchorage, Puerto_Rico, Mexico_City, Bogota, Europe/London, US/Pacific, Canada/Saskatchewan). Existing tests to update: the GA4 shape test in `betaProgressScript.test.ts`, the `pr-1` mock row id in `betaWizard.test.ts`.

## Klaviyo (human action, Jamie's go)
Pick-up email in flow Wf7Nam (Draft): the link becomes `{{ person.beta_restart_link|default:"https://ekuzo.gg/season1/beta/start" }}`. Edited in the Klaviyo UI.

## Pre-flight (read 14:14 CT 2026-11-13)
Wf7Nam Draft, WjRNvd Draft, W9LxM9 Live (test-address filter). Netlify builds branch deploys for `dev` and `season1-commit` only; previews come from a draft PR. The wizard page's own posts are ekuzo.gg only, so a preview test posts progress directly to the API. `S1_REF_SECRET` in the Production context: to check in Netlify before release (C5).

## Spec changes after freeze

| Time CT | Change | Why |
|---|---|---|
| 14:51 | Restore: a finished run reads `done` whatever its age; the 14 days apply to an unfinished run only | A finished family tapping an old link should not be told to start again (Fable, on the builder's note 3) |
| 15:25 | `next.config.mjs` inlines Netlify's `DEPLOY_PRIME_URL` as `S1_DEPLOY_PRIME_URL`, read first by `restartLinkBase()` | On deploy preview 7 the progress save wrote no `beta_restart_link`: the preview address did not reach the function runtime, the same way `CONTEXT` does not. Production is unaffected (it uses the inlined deploy context). `S1_REF_SECRET` read in Netlify: Production context only, scoped to Builds, Functions, Runtime (C5 closed) |
