# Brief: blog newsletter capture (A/B) + inquiry-form attribution

Run of the Build Loop (knowledge-base/company/agents/agent-loop/build-loop.md). Lead: Fable (Claude, this session). Approved by Jamie 2026-09-15 evening ("everything looks good. it can be a 5th deliverable. feel free to begin").

## Mission
On /blog/* only, replace the enroll sticky bar with a newsletter bar and make the first-visit popup fire on read depth with a 50/50 A/B between the "thumbs" copy and the "classic" copy, so blog readers convert to the weekly and the two variants can be measured in Beehiiv. Add a "How did you hear about us?" field to the inquiry form so the X follow lane is attributable.

## Locked decisions
- Thumbs is the preferred variant and is the welcome email regardless of which popup copy wins.
- 50/50 assignment on first view, stored per browser (localStorage), re-asked after 30 days (not forever).
- Popup triggers at 50% scroll depth on blog post pages, never on entry. Blog index (/blog) keeps the existing behavior? No: /blog index gets no popup (it is a list page); posts only.
- Variant and placement travel to Beehiiv as utm_source=blog, utm_medium=popup|sticky, utm_campaign=thumbs|classic on the create-subscription call. No new Beehiiv custom fields (ekuzo-web CLAUDE.md rule).
- Non-blog routes: zero behavior change.
- Reference relationships (build-loop rule): StickyCTA blog variant = ADAPT from the existing camps variant of StickyCTA (deltas allowed: copy, an email input + submit replacing the buttons, posts to /api/newsletter; must match: bar position, show/hide thresholds, footer-visible hide, height/padding, font classes). NewsletterPopup blog behavior = ADAPT from the existing NewsletterPopup (deltas allowed: trigger, cadence key, two copy variants, source tags; must match: layout, portal, close behavior, success state, styling). ContactModal field = ADAPT from the existing fields in ContactModal (same input styling; one new optional select or text input).

## Deliverables
D1. StickyCTA: /blog/* override, newsletter bar, posts to /api/newsletter with utm fields (medium=sticky, campaign=assigned variant).
D2. NewsletterPopup: on /blog/[slug] pages, 50% scroll trigger, 30-day re-ask, A/B variant assignment + storage, variant copy, utm fields (medium=popup, campaign=variant). Unchanged on all other routes.
D3. /api/newsletter: accept optional utm_source/utm_medium/utm_campaign (validated allowlist) and pass them to Beehiiv create-subscription. Existing callers (footer form, homepage popup) unchanged.
D4. Beehiiv welcome email draft ("one email, thumbs up / thumbs down") as docs/blog-newsletter/welcome-email-thumbs.md, plus the human-action item to create the automation in Beehiiv (trigger: subscription created with utm_source=blog; or a segment). Not code.
D5. ContactModal + /api/contact: optional "How did you hear about us?" field (select: X / Instagram / Google search / a friend or parent / school / other), included in the contact email/payload. Existing required fields and routing unchanged.

## Copy (Story owns; these are the approved starting points, lint them)
Thumbs popup: H "One email after you read this. Then you decide." Body "Leave your address and tomorrow you'll get one message with a thumbs up and a thumbs down. Thumbs down and you're off the list, no questions. Thumbs up and you get the weekly: what we're seeing in kids' gaming, sources attached." Button "Send me the one email."
Classic popup: H "Free to read. The weekly is free too." Body "One email a week on making gaming count, from the people coaching it. Sources attached, no hype." Button "Join the weekly."
Sticky bar (both variants share, or per-variant; Story decides): "Free to read. One email tomorrow, you decide." [email] "Try it"  /  classic: "Free to read. The weekly is free too." [email] "Join"
Voice: knowledge-base/system/methodology/anti-ai-writing.md (hard rules), voice-dna.md, company/knowledge/ekuzo-messaging-voice.md. Zero em-dashes, no negative parallelism, no engagement bait.

## Protected surfaces (zero-diff; Sentry verifies with before/after screenshots and DOM diffs)
- StickyCTA on /, /programs/ekuzo-camps, /programs/ekuzo101, /programs/ekuzo100, /programs/ekuzo-teams, /schools, /parents.
- NewsletterPopup on / (2.5s first-visit behavior, STORAGE_KEY "ekuzo_newsletter_dismissed").
- FooterNewsletter payload to /api/newsletter.
- Blog post content and schemas (no copy changes to posts in this run).
- Stripe, Klaviyo, Sheets: untouched. Any Beehiiv write during testing uses a disposable identity (newsletter-test+<ts>@ekuzo.gg or similar) and is logged in 06-cleanup-ledger.md.

## Codebase map (pre-verified by Fable from reads on 2026-09-15; Scout re-verifies)
- components/ui/StickyCTA.tsx ("use client"; per-route overrides isCamps/is101/isSchools/isParents; visible after scrollY>300; hides when footer in view or modal open). Mounted in app/layout.tsx.
- components/ui/NewsletterPopup.tsx ("use client"; createPortal; STORAGE_KEY ekuzo_newsletter_dismissed; setTimeout 2500; posts {email, firstName} to /api/newsletter). Mounted in app/layout.tsx.
- components/ui/FooterNewsletter.tsx posts to /api/newsletter.
- app/api/newsletter/route.ts (to read: Beehiiv create-subscription call; docs/beehiiv-config.md § API quirks: tags not accepted on create, automation_ids plural, tag removal impossible).
- components/ui/ContactModal.tsx posts to app/api/contact/route.ts.
- lib/analytics.ts has trackRegisterClick (pattern for a trackNewsletterSignup if useful).
- Blog routes: app/blog/page.tsx (index), app/blog/[slug] and per-slug folders.

## Environment
- Build/QA checkout: this directory (cloud), Next 16.2.1, dev server on :3001, Playwright + Chromium available. No .env.local here: Beehiiv calls from this checkout will fail with no key; Sentry tests the API route with a mocked fetch or asserts the outbound payload shape; the live pre-flight and any live write are done by Fable on Jamie's machine (device shell) where .env.local exists.
- Target repo: /Users/jamiefitch/Projects/ekuzo-web, branch blog/gaming-study-13-7 (commits ce981bd, 26f27cc, 772f385 already on it). Fable syncs changed files and commits.

## Models
Scout, Atlas, Relay, Sentry, Auditor: Sonnet. Story, Parent, Steward: Opus. Fable: lead session.

## Budget triage order (if anything must be cut)
D5 first (form field), then D1 (sticky bar) reduced to classic-only, never D2's A/B integrity or D3's allowlist.
