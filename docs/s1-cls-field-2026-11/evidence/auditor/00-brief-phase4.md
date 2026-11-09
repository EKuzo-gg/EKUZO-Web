# Auditor brief, phase 4 (Fable, 2026-11-09)

You are the Auditor in the Build Loop run `docs/s1-cls-field-2026-11/`. Your phase 1 sign-off is
`auditor-phase1.md`; the ledger skeleton you left is `04-evidence-ledger.md`. Now fill it from the
lanes' evidence and write `05-defect-log.md`. You read and cross-check; you run no browsers and no
servers. Every row you write cites a file that exists in the repo at the commit you work on
(check with `test -f`); a row whose evidence file is missing is marked **UNEVIDENCED**, never
filled from a hand-back summary.

## Inputs (all under `docs/s1-cls-field-2026-11/`)

- Requirements and spec: `01-requirements.md` (ids H1 to H9, S1 to S5, L1 to L7, M1a to M3, N1 to N8,
  E1 to E4, J1 to J11, X1 to X17, HC1 to HC5, D1 to D4, P1 to P6), `02-frozen-spec.md` (slices,
  pre-flight, HA items), `03-decision-log.md` (D1 to D25; a decision can close a requirement as
  accepted-risk or re-aimed).
- Relay: `evidence/relay/hotfix-m1.md` (M-1 fix, tests), `evidence/relay/preflight.md` (HA table),
  `evidence/relay/dev-integration-runbook.md`, `06-cleanup-ledger.md`.
- Atlas: `evidence/atlas/self-test.md` (Slice 2, pixel parity 66 pairs, load order, behaviour),
  `evidence/atlas/rework-d24.md`, `screenshots/`.
- Chronos: `evidence/chronos/self-test.md`, `evidence/vitals/h7-proof.md`, `h7-ladder.md`,
  `failures-main.md`, and the tables under `evidence/vitals/*/table.md`, `manifest.json`,
  `blocked.json`.
- Sentry A: `evidence/sentry-a/interim.md`, `interim2.md`, `results.md`, `defects.md` and its JSON.
- Sentry B: `evidence/sentry-b/results.md`, `defects.md`.
- Parent and Steward: `parent-review.md`, `steward-review.md`.
- Fable: `evidence/fable/preload-competition.md`, `evidence/fable/h2probe-*.json`,
  `06-findings-ranked.md`.
- Red-team files for the E1 to E3 structure check: `redteam-money.md`, `redteam-users.md`,
  `redteam-ops.md`.

## Output 1: `04-evidence-ledger.md`

One row per requirement id, columns: id, requirement (short), test or method, evidence path(s),
result (PASS, FAIL, PARTIAL, N/A with the decision id, UNEVIDENCED, PENDING with what it waits
for), verified by (the lane that produced the evidence and, where another lane checked it, that
lane too). Keep the skeleton's grouping. Rules:

- A number in the ledger is copied from the cited table, never rounded differently.
- Where two lanes disagree, write both numbers and the file of each, and flag it for Fable.
- Where a requirement ran at a reduced N or tier, say so (S1 Tier 2 N, S1b profiles, failure
  profiles at N=2).
- L1 and L5: cite the local result and the dev result separately; D25 says the dev result decides
  L1 and names the local artifact.
- HC1 to HC5 are PENDING with the person named. P6 is PENDING until Fable records the live marker.
- Add a short "Coverage" paragraph: what ran, what did not, and why (from the Sentry did-not-run
  lists).

## Output 2: `05-defect-log.md`

Columns: id, found by, severity (blocker, major, minor), type (code-bug, infra-gap, accepted-risk,
process), what, where, owner, cycle count, status (open, fixed, accepted, deferred), retest
evidence. Sources: Sentry A `defects.md` (SA-n), Sentry B `defects.md` (SB-n), Atlas's lists "for
Fable", Chronos's findings 1 to 9, Steward F-n, Parent findings, D19 (the preconnect placement,
fixed in 2b9bc16), SA-1 (fixed by D24, retest in `interim2.md` and Sentry B), and the Fable L5
read. Accepted items cite the decision id. Do not add findings of your own to this file; put any
new observation in a "Auditor notes" section at the end.

## Output 3: structure check of E1 to E3

A short table: for each red-team file, does every finding have id, severity, type, effect,
location (file:line or command), proposal and who acts? List missing cells by finding id. Put it
at the end of the ledger.

## Rules

Commit on branch `lane/auditor` cut from the commit Fable names in the launch message, in the
worktree Fable names. Never push. Prose: no em dashes, no "It's not X, it's Y" reframes,
sentence-case headings. Hand back with: counts (PASS, FAIL, PARTIAL, N/A, UNEVIDENCED, PENDING),
every FAIL and UNEVIDENCED row quoted, the defect totals by severity and status, and the commit list.
Nothing about the user goes to memory.
