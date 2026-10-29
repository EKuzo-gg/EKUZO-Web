"""Card form behind "Or pay with card" (Jamie 10-29): states, focus, layout and console checks on the sign-up page.
usage: python3 -I card-probe.py BASE OUTDIR [LOCAL_TEMPLATE]
LOCAL_TEMPLATE: serve this signup.html with the deploy's injected config (pre-push check)."""
import sys, json, re, time
from playwright.sync_api import sync_playwright

BASE, OUT = sys.argv[1], sys.argv[2]
LOCAL = open(sys.argv[3]).read() if len(sys.argv) > 3 and sys.argv[3] else None
BLOCK = ["googletagmanager.com", "google-analytics.com", "analytics.google.com", "/g/collect", "googleadservices.com",
         "doubleclick.net", "clarity.ms", "facebook.com", "facebook.net", "googlesyndication.com"]
STATE = """()=>{var s=document.getElementById('cardSec'),t=document.getElementById('cardTog'),w=document.getElementById('xpWrap');
 var pf=document.querySelector('#pe iframe'),r=s.getBoundingClientRect();
 return {secShut:s.classList.contains('shut'),inert:s.hasAttribute('inert'),secH:Math.round(r.height),
  togVisible:!!(t.offsetWidth||t.offsetHeight),ariaExpanded:t.getAttribute('aria-expanded'),wrapCls:w.className,
  peFrameH:pf?Math.round(pf.getBoundingClientRect().height):0,goVisible:document.getElementById('go').getBoundingClientRect().height>0&&getComputedStyle(document.getElementById('cardSec')).visibility!=='hidden',
  overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  diag:(document.getElementById('xpDiag')||{}).textContent||''}}"""


def ctx_for(b, w, h, ua=None, init=None):
    kw = {"viewport": {"width": w, "height": h}}
    if ua:
        kw["user_agent"] = ua
    ctx = b.new_context(**kw)

    def guard(route):
        u = route.request.url
        if any(x in u for x in BLOCK):
            return route.fulfill(status=204, body="")
        if LOCAL and route.request.resource_type == "document" and "/season1/join/signup" in u:
            r = route.fetch()
            body = r.text()
            m = re.search(r'<script type="application/json" id="s1-config">(.*?)</script>', body, re.S)
            return route.fulfill(response=r, body=LOCAL.replace("__S1_CONFIG__", m.group(1)))
        return route.continue_()
    ctx.route("**/*", guard)
    if init:
        ctx.add_init_script(init)
    return ctx


def wait_known(pg, ms=12000):
    t0 = time.time()
    while (time.time() - t0) * 1000 < ms:
        d = pg.evaluate("(document.getElementById('xpDiag')||{}).textContent||''")
        w = pg.evaluate("document.getElementById('xpWrap').className")
        if "applePay=" in d or "loaderror" in d or "none" in w:
            return round(time.time() - t0, 2)
        pg.wait_for_timeout(100)
    return None


def run(mode, w, h, pay=False, ua=None, init=None, shots=True):
    out = {"width": w, "mode": mode}
    ctx = ctx_for(B, w, h, ua, init)
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append("pageerror " + str(e)[:200]))
    pg.goto(BASE + "/season1/join/signup", wait_until="load")
    out["at_load"] = pg.evaluate(STATE)
    out["known_after_s"] = wait_known(pg)
    pg.wait_for_timeout(2500)
    out["after_report"] = pg.evaluate(STATE)
    # scroll the wallet row on screen so Stripe draws it, then settle
    pg.evaluate("(document.getElementById('xpWrap').offsetHeight?document.getElementById('xpWrap'):document.getElementById('pe')).scrollIntoView({block:'center'})")
    pg.wait_for_timeout(2500)
    st = pg.evaluate(STATE)
    out["settled"] = st
    if st["togVisible"]:
        if shots:
            pg.screenshot(path=f"{OUT}/collapsed-{w}.png")  # viewport shot: Chromium does not raster off-screen Stripe frames
        t0 = time.time()
        pg.click("#cardTog")
        fr = pg.frame_locator("#pe iframe").first
        inp = fr.locator('input[name="number"]')
        inp.wait_for(state="visible", timeout=15000)
        out["card_visible_after_click_s"] = round(time.time() - t0, 2)
        pg.wait_for_timeout(600)
        out["focus_in_card_number"] = inp.evaluate("e=>document.activeElement===e") and pg.evaluate("document.activeElement&&document.activeElement.tagName==='IFRAME'&&!!document.activeElement.closest('#pe')")
        out["expanded"] = pg.evaluate(STATE)
        out["session_flag"] = pg.evaluate("sessionStorage.getItem('s1_card_open')")
        # a second click keeps it open
        pg.click("#cardTog")
        pg.wait_for_timeout(300)
        out["after_second_click_open"] = not pg.evaluate("document.getElementById('cardSec').classList.contains('shut')")
        if shots:
            pg.evaluate("document.getElementById('pe').scrollIntoView({block:'center'})")
            pg.wait_for_timeout(800)
            pg.screenshot(path=f"{OUT}/expanded-{w}.png")
        # keyboard: reload (flag cleared), Tab to the toggle, Enter
        pg.evaluate("sessionStorage.removeItem('s1_card_open')")
        pg.reload(wait_until="load")
        wait_known(pg)
        pg.evaluate("document.getElementById('xpWrap').scrollIntoView({block:'center'})")
        pg.wait_for_timeout(2000)
        pg.focus("#terms")
        seq = []
        tag = ""
        while tag != "cardTog" and len(seq) < 14:
            pg.keyboard.press("Tab")
            tag = pg.evaluate("(function(a){return a.id||(a.tagName+(a.closest('#xp')?' in #xp':a.closest('#pe')?' in #pe':'')+(a.textContent?' '+a.textContent.trim().slice(0,20):''))})(document.activeElement)")
            seq.append(tag)
        out["keyboard_reached_toggle"] = tag == "cardTog"
        out["keyboard_tab_sequence_from_terms"] = seq
        if tag != "cardTog":
            raise SystemExit("keyboard did not reach the toggle: %r" % seq)
        pg.keyboard.press("Enter")
        inp.wait_for(state="visible", timeout=15000)
        pg.wait_for_timeout(600)
        out["keyboard_expand_focus_card"] = inp.evaluate("e=>document.activeElement===e")
        # reload keeps it open for the tab session
        pg.reload(wait_until="load")
        pg.wait_for_timeout(300)
        out["reload_open_from_session"] = not pg.evaluate("document.getElementById('cardSec').classList.contains('shut')")
    else:
        if shots:
            pg.screenshot(path=f"{OUT}/nowallet-{w}.png")
    if pay:
        pg.fill(".nm", "Probe")
        pg.select_option(".ag", "12")
        pg.fill("#pname", "Sentry")
        email = f"team+s1test-cc-{int(time.time())}@ekuzo.gg"
        out["email"] = email
        pg.fill("#email", email)
        pg.check("#terms")
        fr = pg.frame_locator("#pe iframe").first
        if pg.evaluate("document.getElementById('cardSec').classList.contains('shut')"):
            pg.click("#cardTog")
        fr.locator('input[name="number"]').fill("4242424242424242")
        fr.locator('input[name="expiry"]').fill("12 / 34")
        fr.locator('input[name="cvc"]').fill("123")
        try:
            fr.locator('select[name="country"]').select_option("US")
            fr.locator('input[name="postalCode"]').fill("78757")
        except Exception:
            pass
        pis = []
        pg.on("request", lambda r: pis.extend(re.findall(r"payment_intent=(pi_[A-Za-z0-9]+)", r.url)))
        pg.click("#go")
        pg.wait_for_url("**/season1/join/welcome**", timeout=45000)
        pg.wait_for_timeout(1500)
        out["welcome_url"] = re.sub(r"(payment_intent_client_secret=)[^&]+", r"\1<redacted>", pg.url)
        m = re.search(r"payment_intent=(pi_[A-Za-z0-9]+)", pg.url)
        out["pi"] = (m and m.group(1)) or (pis[0] if pis else None)
        out["welcome_title"] = pg.title()
    out["console_errors"] = errs
    ctx.close()
    return out


# Simulate "Stripe reports no wallet" through the page's own branch: wrap Stripe.js so the Express Checkout
# Element's availablepaymentmethodschange handler receives paymentMethods undefined (Stripe's shape for none)
# after DELAY ms; DELAY < 0 never reports (availability unknown for good).
def fake_none(delay):
    return r"""(function(){var D=%d,real;
function wrap(o,over){return new Proxy(o,{get:function(t,k){if(k in over)return over[k];var v=t[k];return typeof v==='function'?v.bind(t):v}})}
Object.defineProperty(window,'Stripe',{configurable:true,get:function(){return real},set:function(S){
 real=function(){var s=S.apply(this,arguments);
  return wrap(s,{elements:function(o){var e=s.elements(o);
   return wrap(e,{create:function(t,op){var el=e.create(t,op);if(t!=='expressCheckout')return el;var px;
    px=wrap(el,{on:function(n,cb){if(n==='availablepaymentmethodschange'){if(D>=0)setTimeout(function(){cb({elementType:'expressCheckout',paymentMethods:undefined})},D);return px}el.on(n,cb);return px}});
    return px}})}})};
 Object.assign(real,S)}})})();""" % delay


def late_none(w, h):
    """Parent opens the card form while availability is unknown, starts typing, then Stripe reports none."""
    out = {"width": w, "mode": "open while unknown, type, then no wallet at 5 s"}
    ctx = ctx_for(B, w, h, init=fake_none(5000))
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" else None)
    pg.goto(BASE + "/season1/join/signup", wait_until="load")
    out["at_load"] = pg.evaluate(STATE)
    pg.click("#cardTog")
    fr = pg.frame_locator("#pe iframe").first
    inp = fr.locator('input[name="number"]')
    inp.wait_for(state="visible", timeout=15000)
    top = "()=>{var f=document.querySelector('#pe iframe').getBoundingClientRect();return Math.round(f.top+scrollY)}"
    inp.type("4242", delay=50)
    tops = []
    t0 = time.time()
    while time.time() - t0 < 7:
        tops.append(pg.evaluate(top)); pg.wait_for_timeout(100)
    out["card_frame_tops"] = sorted(set(tops))
    out["moved_down"] = any(b > a for a, b in zip(tops, tops[1:]))
    out["after"] = pg.evaluate(STATE)
    out["card_value_kept"] = inp.input_value().replace(" ", "")
    out["console_errors"] = errs
    ctx.close()
    return out


res = {}
with sync_playwright() as p:
    B = p.chromium.launch()
    which = sys.argv[4] if len(sys.argv) > 4 else "all"
    if which in ("all", "states"):
        res["wallet_1440"] = run("wallet", 1440, 900)
        res["wallet_390"] = run("wallet", 390, 844)
        # no wallet: PaymentRequest removed and Link not offered (no-wallet branch); also Stripe's ECE frame blocked
        NOPR = "try{delete window.PaymentRequest;Object.defineProperty(window,'PaymentRequest',{value:undefined})}catch(_){}"
        res["nopr_390"] = run("no PaymentRequest", 390, 844, init=NOPR, shots=False)
        INAPP = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36 Instagram 350.0.0.0 Android"
        res["inapp_390"] = run("instagram in-app UA, no PaymentRequest", 390, 844, ua=INAPP, init=NOPR, shots=False)
    if which in ("all", "states", "none"):
        res["none_390"] = run("Stripe reports no wallet", 390, 844, init=fake_none(0))
        res["none_1440"] = run("Stripe reports no wallet", 1440, 900, init=fake_none(0))
        res["unknown_390"] = run("Stripe never reports", 390, 844, init=fake_none(-1), shots=False)
        res["late_none_390"] = late_none(390, 844)
        res["late_none_1440"] = late_none(1440, 900)
    if which == "kb390":
        res["wallet_390"] = run("wallet", 390, 844, shots=False)
    if which in ("all", "pay"):
        res["pay_1440"] = run("wallet + 4242", 1440, 900, pay=True, shots=False)
    B.close()
json.dump(res, open(f"{OUT}/card-probe-{which}.json", "w"), indent=1)
print(json.dumps(res, indent=1)[:6000])
