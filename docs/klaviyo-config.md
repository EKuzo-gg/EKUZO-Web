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
