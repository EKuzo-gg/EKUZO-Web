# Atlas results 2

## tsc
```
(exit 0; no output = clean)
```

## build tail
```
├ ○ /swamp
├ ○ /teams
├ ○ /terms-of-service
└ ○ /woodward


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand


 40M	.next/server
```

## git log --oneline -8
```
a545546 feat(links): FAQ related-reading lines, page-to-post links, card swaps per approved copy 3
135f529 content(blog): League post updated per approved copy 4 (changes 1-11, 13)
5201bff content(blog): homeschool review retitled and revised per approved copy 2
3cd3f95 content(blog): homeschool guide rebuilt per approved copy 1
5134d9a feat(blog): shared ProgramLine component
f64f2ec feat(blog): byline shows a single Updated date; cards match the post date
2a12a3b docs(blog-refresh): Atlas evidence
fb882e0 feat(authors): Jamie Fitch is an advisor to EKUZO; author page copy from the approved file
```

## git status --porcelain (after last code commit)
```
?? docs/blog-refresh-2026-10/00-scout-map.md
?? docs/blog-refresh-2026-10/01-requirements.md
?? docs/blog-refresh-2026-10/02-frozen-spec.md
?? docs/blog-refresh-2026-10/03-decision-log.md
?? docs/blog-refresh-2026-10/copy/
?? docs/blog-refresh-2026-10/evidence/atlas/results-2.md
?? docs/blog-refresh-2026-10/evidence/camps-guide-research.md
?? docs/blog-refresh-2026-10/evidence/leaguepedia-faith.md
?? docs/blog-refresh-2026-10/evidence/steward/
```

## protected diff vs origin/main (must be empty)
```
```

## em/en dash in added lines
```
393:+- [When your son's only friends are online](https://ekuzo.gg/blog/when-your-sons-only-friends-are-online): Jamie Fitch's (EKUZO advisor and parent) perspective piece on whether a son's online gaming friends are real, and whether gaming is isolating or connecting him. Argues the question is not online versus offline but alone versus together — the same hours produce opposite outcomes depending on whether he plays with the same people on a team or grinds alone in an anonymous lobby. Covers the boy-specific friendship recession, why heavy solo play is often the symptom rather than the cause, the three features that turn solo play into belonging (the same people repeatedly, a reason to come back, an adult actually in the room), and where a coached team fits. Includes a parent video testimonial and a six-question FAQ (are online gaming friends real, is gaming isolating or connecting him, how to help a gamer kid make friends, should I take the games away, my son has no friends and only games, are esports teams good for shy or bullied kids). Cites Harvard 2025, Pew 2024 and 2025, Stanford (Peña & Hancock 2006), and a 2025 community-gaming loneliness study.
394:+- [Should homeschool kids play video games? 200+ parents weigh in](https://ekuzo.gg/blog/what-homeschool-parents-taught-us-about-gaming): A case-study reading of a 200+ parent homeschool thread on kids and gaming. Sorts the responses into three camps — cut it off (60%), set limits (30%), aim it (10%) — with the language each camp uses, which games worried parents (Fortnite, Roblox) and which did not (Minecraft), and the single structured, social, supervised version of gaming all three camps are really asking for. Companion case study to the homeschool gaming pillar piece.
(end)
```

## Same check scoped to this task only (2a12a3b..HEAD)
```
287:+- [Should homeschool kids play video games? 200+ parents weigh in](https://ekuzo.gg/blog/what-homeschool-parents-ta
```

Explanation: one hit in this task's scope, the review's public/llms.txt line. I changed only the title at the start of that line; the existing description (cut it off (60%) etc., with its em dashes) is untouched but the whole line shows as added. In the full origin/main diff the extra hit (the when-your-sons llms.txt line) comes from an earlier task's commit, not this one. No em or en dash was typed in any new text.
