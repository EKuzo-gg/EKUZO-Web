# Scout map: blog newsletter capture (A/B) + inquiry-form attribution

Re-verification of the brief's "Codebase map" (00-brief.md, lines 36-43), done by reading every file named there plus the files those files import. All line numbers are from the checkout at `/tmp/claude-0/-home-claude/1877c9cb-b201-584c-8d75-1301c7d33b6c/scratchpad/preview` as read on 2026-09-15.

---

## 1. components/ui/StickyCTA.tsx

Full path: `components/ui/StickyCTA.tsx`. "use client" at line 1.

**pathname**: read via `usePathname()` from `next/navigation` at line 16 (`const pathname = usePathname();`), imported line 4.

**Per-route override logic** (lines 20-48):
- `isCheckoutPage` (lines 22-26): `pathname.includes("/register") || pathname.includes("/success") || pathname.startsWith("/swamp") || pathname.startsWith("/woodward")`. Forces the bar hidden entirely (see `show` below), regardless of scroll.
- `isSchools` (line 29): `pathname.startsWith("/schools")`.
- `isParents` (line 30): `pathname.startsWith("/parents")`.
- `isCamps` (line 34): `pathname === "/programs/ekuzo-camps"` (exact match, not `startsWith`).
- `is101` (line 37): `pathname === "/programs/ekuzo101"` (exact match).
- `showEnroll` (line 38): `!isSchools && !isCamps && !is101`.
- `showContact` (line 39): `!isParents && !isCamps && !is101`.
- `programCtx` (line 44): `getProgramRegisterContext(pathname)` from `@/lib/programRoutes` (see below). `directEnrollHref` (lines 45-48): `${programCtx.registerHref}?cta=sticky` when `programCtx` exists and not camps; used only in the default (non-camps/101) branch for ekuzo100/ekuzo-teams program pages so Enroll links straight to that program's register page instead of opening the cross-program modal.

The brief's map (line 37) names only `isCamps/is101/isSchools/isParents` and misses `isCheckoutPage`, `showEnroll`/`showContact`, and the `programCtx`/`directEnrollHref` direct-link logic. This is real behavior a blog variant must not disturb on non-blog routes.

**Visibility state machine** (lines 50-73):
- `visible` state, set by a `scroll` listener (passive) at lines 50-57: `setVisible(window.scrollY > 300)`, called once on mount (`onScroll()` line 54) and on every scroll.
- `footerVisible` state, set by an `IntersectionObserver` on `document.querySelector("footer")` (lines 60-70), threshold 0. **Caveat**: this grabs the *first* `<footer>` element in the DOM. On `/programs/ekuzo-camps` (page.tsx line 1436) and `/programs/ekuzo101` (page.tsx line 896) there is an inner `<footer>` inside a testimonial `<blockquote>` (citation semantics) that appears in the DOM *before* the real site `Footer` component. On those two pages the observer is watching the wrong element and `footerVisible` likely flips true when the testimonials band scrolls into view, not at the real page bottom. Blog post pages only ever render one `<footer>` (from `components/layout/Footer.tsx`), so this bug does not reach blog pages, but it is a real pre-existing defect in the reference (camps) implementation worth flagging since camps is the ADAPT source.
- Final visibility: `const show = visible && !activeModal && !footerVisible && !isCheckoutPage;` (line 73). `activeModal` comes from `useModal()` (ModalContext, see item 9 below).

**Camps variant JSX** (the ADAPT reference, lines 85-108):
```
{isCamps || is101 ? (
  <div className="flex items-center justify-between gap-6 w-full max-w-[1232px] mx-auto px-2">
    <span className="font-display uppercase leading-[0.95] hidden sm:block whitespace-nowrap"
      style={{ fontSize: "clamp(1.5rem, 3.75vw, 3.75em)", color: "#AE2CF2" }}>
      Ready to level up this summer?
    </span>
    <a href={is101 ? "/programs/ekuzo101/register?cta=sticky" : "/programs/ekuzo-camps/register?cta=sticky"}
      onClick={() => trackRegisterClick({ source: "sticky" })}
      className="flex-1 sm:flex-none bg-[#AE2CF2] text-white border-2 border-[#AE2CF2] font-body font-bold text-sm md:text-lg
                 py-3 px-5 md:py-3.5 md:px-8 rounded-sm text-center whitespace-nowrap shrink-0
                 hover:brightness-110 active:scale-[0.98] active:brightness-90 transition-all duration-150">
      Enroll my gamer
    </a>
  </div>
) : ( ...default branch... )}
```
Note the camps/101 branch shares one condition and one JSX block (purple headline + purple button, direct `<a>` link, no modal). A blog variant is a *third* branch alongside this ternary.

**Outer wrapper classes that any variant, including blog, must reuse** (lines 76-84):
```
<div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}>
  <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-black/8 to-transparent pointer-events-none" />
  <div className="flex items-center justify-center gap-2 px-3 py-4 md:gap-4 md:px-4 md:py-5 bg-white">
```
That is: bar position `fixed bottom-0 left-0 right-0`, `z-40`, `transition-transform duration-300`, show/hide via `translate-y-0`/`translate-y-full`; the shadow div; and the inner row `flex items-center justify-center gap-2 px-3 py-4 md:gap-4 md:px-4 md:py-5 bg-white`. Per the brief's "must match" list (bar position, thresholds, footer-visible hide, height/padding, font classes) a blog variant reuses exactly this wrapper and this inner-row class string, only replacing the children.

Font classes used inside: `font-display uppercase` (headline), `font-body font-bold` (button/CTA text). Button shape classes reusable for an email-submit button: `py-3 px-5 md:py-3.5 md:px-8 rounded-sm` (camps size) or `py-3 px-3 md:py-3.5 md:px-5 rounded-sm` (default-branch size, lines 116-119 / 126-129).

**Mounted** in `app/layout.tsx` line 217, inside `<ModalProvider>`, after `<ModalRenderer />` (line 216) and before the conditionally-rendered `<NewsletterPopup />` (lines 223-225). Always rendered (no env gate), unlike NewsletterPopup.

---

## 2. components/ui/NewsletterPopup.tsx

"use client" line 1. `STORAGE_KEY = "ekuzo_newsletter_dismissed"` (line 7), matches brief.

**State** (lines 10-14): `visible` (bool), `email`, `firstName` (form fields), `status: "idle"|"loading"|"success"|"error"`, `errorMsg`.

**Trigger** (lines 16-27): on mount, checks `localStorage.getItem(STORAGE_KEY)` (wrapped in try/catch, falls through to showing on error) and if unset, `setTimeout(() => setVisible(true), 2500)`. This is a flat one-time-ever dismissal, not a re-ask window (no timestamp stored, no expiry logic anywhere in this file). There is no scroll-based trigger here at all today; D2's 50%-scroll-depth trigger is new behavior, not adapted from an existing scroll mechanism in this file.

**dismiss()** (lines 29-36): hides popup, sets `localStorage.setItem(STORAGE_KEY, "1")` in try/catch.

**handleSubmit / fetch payload** (lines 38-66): `POST /api/newsletter`, `Content-Type: application/json`, body `JSON.stringify({ email, firstName })` (line 49). On non-ok response, reads `data.error` from JSON body (falls back to a generic message) and throws. On success: `setStatus("success")`, then after 800ms calls `dismiss()` (lines 58-61, i.e. success auto-closes and marks dismissed). On error: `setStatus("error")`, `setErrorMsg(...)`.

**JSX structure and copy** (lines 70-223): `createPortal` into `document.body` (line 70, mount target line 221). Outer: `fixed inset-0 z-[9999] flex`, `role="dialog" aria-modal="true" aria-label="Newsletter signup"` (lines 72-76). Two-pane layout: left half (`hidden lg:flex`, purple `#7B3AAF` background) shows a kid+characters image, "Join the EKUZO community" eyebrow (line 99), "GAMING / MATTERS." display headline (lines 101-108, MATTERS in `#C8E620`), and a torn-paper mask on the right edge. Right half (form pane, `bg-[#7B3AAF] lg:bg-[#1a1a2e]`) has a close button (top-right, lines 132-140), a mobile-only duplicate heading block (lines 143-157), the EKUZO logo (desktop only, lines 161-167), heading "Stay in the loop." (line 169), body copy "Get stories of transformation, tips, and updates on our events." (line 172), a form with First name + Email inputs (lines 176-191, inputs styled `h-[52px] px-4 rounded-md border border-white/20 bg-white/10 text-white text-[15px] font-body placeholder:text-white/40`), and a submit button (lines 192-206) whose label cycles "Sign up" → "Subscribing..." → "You're in!" (success turns the button white/black). Error text renders in `text-red` below the form (lines 209-213). Footer microcopy: "No spam. Unsubscribe anytime. We respect your inbox." (lines 215-217).

**Mounted in app/layout.tsx**: NOT unconditional. Lines 218-225:
```
{process.env.NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED === "true" && (
  <NewsletterPopup />
)}
```
It is the last thing rendered inside `<ModalProvider>`, after `<ModalRenderer />` (216) and `<StickyCTA />` (217). Per `.env.local.example` line 59 the flag defaults to `false`, and WORKLOG.md (line ~2101) confirms this was a deliberate site-wide disable (component and API route untouched, just unmounted) with the flag unset/false in all Netlify contexts. **In this checkout there is no `.env.local`, so the flag is unset and the homepage popup does not render at all today.** See staleness item 1 below; this is the single biggest gap versus the brief's "Protected surfaces" section.

---

## 3. app/api/newsletter/route.ts

**Request body accepted** (line 6): `{ email, firstName }` only, destructured with no other fields read. Everything else in the JSON body is silently ignored.

**Validation** (lines 8-10): only `!email` is checked (400 "Email is required"). No email-format validation, no length caps, no allowlist logic of any kind exists yet, confirming D3 is genuinely new work.

**Beehiiv API call** (lines 20-38):
- Endpoint: `POST https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`.
- Headers: `Content-Type: application/json`, `Authorization: Bearer ${BEEHIIV_API_KEY}`.
- Body fields sent today: `email`, `utm_source` (hardcoded string `"newsletter-signup"`, not client-supplied), `referring_site` (hardcoded `"https://ekuzo.gg"`), `custom_fields` (array with `first_name` only if `firstName` truthy, else empty array).
- **utm_medium / utm_campaign / send_welcome_email / automation_ids are NOT sent today.** None of the four appear anywhere in this file. D3's "accept optional utm_source/utm_medium/utm_campaign... pass them to Beehiiv" is net-new plumbing, not a passthrough of something already wired.
- Env vars read: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` (names only; both required, 500 "Server configuration error" if either missing, lines 12-18).

**Tagging (separate call, non-blocking)** lines 52-67: after a successful subscription create, if a subscriber id (`beehiivData.data.id`) came back, fires `POST /v2/publications/${id}/subscriptions/${subId}/tags` with body `{ tags: ["source-newsletter"] }`, `.catch()`'d (errors only logged, response never awaited by the caller flow since the outer function returns before this settles — actually it IS awaited implicitly? No: the `fetch(...)` call has `.catch()` chained but the promise itself is not `await`ed, so tagging is genuinely fire-and-forget relative to the HTTP response). Brief's map didn't mention this tagging step at all; a blog variant of the route must decide whether the new utm-tagged submissions still get `source-newsletter` or a different tag (docs/beehiiv-config.md has no tag defined yet for blog-sourced signups).

**Error handling**: Beehiiv non-ok response → 500 `{ error: "Failed to subscribe. Please try again." }` (lines 40-47), logged via `console.error`. Any thrown exception → 500 `{ error: "Internal server error" }` (lines 70-73), also logged.

**Response shape**: success → `NextResponse.json({ success: true })` (line 69, implicit 200). All error paths return `{ error: string }` with a non-200 status (400 or 500).

**Every caller of `/api/newsletter` in the codebase** (ripgrep across the whole tree, excluding `.next` build output and the brief doc itself):
1. `components/ui/FooterNewsletter.tsx` line 33: `fetch("/api/newsletter", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email }) })` — sends `email` only, no `firstName`.
2. `components/ui/NewsletterPopup.tsx` line 46: sends `{ email, firstName }` (see item 2 above).

`app/api/swamp/subscribe/route.ts` line 4 only *mentions* `/api/newsletter` in a comment ("Near-verbatim clone of /api/newsletter and /api/woodward/subscribe") — it does not call the route, it is a separate handler with its own duplicated logic. There is no third real caller.

---

## 4. docs/beehiiv-config.md

Relevant quotes for create-subscription work:

- Platform split (lines 9-30): "Beehiiv owns the general nurture relationship: the newsletter, top-of-funnel capture (homepage popup, footer signup), and audience segmentation via tags... Klaviyo owns product email." And: "New program-specific schedule/detail fields do NOT get added to Beehiiv custom fields... Beehiiv silently drops unknown custom fields anyway." This is also stated in the repo's root `CLAUDE.md` line 21: "New schedule/detail data → Klaviyo events + Sheets, never new Beehiiv custom fields," directly backing the brief's "No new Beehiiv custom fields" locked decision (00-brief.md line 12) and bearing on D5 (the "how did you hear" field should not become a new Beehiiv custom field either).
- Tags quirk (lines 169-178, "API Limitations"): "Beehiiv's public API only supports adding tags, not removing them... `PUT /subscriptions` silently ignores the `tags` field." Practical consequence: "segmentation does the work that tag removal would otherwise do." This matches `CLAUDE.md` line 62: "create-subscription does NOT accept `tags` (use the separate POST tags endpoint); it uses `automation_ids` (plural array); tag removal is impossible via API."
- automation_ids (lines 225-241, "Beehiiv Automation" section): two existing automations, camps (`aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc`, status Draft/unpublished) and EKUZO100 (`aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556`, status wired/live). Both are "Added by API" — i.e. the webhook passes them via `automation_ids` on the Stripe-webhook-to-Beehiiv call, a different route than `/api/newsletter`. Neither the newsletter route nor the contact route currently sends `automation_ids` at all.
- utm fields / welcome automations: the doc's only sample payload with `utm_source` is the Stripe webhook payload (lines 186-212), which sends `"utm_source": "ekuzo-camps-registration"`, `"reactivate_existing": true`, `"send_welcome_email": true`, and `tags` (note: this sample payload includes a top-level `tags` array despite the "tags not accepted on create" rule above — the doc does not reconcile this contradiction; treat the "tags not accepted, use the separate endpoint" statement in the API Limitations section and in CLAUDE.md as the load-bearing rule, since it is explicitly verified against the live API "2026-05-05," and the webhook sample may be aspirational/stale itself). No `send_welcome_email` field or automation-trigger note exists anywhere for the plain `/api/newsletter` route; Newsletter Welcome (automation #4, lines 137-139) is listed as "Trigger: Tag `source-newsletter` applied... Emails: TBD" — i.e. this automation is unbuilt/TBD, not an existing live welcome sequence keyed on the tag the newsletter route already applies.
- Automation ids / list/publication ids referenced in code or docs (names only, no secret values):
  - `docs/beehiiv-config.md` line 4: Publication ID literal `pub_b436ced6-32a1-4bee-b52b-9bf99ddd8287` is printed in the doc as plain text (not a secret placeholder) — flag this if the doc is ever shared externally, though it is not a credential by itself.
  - Automation IDs (also printed as plain literals in the doc): `aut_4db31c63-807e-40fa-9184-f75ff2fcfdcc` (camps welcome, draft) and `aut_3dd66d4e-4dbd-410d-8fd5-e2fdacac8556` (e100 welcome, live).
  - Env var NAMES used for Beehiiv auth in code: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` (both read in `app/api/newsletter/route.ts` and `app/api/contact/route.ts`; doc says the key "stored in `.env.local`").
  - No existing "blog" or "popup"/"sticky" automation id exists anywhere. D4's welcome-email automation will need a brand-new automation id created in Beehiiv manually (this is explicitly called out as a human-action item in the brief, D4).

---

## 5. ContactModal.tsx and app/api/contact/route.ts

**ContactModal.tsx fields** (lines 9-16): `contactMethod: "email"|"text"` (radio, default "email"), `formData: { name, organization, email, phone, message }`.

**Validation**: client-side only via HTML `required` attributes — `name` (line 105 `required`), and conditionally `email` (line 168, required when `contactMethod === "email"`) or `phone` (line 187, required when `contactMethod === "text"`). `organization` and `message` are optional (no `required`). No JS-level validation beyond the native form constraint API; no email-format regex.

**Submit payload** (lines 30-43): `POST /api/contact` with `{ name, organization, contactMethod, ...(contactMethod === "email" ? { email } : { phone }), message, pageUrl: window.location.href }`. Only one of `email`/`phone` is ever sent, keyed by `contactMethod`.

**Where the payload goes** (`app/api/contact/route.ts`):
1. Validation server-side (lines 9-17): requires `name` and `contactMethod`; requires `email` if `contactMethod === "email"`, `phone` if `"text"`.
2. Beehiiv (lines 19-69): if `email` is present and Beehiiv env vars are set, `POST` to the same `subscriptions` endpoint as the newsletter route, with `utm_source: "contact-form"` (hardcoded), `referring_site: pageUrl || "https://ekuzo.gg"`, `custom_fields: [{first_name: name.split(" ")[0]||name}, {last_name: name.split(" ").slice(1).join(" ")||""}, ...(phone ? [{phone}] : [])]`. On success, tags the new subscriber `source-contact-form` (lines 50-63). This whole block is wrapped in its own try/catch and is explicitly non-blocking (a Beehiiv failure does not fail the contact submission).
3. Resend email (lines 71-110): if `RESEND_API_KEY` is set, sends an HTML email from `"EKUZO Website <onboarding@resend.dev>"` to hardcoded `"karlin@ekuzo.gg"`, subject `New inquiry from ${name}${organization ? " (" + organization + ")" : ""}`, body includes name, organization (if present), preferred contact method, the email or phone, the message (if present), the `pageUrl`, and a submitted timestamp in `America/New_York`. Also non-blocking / try-catch'd.
4. Response: `{ success: true }` on completion (line 112) regardless of whether Beehiiv or Resend individually succeeded, since both are best-effort.

Not written to Sheets and not sent to Klaviyo at all — contact form only ever touches Beehiiv (best-effort lead capture) and Resend (the actual human notification to Karlin). A new "How did you hear about us" field naturally slots into the Resend email body (and can optionally ride in the same request payload the client already sends `pageUrl` in) without needing a new Beehiiv custom field, consistent with the CLAUDE.md rule quoted in item 4.

**Styling classes for inputs/selects to match** (ContactModal.tsx):
- Label: `font-body font-medium text-black text-sm` (e.g. line 96-98), required-marker suffix `<span className="text-red">*</span>` (line 99).
- Text/email/tel/textarea input: `font-body text-base text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors` (repeated at lines 108, 127, 171, 190, 211; textarea adds `resize-none`).
- Field wrapper: `flex flex-col gap-2` (e.g. line 94).
- Radio row (for a select's sibling pattern if the new field uses radios instead): `flex items-center gap-2 cursor-pointer font-body text-sm text-black`, radio input `className="accent-red"` (lines 139-150). For an actual `<select>`, reuse the text-input class string above (`border border-black/20 rounded-sm p-3` etc.) since there is no existing `<select>` anywhere in this file to copy from verbatim — none of ContactModal's fields are currently a `<select>`.
- Submit button: `w-full font-body font-bold text-white text-base bg-red py-4 rounded-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer` (lines 217-223).

---

## 6. lib/analytics.ts

All exports (each fires GA4 via internal `ga4()` helper, line 21, and/or Meta Pixel via `fbq()` helper, line 25):
- `trackViewContent({ program })` (lines 33-44) — GA4 `view_item` + Pixel `ViewContent`.
- `trackInitiateCheckout({ program, value?, currency? })` (lines 50-65) — GA4 `begin_checkout` + Pixel `InitiateCheckout`.
- `trackPurchase({ program, value, currency?, transactionId?, eventId? })` (lines 71-98) — GA4 `purchase` + Pixel `Purchase` (with optional CAPI dedupe `eventID`).
- `trackLead({ source? })` (lines 104-113) — GA4 `generate_lead` + Pixel `Lead`. Used by `ContactModal.tsx` line 46: `trackLead({ source: "contact_form" })`, fired only after `setSubmitted(true)` succeeds.
- `trackRegisterClick({ source })` (lines 123-127) — **GA-only by design** (comment lines 118-122 explains why: Pixel ViewContent already covers landing-page intent, a second Pixel event per click would muddy the funnel). Fires GA4 `register_click` with `{ source }`. Used in `StickyCTA.tsx` at lines 99 and 115, both times as `trackRegisterClick({ source: "sticky" })`, and the comment there documents `source` is one of `"hero"|"sticky"|"footer"` across the codebase so GA reports can bucket by CTA placement.
- `trackRegistration({ program })` (lines 133-136) — GA4 `sign_up` + Pixel `CompleteRegistration`.
- `trackAiReferral({ origin, detected_via, referrer_host, landing_path })` (lines 154-166) — GA-only, no Pixel call at all by design (Phase-1 measurement-only).
- `trackSectionView({ section, index })` (lines 176-181) — GA-only, `section_view`.
- `trackVideoPlay({ video, section? })` (lines 187-192) — GA-only, `video_play`.
- `trackCtaClick({ cta, section, destination })` (lines 200-210) — GA-only, `cta_click`; comment (lines 195-198) explicitly says register CTAs should keep using `trackRegisterClick` instead so the `register_click` report stays a clean enrollment-intent measure.

**Pattern for `trackNewsletterSignup`**: follow the GA-only helpers' shape (`trackRegisterClick` is the closest analog: one clearly-named function, one GA4 event, a documented rationale comment for why Pixel is or isn't included, and a `source`-style param so placement is filterable in reports). Given `source-newsletter`/`source-contact-form` are already Beehiiv-side tag concepts, a `trackNewsletterSignup({ source, variant })` (source = "sticky"|"popup", variant = "thumbs"|"classic") would mirror `trackRegisterClick`'s single-string-param convention and slot in right after it in the file.

---

## 7. Blog routing

`app/blog/page.tsx` is the index (server component, no "use client"; canonical `/blog`, lines 8-9). It hardcodes a `posts` array (starting line 15) of `{ slug, title, date, author, category, excerpt, image, featured }` objects and links to each post via `/blog/${slug}` (uses `Link`/`next/link`, not dynamic routing).

`app/blog/[slug]/page.tsx` is a **dead-end catch-all**: its own doc-comment (lines 1-17) says posts are static, each with its own `page.tsx` file at `app/blog/<slug>/page.tsx`, and this `[slug]` route exists only to `notFound()` (line 26) for any slug that is NOT one of the real static folders. **This directly contradicts the brief's map line 43** ("Blog routes: ...app/blog/[slug] and per-slug folders" implies `[slug]` renders real posts) — see staleness item 2 below.

**Real post slugs present** under `app/blog/` (each is its own folder with its own `page.tsx`, all server components, no "use client" in any of them):
1. `conquering-my-mountain-and-giants-how-esports-changed-my-life`
2. `gaming-military-families`
3. `gaming-study-13-7-years-younger-what-it-means-for-kids`
4. `league-of-legends-youth-development`
5. `our-family-s-esports-journey-with-ekuzo-and-the-k1ng`
6. `should-you-ban-fortnite`
7. `summer-camps-for-kids-who-game-2026`
8. `what-homeschool-parents-taught-us-about-gaming`
9. `what-your-kids-gaming-is-telling-you`
10. `when-gaming-helps-homeschool-kids`
11. `when-your-sons-only-friends-are-online`

Also present: three author pages, `app/blog/author/jamie-fitch/page.tsx`, `app/blog/author/karlin-oei/page.tsx`, `app/blog/author/muhammad-hossain/page.tsx` — these are `/blog/author/*`, i.e. under the `/blog` prefix but not posts and not the index. A pathname check for "is this a blog post page" needs to be `pathname.startsWith("/blog/")` **and** exclude `/blog/author/...`, not just `pathname !== "/blog"`. Every real post page renders `Nav` + content + (most, not all: `should-you-ban-fortnite` and `gaming-military-families` skip it) `FooterBanner` + `Footer` (which already contains `FooterNewsletter`, see item 3). None of the post pages read `pathname` themselves (they are server components); the blog-vs-post / popup-eligibility decision has to happen in the client components mounted at the root layout (StickyCTA, NewsletterPopup), using `usePathname()`, exactly as StickyCTA already does for its other route families.

Suggested pathname logic for the blog work, given the above: `isBlogIndex = pathname === "/blog"`; `isBlogPost = pathname.startsWith("/blog/") && !pathname.startsWith("/blog/author/")`. Per the brief (line 11), the sticky bar override is `/blog/*` (both index and posts get the newsletter bar, per D1's wording "On /blog/* only"), while the popup is posts-only (`isBlogPost`, never the index or author pages).

---

## 8. Test tooling present

`package.json` scripts (lines 5-11): `dev` (`next dev`), `build` (`next build`), `start` (`next start`), `lint` (`eslint`), `prepare` (`husky`). **No `test` script exists.**

No test runner is declared as a dependency: `vitest`, `jest`, and `playwright` all appear in neither `dependencies` nor `devDependencies`. `npm ls playwright` shows Playwright 1.63.0 present in `node_modules` and on `$PATH` (`/home/claude/.npm-global/bin/playwright`) but flagged `extraneous` — i.e. it was installed globally/adjacently in this checkout, not declared in this repo's `package.json`. Treat the brief's "Playwright + Chromium available" (00-brief.md line 46) as true for *this cloud checkout specifically*, not as a repo-level guarantee; a fresh `npm install` on Jamie's machine will not pull Playwright unless it is separately available there too.

`eslint.config.mjs`: flat config, extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, with default ignores overridden to `.next/**`, `out/**`, `build/**`, `next-env.d.ts` (so `docs/**` is NOT eslint-ignored via this override, though `tsconfig.json`'s `exclude` does exclude `docs`).

`tsconfig.json`: `strict: true`, `target: ES2017`, `moduleResolution: "bundler"`, `noEmit: true`, path alias `@/*` → `./*`. `exclude` includes `node_modules` and `docs` (so `.ts`/`.tsx` files placed under `docs/` would not typecheck, irrelevant here since deliverables are `.md`/`.tsx` under `app`/`components`).

`husky` is wired via the `prepare` script (line 10), meaning a pre-commit or pre-push hook likely runs lint/build checks on commit; no hook file was inspected here beyond confirming husky is installed, builders should expect `git commit` to trigger it.

---

## 9. Staleness flags versus the brief's "Codebase map"

1. **Biggest gap**: NewsletterPopup is not live on `/` today. `app/layout.tsx` lines 218-225 gate its mount behind `process.env.NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED === "true"`, which defaults to `false` (`.env.local.example` line 59) and is explicitly set `false` in every Netlify context per WORKLOG.md (~line 2127). This checkout has no `.env.local` at all, so the flag is unset here too. The brief's "Protected surfaces" section (00-brief.md line 31) lists "NewsletterPopup on / (2.5s first-visit behavior...)" as something Sentry verifies zero-diff, but there may be nothing rendering on `/` to diff against unless the flag is explicitly forced on for the before/after screenshots. Builders (Atlas) must mount the blog-post popup independently of `NEXT_PUBLIC_NEWSLETTER_POPUP_ENABLED` (that flag is a homepage-rollout switch, unrelated to the blog trigger), and Sentry needs to decide how to screenshot-test a homepage popup that is currently dark by default.
2. `app/blog/[slug]/page.tsx` is dead code (always calls `notFound()`); every real post is its own static folder/page, not a dynamic route. The brief's map (line 43) phrasing ("app/blog/[slug] and per-slug folders") reads as if `[slug]` serves real posts; it does not. Pathname detection for "is this a blog post" must be `pathname.startsWith("/blog/")` minus `/blog/author/*`, not reliance on a dynamic segment.
3. The brief's map for StickyCTA (line 37) omits `isCheckoutPage` (register/success/swamp/woodward full-hide), the `showEnroll`/`showContact` derived booleans, and the `programCtx`/`directEnrollHref` direct-link behavior for ekuzo100/ekuzo-teams pages. All of this must keep working unchanged on non-blog routes; a blog branch is a third arm of the outer ternary, not a replacement of the existing two.
4. `document.querySelector("footer")` (StickyCTA line 61) matches the *first* `<footer>` in the DOM. `/programs/ekuzo-camps` and `/programs/ekuzo101` each have an earlier, unrelated `<footer>` used for testimonial citation semantics (page.tsx lines 1436 and 896 respectively), which likely makes StickyCTA hide early on those two pages already. Not a blog-work blocker (blog pages have exactly one `<footer>`), but worth a note back to Fable/Jamie since camps is the explicit ADAPT reference and this is a live bug in it.
5. `/api/newsletter` today sends only `email`, a hardcoded `utm_source: "newsletter-signup"`, a hardcoded `referring_site`, and `first_name`-only `custom_fields`. It does not send `utm_medium`, `utm_campaign`, `send_welcome_email`, or `automation_ids` at all, and it fires a separate non-awaited tag call (`source-newsletter`) after the subscription create. The brief correctly flags this file as "to read," but builders should know the tagging call exists and decide what tag (if any) blog-sourced signups get, since docs/beehiiv-config.md defines no tag for utm_source=blog today.
6. `docs/beehiiv-config.md`'s own sample Stripe-webhook payload (lines 186-212) includes a top-level `tags` array, which contradicts the doc's own "API Limitations" section (create-subscription does not accept `tags`) and `CLAUDE.md` line 62. Treat the Limitations section as authoritative (it states it was verified live 2026-05-05); the webhook sample block may itself be stale/aspirational.
7. Global convention not in the brief: z-index layering across the app is `z-40` (Nav desktop bar, StickyCTA), `z-50` (Nav header on scroll, mobile-nav toggle context), `z-100` (`ContactModal`, `EnrollModal`), `z-200` (blog inline lightbox, `ContinuityOfPlayGraphic.tsx` line 307), `z-[9999]` (mobile nav full-screen menu, `NewsletterPopup`). A blog popup variant should stay at `z-[9999]` to sit above everything including StickyCTA's `z-40`, matching the existing popup.
8. `useModal()` / `ModalContext` (`context/ModalContext.tsx`) is a two-value modal type (`"contact" | "enroll" | null`) with `openModal`, `closeModal`, `activeModal`. It is not mentioned in the brief at all but StickyCTA's visibility depends on `activeModal` (line 73) and `ModalRenderer` only knows about `"contact"`/`"enroll"` (lines 8-9 of `ModalRenderer.tsx`). The newsletter popup does NOT go through this context (it manages its own `visible` state and portals directly), so a blog popup variant should follow NewsletterPopup's existing self-contained pattern rather than registering a new modal type, unless builders specifically want StickyCTA to also hide when the blog popup is open (currently it would not, since blog popup visibility is invisible to `ModalContext`).
9. Test tooling: no `test` script and no test runner declared in `package.json`; Playwright is present but `extraneous` in this checkout only. Confirm Playwright is actually available on Jamie's machine before Sentry's plan assumes it there.
