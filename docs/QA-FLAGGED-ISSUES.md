# QA Flagged Issues — March 26, 2026

Items that couldn't be resolved to pixel-perfect during this QA pass. Review these with a running dev server before launch.

---

## 1. Sticky Mobile CTA Bar
**Scope:** Mobile
**Priority:** High
The Framer site shows a fixed bottom bar with "Enroll my gamer" and "Start a conversation" buttons that persists across all pages while scrolling. CLAUDE.md notes this as a known deferred issue ("had issues in Framer that carried over. Revisit behavior."). Not implemented in this pass — needs a design decision on whether to replicate Framer's behavior or redesign for Next.js.

## 2. Torn Paper Divider Variant Selection & Overlap Tuning
**Scope:** Universal
**Priority:** Medium
The torn paper dividers use PNG/SVG assets with negative margins to overlap sections. Framer uses specific variants at each section transition (white-1 vs white-2, black-1 vs black-2 vs black-3, red-1). The current implementation is structurally correct, but the exact variant choice, overlap size (negative margin), and z-index layering at each transition needs visual verification in a running browser against the Framer reference. Pay special attention to:
- Red hero → grey section (home, programs)
- Black section → white section (how it works → testimonials)
- Grey section → black section (growth → ecosystem)

## 3. Programs Hero Rive Animation
**Scope:** Desktop
**Priority:** Low (cosmetic)
The Framer Programs page hero uses an embedded Rive animation file (`D693XtxMBjnOWB0t8DkBPKck.riv`) that animates the "STRUCTURED LIKE SPORTS" text with interactive brush strokes. Our Next.js build uses a static heading + background image instead. This is by design but means the Programs hero lacks the animated interactivity of the Framer version. Consider embedding the Rive file directly if the animation is important to the brand experience.

## 4. Testimonials Carousel Arrow Styling
**Scope:** Universal
**Priority:** Low
The Framer testimonials section shows left/right navigation arrows (black circles with white chevrons) centered below the video carousel. The implementation exists in `TestimonialsCarousel.tsx` but exact arrow size, spacing, and hover state needs visual verification against Framer. The dot indicators below may also need positioning adjustments.

## 5. Blog Content Gaps
**Scope:** Desktop
**Priority:** Low (content)
Only 2 blog posts exist as static pages. The blog index page and filtering UI are built but only show these 2 posts. The grid layout will look sparse until more content is added. The filter sidebar categories may also need updating once more posts are created.

## 6. Ecosystem Animation scrollPx Tuning
**Scope:** Desktop
**Priority:** Medium
CLAUDE.md notes that different pages need different `scrollPx` values for the Rive ecosystem animation (home uses 14000, some pages may need different values). The current values are set but may need tuning once viewed in a running browser to ensure the animation progress feels natural relative to scroll distance on each page.

## 7. Font Placeholders
**Scope:** Universal
**Priority:** Medium (brand)
Tungsten Narrow (display font) is using Bebas Neue as a placeholder. Test Die Grotesk (body font) is using Inter as a placeholder. Both are close but not exact matches. Swap in licensed .woff2 files when available from typography.com. The `clamp()` values may need minor adjustments after the font swap since Tungsten Narrow and Bebas Neue have different metrics.

## 8. Social Icons in Footer
**Scope:** Universal
**Priority:** Low
Footer social links use inline SVG icons that were manually recreated. Verify these match the Framer originals for Instagram, Facebook, YouTube, Discord, X (Twitter), and TikTok. The icon sizes and hover states should also be checked.

## 9. Dev Server Environment Issue
**Scope:** Development
**Priority:** Blocking for visual QA
The Next.js dev server couldn't start in this environment due to missing SWC binaries for arm64 architecture. All fixes in this pass were made via code review against the live Framer site and Figma. A full visual regression check on a running local dev server is strongly recommended before deploying any of these changes.

---

# QA Flagged Issues — April 15, 2026 (squad_link feature)

Surfaced during the 7-scenario QA verification of squad_link on dev
(see WORKLOG.md April 15 entry for context). All items below are
non-blocking — the squad_link data pipeline is verified correct across
Stripe metadata, ekuzo-purchases sheet, squads/squad_members tabs, and
Klaviyo profile properties. These are UX polish and one pre-existing
form validation bug that surfaced because squad_link QA stress-tested
multi-gamer registrations.

Aaron: items 10 and 11 are in your lane (register page). Item 12 is
also register-page work and is the highest priority of the three
because it's a data-quality bug (not just UX polish). Item 13 is for
your flow work in Klaviyo.

## 10. Squad status selector stays visible + defaults to "Building" when joining
**Scope:** Camps register page (`app/programs/ekuzo-camps/register/page.tsx`)
**Priority:** Medium (product correctness)

When a visitor arrives with `?squad=TOKEN` in the URL (i.e. they clicked
a friend's crew link), the "Building a squad / Looking for a squad"
selector is still visible and defaults to **Building**. If the parent
doesn't notice and leaves it on Building, they submit as both a joining
member of the original crew AND an accidental new crew owner with their
own squad_token generated.

Observed during QA Scenario 2: `jamiefosu+151@gmail.com` registered via
the crew link `kzPDaElWFY`, kept the default Building selection, and
ended up with BOTH `squad_token = XTruMxZhLb` (new, unintended) AND
`joining_squad_token = kzPDaElWFY` (expected). Profile in Klaviyo
shows `squad_status: "Building a squad"` and a fresh `squad_link` they
didn't ask for.

**Fix:** when `joining_squad_token` is present in component state (set
from the `?squad=TOKEN` query param on mount), hide the squad_status
selector entirely and treat the submission as a pure join — don't
generate a new squad_token, leave squadStatus blank or set it to a
neutral value (e.g. "joining") that the webhook ignores. Optional UX
improvement: replace the selector with a read-only "You're joining
{owner_gamer_name}'s crew" indicator that reinforces the banner.

The data model already supports the pure-join case (see `squad_token:
"" // blank for non-Building` in the webhook); this is purely a UI
gating issue.

## 11. Added gamers don't inherit the crew's week/slot
**Scope:** Camps register page (`app/programs/ekuzo-camps/register/page.tsx`)
**Priority:** Low (UX polish)

When registering via `?squad=TOKEN`, only gamer 1 gets the crew's
week/slot pre-selected. Gamers 2 and 3 start blank — the parent has to
choose manually, and might accidentally (or deliberately) pick different
weeks. Product intent of "joining a crew" is that the whole family
wants the same camp session.

Observed during QA Scenario 3 (multi-gamer): a 3-gamer registration
through `kzPDaElWFY` ended up with daniel tiger at Week 02 AM
(pre-selected), rob mahoney at Week 03 PM (manually chosen), and John
Doe at Week 03 PM (manually chosen). All three still carry
`joining_squad_token = kzPDaElWFY`, so they appear in `squad_members`
with different `member_week`/`member_slot` values — data is internally
consistent but semantically weird: "members of Testy's crew, but at a
different camp week."

**Fix:** when `joining_squad_token` is set, apply the crew's week and
slot as the default for every added gamer (not just gamer 1). Still
allow individual override (the confirm dialog from Scenario 4 already
handles this correctly for gamer 1 — extend to gamers 2+). Ideally
combine this diff with the fix for #10 since both are register-page
squad-join UX work.

## 12. Birthday field not enforced as required on added gamers (PRE-EXISTING BUG)
**Scope:** Camps register page (`app/programs/ekuzo-camps/register/page.tsx`)
**Priority:** High (data quality — primary coach-matching field)

The Birthday field shows `*` required in the UI for every gamer, but
during QA Scenario 3's 3-gamer test, rob mahoney (gamer 2 of 3)
submitted with blank birthday in both Stripe metadata and the
ekuzo-purchases sheet. All other fields on that gamer (first/last name,
gamer tag, gender, gaming experience, tshirt size, preferred games,
week, slot) populated correctly. This strongly suggests the client-side
required-field validation runs only against gamers[0], not the full
gamers array.

**Why this matters:** birthday is the primary age/coach-matching
criterion for camps (10–18 age range). A gamer landing in ops without
a birthday forces manual outreach to the parent and blocks automated
coach assignment. Worth a focused audit of ALL required-field
validation across the full gamers array, not just birthday — the same
bug likely affects every starred field on added gamers.

**Fix:** audit `validateForm()` / submit handler to iterate the full
gamers array, not assume gamers[0]. Preserve the existing confirm
dialog for week/slot changes on gamer 0 (that works correctly).

Note: this bug pre-dates squad_link — it was surfaced by squad_link QA
because we stress-tested multi-gamer flows that weren't exercised as
heavily before. Not introduced by the April 15 squad_link commit.

## 13. Klaviyo welcome email not firing (separate from squad_link)
**Scope:** Klaviyo automation
**Priority:** Medium (pre-launch blocker)

No confirmation email arrived for any of the 4 test registrations during
squad_link QA. This is expected — per the March 30 setup notes, the
welcome automation (`aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`) is still
in **draft** status. The profile properties (including `squad_link` and
all the camp fields) are landing correctly in Klaviyo, so when Aaron's
template is finalized and the flow is published, the data will be
ready.

**Action for Aaron:** finalize the confirmation email template with
merge tags for `squad_link`, `gamer_name`, `camp_week`, `camp_slot`,
`camp_week_dates`, `registration_summary`, `order_id`. Publish the
welcome automation. Re-run a test payment on dev to confirm end-to-end
delivery.

Not a squad_link bug. Logged here so it's not forgotten in the pre-
launch checklist.

---

## 14. Rive ecosystem animation: retire it site-wide
**Scope:** Universal
**Priority:** Medium
**Logged:** 2026-08-04 (homepage story rebuild session)

The scroll-driven Rive ecosystem animation (`components/sections/EcosystemAnimation.tsx`)
is being removed from the homepage in this session and replaced with static
sections. **The goal is to kill it everywhere.** It was not removed from the
other pages in this session, so it stays live on five routes:

| Route | File | Line |
|---|---|---|
| `/parents` | `app/parents/page.tsx` | 278 |
| `/programs` | `app/programs/page.tsx` | 133 |
| `/programs/ekuzo100` | `app/programs/ekuzo100/page.tsx` | 235 |
| `/programs/ekuzo-teams` | `app/programs/ekuzo-teams/page.tsx` | 396 |
| `/schools` | `app/schools/page.tsx` | 177 |

Why it goes: the section is a 360vh sticky-scroll block that has never been
reliably calibrated (see WORKLOG entries on the scroll-math rewrites, the
git-LFS pointer breakage, and the uncalibrated `PROGRESS_MAX`), and it costs
roughly 8.4 MB of initial payload per page (`ecosystem-desktop.riv` 6.6 MB /
`ecosystem-mobile.riv` 6.1 MB, plus `public/rive.wasm` 1.8 MB, plus about
80 KB gzipped of Rive JS). Removing it from the homepage alone cut that
page's initial payload by roughly 73%.

**Do not delete any asset until all five routes above are converted.**
Still required while any consumer remains:
- `components/sections/EcosystemAnimation.tsx`
- `public/animations/ecosystem-desktop.riv`, `ecosystem-mobile.riv`
- `lib/riveRuntime.ts` (also used by `components/sections/ProgramsHeroRive.tsx`)
- `public/rive.wasm` (sole reference is `lib/riveRuntime.ts`)

Note that `lib/riveRuntime.ts` and `public/rive.wasm` survive even after all
five Ecosystem consumers are gone, because `ProgramsHeroRive` (used by
`app/programs/page.tsx:104`, asset `public/animations/programs-hero.riv`)
still needs them. Retiring the WASM runtime entirely is a separate decision
about the Programs hero.

Each of the five routes needs a replacement section, not just a deletion, or
the page loses a band and its torn-paper seam rhythm breaks. See
`app/page.tsx` after this session for the pattern used on the homepage.
