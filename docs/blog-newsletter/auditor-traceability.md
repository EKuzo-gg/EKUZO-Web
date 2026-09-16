# Auditor traceability, Phase 7

Reviewer: Auditor. Inputs: 04-evidence-ledger.md, 05-defect-log.md, sentry-report.md, steward-review-rendered.md, parent-review-rendered.md, 02-frozen-spec.md (Spec-change log SC-01), 03-decision-log.md, 01-requirements.md, and a direct file listing of docs/blog-newsletter/ and docs/blog-newsletter/tests/ and docs/blog-newsletter/screenshots/ to check evidence existence on disk. 04-evidence-ledger.md was updated in place as part of this pass (T9 row added, T7 row corrected, P6 row given D11's disposition); the table below reflects the ledger after that update.

## 1. Requirement-by-requirement trace

"Exists on disk" is checked against a direct file listing, not against the ledger's own claim. "Verifier != author" checks that the role in "Verified by" differs from the role that built the requirement (Owner in 01-requirements.md).

| ID | Ledger status | Evidence path(s) | Exists on disk | Verifier != author |
|---|---|---|---|---|
| P1 | PASS | tests/sentry-output-p1-p2-p3-retest.txt, tests/sentry-output-p1-p2-p3-cycle2.txt, tests/sentry-output-cycle2.txt, screenshots/sentry-cycle2-sticky-blog-{768,820}-visible.png | Yes, all | Yes (Owner Atlas, Verified by Sentry) |
| P2 | PASS | tests/sentry-output-p1-p2-p3-cycle2.txt, tests/sentry-output-cycle2.txt | Yes, all | Yes |
| P3 | PASS | same as P1 plus screenshots/sentry-p3-sticky-{error,success}-375.png | Yes, all | Yes |
| P4 | PASS | tests/sentry-output-p4.txt, screenshots/sentry-p4-popup-at-50pct.png, tests/sentry-output-cycle2.txt | Yes, all | Yes |
| P5 | PASS | tests/sentry-output-p5-node-rerun.txt, tests/sentry-output-p5.txt | Yes, all | Yes |
| P6 | PASS-with-note (updated this pass) | tests/sentry-output-p6.txt, tests/sentry-output-cycle3.txt, 02-copy-deck.md lines 29 and 43, steward-review-rendered.md § B | Yes, all (deck annotation confirmed by direct read) | Yes (Owner Story/Atlas, Verified by Sentry; disposition is Fable's, applied to the ledger by Auditor, not self-verified) |
| P7 | PASS | tests/sentry-output-p7-p8.txt, screenshots/sentry-p7-popup-success-pending.png, tests/sentry-output-cycle2.txt, tests/sentry-output-cycle3.txt | Yes, all | Yes |
| P8 | PASS | tests/sentry-output-p7-p8.txt, tests/sentry-output-cycle2.txt, tests/sentry-output-cycle3.txt | Yes, all | Yes |
| P9 | PASS | tests/sentry-output-p9.txt, screenshots/sentry-p9-contact-select-1440.png | Yes, all | Yes |
| P10 | PASS | tests/sentry-output-routes-rerun.txt | Yes | Yes (Owner Relay, Verified by Sentry) |
| T1 | PASS | tests/sentry-output-routes-rerun.txt | Yes | Yes |
| T2 | PASS | tests/sentry-output-routes-rerun.txt | Yes | Yes |
| T3 | PASS | tests/sentry-output-routes-rerun.txt | Yes | Yes |
| T4 | PASS | tests/sentry-output-newsletterAb-rerun.txt | Yes | Yes (Owner Atlas, Verified by Sentry) |
| T5 | PASS | tests/sentry-output-t5-t6-t8-t9.txt | Yes | Yes |
| T6 | PASS | tests/sentry-output-t5-t6-t8-t9.txt, tests/atlas-tsc-eslint.txt, tests/relay-tsc-eslint.txt, tests/sentry-output-cycle2.txt, tests/sentry-output-cycle3.txt | Yes, all | Partial: Owner is "Atlas, Sentry" in 01-requirements.md, so Sentry is named as both a builder-side owner and the verifier of this row. Not a violation of "author never verifier" in the strict code-authorship sense (Atlas wrote the code Sentry is checking), but the requirement's own Owner field blurs the line; worth Fable's attention. |
| T9 | PASS (row added this pass) | tests/sentry-output-t5-t6-t8-t9.txt | Yes | Yes (Owner Atlas, Verified by Sentry) |
| T8 | PASS | tests/sentry-output-t5-t6-t8-t9.txt, screenshots/sentry-t8-zindex-stacking.png, tests/sentry-output-cycle2.txt, tests/sentry-output-cycle3.txt, screenshots/sentry-cycle3-t8-zindex-stacking.png | Yes, all | Yes |
| T7 | PASS (row corrected this pass) | steward-review-rendered.md § A; screenshots (sticky-camps, sticky-blog, popup-site, popup-blog, contact-before/after, all sizes) | Yes, all (steward-review-t7.md, the path the row named before this pass, does not exist and never did; the substance lives in steward-review-rendered.md instead) | Yes (Owner Atlas/Steward, Verified by Steward; Steward is not Atlas) |
| C1 | PASS | 02-copy-deck.md | Yes | Yes (Owner Story, Verified by Sentry) |
| C2 | PASS (mechanical portion) | described in the ledger as "direct grep of 02-copy-deck.md and welcome-email-thumbs.md against docs/marketing/anti-ai-writing-style.md section 3" | The two files being grepped exist; no saved output file for the grep itself exists anywhere in docs/blog-newsletter/ or docs/blog-newsletter/tests/, unlike almost every other mechanical row | Yes, but see gap below (no persisted artifact) |
| C3 | PASS | same pattern as C2, "direct grep" | Same gap: no saved output file | Yes, but see gap below |
| I1 | NOT TESTABLE HERE (file-existence only) | 02-frozen-spec.md § Pre-flight | Yes; section exists with the required content, dated 2026-09-16 | Yes (Owner/executor Fable, Verified by Sentry for file existence only; nobody re-verifies the live Beehiiv content itself, logged as a known limitation, not a violation) |
| I2 | NOT TESTABLE HERE (file-existence only) | 06-cleanup-ledger.md | Yes; content confirmed by direct read, matches D-11 in 03-decision-log.md | Yes, same caveat as I1 |
| I3 | PASS (files exist) | welcome-email-thumbs.md, 02-frozen-spec.md § Human-action items | Yes, both | Yes (Owner Story/Fable, Verified by Sentry) |
| N1 | PASS | tests/sentry-output-n1-n2-n4.txt, tests/sentry-output-n1-n2-n4-retest.txt, tests/sentry-output-cycle2.txt, screenshots/n1-before*.png, n1-after*.png | Yes, all | Yes (Owner Sentry per the ledger's own added column; Sentry verifies its own regression check, which is expected for this section, since N1 to N6 have no separate builder) |
| N2 | PASS | tests/sentry-output-n1-n2-n4.txt, screenshots/n2-popup-site-1440-open.png, tests/sentry-output-cycle2.txt, tests/sentry-output-cycle3-sitemode.txt, tests/sentry-output-cycle3-sitemode-diff.txt | Yes, all | Yes, same note as N1 |
| N3 | PASS | tests/sentry-output-routes-rerun.txt, tests/sentry-output-n6-git-diff.txt | Yes, all | Yes |
| N4 | PASS-with-note (D3) | tests/sentry-output-n1-n2-n4.txt | Yes | Yes |
| N5 | PASS | tests/sentry-output-routes-rerun.txt | Yes | Yes |
| N6 | PASS | tests/sentry-output-n6-git-diff.txt | Yes | Yes |

No row lists the same role as both builder-owner and verifier in a way that lets the author sign off their own work, except the T6 note above, which is a labeling ambiguity in 01-requirements.md's Owner field rather than an actual self-verification (the code under test is Atlas's, the console-clean check is Sentry's).

## 2. Requirements with no mechanical evidence

Every row above has a mechanical artifact behind it except the following, which rely on a named human checkpoint instead, exactly as 01-requirements.md's Gate column specifies:

- **T7** (Gate M+H): mechanical evidence is the screenshot pairs; the PASS/FAIL judgment itself is Steward's, in steward-review-rendered.md § A. Human checkpoint: Steward.
- **C1** (Gate M+H): mechanical evidence is the file's existence; whether the copy deck's content is actually right is Steward's judgment, exercised in steward-review-rendered.md § B and § C, not by Sentry. Human checkpoint: Steward.
- **C2** (Gate M+H): the em-dash/banned-word grep is mechanical; the voice judgment ("commitment voice, no urgency") is Steward's, in steward-review-rendered.md § B, "Mechanical lint on the rendered innerText" and the surrounding voice discussion. Human checkpoint: Steward.
- **I1, I2** (Gate M, but effectively human-gated by circumstance): the mechanical gate is file-existence; the actual live-Beehiiv work behind that file can only be done and attested by Fable on Jamie's machine, since this cloud checkout has no key. Human checkpoint: Fable.
- **D11's disposition** (not a formal requirement row, but a defect that needed a human call): "accepted, matches the site-mode reference; deck annotated" is Fable's judgment, not a mechanical test result. Human checkpoint: Fable, and independently, Steward reached the same conclusion on different grounds in steward-review-rendered.md § B ("the reference behaves identically, so parity holds and this is not a defect").

## 3. Defects

All 11 rows in 05-defect-log.md:

| ID | Status per 05-defect-log.md | Rationale present |
|---|---|---|
| D1 | fixed, verified | Yes |
| D2 | accepted-risk, closed | Yes (Fable's disposition, pre-existing style inherited from the ADAPT source) |
| D3 | accepted, not a defect; closed | Yes (Fable's disposition, stale before/after snapshot boundary, not introduced by this run) |
| D4 | fixed, verified | Yes |
| D5 | fixed, verified | Yes |
| D6 | fixed, verified independently | Yes |
| D7 | fixed, verified | Yes |
| D8 | fixed, verified | Yes |
| D9 | fixed, verified | Yes |
| D10 | fixed, verified independently | Yes |
| **D11** | **open, awaiting disposition, per 05-defect-log.md itself** | The coordinator's message to Auditor supplies the disposition ("Fable: accepted, matches the site-mode reference; deck annotated"), and that disposition is real and already executed: `02-copy-deck.md` carries the annotation at lines 29 and 43, confirmed by direct read. 04-evidence-ledger.md's P6 row has been updated this pass to record it. **05-defect-log.md's own D11 row has not been updated and still reads "open, awaiting disposition."** This is the one open item, and it is open only in the defect log's own bookkeeping, not in substance. |

Open defects: **one**, D11, and only in 05-defect-log.md's status column; its disposition exists and is applied in 04-evidence-ledger.md as of this pass. Recommend Sentry or Fable update 05-defect-log.md's D11 row to close the loop there too.

## 4. Spec-change log versus the ledger

02-frozen-spec.md's Spec-change log has one entry: **SC-01** (2026-09-16, Fable, on Steward's ruling): popup blog mode below `lg` may hide the mobile duplicate heading block, provided the 24px EKUZO logo still shows.

Reflected in the ledger: yes, across multiple rows. P7's notes say "on the repaired SC-01 layout"; T6's notes reference "the SC-01 layout"; T8's notes say "again unchanged after the SC-01 repair"; N2's notes confirm "every SC-01 class/branch is gated on isBlogPost/mode"; and P6's notes (updated this pass) tie D11 to SC-01 directly, since the deck annotation itself cites SC-01. T7's corrected row also carries SC-01's outcome by way of steward-review-rendered.md's A-note-3, which is the ruling that produced SC-01 in the first place. No gap here.

## 5. Mismatches between the reviews and the ledger

- **T7 (fixed this pass).** 04-evidence-ledger.md said "NOT GRADED (human checkpoint)" / "Steward (pending)" and pointed at `steward-review-t7.md`, a file that does not exist. steward-review-rendered.md, dated 2026-09-16 and re-judged after two repair cycles, already carries a final PASS (13 rows, 0 FAIL). The ledger has been corrected in this pass to point at the real file and record the real result.
- **sentry-report.md is stale relative to 05-defect-log.md and the (now corrected) 04-evidence-ledger.md.** sentry-report.md is dated Phase 4, 2026-09-15, and its Summary counts section grades P3, P6 and N4 as FAIL (citing D1, D2, D3) with no mention of D4 through D11, cycle 2, or repair cycle 2 at all. The ledger and defect log, both later, show P3 as PASS (D1 fixed and verified), N4 as PASS-with-note (D3 accepted), and P6 carrying a second, more recent finding (D11) that sentry-report.md predates and never mentions. Anyone reading only sentry-report.md would believe three requirements are still failing when the later record says otherwise. Recommend an addendum note at the top of sentry-report.md pointing to 05-defect-log.md and 04-evidence-ledger.md as the current status, so it is not read as final on its own.
- **parent-review-rendered.md predates the D6, D7, D9 and D-2 (double-ask) fixes and was never re-run.** It verdicts both popup variants NOT READY specifically because the submit button is cut off at 375 with no scroll (this is D6, logged fixed and independently verified in cycle 1), because both popups fire again after a sticky-bar signup already confirmed (this is D-2/D7 in Steward's and the defect log's numbering, also fixed and verified in cycle 1), and it separately reports that keyboard focus escapes the popup after two Tab presses, which directly contradicts D9's focus trap (also fixed and verified). Nothing in parent-review-rendered.md carries a repair-cycle marker the way steward-review-rendered.md does ("re-judged 2026-09-16 after repair cycles 1 and 2"), so it reads as a single, earlier pass left unrefreshed. Recommend either a second parent pass on the current build, or an explicit note in the review guide that parent-review-rendered.md's NOT READY verdicts are superseded, so a future reader does not treat a stale NOT READY as the current state.
- **An untracked finding.** parent-review-rendered.md flags, for both sticky-bar variants, that there is no way to dismiss the bar ("the only control in that strip is Try it... a thing I cannot decline does not match a message whose whole selling point is 'then you decide'"). This never became a defect-log row (D1 to D11 are all something else) and there is no requirement anywhere in 01-requirements.md asking the sticky bar to be dismissible (P2's acceptance criterion only covers scroll/footer/modal hiding, not a manual close control). It is neither fixed, nor accepted-risk, nor out-of-scope on the record; it has simply not been carried forward by anyone. Recommend Fable either log it as a defect with a disposition (fix, or accepted-risk with a reason) or add it to 02-frozen-spec.md's out-of-scope list, so it does not silently fall through.
- **C2 and C3 have no persisted evidence artifact.** Every other mechanical row cites a saved file under `docs/blog-newsletter/tests/`. C2 and C3's evidence path in the ledger is a narrative description ("direct grep of ... against ...") with nothing saved to disk. The two files being grepped exist, but the grep's own output does not, so the check cannot be independently re-run or inspected the way every other row's can. Minor, but worth a line item.

## 6. Verdict: gaps found, now partly closed

Three of the gaps below were fixed in this pass by editing 04-evidence-ledger.md directly, and are listed as done. The remainder need Fable's or Sentry's action outside this file.

Fixed this pass (in 04-evidence-ledger.md):
1. Added the missing T9 row (section B), which existed in 01-requirements.md as a Phase 2 amendment but had no ledger row at all.
2. Corrected the T7 row: was "NOT GRADED" pointing at a nonexistent file, now PASS pointing at steward-review-rendered.md § A, with the corrected screenshot list.
3. Applied D11's disposition to the P6 row: PASS-with-note, with the disposition text and the on-disk confirmation (02-copy-deck.md lines 29 and 43).

Still open, exact rows to fix, owner in parentheses:
4. **05-defect-log.md, row D11**: status still reads "open, awaiting disposition"; update to match the disposition now recorded in the ledger. (Sentry or Fable.)
5. **sentry-report.md**: add a note that it is a Phase 4 snapshot superseded by 05-defect-log.md's later cycles and 04-evidence-ledger.md's current status, so its FAIL grades on P3, P6 and N4 are not read as final. (Sentry or Fable.)
6. **parent-review-rendered.md**: either re-run against the current build or add a note that its NOT READY verdicts for both popup variants predate the D6/D7/D9 fixes and are superseded. (Fable, or a fresh Parent pass.)
7. **The sticky bar's missing dismiss control** (parent-review-rendered.md, both variants): log a disposition, fix or accepted-risk, anywhere on the record; currently untracked. (Fable.)
8. **C2 and C3**: save the grep's actual output to a file under docs/blog-newsletter/tests/ and cite it, matching every other mechanical row. (Sentry.)
