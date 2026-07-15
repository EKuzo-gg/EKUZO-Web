# EKUZO 101 Summer Pilot — Cowork Session: Review to Deploy

**For:** Jamie's Cowork (Claude)  
**Context:** Fable (autonomous build session) built and committed EKUZO 101 on `feat/ekuzo101-pilot`. This session takes it from there to deployed and live.

---

## Your role in this session

You are Jamie's Cowork agent. Jamie is reviewing a completed feature branch he wasn't in the room for. Start by reading the artifacts listed in §1, then open with a crisp summary of what's done vs what's outstanding, then ask Jamie how he'd like to begin. Do not start coding or making changes before he tells you where to start.

---

## §1. Read these first (before saying anything to Jamie)

```
/Users/jamiefitch/Projects/ekuzo-web/docs/ekuzo101-pilot/07-review-guide.md
/Users/jamiefitch/Projects/ekuzo-web/docs/ekuzo101-pilot/03-decision-log.md
/Users/jamiefitch/Projects/ekuzo-web/docs/ekuzo101-pilot/04-evidence-ledger.md
/Users/jamiefitch/Projects/ekuzo-web/docs/ekuzo101-pilot/05-defect-log.md
/Users/jamiefitch/Projects/ekuzo-web/docs/ekuzo101-pilot/06-cleanup-ledger.md
/Users/jamiefitch/Projects/ekuzo-web/docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md
```

Also verify current branch and defect state:
```bash
git -C /Users/jamiefitch/Projects/ekuzo-web log --oneline feat/ekuzo101-pilot -3
git -C /Users/jamiefitch/Projects/ekuzo-web diff dev feat/ekuzo101-pilot --name-only
```

---

## §2. Opening message to Jamie

After reading, open with this structure (write it fresh from the artifacts — do not copy this verbatim):

**Part 1: What's done**
- Complete feature on `feat/ekuzo101-pilot` (1 commit off dev, pushed)
- What Fable built and what was live-tested (Beehiiv, Klaviyo, Sheets)
- tsc + build status

**Part 2: What's outstanding — 3 items**

1. **Klaviyo flow** — the "Registered Pilot" event fires correctly (confirmed in evidence ledger, metric ID `ULgnq2`) but there is no flow listening to it yet. ~20 min of dashboard work. Full checklist: `docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md`.

2. **Beehiiv `weeks_label` field** — the route sends it; Beehiiv silently drops unknown custom fields. Jamie needs to create the field in the Beehiiv publication settings before first real family registers. One-time 2-minute step.

3. **Test subscriber cleanup** — one test subscriber exists in Beehiiv (`sub_7bb9cf79-dade-4944-8845-01db585b3da7`) and one in Klaviyo (`01KXK1J32EQ3FD91MWXHFVCT41`) from the integration test. Jamie deletes from the dashboards (tag removal via API not possible — that's an existing Beehiiv limitation).

**Part 3: Decisions Fable made that Jamie should review (most-overrulable first)**

List them briefly — pull from `03-decision-log.md` §"Open Flags for Jamie". Each should be one line with the overrule cost noted (e.g. "one-line change" vs "no code change needed").

**Part 4: Ask how to begin**

> "How would you like to start — walk through the pages in the browser, work through the decisions, set up Klaviyo, or go straight to merge and deploy?"

---

## §3. Agenda for the session (follow Jamie's lead on order)

### A. Browser walkthrough (optional but recommended)

If Jamie wants to see the pages:

```bash
cd /Users/jamiefitch/Projects/ekuzo-web
git checkout feat/ekuzo101-pilot
npm run dev
```

Walk him through:
1. `http://localhost:3001/programs/ekuzo101` — landing page
2. `http://localhost:3001/programs/ekuzo101/register` — week picker, fill + submit
3. `http://localhost:3001/programs/ekuzo101/success` — schedule confirmation
4. Check dev-server console for Beehiiv/Klaviyo/Sheets log lines

### B. Decision review + any overrules

The four open flags from the decision log. For each one, present the flag and Fable's rationale in one sentence, then ask if Jamie agrees or wants to change it. If he overrules, make the change immediately before moving on.

Flag 1 — Route slug `/programs/ekuzo101` vs `/programs/ekuzo-101`  
Flag 2 — "Registered Pilot" metric vs $0 "Placed Order" (one-line change in register route)  
Flag 3 — No Beehiiv automation for 101 (confirm against Karlin's plan)  
Flag 4 — Duplicate-submission handling: client guard + UUID + accepted risk  

### C. Klaviyo setup (~20 min)

Follow `docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md` step by step. Email copy is in the checklist — Jamie pastes into the Klaviyo editor. You support but Jamie does the dashboard actions (you can't click Klaviyo). Key checkpoint: after step 1, verify "Registered Pilot" metric appears in Klaviyo as a trigger option. After step 10, confirm email renders with `{{event.gamer_name}}` and `{{event.weeks_label}}` populated.

### D. Beehiiv field creation (~2 min)

Jamie creates `weeks_label` text custom field in Beehiiv publication settings. Then do a fresh test registration to confirm it appears on the subscriber record. Use `jamiefosu+101test-2@gmail.com` (increment test counter). Record in cleanup ledger.

### E. Test subscriber cleanup

Jamie deletes from Beehiiv and Klaviyo dashboards:
- Beehiiv: `sub_7bb9cf79-dade-4944-8845-01db585b3da7`
- Klaviyo: `01KXK1J32EQ3FD91MWXHFVCT41`
- Any new test subscribers created in step D (log in cleanup ledger first)

### F. End-to-end test with Klaviyo live

After Klaviyo flow is activated (step 9 of checklist), submit one more test registration and wait 2-5 minutes for the confirmation email. Confirm:
- Email arrives
- `{{event.gamer_name}}` populated
- `{{event.weeks_label}}` shows the selected weeks
- No payment references in the email
- No broken template variables

### G. Canon backport (optional — ~10 min)

Four new FAQ answers Fable wrote for the landing page aren't in the knowledge base yet. If Jamie wants to backport them (so sales, support, and AI crawlers get consistent answers):

File: `knowledge-base/company/knowledge/ekuzo-faq-canon.md`

Answers to add:
1. "How does free upfront work?"
2. "What if we need to miss a week?"
3. "What days and times are sessions?" (for 101 specifically)
4. "How many weeks do we need to commit to?"

Then update the FAQ array in `app/programs/ekuzo101/page.tsx` to note canon source + sync date in comments.

### H. Merge to dev + deploy

Only when Jamie is satisfied:

```bash
git checkout dev
git pull origin dev
git merge feat/ekuzo101-pilot
git push origin dev
```

Then deploy per the standard dev → main flow (see `docs/dev-runbook.md`). Before pushing to main, run `next build` one final time to confirm nothing drifted.

---

## §4. Things you should NOT do without Jamie asking

- Do not activate the Klaviyo flow yourself (Jamie must do it in the dashboard)
- Do not merge to dev without Jamie's explicit go-ahead
- Do not deploy to main
- Do not delete Beehiiv/Klaviyo test records (Jamie does this in the dashboards)
- Do not create new env vars — all required vars are already in `.env.local`
- Do not touch `app/programs/ekuzo-camps`, `app/programs/ekuzo100`, `app/programs/ekuzo-teams`, or `app/api/webhooks/stripe/route.ts` (already sealed; any 101-related changes landed in the feature commit)

---

## §5. If Jamie wants to overrule a decision

| Flag | What to change | File | Impact |
|------|---------------|------|--------|
| Route slug → `/programs/ekuzo-101` | Add redirect in `next.config.mjs`: `/programs/ekuzo-101` → `/programs/ekuzo101` | `next.config.mjs` | No functional change — just add the redirect alias |
| "Placed Order" instead of "Registered Pilot" | Change `metricName` in register route | `app/api/ekuzo101/register/route.ts` line ~228 | One-line change; re-run integration test |
| Add Beehiiv automation | Add `automation_ids` array to product config | `lib/products/ekuzo101.ts` | Requires creating the automation in Beehiiv first |

---

## §6. Reminder on what's not in scope for this session

Per the build brief:
- Payment mechanics (Stripe, invoices, end-of-program charging) — later session
- Pay-at-the-end nurture flow in Klaviyo — later session
- Squad links for 101
- Schema.org / sitemap / llms.txt (page is noindex)
