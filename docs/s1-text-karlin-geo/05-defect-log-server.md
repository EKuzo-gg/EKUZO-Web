# Defect log, Sentry server lane (2026-10-23)

No critical or major defects. No request returned 5xx. Status codes and bodies matched baseline in every case (about 250 requests per server across dev and production-start runs).

| ID | Severity | Type | Owner | Finding | Repro | Evidence |
|---|---|---|---|---|---|---|
| D1 | minor | accepted-risk | Relay (decide: leave or strip) | `geo_country` and `geo_postal` are not stripped of quotes, backslashes or control characters (R7 covers only city and region by design). If the header ever carried one, it would sit in the Klaviyo event as-is. The planned H2 webhook and email template read only `geo_city`, `geo_region` and `tz`, so there is no current path into the Discord JSON, and real Netlify country codes and postal codes do not contain these characters. | `parseGeoHeader(b64({country:{code:'U"S\\'}, postalCode:'78"7\n57'}))` returns `geo_country` `U"S\` and `geo_postal` with a quote and newline. Over HTTP the same header gives 200. | `evidence/sentry-server/country-probe.txt` |
| D2 | minor | infra-gap | Fable | `next build` with the brief's dummy env fails with exit 1 ("Neither apiKey nor config.authenticator provided" while collecting /api/camps/register) because Stripe is constructed at module load. Same on main. Not caused by this change; with a dummy `STRIPE_SECRET_KEY` both build clean. Coordinator accepted. | `STRIPE_SECRET_KEY` unset, `npx next build`. | `n7-branch-build-specified-env.txt`, `n7-branch-build.txt`, `n7-baseline-build.txt` |
| D3 | minor | accepted-risk | not this build | Pre-existing test failure on main: `ekuzo101-weeks.test.ts` "buildWeeksLabel includes the time string" (label reads "7-8:30 PM local time"). Identical on baseline and branch, so N7 holds. | Run the ekuzo101-weeks test on origin/main. | `n7-baseline-ekuzo101.txt`, `n7-branch-ekuzo101.txt` |

## Test limits (so nobody over-reads the PASS rows)

- Server lane only. J1, J2, M4 and the N6 screenshot/pixel check belong to the browser lane.
- Results come from stubbed fetch: Klaviyo's real handling of the new properties (and of an apostrophe or `&#39;` in a city) is untested by design (H2, H3 after deploy).
- Whether live Netlify `x-nf-geo` carries `timezone` is unverified (post-deploy check: `tz_source` "geo" on a popup sign-up).
- Servers were dev (full suites) and production `next start` (n4 + journeys). Each run was a fresh server because the sandbox kills background processes between calls.
