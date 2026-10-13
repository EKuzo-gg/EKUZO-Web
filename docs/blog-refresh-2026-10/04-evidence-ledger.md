# Evidence ledger

Requirement IDs from `01-requirements.md`. Verified-by is never the role that built it.

| Req | Test | Evidence | Result | Verified by |
|---|---|---|---|---|
| A1.1 (as changed by Jamie: "Updated [date]" on every post) | Rendered byline text, 11 posts; phone byline crops | `evidence/sentry/results.md` R2, Retest 1 T1, T6; `screenshots/r2-byline-*` | Pass | Sentry |
| A1.2 | Byline, JSON-LD, og, sitemap, cards agree per post | `evidence/sentry/results.md` R2 table, Retest 1 T6 | Pass | Sentry |
| A1.3 | K1NG and conquering sitemap dates | same table | Pass (2026-10-13, text changed) | Sentry |
| A1.4 | Dates moved only where text changed | `evidence/sentry/results.md` R2; D-2 | Pass; military and Fortnite unchanged by decision | Sentry, Fable |
| A2.1 | One ProgramLine definition; no EKUZO100, camps link or price in the six bodies | `evidence/atlas/results-3.md` step 7 grep; `evidence/sentry/results.md` R5 | Pass | Sentry |
| A2.2 | Muhammad's posts: only keep-reading arrays changed | `evidence/sentry/results.md` R6 | Pass | Sentry |
| A2.3 | `program-references.md` exists | file | Pass (written by Fable from Scout § 2) | Auditor role not spawned; Fable |
| A3.1 | New slug, permanent redirect, old slug only in the redirect, inbound links | `evidence/sentry/results.md` Retest 1 T2, T5 | Pass (308 in one hop; 5 inbound) | Sentry |
| A4.1 | Karlin page: name line, sentence, `sameAs`, `alternateName` | Retest 1 T4; `evidence/leaguepedia-faith.md` | Pass | Sentry; Leaguepedia read by Fable |
| A4.2 | Karlin page lists gaming-study | Retest 1 T4 | Pass | Sentry |
| A5.1 | No dangling `@id`; guest nodes resolve | R4, Retest 1 T6 | Pass | Sentry |
| D1 | Jamie's bio equals the final file byte for byte; no "CEO" for Jamie | `evidence/atlas/results.md` comparison; R4 grep | Pass | Sentry (grep, jobTitle); byte comparison is Atlas self-evidence, re-run by Fable below |
| D2 | KB role records | `knowledge-base` diff: `ekuzo-messaging-voice.md`, `about-me.md` | Done | Fable |
| B1 to B9 copy fidelity | Rendered text vs approved copy, both directions | R1 (01, 02 at 100%; 03 to 08 all present), Retest 1 T2 (09: 66 of 66 passages, 12 of 12 links) | Pass | Sentry |
| Claims | Each copy file | `evidence/steward/*.md` | Approve, with retests | Steward |
| Voice gate | New em or en dashes, arrows in added lines | R5, Retest 1 T6 | Pass (zero new) | Sentry |
| Non-regression | Protected-path diff; Lisa and John scoped diffs | R6, Retest 1 T6 | Pass (empty; in scope) | Sentry |
| Browser truth | Console on 14 pages; new guide and Karlin page | R8; Fable's guarded run 2026-10-13 | 14 pages: no errors from our pages. New guide and Karlin page: no errors captured, method inconclusive, on Jamie's list | Sentry, Fable |
| Analytics guard | All browser runs with every non-local host unresolvable | command line at top of `evidence/sentry/results.md` | In place before first capture | Sentry |
| Tests | tsc; existing node tests | R7 | tsc pass; newsletter tests 34 of 34; `ekuzo101-weeks` fails on main too (D-4) | Sentry |
| Build | `next build`, `.next/server` size | `evidence/atlas/results-4.md`; Fable 2026-10-13 | Pass, 40M | Fable |
| Audience | Fresh-eyes read of rendered pages | `evidence/parent/results.md` | Findings triaged in `05-defect-log.md` § Fable's dispositions | Parent |
| Links opened and matched | External links in the new guide | Retest 1 T3; `evidence/camps-guide-research.md` § e to g | Provider pages read in a browser 2026-10-12; other posts' external links not re-opened in this pass | Sentry, Fable |
