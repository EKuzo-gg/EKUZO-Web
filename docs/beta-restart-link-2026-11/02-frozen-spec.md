# Spec (draft until the red team is resolved)

## Token
`token = b64url(row id, 16 bytes) + b64url(HMAC-SHA256(key, "v1|" + rowId + "|" + sessionId))`: 22 + 43 = 65 characters of `[A-Za-z0-9_-]`, no separator. `key = HMAC-SHA256(refSecret(), "ekuzo:beta-restart:v1")`. New module `lib/season1/betaRestart.ts`: `restartToken(rowId, sessionId)`, `parseRestartToken(token) -> rowId | null`, `verifyRestartToken(token, rowId, sessionId) -> boolean` (timingSafeEqual), `restartLink(origin, rowId, sessionId)`.

## Routes
1. `app/season1/beta/r/[token]/route.ts`, GET, `force-dynamic`. Token shape `^[A-Za-z0-9_-]{65}$`: set `ekuzo_brt=<token>; Path=/api/season1-beta; Max-Age=1800; HttpOnly; Secure; SameSite=Lax` and the flag `ekuzo_brf=1; Path=/season1/beta; Max-Age=1800; Secure; SameSite=Lax` (readable by the page script, carries nothing). Always 302 to `/season1/beta/start` with the L2 headers. No database call here.
2. `app/api/season1-beta/restore/route.ts`, POST only. Same Origin guard as `/api/season-one` (cross-site browser POST gets 403). Reads `ekuzo_brt`, always clears both cookies. Limit `s1br:ip:<hash>` 60 an hour, 0.8 s cap, fail open. One select by id and livemode: `id, email, session_id, stage, answers, source, completed_at, updated_at`. Verify the signature against the row's `session_id`. Answers: `{ok:true,state:"none"}` | `{ok:true,state:"done"}` | `{ok:true,state:"resume",email,sessionId,stage,answers}` (answers passed through `partialAnswers`). `Cache-Control: no-store`. When the request has no `ekuzo_bsrc` cookie and the row's source is a tag (`BETA_SRC_RE`), set `ekuzo_bsrc` as middleware does.

## Existing saves (additive)
`handleBetaProgress`: `PROGRESS_SQL` already returns `id`; when a row came back and it is not completed, add `beta_restart_link` to the profile properties. `handleBetaWizard` / `saveToKlaviyo`: add `beta_restart_link: "https://ekuzo.gg/season1/beta/start"`. Origin: `https://ekuzo.gg` when `keyIsLive()`, else the request origin.

## Page script (`lib/season1/betaProgressScript.ts`)
- If the flag cookie `ekuzo_brf` is present: delete it, POST the restore endpoint (any host; it only reads). `resume` and no usable local state and the parent is still on the first screen: build the stored state from the response (same session id) and run the existing restore walk; GA4 `beta_wizard_resume {step, via:"link"}`. `done`: show the page's last `[data-step]` section, mark the run done, no posts, GA4 `beta_wizard_resume {step:"done", via:"link"}`. `none`: nothing.
- Same-device resume keeps working and now sends `via:"device"`.
- Zone: on a fresh load, before any restore, when the browser zone starts `America/`, `US/` or `Canada/`, is not one of the page's eight names and is not `America/Indiana|Kentucky`, set the select from the winter offset (Z1).

## Klaviyo (human action, Jamie's go)
Pick-up email in flow Wf7Nam (flow template UASFfq, Draft): the button and text link become `{{ person.beta_restart_link|default:"https://ekuzo.gg/season1/beta/start" }}`. Edited in the Klaviyo UI; the connector cannot edit flow templates.

## Pre-flight (read 14:14 CT 2026-11-13)
Wf7Nam Draft, WjRNvd Draft, W9LxM9 Live (test-address filter). `S1_REF_SECRET` is referenced by `refSecret()` and required with a live Stripe key, so production has it. Netlify builds branch deploys for `dev` and `season1-commit` only; previews come from a draft PR. The wizard page's own posts are ekuzo.gg only, so a preview test posts progress directly to the API.
