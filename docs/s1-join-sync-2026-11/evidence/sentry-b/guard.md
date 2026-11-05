# Sentry B analytics guard (fail-closed)

Every Playwright context in lane B is created through `common.mjs` (scratch: /tmp/claude-0/sentry-b-scratch). Before any request, a context-level route fulfils 204 for google-analytics.com, googletagmanager.com, clarity.ms, facebook.com/tr, connect.facebook.net, and counts each hit. The same list (plus doubleclick.net, in measure-cls.mjs) is used for the CLS runs.

Probe run (guard.mjs, 2026-11-05): page loaded from localhost:3100, then five fetches, one per host. All five were intercepted (blocked count 5, each URL recorded); the page itself made no real call to any analytics host. Tags do not load on localhost, so window.fbq, window.gtag and window.clarity are recorder stubs injected with addInitScript (calls pushed to window.__rec).

Per-check blocked counts are in results.md.
