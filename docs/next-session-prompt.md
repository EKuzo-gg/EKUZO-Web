# Next Session Prompt

Paste this into a new Claude Code session opened in /Users/jamiefitch/Projects/ekuzo-web.

---

You are picking up an ongoing Next.js build for EKUZO (ekuzo.gg), a youth esports
coaching platform. Read these files before doing anything else:

1. /Users/jamiefitch/Projects/ekuzo-web/CLAUDE.md — full project context
2. /Users/jamiefitch/Projects/ekuzo-web/Global Context Files/about-me.md
3. /Users/jamiefitch/Projects/ekuzo-web/Global Context Files/working-style.md

Once read, this session has two phases. Complete Phase 1 fully before touching any code.

---

## PHASE 1 — DATA RECOVERY (do this first, no exceptions)

The Framer MCP data from our last session was not saved to disk. We need to recover it.

**Step 1:** Start the dev server so it's running in the background.
`~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/next dev`

**Step 2:** Reconnect the Framer MCP plugin.
- Open https://framer.com/projects/EKUZO-Development-copy--aPeMudXJOotFDscfsQbK-ca3Db in Chrome
- Press Cmd+K in the canvas (not CMS view) and search for MCP plugin
- Confirm connection, then proceed

**Step 3:** Pull and IMMEDIATELY write to disk (create /docs/cms/ folder):
- All FAQ items (16) → docs/cms/faqs.md (question + answer for each)
- All Blog posts (2) → docs/cms/blog.md (title, slug, content, author, category)
- Blog Categories + Blog Author schemas → append to docs/cms/blog.md
- Videos CMS (9 items) → docs/cms/videos.md (title, slug, file name, rank)

**Step 4:** Pull page-level copy for any pages not yet built and save to docs/pages/:
- /programs → docs/pages/programs.md
- /parents → docs/pages/parents.md
- /schools → docs/pages/schools.md
- /ekuzo100 → docs/pages/ekuzo100.md
- /ekuzoteams → docs/pages/ekuzoteams.md
- /about → docs/pages/about.md

Use the Chrome MCP to scroll through each live page at ekuzo.gg if Framer MCP
is unavailable. Extract all copy and section structure. Save it. Do not skip this.

---

## PHASE 2 — VISUAL AUDIT

The site is running at localhost:3001. It loads but looks broken.

**Step 1:** Use the Chrome MCP preview tool to view each existing page at localhost:3001.
For each page, compare against ekuzo.gg. Document what's broken:

| Page | What's wrong | Priority (fix now / fix later) |
|------|-------------|-------------------------------|

**Step 2:** Fix anything tagged "fix now" in these categories only:
- Global: Nav, Footer, modal system, global styles
- Typography: font loading, sizes, weights
- Layout: sections stacking wrong, gaps between sections

**Step 3:** Do NOT start building new pages this session. Foundation first.

**Stop when:** all "fix now" issues are resolved and existing pages look structurally
correct at 1440px desktop. Screenshot and confirm with Jamie before moving on.

---

## Notes
- Node path: `~/.nvm/versions/node/v24.14.0/bin/node`
- Framer reference: https://ekuzo.gg (live site for visual QA)
- Camps page is the first new build after foundation is clean
- Commerce (Stripe Elements + Make.com) is Phase 5, do not touch yet
- When in doubt: simplest solution, smallest scope, ship something testable
