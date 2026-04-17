# Git Workflow — dev vs. prod

Quick reference for working with the `dev` and `main` branches on EKUZO-Web.

Last updated: April 15, 2026

---

## Mental model

**`dev`** is the playground. Auto-deploys to `dev--ekuzo.netlify.app` — a live preview only you and Jamie use. Break things here, iterate fast.

**`main`** is production. Deploys to `ekuzo.gg` — real users see this. Only gets updated by merging `dev` into it when you're ready to ship.

---

## The one rule that matters most

**Never commit directly on `main`.**

If `git status` shows `On branch main` at the start of a work session, run `git checkout dev` before doing anything else.

---

## Daily workflow

**Start of session:**

```bash
git checkout dev
git pull origin dev
```

**Do your work, then commit and push:**

```bash
git add .
git commit -m "your message"
git push origin dev
```

**See your changes live** at `https://dev--ekuzo.netlify.app` (Netlify takes 1–3 min to deploy after a push).

---

## Seeing what's on dev vs. prod

**The single most useful command:**

```bash
git log --oneline --graph --all -20
```

Shows every branch side-by-side.
- `origin/main` = what's on ekuzo.gg (live)
- `origin/dev` = what's on the preview
- Commits above `origin/main` on the dev line = pending release

**What's on dev but NOT on prod (pending release):**

```bash
git log origin/main..origin/dev --oneline
```

**What's on prod but NOT on dev (should be empty if things are healthy):**

```bash
git log origin/dev..origin/main --oneline
```

If this ever shows commits, someone pushed directly to `main` without going through `dev` — reconcile before doing more work.

---

## Which URL runs which branch

| URL | Branch |
|---|---|
| `ekuzo.gg` | `origin/main` |
| `dev--ekuzo.netlify.app` | `origin/dev` |

Confirm in Netlify's dashboard (Deploys tab) — each deploy shows the commit SHA it was built from. Match against `git log` to know exactly what's live.

---

## Going live (dev → main)

When the preview looks right and you're ready to ship:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
```

That last `git checkout dev` is critical — puts you back on dev so your next session starts in the right place.

---

## Always know which branch you're on

```bash
git branch --show-current
```

Or just `git status` — the first line tells you.

---

## Common situations

### "I accidentally committed on main"

Don't panic. Before pushing:

```bash
# Move the commit(s) from main onto dev
git checkout dev
git merge main
git push origin dev

# Reset main back to match origin
git checkout main
git reset --hard origin/main
git checkout dev
```

If you already pushed to main, talk to Jamie before doing anything — it's recoverable but needs care.

### "git pull says divergent branches"

```bash
git pull --no-rebase
```

This creates a merge commit. If there's a conflict, fix the file(s), then:

```bash
git add <file>
git commit -m "Merge conflict resolved"
git push origin dev
```

### "push rejected (non-fast-forward)"

Someone else pushed while you were working. Pull their changes first:

```bash
git pull --no-rebase
git push origin dev
```

### "I'm mid-merge and stuck"

Check status:

```bash
git status
```

To back out and start over:

```bash
git merge --abort
```

To finish the merge (after resolving any conflicts):

```bash
git add <conflicted-files>
git commit -m "Merge message"
```

---

## File ownership reminder

To minimize conflicts:

- **Aaron:** `components/`, `app/*/page.tsx`, `app/globals.css`, `public/images/`, `public/icons/`
- **Jamie:** `app/api/`, `.env.local`, `context/`, commerce logic
- **Shared:** `CLAUDE.md`, `WORKLOG.md`, copy text, `components/ui/Button.tsx`, `components/ui/ModalButton.tsx`

If you need to touch the other's area, message first. Git auto-merges changes to different files — conflicts only happen when both edit the same lines in the same file.
