---
date: 2026-11-09
slug: readout-windows-split-at-releases
source: ekuzo-web Build Loop run docs/s1-cls-field-2026-11 (00-phase0-field-truth.md)
target: .claude/skills/ads-readout/SKILL.md (the Clarity and performance section) and company/marketing/season-one readout notes
status: pending
---

# Lesson: a readout performance number that spans a release is two numbers

## What happened

The 11-05 and 11-06 daily reads reported d18/d19 CLS of 0.70 to 0.75 from Clarity's "Last 3 days"
performance panel. The fix had shipped on 11-05 at 10:51 and 11:35 CT, so the panel mixed pre- and
post-release sessions for three days and the readout kept recommending a fix that was live.

## Candidate prose

When a Core Web Vitals or error number in a readout spans a release of the page it measures, the
readout names the release time (from the WORKLOG or the build marker `<meta name="s1-build">` on
the live page) and reports the number twice: before and after. Clarity's performance panel has no
release filter, so use the Recordings view with the CLS, LCP or INP filter and the date range
starting at the release; a "last 3 days" score is not a verdict on a page that changed inside it.
