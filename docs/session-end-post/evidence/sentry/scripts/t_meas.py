from common import *
import json
STUB="""window.__ga=[];window.__cl=[];window.gtag=function(){__ga.push(Array.from(arguments))};window.clarity=function(){__cl.push(Array.from(arguments))};"""
R=[]
def ev(pg): return pg.evaluate("window.__ga.filter(a=>a[0]==='event').map(a=>[a[1],a[2]])")
with sync_playwright() as p:
    b=launch(p)
    # A: desktop, wheel scroll over links, no click
    ctx=b.new_context(viewport={"width":1440,"height":900}); guard(ctx,"meas-desktop"); ctx.add_init_script(STUB)
    pg=ctx.new_page(); pg.goto(BASE+SLUG,wait_until="networkidle"); pg.wait_for_timeout(1000)
    R.append(("load events", ev(pg), "clarity", pg.evaluate("window.__cl")))
    # popup appears ~2.5s; wait then check
    pg.wait_for_timeout(2500)
    R.append(("dialog present at ~3.5s desktop", pg.locator("[role=dialog]").count()))
    pg.screenshot(path=EV+"/popup-1440.png")
    # dismiss
    try:
        pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    except Exception as e: R.append(("esc err",str(e)))
    R.append(("dialog after Esc", pg.locator("[role=dialog]").count()))
    # wheel scroll in steps over whole article, mouse over links
    h=pg.evaluate("document.documentElement.scrollHeight")
    for y in range(0,h,350):
        pg.mouse.wheel(0,350); pg.wait_for_timeout(120)
    pg.wait_for_timeout(500)
    R.append(("after full wheel scroll events", ev(pg)))
    # scroll back and do it again: read75 still once
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(300); pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(300)
    R.append(("after rescroll events", ev(pg)))
    # click internal /parents link in article
    a=pg.locator("article a[href='/parents']").first; a.scroll_into_view_if_needed(); a.click(); pg.wait_for_timeout(1500)
    R.append(("after click url", pg.url, "events", ev(pg)))
    ctx.close()
    # B: mobile touch: swipe starting on a link, no click
    ctx=b.new_context(viewport={"width":375,"height":812},has_touch=True,is_mobile=True,device_scale_factor=2); guard(ctx,"meas-mobile"); ctx.add_init_script(STUB)
    pg=ctx.new_page(); pg.goto(BASE+SLUG,wait_until="networkidle"); pg.wait_for_timeout(3500)
    R.append(("mobile dialog at 3.5s", pg.locator("[role=dialog]").count()))
    pg.screenshot(path=EV+"/popup-375.png")
    # close popup via close button if any
    btns=pg.locator("[role=dialog] button").all_inner_texts(); R.append(("popup buttons",btns,[ (x.get_attribute('aria-label')) for x in pg.locator("[role=dialog] button").all()]))
    cl=pg.locator("[role=dialog] button[aria-label*=lose i]")
    if cl.count(): cl.first.click(); pg.wait_for_timeout(600)
    R.append(("mobile dialog after close", pg.locator("[role=dialog]").count()))
    # touch swipe starting on a body link
    a=pg.locator("article a[href='/blog/should-you-ban-fortnite']").first; a.scroll_into_view_if_needed(); pg.wait_for_timeout(900)
    bb=a.bounding_box(); cdp=ctx.new_cdp_session(pg)
    x=bb["x"]+bb["width"]/2; y0=min(bb["y"]+bb["height"]/2,700)
    cdp.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[{"x":x,"y":y0}]})
    for i in range(1,11):
        cdp.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":[{"x":x,"y":y0-i*25}]}); pg.wait_for_timeout(16)
    cdp.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]}); pg.wait_for_timeout(600)
    R.append(("mobile url after swipe-on-link", pg.url, "events", ev(pg)))
    # scroll to bottom to hit read75
    pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(600)
    R.append(("mobile events after bottom", ev(pg), "clarity", pg.evaluate("window.__cl")))
    # popup dismissal check on fresh load: backdrop/Escape
    ctx.close()
    b.close()
flush("a")
open(EV+"/measurement.txt","w").write("\n".join(json.dumps(r,default=str) for r in R))
for r in R: print(r)
