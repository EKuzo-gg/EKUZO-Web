# EKUZO 101: Summer Pilot — Evidence Ledger

**Owner:** Sentry (automated QA run)
**Updated:** 2026-07-15

## Build Checks

| Check | Result |
|-------|--------|
| `tsc --noEmit` | PASS — zero TypeScript errors |
| `npm run build` | PASS — all 3 ekuzo101 routes built (`/programs/ekuzo101`, `/programs/ekuzo101/register`, `/programs/ekuzo101/success`) |

## Requirement Evidence

| Req ID | Test Performed | Evidence | Pass/Fail | Verified By |
|--------|---------------|----------|-----------|-------------|
| R2 | grep for Stripe/PaymentStep/CheckoutForm/createRegistration in app/programs/ekuzo101/ | Zero live-code matches (comment-only mentions); tsc clean | PASS | Sentry automated |
| R8 | `tsc --noEmit` with ekuzo101 in lib/products/types.ts | Build passes without error; no breakage to other callers | PASS | Sentry automated |
| R9 | `git diff dev -- app/api/webhooks/stripe/route.ts` | Diff present: `automation_ids: automationId ? [automationId] : []` guard added. Change is in working tree (uncommitted). R9 acceptance criterion met. R30 conflict — see defect D-001. | PARTIAL | Sentry automated |
| R11 | `POST /api/ekuzo101/register` with valid payload | `{"ok":true,...}` returned with HTTP 200; no payment step | PASS | Sentry curl |
| R12 | Beehiiv GET after live registration `jamiefosu+101test-1@gmail.com` | Subscriber ID `sub_7bb9cf79-dade-4944-8845-01db585b3da7`; tags `["ekuzo101-pilot-registered","source-ekuzo101-pilot"]` present; referring_site `ekuzo101-pilot-registration`; send_welcome_email false (not in returned fields = correct default). **weeks_label custom field MISSING** from subscriber record — see defect D-002. | FAIL | Sentry API |
| R13 | Klaviyo GET profile + events after live registration | Profile ID `01KXK1J32EQ3FD91MWXHFVCT41` created; event ID `7hv4EC4Kz4b` with `event_properties: {gamer_name,weeks_count,gamer_count,product:"EKUZO101",weeks_label}` present. Metric name "Registered Pilot" confirmed via source code (metrics:read scope unavailable on API key). | PASS (metric name source-confirmed) | Sentry automated + API |
| R17 | POST with non-Tuesday dates (2026-07-22 Wed) | HTTP 400: `{"error":"Invalid week date: 2026-07-22. Expected a Tuesday in YYYY-MM-DD format."}` | PASS | Sentry curl |
| R17 | POST with tripwire field `totalPrice: 199` | HTTP 400: `{"error":"Invalid request payload."}` | PASS | Sentry curl |
| R17 | POST with 3 weeks only | HTTP 400: `{"error":"Please select between 4 and 6 weeks."}` | PASS | Sentry curl |
| R19 | `robots` meta in page source | `/programs/ekuzo101`: `robots: { index: false, follow: true }`; `/programs/ekuzo101/register`: `robots: { index: false, follow: true }`; `/programs/ekuzo101/success`: `robots: { index: false, follow: false }` | PASS | Sentry grep |
| R19 | `alternates.canonical` in layout/page files | All 3 routes have correct canonical paths | PASS | Sentry grep |
| R23 | grep for em-dash/en-dash/arrow in app/programs/ekuzo101/ and copy-deck.md | `page.tsx` line 16: `title: "EKUZO 101 Summer Pilot — Try It Free"` (em-dash in HTML title tag). copy-deck.md: zero matches. | FAIL | Sentry grep |
| R30 | `git diff dev -- app/api/webhooks/stripe/route.ts` | Diff present — see defect D-001 | FAIL | Sentry automated |
| R31 | `npm run build` | Build succeeds; all 101 pages compiled | PASS | Sentry automated |
| R32 | `tsc --noEmit` | Zero TypeScript errors | PASS | Sentry automated |
| R34 | grep Stripe/PaymentStep/CheckoutForm/createRegistration in app/programs/ekuzo101/ | Zero live-code matches | PASS | Sentry automated |

## Live Integration Test Payloads

**Successful registration response (Jul 15, 2026):**
```json
{"ok":true,"parentName":"Jamie Test","parentEmail":"jamiefosu+101test-1@gmail.com","gamers":[{"name":"TestGamer Pilot"}],"weeksLabel":"Tuesdays & Thursdays - Weeks of Jul 21, Jul 28, Aug 4, Aug 11 - 7-8:30 PM ET","weekDetails":[{"tueFull":"Tue, Jul 21","thuFull":"Thu, Jul 23"},{"tueFull":"Tue, Jul 28","thuFull":"Thu, Jul 30"},{"tueFull":"Tue, Aug 4","thuFull":"Thu, Aug 6"},{"tueFull":"Tue, Aug 11","thuFull":"Thu, Aug 13"}],"weeksCount":4}
```

**Beehiiv subscriber record (subset):**
- ID: `sub_7bb9cf79-dade-4944-8845-01db585b3da7`
- Tags: `["ekuzo101-pilot-registered","source-ekuzo101-pilot"]`
- referring_site: `ekuzo101-pilot-registration`
- Custom fields present: first_name, last_name, phone, program (EKUZO101), gamer_name, gamer_count, timezone
- Custom fields MISSING: weeks_label (R12 defect D-002)

**Klaviyo profile:**
- Profile ID: `01KXK1J32EQ3FD91MWXHFVCT41`
- Event ID: `7hv4EC4Kz4b`
- Event properties: `{gamer_name, weeks_count:4, gamer_count:1, product:"EKUZO101", weeks_label:"Tuesdays & Thursdays - Weeks of Jul 21, Jul 28, Aug 4, Aug 11 - 7-8:30 PM ET"}`
- Metric: metric_id `ULgnq2` (name confirmed as "Registered Pilot" in route source)
