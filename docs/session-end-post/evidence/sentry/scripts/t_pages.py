from common import *
import json,urllib.request
res={}
with sync_playwright() as p:
    b=launch(p)
    for name,url in [("post",SLUG),("blog","/blog"),("karlin","/blog/author/karlin-oei")]:
        ctx=b.new_context(viewport={"width":1440,"height":900}); guard(ctx,"pages-"+name)
        pg=ctx.new_page(); logs=[]
        pg.on("console",lambda m,logs=logs: logs.append(("console."+m.type,m.text[:300],m.location.get("url",""))) if m.type in("error","warning") else None)
        pg.on("pageerror",lambda e,logs=logs: logs.append(("pageerror",str(e)[:300],"")))
        pg.on("requestfailed",lambda r,logs=logs: logs.append(("reqfailed",r.url,r.failure)))
        pg.on("response",lambda r,logs=logs: logs.append(("http%d"%r.status,r.url,"")) if r.status>=400 else None)
        pg.goto(BASE+url,wait_until="networkidle"); pg.wait_for_timeout(3500)
        res[name]=logs
        if name=="blog":
            res["blog_info"]=pg.evaluate("""()=>{
              const imgs=[...document.querySelectorAll('main img, img')].map(i=>({src:i.currentSrc||i.src,alt:i.alt,w:i.naturalWidth,h:i.naturalHeight,complete:i.complete}));
              const links=[...document.querySelectorAll('a[href^="/blog/"]')].map(a=>({href:a.getAttribute('href'),text:a.innerText.slice(0,100).replace(/\\n/g,' | ')}));
              const h2=[...document.querySelectorAll('h2')].map(e=>e.innerText);
              return {imgs,links,h2,overflow:document.documentElement.scrollWidth>innerWidth}}""")
        if name=="karlin":
            res["karlin_info"]=pg.evaluate("""()=>({links:[...document.querySelectorAll('a[href^="/blog/"]')].map(a=>({href:a.getAttribute('href'),text:a.innerText.slice(0,100).replace(/\\n/g,' | ')}))})""")
        ctx.close()
    b.close()
flush("a")
json.dump(res,open(EV+"/pages-console.json","w"),indent=1)
for k,v in res.items():
    if k in("post","blog","karlin"): print(k,v)
bi=res["blog_info"]; print(bi["h2"]); print(bi["overflow"])
for l in bi["links"][:12]: print(l)
for i in bi["imgs"]:
    if "get-your-kid" in i["src"] or "robux" in i["src"]: print(i)
print("karlin"); 
for l in res["karlin_info"]["links"]: print(l)
