# learning-log.md
Purpose: Track patterns in preferences, feedback, and AI behavior to improve system over time

## How to Use

- Capture repeated feedback or friction points
- Focus on patterns, not one-off issues
- Use this to propose updates to context files

<Prompt from the user to the LLM:

Before we wrap, do you see any patterns in my preferences or your behavior that we should capture in the learning log?

Then:

If so, propose updates. Don’t apply them.>

---

## Entries

### Date:
### Context:
(What were you working on?)

### Observation:
(What did the AI do that felt off or particularly good?)

### Pattern (if applicable):
(Is this happening repeatedly?)

### Proposed Update:
(What should change in about-me.md, working-style.md, or brand-voice.md?)

### Decision:
(Approved / Not approved / Needs refinement)

---

## Notes

- Only promote changes after seeing consistent patterns
- Prefer small, precise updates over large rewrites

---

### Date: 2026-03-24
### Context:
Long session pulling Framer MCP data (pages, layers, assets, CMS), building modal system, saving icons/videos, and writing CLAUDE.md.

### Observation:
Framer MCP data (page XML, CMS collections, layer trees) was only retained in conversation context, not written to disk. When context compressed, that data was lost. Only physical assets (SVGs, images, videos) and built code survived.

### Pattern:
Any data pulled from external tools (Framer MCP, Figma MCP, scraped content) needs to be immediately written to a markdown file in `/docs/` or the project root. Don't assume conversation context will persist it.

### Proposed Update:
At the start of any session involving MCP data pulls, create a `/docs/framer-data/` or `/docs/cms/` folder and write pulled content to named markdown files before moving on. Specifically: FAQ items → `docs/cms/faqs.md`, Blog posts → `docs/cms/blog.md`, page copy → `docs/pages/[page-name].md`.

### Decision:
Approved — apply this pattern next session.
