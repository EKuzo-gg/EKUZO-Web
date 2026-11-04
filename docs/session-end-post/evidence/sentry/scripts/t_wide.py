from common import *
import json
with sync_playwright() as p:
    b=launch(p)
    out={}
    for url in [SLUG,"/blog/should-i-buy-my-kid-robux"]:
        ctx=b.new_context(viewport={"width":375,"height":812}); guard(ctx,"wide")
        pg=ctx.new_page(); pg.goto(BASE+url,wait_until="networkidle"); pg.wait_for_timeout(500)
        out[url]=pg.evaluate("""()=>{const d=document.documentElement;const r=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).map(e=>({t:e.tagName,c:(e.className&&e.className.toString()||'').slice(0,60),r:Math.round(e.getBoundingClientRect().right),ox:getComputedStyle(e.parentElement).overflowX,inA:!!e.closest('article')})).slice(0,12);
          return {sw:d.scrollWidth,bsw:document.body.scrollWidth,ox:[getComputedStyle(d).overflowX,getComputedStyle(document.body).overflowX],wide:r}}""")
        ctx.close()
    b.close()
flush("a")
print(json.dumps(out,indent=1))
