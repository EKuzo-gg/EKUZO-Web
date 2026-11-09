---
date: 2026-11-09
slug: local-next-start-is-uncompressed
source: ekuzo-web Build Loop run docs/s1-cls-field-2026-11 (D25, evidence/fable/preload-competition.md)
target: system/methodology/environment-notes.md (new section near "Stop servers by PID")
status: pending
---

# Lesson: the local lab serves the landing uncompressed, so load-order effects read 3.7x too big

## What happened

`next start` sends the route-handler HTML with no `content-encoding` (137 KB on the wire); Netlify
serves the same page gzipped at 37.6 KB. In the local lab the hero preloads shared a throttled link
with a 137 KB document and pushed the script's first long task back by up to 1.2 s; on the dev CDN
the document ended at 0.45 to 0.6 s with the same preloads. The L5 gate failed locally for a reason
production does not have, and one rework cycle went to the diagnosis.

## Candidate prose (new section in environment-notes.md)

## Local Next serves uncompressed HTML (observed 2026-11-09)

`next start` sends route-handler responses without `content-encoding`; Netlify gzips them (the
Season 01 landing: 137 KB local, 37.6 KB on the CDN). A lab measurement of load order (how early
image or font bytes delay the HTML and the inline scripts) therefore overstates the effect by the
compression ratio. Read load-order trade-offs on the dev deploy, or run the local server behind a
gzip proxy; keep the local lab for layout shift, forms and event checks. Two more container facts
from the same day: `ss` is not installed (use `fuser PORT/tcp` or `/proc/net/tcp`), and on the
2-core container a build or a second browser running beside a timing measurement adds noise, so
timing runs are serialized or the overlap is recorded in the evidence.
