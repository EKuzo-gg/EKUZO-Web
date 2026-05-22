# EKUZO Camps — Worklog

---

## Session: May 22, 2026 — Solo-Start Email Update

### Context
Camps landing page + registration on EKUZO-Web were updated to route everyone through a solo start. The old BUILDING / LOOKING form choice is retired — there's no "I have a team" branch at signup anymore. Squads form post-purchase via the buyer's shareable squad link. This session updates Email 1 (Purchase Confirmation) to match and lays a plan for the rest of the variant-affected emails (2, 4, 6).

### What We Did

**Variant collapse — Email 1**
- Removed both variant `<tr>` heroes (LOOKING chartreuse + BUILDING purple). Replaced with a single solo hero using the LOOKING chartreuse gradient as the canonical look. Subhead reframed from "We're building your team" → "{{ gamer_name }}'s spot is locked." Body reframed from "we'll match you with a squad and coach" → "Camp is more fun with friends — share your squad link below and pull your crew into the same week."
- Promoted the share CTA into the hero itself (`.cta-btn`, white-on-neon-green, anchors to `#share-squad` further down). No longer Building-only.
- Collapsed the duplicated `.looking-content` / `.building-content` `<div>` greeting paragraphs into one. New copy mentions solo + invite-friends explicitly so the framing is unambiguous on first read.
- Replaced the variant toggle bar (preview-only) with a simple `.preview-bar` strip — "Preview · Solo Start · Purchase Confirmation". Toggle CSS + JS removed; total CSS surface area down ~60 lines.
- Removed orphan `.cta-btn-purple` hover rules — only the Building hero CTA used them and that hero is gone. The remaining purple CTA (Download League on the Get a Head Start block) was already on `.cta-btn`.

**New "Bring Your Crew" share block (between Order Summary + For Parents)**
- Black background with subtle chartreuse radial glow at the top — visual callback to the hero so the share moment reads as part of the same conversation. Clip-path chopped corners match the rest of the email's section language (For Parents cards, Get a Head Start, Parent FAQ).
- Headline: "BRING YOUR CREW" (Oswald 34px, neon green #D4FF00). Subcopy explains the squad-of-5 mechanic + Day-1 matchmaking.
- Visible link preview box: monospaced display of the literal `{{ squad_link }}` URL in a #1a1a1a box with a #333 border. Long-press to copy on mobile; clicking the URL itself opens the page (defensive — different users will reach for different gestures).
- Two share CTAs side-by-side (stack on mobile via `.stack-column`):
  - **Text a Friend** → `sms:?&body=I%20just%20signed%20up%20for%20EKUZO%20Camps.%20Join%20my%20squad%3A%20{{ squad_link }}` (the `?&` form works on both iOS and Android).
  - **Email a Friend** → `mailto:?subject=Join%20my%20EKUZO%20Camps%20squad&body=...{{ squad_link }}`.
- Footer line: "Friends who tap your link will register for {{ camp_week_dates }} and be matched into {{ gamer_name }}'s squad." Closes the loop on what happens when a friend actually clicks through.

**Build script — single output instead of variant pair**
- Rewrote `build-klaviyo.py`. Variant helpers (`strip_variant_blocks` / `unwrap_variant_blocks`) removed; if variants come back, restore from git. Build now produces a single `klaviyo-ready/<name>.klaviyo.html` per source file. Token rewriter (bare → `event.extra.*` / `person.*`) and compliance-tag swap (Unsubscribe / Email Preferences) preserved unchanged.
- Added newer footer-link color (`#FFFFFF`) to the compliance-tag replacement list; old `#666666` rules kept for backward compat with any pre-May source files.

**Klaviyo-ready housekeeping**
- Moved the six old variant outputs (`*-BUILDING.klaviyo.html` / `*-LOOKING.klaviyo.html` for Email 1 + master) into `klaviyo-ready/_v2-backup-pre-solo/` so the active directory only contains the new solo build.

**Planning doc for the rest of the journey**
- `solo-start-email-plan.md` at project root. Captures: (1) universal changes (drop conditional splits, retire "match into team" language, treat squad_link as always-present, recur the share CTA across emails 1/2/4/6); (2) email-by-email rewrite notes for Emails 2 (Welcome), 4 (Hype / 1 week out), 6 (Post-Camp); (3) Jamie hand-off — `squad_status` keeps for analytics only, `squad_member_count` needed for Email 4's last-call conditional, verify webhook writes squad_link for solo profiles; (4) open questions — referral mechanic (distinct from squad link, future scope) and `navigator.share()` on the squad page.

### Files Updated / Created
- `email-templates/01-purchase-confirmation.html` — source, all edits above.
- `email-templates/build-klaviyo.py` — variant logic removed; single-output build.
- `email-templates/klaviyo-ready/01-purchase-confirmation.klaviyo.html` — new single solo output, regenerated.
- `email-templates/klaviyo-ready/_v2-backup-pre-solo/` — old variant outputs archived.
- `solo-start-email-plan.md` — created (project root).

### QA Done
- Grep for orphan variant references (`looking-content` / `building-content` / `variant-btn` / `cta-btn-purple`) in source and Klaviyo output → all zero.
- All 6 bare `{{ token }}`s in source rewrite to `{{ event.extra.* }}` / `{{ person.* }}` in output (14 namespaced tokens total).
- All 12 image `src` attributes in the Klaviyo output are CDN URLs — no local `../email-assets/` paths leaked through.
- `#share-squad` anchor pair confirmed (hero CTA → share section `<td id="share-squad">`).
- HTMLParser tag-balance check passes on both source and output (no unclosed tags).
- MSO conditional pairs balance after accounting for the `[if !mso]` font-load conditional on lines 21/25.

### Open Items
- [ ] **Aaron:** Paste `klaviyo-ready/01-purchase-confirmation.klaviyo.html` into the Klaviyo email action (formerly two actions, now one). Delete the BUILDING/LOOKING conditional-split step from the flow.
- [ ] **Aaron:** Send a preview to self — verify the hero anchor `#share-squad` jumps in Apple Mail; tolerable if it doesn't fire in Outlook (user can still scroll).
- [ ] **Aaron:** Mobile QA the SMS share button on iOS and Android — confirm the `sms:?&body=` URL syntax fires in both; if Android trips on the `?&` combination, swap to `sms:&body=` (iOS-friendly variant) and accept Android may not autofill.
- [ ] **Jamie:** Confirm Stripe webhook (`app/api/webhooks/stripe/route.ts`) writes `squad_link` for **solo** profiles, not just former-BUILDING profiles. With the registration form simplified, every buyer should generate their own squad token. If the webhook only fires the squad_link write when squad_status was "building", update the logic so it fires unconditionally.
- [ ] **Jamie:** `squad_member_count` profile property — confirm it exists on the Klaviyo profile, or add it via the squad-join hook. Needed for Email 4's last-call conditional CTA when we build Email 4.
- [ ] **Jamie:** Squad-link join page (`/register?squad=<token>`) — confirm it's still the active destination after the landing-page rework. Email 1's link preview displays the literal URL, so if the path moved, the preview text is wrong.
- [ ] **Aaron + Jamie:** Decide whether to build the referral mechanic (distinct from squad link — earns the buyer a reward for non-squad signups). Captured in `solo-start-email-plan.md` as future scope. Worth a 15-minute scoping conversation before Email 6 is built.
- [ ] Carryover from April 17: Outlook render QA, 180px For Parents card height check, Discord URL placeholder swap, landing-page hero updates (team-invite headline, taller collage).

---

## Session: April 14, 2026

### What We Did
- Defined the complete 16-email post-purchase journey across 6 Klaviyo flows (Purchase Confirmation, Onboarding, Hype, Pre-Camp Final Prep, During-Camp, Post-Camp)
- Mapped squad segmentation logic: "Building a Squad" vs "Looking for a Squad" — 4 emails have variant-specific content (Emails 1, 2, 4, 6)
- Built the full Miro working environment with flowcharts, email journey map table, asset tracker, Klaviyo flow architecture tech spec, and action plan
- Identified 23 assets needed across the journey (prioritized P0/P1/P2)
- Created the EKUZO Post-Purchase Email Blueprint spreadsheet (4 sheets: Journey Map, Asset Tracker, Flow Architecture, Timing Calendar)
- Built the HTML master email template (00-master-template.html) with EKUZO brand kit: Tungsten + Inter fonts, full color palette (#F92524, #000, #FFF, #F0EDEA, #AE2CF2, #D4FF00), dark mode, mobile responsive, MSO conditionals
- Stripped all Klaviyo variables from the master template so it renders clean in browser preview
- Built the complete Purchase Confirmation email (01-purchase-confirmation.html) with interactive variant toggle showing both LOOKING and BUILDING versions

### Files Created
- `EKUZO Post-Purchase Email Blueprint.xlsx` — master planning spreadsheet
- `EKUZO-Klaviyo-Master-Template.html` — Klaviyo-ready master template (has template variables)
- `email-templates/00-master-template.html` — clean master template for browser preview
- `email-templates/01-purchase-confirmation.html` — Purchase Confirmation email with variant toggle

### Miro Board
- Board: https://miro.com/app/board/uXjVGsMud6Q=/
- Overview Doc, Email Journey Flowchart, Journey Map Table, Asset Tracker, Squad Segmentation Flowchart, Content Variants Doc, Klaviyo Tech Spec, Action Plan — all live

### What's Next (April 15)
- [ ] Preview 01-purchase-confirmation.html in browser, give feedback on layout/copy/spacing
- [ ] Load the Klaviyo master template into Klaviyo and test rendering
- [ ] Begin building the Purchase Confirmation flow in Klaviyo with squad_status conditional split
- [ ] Continue building remaining 15 email templates from the master
- [ ] Coordinate with Jamie on Stripe webhook → Klaviyo profile data pipeline

### Squad Segmentation Reminder
Stripe metadata `squad_status: "building" | "looking"` → syncs to Klaviyo profile property → conditional splits in flows. Jamie owns the technical pipeline. Aaron owns creative + Klaviyo flow setup.

---

## Session: April 14, 2026 (evening)

### What We Did
- Swapped Tungsten → Oswald globally (Google Fonts `<link>` + `@import` in `<style>`)
- Header: EKUZO logo image on left (120px), "EKUZOCAMP" wordmark on right (white + neon-green split)
- Top-to-bottom design pass: bigger order-summary header, red Camp/Camper/Dates labels, larger un-bolded detail values, bigger Total Paid + $249, all red step circles, bigger red Day 1–5 labels, bigger Gaming Matters / FAQ / Need Help headlines, Squad Roster header matched to 3 Steps + Your Week, larger M initial + Marcus name, lighter interior fill on empty roster circles
- New CTA style: Inter bold 16px, 2px radius, `.cta-btn:hover` → black background / white text; `.link-hover-black` on Read FAQ + Contact Us
- Restructured BUILDING variant flow: Hero → Squad Roster → Share Your Squad Link CTA → Hey Sarah → Order Summary → 3 Steps → Set Up Discord → Your Week → Gaming Matters → FAQ → Footer. LOOKING variant untouched.
- Moved the neon-green divider rule to sit directly above "Your Week at a Glance"
- Dropped in branded icons: renamed source files to `social-{platform}-icon-white@2x.png`, generated `ekuzo-caret-black@2x.png` from `camada-caret.svg`, and replaced the CONFIRMED badge checkmark with the caret (20px, black)
- Replaced the footer text social links with 7 icon links: Discord, TikTok, Instagram, Facebook, YouTube, Twitch, LinkedIn (28px each, placeholder URLs wired)
- Hardened the toggle CSS with `!important` on the tr variant rules so BUILDING blocks reliably show/hide
- Built `build-klaviyo.py` → auto-generates clean `…-BUILDING.klaviyo.html` + `…-LOOKING.klaviyo.html` from the single source template (strips preview toggle + opposite-variant blocks)
- Generated `01-purchase-confirmation.SELF-CONTAINED.html` (images inlined as base64, ~70 KB) for AirDrop to phone for mobile QA

### Files Created / Updated
- `email-templates/01-purchase-confirmation.html` — source of truth, toggle intact
- `email-templates/01-purchase-confirmation.SELF-CONTAINED.html` — single-file preview for phone
- `email-templates/build-klaviyo.py` — source → 2 Klaviyo-ready variants
- `email-templates/klaviyo-ready/01-purchase-confirmation-{BUILDING,LOOKING}.klaviyo.html`
- `email-assets/source/` — renamed platform icons + ekuzo-caret-black@2x.png
- `email-assets/export/_shared/` — logo, caret, 7 social icons ready to upload
- `email-assets/uploaded-urls.md` — tracker updated with all current filenames + display sizes

### Open Items
- [ ] Pick replacement headline for "3 STEPS TO GAME DAY"
- [ ] Decide on Step 2 copy for BUILDING now that Share CTA lives under the hero (current copy is a bit redundant)
- [ ] Swap placeholder social URLs (`discord.gg/ekuzo`, etc.) for real handles
- [ ] Upload all assets in `email-assets/export/_shared/` to Klaviyo and paste CDN URLs into `uploaded-urls.md`
- [ ] Run `python3 build-klaviyo.py` after any source edit to regenerate Klaviyo variants
- [ ] Wire Klaviyo template variables (`{{ first_name }}`, `{{ camper_name }}`, `{{ camp_name }}`, `{{ camp_dates }}`, `{{ order_id }}`, `{{ total }}`, `{{ squad_link }}`) into the Klaviyo-ready variants
- [ ] Load into Klaviyo, wire the flow with `squad_status` conditional split, send test to self, verify rendering + links

---

## Session: April 16, 2026

### What We Did
- Renamed order summary label: CAMPER → GAMER
- Replaced the entire Pre-Game Checklist + CTA section with a new **For Parents** feature block: black background, "EKUZO ESPORTS CAMP" Oswald headline, body copy, 4 white cards in a 2×2 grid (stacks on mobile)
- Card content: **Small Squads** (1:5 ratio), **Vetted Coaches** (background-checked, high-ELO), **Safe Servers** (moderated Discord), **Life Skills** (communication, resilience, teamwork)
- Swapped emoji card icons for Klaviyo CDN images (4 new assets uploaded)
- Matched card styling to landing page: 45° clip-path chopped corners (upper-left + bottom-right), no border-radius, MSO conditional fallbacks for Outlook
- Removed the "FOR PARENTS" red pill badge above the headline
- Removed the neon green divider rule above Camp Overview
- Renamed "YOUR WEEK AT A GLANCE" → "CAMP OVERVIEW", bumped header to 34px to match other sections
- Added **"Get a Head Start"** purple callout block above Gaming Matters: neon green Oswald headline, "Download League of Legends" subhead, copy about Riot Games® account setup, white CTA button linking to LoL download page
- Updated Parent FAQ link → `https://ekuzocamps.com/#faq` (anchor to landing page FAQ section)
- Trimmed footer social icons to 4: Instagram, TikTok, Facebook, YouTube (removed Discord, X, Twitch, LinkedIn)
- Restyled footer: body text bumped to `#AAAAAA`/`#888888`, all links (support email, unsub, preferences, privacy) now white `#FFFFFF`
- Removed emoji icons above Parent FAQ and Need Help cards
- Added margin below order summary (padding 0 → 32px) and above Camp Overview (padding 20px → 40px)

### Files Created / Updated
- `email-templates/01-purchase-confirmation.html` — source of truth, all changes above
- `email-templates/01-purchase-confirmation.v1-backup.html` — full backup of pre-session source
- `klaviyo-paste-ready/_v1-backup/` — backup of all 4 previous Klaviyo-ready outputs
- `email-assets/uploaded-urls.md` — added 4 new card icon CDN URLs, removed retired step icons

### Open Items
- [ ] Run full build pipeline: `build-klaviyo.py` → `swap_cdn.py` → `customize_looking.py` → copy to `klaviyo-paste-ready/`
- [ ] Re-paste updated HTML into both Klaviyo email actions (BUILDING + LOOKING)
- [ ] Verify clip-path cards render correctly in Apple Mail, Gmail web, iOS Mail (Outlook degrades to square — acceptable)
- [ ] Card icon images reference local `../email-assets/export/01-purchase-confirmation/icon-*.png` paths for preview — need to save those files locally or rely on CDN swap during build
- [ ] Jamie: fire test payment for end-to-end flow verification
- [ ] Jamie: rename register form options to "Building a team" / "Looking for a team" + update webhook string transform
- [ ] Discord server URL still placeholder (`discord.gg/ekuzo`) — swap when server is live
- [ ] Landing page updates discussed but deferred: "You've been invited to join Gamer's Team" headline, taller hero collage on both camp landing pages

---

## Session: April 17, 2026

### What We Did
Full copy, visual, and infrastructure pass on the Purchase Confirmation template to get both BUILDING and LOOKING ready to paste into Klaviyo.

**Copy**
- Wrapped the greeting body paragraph in variant-specific `<div>`s. Looking body: "{{ gamer_name }} is officially in — welcome to EKUZO Camps! Your spot is locked, your order details are below, and we've included a few things to help you prep. We'll be in touch with more as camp gets closer." Building body updated to match the same copy. Variant split kept in source for future divergence.
- Replaced the "EKUZO ESPORTS CAMP" section headline with "Built Like a Real Sports Program" and a longer subcopy: "We treat esports with the same educational rigor as a traditional sports camp — with the structure, safety, and coaching standards parents expect."
- Removed the stray `<br>` inside "We'll match {{ gamer_name }} with an awesome squad and a dedicated coach before Day 1." that was collapsing into "withan" in some renders.
- Removed "{{ gamer_name }} is locked in for EKUZO Camps." from the Looking hero subcopy so the hero leads cleaner with just "We'll match {{ gamer_name }} with an awesome squad and a dedicated coach before Day 1."

**Hero variant split + differentiated gradients**
- Hero was previously a single `<tr>` with inline `.looking-content` / `.building-content` divs toggling subheadlines on top of one shared purple gradient. Split it into two variant-specific `<tr class="looking-content">` / `<tr class="building-content">` rows, each with its own gradient:
  - LOOKING: chartreuse/neon-green radial glow (`#A0CC00 → #667F00 → #2a3400 → #000000`) pairing with the existing `#D4FF00` subhead.
  - BUILDING: original purple radial glow (`#4A1480 → #2E0870 → #1a0030 → #000000`) pairing with the existing `#AE2CF2` subhead + CTA.
- Flattened the nested `<table>/<tr>/<td>` that used to live inside the hero `<td>`. The outer `<td>` now carries the gradient directly. This was necessary because `build-klaviyo.py`'s regex for stripping variant `<tr>` blocks is non-greedy against `</tr>` — any nested `<tr>` inside a variant row would make the regex stop too early and orphan `</table></td></tr>` into the output (root cause of "Build template is messed up in Klaviyo"). The build docstring already warned: "Nested variant blocks of the same type are not supported. Keep it flat."
- As part of that flattening, swapped the Building CTA from `<td class="cta-btn-purple">` (inside a nested `<table>`) to `<div class="cta-btn-purple" style="display: inline-block;">`. The existing `.cta-btn-purple` hover CSS still applies; the div is centered by the parent `<td>`'s `text-align: center`. Trade-off: Outlook (Word engine) may render the button with slightly off spacing — flagged for QA. If Outlook is a hard requirement, restoring the `<table>` pattern will require teaching `build-klaviyo.py` to handle nested `<tr>` inside variant rows.

**Icons (Parent FAQ + Need Help)**
- Re-added icons above both card headlines after the April 16 removal. 56×56, centered, with 12px margin below. Sized to match the For Parents card icons for consistency across both card groups.
- Parent FAQ → Klaviyo CDN `1dd4d7b7-2f9e-4024-ac3b-49e91df0c7b5.png` (scroll/faq icon).
- Need Help → Klaviyo CDN `b9af460d-260a-45d3-8da6-fcc6d5282e82.png` (question-mark-burst icon).
- First URL paste was a copy/paste error (same URL for both); Aaron re-grabbed the FAQ URL.

**For Parents card icons — now render locally**
- Source had `<img src="../email-assets/export/01-purchase-confirmation/icon-*.png">` but the folder on disk is `email-assets/export/01-confirmation/` (name mismatch) AND it's empty. The PNGs were never saved locally — they went straight to Klaviyo's CDN.
- Swapped all 4 references in source to their CDN URLs (pulled from `email-assets/uploaded-urls.md`). Local preview and Klaviyo output now both render. No build-pipeline changes needed.
- Also bumped all 4 For Parents icons from 36×36 to 56×56 to match the new FAQ/Help icon size.

**45° chopped-corner clip-path applied to four more blocks**
- Get a Head Start (purple), Gaming Matters (black), Parent FAQ (#F0EDEA), Need Help (#F0EDEA) now all use the same `clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)` as the For Parents feature cards, with matching `-webkit-clip-path` and MSO `<!--[if mso]>` conditional fallbacks to square corners for Outlook.
- Pattern: move the background color + padding off the outer `<table>` and onto a new inner `<div>` that carries the clip-path, with the inner `<table>/<tr>/<td>` handling content layout. The outer MSO conditional wraps a simple `<table><tr><td>` with background-color so Outlook still gets the colored rectangle.

**Fixed-height For Parents cards**
- All 4 cards locked to 180px via `height="180" valign="top" style="padding: 24px 16px; height: 180px;"` on the innermost content `<td>` (applied to both the live and the MSO conditional versions). Tried 240px first, dialed down to 180px per Aaron. If the longest body ("Strict 1:5 coach-to-student ratio guarantees personalized VOD reviews and real attention every session." — ~110 chars) overflows at 180 on some clients, bump to 200.

**Logo + footer social icons + order summary check-mark — swapped to CDN URLs**
- Same problem as the card icons but for assets living in `email-assets/export/_shared/`. Klaviyo doesn't have that folder. Swapped 6 `../email-assets/export/_shared/*.png` references to their CDN URLs from `uploaded-urls.md`:
  - `ekuzo-logo-white@2x.png`
  - `check-mark-black@2x.png` (the CONFIRMED badge check icon)
  - `social-instagram-icon-white@2x.png`
  - `social-tiktok-icon-white@2x.png`
  - `social-facebook-icon-white@2x.png`
  - `social-youtube-icon-white@2x.png`
- Verified `grep '\.\./email-assets/'` returns nothing — source is fully CDN-backed now.

**Download League button hover state**
- The button had `class="cta-btn-purple"` with a white background, but `.cta-btn-purple:hover` inverts to white (no-op on a button that's already white). Swapped to `class="cta-btn"` — existing CSS does "white bg → black bg, purple text → white text" with 150ms ease, which is the right invert for a white button on a purple card.

**Mobile spacing pass**
- Desktop uses asymmetric padding on each column cell to create the gutter between cards (`padding: 0 6px 12px 0;` on left, `padding: 0 0 12px 6px;` on right). On mobile the cards stack via the `.stack-column` class, but that asymmetric padding was leaking through and pushing cards inward by 6/8px on alternate sides, plus leaving row-2 cards with no bottom gap.
- Fixed by extending the `.stack-column` mobile rule to also reset horizontal padding and add a uniform 24px bottom gap: `padding: 0 0 24px 0 !important;`. Now all 4 For Parents cards and both FAQ/Help cards stack with identical 24px vertical rhythm and flush horizontal alignment on mobile.
- Tried a `.stack-column:last-child { padding-bottom: 0 }` rule to kill the trailing gap on the final stacked card, then reverted — `:last-child` in HTML table rows targets the last `<td>` of each `<tr>` (Vetted Coaches, Life Skills, Need Help), which would have zeroed gaps inside the For Parents stack. Left the 24px trailing gap in place; it reads fine because the outer section padding is ~40px and the visual hierarchy (24px within a group, 32–40px between sections) is a readable "tight inside / loose between" rhythm.

**Squad link (web side, not template)**
- Confirmed the CTA `href="{{ squad_link }}"` in the Building hero renders the direct registration URL. The webhook (`app/api/webhooks/stripe/route.ts` line 172 on EKUZO-Web) writes `https://ekuzo.gg/programs/ekuzo-camps/register?squad=${meta.squad_token}` into the Klaviyo profile property — no template edit needed. The intermediary `/squad/[token]` landing page is bypassed.

### Files Updated
- `email-templates/01-purchase-confirmation.html` — source of truth, all edits above.
- `email-templates/klaviyo-ready/01-purchase-confirmation-{BUILDING,LOOKING}.klaviyo.html` — regenerated via `build-klaviyo.py` after every edit.

### Open Items
- [ ] Paste both `klaviyo-ready/01-purchase-confirmation-{BUILDING,LOOKING}.klaviyo.html` files into the Klaviyo email actions and send preview to self.
- [ ] Outlook render QA for the Building CTA `<div>` — if spacing looks off, restore `<table>` pattern + fix `build-klaviyo.py` to handle nested `<tr>` inside variant rows.
- [ ] Verify 180px fixed-card-height doesn't truncate the longest Small Squads body on narrow desktop columns. If it does, bump to 200.
- [ ] From April 16: Discord server URL placeholder still in footer. Swap when live.
- [ ] From April 16: Landing page updates (team-invite headline, taller hero collage).
- [ ] From April 16: Jamie to rename register form options to "Building a team" / "Looking for a team" + update webhook string transform so Klaviyo filter values match the UI copy.

---
