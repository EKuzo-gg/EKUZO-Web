# EKUZO Web — Skills, Commands & Agent Tooling

Inventory of the callable skills, slash commands, and agent packs installed in this repo, created
2026-06-07. Several of these are "run every so often" tools that were easy to forget existed —
this is the index. **Automation cadence below is a recommendation for reference only; nothing is
scheduled yet (automation is a separate decision — see note at the bottom).**

Two install locations exist (both are checked into the repo):
- `.claude/` — Claude Code slash commands + skills
- `.agents/skills/` — additional agent skill packs

---

## Slash commands (`.claude/commands/`)

| Command | What it does | Typical cadence |
|---|---|---|
| `/audit` | Full **GEO audit suite**: scores each key URL for AI-citability and saves results into a dated `reports/YYYY-MM-DD/` folder for trend tracking. Defaults to production; pass a URL (e.g. `/audit https://dev--ekuzo.netlify.app`) to audit a preview. | Monthly (first week) — already noted in CLAUDE.md |

## Skills (`.claude/skills/`)

| Skill | What it does | Typical cadence |
|---|---|---|
| `commit` | Create structured git commits from current changes (ekuzo-web or ekuzo-camps). | On demand (every commit) |
| `pr` | Generate a PR description from the current branch's changes. | On demand (every PR) |
| `deploy-check` | Pre-deployment checks before shipping to production. | Every `dev` → `main` merge |
| `security` | Scan the codebase for security vulnerabilities. | Periodic / before releases |
| `project-manager` | Agent (haiku) for project plans, execution tracking, risk/budget/schedule, stakeholder coordination across initiatives. | On demand |

## Agent skill packs (`.agents/skills/`)

| Pack | What it does | Typical cadence |
|---|---|---|
| `impeccable` | Frontend/UX improvement pack — design, redesign, critique, audit, polish, accessibility, visual hierarchy, typography, motion, responsive behavior, design tokens. Ships its own subagent (`impeccable-asset-producer`) + a live-browser iteration toolchain (scripts in `impeccable/scripts/`). | On demand (UI work) |
| `stripe-best-practices` | Reference guide for correct Stripe integration patterns. | On demand (payment work) |
| `stripe-projects` | Stripe project/setup workflows. | On demand (payment work) |
| `upgrade-stripe` | Guide for upgrading Stripe API versions and SDKs. | On Stripe version bumps |

---

## Standalone reports / one-run tools

- **GEO Schema report** — a schema/structured-data skill run once (2026-04-14); output in `reports/` (`*-schema-prod.md`, `*-schema-pre-push.md`, `*-schema-post-push.md`, `*-schema-programs-pre-push.md`). Worth re-running before/after substantive `lib/schema.ts` changes.
- **GEO Citability score** — `GEO-CITABILITY-SCORE.md` (the citability analysis taken furthest; methodology pairs with `docs/ai-optimization-checklist.md`).

---

## Automation — to be decided (not set up)

Jamie flagged several of these should run on a cadence rather than be remembered manually. That's
a separate conversation because the skills run in **Claude Code** while scheduled tasks run in
**Cowork** — so "automation" likely means a recurring nudge to run them, or porting the
fetch-and-score parts (`/audit`, schema report) into something Cowork can run directly. The
strongest candidates for a cadence: `/audit` (monthly), `security` (monthly/pre-release), and the
GEO schema report (on schema changes). Decide the mechanism before scheduling anything.
