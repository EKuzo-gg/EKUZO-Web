# Auditor review: 01-requirements.md (phase 1 gate)

Reviewer: Auditor. Reviewed against the brief (2026-10-12 handoff, which wins), the 10-06 base spec with its 10-11 update, the change list C1 to C10, and build-loop.md. I report; I do not rewrite. I also checked the branch's own commit `61db653` (`git show --stat`) where a requirement depends on what that commit ships.

## 1. Traceability: brief to requirement IDs

Mapped cleanly: Step 0 (header section), decisions 1 (PB-1..5), 2 (DT-1, DT-2), 3 (CP-15), 4 (DT-3), 5 (CP-12), 8 (JR-*, MN-*), C1 to C10 (CP-1 to CP-10, C2 replaced by CP-11), S1 to S4 (CP-11 to CP-14), three assets (AS-1 to AS-3), hero/brush check (AS-4), parity gate (AS-5), share card (AS-2), phone check (TG-8), the brief's journeys and must-nots (JR-1 to JR-3, MN-1 to MN-4), non-regression surfaces (NR-1).

### Missing (no requirement ID)

- **Decision 9, UTM distribution links.** The ready-made links (`utm_source` x/linkedin/instagram/email, `utm_medium` social/email, `utm_campaign=gaming-study`, `utm_content` karlin/ekuzo) are not required anywhere, and have no gate.
- **Close-out deliverables.** No ID for: the asset pack in `knowledge-base/outputs/2026-10-12-gaming-study-asset-pack/` (short answer, pull-quotes, dark graphic as standalone 4:5, share card, UTM links, Karlin short-form brief); verify live against `origin/main`; WORKLOG; tracker CON-01; the loop-4 entry in the exploration doc section 9; session debrief; archiving both handoffs with `ran_in` filled. The 08/07 terminal artifacts are Fable's, but the asset pack and live verification are brief requirements.
- **Merge and ship procedure.** No ID for: push the branch to `dev` for preview, then fast-forward `main` from the branch (or cherry-pick), never `git push origin dev:main`; push and merge need Jamie's go. The checkpoint list names the pushes but nothing gates the method. The working branch is `build/gaming-study-ship`, not `blog/gaming-study-13-7` as the brief assumes; that deviation is not in the requirements or any decision log entry.
- **Decision 1 follow-up.** "Build the Beehiiv Blog welcome (thumbs) automation before flipping the A/B on" is not carried as a follow-up or human-action item.
- **Decision 6 conditionality.** The brief says request indexing if the SC session has finished, else leave it. The requirements assert "not yet run" as a fact. It needs to be conditional, with a check at ship time.
- **C7 constraints.** Do not write the two quote-posts as a combined figure (it is 13.7M); the Brockie "1.1K likes when I read it on September 15" line stays; the subhead and `DESCRIPTION` ("More than 30 million people") stay. None is a requirement.
- **C8** "answer unchanged"; **C1** `TITLE_SEO` unchanged; the C "Not changed, on purpose" list (13.7 checklist item with the corrected reanalysis, `public/research/` link, no AAP sentence). No non-regression IDs.
- **Base-spec constraints** (nothing sent without go; minors never named or pictured identifiably; Lolcat reel consent; "13.7" never alone in images and alt text) are only partly present (CP-11, CP-17, MN-7). Minors/consent for the new hero and graphic have no ID.
- **Other time-relative phrasing.** Base-spec update item 4 asks for a re-read of the copy for anything reading as "this week" or "in September" about the wave. CP-15 protects one deliberate line, but no requirement scans for the rest (the dated Brockie line is the stated exception).
- **Step 0 asset mismatch.** The brief states 268 KB and 107 KB; disk shows 281 KB and 116 KB. The brief says any Step 0 mismatch halts until resolved. Fable decided alone it was "a re-export". Nothing records Jamie confirming that these are the intended finals, and AS-1 and AS-3 use byte-identity to the on-disk files, which can only prove the copy, not that they are the right files.

### Contradicted or inconsistent with the brief

- **CP-12 vs TG-7.** CP-12 requires five new inbound sentences, one per source post. TG-7 says four exist on the branch and S2 "adds the fifth". Both cannot hold. Also NR-3 ("other posts unchanged except the approved sentences") depends on which. Settle the count and which five posts.
- **JR-1 `page` value.** The brief says `page` = this post's path. JR-1 says "the post path with its query". One of them is wrong or the code differs; JR-2 says only "page recorded".
- **Decision 8 (no new tracking code) vs what ships.** Commit `61db653` changes `app/api/contact/route.ts`, `app/api/newsletter/route.ts`, `components/ui/ContactModal.tsx`, `NewsletterPopup.tsx`, `StickyCTA.tsx` and `app/layout.tsx` ("utm passthrough, inquiry-form attribution"). The ContactModal and `/api/contact` attribution change is not blog-only and not behind `SEASON_ONE_MODE`. The requirements gate only the popup and bar. Nothing inventories which parts of that commit are dormant and which go live site-wide, and nothing tests the contact form attribution path. NR-2's path list omits `app/api/contact`, `app/api/newsletter` and `ContactModal`.

## 2. Journeys and must-not lists

Both lists exist. Gaps:

**Journeys** (build-loop requires arrival from the real source, page to page, return visit in a new session):
- No arrival from the real source for the post's distribution: Instagram or Facebook in-app browser (the UTM plan includes `instagram`; `fbclid`, in-app webview storage behaviour). X and LinkedIn in-app browsers likewise.
- No phone arrival journey (touch) in the journeys table; touch appears only inside MN-5.
- JR-5 covers a return within 7 days but not a return in a new session after an earlier UTM visit (expected attribution: first touch kept, or replaced?). JR-4 states the answer for page to page but there is no return-in-new-session expectation.
- No journey for arrival on a post that is not this one (the layout-level popup gating affects every blog post).

**Must-not coverage per tracked event or interaction** (checklist: page load, autofill, script-set value, programmatic focus, scroll starting on the element, retry):
- MN-5 covers page load, popup open and dismiss, autofill, touch-scroll, retry for `generate_lead`/Lead only. **Missing: script-set value (prefill or programmatic value set) and the page's own programmatic focus** (popup open focusing the email field). Those are exactly the faults named in the loop's 2026-10-11 evidence.
- **`form_start` is never named.** It is the event that actually misfired (autofill, then scroll). MN-5 must list it explicitly, per field (both email fields), with the same matrix.
- No must-not cases for: the Season 01 popup auto-open (must not open twice in one view, must not open when dismissed in 7 days, must not open on a scroll that begins on the sticky bar), the sticky-bar tap event (must not fire on scroll-start), `newsletter_impression` (covered only as PB-3 for Season on), and any CTA click event on the post.
- MN-6 (`ai_referral`) lacks page-load-class must-nots: reload, same-origin navigation, bfcache or back navigation, hash change.
- PB-5 / MN-2 define "one ask" without enumerating the asks (Season 01 popup, sticky bar, FooterBanner, inline forms). Is the sticky bar an ask? Decide, or the test is arguable.

## 3. Gates that are not checkable by an artifact

- **MN-4 vs MN-7 and JR-1/JR-2 (internal contradiction).** MN-4 forbids any live Meta Lead, browser or server. MN-7 runs the Klaviyo-side proof of JR-1 and JR-2 on the dev deploy with a real POST to `/api/season-one`. The dev deploy will likely carry the live CAPI token and send a live server Lead unless a test event code is set. The requirements state a local mechanism (intercept, blank token) but none for the deploy. Needs a stated, checkable mechanism (test event code set on the preview environment, or CAPI token absent) with an env readout as the artifact.
- **TG-8 phone check** (real phone, no proxy): beacons from Jamie's phone to live GA4, Clarity and Meta contradict MN-3. Say what Jamie does on the phone (no sign-up), and note the beacon exposure as an accepted risk.
- **AS-2 link-preview check** is an external tool step on the deploy but is absent from the human checkpoint list.
- **AS-1** "post and note survive the crop" is a judgement. The gate names screenshots but no judge or the three crop widths from the brief (1024, 658, 327 at 520 height). Name the judge (Steward) and the files. Also no dimension check for the hero (2400x1260) or graphic (1080x1350), only the card.
- **CP-17** gate is "Steward", an actor, not an artifact. Needs a claims-trace table (sentence, register row) in the ledger.
- **TG-9** accessibility ("focus visible, contrast unchanged") gate is "Sentry", with no tool, output or screenshots named.
- **CP-16** points to "banned vocabulary, banned phrases and transitions" with no source file named (anti-ai-writing.md or voice-dna.md). The "It's not X. It's Y." reframe lint from CLAUDE.md is not mechanical; mark it Steward or human.
- **CP-14**: who performs the X re-read, and how. X is behind a login wall for tooling. Likely Jamie's screenshot. Assign it and make Jamie's screenshot the artifact.
- **TG-6** "every external source link opened" will fail for X status URLs (login wall). Define what counts as evidence (title or screenshot) for those.
- **CP-18** is conditional ("if the block takes more than one") and the gate is a screenshot; state the condition that is checked (the component takes N cards) and the pass state.
- **CP-10** gate "source diff" cannot show the claim "dormant while Season 01 mode overrides the banner"; add a rendered check of what the banner shows with the mode on.
- **DT-1** target date is "merge day", unknowable until merge, with "built as 2026-10-12". Gate needs a final recheck step after the merge go.
- **NR-1** tests `/blog` and others but no other blog post; the layout-level popup and bar gating changes every post. Add at least one other post vs a main build.
- **NR-2** wording ("zero diff vs origin/main outside the branch's own files in <paths>") is ambiguous. It reads as both "no diff" and "except the branch's own files". State the intended form of the command and the expected output.
- **Human checkpoints list** omits: the S1 link pick (original vs which Musk quote), the AS-2 link preview, the CP-14 read, the SC conditional, the JR-1 Klaviyo proof go (listed only as a "Klaviyo-side journey proof"), the Beehiiv follow-up.

## 4. Ambiguity, untestability, self-contradiction (summary)

CP-12 vs TG-7 (count of new sentences); JR-1 `page` value vs brief; MN-4 vs MN-7 on the deploy; MN-3 vs TG-8 on the phone; NR-2 phrasing; CP-18 conditional; DT-1 date; the build branch name vs the brief's "the branch".

---

CHANGES NEEDED

1. Reconcile CP-12 and TG-7: state the number of new inbound sentences (five per the brief, or one) and the five source posts; make NR-3 match.
2. Fix JR-1's `page` expectation to match the brief (post path) or record why the query is included; align JR-2.
3. Add must-not cases for script-set value and programmatic focus, and add `form_start` by name (per email field, same matrix incl. touch-scroll start on the field and on the sticky bar); add must-nots for Season 01 popup auto-open (twice per view, within the 7-day dismissal, touch-scroll start) and for the sticky-bar tap event; extend MN-6 to reload, same-origin navigation and back navigation.
4. Add journeys: arrival from the Instagram or Facebook in-app browser (and X or LinkedIn), a phone-touch arrival, a return in a new session after a UTM visit with a stated expected attribution, and arrival on a blog post other than this one.
5. Resolve the MN-4 vs MN-7 contradiction: state the checkable mechanism that prevents a live server-side Meta Lead on the dev deploy (test event code or absent token, with an env readout as the artifact), or move the Klaviyo proof to a path that cannot send one.
6. State in TG-8 what Jamie does on the real phone (no sign-up) and record the beacon exposure from an un-proxied phone as an accepted risk.
7. Inventory what commit `61db653` ships live outside the blog (ContactModal, `/api/contact`, `/api/newsletter`, layout): add a requirement that each part is dormant or proven, test the contact-form attribution path, and add those files to NR-2's path list. Reconcile with decision 8.
8. Add requirements for decision 9 (UTM links) and the close-out set: asset pack contents, live verification against `origin/main`, WORKLOG including the FooterBanner list and the featured-revert date, CON-01, the loop-4 entry, session debrief, archiving both handoffs with `ran_in`.
9. Add a requirement for the ship method (push branch to `dev`, fast-forward `main` from the branch, never `dev:main`) and log the `build/gaming-study-ship` branch deviation from the brief.
10. Make decision 6 conditional (check the SC session state at ship time) and add the Beehiiv "Blog welcome (thumbs)" follow-up as a human-action item.
11. Add the missing C7, C8, C1 and "Not changed" constraints: no combined quote-post figure, Brockie line stays, subhead and `DESCRIPTION` stay, `TITLE_SEO` unchanged, FAQ answer unchanged, reanalysis link and corrected checklist item untouched.
12. Record Jamie's confirmation that the three on-disk final images (sizes differing from the brief) are the intended finals; add hero and graphic dimension checks to AS-1 and AS-3.
13. Replace actor-only gates with artifacts: CP-17 (claims-trace table), TG-9 (named tool and output), AS-1 (named judge, files, the three crop widths), CP-16 (name the banned-list source files and mark the reframe lint as Steward), CP-10 (rendered check), CP-18 (state the condition and pass state).
14. Define the evidence method for X-hosted facts (CP-14 re-read: who and how, Jamie's screenshot; TG-6 for X links behind the login wall).
15. Clarify NR-2's command and expected output; add one other blog post to NR-1 (layout-level gating affects all posts); define what counts as an "ask" in PB-5 and MN-2.
16. Add to the human checkpoint list: S1 link pick, AS-2 link preview, CP-14 read, SC conditional, the Beehiiv follow-up, and the DT-1 date recheck after the merge go.
17. Add a minors and consent requirement for the new hero and graphic (no identifiable minors; Karlin facecam approval noted), and a scan requirement for other "this week" or "in September" phrasing (CP-15 line excepted).

## Re-check, revision 2

Reviewer: Auditor. Inputs: the first review above (17 items), `01-requirements.md` with its Revision 2 section, Relay's `02b-contract-and-preflight.md`, the brief. I report; I do not rewrite. I also ran three greps in the worktree: `form_start` across `app components lib`, the section headings of `anti-ai-writing.md`, and the contents of `docs/gaming-study-ship/`.

### 1. Per-item status

1. CP-12 vs TG-7: RESOLVED. Five posts named (four already linked on the branch, one new); TG-7 passes on five approved links; NR-3 matches.
2. JR-1 `page`: RESOLVED. JR-1 expects the post path plus its UTM query, JR-2 the bare path; this matches Relay's case A and B exactly.
3. More must-nots: PARTLY. MN-8, MN-9, MN-10 and the MN-6 extension exist as requirements, but Relay's plan does not test most of them (see 2.1) and the `form_start` question is answered only by implication (see 2.2).
4. More journeys: RESOLVED as requirements (JR-7 to JR-10, in-app browsers handed to Jamie's phone check). Relay's plan only covers JR-1 to JR-6, so the contract needs extending (new item 2.4).
5. MN-4 vs MN-7: RESOLVED. The deploy sign-up now waits for a Netlify env readout showing `META_CAPI_USE_TEST_CODE=true` with a test code, or no CAPI token, and runs behind the proxy. Relay confirms the decision logic (`metaCapi.ts`: only the exact string `true` counts). The Option D or L choice is still open (new item 2.5).
6. TG-8 phone check: RESOLVED. Look and tap only, no sign-up, beacon exposure accepted. Relay agrees (the popup has no live-host guard). One omission: Relay also asks for an autofill check without submitting, which Revision 2 drops (new item 2.6).
7. What `61db653` ships: PARTLY. The inventory exists and the tests re-run, but the contact-form attribution path is only checked for "opens and renders", NR-5 is named but has no row, and the NR-2 treatment is contradictory (see 2.3).
8. Close-out: RESOLVED. CL-1 to CL-7 cover the asset pack with the UTM links, live verification, WORKLOG, CON-01, loop-4 entry, debrief and archiving. No gate column (new item 2.10).
9. Ship method and branch deviation: PARTLY. SH-1 is correct, but it cites "decision log D1" and no decision log exists in `docs/gaming-study-ship/` (only `01-requirements.md` mentions D1), and nothing repeats the origin/main and origin/dev drift check at ship time.
10. Search Console and Beehiiv follow-up: RESOLVED. Conditional, re-checked at ship time; Beehiiv follow-up is a human-action item and is on the checkpoint list.
11. Frozen constraints: RESOLVED. CP-19 carries every constraint I listed. No gate is named (new item 2.10).
12. Final images: RESOLVED. Dimensions added to AS-1 and AS-3 (2400x1260, 1200x630, 1080x1350); "images confirmed as finals" is on the checkpoint list.
13. Actor-only gates: PARTLY. CP-17 (claims-trace table), AS-1 (Steward, four widths), CP-16 (the heading numbers 3A, 3C, 3D exist in `anti-ai-writing.md`; reframes go to Steward) and CP-10 (rendered banner screenshot) are now artifacts. TG-9 names axe-core, and `axe-core` is present in `node_modules`, so no download is needed; it must be injected from disk into a guarded page. CP-18 still says "three cards render in the stated order" and no order is stated anywhere (CP-18 lists the two new posts "alongside" the homeschool post).
14. X-hosted facts: RESOLVED. Human or logged-out read with screenshot; X links pass when they resolve to the stated author in a logged-out browser; Jamie's stated read is the fallback.
15. NR-2, NR-1, "ask": PARTLY. "Ask" is now defined (a modal or popup that opens without a tap), which also settles Relay's Q1 (the inline footer newsletter form is not an ask); JR-10 stands in for the other-post check. NR-2's expected output is still ambiguous (see 2.3).
16. Checkpoint list: PARTLY. The Auditor items were added (S1 pick, link preview, X read, SC conditional, Beehiiv, date recheck), but the original "Klaviyo-side journey proof" go was dropped and Relay's own go items are missing (new item 2.7).
17. Minors and stale phrasing: RESOLVED. MC-1 and CP-20 added with an explicit allowed-hit list. No gate named (new item 2.10).

### 2. New or still-ungated items from Revision 2 and Relay's contract

2.1 **MN-8, MN-9, MN-10 and the MN-6 extension have no test in Relay's plan.** Relay's touch-scroll case starts on the email input and the submit button only. Not covered: a touch scroll starting on the sticky bar (MN-9, must not open the popup; a tap must), a touch scroll starting anywhere before the 2.5 s auto-open (MN-8), the popup opening twice in one page view (MN-8; Relay's JR-5 covers the 7 day boundary and joined only), the popup's own programmatic focus as a no-event case (MN-10; Relay's "popup open" row reads the focus effect but no test names it), and `ai_referral` on back navigation or bfcache restore (MN-6; Relay covers reload and client navigation only). Each needs a named test and a pass state.

2.2 **`form_start` is still not stated as a finding.** My grep shows `form_start` is written only in `app/season1/landing.html:1025` and documented for the landing page in `docs/season-one-tracking.md`; `SeasonOnePopup.tsx` calls only `trackLead` (line 129). Relay says the old bug "lived in landing.html" but never states that the popup has no `form_start`. Revision 2 left this conditional ("if it does"). Close it: record the grep as evidence, say the per-field cases do not apply to the popup, and say what the Season 01 sticky button emits (the `register_click` calls at `StickyCTA.tsx:185` and `:280` sit in other branches, so what the Season 01 button at `:161` fires should be read and written down).

2.3 **NR-2 is contradictory with item 7 and the gating edits.** Item 15 says the protected paths must show no branch change, while item 7 says the `61db653` files are "added to NR-2's readout". Those are two different lists. State: protected paths (season-one route, `lib/seasonOne.ts`, `lib/attribution.ts`, `components/ui/SeasonOne*`, `app/season1/`, `middleware.ts`, Stripe and webhook routes) must produce empty output; a separate allowlist names every file that is expected to differ (blog post, blog index, sitemap, llms.txt, images, `layout.tsx`, `StickyCTA.tsx`, ContactModal, `/api/contact`, `/api/newsletter`, `lib/analytics.ts`, NewsletterPopup); any other file fails. Also define the NR-5 row (it is named only in prose), and add a requirement that the contact form's "How did you hear" value reaches the `/api/contact` request body, checked by an intercepted POST under the guard (the modal's success path fires a site-wide id-less Meta `Lead`, Relay Q8, so it is never submitted for real). State plainly that the select and the `heard-<slug>` tag go live on every page, not behind `SEASON_ONE_MODE`, and get Jamie's acknowledgement of that.

2.4 **The gating edits have no requirement ID and no approval.** Relay's section 1 specifies two edits (`app/layout.tsx` line 234 and `components/ui/StickyCTA.tsx` line 44) and asks Jamie to approve them (Relay action 6). Revision 2 carries the behavior (PB-1 to PB-5) but not the edit itself, its diff gate, or the approval on the checkpoint list. Relay also showed that the branch as merged fails PB-1, PB-3, MN-1 and MN-2 today, so the pre-edit failing run should be kept as evidence beside the post-edit pass. Relay's plan also extends only to JR-1 to JR-6: add JR-7 (mobile context, touch), JR-8 (instagram, linkedin, email UTMs) with expected values, JR-9 and JR-10 to the run list.

2.5 **Relay's open questions Q1 to Q8 are not answered in the requirements.** Q1 is effectively settled by the "ask" definition; say so. Q2 (JR-3 and MN-6 only on `next build` plus `next start`, because React strict mode under `next dev` suppresses `ai_referral`) needs a requirement and a ledger note, since TG-4 and the gate wording say only "browser test". Q3 (Option D deploy or Option L local server with the real Klaviyo key and Meta faked) is undecided; Revision 2 says the proof is skipped if the env is unconfirmed, but Option L needs no Netlify confirmation and would still prove `attribution_from`, so the skip is premature. Q4 (server interceptor lane), Q7 (exact JR-1 UTMs for the disposable identity, excluded from readout by `team+gs-`) and Q5, Q6 (the popup has no live-host guard, so any sign-up on a preview or dev host fires a live GA4 `generate_lead` and Meta `Lead`; lookalike hosts count as AI in `originClassifier.ts`) need a decision or a logged follow-up. Q6 matters most: it is a live risk outside this build, and it should go in the WORKLOG and the close-out as a named follow-up.

2.6 **Mode proof and build type are not requirements.** Relay's sentinels (nav text "Join Season 01" versus "Enroll my gamer"; `/programs/ekuzo-camps/register` returning 307 on versus 200 off) should be required for every run and for the dev deploy and live check, because Netlify inlines `NEXT_PUBLIC_SEASON_ONE_MODE` at build time and PB-1 to PB-5, TG-8 and CL-2 all assume mode-on. PB-4 needs the mode-off rebuild with `.next` cleared between flips and the six prior Sentry scripts run from a scratch copy. TG-8 should add Relay's autofill check on the phone (let the keyboard autofill, do not tap "Save their spot").

2.7 **Human checkpoint list is missing Relay's go items.** Add: approval of the two gating edits; go to `npm i playwright-core` into the scratch directory and to use installed Chrome; go to download `gtag.js`, `fbevents.js` and the Clarity files once into the scratch vendor directory (decline means call-level evidence only); the interceptor lane yes or no; the Option D or L choice; the go for the Klaviyo write itself, with the two `team+gs-` addresses and the subscribe to list `XGTv2F`. The first review's list had the Klaviyo go; Revision 2's full list lost it.

2.8 **Option D needs a guard change and a pre-write flow check.** Relay's guard allows loopback only; driving the deploy needs the deploy host as a single allowed destination, with the guard self-test rerun and recorded. Before the write, Relay step 1 requires a read-only check that no flow triggers on list `XGTv2F` or metric `XNJKbF`; if one does, joining the list sends a real email. Neither is in the requirements.

2.9 **SH-1 gaps.** Create the decision log with D1 (it is cited and absent). Add a `git fetch` and a check that `origin/main` and `origin/dev` have not moved before each push, and that the push to `dev` is a fast-forward of `origin/dev` (4f15b1e), since `dev` may hold commits the branch lacks.

2.10 **Revision 2 additions lack a gate.** MN-8 to MN-10, JR-7 to JR-10, CP-19, CP-20, MC-1, CL-1 to CL-7, SH-1 and NR-5 have no gate column. Name an artifact for each (for CP-19 a string diff against `0da2e89`; for CP-20 grep output; for MC-1 Steward's named screenshots; for CL items a file or link check).

SIGN-OFF is not given. The remaining work is small and mostly bookkeeping against Relay's contract, but five items change what gets tested.

CHANGES NEEDED

1. Add named tests and pass states for MN-8 (twice in one view, touch scroll before auto-open), MN-9 (touch scroll on the sticky bar), MN-10 (programmatic focus) and MN-6 (back navigation, bfcache); extend Relay's run list to JR-7 to JR-10.
2. Record the `form_start` finding (exists only in `landing.html`; popup calls `trackLead` only) and state what the Season 01 sticky button emits; drop the conditional.
3. Rewrite NR-2 as two lists (protected paths expect empty output; an explicit allowlist of expected changed files); define NR-5; add the intercepted `/api/contact` body check and state that the contact select and tag go live site-wide with Jamie's acknowledgement.
4. Give the two gating edits (`layout.tsx`, `StickyCTA.tsx`) a requirement ID, a diff gate, and Jamie's approval; keep the pre-edit failing run as evidence.
5. Require JR-3 and MN-6 evidence from `next build` plus `next start`, mode sentinels on every run and on the dev deploy and live check, and the mode-off rebuild procedure for PB-4.
6. Decide Option D or L for the Klaviyo proof (do not skip the proof for want of a Netlify readout if Option L is available); record decisions or follow-ups for Relay Q4 to Q8, with the missing live-host guard on the popup logged as a named follow-up.
7. Add to the checkpoint list: gating-edit approval, playwright-core install go, vendor script download go, interceptor lane, Option D or L, the Klaviyo write go with the disposable addresses, and the phone autofill check (no submit) in TG-8.
8. For Option D, state the guard allowlist change for the deploy host with a rerun self-test, and the read-only flow check on list `XGTv2F` and metric `XNJKbF` before the write.
9. Create the decision log with D1; add a ship-time `git fetch` drift check and a fast-forward check on `origin/dev` to SH-1.
10. Define the CP-18 card order; state that axe-core runs from `node_modules` injected into a guarded page; add a gate column to every Revision 2 addition (MN-8 to MN-10, JR-7 to JR-10, CP-19, CP-20, MC-1, CL-1 to CL-7, SH-1, NR-5).
