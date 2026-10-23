# Review guide: Text Karlin location and time zone

Written by Fable, 2026-10-23 ~10:20 CT, after QA and the Auditor's ledger. Branch
`build/s1-text-karlin-geo`, worktree `.claude/worktrees/s1-text-karlin-geo`. Not pushed.

## 60-second summary
Every "Season 01 Text Karlin" event now says where the parent is and what time it is there:
`geo_city`, `geo_region` (plus country, postal), and one `tz` with its `tz_source`. The phone's
own time zone wins; Netlify's IP zone is the fallback, and also wins when the phone says only "UTC".
Waitlist sign-ups get the same `tz`, and the profile keeps `season1_city/region/tz`. Nothing new
reaches Meta, the landing page looks identical, and no live system was written to during the build.
Karlin sees none of it until the alert line in Klaviyo changes (step 3 below, your go).

## Decisions, most overrulable first (detail: `03-decision-log.md`)
1. tz also on the main sign-up and profile geo on the Waitlist event (the spec's optional item).
2. One `tz` field: browser first, geo second, UTC alias loses to geo.
3. No live Klaviyo test during the build (flow Vk9VxY is live with no filter; a test pings Karlin).
4. Profile geo written only when non-empty. 5. Quotes and control characters stripped from city
and region (they go into the Discord JSON body).

## Evidence (ledger: `04-evidence-ledger.md`; defects: `05-defect-log.md`)
- tsc and build clean; 58 new unit tests; existing tests same as main (the `ekuzo101-weeks`
  "time string" failure is on main too).
- Server: same request suite against main and branch with outbound calls stubbed: only the added
  keys differ, subscribe and Meta bodies identical, 151 Meta bodies with no geo or tz, no 5xx on 25
  bad tz values and 24 malformed headers.
- Browser (analytics blocked): tz arrives on both posts on desktop, iPhone and Instagram UA; with
  Intl broken both posts still succeed; Lead fires once, the text step fires nothing new;
  screenshots pixel-identical to main.
- Open minors, accepted: country and postal not stripped (not in any webhook); `next build` needs a
  dummy Stripe key in a keyless sandbox (pre-existing).

## Release (runbook § Releasing when dev carries work main must not get)
Prepared locally: `release/tkg-dev` = origin/dev plus this build's commits, and this branch =
origin/main plus the same commits. From your terminal in `~/Projects/ekuzo-web`:
1. `git push origin release/tkg-dev:dev`, wait for the dev deploy.
2. Phone check on `https://dev--ekuzo.netlify.app/season1?ad=d10` with a test address from the
   `plan.md` exclusion pattern (`team+s1test-1023-tz@ekuzo.gg`): sign up, leave a number in the
   text card. This posts to #ad-leads-texts and emails Karlin (say "test" in the channel first).
   Tell me when done; I read the event in Klaviyo and confirm `geo_city`, `tz`, `tz_source`.
3. If it passes: `git push origin build/s1-text-karlin-geo:main`. Then on your go I change the
   Discord line and the alert email in flow Vk9VxY to add
   `Location: {{ event.geo_city }}, {{ event.geo_region }} ({{ event.tz }})`, and log the deploy
   time in `Marketing/ads/2026-10-season-one/log.md`.

## Deferred to you
- Whether the live header carries `timezone` (a popup sign-up showing `tz_source` "geo" answers it).
- How Discord renders a city with an apostrophe (Klaviyo may escape it as &#39;).
- Pre-existing: an email containing a double quote would break the Discord webhook JSON; the
  email alert still goes. Low odds, not fixed here.
- Optional: a flow filter that skips `team+s1test` addresses, so tests stop pinging Karlin.

## KB backport candidates
- Cowork VM: each device shell call kills its background processes, so QA servers start, test and
  stop inside one call. `device_commit_files` cannot write under `.claude/`.

## Git evidence at writing time
```
$ git status --porcelain

$ git log --oneline -3
32c1589 feat(season1): parent location and time zone on the Text Karlin event; tz on ad-landing sign-ups
3572edc release(season1): 'Chat with our founder' text card on the ad confirmation; /api/season-one text-karlin step (Klaviyo only, no SMS consent, nothing to Meta)
ed226ed release(season1): /season1/thanks landing for the Day 0 'what do they play' answers
```
Expected on receipt: one more commit on top, "docs(s1-text-karlin-geo): review guide and return
handoff", and a clean status.
