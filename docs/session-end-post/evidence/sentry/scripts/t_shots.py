from common import *
import json,time
info={}
with sync_playwright() as p:
    b=launch(p)
    for vw,vh in [(375,812),(768,1024),(1440,900)]:
        ctx=b.new_context(viewport={"width":vw,"height":vh}); guard(ctx,f"shots-{vw}")
        for name,url in [("post",SLUG),("blog","/blog")]:
            pg=ctx.new_page(); t0=time.time(); pg.goto(BASE+url,wait_until="networkidle")
            if name=="post":
                pg.wait_for_selector("[role=dialog]",timeout=6000); info[f"popup-open-s-{vw}"]=round(time.time()-t0,2)
                pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
            h=pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0,h,500): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(80)
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(600)
            info[f"{name}-{vw}-hscroll"]=pg.evaluate("[document.documentElement.scrollWidth,innerWidth]")
            if name=="post":
                info[f"{name}-{vw}-table"]=pg.evaluate("""()=>{const t=document.querySelector('table');const r=t.getBoundingClientRect();const par=t.parentElement;return {w:r.width,left:r.left,right:r.right,parentOverflowX:getComputedStyle(par).overflowX,parentScrollW:par.scrollWidth,parentClientW:par.clientWidth}}""")
                info[f"{name}-{vw}-pq"]=pg.evaluate("""()=>{const e=document.querySelector('[role=note]');const r=e.getBoundingClientRect();return {w:r.width,l:r.left,r:r.right}}""")
                info[f"{name}-{vw}-wide"]=pg.evaluate("""()=>[...document.querySelectorAll('article *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('table')).slice(0,5).map(e=>e.tagName+':'+(e.className||'').toString().slice(0,40)+':'+Math.round(e.getBoundingClientRect().right))""")
            pg.screenshot(path=f"{EV}/{name}-{vw}.png",full_page=True)
            pg.close()
        ctx.close()
    b.close()
flush("a")
json.dump(info,open(EV+"/layout-metrics.json","w"),indent=1); print(json.dumps(info,indent=1))
