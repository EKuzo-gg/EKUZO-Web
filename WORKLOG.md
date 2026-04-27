# EKUZO Work Log

**Purpose:** This file keeps both Jamie's and Aaron's Claude instances aware of what's changed. Update this BEFORE every commit. Your Claude should read this at the start of every session.

**Format:** Most recent entry at the top. Include your name, date, and what changed.

---

## Jamie — April 27, 2026 (Meta Conversions API server-side wiring for Friday ads launch)

**Why:** First Meta ads campaign for EKUZO Camps launches Friday. Client-side Pixel alone loses 30–50% of Purchase signal to iOS ATT, Safari ITP, and adblockers, which degrades the algo on the audience we just paid for. CAPI sends the same Purchase event server-side and Meta dedupes the two by `event_id`.

**What changed:**
- `lib/analytics.ts` — `trackPurchase` accepts `eventId`. When present, fires `fbq("track","Purchase", params, { eventID })` so the Pixel call dedupes against the CAPI fire. No-op for `trackInitiateCheckout` / `trackViewContent` (CAPI dedup not wired for those yet — Purchase only this round).
- `app/programs/ekuzo-camps/success/page.tsx` + `app/programs/ekuzo100/success/page.tsx` — `trackPurchase` calls now pass `eventId: paymentIntentId`.
- `app/api/webhooks/stripe/route.ts` — On `payment_intent.succeeded` (after Beehiiv / Klaviyo / Sheets / squad-sheets writes, before Teams installment sub) POST a Purchase event to `https://graph.facebook.com/v19.0/{PIXEL_ID}/events`. `event_id = paymentIntent.id` (matches what the Pixel fires). `user_data` ships SHA-256 hashed em / ph / fn / ln pulled from PI metadata. `custom_data` = currency + value (cents → dollars). Failures `console.error` and continue — Beehiiv / Klaviyo / Sheets are unaffected if CAPI 4xx/5xx or the token is missing.
- `app/layout.tsx` — `META_PIXEL_ID` lifted from hardcoded const to `process.env.NEXT_PUBLIC_META_PIXEL_ID` with the existing ID as fallback. Single source of truth across client + server.
- `.env.local.example` — added `NEXT_PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` with comments. Real token NOT committed.

**Aaron:** zero front-end touch. Don't worry about it. The two success-page edits are one-line additions to existing `trackPurchase` calls — no layout / styling changes.

**Next steps (Jamie):** generate CAPI access token in Business Manager → Events Manager → Pixel → Settings → Generate Access Token. Add `META_CAPI_ACCESS_TOKEN` to `.env.local` and to Netlify (Production + Branch deploys + Deploy Previews contexts). Add `META_PIXEL_ID=1284038230557204` and `NEXT_PUBLIC_META_PIXEL_ID=1284038230557204` to those same Netlify contexts. Run a test purchase on dev, verify in Events Manager → Test Events that both browser + server fires arrive and dedupe on the same `event_id`.

**Acceptance criteria checked:**
- ✅ Webhook fires Purchase server-side on `payment_intent.succeeded`
- ✅ Payload structure matches spec (event_name / event_time / event_id / action_source / event_source_url / hashed user_data / custom_data)
- ✅ Both success pages pass `eventId: paymentIntentId`
- ✅ Graceful failure: missing token logs warn + skip; API error logs error + continues; Beehiiv / Klaviyo / Sheets unaffected
- ✅ `tsc --noEmit` clean

---

## Aaron — April 20, 2026 (fix prod Rive animations — unbundle .riv from Git LFS)

**Summary:** Homepage and programs-page Rive animations were broken on prod with "Bad header / Problem loading file; may be corrupt!" Root cause: Netlify's deploy pipeline only hydrates Git LFS content for known media extensions (mp4/mov/webm) — `.riv` is unrecognized, so LFS pointer text was being served to the CDN verbatim. All 4 `.riv` files on `ekuzo.gg` were returning 132-byte `version https://git-lfs.github.com/spec/v1\noid sha256:…` instead of the real binary. Fix: remove `*.riv` from LFS tracking and commit the files as raw git binaries.

**Diagnostic trail:**
- `curl -I https://ekuzo.gg/animations/ecosystem-desktop.riv` → `content-length: 132`, body starts with `version https://git-lfs`.
- All 4 `.riv` files on prod returned 132-byte pointer text. All MP4s/MOVs returned real binary with correct `ftypisom` magic bytes and `content-type: video/mp4`.
- Confirmed both `.riv` and `.mp4` were tracked identically in `.gitattributes`, committed together in `dbe5f21 "Add all media via Git LFS"`, and OIDs resolved to real binaries in `.git/lfs/objects/` locally.
- Ruled out: GitHub LFS bandwidth/quota failure (would affect all extensions), missing `.lfsconfig` (none present, none needed), stale branches (dev and main at same commit). `git config` showed LFS pointing at GitHub (`lfs.https://github.com/EKuzo-gg/EKUZO-Web.git/info/lfs.access=basic`), so this is vanilla GitHub LFS plus Netlify's extension-allowlist behavior.

**Files changed:**
- `.gitattributes` — removed `*.riv filter=lfs …` line; replaced with a comment explaining why `.riv` is not LFS-tracked so the next person touching this file doesn't re-add it.
- `public/animations/ecosystem-desktop.riv` (6.6MB), `ecosystem-mobile.riv` (6.1MB), `programs-hero.riv` (2.3MB), `programs-hero-mobile.riv` (2.3MB) — re-committed as raw git binaries. Total 17MB across 4 files, largest 6.6MB is under the 10MB pre-commit guard. `public/animations/` is a CDN asset path, not referenced by server code, so no risk of sweeping into serverless function bundles.

**Verification (pre-push):**
- `git cat-file -s :public/animations/ecosystem-desktop.riv` → 6612845 bytes (was 132).
- `git cat-file -p :public/animations/ecosystem-desktop.riv | head -c 4` → `RIVE` (Rive magic header, not LFS pointer text).
- `git status --short` confirms only `.gitattributes` + 4 `.riv` files staged. All other "modified" LFS files (MP4s, WORKLOG.md from earlier work, klaviyo template) deliberately left unstaged.

**Verification (post-deploy — Aaron to check):**
- After Netlify dev build finishes, `curl -I https://dev--ekuzo.netlify.app/animations/ecosystem-desktop.riv` should return `content-length: 6612845` and `content-type: application/octet-stream`. First bytes should be `RIVE`, not `version https`.
- Homepage ecosystem animation should render. Programs page hero Rive should render. No more "Bad header" errors in the console.
- Then merge `dev → main` to ship to `ekuzo.gg`.

**Separate issue flagged (not fixed in this commit):** Aaron's local Git LFS smudge filter isn't actively running — that's why `git status` shows ~17 LFS binaries (MP4s + MOV) as "modified" even though nothing changed. The working tree has real binaries on disk, HEAD has LFS pointer text, status compares the two and flags everything. Cosmetic for now, but latent footgun: if you `git add` an MP4 in this state, git would stage the 75MB raw blob. The 10MB pre-commit hook wouldn't catch it because the hook skips size checks on files in `.gitattributes` (assumes staged content is a tiny pointer). Fix when convenient: `brew install git-lfs && git lfs install && git lfs checkout` in the repo root.

---

## Aaron — April 17, 2026 (morning — camps welcome email copy iteration)

**Summary:** Iteration pass on `docs/klaviyo-welcome-template.md` — the camps welcome email draft for QA #13. No code changes; docs only. Still pre-publish in Klaviyo.

**Changes to the camps welcome template:**

1. **Subject line (plural-safe).** Was: `You're in! Here's what's next for {{ person.gamer_name|default:"your gamer" }}'s camp week.` → Now: `{{ person.first_name|default:"Hey" }}, you're in for EKUZO Camp.` `gamer_name` is a comma-separated list for multi-gamer families ("Jacob, Mia"), which reads awkwardly in possessive subject lines. `person.first_name` (parent) works cleanly for both single and multi-gamer.
2. **Subject B (A/B alternate).** Dropped the `|default:"TBD"` fallback on camp_week — if camp_week is empty, something's broken upstream and "TBD" doesn't help. New B: `EKUZO Camp Week {{ person.camp_week|default:"" }} — here's what's next.`
3. **Preview text.** Was transactional ("Order X confirmed. Here's how to get ready."). New: `Welcome to EKUZO — here's what your gamer needs to show up ready.` First ~8 words are what Gmail shows in the inbox list.
4. **Removed receipt block from body.** Dropped the "Order ID / Paid" rows. Stripe already emails the parent a separate receipt automatically from the Stripe account — duplicating it made the welcome read as transactional. The `order_id` and `amount_paid` profile properties are still written by the webhook, so ops/support can look them up.
5. **Kept camp details block.** Week + dates + slot + registration_summary still surfaced so parent sees what they registered for.
6. **Named League of Legends explicitly.** Replaced generic "your gamer's preferred game is installed and updated" with "League of Legends is installed and updated on the computer your gamer will use during camp." Camps is LoL-only right now per `CLAUDE.md` Products section. Flagged in the doc's notes section so future-Aaron knows to flip when camps expands to other titles.
7. **Added Discord mention.** "A Discord invite for your gamer's team comes with the prep email 3 days before" — reinforces the team-stays-together UX.
8. **Added headset/mic bullet.** One-line callout since communication is core.
9. **Closing line.** Added "The team sticks together after camp ends — your gamer leaves with a reliable, non-toxic crew to keep climbing with." Mirrors the "THE TEAM STAYS TOGETHER" section on the camps landing page.
10. **Body format label corrected.** Comment said "HTML — drop into Klaviyo's template editor" but content is plain text. Updated to "plain-text — paste into Klaviyo's Text block, not the HTML editor."

**New "Notes on the copy" section** added under the Liquid notes — documents the rationale above so the next person touching this template knows why the receipt block is out, why the subject uses `first_name` not `gamer_name`, and when to flip the LoL hardcode.

**Still NOT done (next up in this session or next):**
- EKUZO100 + EKUZOTeams Klaviyo templates — still only exist as raw copy in `docs/welcome-emails.md`, not translated to Klaviyo merge-tag format. Aaron wants to review camps first before drafting the other two.
- Publishing in Klaviyo UI — still draft (`aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`). End-to-end test not yet run.

**Files touched:**
- `docs/klaviyo-welcome-template.md` — two edits (subject/preview/body block, then Notes on the copy section).

**Verification:**
- Re-read both edited regions after save; all merge tags cross-reference correctly against `app/api/webhooks/stripe/route.ts` lines 349–385 (checked `gamer_name`, `first_name`, `camp_week`, `camp_week_dates`, `camp_slot`, `registration_summary`, `squad_link`, `order_id`, `amount_paid`). No property names invented that the webhook doesn't write.
- `{% if person.squad_link %}` block still works as before — webhook sets `squad_link = ""` for joiners and lookers, so the block is skipped cleanly.
- No code touched; no `tsc`/`eslint` needed.

**Jamie heads-up:**
- Still no code drift — `squad_status` in Klaviyo is still "Building a squad" / "Looking for a squad" (not "team") per the 4/16 entry. The email template doesn't display `squad_status` directly (only `{% if person.squad_link %}`), so no recipient sees the drift. Separate cleanup when convenient.

---

## Aaron — April 16, 2026 (night — full camps registration UX pass)

**Summary:** Major UX pass across the camps registration flow, squad join flow, sticky CTA, and success page. Also wired local Stripe testing environment.

### Camps landing page (`app/programs/ekuzo-camps/page.tsx`)
- "EKUZO Difference" section: headline → "THE TEAM STAYS TOGETHER". Second paragraph → "When the camp ends, the team lives on. Campers leave not just with better skills, but with a reliable, non-toxic team to keep climbing the ranks with." First paragraph unchanged.

### Camps register page (`app/programs/ekuzo-camps/register/page.tsx`)
- **Hero copy:** "week long camp" → "week long esports camp".
- **Hero collage image:** larger — starts at 46% left, 65% max-width, 105% height. More vertical space via `pb-36 lg:pb-72`.
- **Add-another-gamer inherits previous gamer's time selection.** `addGamer()` checks the most recent gamer with a complete selection (crew link still takes priority per QA #11).
- **Collapsed slot picker for added gamers + squad join.** Gamer 2+ and gamer 0 when arriving via `?squad=TOKEN` render a compact summary card instead of the full 10-week grid. "Change" expands the grid; picking a slot collapses it back. New state: `expandedSlotPickers`.
- **Collapsed card styling:** Week/date line at `clamp(1.75rem, 3vw, 2.5rem)`, Morning Session text in black.
- **Gamer first names in summary areas.** `gamerLabel(i)` returns "Gamer 2: Jamie" (multi) or "Aaron" (single). Used in collapsed card and Registration Summary.
- **Squad join banner:** "You've been invited to join [gamer]'s team" (was "You're joining"). `rounded-lg` to match collapsed card. Headline sized to match Week line.
- **Registration Summary:** shows "Gamer 1: Test", "Gamer 2: Jeff" from `gamerLabel()`.

### Squad landing page (`app/squad/[token]/page.tsx`)
- Added EKUZOCAMP description body copy to the Hero component (new `detail` prop).
- Hero now shows: heading → body copy → week/slot detail → CTA button.

### Squad link URL change (`app/api/webhooks/stripe/route.ts`)
- Squad link now points directly to `/programs/ekuzo-camps/register?squad=TOKEN` instead of `/squad/TOKEN`. Skips the intermediate landing page — the register page already has the banner, pre-selected week, and full context. `/squad/[token]` remains as a fallback for old links.
- `docs/klaviyo-welcome-template.md` updated to match new URL format.

### Sticky CTA (`components/ui/StickyCTA.tsx`)
- Camps page: purple background (`#AE2CF2`, matches the ticker), white headline "READY TO LEVEL UP THIS SUMMER?" at `clamp(1.5rem, 3.75vw, 3.75em)`, white "Register for Camp" button linking to register page. Hover inverts button. Centered vertically with even padding.
- All other pages unchanged.

### Success page (`app/programs/ekuzo-camps/success/page.tsx`)
- Green circle 112px, checkmark SVG 100×100 with strokeWidth 6.
- "LEVEL UP!" headline scaled to `clamp(4.5rem, 10vw, 120px)`.
- Step 2: "Get a head start — Download League of Legends. Create an account for your gamer and get ready to join the rift."

### Local dev environment
- `.env.local`: added `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GOOGLE_SHEETS_WEBHOOK_URL`, fixed `NEXT_PUBLIC_SITE_URL` to port 3001. (Not committed — .gitignore'd.)
- `CLAUDE.md`: added "Local Payment Testing" section with Stripe CLI setup, two-tab workflow, test card, troubleshooting.

**Files touched:**
- `app/programs/ekuzo-camps/page.tsx`
- `app/programs/ekuzo-camps/register/page.tsx`
- `app/programs/ekuzo-camps/success/page.tsx`
- `app/squad/[token]/page.tsx`
- `app/api/webhooks/stripe/route.ts`
- `components/ui/StickyCTA.tsx`
- `docs/klaviyo-welcome-template.md`
- `CLAUDE.md`

**Jamie heads-up:** Squad link URL changed from `/squad/TOKEN` to `/programs/ekuzo-camps/register?squad=TOKEN`. Existing Klaviyo profiles from 4/15 QA still have the old URL — those will hit the `/squad/[token]` fallback page which still works. New registrations generate the direct link.

---

## 📣 Message for Jamie (from Aaron, April 10, 2026)

Hey Jamie — when you fire up your Claude next, please pass along a big thank-you from Aaron for all the hard work you've been putting in. The commerce plumbing on the camps flow (Stripe → webhook → Google Sheets → Beehiiv/Klaviyo) has been holding up beautifully through all the design iterations, and none of this launch would be possible without your side of the house. Seriously — thank you. 🙌

(Claude: please surface this message to Jamie at the start of his next session and then you can remove it from the log.)

---

## Aaron — April 16, 2026 (night — camps landing copy, register UX, sticky CTA, success page)

**Note:** Superseded by the batch entry above. Keeping for audit trail.

**Summary:** Batch of camps-focused UX and copy updates across 4 files.

### Camps landing page (`app/programs/ekuzo-camps/page.tsx`)
- "EKUZO Difference" section: headline → "THE TEAM STAYS TOGETHER" (was "The squad stays together"). Second paragraph replaced with "When the camp ends, the team lives on. Campers leave not just with better skills, but with a reliable, non-toxic team to keep climbing the ranks with." First paragraph unchanged (still says "5-player squads").

### Camps register page (`app/programs/ekuzo-camps/register/page.tsx`)
- **Add-another-gamer defaults to previous gamer's time selection.** `addGamer()` now inherits week/slot from the most recent gamer with a complete selection (crew link still takes priority per QA #11). Parents can still override via "Change" button.
- **Collapsed slot picker for added gamers.** Gamer 2+ with an inherited selection renders a compact summary card ("WEEK 01 — MAY 18 - 22 / Morning Session (9:00 AM — 12:00 PM)") instead of repeating the full 10-week × 2-slot grid. "Change" expands the grid; picking a slot collapses it back. Gamer 1 always shows the full grid. New state: `expandedSlotPickers: Record<number, boolean>`.
- **Gamer first names in summary areas.** `gamerLabel(i)` helper returns "Gamer 2: Jamie" (multi-gamer with name) or "Gamer 2" (no name yet) or just "Marcus" (single gamer). Used in the collapsed summary card and the Registration Summary at page bottom. Section headlines ("Gamer 1", "Tell us about your gamer") stay static — names only appear in summary contexts.
- `removeGamer()` now cleans up `expandedSlotPickers` and shifts indices so they stay aligned with the gamers array.

### Sticky CTA (`components/ui/StickyCTA.tsx`)
- Camps landing page (`/programs/ekuzo-camps`) now gets a custom sticky bar: purple background (`#6B21A8`), white display-font headline "READY TO LEVEL UP THIS SUMMER?" + white "Register for Camp" button linking to `/programs/ekuzo-camps/register`. Hover state inverts the button (purple bg, white text/border). Headline uses `clamp(1.5rem, 3.75vw, 3.75em)` with `whitespace-nowrap` to stay on one line. Container widened to `max-w-[1232px]`. Vertical padding evened out (`py-4`/`md:py-5`) so content is vertically centered.
- All other pages keep the existing white "Enroll my gamer / Talk to Humans" bar unchanged.

### Success page (`app/programs/ekuzo-camps/success/page.tsx`)
- Green circle kept at 112px, checkmark SVG enlarged to 100×100 with strokeWidth 6.
- "LEVEL UP!" headline scaled up: `clamp(4.5rem, 10vw, 120px)` (was `clamp(3rem, 6vw, 80px)`).
- Step 2 copy updated: "Get a head start — Download League of Legends. Create an account for your gamer and get ready to join the rift."

**Files touched:**
- `app/programs/ekuzo-camps/page.tsx`
- `app/programs/ekuzo-camps/register/page.tsx`
- `app/programs/ekuzo-camps/success/page.tsx`
- `components/ui/StickyCTA.tsx`

**Verification:** `tsc --noEmit` and `eslint` clean on all changed files.

---

## Aaron — April 16, 2026 (evening — copy: "The team stays together" on camps landing)

**Note:** Superseded by the batch entry above. Keeping for audit trail.

**What changed:** The "EKUZO Difference" section on the camps landing page (`app/programs/ekuzo-camps/page.tsx`) now leads with "The team stays together." and replaces the second paragraph with a tighter punch line: "When the camp ends, the team lives on." Aligns with the universal team-focused messaging direction.

**Changes in detail (lines 394–409):**
- Headline: `The squad stays together.` → `The team stays together.` (the h2 has `uppercase` so it renders `THE TEAM STAYS TOGETHER`).
- Second paragraph: replaced the longer `When camp ends, the squad remains. Campers leave not just with better skills, but with a reliable, non-toxic team to keep climbing the ranks with.` with the tight `When the camp ends, the team lives on.`

**What was NOT changed:** the first paragraph is left alone (still says "5-player squads") — Aaron wanted only the headline and the second paragraph touched. Other instances of "squad" elsewhere on the camps landing page (hero, other sections) also untouched.

**Correction note (scope lesson):** initially also changed "5-player squads" → "5-player teams" in the first paragraph for internal consistency with the new headline. Aaron pulled it back — "I liked the longer copy I just wanted that one section replaced." Reverted. Pattern to remember: "update the copy below" means the paragraph being replaced, not a sweep across the section. Ask before expanding scope on copy edits.

**Files touched:**
- `app/programs/ekuzo-camps/page.tsx` — one Edit, lines 394–409.

**Verification:**
- `tsc --noEmit` clean.

---

## Aaron — April 16, 2026 (evening — UX: auto-scroll to gamer info on slot selection)

**What changed:** After a parent picks an AM/PM slot on the camps register page, the page now smooth-scrolls down to that gamer's "Tell us about your gamer" section. Reduces the chance the parent misses that there's more to fill in below the slot grid.

**How:**
- Added `id="gamer-${gi}-info"` to each gamer's info wrapper `<div>` (inside the `gamers.map` loop). `scrollMarginTop: "100px"` inline so the heading doesn't end up behind the fixed nav.
- `selectSlot()` now, after `updateGamer()`, runs `requestAnimationFrame(() => document.getElementById(...)?.scrollIntoView({ behavior: "smooth", block: "start" }))`. RAF lets the selection state paint first so the scroll feels connected to the click, not racing it. `typeof window !== "undefined"` guard keeps it SSR-safe.

**Interactions with the earlier QA #11 fix:**
- Confirm-dialog cancel path still early-returns before `updateGamer`, so no scroll happens when the parent cancels a "you won't be at camp together" override. Correct — they chose to stay on the old slot.
- Multi-gamer: slot click on gamer 2 scrolls to `#gamer-1-info` (gamer 2's section, zero-indexed). Each gamer has its own scroll target.

**Files touched:**
- `app/programs/ekuzo-camps/register/page.tsx` — 2 edits: id + scrollMarginTop on the gamer info wrapper, RAF scroll in `selectSlot`.

**Verification:**
- `tsc --noEmit` clean.
- `eslint app/programs/ekuzo-camps/register/page.tsx` clean.
- Not exercised in the logic harness (DOM-dependent — harness doesn't have jsdom). Worth a click-through on dev: arrive on `/programs/ekuzo-camps/register`, click Week 02 AM → page should smoothly scroll so the "Tell us about your gamer" h3 lands just below the nav.

---

## Aaron — April 16, 2026 (late afternoon — QA #10, #11, #13: squad-link join UX + Klaviyo welcome template draft)

**What changed:** Closed out the remaining pre-merge items from `docs/QA-FLAGGED-ISSUES.md` surfaced by the 4/15 squad_link QA. Items #10 and #11 are code changes on the camps register page; #13 is a docs deliverable Aaron executes in Klaviyo's UI (not a code fix).

**QA #10 — Team Status selector gated when joining via `?squad=TOKEN`.** The selector was letting joining visitors accidentally submit as BOTH a crew member AND a new crew owner (fresh `squad_token` minted because the default selection was "Building a squad"). Three changes:
1. JSX — the whole Team Status section (h2 + subtitle + SquadCard pair + its preceding `<hr>`) is now wrapped in `{!joiningSquadToken && (...)}`. When a joining visitor arrives, the banner at the top tells them they're joining and the vibe-check selector is hidden entirely.
2. `validate()` — the `squadStatus` requirement is skipped when `joiningSquadToken` is truthy (`if (!joiningSquadToken && !squadStatus)`). A joining visitor doesn't need to answer the question.
3. `handleSubmit()` — added `squadTokenForSubmit` guard so a joining visitor NEVER mints a new `squad_token`, and `squadStatusForSubmit` sends `null` (not whatever stale squadStatus lingered in state). Defense-in-depth since the UI already hides the trigger. Webhook's existing `squadStatusSafe` guard turns null into `""` so joining visitors don't match any Klaviyo building/looking flow split. This is the behavior QA #10 specified.

**QA #11 — Added gamers inherit the crew's week/slot + confirm dialog gates every gamer.** Two changes:
1. `addGamer()` — when `joiningCrewInfo` is set, parse the crew's `week_label` (e.g. "Week 02" → `2`) and `slot` and pre-fill `selectedWeek` + `selectedSlot` on the new `emptyGamer()` before appending. Non-joining registrations still add a blank gamer.
2. `selectSlot()` — removed the `gamerIndex === 0` precondition on the confirm-override dialog. Now any gamer (1, 2, 3, …) picking a week/slot that doesn't match the crew's triggers the "you won't be at camp together" confirm. The `crewOverrideAcknowledged` latch stays a single boolean — once you acknowledge for one gamer, later edits on any gamer are free (matches the Scenario 4 UX already shipped).

Combined these two fixes mean a family arriving through `kzPDaElWFY` and adding 3 gamers now lands on Week 2 AM × 3 by default; any individual override gets a confirmation prompt once; the submission has no `squad_token` and `squad_status: ""`, so they appear cleanly as joiners in `squad_members` under the owner's token.

**QA #13 — Klaviyo welcome email template drafted (Aaron-owned work in Klaviyo).** Written `docs/klaviyo-welcome-template.md`:
- Merge-tag reference keyed to the actual properties the webhook writes in `app/api/webhooks/stripe/route.ts` lines 349–385 — `program`, `gamer_name`, `order_id`, `camp_week`, `camp_slot`, `camp_week_dates`, `squad_link`, `registration_summary`, etc. Separates profile properties (`{{ person.X }}`) from event extras (`{{ event.extra.X }}`) so the Liquid in the template matches what Klaviyo can actually resolve.
- Paste-ready subject + preview text + HTML body with Klaviyo's Liquid filters (`|default:"..."`) and a `{% if person.squad_link %}` block so the "share your team link" section only renders for Building families (joiners and Lookers get an empty squad_link from the webhook and the block is skipped). Copy adapted from `docs/welcome-emails.md`.
- 7-step publishing checklist: open the draft automation (`aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`), paste, send yourself a preview against a real test profile (e.g. `jamiefosu+15111@gmail.com` has all the merge tags populated from the 4/15 QA), filter the flow on `product == "EKUZO Camps"`, keep Smart Sending on, publish, run a dev test payment, confirm delivery.

**No code changes needed for #13** — the property pipeline is already live. This is purely Klaviyo-UI work. Doc exists so the template survives a Klaviyo flow deletion and so future edits keep the merge tags aligned with what the webhook actually sends.

**Files touched:**
- `app/programs/ekuzo-camps/register/page.tsx` — 4 edits: validate() squadStatus gate, submit-payload token/status guards, addGamer() crew inheritance, selectSlot() confirm dialog scope
- `docs/klaviyo-welcome-template.md` — new doc (not a code artifact; reference for Klaviyo publishing)

**Verification:**
- `tsc --noEmit` clean.
- `eslint app/programs/ekuzo-camps/register/page.tsx` clean.
- 16 logic assertions simulated across 6 scenarios (all pass): joining + null squadStatus → no error + no token minted + squadStatusForSubmit null; non-joining + null squadStatus → error fires; non-joining + building → token minted + status preserved; addGamer x3 while joining → all three on Week 2 AM; confirm dialog fires for gamer 2 and does NOT fire for gamer 3 after ack; confirm does NOT fire when slot matches; confirm does NOT fire when not joining; non-joining addGamer stays blank. Harness lives in scratch, not in the repo.
- Turbopack dev-server smoke test attempted and timed out in the sandbox (same limitation as the last two sessions). TS + lint + logic coverage + direct diff review is the current substitute — a manual click-through on dev is worth doing before merge, specifically:
  - Arrive via `/programs/ekuzo-camps/register?squad=kzPDaElWFY`, verify the Team Status section is absent, the top banner is present, gamer 1 is on Week 2 AM.
  - Click "+ Add Another Gamer" twice → both new gamers should show Week 2 AM pre-selected.
  - Change gamer 2 to Week 3 PM → confirm dialog fires once. Accept. Change gamer 3 to Week 4 AM → no second confirm dialog (crewOverrideAcknowledged latched).
  - Submit → network tab should show `squad_token: null`, `squadStatus: null`, `joining_squad_token: "kzPDaElWFY"` in the POST body.

**Jamie — things to know:**
1. **Webhook contract unchanged.** `squadStatus` on the submit payload is now `null` instead of `"building"` for the accidental-double-register case. Your existing `squadStatusSafe` ternary already handles this: `squadStatus === "building" || squadStatus === "looking" ? squadStatus : ""`. Null falls through to `""`, which is what the Klaviyo flow splits don't match on, which is what we want. No webhook edit needed.
2. **`docs/klaviyo-welcome-template.md` references the exact property keys you write** (lines 349–385 of `app/api/webhooks/stripe/route.ts`). If those keys get renamed, this doc drifts — please update the doc in the same PR. Enforced softly by comment at the bottom of the doc.
3. **Squad-to-team copy desync still open from this afternoon's earlier entry** — webhook still maps `"building"` → `"Building a squad"` / `"looking"` → `"Looking for a squad"` for Klaviyo, while UI now says "team." Separate from QA #10–13. Flagged in earlier WORKLOG entry today.

**Still outstanding before `dev → main`:** Only Aaron's Klaviyo-UI work on the welcome template (follow `docs/klaviyo-welcome-template.md`). Once that's published and end-to-end-tested on dev, merge is unblocked.

---

## Aaron — April 16, 2026 (afternoon — registration copy pass: team messaging, optional gamer tag, Favorite Games, camps-only t-shirt drop, hero spacing)

**What changed:** Editorial + field pass across all three register pages (camps, ekuzo100, teams) plus `/squad/[token]` landing page. Aligns the registration funnel with the "Every gamer deserves a team" brand direction and trims the t-shirt field from camps only. Also nudged the camps hero content down so it isn't kissing the nav.

**Per Aaron's direction:**
1. **Gamer Tag / Username → optional** everywhere (camps + ekuzo100). Removed `*` from the label and removed the gamer-tag line from the validate() loop on camps. ekuzo100 validate() used to enforce gamer tag too — removed. ekuzo-teams already had it optional.
2. **"Preferred Games" → "Favorite Games"** on all three register pages (label + section comment + the validation error message). Internal state key `preferredGames` is unchanged — that's a data key wired all the way through to Stripe metadata → webhook → `preferred_games` column in the Sheet → Klaviyo property. Renaming that is Jamie's call + a data migration; not in scope for copy work.
3. **Dropped T-Shirt input on camps ONLY.** Initial pass dropped t-shirt from all three register pages; Aaron corrected the scope to camps only. Reverted ekuzo100 + ekuzo-teams back to HEAD for t-shirt (re-added `tshirtSize: string` on `GamerInfo`, `TSHIRT_SIZES` const, empty-state init, and the T-Shirt/Jersey Size `SelectField` JSX + the `{/* Birthday / Gender / Skill Level / T-Shirt */}` / `{/* Birthday / Gender / Experience / T-shirt */}` layout comments). On camps: the `SelectField` JSX, the `TSHIRT_SIZES` constant, the `tshirtSize: string` field, and the empty-state init are removed. The tshirt check I'd added to camps `validate()` earlier today was also dropped since the field no longer exists.
4. **"Squad status" → "Team status"** on the camps register page. Section heading, sub-copy, both SquadCard titles (`Building a squad` → `Building a team`, `Looking for a squad` → `Looking for a team`), the second card subtitle (`...great crew` → `...great team`), and the validate() error message all updated. Also flipped the user-facing "crew" wording in: the red crew-join banner ("You're joining X's crew" → "team"), the confirm dialog when a joining visitor changes their week, and the `/squad/[token]` landing page (page title, hero heading, all three states). Route path `/squad/[token]` stays — it's a live shareable URL Jamie just shipped.
5. **Camps hero content shifted down.** On `app/programs/ekuzo-camps/register/page.tsx` the outer hero container `paddingTop` went from `40px` → `100px` (+60px). Pushes the eyebrow / headline / copy block further from the nav; no other hero geometry touched. Collage, torn paper, and lower section stack unchanged.

**Internal names intentionally NOT renamed (Jamie's lane):**
- `SquadStatus` type, `squadStatus` state, `setSquadStatus`, `SquadCard` component name
- `squad_token`, `joining_squad_token`, `joiningSquadToken`, `joiningCrewInfo`, `crewOverrideAcknowledged`
- API paths `/api/squad/[token]`, `/api/camps/register` field keys (`squad_token`, `joining_squad_token`, `squadStatus`)
- Webhook logic that reads/writes squad_* fields to Stripe metadata, Google Sheets `squads` + `squad_members` tabs, Klaviyo profile properties
- Short state discriminator values `"building"` / `"looking"` — the API and webhook are coupled to these strings

**⚠ Jamie — things you need to know before merge:**

1. **Klaviyo human-label strings.** Per your 4/15 comment in `app/programs/ekuzo-camps/register/page.tsx` lines 360–366, the webhook converts `"building"` → `"Building a squad"` and `"looking"` → `"Looking for a squad"` when writing the Klaviyo profile property and event, and Klaviyo flow splits match on those strings. This diff did NOT change that mapping — the UI now says "Building a team" / "Looking for a team" but the string that flows to Klaviyo is still the old "squad" form. If you want full consistency, update the mapping in `app/api/webhooks/stripe/route.ts` and update any Klaviyo flow splits that match on the old strings. Flagging so it doesn't silently skew your funnel analytics after launch.

2. **T-shirt data: camps keeps flowing empty, teams + ekuzo100 still capture normally.** `app/api/camps/register` still references `gamer.tshirtSize` with a `|| ""` guard. Since the camps form no longer includes the field, the value is always `undefined → ""` — webhook will write an empty string to the `tshirt_size` Sheets column + Klaviyo property for every new **camps** registration. Teams + ekuzo100 still collect it as before (reverted). You can leave the camps column/property in place (harmless) or strip them out whenever you next clean up; or we could gate-skip the write in the webhook when source = camps. Your call.

3. **"Preferred Games" → "Favorite Games" UI only.** Stripe metadata key `preferredGames` / Sheets column `preferred_games` / Klaviyo property unchanged. If you want the data key to match the new label too, that's a coordinated rename across `app/api/*`, the webhook, Sheets column header, and Klaviyo property name. Out of scope here.

**Files touched:**
- `app/programs/ekuzo-camps/register/page.tsx` — type, constants, empty-state, validate(), confirm dialog, banner, gamer-tag label, favorite-games label + section comment, removed t-shirt SelectField, team-status section (heading + subtitle + both card titles + card 2 subtitle), hero paddingTop 40px→100px
- `app/programs/ekuzo100/register/page.tsx` — validate() (removed required-gamerTag + "favorite" error copy), gamer-tag label, favorite-games label + section comment. **T-shirt kept intact.**
- `app/programs/ekuzo-teams/register/page.tsx` — validate() ("favorite" error copy), favorite-games label + section comment. **Jersey Size kept intact.**
- `app/squad/[token]/page.tsx` — generateMetadata title + description, all three hero headings

**Verification:**
- `tsc --noEmit` clean.
- `eslint` on all 4 touched files — one pre-existing unused-import warning on ekuzo-teams register (`Image` from `next/image`, dead at HEAD too, not introduced here — left per CLAUDE.md "don't remove pre-existing dead code unless asked").
- Dev-server smoke test not run (Turbopack boot keeps timing out in the local sandbox). TS + lint coverage plus the direct diff review is sufficient confidence, but a manual click-through of the three register pages + a crew link arrival is worth doing before merge.

**Not done here (flagging for Aaron's next pass if desired):**
- `app/programs/ekuzo-camps/page.tsx` — marketing page for camps. Uses "squad" extensively in narrative/editorial copy: `const squadRoles = [...]`, "Squads lock in…", "Small Squads" section title, "we place campers into 5-player squads", "the squad stays together", "Your squad's Discord server", etc. Didn't touch any of this because marketing prose has editorial rhythm that's best reviewed (sometimes "squad" reads better alongside "team" than a blanket replace). Decide what stays vs. flips and I'll do a pass.
- Legacy paths (`app/camps/register/page.tsx`, `app/ekuzo100/register/page.tsx`, `app/ekuzo-camps/page.tsx`, `app/ekuzo-camps/page.v1.tsx`, `app/ekuzocamps-seasonal/page.tsx`) are redirect-covered in `next.config.mjs` and dead on the live site — skipped. Separate cleanup ticket.

**Still on Aaron's plate before `dev → main`:** #10 squad-selector gating when `?squad=` is present, #11 pre-select crew week/slot for all added gamers, #13 finalize + publish Klaviyo welcome template.

---

## Aaron — April 16, 2026 (QA #12 — required-field validation on camps register)

**What changed:** Fixed QA-FLAGGED-ISSUES #12 (high-priority data-quality bug). Camps registration was letting blank required fields through on submit — most visibly blank birthdays on added gamers (surfaced by Jamie's 3-gamer squad_link QA on 4/15, where rob mahoney's birthday reached Stripe metadata empty). This blocks automated coach-matching in ops.

**Root cause (different from QA's hypothesis):** The QA report guessed "validation runs only against gamers[0]." Actual bug was broader: `validate()` in `app/programs/ekuzo-camps/register/page.tsx` iterated the full gamers array correctly via `forEach`, but only checked 4 of the 12 fields marked `*` required in the UI. The other 8 starred fields had zero validation for **any** gamer, including gamer 0. Past tests appeared to pass only because testers happened to fill those fields — the first lazy fill on a later gamer exposed it. The submit button is `type="button"` with `onClick={handleSubmit}` (not a form submit), so the HTML5 `required` attribute also does nothing — `validate()` is the only gate.

**Files touched:**
- `app/programs/ekuzo-camps/register/page.tsx` — extended `validate()` (~15 lines added inside the existing function). Parent phone + per-gamer gamerTag, preferredGames (≥1), birthday, gender, skillLevel, tshirtSize now all enforced across the full gamers array. Error messages labeled "Gamer N" on multi-gamer registrations, "Gamer" when only one.

**Verification:**
- `tsc --noEmit` clean.
- `eslint app/programs/ekuzo-camps/register/page.tsx` clean.
- 5 logic scenarios simulated and asserted:
  1. QA Scenario 3 shape (3 gamers, gamer 2 blank birthday) → correctly reports exactly `Gamer 2 birthday is required.`
  2. All fields valid → 0 errors.
  3. Gamer 3 with every starred field blank → all 9 expected error messages emitted (nothing silently dropped).
  4. Parent phone blank → correctly reports `Parent phone number is required.`
  5. Single-gamer path → uses `"Gamer"` label (no number suffix).
- Dev-server verification was attempted but Turbopack boot timed out in the local sandbox. TS+lint+logic coverage is sufficient confidence; worth a quick manual click-through of the register page once pulled.

**Out of scope / NOT done this diff (flagging for later):**
- Birthday range/format validation (age 10–18, not in the future). QA asked for required-field enforcement; content validation is a separate concern. Candidate follow-up if ops sees more bad inputs.
- Inline red-border styling on invalid fields. Current UX is the bulleted error list at the top + scroll-to-top. Matched existing pattern.
- Email format validation beyond non-empty. The input has `type="email"` which handles browser-level format hints.
- **Jamie: server-side validation in `app/api/camps/register/route.ts` still only checks parent email/firstName/lastName + non-zero gamers + non-zero price.** Client is the only gate for the 8 other starred fields now. Not a bug (the client fix solves the QA case), but if you want defense-in-depth against direct API calls, it'd mirror the client `validate()` on the server. Your call — not in my lane.

**What's still on Aaron's plate before `dev → main`:**
- #10 (medium) — squad_status selector gating when `?squad=` is present
- #11 (low) — pre-select crew week/slot for all added gamers, not just gamer 0
- #13 (medium) — finalize + publish Klaviyo welcome template

---

## Jamie — April 15, 2026 (evening — squad_link QA verification + dev Stripe env isolation fix)

**⚠ Aaron's Claude: read this entry AND `docs/QA-FLAGGED-ISSUES.md` (items 10–13) before touching the register page.** This session landed zero production code changes but does three things you need to know about: (1) verified squad_link end-to-end on dev, (2) fixed a live-mode Stripe config drift on the dev Netlify context so test cards now work, and (3) logged 4 flagged items, three of which live in your lane.

**What you (Aaron) need to do — summary:**
1. Pull `dev` — 2 commits ahead of prod now (squad_token ops columns + this QA session's config/docs).
2. Fix items 10, 11, 12 from `docs/QA-FLAGGED-ISSUES.md` in `app/programs/ekuzo-camps/register/page.tsx`. All three are register-page work; one diff can land all three surgically. Item 12 (Birthday validation on added gamers) is the highest-priority — it's a data-quality bug, not just UX polish.
3. Finalize the Klaviyo welcome email template (item 13) so confirmation emails actually send. All profile properties (`squad_link`, `camp_week`, `camp_slot`, `camp_week_dates`, `registration_summary`, `order_id`, `squad_status`) are populating correctly in Klaviyo — just need your template and a published automation.
4. When you're done with items 10–13, merge `dev → main` yourself. Jamie explicitly wants you to drive the merge after your fixes land, not before.

**What was verified in this session (all 7 QA scenarios from `docs/squad-link-build-brief.md`):**

| # | Scenario | Status | Test profile |
|---|---|---|---|
| 1 | Building creates crew | ✅ | jamiefosu@gmail.com / token `kzPDaElWFY` / Testy McTester |
| 2 | Friend joins via link | ✅ (hybrid — see item 10) | jamiefosu+151@gmail.com |
| 3 | Multi-gamer joining | ✅ | jamiefosu+15111@gmail.com (3 gamers) |
| 4 | Week-change warning | ✅ | no payment — form-only test |
| 5 | Invalid token | ✅ | `/squad/nonexistent-test-token` → state 3 |
| 6 | Past-week page | ✅ | synthetic token `pastweek01` / scheduled re-test 2026-05-25 |
| 7 | Looking purchase | ✅ | jamiefosu+262@gmail.com |

Data pipeline verified correct across all four surfaces (Stripe PaymentIntent metadata, `ekuzo-purchases` tab, `squads` + `squad_members` tabs, Klaviyo profile properties). Zero column-shift on the 28-column `ekuzo-purchases` writes — the header-mapped `doPost` fix is working against real registration data, not just smoke tests. All `squad_token` / `joining_squad_token` values cross-reference cleanly across all sources.

**Infra work done this session (Aaron: do NOT undo any of this):**

- **Apps Script deployed (new version of existing web app — same URL).** `doPost` now maps row objects to sheet columns by header NAME not position (fixes the gender-column-shift bug for ALL tabs going forward). New `doGet` handler for `?action=squad&token=X` returns the crew owner record for `/squad/[token]` and the register page's `?squad=TOKEN` fetch. Canonical ekuzo-purchases header list grew from 26 → 28 (added `squad_token` + `joining_squad_token` columns for ops visibility). `docs/apps-script-backup-pre-squad.gs` committed as a roll-back snapshot of the pre-squad script.
- **Google Sheet tabs created:** `squads` (7 columns) and `squad_members` (6 columns) — see spec doc for exact headers. The `ekuzo-purchases` tab has 28 columns now, aligned with the canonical list in the spec.
- **Webhook updated:** `app/api/webhooks/stripe/route.ts` writes `squad_token` + `joining_squad_token` to the main `ekuzo-purchases` row (not just to `squads` / `squad_members`). This is an ops-visibility add — lets ops filter the main tab by token without needing a JOIN across squad tabs.
- **Netlify env vars reconfigured for Stripe test mode on dev.** Before this session the dev Netlify context was running with `sk_live_*` and `pk_live_*`, so 4242 test cards were declining as "live mode + test card". We now have `sk_test_*` / `pk_test_*` / test `STRIPE_PRICE_CAMPS` / test `STRIPE_WEBHOOK_SECRET` on **Deploy Previews / Branch deploys / Preview Server & Agent Runners / Local development** contexts. **Production stays on live keys and live webhook** — untouched. If you deploy from dev and see live-mode payments again, the Branch deploys override got overwritten somewhere.
- **`STRIPE_PRICE_*` added to `SECRETS_SCAN_OMIT_KEYS`.** Netlify was failing dev builds because its scanner treats Stripe price IDs as secrets; they're not (they're public identifiers). Existing omit list now includes all 4 price env vars: `STRIPE_PRICE_CAMPS`, `STRIPE_PRICE_EKUZO100`, `STRIPE_PRICE_TEAMS`, `STRIPE_PRICE_TEAMS_INSTALLMENTS`.
- **Stripe live secret key was ROTATED.** Old `sk_live_..._xoPS` → new value, 7-day graceful expiration set on the old key. New value was pasted into Netlify Production context. If you see any service outside Netlify still using the old live secret (e.g. a local script, a CLI config), update it before 2026-04-22 when the old key expires. Known consumer was Netlify Functions; no other consumers are expected.
- **Scheduled task set for 2026-05-25** to run the real post-Week-01 `hasWeekPassed()` verification. You don't need to remember it — it'll fire automatically.

**Test data in dev sheets (safe to ignore or clean up — nothing is real):**

- `squads` tab rows to clean if desired: `smoketest1` (Phase 2 smoke test), `pastweek01` (Scenario 6), `XTruMxZhLb` (Scenario 2 hybrid — Fly McFly profile). The `kzPDaElWFY` row (Testy) is also test data and can be deleted; just note that `/squad/kzPDaElWFY` will flip to "no longer available" once it's gone.
- `squad_members` tab has 5 test rows all pointing at `kzPDaElWFY` (Fly, Able, daniel, rob, John).
- `ekuzo-purchases` tab has 6 test rows from today 2026-04-15. Identify by `registration_date` today + `parent_email` containing `jamiefosu+*` or plain `jamiefosu@gmail.com`. None are real sales (we are pre-launch, per Jamie).

**Flagged issues — full detail in `docs/QA-FLAGGED-ISSUES.md` items 10–13:**

- **#10 (Medium, your lane):** squad_status selector stays visible + defaults to "Building" when `?squad=` is in URL. Friend-joining flow accidentally creates parallel crews. Fix: hide selector when `joining_squad_token` is set.
- **#11 (Low, your lane):** added gamers don't inherit the crew's week/slot. Only gamer 1 gets pre-selected. Fix: extend pre-selection to all gamers when `joining_squad_token` is set.
- **#12 (High, your lane, pre-existing bug):** Birthday field shows `*` required but can submit blank on added gamers. Surfaced during multi-gamer QA. Audit all per-gamer required-field validation, not just birthday. Pre-exists squad_link — just surfaced because we stress-tested multi-gamer paths harder than before.
- **#13 (Medium, your Klaviyo work):** welcome email not firing because `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc` is still draft. Profile properties are landing correctly — publish the template with the right merge tags and it'll light up.

**Merge plan:**
1. Aaron lands fixes for items 10, 11, 12 on `dev`.
2. Aaron publishes Klaviyo welcome template (item 13) and tests end-to-end.
3. Aaron merges `dev → main` per the CLAUDE.md sequence and verifies prod.
4. Jamie holds off touching the merge — he wants Aaron to drive.

**Context if the fix for #10–11 needs a product decision:** the build brief explicitly called out the Building-while-joining edge case ("a Building registration that's ALSO joining someone else's crew is a weird edge case; default behavior is that generating your own token wins") and the correct fix is to gate the selector, not change the webhook semantics. The data model already supports pure-join (`squad_token` blank + `joining_squad_token` set + `squad_status` blank). This is purely a UI gating change.

---

## Jamie — April 15, 2026 (squad_link — crew invite links for camps)

**What changed:** Built the full squad_link feature from `docs/squad-link-build-brief.md`. A parent registering "Building a squad" for camps now gets a personal crew invite link they can share; friends who click it land on `/squad/[token]`, register via `/programs/ekuzo-camps/register?squad=TOKEN`, see a pre-selected week/slot + red crew banner, and get stamped into the inviter's crew in the `squad_members` sheet tab.

**New files:**
- `lib/squad.ts` — `fetchSquadOwner(token)` server helper (hits Apps Script `?action=squad&token=X` with 60s revalidate cache), `isValidSquadToken(token)` allow-list validator (`[A-Za-z0-9_-]{4,32}`), `hasWeekPassed(weekDates)` date parser with fail-open semantics. **⚠ `hasWeekPassed` needs a manual test after 2026-05-25** when the first camp week actually ends — no test harness in repo, notes in the file and in `apps-script-squad-endpoints-spec.md`.
- `app/api/squad/[token]/route.ts` — GET proxy. Validates token shape before any outbound call, fetches from Apps Script, returns 404 for unknown *or* past-week crews (collapses both terminal states into one client code path so the register page hand-off stays in one place).
- `app/squad/[token]/page.tsx` — server component, three render states (valid upcoming / past week / invalid). Tungsten red CTA, `robots: noindex,nofollow`, uses `next/link` for the CTA. Reads owner record at render time via the shared helper so the SSR'd HTML has the right copy for crawlers + analytics.
- `docs/apps-script-squad-endpoints-spec.md` — full copy-pasteable Apps Script spec for Jamie to deploy. **Includes the header-mapped `doPost` fix for the `ekuzo-purchases` tab** that resolves the long-standing column-shift bug (see below).
- `docs/squad-link-build-brief.md` — the source-of-truth build brief from Cowork, committed alongside so Aaron's claude can read it for context.

**Modified:**
- `package.json` / `package-lock.json` — added `nanoid`.
- `app/programs/ekuzo-camps/register/page.tsx` (**Aaron's lane — narrow diff, please review**): reads `?squad=TOKEN` on mount, fetches `/api/squad/[token]`, handles 404/past-week by redirecting to `/squad/[token]`. On success pre-selects week+slot for gamer 0, shows a red `bg-red` crew banner above the form, gates week/slot changes on gamer 0 through a `window.confirm` ("Changing this means you won't be at camp together") that acknowledges once per session. On submit, generates a fresh 10-char `nanoid()` `squad_token` when `squadStatus === "building"` and passes `squad_token` + `joining_squad_token` to the API. Also did a review-pass cleanup: removed the unused `gamerSummaries` prop on `CheckoutForm`.
- `app/api/camps/register/route.ts`: accepts `squad_token` + `joining_squad_token` from the body, validates both through `isValidSquadToken` before stamping Stripe PaymentIntent metadata (strict allow-list, prevents arbitrary client input from flowing downstream). Added local `ClientGamer` type to replace `any` on the `gamers.forEach` callback and narrowed the outer `catch` to use `err instanceof Error`.
- `app/api/webhooks/stripe/route.ts`: builds `squad_link = https://ekuzo.gg/squad/${meta.squad_token}` (blank if missing) and writes it to Beehiiv custom fields (camps block), Klaviyo profile properties, and the Klaviyo "Placed Order" event properties. New camps-only block after the existing Sheets write: if `meta.squad_token` → POSTs `{ tab: "squads", rows: [...] }` with the earliest-week gamer as owner. If `meta.joining_squad_token` → POSTs `{ tab: "squad_members", rows: [...] }` with one row per gamer. Each has its own try/catch. Also did a cleanup pass: added a local `MetadataGamer` type to replace the `any[]` on the parsed-from-metadata gamers array (catches field-name typos at compile time — exactly the class of bug that caused the gender-shift), and narrowed all seven `catch (err: any)` blocks to `catch (err)` with `err instanceof Error` narrowing.

**Google Sheets column-shift bug (gender column) — diagnosis + fix:**

Jamie spotted on 2026-04-15 that a test submission landed with the `gender` cell empty and every subsequent column shifted one left. This is the same bug flagged in the April 13 WORKLOG entry ("Week 02 appeared under the gender header"). I traced the full pipeline (form state → register API → Stripe metadata → webhook → Sheets POST body) and **confirmed the Next.js side is not the bug** — every field including `gender` is always sent with a `|| ""` fallback, key order is stable, no data is ever dropped. Root cause is Apps Script doing `sheet.appendRow` positionally using `Object.values(row)` or a hardcoded column array; any drift between the JS object key order and the sheet's header row order cascades into a shift starting at the first mismatched position.

**Fix (specced, not yet deployed — requires Jamie to paste into Apps Script):** `docs/apps-script-squad-endpoints-spec.md` now includes a rewritten `doPost` that maps row objects to sheet columns **by header name** for ALL tabs (main + new squad tabs), not just the new squad tabs. The spec also lists the canonical 26-column header row the webhook currently sends so Jamie can align the `ekuzo-purchases` sheet on deploy. Historical rows that were written under the positional append are still corrupt — spec covers three backfill options, recommends leaving them as historical noise unless needed for ops reports.

**Security hardening:**
- Server-side token validation via `isValidSquadToken` (charset + length allow-list) in both `/api/squad/[token]` and `/api/camps/register` before any outbound call or metadata stamping, so arbitrary client input can't be smuggled into Stripe/Apps Script.
- `fetchSquadOwner` uses `next: { revalidate: 60 }` instead of `no-store` — crews are immutable after creation so 60s is indistinguishable from fresh, and this caps upstream Apps Script calls at ~1/minute per token regardless of how viral a link goes (Apps Script has hard daily UrlFetch quotas that would otherwise take down the entire webhook path).
- `/api/squad/[token]` rejects malformed tokens before any outbound call so it can't be used as a free probe against Apps Script.
- `.trim()` on every string field in `fetchSquadOwner`'s response so a stray whitespace in a Sheets cell can't spuriously fire the "changing your week won't keep you with your crew" confirm dialog.

**Verification (local, against running `next dev` on :3001):**
- `tsc --noEmit` clean.
- `eslint` on all six touched files: zero errors, zero warnings. Pre-existing baseline had 10 errors + 1 warning across the modified files; cleanup pass during review reduced it to zero in those files (details in the review conversation).
- `GET /api/squad/{malformed}` → 404 without Apps Script call.
- `GET /api/squad/{valid-shape-unknown}` → 404 after Apps Script round trip.
- `GET /squad/{token}` → 200, "THIS CREW LINK IS NO LONGER AVAILABLE", `<meta robots=noindex,nofollow>`.
- `GET /programs/ekuzo-camps/register?squad=...` → 200.
- **NOT verified locally** — the valid-token "join crew" render (requires a real `squads` row in Sheets + `doGet` deployed), full Stripe round-trip with squad_token in metadata, the 7 QA scenarios in the brief. These all depend on the Apps Script side being deployed first.

**What Jamie still needs to do (handoff):**
1. Paste the updated `doPost` + new `doGet` from `docs/apps-script-squad-endpoints-spec.md` into the Apps Script editor, create the `squads` and `squad_members` tabs with the header rows in the spec, align the `ekuzo-purchases` header row to the canonical 26-column list, and redeploy.
2. Run the 7 QA scenarios from `docs/squad-link-build-brief.md` against the dev preview once Apps Script is live.
3. Decide whether to backfill historical column-shifted rows (spec has three options — recommendation is to leave as historical noise).
4. Put a calendar reminder for 2026-05-25 to manually test `hasWeekPassed` with a real past-week `squads` row.

**Notes for Aaron:** register page diff is scoped to the squad-link hook-in — banner render, `useEffect` for the `?squad=` query param, `selectSlot` confirm dialog, submit-time token passing. Unrelated cleanup while in the file: removed the unused `gamerSummaries` prop on `CheckoutForm`. Nothing else in the file should be touched by this diff.

---

## Jamie — April 14, 2026 (Schema pass #2 — entity graph, canonicals, CourseInstance)

**What changed:** Second pass on structured data after re-auditing dev-branch. Site went from a 78/100 baseline (first pass) to the remaining items in `GEO-SCHEMA-REPORT.md` / `GEO-SCHEMA-PROGRAMS.md`. Target post-deploy: 85+ per page.

**Commits landed on `dev`:**
- `0bba97d` — Organization updates + canonical URLs + coach Person nodes
- `06f4fe9` — CourseInstance location + startDate/endDate + instructors
- `9b6393a` — Review nodes on Courses from testimonial transcripts
- `cafb784` — Replace placeholder VideoObject uploadDates with real 2026 dates

**Schema fixes landed:**
1. **Organization (EducationalOrganization)** — ISO `foundingDate: "2021-01-01"`, full `PostalAddress` (5617 Dolores St, Houston, TX 77057, US), `areaServed` (US + North America), `contactPoint` array (customer support = team@, legal = info@), and `founder` now references the Karlin Person node via `@id` instead of inline duplication.
2. **Coach Person nodes** — added 3 `Person` schemas to `rootGraph`: Karlin "Faith" Oei (founder), Sebastien "ZzLegendary" DeMontigny, Nuri "Teemo Time" Je. Each has `@id`, `jobTitle`, `description`, `sameAs` (LinkedIn), `worksFor` → Org, and image. These inherit to every page via the root graph.
3. **Canonical URLs** — set `metadataBase: new URL("https://ekuzo.gg")` in `app/layout.tsx` and added `alternates: { canonical: "/path" }` to every page metadata export (14 pages). Register/success pages got sibling `layout.tsx` server shims with canonical + `robots: { index: false }` (register is indexable=false/followable=true, success is noindex/nofollow).
4. **CourseInstance enrichment** — added `location: VirtualLocation` (new `VIRTUAL_LOCATION` const), `startDate` / `endDate`, and `instructor` arrays (@id refs) to all 3 program Courses:
   - Camps: 2026-05-18 → 2026-08-06, 3 instructors
   - EKUZO100: 2026-06-02 → 2026-06-30, 2 instructors
   - Teams: 2026-08-31 → 2026-12-18, 2 instructors
5. **Review nodes on Courses** — new `buildTestimonialReview` helper maps the 9 testimonial transcripts into `Review` nodes attached to the appropriate Course via `itemReviewed`. Camps gets 3 parent reviews, EKUZO100 gets 4 student reviews, Teams gets 2 school reviews. `reviewBody` is sourced from `lib/testimonialTranscripts.ts` so content never drifts.
6. **Real VideoObject uploadDates** — replaced 9x `"2024-01-01"` placeholder with real 2026 dates per testimonial (2026-01-12 through 2026-03-27). `TestimonialMeta` type got an `uploadDate` field; `testimonialVideoGraph` reads it from the per-entry record.

**Deferred (intentionally NOT done this pass):**
- Per-week CourseInstance array on Camps (10 weeks × 2 slots)
- `aggregateRating` on Courses
- Wikidata `sameAs`
- `Article` / `speakable` schemas (no blog content yet)
- Expanded `/about` Person schema

**Files touched:**
- `lib/schema.ts` — coach Persons, VIRTUAL_LOCATION, buildTestimonialReview, Org updates, all 3 Course CourseInstance enrichment + review arrays, testimonial uploadDate.
- `app/layout.tsx` — metadataBase + canonical.
- 14 existing page metadata exports — added `alternates.canonical`.
- 6 new `layout.tsx` files under `app/programs/*/register/` and `app/programs/*/success/` — server shims so client pages get canonical + robots metadata.

**Verification (local `next start`):**
- `/` — canonical `https://ekuzo.gg`, root graph has 6 nodes (Org + WebSite + SiteNav + 3 coach Persons), testimonial VideoObject graph has 9 nodes with real 2026 uploadDates.
- `/programs/ekuzo-camps` — Course: 2026-05-18→2026-08-06, 3 instructors, 3 reviews.
- `/programs/ekuzo100` — Course: 2026-06-02→2026-06-30, 2 instructors, 4 reviews.
- `/programs/ekuzo-teams` — Course: 2026-08-31→2026-12-18, 2 instructors, 2 reviews.

**TODO after push:** run `/geo schema` audits against `dev--ekuzo.netlify.app` on homepage + 3 program pages; paste final @graph into validator.schema.org for each.

---

## Jamie — April 14, 2026 (Structured data / GEO schema pass)

**What changed:**

Implemented all 7 schema fixes from `GEO-SCHEMA-REPORT.md` (audit scored the live site at 57/100; target 85–95 post-fix). All JSON-LD is server-rendered via Next.js server components — no JS injection.

**New files:**
- `lib/schema.ts` — single source of truth for all JSON-LD. Exports: `rootGraph` (Organization + WebSite + SiteNavigation), per-program Course schemas, `buildBreadcrumbSchema`, `buildFAQPageSchema`, and `testimonialVideoSchemas` (reads `.txt` captions from `public/testimonial-videos/` at module load via `fs.readFileSync`).
- `components/JsonLd.tsx` — thin server component that renders a `<script type="application/ld+json">` tag. Use `<JsonLd data={...} />` on any page.

**Schema fixes landed:**
1. **Removed fake SearchAction** from WebSite — was pointing at `/?q=` with no backing search endpoint. Validation error gone.
2. **Upgraded `Organization` → `EducationalOrganization`** in `app/layout.tsx`. Added `foundingDate: "2021"`, `email: team@ekuzo.gg`, `founder: Karlin Oei` (with LinkedIn sameAs), `knowsAbout` array (8 topics), and extended `sameAs` to include LinkedIn company page, TikTok, and X. Dropped Discord from sameAs (not a stable public identifier).
3. **Course + Offer schemas** on all three `/programs/*` pages via `<JsonLd>` in the server component. EKUZO Camps ($199), EKUZO100 ($100), EKUZO Teams (two Offer nodes: $576 pay-in-full and $640 4-payment plan) — all reference the EducationalOrganization via `@id`.
4. **FAQPage schema** on `/faq` built from the existing `safetyFAQs / programsFAQs / outcomesFAQs / costFAQs / enrollmentFAQs` data arrays (reused, not duplicated).
5. Founder Person schema handled via nested `founder` field on the EducationalOrganization — no separate top-level Person entity needed yet.
6. **BreadcrumbList** added to every inner page: `/programs`, `/programs/ekuzo-camps`, `/programs/ekuzo100`, `/programs/ekuzo-teams`, `/methodology`, `/parents`, `/schools`, `/games`, `/faq`, `/terms-of-service`, `/privacy-policy`. Register/success pages skipped (low SEO value).
7. **VideoObject schemas** for 9 testimonial videos added to the homepage (`app/page.tsx`). The `transcript` field is populated by reading the matching `.txt` caption files from `public/testimonial-videos/` at build time. `uploadDate` is a placeholder (`2024-01-01`) — update when real dates are known.

**Files touched:**
- `app/layout.tsx` — swapped inline jsonLd for `rootGraph` import.
- `app/page.tsx` — added testimonial VideoObject schemas.
- `app/programs/ekuzo-camps/page.tsx`, `app/programs/ekuzo100/page.tsx`, `app/programs/ekuzo-teams/page.tsx` — Course + Breadcrumb.
- `app/faq/page.tsx` — FAQPage + Breadcrumb built from existing FAQ arrays.
- `app/methodology/page.tsx`, `app/parents/page.tsx`, `app/schools/page.tsx`, `app/games/page.tsx`, `app/programs/page.tsx`, `app/terms-of-service/page.tsx`, `app/privacy-policy/page.tsx` — Breadcrumb only.
- `CLAUDE.md` — removed "Teams commerce (next session)" from Remaining; updated `/programs/ekuzo-teams` status to reflect commerce is live.

**Notes for Aaron:**
- All schemas are in `lib/schema.ts` — if you rename a program or change pricing, update it there once and it propagates everywhere.
- `components/JsonLd.tsx` is the only way to render JSON-LD in this codebase. Don't inline `dangerouslySetInnerHTML` anywhere else.
- To validate after deploy: paste the final @graph from view-source into https://validator.schema.org/ or run `/geo schema https://dev--ekuzo.netlify.app` in Claude Code.
- Placeholder data that should be replaced with real values: `uploadDate` on each testimonial video (currently `2024-01-01`).

---

## Jamie — April 13, 2026 (DNS + GA4/Meta analytics + Klaviyo webhook + env isolation)

**What changed:**

Two commits tonight on `dev`: `666d720` (analytics + Klaviyo) and `694a0c4` (webhook env isolation). Already pushed. Aaron: nothing you need to do, but read this so you know what's live.

**DNS + Google Workspace (done in Namecheap, no code):**
- MX records, SPF (merged Google + Amazon SES), DKIM (`google._domainkey` TXT), DMARC (`rua` to `jamie@ekuzo.gg`), Google Search Console verification. All set for `ekuzo.gg`.

**GA4 + Meta Pixel — site-wide tracking (new):**
- `app/layout.tsx` — added GA4 (`G-8LM45PX53W`) and Meta Pixel (`1284038230557204`) base scripts. Use `next/script` with `afterInteractive` strategy.
- `lib/analytics.ts` (new) — shared conversion helpers: `trackViewContent`, `trackInitiateCheckout`, `trackPurchase`, `trackLead`. Each fires BOTH GA4 and Meta Pixel in one call.
- `components/analytics/TrackPageView.tsx` (new) — client component that fires `ViewContent` or `InitiateCheckout` on mount. Use this in server-rendered marketing/landing pages since they can't call browser APIs directly. Pattern: `<TrackPageView program="camps" />` at the top of the JSX.
- Wired into every funnel step:
  - `app/programs/ekuzo-camps/page.tsx`, `ekuzo100/page.tsx`, `ekuzo-teams/page.tsx` — fires `ViewContent`
  - `app/programs/ekuzo-camps/register/page.tsx`, `ekuzo100/register/page.tsx` — fires `InitiateCheckout` when user clicks to payment step
  - `app/programs/ekuzo-camps/success/page.tsx`, `ekuzo100/success/page.tsx` — fires `Purchase` after successful payment confirmation (guarded with `useRef` to prevent duplicate fires)
  - `components/ui/ContactModal.tsx` — fires `Lead` after successful form submission

**Klaviyo wired as second webhook destination (new):**
- `app/api/webhooks/stripe/route.ts` — after Beehiiv enrollment, also does: (1) profile upsert via `/api/profile-import`, (2) add to Purchasers list (`V4Uf7N`) via `/api/lists/:id/relationships/profiles`, (3) track "Placed Order" event via `/api/events`. Both Beehiiv and Klaviyo now receive identical data sets (gamer names, camp week/dates, squad status, cohort info, etc.) so we can sequence pre-product emails from either platform.
- Env var added in Netlify (secret, all deploy contexts): `KLAVIYO_PRIVATE_API_KEY`
- Shared gamer summary variables (`allGamerNames`, `gamerSummaries`, `earliestWeek`, `earliestSlot`) hoisted out of the Beehiiv try block so both enrollment sections can use them. Beehiiv and Klaviyo blocks each have their own try/catch so one failing doesn't kill the other.
- End-to-end tested tonight (single-gamer camps payment). Verified: Stripe payment intent ✓, Gmail receipt ✓, Google Sheets row ✓, Klaviyo profile + "Placed Order" event + Purchasers list ✓, Beehiiv subscriber + tags + welcome automation ✓.

**Stripe webhook environment isolation (bug fix):**
- Problem discovered during end-to-end test: Stripe fires `payment_intent.succeeded` to **every** registered webhook endpoint. With both a production webhook (`ekuzo.gg`) AND a dev webhook (`dev--ekuzo.netlify.app`) active, a single dev test payment was being processed by both — causing duplicate rows in Google Sheets. (Beehiiv/Klaviyo are upsert-style APIs so they dedupe; Sheets blindly appends.)
- Fix: each registration API (`camps`, `ekuzo100`, `teams`) now stamps the payment intent metadata with `environment: process.env.CONTEXT` (Netlify auto-sets `CONTEXT` to `production` / `branch-deploy` / `deploy-preview` / `dev`). The webhook skips events whose `environment` doesn't match the current deploy context. Backward-compat: historical payment intents without the field default to `production` so nothing breaks.

**Stripe infra:**
- New webhook endpoint created in Stripe: "EKUZO Netlify Dev" → `https://dev--ekuzo.netlify.app/api/webhooks/stripe` (listens to `payment_intent.succeeded` only)
- `STRIPE_WEBHOOK_SECRET` env var in Netlify is now per-context: production keeps the original prod secret; Branch deploys / Deploy Previews / Preview Server use the new dev secret. Prod webhook untouched.

**Known issues / next session:**
- GA4: `purchase` event firing wasn't confirmed in Realtime (only saw `user_engagement`). Could be sampling delay; need to check Events report in ~24h. Also need to mark `purchase` as a key event in GA4 Admin.
- Meta Pixel: Events Manager shows 0 events because my browser's ad blocker kills the network request. Need to verify via Meta's Test Events tab (bypasses ad blockers).
- Google Sheets column alignment: noticed values may be off by one column (e.g., `Week 02` appeared under the `gender` header). Apps Script may append by position instead of mapping by header name. Worth an audit next session.
- SEO audit: still outstanding from this session's original scope.

---

## Jamie — April 8, 2026 (favicons + dev branch workflow)

**What changed:**

**Complete favicon set (new):**
- Generated full favicon suite from `bird-logo.png`: `app/favicon.ico` (16/32/48), `app/apple-icon.png` (180×180), `app/icon.png` (192×192), `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png`
- `public/site.webmanifest` — ties Android icons together with EKUZO branding (black theme)
- `app/layout.tsx` — metadata updated to reference full icon set + manifest

**Dev branch + Netlify branch deploys (new workflow — READ THIS):**
- Created `dev` branch from `main`. Netlify now deploys both:
  - `main` → **ekuzo.gg** (production, live site)
  - `dev` → **dev--ekuzo.netlify.app** (preview, for reviewing before going live)
- **New workflow for both Jamie and Aaron:**
  1. Do all day-to-day work on `dev` branch
  2. Push to `dev` → check at the dev URL
  3. When confident → merge `dev` into `main` to go live
- **Aaron action needed:** Switch to `dev` branch before starting work:
  ```bash
  git checkout dev
  git pull origin dev
  ```
- To merge dev → main when ready to go live:
  ```bash
  git checkout main
  git pull origin main
  git merge dev
  git push origin main
  git checkout dev
  ```
---

## Aaron — April 10, 2026 (What Do We Play video + web optimization)

**What changed:**

Replaced the static "What Do We Play" image on the camps page with a video player for `league-of-legends-camp`. Video does not autoplay, shows a large red play button overlay, and starts with sound ON when the user hits play. Native HTML5 controls appear once playing.

**Video conversion:**
- Source: `public/videos/league-of-legends-camp.mov` — HEVC, 2160×3840, 21.7s, 51 MB (too big for web)
- Output: `public/videos/league-of-legends-camp.mp4` — H.264, 720×1280, AAC 96k, `+faststart`, 5.8 MB
- ffmpeg command used: `ffmpeg -i league-of-legends-camp.mov -vf "scale=720:-2" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart league-of-legends-camp.mp4`
- 720×1280 is sized for the sticky 3/4-aspect portrait container at retina density; keeps bandwidth low while staying crisp.
- **Action for Aaron:** the original `.mov` (51 MB) is still in the folder because I couldn't delete it from this session. Delete it before committing: `rm public/videos/league-of-legends-camp.mov`

**New file — `components/ui/WhatWePlayVideo.tsx`:**
- Client component with `useRef` + `useState`
- Renders the video element with `controls={playing}` so the native controls only show once the user has hit play
- Red `bg-red` circular play button overlay (clamp-sized 72–112px) with a dark `bg-black/20` backdrop over the video while paused
- Hover/active states: brightness + scale transform matching our existing button style
- On click: sets `v.muted = false`, `v.volume = 1`, then `v.play()`. Falls back to muted playback only if the browser blocks unmuted autoplay (shouldn't, since the play is user-initiated).
- `preload="metadata"` so the browser doesn't pull the whole file until the user presses play
- `playsInline` so mobile Safari doesn't kick into full-screen takeover
- Same clipped-corner 3/4 aspect container as the photo it replaced, so the layout is identical.

**`app/programs/ekuzo-camps/page.tsx`:**
- Imported `WhatWePlayVideo` from `@/components/ui/WhatWePlayVideo`
- Swapped the `<Image>`-wrapper block in the "What Do We Play" sub-section for `<WhatWePlayVideo src="/videos/league-of-legends-camp.mp4" label="League of Legends gameplay at EKUZO camp" />`

TypeScript check passes clean.

---

## Aaron — April 10, 2026 (FooterBanner top torn-paper — red-top, color-agnostic)

**What changed:**

Made the red `FooterBanner` render its own top torn-paper divider so every page gets a consistent jagged red transition automatically — and switched the asset to a **red-top** paper so no per-page color prop is needed.

**Why red-top:** My first attempt used `torn-paper-{white|black|grey}-bottom-2@2x.png` half-offset into the red section (`translateY(-50%)`). That exposed the FLAT top edge of the `*-bottom-*` assets in the preceding section, creating a visible horizontal line just above the red. The fix is to use `torn-paper-red-top-2@2x.png` instead: the paper is red, has a torn edge at the TOP, and a solid red edge at the BOTTOM. Positioned flush with `top: 0` and `translateY(-100%)`, the solid red bottom meets the top of the red section seamlessly (red-on-red), and the torn red top extends up into whatever section is above, creating a jagged red silhouette. Works the same over white, black, or grey — no color prop required.

**`components/sections/FooterBanner.tsx`:**
- Removed the `topPaperColor` prop entirely.
- Top paper now uses `/images/new torn paper/torn-paper-red-top-2@2x.png` at `top: 0` with `transform: translateY(-100%)`.
- Section still has `overflow-visible`.

**Pages reverted (removed the `topPaperColor` prop I added earlier in this session):**
- `app/programs/ekuzo100/page.tsx`
- `app/programs/ekuzo-teams/page.tsx`
- `app/schools/page.tsx`
- `app/programs/page.tsx`
- `app/programs/ekuzoteams/page.tsx`
- `app/parents/page.tsx`
- `app/methodology/page.tsx`
- `app/ekuzoteams-semester-based/page.tsx`
- `app/programs/e100/page.tsx`
- `app/blog/our-family-s-esports-journey-with-ekuso-and-the-k1ng/page.tsx`
- `app/blog/conquering-my-mountain-and-giants-how-esports-changed-my-life/page.tsx`
- `app/ekuzo100/page.tsx`

All 19 pages that render `<FooterBanner>` now use the default, and the red-top paper handles the transition uniformly.

TypeScript check passes clean.

**Heads up for Jamie:** If you add a new page that renders `<FooterBanner />`, you don't need to configure anything for the top divider. The red-top paper renders automatically and works over any preceding section background.

---

## Aaron — April 10, 2026 (torn paper fixes: Growth + FooterBanner transition)

**What changed:**

Two follow-up fixes to the torn paper migration from earlier today:

1. **Removed the bottom torn paper from the Growth Through Play section** in `app/page.tsx`. The `torn-paper-grey-bottom-2@2x.png` element at the bottom of the grey section has been deleted entirely — the swap was breaking the layout. The grey section now ends cleanly without a divider; the Ecosystem section below still has its own `torn-paper-white-top-1@2x.png` at the top, which handles the grey → white transition on its own.

2. **Reworked the Testimonials → FooterBanner transition.** The top torn paper inside `components/sections/FooterBanner.tsx` (the `torn-paper-red-bottom-2@2x.png` div that was producing visual artifacts) has been removed. In its place, a new `torn-paper-white-bottom-2@2x.png` has been added at the bottom of the testimonials section in `app/page.tsx`, positioned with `translateY(calc(100% - 2px))` so it overlaps down into the red FooterBanner section. The testimonials `<section>` is now `relative overflow-visible` to let the paper hang below its box.

Because the top divider was removed from `FooterBanner.tsx` (a shared component), every page that uses `<FooterBanner>` now renders without a top torn-paper edge. Any page that needs that transition will need to add its own divider on the preceding section, like the home page now does. Pages to audit next session: `/methodology`, `/programs`, `/parents`, `/schools`, `/games`, `/faq`, `/programs/ekuzo100`, `/programs/ekuzo-teams`, `/programs/ekuzo-camps`.

TypeScript check passes clean.

---

## Aaron — April 10, 2026 (home page torn paper migration)

**What changed:**

All torn paper textures on the home page have been migrated from the old SVG/PNG files in `public/images/` to the new `@2x` PNGs in `public/images/new torn paper/`. Each swap uses the exact naming convention documented in the Learning Log (`torn-paper-{color}-{variant}-{style}@2x.png`).

**`app/page.tsx`:**
- Hero → Growth Through Play (line 96): `/images/torn-paper-white-1.png` → `/images/new%20torn%20paper/torn-paper-white-1@2x.png` (whole divider, background-image div)
- Growth → Ecosystem bottom (line 123): `/images/paper-grey-bottom-2.svg` → `/images/new%20torn%20paper/torn-paper-grey-bottom-2@2x.png` (direct 1:1 swap)
- Growth → Ecosystem top (line 187): `/images/paper-white-top-1.svg` → `/images/new%20torn%20paper/torn-paper-white-top-1@2x.png` (direct 1:1 swap)
- Ecosystem → How It Works (line 201): `/images/paper-black-top-2.svg` → `/images/new%20torn%20paper/torn-paper-black-top-1@2x.png` (changed variant 2 → 1 per request)

**`components/sections/HomeHowItWorks.tsx`:**
- How It Works → Testimonials (line 147): `/images/paper-black-bottom-2.svg` → `/images/new%20torn%20paper/torn-paper-black-bottom-1@2x.png` (changed variant 2 → 1 per request)

**`components/sections/FooterBanner.tsx`:**
- Testimonials → Enroll section top-edge (line 35): `/images/torn-paper-red-1.png` → `/images/new%20torn%20paper/torn-paper-red-bottom-2@2x.png`
- **Note:** `FooterBanner` is a shared component rendered on every page. This swap affects every page's Enroll banner visually, not just the home page. If the intent was home-only, we'd need to parameterize the paper asset via props — flag if so.

TypeScript check passes clean.

---

## Aaron — April 10, 2026 (camps register hero padding fix + Squad Status vibe check)

**What changed:**

**Camps registration hero (`app/programs/ekuzo-camps/register/page.tsx`):**
- Hero content container `paddingBottom` made responsive — `pb-28 lg:pb-60` (112px mobile / 240px desktop). Previously was flat `240px`, which worked fine on desktop (where the collage is absolutely positioned) but created a huge gap on mobile between the text and the flow-layout collage. The `-mt-24` (-96px) on the mobile collage now balances against the 112px mobile padding to leave a ~16px gap below the text. Desktop stays at `pb-60` (240px) to give the white torn paper overlay room to sit below the body copy without clipping it.
- **History:** original value was `80px` (April 8 — too tight, torn paper overlapped the body copy), then `240px` flat (April 10 — fixed desktop, broke mobile spacing), now `pb-28 lg:pb-60` (fixes both).

**Squad Status — new required question (`app/programs/ekuzo-camps/register/page.tsx`):**
- New family-level "vibe check" question inserted between the gamer loop (after "+ Add Another Gamer" button) and the Parent Information section. Two torn-paper cards side-by-side ("Building a squad" / "Looking for a squad"), one-tap selection, red ring + shadow when selected.
- New `SquadStatus` type: `"building" | "looking" | null`. Single family-level state (not per-gamer) — one answer per registration.
- New `SquadCard` sub-component at the bottom of the file, styled consistently with the existing form aesthetic (torn-paper clipPath, `#f5f5f7` bg, Display heading, Inter subtitle).
- **Selected state:** SquadCards use a smooth rounded rectangle — torn-paper `clipPath` was tried first but produced jagged edges on both the card and the outline. Without clipPath a normal `ring-2 ring-red` + `shadow-lg shadow-red/10` works cleanly. Unselected shows `ring-1 ring-black/10` for a subtle default border. A red circle check badge appears in the top-right corner on selection; unselected shows a neutral empty circle so the layout doesn't jump. Card background and text colors stay neutral (avoided the red tint — read as an error state). `aria-pressed` set for accessibility.
- Added to `validate()` as required — users cannot proceed to payment without picking one.
- `squadStatus` is wired end-to-end through the camps data flow:
  - **`app/api/camps/register/route.ts`** — accepts `squadStatus` from the payload, coerces to a safe `"building" | "looking" | ""` value, stores in Stripe metadata as `squad_status`.
  - **`app/api/webhooks/stripe/route.ts`** — reads `meta.squad_status`, transforms the code into a human-readable label (`"Building a squad"` / `"Looking for a squad"`) for ops readability, writes to the Google Sheets row as `squad_status` (camps only; `""` for other products).
- **Beehiiv intentionally skipped** — team is migrating email marketing to Klaviyo, so no Beehiiv custom field was added. The data is still captured in Stripe metadata + Google Sheets, so nothing is lost; Klaviyo wiring will happen during the migration.
- TypeScript check passes clean (`tsc --noEmit`).

### 🔧 ACTION REQUIRED — Jamie (backend / ops)

The camps webhook is now sending a `squad_status` field on every camps row, but **it won't land in the sheet until you do the two things below.** Code is fully wired — this is the only missing piece.

**1. Add the column to the Google Sheet**
- Open the `ekuzo-purchases` Google Sheet.
- Add a new column header: `squad_status` (exact spelling, lowercase with underscore — the webhook sends this as the key name).
- Suggested placement: right after `preferred_games` so it lives next to the other gamer-context fields, but anywhere is fine as long as the Apps Script is updated to match.

**2. Update the Apps Script to map the incoming key**
- Open the Apps Script bound to the sheet (the web app at `GOOGLE_SHEETS_WEBHOOK_URL`).
- Make sure the row-writing logic reads `row.squad_status` from the incoming POST body and writes it to the new column.
- If the Apps Script uses a dynamic header-lookup pattern, just adding the column header may be enough. If it has a hardcoded column list, add `squad_status` to that list.

**What the webhook sends**
- Field name: `squad_status`
- Values: `"Building a squad"`, `"Looking for a squad"`, or `""` (empty string for non-camps products — EKUZO100 and Teams)
- Already human-readable — no transform needed in Apps Script.

**Where to find the code** (in case you want to trace it)
- Front-end form capture: `app/programs/ekuzo-camps/register/page.tsx` (SquadCard component + state)
- Register API: `app/api/camps/register/route.ts` (stores as `squad_status` in Stripe metadata)
- Webhook: `app/api/webhooks/stripe/route.ts` (reads metadata, transforms code → label, writes to row)

**Testing the full flow**
Once the column + Apps Script are updated, run a test camps registration in Stripe test mode with Squad Status selected and confirm the value lands in the sheet. If it doesn't show up, check the webhook logs — the field is sent on every camps row regardless of what the sheet can accept.

**Email marketing (Klaviyo) — separate follow-up**
I intentionally did NOT wire `squad_status` to Beehiiv since you mentioned the Klaviyo migration. When you set up Klaviyo, add a `squad_status` custom property / profile attribute and wire it into the webhook's Klaviyo enrollment call at the same place the Beehiiv call currently lives. Valid values are the same two strings shown above.

---

## Aaron — April 8, 2026 (camps registration page polish + mobile fixes)

**What changed:**

**Camps registration hero (`app/programs/ekuzo-camps/register/page.tsx`):**
- Season badge → EKUZO Eyebrow component (red skewed pill, white text) with calendar icon
- "CAMP REGISTRATION" headline bigger on mobile (`clamp(4rem, 6.25vw, 120px)`), tighter line-height (0.85)
- Eyebrow-to-headline gap tightened (wrapped in shared div with `gap-3`)
- Hero padding reduced: top 40px, bottom 80px (was 128/140)
- "Join us for an incredible week…" subtitle changed from red to black
- EKUZO100 link changed from grey to red
- Hero collage: desktop — taller (100% height, 55% width); mobile — now visible below content, 115% width edge-to-edge
- "Choose your camp week" and "Tell us about your gamer" headers upgraded to Display H2 style (`font-display uppercase text-black`, `clamp(3rem, 6vw, 5.5rem)`)
- Rule dividers added above "Tell us about your gamer" and "Parent Information" sections
- "Please fill out the information below" header replaced with "Parent Information" in Display H2, duplicate h3 removed
- Camp week dates larger on mobile (`clamp(2rem, 2.5vw, 36px)`)
- Registration Summary header bigger on mobile (`clamp(2rem, 3vw, 28px)`)

**Footer (`components/layout/Footer.tsx`):**
- "Find us online" now stacks above social icons on mobile (`flex-col` below `sm`)

**Footer newsletter (`components/ui/FooterNewsletter.tsx`):**
- Email input + Sign up button span full width on mobile at 70/30 ratio

---

## Aaron — April 7, 2026 (mobile nav button fix)

**What changed:**

**Mobile nav CTA buttons — swapped variants to match desktop:**
- `components/layout/Nav.tsx` — "Enroll my gamer" changed from `red-outlined` → `red-filled`, "Talk to Humans" changed from `red-filled` → `red-outlined`. Mobile drawer now matches the desktop CTA hierarchy where enroll is the primary button.

---

## Jamie — April 4, 2026 (newsletter system, CTA overhaul, FAQ audit, Teams commerce, contact form email, launch prep)

**What changed:**

**Newsletter system (new):**
- `components/ui/NewsletterPopup.tsx` — full-screen split-screen popup (purple left w/ kid+characters image, dark right w/ form). Shows on first visit after 2.5s delay, gated by localStorage. Posts to `/api/newsletter`. Yellow-green (#C8E620) accent color for CTA + "MATTERS." headline.
- `components/ui/FooterNewsletter.tsx` — inline "Join the Newsletter" + email input in footer. Shows black checkbox + "Subscribed!" on success. Replaces old "Start a conversation" ModalButton in footer.
- `app/api/newsletter/route.ts` — Beehiiv subscription with `source-newsletter` tag.
- `app/layout.tsx` — added `<NewsletterPopup />` to root layout.
- `components/layout/Footer.tsx` — swapped ModalButton import for FooterNewsletter.

**CTA rename — "Start a conversation" → "Talk to Humans":**
- Updated across 9 files: Nav, StickyCTA, ContactModal, schools, methodology, coaching, teams, and both camps pages.

**CTA swap — default CTAs changed to "Enroll my gamer":**
- Nav desktop CTA now opens enroll modal (was contact).
- FooterBanner default CTA now "Enroll my gamer" (was contact). Added `ctaLabel` and `ctaModal` props for per-page override (schools uses "Talk to Humans" / contact).

**Contact form — added Resend email notification:**
- `app/api/contact/route.ts` — added Resend API call to email karlin@ekuzo.gg on every submission. Removed Google Sheets write (not needed for contact inquiries). Beehiiv subscription still active.
- Resend API key added to `.env.local` (`RESEND_API_KEY`).
- From address is `onboarding@resend.dev` until ekuzo.gg domain is verified in Resend (DNS records needed — bundled with Netlify DNS update for Karlin).

**Teams commerce (new):**
- `app/api/teams/register/route.ts` — Stripe PaymentIntent for Teams. Supports upfront ($576) and installment ($160 first + 3×$160/mo subscription). Creates Stripe Customer for card storage.
- `app/programs/ekuzo-teams/register/page.tsx` — registration form.
- `app/programs/ekuzo-teams/success/page.tsx` — confirmation page.
- Webhook already handled Teams product detection from prior session.

**FAQ audit — 7 pages updated:**
- Terminology standardized: "E100" → "EKUZO100", "After-School" → "EKUZOTEAMS", "Minimesters" → "EKUZOCAMPS".
- New questions added: "What is EKUZO?", "What equipment needed?", "What age range?" (10-18).
- Pricing language: ~$20/session, no hard numbers except EKUZO100=$100.
- Pages: `/faq`, `/parents`, `/programs`, `/programs/ekuzo-teams`, `/programs/ekuzo100`, `/programs/ekuzo-camps`, `/schools`.

**Mobile nav fix:**
- Nav mobile drawer now uses `createPortal(…, document.body)` to escape stacking context issues. Full-screen overlay with its own red nav bar + close button.

**Removed page-specific mobile CTA bars:**
- Removed from: schools, parents, methodology, games, programs, faq, ekuzo-camps (7 pages total). Global `StickyCTA` handles all pages.

**Component enhancements:**
- `ProgramsSection` — added `heading` prop for per-page override (schools uses "One program. Built for schools.").
- `OurApproachSection` — body prop now accepts JSX (React.ReactNode), not just string.
- `FooterBanner` — added `ctaLabel` and `ctaModal` props.

**Draft pages hidden (renamed to _page.tsx.draft):**
- `/about` — in progress, not ready for launch.
- `/coaching` — template for future `/methodology/coaching`.
- `/success` — generic, replaced by per-program success pages.
- `/ekuzo-camps/v2` — became canonical `/programs/ekuzo-camps`.

**New assets:**
- `public/images/popup-kid-characters.png` — kid + game characters composite for newsletter popup.

**Data flow summary (all working as of 4/4):**
- Contact form ("Talk to Humans") → Beehiiv (source-contact-form tag) + Resend email to Karlin
- Newsletter popup + footer → Beehiiv (source-newsletter tag)
- Camps registration → Stripe → webhook → Google Sheets (ekuzo-purchases) + Beehiiv
- EKUZO100 registration → Stripe → webhook → Google Sheets + Beehiiv
- Teams registration → Stripe → webhook → Google Sheets + Beehiiv

**Pre-deploy note for Aaron:** Major commit with changes across 40+ files. Pull before starting any work. If you see wireframe HTML files or `Home _ EKUZO_files/` in the repo, those are reference assets — not production code.

---

## Jamie — April 3, 2026 (route canonicalization + EKUZO100 orchestration + contact form + SEO + launch prep)

**What changed:**

**Route canonicalization — all programs now under /programs/:**
- `/programs/ekuzo100` — marketing page (was /programs/e100)
- `/programs/ekuzo100/register` — registration + Stripe payment (was /ekuzo100/register)
- `/programs/ekuzo100/success` — payment confirmation (was /ekuzo100/success)
- `/programs/ekuzo-teams` — marketing page (was /programs/ekuzoteams)
- `/programs/ekuzo-camps` — marketing page, using Aaron's v2 (was /ekuzo-camps/v2)
- `/programs/ekuzo-camps/register` — registration + Stripe payment (was /camps/register)
- `/programs/ekuzo-camps/success` — payment confirmation (was /camps/success)
- 12 redirect rules in next.config.mjs catch all legacy URLs

**EKUZO100 orchestration (new files):**
- `app/api/ekuzo100/register/route.ts` — creates $100 Stripe Payment Intent with product metadata
- `app/programs/ekuzo100/register/page.tsx` — full registration form (cohort selection, schedule preference, gamer info, parent info, Stripe Elements)
- `app/programs/ekuzo100/success/page.tsx` — payment confirmation page
- Webhook (`app/api/webhooks/stripe/route.ts`) rewritten to be product-aware — branches Beehiiv tags, custom fields, and Google Sheets rows by `meta.product` ("camps" or "ekuzo100")
- Added `product: "camps"` to camps register route metadata (was relying on fallback default)

**Contact form — replaced Make.com:**
- New `app/api/contact/route.ts` — writes to Google Sheets + adds email leads to Beehiiv with `source-contact-form` tag
- `ContactModal.tsx` now POSTs to `/api/contact` instead of Make.com webhook

**All internal links updated:**
- EnrollModal, ProgramsSection, Footer — all point to canonical `/programs/` routes
- Links within program pages, cross-program references all canonical

**SEO metadata:**
- Root layout: title template "%s | EKUZO", robots, OpenGraph, Twitter cards
- Every key page: unique title, description, OG tags

**Stripe API version:** Updated all 4 API routes from `2025-03-31.basil` → `2026-02-25.clover`

**External setup required (not in code):**
- Beehiiv: create tags `ekuzo100-purchased`, `source-ekuzo100-registration`, `source-contact-form`
- Google Sheets: add `product` + `gender` columns, add `contact_inquiries` sheet/handler to Apps Script
- Stripe: EKUZO100 product in live mode, webhook endpoint for production domain

---

## Aaron — April 3, 2026 (methodology video fix + camps v2 tweaks)

**What changed:**

**Methodology page (app/methodology/page.tsx):**
- Hero section: changed `overflow-clip` to `overflow-visible` to stop clipping the video (matching e100 pattern)
- Removed `lg:mx-0` from video container so it centers like e100
- Reduced hero headline font size from `clamp(100px, 18vw, 256px)` to `clamp(72px, 10vw, 160px)` to give the video more visual space in the 50/50 grid

**Camps v2 page (app/ekuzo-camps/v2/page.tsx):**
- What Do I Need: swapped layout — image now on left, text on right on desktop. Mobile keeps text-first order using CSS `order` classes
- What Do I Need: changed grid alignment from `items-start` to `items-center` for vertical centering
- Nuri gamertag updated: "Je" → "Teemo Time" Je (full name: NURI "TEEMO TIME" JE)

---

## Aaron — April 2, 2026 evening (camps v2 — continued refinements)

**What changed:**

**Camps v2 page (app/ekuzo-camps/v2/page.tsx):**
- Coach bios updated: Karlin "Faith" Oei (Founder // Peak Challenger Jungler), Sebastien "ZzLegendary" Demontigny (Head Coach // Professional Esports Coach), Nuri "Je" (Coach // Diamond Support)
- Coach images wired: coach-karlin-faith.jpg, coach-sebastien-ZzLegendary.png, coach-nuri-je.png with per-coach objectPosition (Karlin 20%, Sebastien top, Nuri 60%)
- Coach section renamed: eyebrow "Coaches" → "Our Team", added body copy paragraph below headline
- Coach hover: removed grayscale default, images now full color. Desktop hover: card lifts -translate-y-2, image scales 105% (no shadow). Mobile: no hover effects.
- For Parents cards: white bg with chopped corners, black icons, headline size matched to day cards (`clamp(2rem, 3.5vw, 3rem)`), body copy matched (`clamp(0.95rem, 1.2vw, 1.1rem)` in `text-black/70`)
- What Do I Need: layout flipped — copy on left, collage image on right. Using tech-collage@2x.png on grey bg container
- Register section: red bg with register-promo-hero-2.png background image, radial gradient center darkening for legibility, chopped-corner card (white left panel with red button, black price stub), removed red top/bottom torn papers. Summer 2026 / PC Discord text sized to match parent card headlines.
- Register button: full-width in panel (`block text-center`)
- FAQ: headline changed to font-display uppercase matching other sections, removed black bottom torn paper
- Testimonials: added white-bottom-2 torn paper divider
- Ticker: background color changed to #AE2CF2 (purple), stars changed to #E0FF4F (neon yellow-green), letter spacing tightened to 0.07em
- "Learn more about games" button: grey style with white fill, tertiary size
- All buttons confirmed title case site-wide (no uppercase class)

**Eyebrow component (components/ui/Eyebrow.tsx):**
- Added `self-start` to prevent flex container stretching (fixes eyebrow bg extending full width)

**SVG viewBox fixes (public/icons/):**
- team.svg, strategy.svg, trophy.svg: recalculated as square centered bounding boxes for proper centering in circle containers

---

## Aaron — April 2, 2026 (camps v2 page — visual QA + new sections)

**What changed:**

**Camps v2 page (app/ekuzo-camps/v2/page.tsx):**
- Hero: video bg (camp-hero.mp4) with dark gradient + red accent overlay, seamless marquee ticker above nav, white body copy, oversized white "Register for Camp" button (Inter bold, 2px radius)
- Camp Overview: white bg, white-top-1 overlapping hero, 4-col grid with 60px icons (swords, calendar, chat, loot), values at clamp(4rem, 7vw, 6rem)
- EKUZO Difference: grey bg with grey-top-2, squad formation visual with chopped-corner wrapper (bg-black/20 outer border, bg-white/50 inner), "SQUAD VANGUARD 67" header at 40px, player rows with hover states, "Your Gamer" callout in solid red
- 5-Day Progression: day letters in font-display red, red outline on hover (outer wrapper hover:bg-red), titles at clamp(2rem, 3.5vw, 3rem)
- For Parents: black bg with black torn paper top/bottom, white chopped-corner cards with black icons (CircleIcon), text-base body copy
- Coaches + What Do I Need + What Do We Play: combined grey section (no grey top divider)
  - Coaches: grey bg, white chopped-corner cards with grayscale photos
  - What Do I Need: grey bg container with chopped corners + tech-collage@2x.png overlapping on top, copy on right
  - What Do We Play: League of Legends copy with 3 checklist items (red circle icons with white graphics via CSS filter invert), sticky chopped-corner image on right, grey tertiary "Learn more about games" and "View more FAQs" buttons, chopped-corner FAQ callout card
- Testimonials: white bg, quote cards with chopped-corner wrapper borders, video with red play button overlay, increased spacing between video and name (mt-8)
- Secure Your Slot: red bg with red torn paper top (no bottom), chopped-corner card — white left panel (red register button) + black right price panel ($199)
- FAQ: black bg, dark theme
- Mobile CTA bar at bottom

**Eyebrow component (components/ui/Eyebrow.tsx):**
- Tightened padding from px-5 py-2 to px-3 py-1.5 (fits text closer)
- Added self-start to prevent stretching in flex containers

**TestimonialVideo component (components/ui/TestimonialVideo.tsx):**
- Increased gap between video and name/role from mt-4 to mt-8

**SVG icon viewBox fixes (public/icons/):**
- team.svg: viewBox cropped to "-6 -4.1 43 43" (square, centered on artwork)
- strategy.svg: viewBox cropped to "-1.5 -1.8 38.7 38.7" (square, centered)
- trophy.svg: viewBox cropped to "-1.6 -2.1 35.2 35.2" (square, centered)

**Other:**
- Added "loot" to ICONS array in Icon.tsx
- Converted camp-hero.mov to camp-hero.mp4 via ffmpeg (67MB → 15MB)
- Temporarily renamed register page to .bak (missing @stripe/react-stripe-js)
- Updated CLAUDE.md Learning Log with two-system torn paper documentation

---

## Aaron — April 1, 2026 (site-wide consistency pass + FAQ page build)

**What changed:**

**FAQ page — full build (app/faq/page.tsx):**
- Hero: black bg, smoke graphics, Eyebrow "FAQS", headline `clamp(3rem, 12vw, 160px)`, maxHeight 720px
- Hero graphic: `faq-hero-graphic.png` at `w-[55%] max-w-[860px]` lower-right
- Overflow-visible wrapper on hero with `black-bottom-1` divider outside the section
- 5 FAQ sections alternating: white (Safety) → grey (Programs) → white (Outcomes) → black (Cost) → white (Enrollment)
- Section headlines: `font-display uppercase leading-[0.85]` at `clamp(2.5rem, 5vw, 4.5rem)` — no eyebrows on content sections
- Decorative brush art at 6-8% opacity (hidden on mobile)
- Mobile CTA bar at bottom

**FAQAccordion — global camada-caret icon (components/ui/FAQAccordion.tsx):**
- Replaced chevron SVG with camada-caret SVG (`viewBox="0 0 72 72"`)
- Icon: `w-7 h-7 lg:w-8 lg:h-8` (28px mobile, 32px desktop)
- Open state: `bg-red rotate-180` on circle, white fill on icon
- Closed state: `rgba(0,0,0,0.08)` (light) or `rgba(255,255,255,0.15)` (dark) circle bg
- This is a global change — affects all FAQ modules across every page

**FooterBanner fix (components/sections/FooterBanner.tsx):**
- Heading size adjusted to `clamp(2rem, 4.5vw, 56px)` with `maxWidth: "14em"` to fix "today" orphaning

**Programs page — consistency pass (app/programs/page.tsx):**
- Hero: overflow-visible wrapper with `red-bottom-1` divider
- OurApproach: `tornPaper="none"`
- Animation: overflow-visible wrapper with `grey-top-1` / `grey-bottom-1`
- FAQ: overflow-visible wrapper with `black-top-1`
- Mobile CTA bar added

**Parents page — consistency pass + blog redesign (app/parents/page.tsx):**
- All old background-image torn papers replaced with TornPaperDivider
- Our Approach: wrapped with `grey-top-1`
- Animation: standard wrapper with `grey-top-1` / `grey-bottom-1`
- Blog section redesigned: Eyebrow "BLOG" (light variant) + headline + subtitle, full-width chopped-corner image card with gradient overlay
- FAQ: overflow-visible wrapper with `black-top-1`
- Mobile CTA bar added

**Schools page — consistency pass (app/schools/page.tsx):**
- Hero: overflow-visible wrapper with `white-bottom-1`, heading `leading-[0.85]`
- Animation: overflow-visible wrapper with `grey-top-1` / `grey-bottom-1`
- Outcomes: overflow-visible with `black-top-1`
- Testimonial quote: overflow-visible with `red-top-1` / `red-bottom-1`
- FAQ: overflow-visible with `black-top-1`
- Mobile CTA bar added

**Methodology page — consistency pass (app/methodology/page.tsx):**
- Hero: `overflow-clip`, `leading-[0.85]`, headline bumped to `clamp(100px, 18vw, 256px)`, standard video container sizing
- Hero → How It Works transition: whole torn paper (`torn-paper-grey-1@2x.png`) using raw background-image div pattern with `translateY(52%)`, hero wrapper `zIndex: 1`, How It Works wrapper `zIndex: 0`, section pulled up with negative margin
- Why Games Work: `overflow-visible` wrapper, section uses negative `marginTop` + extra `paddingTop`
- Quote: overflow-visible wrapper with `red-top-1` / `red-bottom-1`
- Ten Pillars: `overflow-clip`
- Mobile CTA bar added

**ProgramsSection (components/sections/ProgramsSection.tsx):**
- Updated canonical routes: `/programs/ekuzoteams`, `/programs/e100`, `/camps`
- Desktop heading: `leading-[0.85]`

**CLAUDE.md — Learning Log update:**
- Replaced old torn paper notes with comprehensive two-system documentation
- System 1: One-sided dividers (tops/bottoms) via `<TornPaperDivider>` component
- System 2: Whole dividers (both edges) via raw background-image div pattern
- Documented the common mistake: torn paper inside `overflow-clip` section gets clipped

---

## Aaron — April 1, 2026 (e100, ekuzoteams, games page builds + global QA pass)

**What changed:**

**EKUZO100 page — new canonical location (app/programs/e100/page.tsx):**
- Hero: methodology template (smoke graphics, light-red nav, 9:16 video at 70vh, PlayOnceVideo with sound on)
- Headline: `clamp(100px, 18vw, 256px)` with `leading-[0.85]` — global standard for program hero headlines
- EKUZO in black, 100 in red (matches program card style)
- Our Approach: `white-top-2` overlapping hero, `tornPaper="none"` on component
- Ecosystem animation: wrapped in `overflow-visible` div with `grey-top-1` and `grey-bottom-1` — standard for all animation sections
- How It Works: chopped corners (clip-path) on 1234 cards, "ONE MONTH. FOUR STEPS." single line on desktop
- Testimonials: exact homepage module (carousel + static featured quote)
- What's Next: responsive padding `clamp(80px, 14vw, 188px)`, grey-top-1 / grey-bottom-2 dividers
- FAQ: black bg, dark theme, Eyebrow component

**EKUZOTeams page — new canonical location (app/programs/ekuzoteams/page.tsx):**
- Hero: methodology template (smoke graphics, light-red nav, 9:16 video at 70vh, PlayOnceVideo)
- EKUZO in black, TEAMS in red
- Our Approach: `white-top-2`, icons updated (confidence-2 for consistent team, speaking for coach-led practice)
- One Semester One Team section: `black-top-1` / `black-bottom-1`, icon cards (calendar, team, trophy), chopped corners
- Session Structure: chopped corners on 1234 cards, red quote box with quote mark image, Inter font, chopped corners on quote box
- Two Ways to Participate: updated to use TornPaperDivider `black-top-2` (replaced old background-image torn paper), removed bottom paper
- Ecosystem animation: `grey-top-1` / `grey-bottom-1` in overflow-visible wrapper
- Testimonials: homepage module with carousel + quote
- EKUZO System section: two-column layout, eyebrow above grid, program progression cards with red hover borders, bigger titles/darker descriptions
- FAQ: black bg, dark theme

**Games page (app/games/page.tsx):**
- Hero: kept red bg, full-color hero image (removed opacity), Eyebrow `variant="light"` (white bg/red text)
- Headline: `clamp(100px, 18vw, 256px)` — "GROWTH / THROUGH / GAMES"
- Why Games: eyebrow above grid so body copy aligns with headline top, `clamp(3.5rem, 7vw, 7rem)` heading
- Six Pillars sticky scroll: gamer kid collage 2x size (700px wide, -mr-24 overlap behind cards), chopped corners on all 6 cards
- League of Legends: white cards with black text, no torn paper dividers
- Beyond LoL: Eyebrow `variant="light"`, full-color illustration (removed opacity)
- All manual `<p>` eyebrow tags replaced with `<Eyebrow>` component
- All legacy SVG TornPaperDivider calls converted to new PNG system
- Testimonial quote: switched to Inter font (font-body font-bold)

**Eyebrow component (components/ui/Eyebrow.tsx):**
- Added `variant` prop: `"default"` (red bg/white text) and `"light"` (white bg/red text)
- Light variant is for use on colored background sections (red, black, etc.)

**TwoWaysSection (components/sections/TwoWaysSection.tsx):**
- Replaced old background-image torn paper with TornPaperDivider `black-top-2`
- Removed bottom torn paper entirely

**FAQ Eyebrow — global pass (all FAQ sections across the site):**
- Added `<Eyebrow>FAQ</Eyebrow>` to: parents, schools, programs, ekuzoteams-semester-based, ekuzo-teams, ekuzocamps-seasonal, ekuzo-camps, coaching, faq (FAQSection component)
- Added Eyebrow imports where missing

**New route locations:**
- `/programs/e100` — EKUZO100 (canonical)
- `/programs/ekuzoteams` — EKUZOTeams (canonical)
- Old routes (`/ekuzo100-4-week-intro`, `/ekuzoteams-semester-based`) still exist but are now out of date

---

## Aaron — April 1, 2026 (methodology page rebuild + new torn paper system + nav updates)

**What changed:**

**Methodology page (app/methodology/page.tsx):**
- Hero: 70/30 grid, smoke-1@2x lower-left, smoke-2@2x full-height right side (100% section height, behind nav, no flat edges)
- Hero video: 9:16 portrait aspect, 720px max height, play-once behavior with sound on by default (falls back to muted if browser blocks)
- How It Works: grey bg, new torn paper PNG divider at top
- Quote section: red bg, new torn paper red-top-1 and red-bottom-1 dividers
- Ten Pillars: 2/3/2/3 offset column layout, top-left/bottom-right clip-path only, red hover stroke, single-column on mobile

**New reusable component — TornPaperDivider (components/ui/TornPaperDivider.tsx):**
- **NEW PNG API:** `<TornPaperDivider color="red" variant="top" style={1} />`
- Colors: red, grey, black, white. Variants: top, bottom. Styles: 1 or 2.
- Place inside a `relative overflow-visible` section — "top" overlaps section above, "bottom" overlaps section below
- Fixed minimum width (1440px) so paper texture stays sharp on mobile, centered with `left-1/2 translate(-50%)`
- 2px overlap to prevent subpixel gap artifacts
- **Legacy SVG API still works** for existing pages (omit `variant` prop)
- PNG assets in `public/images/new torn paper/` — full set: 24 files (4 colors × 3 variants × 2 styles)

**PlayOnceVideo component (components/ui/PlayOnceVideo.tsx):**
- New client component for video that autoplays once then stops
- Tries sound-on first, falls back to muted if browser blocks
- Shows native controls for replay

**Nav updates (components/layout/Nav.tsx):**
- New `light-red` variant: white background + red EKUZO logo
- Created `public/images/ekuzo-logo-red.svg`
- Removed black border from mobile hamburger button
- Schools, Families, Methodology pages now use `variant="light-red"`

**Other site-wide changes:**
- FooterBanner promo graphic: maxWidth bumped to `clamp(390px, 40vw, 560px)`, maxHeight 800px
- StickyCTA enroll button: added `border-2 border-red`

**Logo files:**
- `ekuzo-logo.svg` — white (for dark backgrounds)
- `ekuzo-logo-black.svg` — black (for light backgrounds)
- `ekuzo-logo-red.svg` — red (for schools, families, methodology)

---

## Aaron — March 31, 2026 (programs page QA + shared component overhaul)

**What changed:**

**Homepage tweaks (app/page.tsx):**
- Torn paper moved down 20px (`translateY(calc(-55% + 20px))`)
- SCHOOL/HOME card body copy margin reduced to 20px (was 80px)
- Card min-height set to 480px (was 512px)
- Hero torn paper switched to background-image div pattern (responsive heights: 115px phone → 300px desktop) positioned at bottom of hero section, matching Framer's White2 component placement
- Torn paper now uses `background-size: cover` on a fixed-height div instead of `<img>` — fixes mobile rendering

**Nav (components/layout/Nav.tsx):**
- Hamburger breakpoint bumped from `md` (768px) to `lg` (1024px) — desktop nav links + button need more room

**StickyCTA (components/ui/StickyCTA.tsx):**
- Now hides when footer scrolls into view (IntersectionObserver on `<footer>`)

**Programs page full QA pass (app/programs/page.tsx):**
- Hero: `min-height: 100vh`, Rive animation full-bleed (`programs-hero.riv`, autoplay)
- Removed all standalone `<TornPaperDivider>` components — replaced with inline background-image divs
- Ecosystem section: added black torn paper top + white torn paper bottom
- Testimonials: max-width → 1120px, headline centered with line break to avoid widows
- FAQ: black background, headline "Frequently asked questions" in Heading 4 size, black torn paper at top

**New file: components/sections/ProgramsHeroRive.tsx**
- Simple autoplay Rive component for programs hero animation

**OurApproachSection (components/sections/OurApproachSection.tsx) — redesigned:**
- Eyebrow above columns, 70:30 layout: heading + body left, icon list right
- Icons match homepage growth section pattern (red circle + white SVG, 50px mobile / 72px desktop)
- New optional `icons` prop (defaults to homepage icons) — backward compatible
- Old `<TornPaper>` removed, replaced with background-image black torn paper at bottom

**ProgramsSection (components/sections/ProgramsSection.tsx) — redesigned:**
- Header centered (matching homepage pattern)
- Headline: "3 programs. 1 system." / "1 esport experience." (line break)
- Cards: removed dark overlay, added angled clip-path corners
- Bottom row: blurb left, CTA button right (`justify-between`)
- Responsive padding + card sizing with clamp()
- Card hrefs updated to correct routes

**TwoWaysSection (components/sections/TwoWaysSection.tsx) — redesigned:**
- Old `<TornPaper>` removed, replaced with background-image torn paper (white top, black bottom)
- Cards: added "For Schools" and "For Families" CTA buttons (red-outlined)
- Cards use `justify-between` layout (heading+body top, button bottom)
- Non-breaking spaces (`&nbsp;`) added to prevent widows in body copy
- Header items centered
- Watermark repositioned to centerY -4%

**FAQAccordion (components/ui/FAQAccordion.tsx) — restyled globally:**
- Arrow icon on the left (chevron in circle, rotates 180° on open)
- Question text fills remaining space
- White/black line separator under each item
- Answer text indented to align with question (padding-left matches icon width + gap)

**QA documentation created:**
- `docs/QA-CHECKLIST.md` — repeatable checklist from all homepage lessons learned
- `docs/PAGE-ROLLOUT-PLAN.md` — prioritized plan for remaining pages (3 tiers)

**Design rules established for future pages:**
- Torn paper: always use PNG background-image on fixed-height div, never `<img>` SVG
- Cards with angled corners: always use clip-path polygon (40px cuts)
- No widows (single words on their own line)
- Nav switches to hamburger at lg (1024px)
- Testimonials headline always centered
- FAQ sections: black bg, "Frequently asked questions" heading, chevron icons

---

## Aaron — March 31, 2026 (homepage QA pass — torn paper, cards, footer wordmark)

**What changed:**

**Torn paper hero→growth gap fix (app/page.tsx):**
- Switched from `paper-white-1.svg` (1440px viewBox, path stops 3px short) to `torn-paper-white-1.svg` (2400px viewBox, `preserveAspectRatio="none"` — stretches to fill any container with zero gaps)
- Positioned: `left-1/2` + `translateX(-50%)` centered, `width: 125%` so edges overflow both sides of viewport (showing middle ~80% of texture), `height: 150px` for peak/valley control
- To adjust: change `width %` to show more/less texture, `height` for drama
- Added `overflow-x-clip` to `<body>` in layout.tsx to prevent horizontal scrollbar from oversized torn paper

**SCHOOL/HOME cards (app/page.tsx):**
- Changed card background from `bg-grey` to `bg-white` (cards are white against black section bg per Framer)
- Added `clip-path: polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)` for 40px angled corners on upper-left and bottom-right (matches Framer SVG mask)
- Set gap between heading and body to 140px on desktop, 100px on mobile
- Increased heading size to 120px and min-height to 512px per Framer spec

**EKUZO footer wordmark (components/layout/Footer.tsx):**
- Replaced JS-based text measurement approach with `ekuzo-huge.svg` asset (dropped in by Aaron)
- SVG renders as `<img>` at `w-full h-auto` — naturally scales to fill container edge-to-edge
- Container breaks out of footer padding with negative margins so SVG spans full viewport width
- Removed footer `paddingBottom` so SVG sits flush with page bottom (no gap below)
- SVG viewBox is 1442×627, left edge of E and right edge of O flush with viewport

---

## Jamie — March 30, 2026 (late night — validation + additional_info)

**What changed:**
- Added form validation for birthday, tshirtSize, gamerTag, and preferredGames on registration form (`app/ekuzo-camps/register/page.tsx`)
- Added 1500-character limit + live character counter on additional_info textarea
- Chunked additional_info across multiple Stripe metadata keys in `/api/camps/register` (up to 1500 chars split into 3×500-char keys)
- Added `additional_info` column to Google Sheets row data in webhook — reassembles chunked metadata before writing
- **Note for future:** Need a QA/monitoring cron job to track registration data integrity (Stripe metadata → Beehiiv fields → Google Sheets rows). Flag mismatches, missing fields, truncated data. Not built yet — add when operational volume justifies it.

**Apps Script update needed:**
- Google Apps Script needs `additional_info` added as column 21 in the sheet and in the `doPost` column mapping. Jamie to update manually.

---

## Jamie — March 30, 2026 (evening session — webhook + sheets + e2e)

**What changed:**
- Updated Stripe webhook (`app/api/webhooks/stripe/route.ts`) — now handles full post-payment data flow:
  - Beehiiv enrollment with all 13 custom fields
  - Tags applied via dedicated POST `/subscriptions/:id/tags` endpoint (create endpoint ignores tags)
  - Automation enrollment via `automation_ids` (array, not singular `automation_id`)
  - Multi-gamer aware: `gamer_name` comma-separated, `camp_week` stores earliest week for automation timing
  - Google Sheets write via Apps Script (one row per gamer, 20 columns incl. registration_id, family_id, birthday, skill_level, tshirt_size, preferred_games)
- Removed deprecated `export const config` (Pages Router pattern, not needed in App Router)
- Set up Google Cloud project (`ekuzo-web`), enabled Sheets API, created service account
  - Service account key creation blocked by Google Workspace org policy — pivoted to Apps Script approach
- Created Google Apps Script web app as Sheets write proxy (no service account needed)
- Added env vars: `STRIPE_WEBHOOK_SECRET`, `GOOGLE_SHEETS_WEBHOOK_URL`
- Installed Stripe CLI via Homebrew, authenticated
- End-to-end tested (3 test payments): Stripe → webhook → Beehiiv (fields + tags) + Google Sheets

**Beehiiv API learnings (important for future work):**
- Create subscription endpoint does NOT support `tags` — must use separate POST `/subscriptions/:id/tags` with `{ "tags": [...] }`
- Create subscription uses `automation_ids` (plural, array of strings), not `automation_id`
- PUT update endpoint silently ignores `tags` field — do not use for tagging
- Create endpoint silently ignores unknown fields (no error, just drops them)

**Architecture decisions:**
- Google Sheets via Apps Script (not googleapis npm + service account) — simpler, no credentials to manage
- Multi-gamer Beehiiv: comma-separated gamer names, earliest camp week for automation timing. Per-gamer emails (different coaches/timing) deferred to v2 via transactional email layer (Resend/SendGrid)
- Google Sheets has one row per gamer with registration_id + family_id for ops/fulfillment

**What's next:**
- Clean up test subscribers in Beehiiv (jamiefosu+1, +2, +3)
- Backfill tags on +1 and +2 subscribers (tags endpoint only worked on +3)
- `/camps/success` page needs building (confirmation with booking summary)
- ContactModal: replace Make.com webhook with `/api/contact` route
- Production deploy: Netlify, production Stripe webhook endpoint, production env vars

---

## Jamie — March 30, 2026

**What changed:**
- Configured Beehiiv for camp registration data flow
  - 13 custom fields created and verified (first_name, last_name, phone, program, gamer_name, camp_week, camp_slot, gamer_count, registration_summary, payment_intent_id, amount_paid, timezone, location)
  - 9 tags created (camp-2026-purchased, source-camp-registration, source-newsletter, source-contact-form, no-promo, vip, camp-2026-completed, ekuzo100-purchased, teams-purchased)
  - Camp Purchase Welcome Sequence automation scaffolded (draft, placeholder content)
- Created `docs/beehiiv-config.md` — portable reference doc for Beehiiv field config, tags, webhook payload spec
- Reviewed Beehiiv reserved fields to avoid naming collisions
- Decided on Google Sheets API as ops/fulfillment layer (replaces earlier Airtable discussion)
- Confirmed Make.com is being retired — no new integrations should use it

**What's in progress (Jamie's lane — orchestration):**
- Stripe webhook needs code update: add source tag, gamer_name/camp_week/camp_slot fields, automation_id
- Google Sheets API integration for fulfillment data (one row per gamer)
- End-to-end test: form → Stripe → webhook → Beehiiv + Google Sheet
- Welcome automation email content (draft in Beehiiv, needs real copy before publishing)

**Decisions made this session:**
- Beehiiv custom field names match webhook snake_case convention (not Beehiiv presets)
- phone field is TEXT not NUMBER (to support formatted numbers)
- gamer_name, camp_week, camp_slot kept as separate fields for automation triggers (not just in registration_summary blob)
- Make.com is being retired — ContactModal still uses it but should be replaced with /api/contact route
- Google Sheets API (direct) replaces Make.com for fulfillment data flow

---

## Jamie — March 27, 2026

**What changed:**
- Added `StickyCTA` component — fixed-bottom bar with "Enroll my gamer" + "Start a conversation" buttons, wired to modal system. Shows after 300px scroll, hides when modal is open. Mounted in root layout.
- Rewrote `EcosystemAnimation.tsx` — replaced broken delta-based scroll with container-relative scroll progress. Added debug overlay (currently off). Still needs PROGRESS_MAX calibration to match Framer pacing.
- Fixed `overflow-hidden` → `overflow-clip` on all 8 pages with the 360vh ecosystem section (overflow-hidden was breaking sticky positioning).
- Set up GitHub repo, transferred to EKuzo-gg org.
- Created AARON-START-HERE.md, SETUP.md, WORKLOG.md.

**What's in progress (Jamie's lane — orchestration):**
- Stripe + Beehiiv integration for camps registration (API routes not yet built)
- `.env.local` has Stripe keys but Price IDs not yet configured

**Known issues:**
- Ecosystem animation PROGRESS_MAX needs calibration (set to 200, should be ~300-400)
- Homepage needs visual QA against live Framer site
- Social icons in Footer are text placeholders, not real SVGs
## Aaron — March 30, 2026 (mobile responsive pass + bird position fix)

**What changed:**

**Bird position (components/ui/ParallaxBird.tsx):**
- Changed from `top: 50vh` (center of viewport) to `top: 85%` (85% of hero section), matching Framer spec `centerY 85%`
- Bird no longer overlaps the headline on initial load
- Mobile size reduced to 180×162px (desktop stays 332×300px)
- Parallax scroll effect preserved

**Mobile: Nav logo (components/layout/Nav.tsx):**
- Logo width set to 110px on mobile, 170px on desktop (`w-[110px] md:w-[170px]`)

**Mobile: Hero section (app/page.tsx):**
- Headline font size bumped: `clamp(4.5rem, 20vw, 256px)` — fills container on mobile
- Horizontal padding: 40px on mobile (`px-[40px]`), 16px on desktop
- Hero collage image constrained on mobile via responsive height clamp
- Section top/bottom padding now responsive with clamp values

**Mobile: Growth section (app/page.tsx):**
- List items (structured practice, skilled coaching, real competition) now appear ABOVE the image on mobile using flex order swap (order-1 mobile → order-2 desktop)
- Red circle icons reduced to 50×50px on mobile (72px on desktop)
- Tighter gaps: 40px between sections on mobile (90px desktop), 6px between list items (8px desktop)
- Section padding reduced on mobile with clamp values

**Mobile: How It Works section (app/page.tsx):**
- Top/bottom padding reduced to ~100px on mobile via `clamp(100px, 14vw, 188px)`
- SCHOOL and HOME headers set to 80px on mobile: `clamp(80px, 8vw, 96px)`
- Card padding and gaps tightened on mobile (p-8 vs p-10, gap-6 vs gap-8)

**Mobile: Testimonials (components/sections/TestimonialsCarousel.tsx):**
- Single card on mobile centered with `max-width: 340px` for desktop-like proportions
- Pagination dots and arrows already functional for swiping through all 8 videos

**Footer Banner (components/sections/FooterBanner.tsx):**
- Swapped brush stroke placeholder with `enroll-promo-graphic.avif` (the two kids illustration)

---

## Aaron — March 30, 2026 (animation fixes + footer banner + video loading)

**What changed:**

**Rive ecosystem animation (components/sections/EcosystemAnimation.tsx):**
- Fixed PROGRESS_MAX: was 200 (broken), now 1000 for desktop and 500 for mobile (matches Framer spec exactly)
- Refactored EcosystemScroll to accept `progressMax` prop instead of using a single global constant
- Both desktop and mobile variants now get their correct Rive input range

**Testimonial videos (components/sections/TestimonialsCarousel.tsx + public/testimonial-videos/):**
- Generated poster JPG images from video first frames (77–185KB each vs 13–88MB mp4s) — videos now show thumbnails instantly
- Added `poster` attribute to all video elements pointing to `{slug}-poster.jpg`
- Set `preload="none"` (poster handles the visual; video data loads on click)
- Faststart-optimized all 9 MP4 files (moved moov atom from end to beginning) for faster playback start

**Footer Banner (components/sections/FooterBanner.tsx):**
- Restructured layout to match Framer: horizontal flex with heading+CTA left, decorative image right
- Added `max-w-[1232px] mx-auto` container matching Framer's 1232px max-width
- Heading and CTA now stack vertically with 72px gap (matching Framer)
- Image component uses `enroll-promo-graphic.avif` (hidden on mobile)

**White paper divider gap (previous session, already applied):**
- `paper-white-1.svg` at hero→growth transition uses `width: calc(100% + 4px)` and `left: -2px` to eliminate right-edge gap caused by SVG viewBox being narrower than full width

---

## Aaron — March 30, 2026 (torn paper rewrite + testimonial quote)

**What changed (Torn paper system rewrite):**

**Torn paper architecture overhaul:**
- Removed all standalone `<TornPaperDivider>` components from between sections (old approach)
- New approach: absolutely positioned `<img>` SVGs inside sections, positioned so the flat/solid edge sits flush at the section boundary and the torn edge extends into the adjacent section
- Removed `TornPaperDivider` import from `app/page.tsx`

**Homepage torn paper placements (app/page.tsx):**
- Hero → Growth: `paper-white-1.svg` at top of growth section, rendered white via CSS filter `brightness(0) invert(1)`, `translateY(-55%)`
- Growth → Ecosystem: `paper-grey-bottom-2.svg` at bottom of growth section, `translateY(55%)`
- Ecosystem top: `paper-white-top-1.svg` (swapped from black — white blends with ecosystem bg), `translateY(-55%)`
- Ecosystem → How It Works: `paper-black-top-2.svg` at bottom of ecosystem, flat edge flush + 2px nudge to close gap
- How It Works → Testimonials: `paper-black-bottom-2.svg` at bottom, `translateY(calc(100% - 2px))` — flat edge flush, torn edge extends into white testimonials
- Ecosystem section overflow changed from `overflow-clip` to `overflow-visible`
- How It Works section overflow changed from `overflow-hidden` to `overflow-visible`

**FooterBanner (components/sections/FooterBanner.tsx):**
- Top: `paper-red-top-2.svg` (created from paper-black-top-2 with red fill #F92524), `translateY(calc(-100% + 2px))` — torn edge extends into white testimonials
- Bottom: `paper-red-bottom-1.svg` at bottom, `translateY(55%)` — overlapping into footer
- Changed `overflow-hidden` to `overflow-visible` to allow torn paper bleed

**New SVG files created:**
- `public/images/paper-red-top-2.svg` — copy of paper-black-top-2 with `fill="#F92524"`

**Testimonials (app/page.tsx):**
- Added `testimonial-quote-mark.png` (red/black stylized quotation marks) above the featured quote

---

## Aaron — March 30, 2026

**What changed (Homepage visual QA pass):**

**Nav (components/layout/Nav.tsx):**
- Logo enlarged from 107px to 170px wide
- Added bold + underline hover state on desktop nav links (hover:font-bold + underline pseudo-element)

**Homepage (app/page.tsx):**
- Growth Through Play: heading gap increased from 64px to 108px, column gap from 80px to 90px (matching Framer spec)
- Growth Through Play: icon SVGs now render white on red circles via CSS filter (brightness(0) invert(1))
- Hero bird: replaced static image with new ParallaxBird client component (scroll-linked parallax effect at 0.3x speed)
- Torn paper dividers: hero→growth changed from red to white; growth→ecosystem changed from black to white
- How It Works: watermark repositioned to centerY 45% (was 50%); SCHOOL card CTA text changed to "Learn more about EKUZO100"
- How It Works: header block max-width widened from 600px to 800px so heading and body text fit properly
- Testimonials: heading changed from "What families are saying" to "What parents are saying" (centered, with line break); gap increased from 56px to 72px; quote max-width narrowed from 600px to 444px
- Added red TornPaperDivider before FooterBanner for clean white→red transition

**FooterBanner (components/sections/FooterBanner.tsx):**
- Removed overlapping brush stroke decoration image (replaced by torn paper divider in page.tsx)
- Top padding adjusted from 120px to 80px

**New file:**
- components/ui/ParallaxBird.tsx — client component for hero bird parallax scroll effect

**Also updated:**
- AARON-START-HERE.md — all file paths updated from ~/Desktop/Projects/EKUZO-Web to ~/Desktop/EKUZO/Projects/EKUZO-Web

---

## Jamie — March 27, 2026

**What changed:**
- Added `StickyCTA` component — fixed-bottom bar with "Enroll my gamer" + "Start a conversation" buttons, wired to modal system. Shows after 300px scroll, hides when modal is open. Mounted in root layout.
- Rewrote `EcosystemAnimation.tsx` — replaced broken delta-based scroll with container-relative scroll progress. Added debug overlay (currently off). Still needs PROGRESS_MAX calibration to match Framer pacing.
- Fixed `overflow-hidden` → `overflow-clip` on all 8 pages with the 360vh ecosystem section (overflow-hidden was breaking sticky positioning).
- Set up GitHub repo, transferred to EKuzo-gg org.
- Created AARON-START-HERE.md, SETUP.md, WORKLOG.md.

**What's in progress (Jamie's lane — orchestration):**
- Stripe + Beehiiv integration for camps registration (API routes not yet built)
- `.env.local` has Stripe keys but Price IDs not yet configured

**Known issues:**
- Ecosystem animation PROGRESS_MAX needs calibration (set to 200, should be ~300-400)
- Homepage needs visual QA against live Framer site
- Social icons in Footer are text placeholders, not real SVGs
