---
date: 2026-11-09
slug: timestamps-from-the-clock
source: ekuzo-web Build Loop run docs/s1-cls-field-2026-11 (03-decision-log.md, four clock-fix commits)
target: company/agents/agent-loop/build-loop.md § artifacts (the paragraph on embedded git evidence), and system/methodology/conventions.md
status: pending
---

# Lesson: every timestamp in an artifact comes from a clock read, not an estimate

## What happened

Fable wrote estimated times into the decision log and a brief four times (13:52 for 13:46, 13:50
for 13:26, 13:40 for 13:21, 15:58 for 15:55, 16:12 for 16:09) and corrected each after reading `date`. Earlier in the
same run the Phase 1 artifacts carried 11:45 and 12:10 for about 10:25. None changed a decision, but
a decision log is a record and a wrong time in it is a false record.

## Candidate prose (append to the embedded-evidence paragraph)

Every timestamp written into an artifact (a decision log entry, a ledger row, a brief header) comes
from a clock read in the same tool call (`TZ=America/Chicago date +%H:%M`), never from an estimate of
how long the previous step took. Long tool calls feel longer than they are; model turns feel shorter.
(2026-11-09: seven estimated times in one run, all wrong by 3 to 85 minutes, each corrected by a
follow-up commit.)
