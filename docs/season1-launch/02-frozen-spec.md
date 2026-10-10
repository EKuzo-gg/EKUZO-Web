# 02 Frozen spec

Frozen 2026-10-10 by Fable. The behavior and API contract are `docs/season-one-tracking.md` (in this
branch) as written; the implementation already exists, so this file freezes that contract plus the
pre-flight results. Deviations need a logged spec change in `03-decision-log.md`.

## Pre-flight (queried live 2026-10-10 ~13:05 CT)

| System | Check | Result |
|---|---|---|
| Klaviyo | list `XGTv2F` | exists, "Season 01 Waitlist", single opt-in, **profile_count 0**, no flow triggers |
| Klaviyo | metric "Season 01 Waitlist" | exists, `XNJKbF`, created 2026-10-09 19:01 UTC (Aaron's test) |
| Klaviyo | flows on the list | none. Welcome flow is Monday's fast follow (Aaron) |
| Meta | dataset `1284038230557204` | active; last 7 days ~80 PageView, ~11 ViewContent, 1 Lead (2026-10-05, not from this code) |
| Netlify | env vars per context | **not queryable from here** -> human action H1 |
| GitHub | push from Claude's cloud | refused until the Claude GitHub App is on the EKuzo-gg org -> human action H2 |

**Pre-flight flag (must-verify in L2):** the metric exists from Aaron's 10-09 test, yet the list has
0 profiles. Either his test predates the subscribe call, the profile was removed, or the
subscribe job is failing (the route logs and still returns ok). L2 must confirm a list membership,
not just the event.

## Human-action items

- **H1** Netlify > Site configuration > Environment variables: confirm for Production and Branch
  deploys: `KLAVIYO_PRIVATE_API_KEY`, `META_CAPI_ACCESS_TOKEN`, `META_PIXEL_ID` (or
  `NEXT_PUBLIC_META_PIXEL_ID`) = 1284038230557204; `META_CAPI_USE_TEST_CODE` unset in Production.
- **H2** Push the two branches (commands in the review guide) or install the Claude GitHub App.
- **H3** Go/no-go for the release to main.
