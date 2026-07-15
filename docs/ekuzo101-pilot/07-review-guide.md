# EKUZO 101: Summer Pilot — Review Guide

**For:** Jamie Fitch  
**Author:** Fable  
**Date:** 2026-07-15  
**Branch:** feat/ekuzo101-pilot

---

## 1. 60-Second Summary

**What shipped:** A complete, no-payment registration flow for EKUZO 101 Summer Pilot — landing page, week picker, register form, success page, and all three fulfillment legs (Beehiiv, Klaviyo, Google Sheets). The product is wired into the existing product registry. A live integration test ran against `jamiefosu+101test-1@gmail.com`.

**What state it's in:** Feature-complete. `tsc --noEmit` passes. `next build` passes. Three open defects from Sentry QA (see section 2 and defect log). Not merged to dev. Not deployed. Klaviyo flow not activated. No routes indexed.

**Done:**
- Landing page, register page, success page (all noindex)
- WeekPicker (6-tile, ET-aware cutoff, min-4 guard)
- `/api/ekuzo101/register` (Beehiiv + Klaviyo + Sheets, best-effort, no Stripe)
- `/api/ekuzo101/lead` (email-blur lead capture)
- Product config + type changes (non-breaking to camps/e100/teams)
- Live integration test with real services

**Not done (deferred to human):**
- D-001: Stripe webhook guard change is uncommitted (working tree only) — needs a commit
- D-002: `weeks_label` field missing from Beehiiv subscriber — needs a code fix
- D-003: Em-dash in page title tag — needs a one-character fix
- Klaviyo flow setup (see `docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md`)
- `weeks_label` custom field creation in Beehiiv dashboard (manual step)
- Test subscriber cleanup (Beehiiv + Klaviyo dashboard)

---

## 2. Decisions Made — Most-Overrulable First

### Open Flags for Jamie (verbatim from 03-decision-log.md)

1. **Route slug** normalized to hyphenless `/programs/ekuzo101` for sibling consistency with `ekuzo100` (scoping approval said "ekuzo-101"; normalization okayed but flagged). One-line change in `next.config.mjs` if Jamie prefers the hyphenated form.

2. **New Klaviyo metric "Registered Pilot"** vs $0 "Placed Order" — rationale: $0 orders would pollute revenue/conversion attribution on campaigns filtered by "Placed Order" value. "Registered Pilot" is a distinct metric that Jamie can filter separately. Overrule = change metric name in the register route (one-line change, no flow impact until Jamie activates).

3. **Beehiiv: no automation enrollment for 101** (Klaviyo owns product email; Beehiiv nurture via new tags `ekuzo101-pilot-registered` + `source-ekuzo101-pilot`). Confirm against Karlin's nurture plan — if Beehiiv should run an automation, add the `automation_ids` to the product config and create the automation in Beehiiv.

4. **Duplicate-submission handling**: client-side single-flight guard + per-registration UUID in Sheets + accepted risk (low volume, hand-sold pilot). Server-side idempotency noted as follow-up if 101 goes permanent.

### Autonomous Decisions (Fable)

**D1. `welcomeAutomationId` optionalized in `ProductConfig`**
Change: `welcomeAutomationId?: string` in `types.ts`. Guard in Stripe webhook: `automation_ids: automationId ? [automationId] : []`. Rationale: 101 requires no Beehiiv automation; passing `[""]` would be a malformed API call. This is the minimum-footprint change per brief.

**D2. Success page data via sessionStorage**
The register route returns JSON with `parentName`, `parentEmail`, `gamers`, `weeksLabel`, `weekDetails`. The register page stores this in `sessionStorage["ekuzo101-success"]` and redirects to `/success`. Rationale: no PI to query; URL params would require encoding a large object; sessionStorage cleared on tab close (appropriate for a one-time page).

**D3. `weeks_label` field in Beehiiv custom fields**
The human-readable weeks string is stored as a Beehiiv custom field. This requires the `weeks_label` field to be created in Beehiiv's publication settings before production launch (manual dashboard step — in pre-launch checklist below). Note: this field is currently missing from the live test subscriber (defect D-002).

**D4. Week `week_dates` field in Sheets = "Tue [date] - Thu [lastdate]"**
Mirrors e100's cohort_start/cohort_end convention in the `week_dates` column.

**D5. Weeks serialization**
`weeks` array = ISO Tuesday dates. `weeks_label` = human string for display. Family-level (all gamers share the same weeks).

**D6. Landing page is noindex (not just register/success)**
Pilot is invite-only via Karlin; not appropriate for Google results. Lift noindex when 101 goes permanent.

**D7. `lib/analytics.ts` completion event**
`trackRegistration({ program })` wraps Meta pixel `CompleteRegistration` (value 0, currency USD) + GA4 `sign_up`. Called on success page mount.

**D8. Per-registration UUID in `additional_info` column**
UUID appended as "reg_id:[uuid]" to the existing `additional_info` Sheets column — no new column required.

**D9. Weeks stored in `week` column (overloaded)**
The `week` column carries `weeks_label` for 101, consistent with how e100 carries `cohort_label` there.

---

## 3. Guided Walkthrough

### Start the dev server

```
git checkout feat/ekuzo101-pilot
npm run dev
```

Server starts at `http://localhost:3001` (or 3000 if nothing else is running).

### a. Landing page — `http://localhost:3001/programs/ekuzo101`

You should see: hero with headline and screentime joke, How It Works section (Tue/Thu 7-8:30 PM ET, pick your weeks, free upfront), coach cards for Karlin and Sebastien, testimonials carousel, FAQ accordion, CTA strip. No payment references anywhere.

Check: page source contains `noindex`. No `application/ld+json` script tags.

### b. Register page — click any CTA or go to `http://localhost:3001/programs/ekuzo101/register`

You should see: parent info form (first name, last name, email, phone), a WeekPicker showing exactly 6 tiles, gamer info section (name, gamer tag, skill level, etc.), and a Submit button.

No Stripe Elements, no PaymentStep, no credit card field.

### c. Week picker behavior

- Tiles show "Week of [date]" label + "Tue, [date]" and "Thu, [date]" below
- Click a tile to select (red background + white text)
- Counter shows "X of 4 minimum selected" until you hit 4, then "X weeks selected"
- With 3 selected: Submit button is disabled
- With 4 selected: Submit button becomes active

### d. Fill and submit

Fill parent info + gamer name. Select 4 or more weeks. Submit.

Expected: a POST goes to `/api/ekuzo101/register`. The dev-server console should log:
```
[Ekuzo101] Beehiiv subscribe: ...
[Ekuzo101] Beehiiv tag: ...
[Ekuzo101] Klaviyo profile: ...
[Ekuzo101] Klaviyo list: ...
[Ekuzo101] Klaviyo event: ...
[Ekuzo101] Sheets: ...
```

Then the page redirects to `/programs/ekuzo101/success`.

### e. Success page — `http://localhost:3001/programs/ekuzo101/success`

You should see: "YOU'RE IN!" headline, selected weeks listed (each showing Tue + Thu dates, time "7:00-8:30 PM ET"), what-happens-next steps, and the pay-at-the-end promise paragraph.

No "Total Paid", no payment confirmation, no Stripe references.

If you navigate directly to `/success` without going through register, you should see a generic fallback message ("Your registration is confirmed.").

### f. Dev-server console

Watch for Beehiiv/Klaviyo/Sheets log lines after submit. Any fulfillment step failure logs an error but does not surface to the user (best-effort design). A 200 response with `{ ok: true }` means registration data was valid.

---

## 4. Deferred to Human QA

- **Rapid select/deselect tile feel on mobile** — WeekPicker uses CSS transitions; verify touch response feels snappy on a real device, not just browser DevTools mobile emulation.
- **Session expiry / stale sessionStorage behavior** — if a user bookmarks the success URL and returns days later, sessionStorage is empty; they see the generic fallback. Confirm this fallback is acceptable or add a "register again" prompt.
- **Real-device mobile form feel** — multi-gamer form, week picker, and submit flow on iOS Safari and Android Chrome.
- **Actual email delivery after Klaviyo setup** — the "Registered Pilot" Klaviyo flow does not exist yet. Until Jamie follows `ekuzo101-klaviyo-setup.md`, no confirmation email is sent. The Klaviyo event fires correctly (confirmed in evidence ledger) but there is no flow listening to it.

---

## 5. Pre-Launch Checklist

- [ ] Review this guide's decisions (section 2) and overrule any you disagree with
- [ ] Fix D-003: change em-dash to hyphen in `app/programs/ekuzo101/page.tsx` line 16 title tag
- [ ] Fix D-002: add `weeks_label` to Beehiiv `custom_fields` array in `app/api/ekuzo101/register/route.ts`
- [ ] Commit D-001 fix: stage and commit the `app/api/webhooks/stripe/route.ts` guard change on this branch
- [ ] Create `weeks_label` custom field in Beehiiv dashboard (Publication Settings > Custom Fields, type: text)
- [ ] Follow `docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md` to clone the e100 flow and activate for "Registered Pilot"
- [ ] Clean up test subscriber `sub_7bb9cf79-dade-4944-8845-01db585b3da7` from Beehiiv dashboard (tag removal not possible via API)
- [ ] Clean up test profile `01KXK1J32EQ3FD91MWXHFVCT41` from Klaviyo dashboard if desired
- [ ] Tell Karlin the pilot registration page is ready
- [ ] Run a fresh end-to-end test with a real email after Klaviyo flow is live to confirm email delivery
- [ ] Merge feat/ekuzo101-pilot into dev when satisfied
- [ ] Deploy dev to main to go live

---

## 6. Canon-Backport Candidates

The following FAQ Q&As were written for the pilot landing page and are not yet in `knowledge-base/company/knowledge/ekuzo-faq-canon.md`. They should be backported so the site, sales team, and AI crawlers all get consistent answers.

1. **"How does free upfront work?"** — The pilot is free to try. If your gamer got real value from the sessions, you pay at the end and roll into the team program. No card required to register.

2. **"What if we need to miss a week?"** — You pick your own weeks from a rolling 6-week window, so you can work around your family's schedule when you register. Week swaps after registration are handled by the coach directly.

3. **"What days and times are sessions?"** — EKUZO 101 runs Tuesdays and Thursdays, 7:00-8:30 PM ET.

4. **"How many weeks do we need to commit to?"** — Minimum 4 weeks, maximum 6. You choose any pattern that fits your schedule.

Backport process: write canon answers in `ekuzo-faq-canon.md` first, then update the FAQ array in `app/programs/ekuzo101/page.tsx` to pull from canon (strip wikilinks, leave a comment with canon source + sync date).
