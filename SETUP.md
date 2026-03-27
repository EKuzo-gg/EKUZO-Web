# EKUZO Web — Developer Setup

## Prerequisites

- **Node.js 20+** (recommend using [nvm](https://github.com/nvm-sh/nvm))
- **npm** (comes with Node)
- **Git**

## 1. Clone the repo

```bash
git clone https://github.com/JamieFATX/EKUZO-Web.git
cd EKUZO-Web
```

## 2. Install dependencies

```bash
npm install
```

## 3. Add large media files (not in git)

Jamie will send a zip called `ekuzo-media.zip`. Unzip it into the project root — the folder structure inside matches what the project expects:

```
public/videos/           (3 hero videos, ~46MB)
public/testimonial-videos/  (9 testimonial videos + caption .txt files, ~418MB)
public/animations/       (3 Rive files, ~15MB)
```

Without these the site will still run — you'll just see broken videos/animations.

## 4. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in Stripe keys if working on checkout. For front-end QA, leave as-is — the site runs fine without them.

## 5. Run the dev server

```bash
npx next dev -p 3001
```

Site will be at **http://localhost:3001**

## 6. Git workflow (Jamie + Aaron)

We're the only two working in this repo. Simple rules:

1. **Always work on `main`.** No feature branches for now.
2. **Pull before you start.** `git pull` every time you sit down to work.
3. **Commit often, push when done.** Small commits with clear messages.
4. **Tell each other when you're working.** Quick Slack/text so we don't edit the same file at the same time.
5. **If you get a merge conflict**, talk before resolving — don't force push.

```bash
# Start of work session
git pull

# After making changes
git add .
git commit -m "description of what changed"
git push
```

**Ownership split:**
- **Aaron** — front-end: visual QA, CSS, layout, component builds, design fidelity
- **Jamie** — orchestration: commerce (Stripe), form routing (Beehiiv/Make), API routes, data flow

Both may make copy updates. Communicate before touching the other's area.

## 7. Reference

- **Live Framer site (production reference):** https://ekuzo.gg
- **Project context & architecture:** see `CLAUDE.md`
- **Framer extraction docs:** see `docs/framer/`
- **Page status & build queue:** see `CLAUDE.md` → Page Status section
