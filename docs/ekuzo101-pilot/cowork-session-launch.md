# EKUZO 101 — Cowork Session: Test → Merge → Deploy (LAUNCH)

**For:** Jamie's Cowork (Claude)
**Written:** 2026-07-15, end of the review/rebuild session
**Goal:** Get 101 live TODAY. Jamie runs this from a checklist vantage and asks
questions; Claude executes everything it can (shell, browser, Klaviyo MCP) on
his behalf. Jamie is only needed where a dashboard or credential physically
requires him.

---

## Context (read, don't re-derive)

The autonomous build (branch `feat/ekuzo101-pilot`) was reviewed and heavily
reworked on 2026-07-15. Read these two files first:

1. `docs/ekuzo101-pilot/retrospective.md` — incl. the same-day addendum: what
   was rebuilt and why, rules adopted, decisions made. Do not relitigate
   decisions recorded there.
2. `WORKLOG.md` — top entry covers the review-session commit.

**What changed in the review session (all committed on the branch):**
- Landing page rebuilt as a camps v2 clone + full copy pass (kid+parent, fun
  first). Hero: "YOUR FIRST ESPORTS TEAM".
- WeekPicker rebuilt as an availability calendar (month cards, week-row
  pills, range/counter banner, orange #FF6B1A accent). Weeks are dynamic —
  rolling next-6 window.
- Register page: e100 orange gradient hero, "Not Fortnite..." parent copy
  (register only — never on the landing page), "What happens after you
  submit" 3-card strip, nested-form hydration fix (Nav/Footer outside form).
- **Squad links built** (availability-affiliation model): owner registration
  mints token + `squads` row; `?squad=TOKEN` shows join banner (NO week
  pre-pin, ever); joiners write `squad_members` rows with their own weeks;
  success page has "Recruit your friends" copy-link block; Klaviyo event
  carries `squad_link`.
- All times are "7:00-8:30 PM local time" (never ET). No "same teammates /
  same coach every session" promises anywhere (drop-in friendly).
- Pricing story: free pilot, donation-based at the end, team program $160/mo
  ($13.33/hr; "Friendship free, always").
- Sticky CTA bar (`components/ui/StickyCTA.tsx`): 101 gets the camps-style
  bar → `/programs/ekuzo101/register?cta=sticky` (shared-component touch —
  flagged for Aaron in WORKLOG).

**Environment:** Jamie runs `npm run dev` in HIS terminal (Claude's sandbox
can't serve to his browser). Dev server: port 3000. Claude drives pages via
the Chrome extension. Test emails: `jamiefosu+101test-N@gmail.com`
(increment N; check `06-cleanup-ledger.md` for the last used).

---

## Checklist (in order)

### Phase 0 — Session start (~5 min, Claude)
- [ ] `git -C ~/Projects/ekuzo-web status` + `log --oneline -3` on
      `feat/ekuzo101-pilot` — confirm review-session commit is present, tree
      clean (except known LFS noise; see WORKLOG).
- [ ] Jamie starts `npm run dev`. Claude confirms `tsc --noEmit` and loads
      all three pages in the browser (console must be error-free — that's a
      gate now).

### Phase 1 — Visual + mobile QA sweep (~15 min, Claude drives, Jamie watches)
- [ ] Landing, register, success at desktop AND ~375px viewport.
- [ ] Register: calendar picker min-4 gate, cross-month selection, deselect.
- [ ] `?squad=BADTOKEN` degrades silently (no banner, no console errors).
- [ ] Note-and-fix anything small; anything structural goes back to Jamie
      before fixing.

### Phase 2 — Klaviyo setup (~20 min, Claude via MCP + Jamie for dashboard-only steps)
Base checklist: `docs/ekuzo101-pilot/ekuzo101-klaviyo-setup.md`, WITH THESE
OVERRIDES (the doc predates the review session):
- [ ] All template copy: "7:00-8:30 PM local time" (the doc says ET — wrong).
- [ ] DELETE the "Same coach, same teammates, every session" line from the
      Pilot Confirmation body. No fixed-roster promises.
- [ ] ADD a recruit-your-friends paragraph to the Pilot Confirmation using
      `{{ event.squad_link }}`: share the link, friends get grouped
      together, every family picks its own weeks.
- [ ] Metric "Registered Pilot" already exists (metric ID `ULgnq2`) — skip
      the doc's Step 1 (no throwaway test registration needed).
- [ ] Claude attempts templates via the Klaviyo MCP (create_email_template /
      clone_email_template). Flow cloning/trigger-editing may be
      dashboard-only — if the MCP can't, Claude preps exact copy blocks and
      Jamie pastes. **Jamie activates the flow** (keep Draft until Phase 3).
- [ ] Beehiiv note: do NOT create a `weeks_label` field. Decision 2026-07-15:
      Beehiiv = general nurture newsletter only; Klaviyo owns all product
      email. (A small code cleanup — dropping weeks_label from the Beehiiv
      payload — may already be committed; if not, it's a 2-line change.)

### Phase 3 — End-to-end test, owner flow (~15 min)
- [ ] Set flow LIVE (Jamie). Submit test registration (next test email) via
      the real form. Log in `06-cleanup-ledger.md` FIRST.
- [ ] Verify: dev console fulfillment logs → Beehiiv subscriber + 2 tags →
      Klaviyo profile + "Registered Pilot" event with `squad_link` property →
      Sheets `ekuzo-purchases` row (squad_token filled) → Sheets `squads` row
      → success page shows weeks + Recruit-your-friends link + copy button.
- [ ] Confirmation email arrives (2-5 min): gamer name, weeks label, squad
      link all render; no `{{...}}` literals; no payment references; no ET.

### Phase 4 — End-to-end test, joiner flow (~10 min)
- [ ] Open the squad link from Phase 3. Join banner shows owner's gamer name
      + "pick your own weeks" copy. **Known risk:** Apps Script may not
      accept `product: "ekuzo101"` yet — if `/api/squad/[token]` 404s on a
      valid token, the Apps Script needs the product value added (same small
      change teams needed; likely web-app redeploy — Jamie's dashboard).
- [ ] Register a second test family (next test email, different weeks). Log
      in cleanup ledger. Verify `squad_members` rows carry the JOINER's
      weeks (availability model working end to end).

### Phase 5 — Cleanup (Jamie, dashboards)
- [ ] Delete ALL test records listed in `06-cleanup-ledger.md`: Beehiiv subs
      (incl. `sub_7bb9cf79-dade-4944-8845-01db585b3da7` from the build),
      Klaviyo profiles (incl. `01KXK1J32EQ3FD91MWXHFVCT41`), Sheets test
      rows (purchases + squads + squad_members).

### Phase 6 — Merge + deploy (Claude executes; Jamie gives explicit GO at each arrow)
- [ ] `npm run build` final on the branch — must pass.
- [ ] → GO: merge `feat/ekuzo101-pilot` → `dev`, push. (Per runbook: pull
      dev first; ping Aaron re: StickyCTA.tsx shared-component change.)
- [ ] → GO: `dev` → `main` per `docs/dev-runbook.md` (this deploys via
      Netlify).
- [ ] Watch the Netlify deploy; then prod smoke test: all three pages load,
      register page renders the calendar, `curl -sI` the pages, confirm
      noindex robots meta on all three, **no test submission against prod**
      unless Jamie wants one (if so: log + clean it).
- [ ] Confirm Netlify env has: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID,
      KLAVIYO_PRIVATE_API_KEY, KLAVIYO_PURCHASERS_LIST_ID,
      GOOGLE_SHEETS_WEBHOOK_URL, NEXT_PUBLIC_SITE_URL. (No new vars were
      added — squad code reuses existing ones.)

### Phase 7 — Live (~5 min)
- [ ] Tell Karlin the page is live + hand her the base URL. Her anchor
      family registers first and shares THEIR squad link to bring the 10-15.
- [ ] Optional immediate follow-ups (defer freely): canon backport of the 7
      FAQ answers; `TrackPageView` union + 101 landing analytics; replace
      camps-produced hero/what-we-play videos when 101 assets exist; Nuri's
      card swap when the new coach is ready.

---

## Guardrails
- Do not touch `app/programs/ekuzo-camps/**`, `ekuzo100/**`, `ekuzo-teams/**`
  beyond what's already committed.
- Jamie gives explicit GO before: flow activation, merge to dev, push to
  main, any prod-side test.
- Every production write during testing gets logged in the cleanup ledger
  BEFORE it happens.
- No em/en-dashes in any customer-facing copy (incl. Klaviyo templates).
