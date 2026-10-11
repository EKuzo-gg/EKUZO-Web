# Test isolation: interception and network guard (Sentry)

Rule: nothing may reach real Klaviyo, Meta, GA4 or Clarity collect endpoints.

## Server side (Klaviyo, Meta Graph)

`/home/claude/qa/intercept.cjs` is preloaded into both dev servers (`NODE_OPTIONS=--require`) and wraps `globalThis.fetch` before Next loads. Requests to a.klaviyo.com and graph.facebook.com are logged to `/home/claude/qa/outbound-<port>.jsonl` and answered locally (202 / `{"events_received":1}`). Env on both servers: KLAVIYO_PRIVATE_API_KEY=qa-fake, META_CAPI_ACCESS_TOKEN=qa-fake. Proof, one curl sign-up per server (run again at the end of the QA pass): each produced exactly three intercepted calls (POST a.klaviyo.com/api/events, POST a.klaviyo.com/api/profile-subscription-bulk-create-jobs, POST graph.facebook.com/v26.0/1284038230557204/events) and the HTTP response was `{"ok":true}`. Total intercepted outbound calls recorded: 140 (baseline) and 410 (build); hosts seen: {"a.klaviyo.com":373,"graph.facebook.com":177}. Nothing else left the server process.

## Browser side (GA4, Clarity, Meta)

Every browser context blocked connect.facebook.net and facebook.com/tr, and intercepted GA4 collect and Clarity collect requests in Playwright (recorded, decoded, answered 204 locally); gtag.js and clarity.js scripts loaded from the real network as allowed.

**Incident, disclosed:** I found part-way through that Playwright's request interception does not see requests the browser issues while a page is being torn down (a GA4 `user_engagement` fetch and Clarity's `pagehide` `sendBeacon` showed up as aborted/unrouted when a context closed). Before I added the guard below, the first pass of F7, F8, N1, N2, N3, N5, N7, F9 and F10 (about 60 browser contexts, most closed with `context.close()`) ran without a network-level backstop. Those teardown beacons **may** have reached GA4 property G-8LM45PX53W (hostname `localhost`, ad d5 URL, no email, no child data: events `user_engagement`) and Clarity project wml8wll5ua (sessions from localhost:3001/3002). I cannot prove they did or did not. All later runs, and a full re-run of every functional test, were done under the guard. Suggested cleanup: filter GA4 reports by hostname `localhost` / exclude; Clarity sessions from localhost can be ignored or deleted. No Klaviyo or Meta request from the browser is possible in any run (the page only talks to /api/season-one on localhost, and the server side is intercepted).

## Guard (network level)

`/home/claude/qa/guard.js` is a local forward proxy (Chromium launched with `--proxy-server=http://127.0.0.1:39001`, loopback bypassed) in front of the sandbox egress proxy. It answers 403 (never forwards) to CONNECT for: google-analytics.com and subdomains, analytics.google.com, www.google.com, doubleclick.net, facebook.com, facebook.net, every one- or two-letter *.clarity.ms collect host, c.clarity.ms, a.klaviyo.com, bing.com. It forwards everything else (gtag.js, clarity.js, fonts). It fails closed (if it is down, Chromium cannot connect). Log: `/home/claude/qa/guard.log`.

Guard log summary for the guarded runs (1208 CONNECTs, 271 blocked, none forwarded to a blocked host): {"www.google.com":147,"*.clarity.ms (collect hosts)":64,"www.google-analytics.com":60}. These blocked connections are Chromium opening connections (about one per page load, plus connections at teardown) that bypassed the page-level interception; they were refused, so no data left. `www.google.com` is mostly Chromium itself (it also appears on a blank localhost page).

(One guard crash on an unhandled socket error happened between two F10 batches; Chromium failed closed during that window, and the affected batch was re-run after the fix.)
