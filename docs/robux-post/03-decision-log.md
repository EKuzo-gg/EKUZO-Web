# Robux post: decision log (most overrulable first)

Run 1 of `knowledge-base/system/loops/handoffs/2026-10-24-ship-robux-and-session-end-posts.md`, 2026-10-26. PM: Claude (Build Loop). Gates answered live by Jamie in the session.

| # | Decision | Why | Who |
|---|---|---|---|
| D1 | Both tables sit together after the first paragraph of "What her $20 actually buys", so the ledger shows her spending before "What she did with it" tells it | The handoff says "after the first paragraph" for the table; moving the ledger lower is a one-line move if Jamie prefers | Claude |
| D2 | Hero = the photo Jamie pasted in the session (grey T-shirt, saved as `robux-hero-source-2026-10-26.png`), not the 10-25 file on disk (green hoodie, a different shot) | Jamie: "i've updated the image header" | Jamie |
| D3 | Hero exported at 1916x809 (the 1232x520 ratio at the source's full resolution) rather than 1232x520 | Sharper on 2x screens; the frame is object-cover at 520px tall either way | Claude |
| D4 | Blurred three spots in the hero (runway banner text, bottom-left buttons, top-left icons) with a feathered mask; the star bar and avatar stay sharp | Handoff: blur the image-tool text; hard-edged boxes looked edited | Claude |
| D5 | Updated date bumped to 2026-10-26 on the four posts that got an inbound sentence, plus their /blog and author-page cards and sitemap lastmod; /parents sitemap lastmod too | Each got a new sentence; the card dates follow DATE_MODIFIED by the file's own rule | Claude |
| D6 | The gaming-study post lost the word "recent" but keeps its 2026-10-12 dates | A one-word removal is not a content update | Claude |
| D7 | Robux post sitemap priority 0.7 | It carries the featured slot, same rule the Fortnite post used | Claude |
| D8 | Meta description: option A (157 characters) | Jamie: "That looks good" to the gate message recommending A | Jamie |
| D9 | Two copy edits: the reporting line generalized ("Roblox sends activity updates and a notice when money is spent."), and the FAQ ends "vs let them buy in the app." Copy of record updated to match | Jamie's answers to the Steward questions, 2026-10-26 | Jamie |
| D10 | "ask one of our coaches" keeps pointing at /parents, which has no contact form | Jamie: "i think that's fine" | Jamie |
| D11 | Ledger table "About" column left as is | It already shows dollar signs ($8, $3, $9); Jamie asked for one only if it would help | Claude |
| D12 | The llms.txt blog index line lost its em dash in the same edit (copy debt item 8) | One-character fix in a line already being touched | Claude |
| D13 | Source URLs in the Sources list wrap anywhere (`[overflow-wrap:anywhere]` on the anchors, this page only) | Sentry D2: five URLs were clipped at 375px; the shared BlogContent styles are Aaron's lane | Claude |
| D14 | Build and QA ran in Claude's cloud workspace from a tarball of the worktree (no `.env.local`; fake third-party keys); Jamie's Mac checkout was not built | The device shell is a Linux VM and the repo's node_modules are macOS builds | Claude |

Accepted, not fixed:
- Sentry D1: the byline rail shows Updated only (template-wide).
- Sentry D3 and the torn-paper 404: local-only (paths with spaces under `next start` here; 200 on production), and `public/testimonial-videos` is gitignored.
- VIP Monthly (299) not re-read on ship day; the in-game store needs a signed-in session. The FAQ already says prices change.
- The AI-optimization checklist's 134 to 167 word "lead with the answer" target: Jamie's short answer is about 60 words; his copy is final.
