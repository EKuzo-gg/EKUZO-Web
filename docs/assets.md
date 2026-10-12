# EKUZO Web — Asset Inventory

Full asset inventory, extracted from `CLAUDE.md` (2026-06-07). CLAUDE.md keeps a one-line
summary + pointer here. This is reference data that drifts — when in doubt, `ls` the directory.

## Videos (`public/videos/`)
- `pedagogy-hero.mp4` — Methodology page hero
- `ekuzo100-hero.mp4` — EKUZO100 page hero
- `ekuzo-teams-hero.mp4` — EKUZOTeams page hero
- `camp-hero.mp4` / `camp-hero.mov` — Camps hero
- `league-of-legends-camp.mp4` — Camps section
- (run `ls public/videos/` for the current full list)

## Testimonial videos (`public/testimonial-videos/`, 9 files)
- `becky-parent.mp4`, `brad-parent-girl-gamer.mp4`, `debbie-potter-monroe.mp4`
- `laura-hogan-mirus-academy.mp4`, `rajitha-parent.mp4`
- `student-i-learned.mp4`, `student-man-of-my-word.mp4`
- `student-thank-you-ekuzo.mp4`, `student-you-should-join.mp4`

Captions: matching `.txt` files in the same folder (for bots/SEO). **Note:** never read these
`.txt` files via `fs.readFileSync` from server code — see `learning-log.md` (it swept the MP4s
into the Netlify function bundle and broke a deploy). Inline transcripts live in
`lib/testimonialTranscripts.ts`.

## Icons (`public/icons/`, SVG, `currentColor`)
- **Black set (29):** clock, swords, book, camada, flame, flash, confidence, heart, leadership, skills, chat, handshake, trophy, handwave, speaking, confidence-2, strategy, key, roles, hard-problem, run-first, easy, youth, calendar, enthusiasm, team, visualize, key-2, swords-2
- **White set (4):** swords-white, clock-white, camada-white, trophy-white
- Served via `components/ui/Icon.tsx` from `/public/icons/[name].svg`.

## Images (`public/images/`)
Run `ls public/images/` for the full list. Key groups:
`torn-paper-*`, `brush-stroke-*`, `new torn paper/`, `pedagogy-hero-*`, `schools-*`, `parents-*`, `coaching-*`, `ekuzoteams-*`, `ekuzo100-*`, `community-*`, `home-*`, plus per-page groups.

## Fonts (`public/fonts/`)
- Tungsten Narrow (Hoefler & Co), local `.otf`: Black 900, Bold 700, Semibold 600, Medium 500.
- Inter is loaded via Google Fonts, not local.
