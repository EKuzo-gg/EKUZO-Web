---
date: 2026-11-09
slug: class-q-stubs-by-host-regex-with-offender-check
source: ekuzo-web Build Loop run docs/s1-cls-field-2026-11 (Sentry A defect SA-2, 06-cleanup-ledger.md)
target: company/agents/agent-loop/build-loop.md § Fail-closed analytics gate
status: pending
---

# Lesson: Class Q stubs match by host, and every run ends with an offender check

## What happened

Sentry A's first beacon-equality run (nine page loads of `localhost:3101/season1?s1qa=1`) stubbed
analytics with URL globs such as `**/clarity.ms/**`. The glob does not match `www.clarity.ms`, so the
real Clarity tag loaded through the proxy and beaconed to `c.clarity.ms` and `c.bing.com`. About
nine short localhost sessions landed in the production Clarity project around 14:30 CT. GA4 and
Pixel were stubbed and sent nothing. The lane fixed the stubs to host regexes, added an offender
check, discarded the run and re-ran everything with zero offenders.

## Candidate prose (append to the fail-closed analytics gate paragraph)

In a QA-beacon (Class Q) script the stubs match by host regex (`/(^|\.)clarity\.ms$/`,
`/(^|\.)googletagmanager\.com$/`, `/(^|\.)facebook\.(net|com)$/`), never by URL glob: `**/clarity.ms/**`
misses `www.clarity.ms`. Every Class Q run ends with an offender check, the set of hosts that
answered from the network minus the allowed hosts (localhost, the two font hosts), and no beacon list
counts as evidence until that set is empty. The host resolver rules and the proxy bypass the harness
uses for Class T are the stronger gate; a Class Q script that must load the real tag scripts gets
the same resolver rules for the collect hosts. (2026-11-09: nine localhost sessions reached the
production Clarity project through a glob that did not match.)
