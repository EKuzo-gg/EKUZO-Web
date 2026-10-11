# F10 Clarity signup timing (Sentry)

Question: can `clarity("event","signup")` on `/season1` be lost, and when. Harness: the landing page loads the real Clarity tag (https://www.clarity.ms/tag/wml8wll5ua then scripts.clarity.ms/<version>/clarity.js, versions 0.8.72 and 0.8.75-beta both served at random); every Clarity upload (`*.clarity.ms/collect`) is intercepted by Playwright, gzip-decoded and answered 204 locally. In-page wrappers log every XHR, fetch and `navigator.sendBeacon` to a collect URL with a timestamp and (for string bodies) the payload. A filtering proxy (see network-guard.md) blocks any Clarity or GA connection that bypasses the interception. Same code path on baseline and build (the landing's signup call is untouched); both were run.

The call time is taken inside the page when the wrapped `clarity("event","signup")` runs; the beacon time is when Playwright received the request (same machine clock).

## (a) Normal case: call to the first beacon that carries it

| Run | Server | Clarity | Signup call to beacon carrying "signup" (ms) | Beacon seq / bytes |
|---|---|---|---|---|
| 1 | :3002 | 0.8.72 | 956 | seq 2 / 735 B (also carries set signed_up) |
| 2 | :3002 | 0.8.75-beta | 944 | seq 2 / 741 B (also carries set signed_up) |
| 3 | :3002 | 0.8.75-beta | 957 | seq 2 / 739 B (also carries set signed_up) |
| 4 | :3002 | 0.8.75-beta | 954 | seq 2 / 740 B (also carries set signed_up) |
| 1 | :3001 | 0.8.75-beta | 970 | seq 2 / 741 B (also carries set signed_up) |
| 2 | :3001 | 0.8.75-beta | 943 | seq 2 / 738 B (also carries set signed_up) |
| 3 | :3001 | 0.8.75-beta | 947 | seq 2 / 736 B (also carries set signed_up) |
| 4 | :3001 | 0.8.75-beta | 955 | seq 2 / 739 B (also carries set signed_up) |

Range 943 to 970 ms over 8 runs, about 0.95 s. Upload shape: seq 1 (about 60 KB: the whole session start, including the page tags set ad/utm_content/utm_term/site) goes out about 1.1 s after load; the next beacon (seq 2, about 0.7 KB) carries the signup event and the signed_up tag together about 0.95 s after the call. An earlier first pass of the same test (different proxy state, file raw-f10-superseded-first-pass.json) measured [1955,1967,1952,949,960,950] ms; the three 1.95 s values were all on :3002 in one batch and I could not reproduce them, so treat 1 to 2 s as the observed range.

## Idle cadence (no interaction, 70 s)

| Beacon | Time after load | Size |
|---|---|---|
| seq 1 | 1.1 s | 60113 B |
| seq 2 | 62.0 s | 286 B |

With no events Clarity uploads one 60 KB start beacon at about 1 s, then a heartbeat only about every 60 s. Any event (like signup) is flushed about 1 s later.

## (b) clarity.js delayed (tag and script each delayed 8 s)

The test submits the form right after DOMContentLoaded, so the signup call happens before Clarity exists.

| Server | Signup call (ms after navigation start) | State at the call | Clarity script requests (relative to call) | Beacons | Signup uploaded? |
|---|---|---|---|---|---|
| :3002 | 881 | clarityReady=false, stub queue length 6 (set ad d5, set utm_content d5-a-showup, set utm_term Instagram_Feed, set site ig, event signup, set signed_up yes) | tag -775 ms, clarity.js 7455 ms | seq 1 only, 60173 B at +16064 ms | **yes**, inside the first (session start) beacon, 16.1 s after the call (immediately after Clarity became ready) |
| :3001 | 934 | clarityReady=false, stub queue length 6 (set ad d5, set utm_content d5-a-showup, set utm_term Instagram_Feed, set site ig, event signup, set signed_up yes) | tag -845 ms, clarity.js 7438 ms | seq 1 only, 60175 B at +16095 ms | **yes**, inside the first (session start) beacon, 16.1 s after the call (immediately after Clarity became ready) |

Confirmed: the snippet's stub queues calls (`clarity.q`) and clarity.js replays them when it loads. A call made before Clarity is ready is not dropped; it is uploaded as soon as Clarity starts. (Replay also explains why the page-level call log shows each `set` twice: once from the page, once from clarity.js replaying its queue.)

## (d) Clarity tag blocked (ad blocker or network failure)

- :3002: signup called=true, clarityReady=false, queue length 6 (set ad d5, set utm_content d5-a-showup, set utm_term Instagram_Feed, set site ig, event signup, set signed_up yes), collect beacons sent=0. The call sits in the stub queue forever and is lost.
- :3001: signup called=true, clarityReady=false, queue length 6 (set ad d5, set utm_content d5-a-showup, set utm_term Instagram_Feed, set site ig, event signup, set signed_up yes), collect beacons sent=0. The call sits in the stub queue forever and is lost.

## (c) Close the page right after sign-up

close is `page.close({runBeforeUnload:true})` (context kept open and observed 6 s more) or `context.close()`. "In-page attempt" is what Clarity itself called (wrappers around XHR / fetch / sendBeacon), "route captured" is what Playwright's interception received before teardown.

| Server | Close | Close called (ms after call) | Routed beacon with signup before close | In-page sendBeacon at pagehide | sendBeacon return | sendBeacon payload has signup |
|---|---|---|---|---|---|---|
| :3002 | page.close 300 ms | 324 | no | +329 ms, 1212 B | true | yes |
| :3002 | page.close 1000 ms | 1019 | no | +1030 ms, 1423 B | true | yes |
| :3002 | page.close 3000 ms | 3017 | yes (at +955 ms) | +3027 ms, 417 B | true | no (event already uploaded) |
| :3002 | ctx.close 300 ms | 318 | no | +322 ms, 1213 B | true | yes |
| :3002 | ctx.close 1000 ms | 1015 | yes (at +951 ms) | +1029 ms, 416 B | true | no (event already uploaded) |
| :3002 | ctx.close 3000 ms | 3022 | yes (at +951 ms) | +3031 ms, 415 B | true | no (event already uploaded) |
| :3001 | page.close 300 ms | 324 | no | +328 ms, 1213 B | true | yes |
| :3001 | page.close 1000 ms | 1018 | yes (at +957 ms) | +1029 ms, 415 B | true | no (event already uploaded) |
| :3001 | page.close 3000 ms | 3007 | yes (at +936 ms) | +3017 ms, 418 B | true | no (event already uploaded) |

What this shows: if the page is closed after the normal upload (about 0.95 s), the signup is already out. If it is closed earlier (300 ms, and sometimes at 1 s), Clarity flushes on `pagehide` with `navigator.sendBeacon` (about 1.2 to 1.4 KB, containing `[t,24,"signup"]` and `signed_up`), and the browser accepted it (return value true). Playwright cannot observe requests the browser issues while tearing a page down, so actual delivery of that last beacon is **not observable in this harness**; sendBeacon is built to outlive the page, and in the earlier unguarded first pass nothing showed up in the intercepted traffic either, so no delivery proof exists either way.

## Conclusion

Our call cannot be lost by timing alone: before Clarity loads it is queued and replayed; after it loads it is uploaded about 1 s later; and on a close in that second Clarity flushes it with a `pagehide` sendBeacon. The signup can be lost when: (1) the Clarity tag or script never loads (ad and tracker blockers, content-blocking in some in-app browsers, network failure): the call stays in a stub queue that nothing ever uploads (test d); (2) the page is killed without a `pagehide` within about 1 s of the sign-up (an in-app browser or webview dismissed by a swipe or the app being killed, which Chromium here cannot reproduce); (3) the browser drops the last sendBeacon (not seen; the browser accepted every one). The call itself is gated by the page's LIVE-host and honeypot checks, which are unchanged and not a loss path on ekuzo.gg.

So "1 Clarity signup vs 2 landing sign-ups" is more likely explained by a blocked Clarity tag or an in-app browser closing, or by Clarity's own session handling on its side (not testable here), than by a bug in our call. **No code change is indicated by the evidence** (F10 asks for one only if the call is shown lost). **F10 PASS (investigation delivered, no defect found).** If Jamie wants certainty about (2), the test needs a real iOS/Android in-app browser.
