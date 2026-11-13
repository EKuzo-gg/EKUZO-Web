# Evidence ledger (written 20:36 CT; release rows added after the push)

Author is Fable unless noted. "Sentry" rows are independent: `evidence/sentry/results.md` (145 browser checks at each of 390x844 and 1440x900, 15 adversarial tests, 0 FAIL).

| Req | Test | Evidence | Result | Verified by |
|---|---|---|---|---|
| B1 | no earlier sign-up, and already on the waitlist | unit B1; deploy pv1, pv2 (`evidence/relay/preview-live-write.md`) | pass | Fable, Sentry 3 |
| B2, N2, N6 | no list, no Waitlist event, no consent call, no Meta, no step lock or 24 h claim | unit B2; Klaviyo read: NEVER_SUBSCRIBED, no list; Sentry 3 (no XGTv2F, Graph, subscribe or `s1wl:` path) | pass | Sentry |
| B3, N1 | retry of one submit | unit B3; deploy: submissions 1 after a repeat post; Sentry 2c (retry reuses eventId) | pass | Sentry |
| B4, B5 | sibling; edited answers | unit B4, B5; Neon test branch SQL run; deploy pv1 sibling | pass | Fable |
| B6 | shared network | unit B6, B6b, A2, A3 | pass | Fable |
| B7 | honeypot | unit B7; deploy: no row, no profile for the bot email | pass (server). Page has no hidden field: D6 | Fable |
| B8, B9 | validation; untrusted text | unit B8, B9, D9, P5; Sentry 3a to 3f | pass | Sentry |
| B10 | source and attribution on the record | unit B10; deploy: cookie set on Netlify, `karlin-email` and `karlin-text` on family, progress and profile | pass | Fable. Sentry could not carry the Secure cookie on its local http host; the deploy run covers it |
| B11, B12 | one store down; both down | unit B11, B12; Sentry 2c (what the parent sees) | pass | Sentry |
| B13 | Sheets off by default | unit B13 | pass | Fable |
| B14 | clean logs | unit B14, D8, P8; Sentry 3 | pass | Sentry |
| B15 | linked rows, beta told apart | Neon read on the deploy run | pass | Fable |
| B16 | no promised spot | Sentry 2a; Parent | pass | Parent |
| B17 | no kid data in a URL, GA4, Meta | Sentry 2e: GA4 `beta_wizard_step {step}` x3 and `beta_wizard_complete`, Meta PageView only, Clarity event only | pass | Sentry |
| Drop-off P1 to P8 | capture, forward-only stage, done on completion, sibling restart, filtering, failures silent | unit P1 to P8; deploy pv3 (stopped after expectations: stage "expectations", next "Player card"); Sentry 2d restart matrix | pass | Sentry |
| N3 | existing steps unchanged | 54 route tests untouched and passing; route diff is three additive edits; Sentry 2h | pass | Sentry |
| N4 | cookie only on beta paths | unit betaSource; Sentry C1 to C3; deploy curl | pass | Sentry |
| N5, N7 | no event or post on load, autofill, scroll, Back, failure; previews write nothing; QA beacons blocked | Sentry 2b, N7, OFF (offender set empty) | pass | Sentry |
| M1 to M6 | measurement rows | Sentry 2e and J1 dumps; `docs/season-one-tracking.md` section. GA4 DebugView and Meta Test Events were not opened: the pages' saves are ekuzo.gg only, so the live check after release is the proof (row L-3) | pass on the harness; live row pending | Sentry |
| Suite | full test suite | 660 tests: 655 pass, 1 skipped (same skip as on main), field-vitals 5 of 5; tsc clean; next build clean | pass | Fable at 7a37e34; Sentry at a386ee5 (653) |
| Migration | 0006 | test branch 19:42 and 20:07; production 20:24 read back (cleanup ledger C8) | pass | Fable |
