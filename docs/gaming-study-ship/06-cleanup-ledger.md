# 06 Cleanup ledger (Relay / Fable)

Every write to a live system during this build. Evidence: `evidence/klaviyo-proof/`.

| When (UTC) | System | Write | Identity | State after | Cleanup |
|---|---|---|---|---|---|
| 2026-10-12 04:02:21 | Klaviyo | "Season 01 Waitlist" event `7ws7CyuYpJc` (site-popup, attribution_from url, utm x/social/gaming-study/karlin) from the real route on a local server (port 3313) | team+gstest-1012-jr1@ekuzo.gg (profile 01M4Q4D6PC0MAY61XCTC726TFR) | Profile and event exist. List subscribe returned 403 (local key lacks `subscriptions:write`), so NOT on list XGTv2F (lists: none; email consent NEVER_SUBSCRIBED) | Left in place, nothing deleted. Recommended for Jamie: suppress the profile, or delete it (owner's call), so a future Season 01 flow on the "Season 01 Waitlist" metric can never email it. The readout must exclude `team+gstest-1012` |
| 2026-10-12 04:02:26 | Klaviyo | "Season 01 Waitlist" event `7ws7iJKwHEa` (site-popup, attribution_from none, bare post URL) | team+gstest-1012-jr2@ekuzo.gg (profile 01M4Q4DBW0KGV6MB2R5ZM9NM6R) | Same as above, not on the list | Same |

Meta: no writes. Server started with `META_CAPI_ACCESS_TOKEN=` (empty); the route logged "Meta CAPI token or pixel ID not configured; skipping server-side Lead event" after both sign-ups. The browser ran behind a default-deny proxy (vendor scripts blocked, no pixel/GA4/Clarity beacon left the machine).
Beehiiv, Resend, Sheets: fake or empty env, no writes.
Flows: checked before the writes (04:01 UTC). The local key lacks flows:read and metrics:read, so the check used the connected read-only Klaviyo tools: no flow on list XGTv2F or metric XNJKbF; the 4 live flows are on other metrics.
