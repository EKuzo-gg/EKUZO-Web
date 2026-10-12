# EKUZO Web — Dev Runbook

Operational runbooks extracted from `CLAUDE.md` (2026-06-07). CLAUDE.md keeps the three core
dev commands inline and points here for the step-by-step procedures: local payment testing,
build-cache / large-binary troubleshooting, and the git branch workflow.

Contents:

1. [Core dev commands](#core-dev-commands)
2. [Local payment testing (Stripe webhooks)](#local-payment-testing-stripe-webhooks)
3. [Troubleshooting](#troubleshooting)
4. [Git workflow](#git-workflow)

---

## Core dev commands

```bash
# Start dev server
~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/next dev

# TypeScript check
~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/tsc --noEmit

# Build (note: Turbopack/PostCSS issue in prod build - investigate before deploy)
~/.nvm/versions/node/v24.14.0/bin/node node_modules/.bin/next build
```

Node: `~/.nvm/versions/node/v24.14.0/bin/node`.

---

## Local Payment Testing (Stripe webhooks)

When testing payments locally, Stripe needs a way to reach your machine. The Stripe CLI bridges this. You need **two terminal tabs** running side by side:

**Tab 1 — Stripe webhook forwarding:**
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```
This prints a webhook signing secret (`whsec_...`). Copy it into `.env.local` as `STRIPE_WEBHOOK_SECRET` (only needed once — it stays the same until you log out of Stripe CLI).

> **Production webhook:** the Stripe CLI secret is for local forwarding only. For production, create a webhook endpoint in the **Stripe Dashboard** (pointing at the deployed `/api/webhooks/stripe`) and use the `whsec_...` it generates as the production `STRIPE_WEBHOOK_SECRET`.

**Tab 2 — Dev server:**
```bash
cd ~/Desktop/EKUZO/Projects/EKUZO-Web && npx next dev -p 3001
```

**Test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

**What happens on a successful test payment:**
1. Stripe sends `payment_intent.succeeded` → Stripe CLI forwards it to `localhost:3001/api/webhooks/stripe`
2. Webhook writes gamer data to Google Sheets (ekuzo-purchases, squads, squad_members tabs)
3. Webhook writes profile properties to Klaviyo (gamer name, camp week, squad link, etc.)
4. Browser redirects to `/programs/ekuzo-camps/success?payment_intent=pi_xxx&redirect_status=succeeded`

**First-time setup (one-time):**
```bash
brew install stripe/stripe-cli/stripe   # install
stripe login                             # authenticate via browser
```

**Troubleshooting:**
- `Invalid API Key` → check `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local` start with `sk_test_` and `pk_test_`
- `ERR_CONNECTION_REFUSED` on redirect → check `NEXT_PUBLIC_SITE_URL` in `.env.local` matches your dev server port (should be `http://localhost:3001`)
- `Webhook signature verification failed` → the `STRIPE_WEBHOOK_SECRET` in `.env.local` doesn't match. Copy the `whsec_` value from the `stripe listen` output and restart the dev server.
- Webhook fires but nothing lands in Sheets/Klaviyo → check the terminal running `stripe listen` for response status codes. 200 = success, 400/500 = check the dev server terminal for error logs.

---

## Troubleshooting

### "Cannot find module" / "ENOENT build-manifest.json"
Turbopack's build cache gets corrupted when lots of files change in one session. Fix it with these 3 steps:

```bash
# Step 1: Stop the dev server
# Press Ctrl+C in the terminal where it's running

# Step 2: Delete the stale build cache
rm -rf .next

# Step 3: Restart the dev server (rebuilds everything fresh)
npx next dev -p 3001
```

**When does this happen?** Usually after rapid edits to shared components (Nav, Footer, layout files) that are imported on every page. The compiled chunks get out of sync.

**One-liner (stop server first with Ctrl+C, then paste this):**
```bash
cd ~/Desktop/EKUZO/Projects/EKUZO-Web && rm -rf .next && npx next dev -p 3001
```

**How to avoid it:** Restart the dev server every so often during heavy editing sessions. If you see any weird "module not found" errors, it's almost always this.

### Cowork (Claude) + git on this repo
<!-- Added 2026-07-15 from knowledge-base system/loops/lessons-pending/2026-07-15-sandbox-git-is-read-mostly.md (learning loop 2026-W29, mid-week run) -->

Claude's sandbox can read the repo and stage/commit, but the mount can't delete git lock files — every write op strands locks (`.git/index.lock`, `.git/HEAD.lock`, `tmp_obj_*` under `.git/objects/`) that block the next git command until removed by hand. Division of labor: Claude prepares (status, diff, staging list, commit message, WORKLOG entry); checkout/merge/push run in Jamie's terminal — a SEPARATE tab from `npm run dev` (commands pasted into the dev-server tab go into the log stream and never run). If git complains about a lock: check its timestamp; a stale 0-byte lock from a crashed op is safe to `rm`. Read-only git (status, log, diff) from the sandbox is safe and fast only with `GIT_OPTIONAL_LOCKS=0` (e.g. `GIT_OPTIONAL_LOCKS=0 git status`): plain `git status` refreshes the index and strands `.git/index.lock` on this mount. <!-- Amended 2026-09-28 from knowledge-base/system/loops/lessons-pending/_archive/2026-09-28-git-optional-locks-for-read-only-git.md (approved live by Jamie, KB inbox-review session) --> Compounding hazard: two concurrent Claude sessions writing this repo plus a mount that can't clean locks is how the 2026-07-15 stale `index.lock` collision happened — one writer per repo at a time.

### Building and deploying from a Cowork sandbox
<!-- Added 2026-07-19 from knowledge-base system/loops/lessons-pending/2026-07-15-cowork-sandbox-next-build-runbook.md (learning loop 2026-W29, Friday close) -->

- **SWC binary:** node_modules come from the Mac; the sandbox is linux/arm64. Run `npm install --no-save @next/swc-linux-arm64-gnu` once per session (`--no-save` keeps package.json and the lockfile untouched). A different sandbox arch needs the matching `@next/swc-*` package.
- **.next deletions:** the mount blocks file deletion by default and the build must clear `.next`. Have Claude request delete permission via its allow-file-delete tool; don't fight EPERM with workarounds.
- **Don't shadow-copy the repo with a symlinked node_modules** to dodge the above: Turbopack hard-fails on symlinks that point outside the project root.
- **Pushes are Jamie's.** The sandbox has no GitHub credentials; Claude commits locally and hands Jamie the push commands. Skip hooks with `--no-verify` only when git-lfs is missing AND the commit contains no LFS-tracked binaries — binaries never get committed from the sandbox (it sees smudged LFS files as modified).
- **Prod deploy without touching the working tree:** only when main is an ancestor of dev (check `git merge-base --is-ancestor origin/main origin/dev`), `git push origin dev:main` fast-forwards main remotely. Since the Season 01 launch it is not (see "Releasing when dev carries work main must not get" below). No checkout, no stash, safe with a dirty tree.

### Cowork CLOUD sessions: git quirks
<!-- Added 2026-07-25 from knowledge-base system/loops/lessons-pending/2026-07-23-cowork-cloud-git-lock-and-push-handoff.md (learning loop 2026-W30). Extends the two sandbox sections above; applies to cloud Cowork sessions only — on-device Cowork and Aaron's local Claude Code have normal filesystem and network semantics. -->

Cloud Cowork sessions run git through a sandboxed VM that cannot delete files or reach the network. Three consequences:

1. **Lock litter.** Every git write leaves index.lock / HEAD.lock / tmp_obj_* files it cannot unlink. Fix: `mv` them into `_to_delete/` between git commands (renames work; deletes don't). A commit failing on "index.lock: File exists" usually means a stale lock from a prior session — check its mtime, then mv it away. Delete the repo's `_to_delete/` folder from a real terminal afterwards.
2. **Push is a handoff.** fetch/push fail with a proxy 403. Commit locally in the session, then run the push from a human terminal. Note origin/* refs are only as fresh as the last human-run fetch — a stale origin/main does NOT mean unshipped work (that misread nearly changed a branch strategy on 2026-07-23).
3. **Shared files with queue edits.** To commit a new WORKLOG entry without sweeping in uncommitted hunks from another workstream: build the intended committed version from `git show HEAD:WORKLOG.md`, then `git hash-object -w` it and stage with `git update-index --cacheinfo 100644,<hash>,WORKLOG.md`. The working tree keeps both; the commit carries only yours.

### Large Binaries — Git LFS + Pre-Commit Hook

**Tracked via LFS:** `*.mp4`, `*.mov`, `*.webm`, `*.riv` (see `.gitattributes`). New files matching these patterns route through Git LFS automatically when staged.

**Pre-commit hook:** `.husky/pre-commit` blocks any commit containing a file larger than 10MB that isn't LFS-tracked. Activated automatically by `npm install` (the `prepare: husky` script). If you see `BLOCKED: {file} is {N}MB` on commit, you have two options:

1. **Route the file through LFS** (preferred for videos, animations, or any large binary asset):
   ```bash
   git lfs track "*.{ext}"      # e.g. git lfs track "*.glb"
   git add .gitattributes
   git add path/to/file.{ext}
   git commit
   ```
   The hook will skip LFS-tracked files because their staged content is a tiny pointer, not the binary.

2. **Serve the file externally** (preferred for anything the browser loads at runtime — host on a CDN, S3, or the Netlify static asset layer). Delete the local copy before committing.

**What NOT to do:** don't `--no-verify` past the hook. The 10MB cap is there because Netlify's serverless function bundle limit is 50MB and one stray 20MB asset swept in by Next.js file tracing can break a production deploy (see the `fs.readFileSync` entry in `learning-log.md`).

**Verifying the setup after a fresh clone:**
```bash
git lfs install         # hooks LFS into this clone
git lfs track           # lists the 4 tracked patterns
cat package.json | grep prepare   # confirms husky prepare script
ls .husky/pre-commit    # confirms hook exists and is executable
```

**Forward-looking only:** this setup does NOT migrate existing files into LFS. Historical MP4s and RIVs that were committed before this setup stay as-is. New files of tracked extensions go through LFS automatically; a migration pass can be done later if the `.git` directory grows unmanageable.

---

## Git workflow (updated April 8, 2026)

Two branches with Netlify deploys:
- **`dev`** — day-to-day work branch. Both Aaron and Jamie push here. Netlify auto-deploys to `dev--ekuzo.netlify.app` (preview URL).
- **`main`** — production branch. Deploys to `ekuzo.gg` (live site). Only updated by merging `dev` into `main`.

**Daily rules:**
1. `git checkout dev` — always work on dev, never push directly to main
2. `git pull origin dev` before starting work
3. Tell each other before working (Slack/text) so you don't edit the same file
4. Commit and push to `dev` when done
5. Check the dev preview URL to confirm changes look right
6. If you get a merge conflict, stop and talk — don't force push

**To go live (merge dev → main):**
```bash
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
```

### Releasing when dev carries work main must not get
<!-- Added 2026-10-11, approved by Jamie in knowledge-base session 2026-10-11-s1-popup-attribution-fix ("i agree, make your changes"). -->

Since 2026-10-10, `dev` carries files that must not ship to production (the roadshow pages under
`public/roadshow/` and the Season 01 ad images under `public/ads/season1/`), and `main` has its own
release commits. Neither branch is an ancestor of the other, so `git merge dev` and
`git push origin dev:main` would ship the dev-only files. Release a change by cherry-picking it:

1. Commit on `dev` and push dev.
2. Check the change on the dev deploy (`dev--ekuzo.netlify.app`), including the human phone check
   for anything a visitor taps or types. Push main only after it passes. On 2026-10-11 dev and main
   were pushed together, and the phone check found a `form_start` bug on production instead of on dev.
3. Make a release branch from `origin/main` (a worktree keeps a dirty checkout untouched), then
   `git cherry-pick <dev commit>`. Drop files that exist only on dev (for example
   `docs/season1-launch/notes-for-aaron.md`) with `git rm` and `git cherry-pick --continue`.
4. Confirm the app code matches the tested dev commit:
   `git diff --quiet HEAD <dev commit> -- app lib components && echo identical`.
5. Push it: `git push origin <release-branch>:main` (a fast-forward of main).

**Pushes go through Jamie's terminal.** Neither Claude's cloud workspace nor the shell on Jamie's
computer has GitHub write access to EKuzo-gg, so Claude prepares the commits and hands over the
push commands. Installing the Claude GitHub App on the org
(https://github.com/apps/claude/installations/select_target) would let Claude push; the go/no-go
for main stays Jamie's either way.

**Preventing overwrites:** Aaron works in `components/` and `app/*/page.tsx`; Jamie works in `app/api/` and `context/`. Git auto-merges changes to different files — conflicts only happen when both edit the same lines in the same file. If either needs to touch the other's area, communicate first.
