# Dev-integration runbook (Slice 3), tested 2026-11-09

Goal: put `build/s1-cls-field` on `dev` as a fast-forward of `origin/dev`, with dev's own files kept and no code difference from the build branch. Tested end to end except the push (nothing was pushed). Wall time of the tested sequence: about 1 minute, plus the clone's lazy blob fetches.

Rehearsal result: build tip `1e603a7` + `origin/dev` `d11a269` -> merge commit `b03585a` in the rehearsal clone (`<scratchpad>/mt`, branch `preview/s1-cls-field-dev`). `git diff --quiet 1e603a7 HEAD -- app lib components scripts public/images` printed `identical`. `git diff --name-only 1e603a7 HEAD` lists 78 paths: `WORKLOG.md`, 30 under `public/ads/season1/`, `public/review.html`, 46 under `public/roadshow/`. `git merge-base --is-ancestor origin/dev HEAD` is true.

Differences from the ops lens recipe, found in the rehearsal:

- Merge direction here is build-into-dev's-opposite: we start from the build branch and merge `origin/dev` in, so the conflict markers say `<<<<<<< HEAD` / `>>>>>>> origin/dev` (not `origin/main`).
- Main's deletions do not show as staged `D` in this direction (dev did not touch them), so the "58 staged deletions" step is replaced by restoring whole directories from `origin/dev`. That restores 77 files (30 + 1 + 46), not 60: 17 of them are dev-only additions (for example `d19` to `d21` ad jpgs) that the merge would bring anyway; the checkout is harmless for them.
- Exactly three conflicts, as predicted: `WORKLOG.md`, `public/roadshow/ad-lab.html`, `public/roadshow/index.html` (modify/delete). Anything else is a stop.

## Run it (Fable)

Needs: a clone with network to GitHub (a full or blobless clone both work; the rehearsal used a blobless one), `user.name`/`user.email` set, nothing uncommitted. Run in a clone that is NOT a working worktree of the run. Replace `$TIP` if the final build tip is a local commit that has not been pushed: push `build/s1-cls-field` first, or `git fetch <path-to-repo> build/s1-cls-field:refs/remotes/origin/build/s1-cls-field`.

```bash
set -e
cd <integration-clone>                      # rehearsal: /tmp/claude-0/-home-claude/cac98b32-16dd-5200-9796-19cc82c22d7f/scratchpad/mt
git config user.name "Jamie Fitch"; git config user.email "jamie@ekuzo.gg"

# 0. Refs and sanity. dev must still be d11a269 or the recipe needs a fresh look.
git fetch origin
git status --short | head -3                # expect nothing; if it lists staged deletions run: git reset -q --hard HEAD
git rev-parse origin/dev origin/main origin/build/s1-cls-field
test "$(git rev-parse origin/dev)" = d11a269c1766a456b761fc8157272fca833210a5 || echo "NOTE: dev moved, re-check the conflict list in step 2"
git merge-base --is-ancestor origin/main origin/dev && echo "STOP: dev already has main"
TIP=origin/build/s1-cls-field
git ls-tree -r --name-only $TIP -- public/ads/season1 public/review.html public/roadshow | wc -l   # expect 0

# 1. Integration branch from the build tip.
git checkout -B preview/s1-cls-field-dev $TIP

# 2. Merge dev, no commit. Exit code 1 is expected.
git merge --no-ff --no-commit origin/dev || true
git diff --name-only --diff-filter=U | sort   # expect exactly: WORKLOG.md, public/roadshow/ad-lab.html, public/roadshow/index.html

# 3. Restore every dev-only file from origin/dev (takes dev's ad-lab.html and index.html too).
git checkout origin/dev -- public/ads/season1 public/review.html public/roadshow

# 4. WORKLOG keeps both sides (the stray ">>>>>>> Stashed changes" line is old litter on both branches; leave it).
sed -i -e '/^<<<<<<< HEAD$/d' -e '/^=======$/d' -e '/^>>>>>>> origin\/dev$/d' WORKLOG.md
grep -c -E '^(<<<<<<<|=======|>>>>>>> origin)' WORKLOG.md || true   # expect 0
git add WORKLOG.md
git diff --name-only --diff-filter=U | wc -l                       # expect 0

# 5. Proof before committing.
git diff --cached --name-only $TIP | sed -E 's#^(public/roadshow/|public/ads/season1/|public/review\.html$|WORKLOG\.md$).*#\1#' | sort | uniq -c
#   expect only those four groups: WORKLOG.md 1, public/ads/season1/ 30, public/review.html 1, public/roadshow/ 46
git diff --cached --name-only origin/dev | grep -E '^(public/roadshow/|public/ads/season1/|public/review\.html$)' && echo "STOP: dev-only file changed"
git commit -m "Merge origin/dev into build/s1-cls-field for the dev deploy test (dev-only roadshow, ad and review files kept)"
#   (a clone with husky installed runs the 10 MB pre-commit hook here; never --no-verify)

# 6. The code-identical proof, then the fast-forward check.
git diff --quiet $TIP HEAD -- app lib components scripts public/images && echo identical    # must print "identical"
git merge-base --is-ancestor origin/dev HEAD && echo "ff ok"                                  # must print "ff ok"

# 7. Legacy webhook guard arrived (O-16).
grep -n "shouldSkipLegacy" app/api/webhooks/stripe/route.ts       # expect the import line and the call (about lines 6 and 59)

# 8. Optional build/test gate (a failed dev build leaves the old deploy published, O-6).
# npm ci --no-audit --no-fund && STRIPE_SECRET_KEY=sk_test_placeholder npm run build && npm test

# 9. Push, only as a fast-forward of dev. Stop if dev moved since step 0.   <-- needs Jamie's/Fable's go; NOT run in rehearsal
git fetch origin
test "$(git rev-parse origin/dev)" = d11a269c1766a456b761fc8157272fca833210a5 || { echo "STOP: dev moved, redo from step 0"; exit 1; }
git merge-base --is-ancestor origin/dev HEAD && git push origin HEAD:dev

# 10. Post-deploy marker check. Netlify builds the pushed merge commit, so the marker is its sha.
SHA=$(git rev-parse --short=7 HEAD)
for i in $(seq 1 30); do curl -s https://dev--ekuzo.netlify.app/season1 | grep -q "name=\"s1-build\" content=\"$SHA" && echo "deployed $SHA" && break; sleep 30; done
curl -s https://dev--ekuzo.netlify.app/season1 | grep -o 'name="s1-build" content="[^"]*"'
curl -sI https://dev--ekuzo.netlify.app/season1 | grep -i -E '^(age|cache-status|http|x-nextjs-date)'
```

Notes:

- If Atlas's marker is not in the tip, step 10 finds nothing. Fallback: compare `curl -s .../season1 | sha256sum` with a local `next start` body of the same commit (OR8). Before the first push the dev page carries no marker (checked 2026-11-09 16:32 UTC).
- The marker's exact format comes from `route.ts` (COMMIT_REF may be the full 40 characters); the grep above is a prefix match on the 7-character sha, which works for both.
- Pushing `dev` triggers a Netlify branch deploy on `dev--ekuzo.netlify.app`; no write to Stripe, Klaviyo or Meta happens from the push itself.
- Rollback of the dev push: `git push origin d11a269c1766a456b761fc8157272fca833210a5:dev --force-with-lease=dev:<merge sha>` (only on Jamie's go; it removes the test build from dev).
- Never merge `dev` into `main` or push the integration branch to `main` (dev-only files).
- Rehearsal clone is local only; delete with `rm -rf` when done. Nothing was pushed.
