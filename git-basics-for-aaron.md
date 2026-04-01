# Git Basics — Quick Reference

## The Daily Workflow

Every time you sit down to work, follow this order:

**commit → pull → push**

That's it. Three commands, every time.

---

## Step by Step

### 1. Check what you changed

```
git status
```

This shows every file you've modified or added. Review the list before committing.

### 2. Stage your files

```
git add -A
```

This stages everything. If you see something in `git status` you don't want to commit, add files individually instead:

```
git add app/methodology/page.tsx components/ui/TornPaperDivider.tsx
```

### 3. Commit

```
git commit -m "Short description of what you changed"
```

Keep the message brief but meaningful. Examples:

- `"Methodology page rebuild, new torn paper system"`
- `"Red logo on schools, families, methodology"`
- `"Fix mobile hamburger border"`

### 4. Pull (get Jamie's changes)

```
git pull
```

This merges Jamie's work with yours. Since you work on different files (you're in components/pages, Jamie's in API routes), git handles this automatically. Your local work stays exactly as-is.

**What if there's a conflict?** Git will tell you. Stop and message Jamie — don't force anything.

### 5. Push

```
git push
```

Sends your committed changes to GitHub so Jamie can pull them.

---

## Will pulling overwrite my work?

No. Git is smart about this. When you pull:

- If you and Jamie edited **different files** → git merges them automatically, nothing lost
- If you edited the **same file but different lines** → git merges them automatically
- If you edited the **same lines in the same file** → git stops and warns you (merge conflict). Nothing is overwritten. You talk to Jamie and resolve it together.

**One edge case:** if you have *uncommitted* changes and try to pull, git might refuse. Solution: commit first, then pull. That's why the order is commit → pull → push.

---

## Commands at a Glance

| Command | What it does |
|---------|-------------|
| `git status` | See what files you've changed |
| `git add -A` | Stage all changes for commit |
| `git add filename` | Stage one specific file |
| `git commit -m "message"` | Save a snapshot with a description |
| `git pull` | Download and merge Jamie's latest changes |
| `git push` | Upload your commits to GitHub |
| `git log --oneline -5` | See the last 5 commits (useful to check what's been pushed) |
