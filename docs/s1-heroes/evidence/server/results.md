# Sentry server and build lane: results (Fable, 2026-10-14)

Target: `/home/claude/ekuzo-web`, branch `preview/s1-heroes`, commit `a68a073` (base `origin/dev`; `origin/main` is an ancestor of `origin/dev`).
Author is not verifier: the harness `sentry-harness.ts` was written without reading Relay's `relay-harness.ts`.
I did not edit app code. Browser lane (ports 3201/3202) not touched.

## Method notes

- `next build` was run in a throwaway copy, `/tmp/sentry-server` (`git archive a68a073`, `node_modules` hard-linked), not in the repo directory.
  Reason: the repo's `.next/dev` belongs to the browser lane's `next dev`, and `next build` rewrites `.next`. `app/api/season-one/route.ts` in the copy is byte-identical to the repo's (`cmp`).
  `tsc --noEmit` ran in both the copy and the repo (`--incremental false`, so no `tsbuildinfo` was written).
- Reference route for all comparisons: `git show origin/dev:app/api/season-one/route.ts`, placed beside the build route with the same import paths. Sanity checks confirm it contains no `hero` code and ignores hero fields.
- Harness env: `KLAVIYO_PRIVATE_API_KEY=test META_CAPI_ACCESS_TOKEN=x META_PIXEL_ID=1`; global `fetch` mocked (records every outbound call, returns ok unless a case sets a failure). Nothing left the process. No live Klaviyo or Meta call was made.
- To rerun: copy `sentry-harness.ts` into `/tmp/sentry-server` (or any checkout with `node_modules` and the `@/*` tsconfig path) and run
  `KLAVIYO_PRIVATE_API_KEY=test META_CAPI_ACCESS_TOKEN=x META_PIXEL_ID=1 BUILD_ROUTE=<route.ts> REF_ROUTE=<route.devref.ts> OUT_TXT=<out>.txt npx tsx sentry-harness.ts`.
- Harness has teeth: a mutant route (hero written for every source, `hero` added to CAPI `custom_data`, `<>` added to the answer allowlist) made 93 checks fail (`harness-mutant-run.txt`): C4, C6, N1, N3, N4 all caught it.

## 1. N7 build and static checks

| Check | Result | Evidence |
|---|---|---|
| `npx tsc --noEmit` | exit 0, no output (copy and repo) | `n7-tsc-copy.txt`, `n7-tsc-repo.txt` |
| `npx next build` | exit 0 with `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set to dummies (see D-S4: without them the build dies in `/api/camps/register`, pre-existing, not our files) | `n7-next-build.txt`, `n7-next-build-attempt1-no-env.txt` |
| Route table | `○ /season1` (Static), `ƒ /api/season-one` (Dynamic). Built `season1.body` contains `AD_HERO` | `n7-route-table-excerpt.txt` |
| `npx eslint app/api/season-one/route.ts` | exit 0, no findings | `n7-eslint.txt` |
| Page script syntax (`node --check` on the last inline script of `landing.html`) | OK | `n4-script-syntax.txt` |
| Test runner | `package.json` has no `test` script and no vitest, jest or playwright. Two `node:test` files exist in `lib/__tests__` and need a custom resolver hook. Run with `npx tsx --test`: 45 tests, 44 pass, 1 fail (`buildWeeksLabel includes the time string`, `lib/ekuzo101-weeks`). `lib/` is untouched by this branch, so the failure is pre-existing on `origin/dev` | `n7-existing-tests-tsx.txt` |

## 2. Server harness (C1 to C4, C6, N1, N3, N4, N11)

`harness-run.txt`: 496 pass, 2 fail (both are defect D-S1, minor). Raw console output the route emitted during the run is in `harness-run.logs.txt`.

| Tag | Pass | Fail | What it covers |
|---|---|---|---|
| SANITY | 2 | 0 | reference route has no hero code and ignores hero fields |
| C1 | 3 | 0 | page A bodies: `none/""/none`, `none/""/url`, stray answer dropped; old client with no hero keys |
| C2 | 52 | 0 | 4 heroes x Aaron's answers x heroFrom `url|ad-map|split` stored verbatim: `“Five more minutes.”`, `“I can’t pause it.”`, `Five more minutes.`, `I can’t pause it.`, `Soccer, Dance`, `Fortnite, Something else`, `Way too much`, `I have no idea`, all 6 games, 5 activities. Profile gets exactly `season1_hero`, `season1_hero_answer`; event exactly `hero`, `hero_answer`, `hero_from`; all strings; `heroFrom` never on the profile |
| C3 | 57 | 0 | 29 hostile `hero` values (array, object, number, null, bool, `__proto__`, `constructor`, `toString`, `hasOwnProperty`, `valueOf`, `prototype`, 10k strings, `<img onerror>`, `javascript:`, NUL, zero-width, RTL override, fullwidth, case and whitespace variants) and 20 `heroFrom` variants. Only the four hero ids or `none` ever reach Klaviyo; `heroFrom` is one of the four values or empty. Uppercase and padded hero ids normalize |
| C4 | 139 | 1 | skip (empty, missing, whitespace, symbols only, null, zero-width only) records `skipped` for every hero. 60+ hostile answers (arrays, objects, numbers, `__proto__`, 10k chars, script and svg markup, `javascript:` and `data:` URLs, https URLs, markdown links, entities, Klaviyo and Jinja template syntax, SQL, CSV formulas, RTL and zero-width, control characters, newlines, emoji, combining marks, astral letters, CJK, Arabic, fullwidth angle brackets, JSON breakout strings, percent encoding): every result equals an independent code-point oracle, uses only `[\p{L}\p{N} ,.'’“”"!?&-]`, is at most 200 characters, and contains none of `< > = ( ) / : ; { } [ ] | $ % @ # + \` or control characters |
| C6 | 17 | 0 | site-popup with hero fields (explicit, source missing, unknown, array, object, number, `AD-LANDING`, padded): no hero key on profile or event, and every outbound call byte-identical to origin/dev |
| N1 | 83 | 0 | 15 body shapes: CAPI request (URL, headers, body minus `event_time`), subscribe call and the exact list of outbound URLs identical to origin/dev; CAPI `custom_data` is only `content_name` (`season_one_<ad>`), `user_data` keys unchanged; no `hero` key or answer text in any CAPI body outside `event_source_url`. Includes d10 split, d13, `d010`, bad ad, `javascript:` source URL, missing eventId (server uuid), junk eventId |
| N3/N4 | 17 | 0 | page A body without hero fields, plus d11, bare ad, firstName, no or hostile attribution, d3, d10: with the 5 new hero keys removed, every profile, event, subscribe and CAPI property equals origin/dev; the only additions are event `{hero,hero_answer,hero_from}` and profile `{season1_hero,season1_hero_answer}`. Odd geo and user-agent headers unchanged |
| N4 | 66 | 0 | honeypot (`x`, URL, padded, `0`) with hero fields: 200, zero outbound calls; whitespace-only honeypot proceeds, as on origin/dev. Klaviyo event 500/401/429/network throw: 502, `ok:false`, one call only, no subscribe, no CAPI Lead, same as origin/dev, body does not echo hero or answer. Subscribe 500 or throw: still 200, CAPI still sent. CAPI 500 or throw: still 200. Unknown `step`: 400, no calls. 10 email variants: same status as origin/dev |
| N11 | 77 | 1 | `step: games` and `step: age` with hero fields (both sources): no hero keys, identical to origin/dev, single Klaviyo event, no CAPI. Prototype pollution via raw JSON (`__proto__`, `constructor.prototype`, nested): `Object.prototype` untouched, `__proto__` cannot flip `source`. Malformed and non-object bodies match origin/dev. Perf: 5 MB and 2 MB answers handled in 49 to 307 ms (no ReDoS). One failure: lone surrogate, D-S1 |

Notes from the harness (INFO lines in `harness-run.txt`):
- `event_source_url` is client supplied and passes to Meta verbatim, including a `?hero=` query when the page URL has one (D-S2).
- Page A key diff: event `+[hero,hero_answer,hero_from]`, profile `+[season1_hero,season1_hero_answer]`. Nothing else differs.

## 3. N8 release-gate dry run

`n8-release-dryrun.txt`, `n8-asset-dependency.txt`, `n8-cleanup.txt`.

- `git worktree add /tmp/rel origin/main -b sentry-release-dryrun`; checked out `app/season1/landing.html`, `app/api/season-one/route.ts`, `docs/season-one-tracking.md`, `docs/s1-heroes` from `preview/s1-heroes`; local commit `bc6756f`.
- `git diff --quiet preview/s1-heroes HEAD -- app lib components`: exit 0 (identical).
- `git diff --name-only origin/main HEAD` lists exactly: `app/api/season-one/route.ts`, `app/season1/landing.html`, `docs/season-one-tracking.md` and 8 files under `docs/s1-heroes/` (the committed ones; my uncommitted `evidence/server/` files are not in it but would also fall under the allowed `docs/s1-heroes/` prefix).
- No `public/roadshow`, `public/review.html` or `public/ads` path. `public lib components` unchanged against `origin/main`. Nothing outside the allowed set (grep exit 1).
- For reference, `origin/main` vs `origin/dev` differ in 127 paths (24 `public/ads`, 7 `public/roadshow`, `public/review.html`, 93 `docs/season1-launch`, `WORKLOG.md`, `landing.html`); none of them carry over. `landing.html` has no `/ads/`, `/roadshow` or `/review` references, so it does not depend on any dev-only file.
- Cleanup done: worktree removed, branch `sentry-release-dryrun` deleted, `/tmp/rel` gone, `git worktree list` shows only the main checkout.
- Reminder for the real release: `WORKLOG.md` is allowed by the frozen spec but is not in the Auditor's N8 list; keep the final `--name-only` list to the same set plus WORKLOG if touched.

## 4. Code review of `git diff origin/dev..preview/s1-heroes -- app`

Server (`route.ts`, +28 lines):
- Injection: answer passes a single negated character class (code-point allowlist). Output cannot contain `<`, `>`, `=`, `(`, `)`, `/`, `:`, `;`, `{`, `}`, `%`, `|`, `$`, `@`, `#`, `+`, backslash, control or bidi characters. Template syntax (`{{ }}`, `{% %}`) and HTML entities with `;` cannot form. `"`, `'`, `&`, `-`, `.` survive, so bare domains and a leading hyphen can persist, and an unescaped render inside an HTML attribute would be unsafe; the code comment and tracking doc already say never render unescaped (D-S3, accepted).
- Prototype pollution: no dynamic key assignment; `hero` and `heroFrom` are checked with `Set.has` after a `typeof string` guard; `JSON.parse` turns `__proto__` into an own data property that nothing reads. Verified with raw JSON bodies.
- ReDoS: the new regex is one character class with a global flag and no nesting or alternation: linear. 20 MB of input takes 30 to 1035 ms (the slow case is many replacements, not backtracking). Netlify's body limit makes that unreachable anyway.
- Hero or answer to Meta: `sendMetaLead` is unchanged and reads only `body.eventSourceUrl`, `body.eventId`, `email`, headers and cookies. The answer never reaches it. The hero id can reach Meta only inside the client-supplied URL (D-S2).
- Live sign-up breakage: the new block cannot throw (typeof guards, `String` coercion not used on objects, `Set.has` on any key). It runs before the Klaviyo event, so a throw would have turned into a 502 for everyone; the harness fed it several hundred hostile and valid bodies (496 checks), none threw. Server adds no outbound call, so the 3.5 + 2.5 + 2 s budget is unchanged. Old cached client against new server and new client against old server both fine (extra keys ignored; absent keys give `none`/empty).
- Residual not verifiable offline: Klaviyo accepting `season1_hero_answer: ""` on the profile for page A. Empty-string profile values already go out today (`season1_ad` is empty for d13 to d18), so low risk; confirm in the dev-deploy read-back.

Client (`landing.html`, +30 lines), static review only (behavior belongs to the browser lane):
- Ordering and TDZ: `qs`, `id`, `adOk` (declared directly after `id`), `T`, `D`, `d`, `HERO_DEFS`, `AD_HERO` all precede the resolution block; `let HERO, HERO_FROM` are top-level in the main script; `HD` is const after them. `ga` and `clr` (const, declared after the hero block) are referenced in the hero block only inside click handlers and a `setTimeout(...,0)`, so nothing reads them while still in the temporal dead zone. The new `clr("set","hero",...)` sits after `clr`'s declaration. No other script on the page declares `HERO`, `HERO_FROM`, `AD_HERO` or `adOk`.
- `localStorage` access (property read included) is inside try/catch; `v.indexOf(s)<0` on an array handles `""`, `null` and stored junk, and rewrites; own-property checks everywhere (`hero=constructor`, `ad=__proto__` do not hit the prototype).
- `adOk` is false for a missing or invalid ad, so the d1 fallback never maps; `d010` still reaches d10 on the client (pre-existing quirk, Auditor item 14).
- Share link: always carries `hero` (`none` for page A). The d10 key is written only in the split branch.
- Payload: `hero`, `heroAnswer`, `heroFrom` added to the main post only; `step: games` post untouched. Pixel and `fbq` Lead code untouched. Answer text appears only in the `/api/season-one` body.
- Docs: `docs/season-one-tracking.md` matches the code, with one overstatement (D-S2).
