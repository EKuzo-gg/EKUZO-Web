# QA harness (guarded browser) for the gaming-study ship

Everything lives outside the repo:
`QA=/private/tmp/claude-501/-Users-jamiefitch-Projects-ekuzo-web/35bc2a91-c75c-4b5f-9093-aabdc8650086/scratchpad/qa`

Files: `proxy.mjs` (default-deny proxy, JSONL log), `lib.mjs` (launch helper, contexts, scroll helper), `selftest.mjs` (guard gate), `shoot.mjs` (phase-3 screenshots and console report), `head.mjs` (curl-only head and schema evidence).

## Design

- Layer 1: every Chrome launch goes through the proxy on 127.0.0.1:39001. `launchGuarded()` refuses to start Chrome if the proxy is not answering. Loopback bypasses the proxy; all else is denied (CONNECT gets 403, plain HTTP gets a local 204). Nothing is ever forwarded upstream. A host-resolver rule maps every non-loopback host to NOTFOUND as a backstop.
- Layer 2: `context.route` in `newCtx()` answers every non-local request locally (scripts are aborted, images get a 1x1 gif, the rest 204) and records it in `ctx.qaRec.external`. Vendor scripts (gtag, fbevents, Clarity) are never downloaded; call-level evidence only.
- Chrome's own background traffic (google.com, gstatic, autofill, update hosts) shows up in the proxy log and is denied. It is not from the site.
- Popup suppression: init script sets localStorage `ekuzo_s1_dismissed_at` to Date.now(). Pass `{ suppressPopup: false }` for a first-time visitor.
- `newCtx` collects console errors, page errors and local HTTP >= 400 into `ctx.qaRec`.

## Commands

```
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
QA=/private/tmp/claude-501/-Users-jamiefitch-Projects-ekuzo-web/35bc2a91-c75c-4b5f-9093-aabdc8650086/scratchpad/qa
cd /Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship

# 1. App server (fake third-party creds; build must already exist in .next/)
KLAVIYO_PRIVATE_API_KEY=qa-fake META_CAPI_ACCESS_TOKEN= BEEHIIV_API_KEY=qa-fake \
  RESEND_API_KEY=qa-fake GOOGLE_SHEETS_WEBHOOK_URL= \
  nohup npx next start -p 3311 > $QA/server.log 2>&1 &
echo $! > $QA/server.pid

# 2. Guard gate (starts its own proxy, writes the evidence file). Run before any functional test.
cd $QA && node selftest.mjs /Users/jamiefitch/Projects/ekuzo-web/.claude/worktrees/gaming-study-ship/docs/gaming-study-ship/evidence/guard-selftest.txt

# 3. Standalone proxy (only needed if a script does not call startProxy itself)
node $QA/proxy.mjs        # logs to $QA/proxy-log.jsonl, truncated on start

# 4. Stop
kill $(cat $QA/server.pid); lsof -nP -iTCP:3311 -iTCP:39001 -sTCP:LISTEN
```

## Reusing lib.mjs in a journey test

```js
import { startProxy, LOG } from "./proxy.mjs";
import { launchGuarded, newCtx, closeCtx, BASE, POST } from "./lib.mjs";
const srv = startProxy();
const browser = await launchGuarded();
const ctx = await newCtx(browser, "jr-1", { vp: "375", suppressPopup: false });
// to answer app POSTs in the browser (never reach the server):
await ctx.route("**/api/season-one", r => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
const page = await ctx.newPage();
await page.goto(BASE + POST);
// ... assertions ...
await closeCtx(ctx); await browser.close(); srv.close();
```

Note: add the `/api/*` routes after `newCtx` (later routes take precedence in Playwright). Beacons are recorded in `ctx.qaRec.external` only as blocked requests; since vendor scripts are aborted, no GA4 or Meta beacons are produced. Journey tests that need `g/collect` or `ev=Lead` wire data need the vendor scripts served locally (needs a go) or a call-level recorder for `window.gtag` and `window.fbq` installed via `addInitScript`.

Viewports: keys "1440", "1024", "768", "375" in `VIEWPORTS` (375 is mobile emulation with touch).
