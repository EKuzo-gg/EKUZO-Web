# EKUZO Brand → Claude Code handoff

This bundle **documents** how the live `EKUZO-Web` site is built, as a reference Claude Code can read when it builds **new** pages — so new work matches the existing structure.

> **The website is the source of truth. This includes; it does not overtake.** It is a guide for **new** work only. Where the code and this doc differ, the code wins. **Never** use it as a reason to fix, refactor, or retrofit existing code — in particular the torn-paper seams and the color-flipping nav are working as intended and must be left alone. The guide is also a **partial, in-progress draft — not definitive.**

## What's inside

- **`EKUZO-BRAND.md`** — the drop-in ruleset. Canonical page skeleton, color-band rhythm, torn-paper seam sequence, the standard section shell, component reference (Eyebrow / Button / CircleIcon / FooterBanner / notched cards / Nav / Footer), type rules, voice, and a new-page checklist. Written in the codebase's own Tailwind/React idiom and grounded in `app/globals.css` + `components/`.
- **`README.md`** — this file.
- **`globals-colors-snippet.css`** — the expanded-palette tokens (working draft). Paste into the `@theme inline` block in `app/globals.css` to adopt them; Tailwind v4 generates the `bg-*`/`text-*`/`border-*` utilities automatically.

## How to install it (pick one)

**A. Make it automatic (recommended).** Copy `EKUZO-BRAND.md` into the repo and reference it from the project's `CLAUDE.md` so every Claude Code session loads it:

```bash
cp EKUZO-BRAND.md docs/EKUZO-BRAND.md
```

Then add to `CLAUDE.md` (top of the file):

```markdown
## Brand & page structure
When building a NEW marketing/site page, read `docs/EKUZO-BRAND.md` and match the patterns it documents.
The live codebase is the source of truth — that doc describes it, it does not override it. Do NOT
refactor or "fix" existing working pages (especially torn-paper seams and the color-flipping nav) to match it.
```

**B. As a Claude Code skill.** Drop it in `.claude/` (e.g. `.claude/skills/ekuzo-brand.md`) if you organize guidance as skills.

**C. Ad hoc.** Paste `EKUZO-BRAND.md` into a Claude Code prompt when you start a page: "Follow this brand structure," then describe the page.

## Fidelity

This is a **high-fidelity reference document** describing the live site, not throwaway code. The values (hex, spacing clamps, type scale, clip-paths, seam transforms) are lifted from the live `EKUZO-Web` source. Where the codebase and older tokens disagree, §10 flags it and names the winner (**the shipped code, always**).

## Keeping it current

This is a **living document** — expected to be updated as EKUZO evolves, not a one-time drop. As the site changes, values change, or drafts (like the expanded palette) go live, update `EKUZO-BRAND.md`: correct the value, promote the draft out of "working draft," or add a new section, then bump **Last updated** and add a changelog line (§11). The code stays the source of truth; the doc follows it. If you keep it in the repo (option A), it versions with the code in git like any other file.

## Not included (intentionally)

- **Tokens / components** — they already live in your repo (`app/globals.css`, `components/`). This doc tells Claude Code how to *compose* them; it doesn't duplicate them (duplication would just drift).
- **Fonts** — Tungsten Narrow ships in `public/fonts/` and is **preview-licensed**; secure a production license before public launch.

## The interactive brand guide

A visual companion — the scrollable **EKUZO Brand Guide** — lives in the design project (`EKUZO Brand Guide.dc.html`). It renders every rule in this doc as live specimens. Ask for a standalone HTML export or screenshots if you want it alongside this bundle.
