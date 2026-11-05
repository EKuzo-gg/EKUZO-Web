# Fail-closed analytics guard (Sentry B)
Every Playwright context is created through `lib.mjs` `newCtx()`, which installs `ctx.route("**/*")` before any page exists.
Blocked hosts (fulfilled 204, counted, request URL logged): google-analytics.com, googletagmanager.com, clarity.ms, facebook.com/tr, connect.facebook.net (doubleclick.net kept from the CLS script too).
Any matching request, in any frame or worker, hits the route handler from the first request; the count is written to results.md per run set.
/api/season-one is stubbed with page.route in every case (no request reaches the server). Pixel stubs (fbq, gtag, clarity) via addInitScript record calls.
