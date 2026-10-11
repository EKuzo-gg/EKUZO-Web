# 06 Cleanup ledger (Relay / Fable)

Every write to a live system during this build.

| When (UTC) | System | Write | Identity | State after | Cleanup |
|---|---|---|---|---|---|
| 2026-10-11 17:33:49 | Klaviyo | "Season 01 Waitlist" event `7wnxqja73rN` (site-popup, attribution_from session) from the fixed route on a local server | team+s1test-1011-popup@ekuzo.gg (profile 01M4P0EAWV4WB9FR7DN2FQE5EF) | Profile + event exist. List subscribe returned 403 (the local key lacks the subscriptions scope, decision-log item 3 of season1-launch), so the address is NOT on list XGTv2F | Left in place; the readout must exclude `team+s1test-1011` (logged in the ads log) |
| 2026-10-11 17:33:49 | Klaviyo | "Season 01 Waitlist" event `7wnx9QA3qwi` (ad-landing, attribution_from url) | team+s1test-1011-landing@ekuzo.gg (profile 01M4P0EB890RZVFBVHCVW3SKJD) | Same as above, not on the list | Same |
| 2026-10-11 ~11:40 to 12:20 CT | GA4 G-8LM45PX53W, Clarity wml8wll5ua | Possible teardown beacons from Sentry's first Playwright runs before the blocking proxy existed (defect D-004) | hostname localhost, ad d5 URLs, no email | Unknown | Filter GA4 on hostname localhost; ignore localhost Clarity sessions |

Meta: no writes. The live test server had no Meta env vars (route logged "Meta CAPI token or pixel ID not configured; skipping server-side Lead event" for both sign-ups); no browser was involved, so no pixel events.
Flows: checked before the write, none on list XGTv2F or metric XNJKbF (Klaviyo API, 17:30 UTC).
