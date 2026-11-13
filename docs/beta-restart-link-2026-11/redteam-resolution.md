# Spec red team: findings and resolution

Three Sonnet agents, one lens each, read-only on cb61c77; full reports in `redteam/abuse.md`, `redteam/privacy.md`, `redteam/ops.md`. Resolved by Fable 14:33 CT 2026-11-13. The findings converge on one design change: a link arrival no longer fills the wizard by itself. The parent sees a short panel (masked email, two buttons) and the saved answers load only on their tap.

| ID | Sev | Finding | Resolution |
|---|---|---|---|
| A1, B5 | major | A planted link drops a parent mid-wizard under a stranger's email; shared computers mix families | **Changed.** Resume is a tap on a panel that shows the masked email ("saved under j•••@gmail.com") with "Start fresh" beside it. Nothing is stored in the browser until the tap. Residual: a parent can still tap through; accepted |
| B3, B6, C6 | major | Auto-restore runs in mail scanners that execute scripts, re-posts progress, slides the expiry, fires events | **Changed.** No kid data is returned or rendered before the tap; a link resume sends no progress post and no step event (flag in the restore walk) |
| B2, C9 | major | A slow restore answer could overwrite typing or move the parent | **Changed.** The panel only offers; the page changes on the tap. The panel is not shown once the parent has typed or left the first screen |
| B4, A5, C13, B10 | major/minor | The link is a bearer secret that sits in mail, Klaviyo and logs | **Changed in part.** Validity is 14 days from the row's last real progress (a link resume no longer extends it). The parent note, time zone and times are never returned. Fun fact, name and age are returned after the tap: that is the feature (decision D2). Klaviyo click tracking stays on (Klaviyo already holds the property) |
| C1 | major | Klaviyo's utm parameters make middleware copy the request path, token included, into `ekuzo_lc` and on into Neon | **Changed.** `cleanPath` collapses `/season1/beta/r/...` to `/season1/beta/r/`, as it does for `/crew`. Test |
| C2, B7 | major | A database timeout or dropped request reads as a dead link with no retry; a dead link is silent | **Changed.** A database error answers 503 and keeps the cookies; the script retries once. A dead link shows one line above the first screen |
| C4 | major | A throw while building the link would lose the progress event | **Changed.** The link is built in its own try/catch; on failure the property is left out |
| C5 | major | `S1_REF_SECRET` in the Production context is inferred, not checked | **Gate.** Checked in Netlify before the release (review guide) |
| C7 | major | A revert would send issued links to a 404 that loads tags with the token in the address | **Rule.** A rollback keeps `app/season1/beta/r/[token]/route.ts` (it has no dependency on the rest). Written in the runbook |
| C3 | major | Existing tests break (GA4 call count, the mock row id) | **In scope.** Listed in the spec |
| B1, C10, B13 | major/minor | A restored time zone beats the new guess; winter offsets mislabel Latin American zones; Indiana and Kentucky gaps | **Changed.** The zone comes from an explicit table of US and Canadian zones; any other `America/` zone reads "Outside the US". A saved zone is restored only when the parent picked it by hand; a link never restores it |
| A4, C11 | minor | An origin read from the request could put a foreign link in a profile | **Changed.** Production writes `https://ekuzo.gg`; a deploy preview writes Netlify's own `DEPLOY_PRIME_URL` when it is an `--ekuzo.netlify.app` address; otherwise no property |
| A2, C14 | minor | The source cookie could be set from a value a stranger typed | **Changed.** Set only after the tap, only from the row's `attribution.src` tag, with middleware's own options |
| A6 | minor | Limiter gaps | **Changed.** Shape checks before any database call; a shared bucket when there is no client IP |
| A7 | minor | The derived key shares its parent with `keyHash` | **Changed.** HKDF-SHA256 with its own info string |
| A3, B8, C12 | minor | A stranger who knows an email, a second kid, or out-of-order posts across sessions can kill a link | Accepted (extends D1 and D2 of the go-live build). The parent sees the dead-link line and the first screen |
| B9 | minor | The finished screen has no way to change an answer | For Aaron (with the "another player" link, H4) |
| B11 | minor | Klaviyo's `_kx` and utm parameters on the plain wizard address reach GA4 | Existing behaviour of every email link; noted in the tracking doc, not changed |
| B12 | minor | Focus and announcement on a page that changes itself | **Changed.** The panel is a `role="status"` region; one focus move, on the tap |
| C8 | minor | Redirect construction | **Changed.** Relative Location, both cookies appended; `curl -si` on the preview with and without a query |
