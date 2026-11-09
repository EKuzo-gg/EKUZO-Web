---
date: 2026-11-09
slug: field-truth-read-before-a-fix-brief
source: ekuzo-web Build Loop run docs/s1-cls-field-2026-11 (00-phase0-field-truth.md, D2)
target: company/agents/agent-loop/build-loop.md § Unattended runs (Phase 0), and system/methodology/workflows.md § The Clarity Gate (Context row)
status: pending
---

# Lesson: a "fix X" brief starts with a field-truth read

## What happened

The brief asked to fix the d18 and d19 layout shift ("Clarity around 0.7"). Twenty minutes in
Clarity, filtered to sessions after the last release, showed zero poor-CLS sessions in three days:
two releases on Nov 5 had already fixed it, and the daily readout's "last 3 days" window still held
pre-release loads. The run was re-aimed at load speed, a regression harness and the evaluation, and
Jamie approved the re-aim before anything was built.

## Candidate prose (new paragraph at the start of Phase 0)

A brief that says "fix X" opens with a field-truth read before the plan: the analytics the symptom
came from, filtered to the window after the last release that touched the surface, with the release
timestamps beside it and the symptom's count in that window. If the window is clean, the brief is
re-aimed with the human before any build. The read is twenty minutes and it is the Context row of
the Clarity Gate for a repair brief. (2026-11-09: the brief's layout shift had been fixed four days
earlier; the readout's rolling window mixed pre- and post-release sessions.)
