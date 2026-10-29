"""F12 probe: card number field position from first paint to 6 s after load.
usage: python3 -I probe.py BASE OUT.json [patch.json]
patch.json: list of [old,new] pairs applied to the served signup HTML (pre-push check)."""
import sys, json
from playwright.sync_api import sync_playwright

BASE, OUT = sys.argv[1], sys.argv[2]
PATCH = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else None
BLOCK = ["googletagmanager.com", "google-analytics.com", "analytics.google.com", "/g/collect", "googleadservices.com",
         "doubleclick.net", "clarity.ms", "facebook.com", "facebook.net", "googlesyndication.com"]
INIT = r"""
(function(){
 var S=window.__s=[],t0=performance.now(),fcp=null;
 try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.name==='first-contentful-paint')fcp=e.startTime})}).observe({type:'paint',buffered:true})}catch(_){}
 window.__fcp=function(){return fcp};
 function top(el){if(!el)return null;var r=el.getBoundingClientRect();return Math.round((r.top+window.scrollY)*10)/10}
 function h(el){return el?Math.round(el.getBoundingClientRect().height*10)/10:null}
 function snap(){var pe=document.getElementById('pe'),w=document.getElementById('xpWrap');
  var fr=pe&&pe.querySelector('iframe'),xf=document.querySelector('#xp iframe'),tb=document.getElementById('testBar');
  S.push({t:Math.round(performance.now()),pe:top(pe),peFrame:top(fr),peFrameH:h(fr),xpWrapH:h(w),xpFrameH:h(xf),cls:w?w.className:null,testBarH:tb&&!tb.hidden?h(tb):0});}
 document.addEventListener('DOMContentLoaded',snap);
 setInterval(snap,50);
 (function raf(){if(performance.now()<1500){snap();requestAnimationFrame(raf)}})();
})();
"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, hgt in [(390, 844), (1440, 900)]:
        ctx = b.new_context(viewport={"width": w, "height": hgt})
        def guard(route):
            u = route.request.url
            if any(x in u for x in BLOCK):
                return route.fulfill(status=204, body="")
            if PATCH and route.request.resource_type == "document" and "/season1/join/signup" in u:
                r = route.fetch()
                body = r.text()
                for old, new in PATCH:
                    assert body.count(old) == 1, ("patch miss", old[:80])
                    body = body.replace(old, new)
                return route.fulfill(response=r, body=body)
            return route.continue_()
        ctx.route("**/*", guard)
        ctx.add_init_script(INIT)
        pg = ctx.new_page()
        errs = []
        pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" else None)
        pg.goto(BASE + "/season1/join/signup", wait_until="load")
        load_t = pg.evaluate("performance.timing.loadEventEnd-performance.timing.navigationStart")
        pg.wait_for_timeout(6000)
        S = pg.evaluate("window.__s")
        fcp = pg.evaluate("window.__fcp()")
        # card number input's absolute top = iframe top + input top inside the frame
        fr = pg.frame_locator("#pe iframe").first
        inp = fr.locator('input[name="number"]')
        inp.wait_for(timeout=20000)
        in_frame = inp.evaluate("e=>e.getBoundingClientRect().top")
        frame_top = pg.evaluate("(function(){var r=document.querySelector('#pe iframe').getBoundingClientRect();return r.top+scrollY})()")
        first = next((s for s in S if s["pe"] is not None and (fcp is None or s["t"] >= fcp)), None)
        firstFrame = next((s for s in S if s["peFrame"] is not None), None)
        pes = sorted(set(s["pe"] for s in S if s["pe"] is not None))
        changes = []
        prev = None
        for s in S:
            if s["pe"] is not None and s["pe"] != prev:
                changes.append({"t": s["t"], "pe": s["pe"], "xpWrapH": s["xpWrapH"], "xpFrameH": s["xpFrameH"], "cls": s["cls"]})
                prev = s["pe"]
        xpchanges = []
        prevh = None
        for s in S:
            k = (s["xpWrapH"], s["xpFrameH"], s["cls"])
            if k != prevh:
                xpchanges.append(s); prevh = k
        drawn = next((s for s in S if (s.get("peFrameH") or 0) >= 100), None)
        since = [s for s in S if drawn and s["t"] >= drawn["t"]]
        res[str(w)] = {
            "card_form_drawn_t": drawn and drawn["t"],
            "card_number_top_when_drawn": drawn and round(drawn["pe"] + in_frame, 1),
            "card_number_tops_since_drawn": sorted(set(round(s["pe"] + in_frame, 1) for s in since)),
            "card_number_tops_since_drawn_excl_testbar": sorted(set(round(s["pe"] - s["testBarH"] + in_frame, 1) for s in since)),
            "testbar_heights_since_drawn": sorted(set(s["testBarH"] for s in since)),
            "fcp_ms": fcp, "load_ms": load_t,
            "pe_top_first_paint": first and first["pe"], "first_sample_t": first and first["t"],
            "pe_top_at_6s": S[-1]["pe"], "last_sample_t": S[-1]["t"],
            "card_number_top_first_paint": first and round(first["pe"] + in_frame, 1),
            "card_number_top_at_6s": round(frame_top + in_frame, 1),
            "card_number_offset_in_frame": in_frame,
            "pe_frame_first_seen": firstFrame and {"t": firstFrame["t"], "top": firstFrame["peFrame"]},
            "distinct_pe_tops": pes, "pe_top_changes": changes, "wallet_block_changes": xpchanges,
            "console_errors": errs,
            "diag": pg.evaluate("(document.getElementById('xpDiag')||{}).textContent||null"),
        }
        pg.screenshot(path=OUT.replace(".json", f"-{w}.png"), full_page=True)
        ctx.close()
    b.close()
json.dump(res, open(OUT, "w"), indent=1)
for w, r in res.items():
    print(w, {k: r[k] for k in ["card_form_drawn_t","card_number_top_when_drawn","card_number_tops_since_drawn","card_number_tops_since_drawn_excl_testbar","fcp_ms","pe_top_first_paint","pe_top_at_6s","card_number_top_first_paint","card_number_top_at_6s","distinct_pe_tops","diag","console_errors"]})
