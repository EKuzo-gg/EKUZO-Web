# Decision log (most overrulable first)

1. **Main sign-up also sends `tz`, and profile geo props are written on the Waitlist event too.**
   The spec marked this optional; it costs two lines and gives every waitlist family a time zone for
   calls and send times. Overrule: drop R3's second sentence and the Waitlist half of R5/R6.
2. **One `tz` for the alert, browser first, geo second.** The spec stored browser `tz` and
   `geo_tz` separately; Klaviyo's template `default` filter cannot fall back to another variable
   reliably, so the server picks one (`tz`) and records which (`tz_source`). The device time zone
   beats IP geo for "their time" (VPNs and carrier IPs place people wrong); geo covers the popup and
   browsers without Intl.
3. **No live Klaviyo write during the build.** Flow Vk9VxY (Text Karlin alert) is LIVE with no
   trigger or profile filter: any test event posts to #ad-leads-texts and emails Karlin. All route
   tests run against stubbed outbound fetch with a dummy key; the real `.env.local` is not in the
   worktree. The one live check moves to after deploy, together with the alert-line change, on
   Jamie's go.
4. **Profile geo props only when non-empty.** Prevents a header-less request from blanking a
   family's stored location.
5. **Strip `"` and `\` from `geo_city`** (all callers). Cheap insurance for the webhook JSON body.
6. **Roles run:** Fable (lead), Relay (implementation, sonnet), Sentry (QA, sonnet), Auditor
   (sonnet). Not run: Story, Atlas, Parent, Steward, Chronos: no copy, no visual change, no domain
   logic beyond a validator. Scout's map check was done by Fable from `origin/main` directly (route
   read in full, landing text-card block read). Screenshots before and after still gate N6.
7. **Base and release path:** branch off `origin/main` 3572edc; ship by the runbook's cherry-pick
   path (dev first, dev deploy and phone check, then a release branch from main). Jamie pushes.
8. **Auditor phase 1: SIGN-OFF WITH CHANGES, all 12 findings accepted** (`auditor-phase1.md`).
   Notable: browser UTC aliases are weak against a geo zone (amended R5); region gets the same strip
   as city. Spec frozen after these edits.
9. **D1 accepted (minor):** `geo_country` and `geo_postal` keep the old sanitizing (no quote or
   control strip). Neither goes into the Discord webhook; if either is ever added to a webhook
   body, apply the same strip first.
10. **D2 accepted (infra gap):** `next build` needs a dummy `STRIPE_SECRET_KEY` in a keyless
    sandbox because `/api/camps/register` constructs Stripe at module load. Not touched by this
    change (camps route not in the diff), so the same on main by construction.
11. **Auditor ledger notes accepted:** half of the UTC aliases and the helper fuzz rest on the
    unit suite (Sentry re-ran it, 58/58); screenshots use fallback fonts because the gate blocks
    Google Fonts. Fine for a change with zero visual diff.
12. **Completion (Fable):** ledger fully evidenced, no open critical or major, zero visual diff,
    no Meta exposure, no live writes made. Parent and Steward not run (no copy or visual change,
    decision 6). Complete, pending Jamie's release and the post-deploy live check.
