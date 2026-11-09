---
date: 2026-11-09
topic: Season 01 landing: field truth, load speed, checkout fix, field-vitals harness, ads and payment evaluation (Build Loop, Fable as lead)
tool: cowork (cloud session; Jamie traveling, laptop closed after 10:10)
duration: about 7.5 hours, 09:40 to about 17:15 CT; Jamie present for questions and the plan until 10:10, then by phone
---

# Session debrief: 2026-11-09, Season 01 landing run (docs/s1-cls-field-2026-11/)

## What we covered
- Brief: fix the d18/d19 layout shift on phones ("Clarity around 0.7"), full Build Loop, nothing else
  broken, load effectively, evaluate the ads and payment system. Phase 0 in Clarity (Jamie's browser,
  09:55 to 10:10) showed the shift already closed by the two Nov 5 releases: 0 poor-CLS sessions of 185
  scored in three days; the readout's 0.7 came from a "last 3 days" window that still held pre-release
  loads. Re-aimed plan approved 10:03 ("let's go"): prove-and-harden stability, load speed on in-app
  browsers, three red-team lenses on ads and payment, ranked by sign-ups and money.
- Shipped to ekuzo.gg 15:23 CT (`main` 45dfe97 to 19b9963): head bootstrap on the landing (one
  preload per ad for the LCP image, per-ad Google Fonts, the all-families link out of the body, build
  marker, Clarity mask attributes, lazy avatar, fetch timeout, sentinels), the M-1 checkout fix (three
  declines no longer dead-end), and the `scripts/field-vitals/` harness. Pixels identical to Aaron's
  design (66 pairs, Steward PASS). Live at Slow 4G with tags blocked: LCP d18 2.16 s to 1.0 to 1.5 s,
  d19 2.84 to 1.72 s; dev CDN N=5: d18 1.35, d19 1.73, d2 1.61 s; CLS unchanged under 0.004.
- Harness proof (H7): the pre-fix page `3433a5b` reads windowed CLS d18 0.68 and d19 0.61 in 5 of 5
  runs with the field's shift source; main reads under 0.004. Failure profiles on main documented
  (fonts stall blanks the page; small-script throw brings the jump back; big-script failure kills the
  forms).
- One QA-found defect fixed in the run (SA-1): two hero preloads on d19 shared the link; one preload,
  LCP element first (D24). Diagnosis also found the local lab serves the HTML uncompressed (D25).
- Evaluation: `06-findings-ranked.md` (money M-1 to M-14, users U-1 to U-19, ops O-1 to O-16); three
  questions for Jamie (outbox failure alert to Discord, wallet hint inside in-app browsers after his
  S25 check, daily canary scheduled task).
- Roles: Scout, Relay (sonnet), Chronos (opus), Atlas (opus, two cycles), Parent, Steward, Sentry A and
  B (sonnet), Auditor (sonnet). Lanes merged by Fable; artifacts in `ekuzo-web/docs/s1-cls-field-2026-11/`.

## Decisions made
- D1 to D28 in `ekuzo-web/docs/s1-cls-field-2026-11/03-decision-log.md`. Jamie's: the re-aim (D2),
  pixel parity as clone (D6), standing go for main (D21, "push to prod assuming it passes all tests").
  Fable's most overrulable: one preload per ad (D24), d8's pre-existing 0.10 CLS accepted (D26), HC1
  after the push (D21), self-hosted fonts deferred (D12), L4 900 px variant dropped under the clone
  rule (D16, Aaron's call).

## Knowledge captured
- In the repo: `WORKLOG.md` entry; `docs/dev-runbook.md` (cloud pushes now possible; dev-integration
  merge as run); `docs/learning-log.md` (one preload per ad; gzip lab artifact); the harness README.
- In the KB (filed from this debrief): six lessons-pending candidates (below); this debrief; the daily
  log.

## Open threads
- HC1 Jamie (S25, Instagram, d19) and HC3 Aaron (iPhone) after the push; a thumbs-up or a revert.
- Three questions for Jamie in `07-review-guide.md` (M-2 Discord alert, M-3 wallet hint after HA6,
  O-12 daily canary).
- Aaron's items (no action today): team-walk-1600 weight on d19/d21 (16c), S2 attributes on `img.jb`
  (SB-1, SA-5), Privacy Policy link on the landing (U-9), sticky "Save their spot" reads as text,
  "Weekly practice" vs twice a week (on record since 11-05), `.ih-opts` reserved height on d8 (D26).
- This-week code items (Jamie's lane): M-2 outbox alert, M-4 waitlist API test mode, O-10 quiet/429
  events, M-13 CAPI validation, M-5 re-commit before confirm, OR-H1 gzip proxy for the lab.
- Clarity holds about nine localhost sessions from 14:30 CT (SA-2); exclude `localhost:3101` in the
  11-10 readout.
- `dev` has the integration merges `4635c89` and `91f5503`; `main` must never merge into `dev`.

---

## Required: learning loop extraction

### What worked, default it
- Twenty minutes of field truth in Clarity before the plan re-aimed the whole day; the thing to fix was
  already fixed → `company/agents/agent-loop/build-loop.md` § Phase 0 (lesson file
  `2026-11-09-field-truth-read-before-a-fix-brief.md`).
- Proving the harness on the true pre-fix commit (H7) before trusting any of its numbers; the earlier
  loops had measured an already-fixed commit as "before" → `build-loop.md` § evidence (keep as a
  harness gate; no new rule, the requirement H7 is the pattern).
- Sentry's interim report after the first gate block, so the dev push and the rework could start while
  the rest ran → `build-loop.md` § phase 4 (lesson: "QA writes an interim after the release gate
  block"; folded into the review guide, no separate file).
- The build marker `<meta name="s1-build">` from `COMMIT_REF`: live and dev proof became a grep →
  `ekuzo-web/docs/dev-runbook.md` (done in the repo).

### What didn't, avoid it
- `npx next start` leaves a `next-server` child after `kill`; a lane committed the server log and pid
  files → `build-loop.md` § Servers in a brief (lesson `2026-11-09-next-start-by-binary-and-child-pid.md`).
- URL-glob analytics stubs let the real Clarity tag load from localhost (nine stray sessions) →
  `build-loop.md` § Fail-closed analytics gate (lesson `2026-11-09-class-q-stubs-by-host-regex-with-offender-check.md`).
- Local `next start` is uncompressed; a lab load-order verdict (L5) failed for a reason production
  does not have → `system/methodology/environment-notes.md` (lesson `2026-11-09-local-next-start-is-uncompressed.md`).
- Fable wrote estimated timestamps six times → `build-loop.md` § artifacts (lesson
  `2026-11-09-timestamps-from-the-clock.md`).
- The readout reported a rolling-window CLS across a release → `.claude/skills/ads-readout/SKILL.md`
  (lesson `2026-11-09-readout-windows-split-at-releases.md`).
- Fable first told Jamie the old lab "never reproduced" the shift; Scout showed it had (Fable had read
  the wrong "before" column). Corrected in the artifacts and to Jamie within ten minutes. No rule; the
  existing "a number names the thing that produced it" rule covers it, and the miss was reading, not
  filing.

### Candidate rule updates
Six files in `system/loops/lessons-pending/` dated 2026-11-09, each with the exact prose and target
section: `next-start-by-binary-and-child-pid`, `class-q-stubs-by-host-regex-with-offender-check`,
`field-truth-read-before-a-fix-brief`, `readout-windows-split-at-releases`,
`local-next-start-is-uncompressed`, `timestamps-from-the-clock`. Proposed to Jamie by message at session
end; the weekly run picks up any without an answer.
