# Atlas self-test (2026-11-05)

Self-evidence only; Sentry verifies independently.

## Files changed

- `app/season1/join/route.ts`: copy of `b/route.ts`, template path `b/join-b.html`, header comment says it serves B's template (D10).
- `app/season1/join/join.html`: deleted (plain rm).
- `lib/season1/__tests__/joinRoutesMatch.test.ts`: new.
- `lib/season1/__tests__/joinPage.test.ts`, `devView.test.ts`, `warmRoute.test.ts`, `tags.test.ts`: repointed to `b/join-b.html`; two A-only assertions in `joinPage.test.ts` rewritten against B (price FAQ season total, friend credit month block, plus the CTA "Save their spot for $100").
- `app/season1/landing.html`: sign-up script (W3), small script after `#hero` plus phone-only CSS rule (W4), `AD_HERO` moved to the small script, `HERO_KEYS` sync check.
- `components/ui/SeasonOnePopup.tsx`: W3 popup.

Protected paths: not touched. Relay's files: not touched. No git commands other than status.

## Build note

`next build` in the worktree fails because `node_modules` is a symlink outside the worktree (Turbopack cannot resolve `next`; `--webpack` hits unrelated type errors in `.next/types`). I built a copy of the worktree (without docs) at `/tmp/claude-0/atlas-build` with a hard-linked `node_modules`, served it on port 3100 and stopped it with its pid file. Same source as the worktree at build time.

## Requirements

- R1.1, R1.3, R1.7: `joinRoutesMatch.test.ts` calls both `GET`s with the same `Request` (live host, `?src=email`, non-live host, bad `src`) and asserts equal status, headers and body. Passes.
- R1.2: the same test (`src=email` body equal) plus unchanged `renderJoin` call.
- R1.4: route files compared with comments stripped; both read the same template path (regex on both files). With one template there is nothing to drift, and an edit to either route file fails the test.
- R1.5: `join.html` removed; `grep` finds no remaining reference; four tests repointed, two assertions rewritten. Test asserts the file is gone.
- R1.6, R1.8: not self-checked beyond equal bodies in the test; Lane A owns the production-build diff and the `.nft.json` trace.
- R3.6: browser script (`/tmp/claude-0/atlas-shots/func.mjs`, Playwright, stubbed `/api/season-one`, fbq and gtag recorders). `{ok:true,repeat:true}`: 0 Lead calls, confirmation shown. New: Pixel plus GA4 each fire once.
- R3.7: second email in the same page gets a different `eventId` (true); same email with different case and spaces keeps the id after a failed first post (true). `leadSent` re-arms and `savedEmail` clears on a different email.
- R3.8: three rapid clicks gave 1 POST (in-flight guard plus disabled button). Popup uses an `inflightRef`.
- R3.9: `ekuzo_s1_joined` is `1` after a repeat response and after a new sign-up (also seen in the confirmation screenshot run).
- R3.10: popup reads the JSON body, sets the joined flag, skips `trackLead` on `repeat:true`. Not exercised in a browser (needs the site layout); typechecks, logic reviewed. Sentry Lane B has that case.
- Off LIVE `post()` returns `{ok:true}` with no `json`: handled (`typeof r.json==="function"` check, treated as new).
- R4.1 to R4.3: CLS self-run `evidence/atlas/cls-self.json` (375x667, 3 runs, production build, analytics blocked): d19 0.0013, d18 0, d21 0.0013 (before: 0.787, 0.854, 0.787 in `before-probe.json`). d2 0.386, identical to the unmodified baseline server on 3200 (0.386, 2 runs), so interactive heroes are not worse. Desktop is untouched (rule is inside `max-width:959px`). Screenshots of d18, d19, d21 settled at both sizes look like today's pages; I did not run a pixel diff against the baseline.

## Test output

- `tsc.txt`: clean (exit 0).
- `npm-test.txt`: 509 tests, 508 pass, 0 fail (exit 0). Run before Relay's test file may have landed; Sentry reruns.

## Screenshots (`docs/s1-join-sync-2026-11/screenshots/`)

join, join-b (`-open`), landing-d18, d19, d21 (`-settled`, 6 s after load), landing-d19 `-confirmation`; each at 1440 and 375.

## Open issues

- The /join and /join/b pages log three 404 resource requests in the console on a local build (same on both; B is protected, so I did not chase them). Likely local-only assets; Sentry's console check should confirm on its build.
- Settled 375 screenshots show an 8 px dark frame around the landing page; not caused by this change (no layout rule of mine touches body), not verified against baseline.
- Analytics hosts blocked count was 0 because the local pages did not request them (non-live host); the block was in place for every context.
- Popup W3 not browser-tested by me.
