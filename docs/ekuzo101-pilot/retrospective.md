# Agentic Loop Retrospective — EKUZO 101 Summer Pilot

**Date:** 2026-07-15  
**Loop:** Brief → Fable → Workflow (8 agents) → Fable cleanup → commit → push  
**Wall clock:** ~18 minutes of agent execution, ~5 minutes of Fable setup  
**Output:** 27 files, 3,810 insertions, live integration test passed, branch pushed

---

## What worked

### 1. The brief is the most leveraged artifact

The build prompt was ~160 lines covering locked decisions, a done-work map with exact file paths and line references, a per-role spec, a phase plan with gates, and an open-flags section Jamie could overrule on return. Every dollar of quality in the output traced back to specificity in the brief. The "§5 Done work" section alone saved the Scout phase — agents could skip rediscovery and go straight to implementation.

**Pattern:** Brief quality determines output quality linearly. Time spent tightening the brief compresses at roughly 3:1 on agent execution time.

### 2. Artifact-on-disk principle held

No agent carried context from another agent's chat. Every handoff was a file read. When Relay needed to know the week computation format, it read `lib/ekuzo101-weeks.ts`. When Atlas needed copy, it read `copy-deck.md`. When Sentry needed the acceptance criteria, it read `01-requirements.md`. This meant agents could be ephemeral without losing state, and the workflow could theoretically be paused and resumed from any phase.

**Pattern:** An agentic loop is only as reliable as its artifact discipline. If something isn't in a file, it didn't happen.

### 3. Parallel execution on genuinely independent work

Story (copy) and Chronos (week picker logic) had no dependency on each other and ran in parallel. This saved real wall-clock time. The Workflow tool's `parallel()` made this concrete.

**Pattern:** Map the dependency graph before writing the workflow. Independent work should always fan out.

### 4. Live integration test caught what code review can't

D-002 (weeks_label missing from Beehiiv) was only found because Sentry hit the real API with a real payload. The issue — Beehiiv silently drops custom fields that don't exist in publication settings — is documented behavior, but no amount of static analysis would have surfaced it. The live test was the gate.

**Pattern:** For integrations with external services, live tests are non-negotiable. Mocks would have missed this.

### 5. Sentry never fixes what it finds

The "author ≠ verifier" rule meant Sentry's findings were clean and precise. Fable's post-run cleanup (D-001 spec conflict, D-003 em-dash) took about 10 minutes precisely because Sentry had been exact about what was wrong and where. If Sentry had tried to fix things mid-run, it would have introduced noise and the fixes might not have matched Fable's intent.

**Pattern:** Separation of roles is a quality mechanism, not bureaucracy. The verifier never touches the code.

### 6. The frozen spec let Phase 3 parallelize

Because Relay wrote a POST contract (request shape, response shape, fulfillment steps) and it was frozen before Atlas started building pages, Atlas could build the register page's submit handler against a spec rather than waiting for Relay to finish the actual route. This is the core benefit of the Phase 2 → Phase 3 dependency structure.

**Pattern:** Freeze the API contract before parallel implementation. The contract is cheap to write and prevents the most expensive rework (pages built against the wrong API shape).

### 7. Open flags for the returning human were explicit

The "most-overrulable first" ordering in the decision log gives Jamie a clear triage. He doesn't have to read everything — the first item is the one most likely to warrant a change, and the last item is the most locked-in. The Cowork session prompt carries this order forward.

---

## What didn't work

### 1. The review guide was written in parallel with adversarial testing — and was immediately stale

The docs agent ran alongside Sentry's adversarial pass, so `07-review-guide.md` reflected the pre-fix defect state. It listed D-001, D-002, and D-003 as "not done (deferred to human)" when D-001 and D-003 were resolved by Fable before the commit. Jamie reading that guide would get a misleading picture.

**Fix:** The review guide must be the final artifact, written after all defect resolution is confirmed. The workflow phase order should be: implement → QA → repair → adversarial → THEN docs. Never parallel.

### 2. D-002 should have been pre-documented, not discovered as a defect

The Beehiiv "silently drops unknown custom fields" behavior is documented in `CLAUDE.md` and `beehiiv-config.md`. Fable knew weeks_label was a new field that didn't exist in the publication settings. It should have been listed in the frozen spec as "Jamie must create this custom field before launch" — in the same section as the Klaviyo setup checklist. Instead it surfaced as a MAJOR defect in Sentry's QA run, which is technically accurate but creates noise: a defect that looks like a code bug is actually a known infrastructure gap.

**Fix:** Add a "pre-flight infrastructure check" to Phase 2. Relay verifies which Beehiiv custom fields already exist (one API call). Known gaps go into the frozen spec as Jamie-action items, not into the defect log as code bugs.

### 3. Unit tests were written but never executed

Chronos wrote `lib/__tests__/ekuzo101-weeks.test.ts`. The tests are in the commit. But no phase confirmed they actually pass. If the test runner requires a setup step (vitest, jest config, or a specific npm command), they might be silently broken.

**Fix:** Phase 4 (QA) should include an explicit `npm test` or equivalent. If no test runner is configured, that's a flag to surface — don't just write tests and move on.

### 4. Screenshot evidence never materialized

The brief called for `{page}-{viewport}-{state}.png` screenshots per page per state. The `docs/ekuzo101-pilot/screenshots/` directory exists and is empty. Sentry's QA pass used curl and grep — good for functional verification, not enough for visual QA or responsive layout.

**Fix:** Atlas should take screenshots using the browser tools (playwright or preview tools) immediately after building each page. Sentry's QA run should explicitly include 1440px and 375px screenshots of the key states (landing, empty picker, 3-selected-error, filled, success). This is the only way to catch visual regressions without a human in the loop.

### 5. Copy fidelity from copy-deck.md was unverified

Story wrote the copy deck. Atlas said it "pulled from copy-deck.md." But no agent checked that the landing page copy actually matches what Story wrote. Atlas might have paraphrased or invented copy that violates voice rules. Without a copy-fidelity verification step, we're trusting Atlas to faithfully transcribe.

**Fix:** Add a post-Atlas verification step: a diff between copy-deck.md phrases and `app/programs/ekuzo101/page.tsx` rendered text. Or Steward reviews the rendered page against the copy deck, not just against brand guidelines.

### 6. The Cowork handoff prompt was an afterthought

Jamie asked for it after the session closed. It should have been part of Phase 7 ("completion decision") per the brief — Fable writes the review guide AND the cowork handoff as terminal artifacts. Leaving it out meant an extra prompt and an extra round of reading.

**Fix:** The Cowork session prompt template belongs in the Phase 7 / review guide phase. It's not optional.

---

## Structural learnings for next time

### On the brief

- **Lock decisions before the brief goes out.** The "§4 Decisions locked with Jamie" section is the most important part of the brief. Unlocked decisions that surface during implementation create spec-change log entries and slow down agents. Do the decision session with Jamie first, then write the brief.
- **Include exact line references for patterns to clone.** The "E100 register page: 1226 lines, cohort picker at getCohortSessionDates" level of specificity lets agents skip discovery entirely. Worth the 10 minutes to write.
- **Name the allowed diff explicitly.** R30 initially forgot to list the Stripe webhook file as an exception even though R9 required a change to it. Every protected file AND every allowed exception needs to be named.

### On the workflow structure

- **Review guide goes last, always.** Phase order: implement → QA → repair cycles → adversarial → review guide + Cowork prompt. Never in parallel with anything.
- **Add a pre-flight phase.** Before implementation: check what custom fields exist in Beehiiv, what Klaviyo lists/flows exist, what Sheets column headers are live. Document gaps as Jamie-action items, not code tasks. This is a 5-minute Relay job that prevents a class of false MAJOR defects.
- **Explicit screenshot phase.** Atlas takes screenshots at 1440px and 375px per page per key state. These go in `screenshots/` and are required artifacts for Phase 4 gate.
- **Execute the tests.** If tests are written, they must be run in the same phase, not deferred.

### On roles

- **Sentry is the truth-teller, not the scope judge.** D-002 was accurate (field missing) but classified at the wrong severity (MAJOR vs INFO/Jamie-action). A defect log entry should distinguish between "code bug" and "infrastructure gap." Add a column: `Type: code-bug | infra-gap | accepted-risk`.
- **Steward and Parent review the rendered experience, not the code.** In this run they reviewed copy deck text, not screenshots of the actual rendered pages. That's a weaker signal. Give them screenshots.
- **The Cowork handoff agent is Fable, not a separate role.** The person who made the decisions writes the guide. Don't delegate the review guide to a generic docs agent — Fable should own it because Fable made the decisions and can explain the rationale.

### On the meta-pattern

The agentic loop works best when:
1. The brief is precise enough that agents don't need to interpret
2. Artifacts are the handoff medium, not chat state
3. Roles are cleanly separated (author ≠ verifier; Fable ≠ docs agent)
4. Live integration tests run against real services, not mocks
5. The human sees a review guide that reflects the final state, not a snapshot from mid-run
6. The Cowork handoff is a first-class artifact, not an afterthought

The loop fails when:
1. The brief leaves decisions unlocked
2. Phase parallelism races the docs against defect resolution
3. "Verified" means "I wrote tests" rather than "I ran tests and they passed"
4. Screenshots are deferred to the human
5. Infrastructure gaps are logged as code defects

---

## What to do next time (checklist)

- [ ] Decision session with Jamie before brief goes out — lock everything possible
- [ ] Brief includes: exact line references, explicit allowed-diff list, pre-flight infrastructure check section
- [ ] Phase order: implement → QA → repair → adversarial → THEN review guide + Cowork prompt
- [ ] Pre-flight phase: Relay checks existing Beehiiv fields, Klaviyo objects, Sheets columns — documents gaps as Jamie-action items
- [ ] Atlas takes screenshots after each page (1440px + 375px, key states)
- [ ] Phase 4 includes: `npm test` execution (not just test-file existence)
- [ ] Defect log has a Type column: code-bug | infra-gap | accepted-risk
- [ ] Steward and Parent receive screenshots, not just copy deck text
- [ ] Review guide is Fable-authored, runs last, reflects post-repair state
- [ ] Cowork handoff prompt is part of Phase 7, not a post-session request

---

# Addendum — Cowork review session (2026-07-15, same day)

Jamie's review session extended this log the same day. The review revealed
that §4 and §5 above understated the problem: the gap was not missing
screenshot evidence, it was a wrong interpretation of the visual spec that
no gate could have caught because no gate existed for it.

## What the review actually found

- **The landing page missed entirely.** Jamie expected an effective clone
  of the camps v2 page with copy changes. The build delivered a 353-line
  original design against camps' 1,666 lines. Rebuilt in the review session
  as a literal camps clone, then refined through a copy pass (kid+parent
  dual audience; fun first).
- **The week picker missed the same way.** Brief said "adapt the e100
  calendar tile visual language"; the build shipped card tiles, not a
  calendar. Rebuilt three times in session (camps-style calendar → single
  continuous week-row calendar → availability calendar per Jamie's
  wireframe: month cards, week-row pills, range/counter banner).
- **A hydration defect shipped undetected.** The register page's
  page-level `<form>` wrapped the Footer, nesting the newsletter `<form>`
  inside it - invalid HTML, hydration failure on every load. Found only
  because the review session loaded pages in a real browser and read the
  console. No loop phase ever did either.
- **Product-model corrections the brief never surfaced:** sessions are
  7:00-8:30 PM LOCAL time, not ET (copy swept); no "same teammates/same
  coach" promises (availability model is drop-in friendly); squads were
  declared out of scope in brief §6 but were actually a launch requirement
  (anchor family bringing 10-15 kids) - built in session as an
  availability-affiliation model (link groups families, never locks
  schedules). A sharper 10-minute decision session on the product model
  would have surfaced all three.

## Root cause (extends §4/§5)

1. **Gates shaped the output.** Every requirement with a mechanical gate
   (tsc, grep, curl, build) shipped correct. Every requirement that needed
   eyes shipped at the minimum defensible interpretation. The loop
   optimized for exactly what its gates measured.
2. **"As baseline" / "adapt the visual language" is load-bearing
   ambiguity.** It reads as a constraint to the brief writer and as a
   suggestion to the builder.
3. **No role owns "does it look right."** Ten roles; Sentry verifies text,
   Steward reviewed copy against brand guidelines, nobody compared the
   built page to the reference.
4. **The Clarity Gate ran per-project, not per-surface.** The brief was
   deep on backend (author's comfort zone) and thin on frontend; the
   backend depth made the whole brief feel thorough, hiding the asymmetry.

## Rules adopted (supersede/extend the checklist above)

1. **Reference-relationship rule (briefs).** Every visual deliverable names
   a reference artifact and declares exactly one relationship:
   `clone` (only listed deltas allowed) | `adapt` (list what may differ) |
   `new-design` (mockup approved before build). "As baseline" and
   "inspired by" are banned phrases in briefs.
2. **Visual parity gate (loop).** Side-by-side screenshots of built page vs
   reference (1440px + 375px) go in the evidence ledger, and a role
   (Steward) judges them against the declared relationship. "Screenshots
   exist" is not the gate; "screenshots match the declared relationship"
   is.
3. **Browser-truth gate.** Every page is loaded in a real browser during
   QA; the console must be free of errors (hydration failures fail the
   gate). curl + grep is not page verification.
4. **Clarity Gate per surface.** Rate Goal/Constraints/Success-criteria
   separately for frontend, backend, copy, and data. The thinnest surface
   gets the questions - this directly counteracts author-comfort bias
   (Jamie specs backend deep; Aaron would invert).

## North star (Jamie, verbatim intent)

**Less human checking, more matching human expectations out of the gate.**
The copy-feedback round in the review session (hero options, FAQ wording,
step copy) is the intended kind of human pass - taste and voice. The
structural rebuild was not. Success for the next loop: the human review
touches only copy and product judgment, never structure. Consequence for
the loop design: no hard mid-build human checkpoints by default; instead,
gates strong enough that the ledger review is sufficient.
