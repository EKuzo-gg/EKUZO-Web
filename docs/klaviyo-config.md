# Klaviyo Config & Gotchas

<!-- Created 2026-07-15 from knowledge-base system/loops/lessons-pending/2026-07-15-klaviyo-clone-full-definition-diff.md (learning loop 2026-W29, mid-week run). Sibling to beehiiv-config.md per the established config-doc pattern; CLAUDE.md's Email line points here. -->

Klaviyo owns product/transactional email (confirmations, prep flows, event-triggered sends); Beehiiv owns general nurture. Split decided 2026-07-15 — see `beehiiv-config.md` § Platform split and `architecture-decisions.md`.

## Integration surface

- Site-wide client: `lib/klaviyo.ts` (lead, abandoned, success routes).
- Server events from API routes: "Placed Order" (metric `TW2E7J`, filtered by `product`) and "Registered Pilot" (101).
- Flows/templates as of 2026-07-15: e100 welcome flow `UWMYHm` (trigger `TW2E7J` filtered EKUZO100; templates `RW7L6G`, `TGqpna`); 101 confirmation flow `V8RC9V` (cloned from e100 2026-07-15).

## Hard-won gotchas (2026-07-15, EKUZO 101 launch)

1. **Cloning a flow copies the trigger filter.** A product filter from the source flow will silently block ALL entries for the new product — flow live, zero emails, no error anywhere (the 101 clone carried `product equals EKUZO100`; every real registration would have been filtered out). **After ANY flow clone, fetch the full definition via API (`GET /api/flows/{id}?additional-fields[flow]=definition`) and verify trigger + filters + subjects before activating.** This recurs every time we clone a flow for a new product — Teams is next.
2. **Flow-attached templates are NOT in the templates API** (404). Edit their HTML via the UI code editor. For large HTML payloads driven from Cowork: clipboard-paste, then verify via API (patterns in the KB's agent-mode.md).
3. **The flow editor's side panel silently discards unsaved edits** if you navigate into "Change template" without pressing Save. Save per panel, then re-verify via API — never trust the screen.
4. **Event template variables are flat for our routes** (`{{ event.gamer_name }}`); `event.extra.*` is a Stripe-webhook-flow convention only. `parent_first_name` is NOT an event property — use profile `{{ first_name|default:'there' }}`.

## Open items

- Redundant library templates `W5js9U` / `XB34yq` — delete (launch-session deferral).
- Decide whether pilots get their own Klaviyo list (intentionally not on the purchasers list).

## Free beta flows (2026-11)
<!-- Added 2026-11-13 from knowledge-base handoff 2026-11-12-beta-emails-and-restart (run notes) and the two session debriefs. -->

Built 2026-11-12 between 22:22 and 22:38 CT in the Klaviyo UI (the connector cannot create flows) and read back through the API. Property names the wizard writes: `season-one-tracking.md`, free beta section. Every write is in `docs/beta-wizard-go-live-2026-11/06-cleanup-ledger.md` (C10 onward).

**Metric ids.** RsTsHJ "Beta Wizard Completed", Y6dcur "Beta Wizard Progress", XNJKbF "Season 01 Waitlist" (the existing sign-up event; a parent who joined on `/season1/beta` is told apart by `where` equals `beta`). The live Season 01 Day 0 (W5ciCB) and Day 4 (VE7DfC) flows and list XGTv2F are not touched by these flows.

| Flow | Name | Trigger and filters | Steps | State |
|---|---|---|---|---|
| W9LxM9 | Beta - We got it (wizard completed) | RsTsHJ, re-entry allowed. Temporary profile filter: email equals the one test address (since deleted) | Email XSKF2W from Karlin from EKUZO (karlin@ekuzo.gg), smart sending off so a second player the same day still gets it; then internal alert SXAysf to karlin@ and jamie@ | Live with the test filter, so no family enters. Alert Draft. Before families: remove the filter, set the alert Live |
| Wf7Nam | Beta - Pick up (wizard started, not finished) | Y6dcur, re-entry after 7 days. Profile filter: "Beta Wizard Completed zero times in the last 14 days" | Wait 2 hours, email ReJbbU | Draft |
| WjRNvd | Beta - Wizard link reminder (joined on beta page, no sign-up) | XNJKbF with trigger filter `where` equals `beta`, no re-entry. Profile filter: "Beta Wizard Completed zero times over all time" | Wait 1 day, email W3HMh5; wait 3 days, email Wuqz7E; wait 5 days, email RVMu54 (days 1, 4 and 9) | Draft |

**Templates.** Library templates (connector-created, nothing sends from them): VFaZSx "Beta - We got it", QQh9Cj pick-up, XnXD3C reminder 1, UXwGUw reminder 2, W8VxNn reminder 3. The flow emails hold their own copies, with different ids (UJPVS2, UASFfq, UxyEYc, YvTHAw, Txx6LA), so **copy is edited in the flow, not in the library**. A name with HTML in it renders escaped. The plain-text part escapes too, so an apostrophe in a name reads as `&#x27;` in plain-text clients; the fix is `|safe` in the text part of the two flow emails that print a name, and it is still open.

**Not applied.** The hold-out filters on the live Day 0 and Day 4 flows change what real families get the moment they are saved, and the order of list-add against the event is unproven. When Jamie says yes, the spec is a profile filter on each: has done "Season 01 Waitlist" where `where` equals `beta` zero times over all time.

**Gotchas from the beta build.**

1. **`method: BOT_PROTECTION` suppresses `team+...@ekuzo.gg` test aliases about a second after creation.** The profile carries a "Manually Suppressed from Email Marketing" event; read its properties. `method` is `BOT_PROTECTION` for Klaviyo's own bot protection and `API_V3_SUPPRESSIONS` for a suppression made through the API (ours). Since 2026-10-09 there are 41 `BOT_PROTECTION` hits in this account, all on `team+...@ekuzo.gg` aliases and none on a family; one real address (jamie@fitch.vc, 2026-11-13) was not flagged. One slow, paced run in a real browser was flagged too, so the cause is not known: the rule is an observation from a pattern. A flow skips a flagged profile with "Skipped: Person Suppressed".
2. **One suppression per profile per 90 days.** Unsuppressing a flagged alias to reuse it spends that allowance: a second suppress job completes with `skipped 1`, and the profile page says to wait until the date shown (2027-02-10 for the 2026-11-13 case). Use a fresh alias for each test, suppress once at close.
3. **A metric-triggered flow does send to a never-subscribed, unsuppressed profile** (proven 2026-11-13: W9LxM9 recipients 2, two opens, about three to seven minutes from event to open). A draft flow sends nothing, so a send test needs the flow's email action Live, behind a filter that admits only the test address.
4. **The flow email's subject field is a rich-text editor (ProseMirror).** Plain typing doubled the text. Select the field's node by script, then type, then read the subject back through the API.
5. **The connector cannot edit flow templates** (the key lacks `flows:write`). Edit copy and code in the flow's own editor (flow-attached templates are not in the templates API either, see gotcha 2 above).
