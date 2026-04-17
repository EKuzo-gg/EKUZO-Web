# squad_link — Build Brief for Claude Code

Self-contained brief. All product decisions are already made. Execute against this spec.

Source of product thinking: `/Users/[user]/Documents/Claude/Knowledge Base/outputs/aaron-reply-klaviyo-fields.md` and `aaron-reply-2-squad-link.md` (Cowork session). Those are the reply messages Aaron is working against — keep your implementation consistent with what they promise.

---

## What this feature is

A shareable invite link that parents of "Building a squad" campers can forward to friends. Friend clicks → lands on a welcome page → registers for camps → gets stamped into the original camper's **crew** (the inviter's invite group).

Vocabulary: **crew** = unbounded invite group (in email + customer-facing copy). **Squad** = 5-kid coached unit at camp (landing page + operational — we carve squads from the crew pool post-registration). The landing page's "Building a squad" form card keeps that name. Everything email/URL-facing uses "crew."

## Scope decisions already made (do not relitigate)

- **Stateful via Google Sheets.** New tabs `squads` and `squad_members`. Apps Script handles reads/writes. Consistent with existing pattern.
- **Multi-gamer registrations that register via a crew link → all gamers stamped into the crew.**
- **If a friend changes week/slot away from the crew owner's** → show a confirm dialog (`"You're joining Testy's crew in Week 2 PM. Changing this means you won't be at camp together. Continue?"`). They can override. Capture whatever they actually picked.
- **Looking-for-a-squad purchases do NOT get a squad_link or squad_token.** Building only. Field is blank in Klaviyo for Looking profiles.
- **No token expiry.** If a visitor clicks a token for a week that already ran, `/squad/[token]` shows "This camp week has already happened — check out our upcoming programs" and links to `/programs`.
- **No live roster in confirmation email today.** Live roster goes in the pre-camp email (1–2 weeks out, separate future build).

## Already done in the codebase (do NOT redo)

- `app/api/webhooks/stripe/route.ts` already has `order_id` wired. Reads `charge.receipt_number`, builds `EKZ-1234-5678` format (falls back to last-8-of-PI if null), writes to Klaviyo profile + event + Beehiiv. Leave alone.
- `app/programs/ekuzo-camps/register/page.tsx` had a stale comment ("Klaviyo, replacing Beehiiv") that's already been fixed to reflect the dual Beehiiv+Klaviyo architecture. Leave alone.

## Build the following, in order

### 1. `app/programs/ekuzo-camps/register/page.tsx` (Aaron's lane — coordinate before editing)

**⚠️ Ping Aaron on Slack before touching this file.** Per the ownership map in `CLAUDE.md`, this is Aaron's file. Narrow diff, clean PR.

**Client changes:**

- On page load, read `?squad=TOKEN` query param. If present:
  - Fetch the crew owner record: `GET {apps_script_url}?action=squad&token=TOKEN`. Returns `{ owner_gamer_name, week_label, slot, week_dates }` or 404.
  - If 404 or week has already passed → redirect to `/squad/${token}` (the new page handles the terminal states cleanly). Don't try to render the register form against a dead token.
  - If present + valid → store `joining_squad_token = TOKEN` in component state. Pre-select week + slot for the first gamer. Show a banner above the form: `"You're joining {owner_gamer_name}'s crew at Week {N} ({week_dates}) {slot}."` Use the `bg-red` brand color, mirror the existing urgency-badge visual treatment.
  - When user tries to change the pre-selected week or slot, show a confirm dialog (`window.confirm` is fine for v1 — no fancy modal): `"You're joining {owner}'s crew in Week {N} {slot}. Changing this means you won't be at camp together. Continue?"` If they cancel, revert.

- When `squadStatus === "building"` (and `joining_squad_token` is NOT set — a Building registration that's ALSO joining someone else's crew is a weird edge case; default behavior is that generating your own token wins):
  - Generate a fresh `squad_token` on submit: 10-char nanoid. Use `nanoid` from npm (check `package.json` first — install if not present).
  - Pass `squad_token` through to `/api/camps/register` in the POST body.

- If `joining_squad_token` is set, also pass that through to the API.

### 2. `app/api/camps/register/route.ts` (Jamie's lane)

Accept `squad_token` and/or `joining_squad_token` from the POST body. Stamp both into Stripe `PaymentIntent` metadata when present. Keep existing metadata as-is.

```ts
if (squad_token) metadata.squad_token = squad_token;
if (joining_squad_token) metadata.joining_squad_token = joining_squad_token;
```

Stripe metadata value limits: string ≤500 chars. Not a concern for 10-char tokens.

### 3. `app/api/webhooks/stripe/route.ts` (Jamie's lane)

Extend the existing Klaviyo/Beehiiv/Sheets writes in the camps path:

**Klaviyo + Beehiiv:** write `squad_link` as a profile property AND event property for Building payments. Format: `https://ekuzo.gg/squad/${meta.squad_token}`. Blank string if `meta.squad_token` missing.

**Sheets — new `squads` write (only if `meta.squad_token` present):**

```
tab: squads
columns: squad_token, owner_parent_email, owner_gamer_name, week, slot, week_dates, created_at
```

One row per Building registration. Use the earliest-week gamer as the "owner" (same logic that already picks `earliestWeek`/`earliestSlot`). `created_at` = ISO timestamp.

**Sheets — new `squad_members` write (only if `meta.joining_squad_token` present):**

```
tab: squad_members
columns: squad_token, member_parent_email, member_gamer_name, member_week, member_slot, joined_at
```

**One row per gamer in the registration.** If a family registers 3 gamers via one crew link, write 3 rows — all with the same `squad_token`. `joined_at` = ISO timestamp.

Both writes go through the existing Apps Script webhook (`GOOGLE_SHEETS_WEBHOOK_URL`). Pass a `tab` field in the payload so Apps Script knows which sheet to append to. Keep the existing registration row-write untouched — these are ADDITIONAL writes alongside it.

### 4. `app/squad/[token]/page.tsx` (new server component — Jamie's lane)

Server component. Fetches the squad owner record from Apps Script at render time (not client-side — we want the SSR'd HTML for bots and for page-view analytics accuracy).

**Route params:** `{ params: { token: string } }`

**Three render states:**

1. **Valid token, week upcoming:** Hero block with Tungsten Narrow `"JOIN {OWNER_GAMER_NAME}'S CREW"`, subhead `"EKUZO Camp — Week {N} ({week_dates}) {slot}"`. Single red CTA button: `"REGISTER NOW"` → `/programs/ekuzo-camps/register?squad={token}`. Match existing visual language (red/black, Tungsten headings, Inter body, optionally a torn-paper divider).

2. **Valid token, week already ran:** Headline `"THIS CREW'S CAMP WEEK HAS ALREADY HAPPENED"`. Subhead `"Check out our upcoming programs — there's always another camp on the horizon."` CTA → `/programs`.

3. **Invalid / unknown token:** Same as state 2 copy but headline `"THIS CREW LINK IS NO LONGER AVAILABLE"`. CTA → `/programs`.

Week comparison: parse week dates string ("May 25 - 29") against current date to decide "has it passed." Edge case: if the dates are ambiguous, treat as upcoming (fail open, not closed).

**Metadata:** `robots: { index: false, follow: false }` — these are personal invite links, not indexable pages. Canonical = `https://ekuzo.gg/squad/[token]` (relative to metadataBase).

**JSON-LD:** not needed for this page type.

### 5. Apps Script spec doc (new markdown, not deployed by you)

Write `docs/apps-script-squad-endpoints-spec.md` containing the exact changes Jamie needs to paste into the Apps Script web app. Cover:

- New tab creation: `squads` and `squad_members` with the exact column headers above.
- New `doPost` handling for `tab: "squads"` and `tab: "squad_members"` payloads — append rows to the right tab.
- New `doGet` handler for `?action=squad&token=X` returning `{ owner_gamer_name, week_label, slot, week_dates }` JSON (or 404). Filter the `squads` tab by `squad_token` column.
- Deployment reminder: after editing, create a new version in Apps Script and redeploy to the same web app URL. The `GOOGLE_SHEETS_WEBHOOK_URL` env var does not need to change.

Write this as copy-pasteable JavaScript blocks with comments. Jamie will paste it in; you won't deploy it.

## Testing plan

Use the **QA profile** (playwright + typescript-lsp + security-guidance + sentry) after the build to verify:

1. **Happy path — Building creates a crew.** Register as "Building a squad," complete Stripe test payment, confirm: (a) `squad_token` in Stripe metadata, (b) `squads` row in Sheets, (c) `squad_link` profile property in Klaviyo. Use the Klaviyo MCP from Cowork if needed to verify the property landed — ping Jamie and he can run `klaviyo_get_profile` on the test email.

2. **Friend joins crew via link.** Take the `squad_link` from step 1. Click it. Verify the `/squad/[token]` page renders with owner name + week info. Click the CTA. Verify register page pre-selects the right week/slot and shows the crew banner. Complete a second Stripe test payment with different email. Verify: (a) `joining_squad_token` in Stripe metadata, (b) new row in `squad_members` tab.

3. **Multi-gamer joining via link.** Register 3 gamers through a crew link. Verify 3 rows in `squad_members` with the same `squad_token`.

4. **Week change warning.** On register page with crew link, try to change week. Verify confirm dialog fires with correct copy. Verify cancel reverts, OK allows.

5. **Invalid token page.** Visit `/squad/NONEXISTENT`. Verify state-3 render.

6. **Past week page.** Manually insert a `squads` row with a past `week_dates` value via Sheets. Visit the token's URL. Verify state-2 render.

7. **Looking-for-a-squad purchase.** Complete a Looking purchase. Verify `squad_token` is NOT in Stripe metadata, no row in `squads`, `squad_link` is blank in Klaviyo.

## Pre-merge gate

Before `dev → main`:

- Enable **code-review** and **security-guidance** plugins. Run both on the diff.
- Specific security concerns to flag:
  - `/squad/[token]` route is un-authed. Ensure no PII leaks (we show gamer first name + camp week — that's by design, but confirm no parent email, last name, or other data makes it into the response).
  - The Apps Script `doGet` endpoint returns data publicly. Same PII check.
  - Token format (nanoid 10-char) is guessable at large N. Fine for this scale, but document it as an accepted risk in `WORKLOG.md`.
- Update `WORKLOG.md` with a full entry documenting the squad_link build.

## Coordination notes

- **Ping Aaron on Slack BEFORE editing `app/programs/ekuzo-camps/register/page.tsx`.** His lane per the ownership map. Narrow diff.
- Aaron is aligning his Klaviyo confirmation template to match the field names (see Cowork output files). He's also reshaping the Building variant copy — the Squad Roster block is being adjusted away from the fixed-5-slot countdown.
- Jamie will coordinate running real end-to-end test payments via Cowork's Stripe MCP + Klaviyo MCP once this lands on the `dev` preview.

## Stack reminders (from CLAUDE.md)

- Next.js 15 App Router, Turbopack. TypeScript strict.
- Tailwind + `font-display` (Tungsten Narrow) for headings, `font-body` (Inter) for everything else.
- `components/ui/Button.tsx` variants: `red-filled`, `red-outlined`, `white-filled`, `white-outlined`.
- Dev: `~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/next dev`
- Type check: `~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/tsc --noEmit`
- Git: work on `dev`, never push to `main` directly.

## Done when

- All four code pieces ship and `tsc --noEmit` is clean.
- Apps Script spec doc exists and Jamie has deployed the Apps Script changes.
- All 7 testing scenarios above pass on the dev Netlify preview.
- `WORKLOG.md` updated.
- PR open from `dev` → `main` with code-review + security-guidance plugins run clean.
