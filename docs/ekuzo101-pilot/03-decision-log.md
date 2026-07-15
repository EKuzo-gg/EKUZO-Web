# EKUZO 101: Summer Pilot — Decision Log

**Owner:** Fable  
**Most-overrulable first (Jamie flags appear at the top)**

---

## Open Flags for Jamie (verbatim from brief §13)

1. **Route slug** normalized to hyphenless `/programs/ekuzo101` for sibling consistency with `ekuzo100` (scoping approval said "ekuzo-101"; normalization okayed but flagged). One-line change in `next.config.mjs` if Jamie prefers the hyphenated form.

2. **New Klaviyo metric "Registered Pilot"** vs $0 "Placed Order" — rationale: $0 orders would pollute revenue/conversion attribution on campaigns filtered by "Placed Order" value. "Registered Pilot" is a distinct metric that Jamie can filter separately. Overrule = change metric name in the register route (one-line change, no flow impact until Jamie activates).

3. **Beehiiv: no automation enrollment for 101** (Klaviyo owns product email; Beehiiv nurture via new tags `ekuzo101-pilot-registered` + `source-ekuzo101-pilot`). Confirm against Karlin's nurture plan — if Beehiiv should run an automation, add the `automation_ids` to the product config and create the automation in Beehiiv.

4. **Duplicate-submission handling**: client-side single-flight guard + per-registration UUID in Sheets + accepted risk (low volume, hand-sold pilot). Server-side idempotency noted as follow-up if 101 goes permanent.

---

## Autonomous Decisions (Fable)

**D1. `welcomeAutomationId` optionalized in `ProductConfig`**  
Change: `welcomeAutomationId?: string` in `types.ts`. Guard in Stripe webhook: `automation_ids: automationId ? [automationId] : []`. Rationale: 101 requires no Beehiiv automation; passing `[""]` would be a malformed API call. This is the minimum-footprint change per brief §6.1.  
*File: `lib/products/types.ts`, `app/api/webhooks/stripe/route.ts`*

**D2. Success page data via sessionStorage**  
The 101 register route returns a JSON object with `parentName`, `parentEmail`, `gamers`, `weeksLabel`, `weekDetails` (array of `{tueFull, thuFull}` per week). The register page client stores this in `sessionStorage` under key `ekuzo101-success` and redirects to `/programs/ekuzo101/success`. The success page reads from sessionStorage on mount. Rationale: no PI to query, URL params would require encoding a large object. sessionStorage is cleared on tab close (appropriate for a one-time success page).  

**D3. `weeks_label` field in Beehiiv custom fields**  
The `weeks_label` human-readable string (e.g. "Tuesdays & Thursdays · Weeks of Jul 21, Jul 28, Aug 11, Aug 18 · 7-8:30 PM ET") is stored as a Beehiiv custom field. This requires the `weeks_label` custom field to be created in Beehiiv's publication settings by Jamie before the production launch. Noted in `ekuzo101-klaviyo-setup.md` checklist.

**D4. Week `week_dates` field in Sheets = "Tue [date] – Thu [lastdate]"**  
Mirrors e100's "cohort_start – cohort_end" convention in the `week_dates` column. First Tuesday ISO date and last Thursday ISO date of the selected weeks.

**D5. Weeks serialization**  
`weeks` array: ISO Tuesday dates (e.g. `["2026-07-21", "2026-07-28", "2026-08-11", "2026-08-18"]`). `weeks_label`: human string for display. Stored at registration level (family-level, not per-gamer — all gamers share the same weeks).

**D6. Landing page is noindex (not just register/success)**  
The brief says route is all noindex. Rationale: pilot is invite-only via Karlin; it should not appear in Google results. If 101 becomes permanent, noindex can be lifted.

**D7. `lib/analytics.ts` completion event**  
Use existing `trackCompleteRegistration` if it exists; otherwise add a thin `trackCompleteRegistration({ program, value }: { program: string; value: number })` that wraps Meta pixel's `CompleteRegistration` standard event. Check existing analytics helpers first — use whichever is closest.

**D8. Per-registration UUID in `additional_info` column**  
The Sheets row has an `additional_info` column (present in the webhook's existing rows). The UUID is appended to `additional_info` as "reg_id:[uuid]" so it doesn't require a new Sheets column. This is a non-breaking addition — the Apps Script reads `additional_info` as a plain text field.

**D9. Weeks stored in `week` column (overloaded, e100 convention)**  
The `week` column carries `weeks_label` for 101, consistent with how e100 carries `cohort_label` there. Noted in `buildPurchaseRowCohortFields` comment.
