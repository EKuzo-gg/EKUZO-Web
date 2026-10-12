# 07 Review guide (Fable, terminal artifact, 2026-09-16)

## 60-second summary

Branch `blog/gaming-study-13-7` now carries five commits: the gaming-study blog post (three commits from 2026-09-15) and this loop's one commit, `61db653`. On blog post pages the enroll bar is replaced by a newsletter bar and a popup opens at 50 percent scroll, with two copy variants ("thumbs" and "classic") split 50/50 per browser and reported to Beehiiv as utm fields and tags and to GA4 as impression and signup events. The inquiry form gained an optional "How did you hear about us?" select. Every requirement has evidence in `04-evidence-ledger.md`; 12 defects were found, 6 fixed and verified, 6 accepted with rationale; the visual-parity gate passed 13/13. `tsc` and `eslint` are clean on your machine. Nothing is pushed or merged.

**The one thing that matters:** the code is correct and the copy is not yet true. "One email tomorrow" has no sender until you build the Beehiiv automation. Merge is fine now; the X push waits for the automation (your sequencing, decision D-01).

## Decisions, most overrulable first

See `03-decision-log.md` for the full table. The ones you might want to change:

1. **D-01, no feature flag.** The surfaces are live the moment the branch merges. If you want a switch after all, it is a 10-line change (an env flag around the blog arm and the blog popup mount).
2. **D-12, no dismiss control on the sticky bar.** The Parent reviewer wanted a "not now." The camps reference bar has none either, so I kept parity. On a phone the bar is 105px tall and sits over the article until the footer. If that bothers you on the dev preview, say so and it becomes a small follow-up.
3. **D-05, storage-unavailable readers get "thumbs."** Private-mode browsers land in the preferred arm, once per page load. Skews the A/B by a small population.
4. **D-04, both arms get the thumbs welcome email.** The classic reader is promised a weekly and gets a first email that offers a thumbs down. That is a nicer deal than promised, which is the safe direction; the opener is arm-neutral so it is not false for them.
5. **SC-01, the popup's mobile artwork block is replaced by the logo below lg.** The only way the form fit at 375x667. The Steward required the logo so the purple sheet is branded.

## Guided walkthrough

Run it: `git switch blog/gaming-study-13-7` (you are on it), `npm run dev`, open `http://localhost:3001/blog/gaming-study-13-7-years-younger-what-it-means-for-kids`.

1. Scroll 300px. The bottom bar reads "One email tomorrow, then you decide to stay or go." or "One email a week on kids and gaming, with the sources." depending on the variant your browser drew. Screenshots: `screenshots/sticky-blog-thumbs-1440-visible.png`, `-375-`, `-768-`, `-820-`.
2. Scroll to halfway. The popup opens (thumbs: "One email after you read this. Then you decide."; classic: "For parents of gamers, once a week."). Byline "Karlin Oei, founder, EKUZO" under the body. Escape closes it; it will not return for 30 days in that browser. Screenshots: `popup-blog-thumbs-1440-open.png`, `-375-`, `popup-blog-thumbs-375x667-open.png`, `popup-blog-classic-320-open.png`.
3. To see the other variant: in devtools, `localStorage.setItem("ekuzo_nl_variant","classic")` (or "thumbs"), delete `ekuzo_nl_blog_dismissed_at`, reload.
4. To see the success state without a real signup: submit any address in the bar; the dev server will call Beehiiv for real using `.env.local`, so use `newsletter-test+<something>@ekuzo.gg` and delete it afterwards, or watch the network tab. The bar shows "Got it. Look for it tomorrow." (thumbs) or "You're on the list." (classic). After a bar signup the popup will not open.
5. Open `/` and scroll: the enroll bar is unchanged (`n1-before_-1440.png` vs `n1-after_-1440.png` are byte-identical in outerHTML). Same for camps, 101, 100, teams, schools, parents, and the register page (hidden on both).
6. Click "Talk to Humans" on `/`: the contact form has the new select after the message field. `contact-before-1440-open.png` vs `contact-after-1440-open.png`.

## Deferred to your human pass (Sentry could not do these here)

- A real signup end to end: bar and popup each once, then check the subscriber in Beehiiv shows utm_source=blog, the medium, the campaign, and the tags `source-blog` and `variant-<arm>`; check GA4 DebugView for `newsletter_impression` and `newsletter_signup`.
- A real contact submission with "How did you hear about us?" set: Karlin's email shows the line; the Beehiiv subscriber carries `heard-<slug>`.
- Safari on an actual iPhone for the popup at 375 (Chromium emulation only here).
- The homepage popup with `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED=true` (it is off in every Netlify context; I verified it renders unchanged on a flag-on before-build only).

## Pre-launch checklist (in order)

1. Merge the branch to `dev`, check the Netlify dev preview, then `dev` to `main`. Hero and share-card images for the post are still missing (`/images/gaming-study-13-7-hero.jpg`, `-card.jpg`).
2. **Beehiiv, before the X push:** create automation "Blog welcome (thumbs)". Trigger: tag `source-blog` applied. Delay: 24 hours (the copy says tomorrow). One email: `welcome-email-thumbs.md`. Thumbs-up link: the newest post with `?utm_source=beehiiv&utm_medium=email&utm_campaign=thumbs-up`. Thumbs-down link: the editor's unsubscribe link (the `{{unsubscribe_url}}` merge tag if the editor lists it, otherwise the link menu's "Unsubscribe" option). Publish it. Then send it once to the pre-flight subscriber `newsletter-test+1789503074@ekuzo.gg` (id in `06-cleanup-ledger.md`), click both links, confirm the thumbs-down unsubscribes in one click with no survey, then delete that subscriber (Beehiiv UI or `DELETE /v2/publications/{pub}/subscriptions/{id}`).
3. Beehiiv segments: `utm_campaign = thumbs` and `= classic` for the A/B read; `utm_source = blog` for the total. Add the TEAMS automation id, the new automation, and the tags to `docs/beehiiv-config.md`.
4. GA4: confirm `newsletter_impression` and `newsletter_signup` appear with `variant`, then build the one report: signups per impression by variant. Decide after 30 days or 200 impressions per arm, whichever is later.
5. Then the X push (bio link, the two new replies, the Karlin post).

## KB backport candidates (for the session close)

- The Build Loop caught the same class of miss twice: a promise in copy whose mechanism did not exist at commit time (Steward, design and rendered reviews). Candidate rule for `voice-dna.md` § ship-state gate: every capture surface that promises a send names the automation that sends it, and the review guide carries the send-once test.
- Rendered reviews at 375 found what 1440 could not (popup fit, tablet clipping). Candidate: the visual-parity gate lists 375x667 and 768 as required sizes, not only 375x812 and 1440.
- StickyCTA `querySelector("footer")` bug on camps and 101 (Scout flag 4).
- jtbd-check skill paths are stale (`wiki/domains/...`).

## Git evidence (captured after the commit, on Jamie's machine)

```
$ git log --oneline -3
61db653 feat(blog): newsletter capture A/B on posts, utm passthrough, inquiry-form attribution
772f385 content(blog): refresh Brockie like count to the Sep 15 evening read
26f27cc fix(blog): explicit spaces after bold labels in the gaming-study post

$ git status --porcelain | grep -v '^??'
32 lines, all pre-existing modifications from before this loop (CLAUDE.md, app/api/teams/register/route.ts,
app/api/webhooks/stripe/route.ts, app/programs/ekuzo-teams/register/page.tsx, 10 files under docs/,
2 under marketing/teams-redesign/, karlin-reel.mp4 and 15 video binaries). None of this loop's files
appear: they are all committed in 61db653.

$ git status --porcelain | grep '^??'   (excluding .agents/ and .playwright-mcp/)
AGENTS.md, app/programs/ekuzo101/register/.fuse_hidden0000000600000001,
components/register/AvailabilityMatrix.tsx, docs/architecture-decisions.md, docs/assets.md,
docs/dev-runbook.md, docs/klaviyo-config.md, docs/learning-log.md, docs/registration-flow/,
docs/teams-fall-readiness/, docs/tooling.md. All pre-existing, none from this loop.
```
Branch: `blog/gaming-study-13-7`. Not pushed. Not merged.
