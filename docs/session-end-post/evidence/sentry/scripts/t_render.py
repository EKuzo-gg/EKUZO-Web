from common import *
import json
with sync_playwright() as p:
    b=launch(p)
    ctx=b.new_context(viewport={"width":1440,"height":900}); guard(ctx,"render")
    pg=ctx.new_page(); logs=[]
    pg.on("console",lambda m: logs.append((m.type,m.text,m.location.get("url","")) ) if m.type in("error","warning") else None)
    pg.on("pageerror",lambda e: logs.append(("pageerror",str(e),"")))
    pg.on("response",lambda r: logs.append(("http%d"%r.status,r.url,"")) if r.status>=400 else None)
    pg.goto(BASE+SLUG,wait_until="networkidle")
    data=pg.evaluate("""()=>{
      const a=document.querySelector('article')||document.querySelector('main');
      const body=document.body;
      return {mainText:(document.querySelector('main')||body).innerText,
        h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),
        h2:[...document.querySelectorAll('h2')].map(e=>e.innerText),
        h3:[...document.querySelectorAll('h3')].map(e=>e.innerText),
        tables:[...document.querySelectorAll('table')].map(t=>({caption:t.querySelector('caption')?.innerText,thead:!!t.querySelector('thead'),rows:t.querySelectorAll('tbody tr').length,ths:[...t.querySelectorAll('th')].map(h=>h.getAttribute('scope')+':'+h.innerText)})),
        notes:[...document.querySelectorAll('[role=note]')].map(e=>e.outerHTML.slice(0,600)),
        bq:[...document.querySelectorAll('blockquote')].map(e=>e.outerHTML.slice(0,800)),
        ol:[...document.querySelectorAll('ol')].map(o=>o.querySelectorAll(':scope>li').length),
        html:document.documentElement.outerHTML}
    }""")
    json.dump(data,open("/tmp/claude-0/render.json","w"))
    json.dump(logs,open("/tmp/claude-0/logs_post.json","w"))
    print(json.dumps({k:v for k,v in data.items() if k not in("html","mainText")},indent=1)[:5000])
    print(logs)
    b.close()
flush()
