from common import *
import json,urllib.request,urllib.error,re
with sync_playwright() as p:
    b=launch(p); ctx=b.new_context(viewport={"width":1440,"height":900}); guard(ctx,"links")
    pg=ctx.new_page(); pg.goto(BASE+SLUG,wait_until="networkidle")
    links=pg.evaluate("""()=>[...document.querySelectorAll('a[href]')].map(a=>({href:a.getAttribute('href'),text:a.innerText.trim().replace(/\\s+/g,' ').slice(0,70),target:a.target,rel:a.rel,in:(a.closest('nav')?'nav':a.closest('footer')?'footer':a.closest('article')?'article':'other')}))""")
    b.close()
flush("a")
out=[];seen=set()
for l in links:
    h=l["href"]
    if h.startswith("/"):
        try: code=urllib.request.urlopen(BASE+h.split('#')[0]).status
        except urllib.error.HTTPError as e: code=e.code
        utm=bool(re.search(r"[?&](utm_|source=)",h))
        out.append(f"INTERNAL {l['in']:8} {code} utm/source={utm} {h}  [{l['text']}]")
    elif h.startswith("http"):
        ok = l["target"]=="_blank" and "noopener" in l["rel"]
        out.append(f"EXTERNAL {l['in']:8} blank={l['target']=='_blank'} noopener={'noopener' in l['rel']} {'OK' if ok else 'FAIL'} {h}")
    else: out.append(f"OTHER {l['in']} {h} [{l['text']}]")
open(EV+"/links.txt","w").write("\n".join(out))
print("\n".join(out))
