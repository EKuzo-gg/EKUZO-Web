import json,re,html,subprocess,urllib.request
E="/home/claude/ekuzo-web/docs/session-end-post/evidence/sentry"
B="http://localhost:3101"
def get(u): return urllib.request.urlopen(B+u).read().decode()
h=get("/blog/how-to-get-your-kid-off-video-games-without-a-fight")
out=[]
def meta(attr,name):
    m=re.search(r'<meta[^>]+%s="%s"[^>]*content="([^"]*)"'%(attr,re.escape(name)),h) or re.search(r'<meta[^>]+content="([^"]*)"[^>]*%s="%s"'%(attr,re.escape(name)),h)
    return html.unescape(m.group(1)) if m else None
out.append("title: "+html.unescape(re.search(r"<title>(.*?)</title>",h).group(1)))
d=meta("name","description");out.append(f"description({len(d)}): {d}")
out.append("canonical: "+str(re.findall(r'<link[^>]+rel="canonical"[^>]*href="([^"]*)"',h)))
for n in ["og:title","og:type","og:url","og:image","og:image:width","og:image:height","og:image:alt","article:published_time","article:modified_time","article:author"]: out.append(f"{n}: {meta('property',n)}")
for n in ["twitter:card","twitter:title","twitter:image","robots","googlebot"]: out.append(f"{n}: {meta('name',n)}")
out.append("all robots meta: "+str(re.findall(r'<meta[^>]*name="robots"[^>]*>',h)))
open(E+"/head.txt","w").write("\n".join(out)+"\n")
print("\n".join(out))
# schema
blocks=re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>',h,flags=re.S)
sch=[]
for b in blocks:
    sch.append(json.loads(html.unescape(b)) if '&quot;' in b else json.loads(b))
json.dump(sch,open(E+"/jsonld.json","w"),indent=1)
nodes=[]
for s in sch:
    nodes+= s.get("@graph",[s])
print("types:",[n.get("@type") for n in nodes])
for n in nodes:
    if n.get("@type")=="BlogPosting": print(json.dumps({k:n.get(k) for k in["headline","author","datePublished","dateModified","image","mainEntityOfPage","description","url"]},indent=1))
    if n.get("@type")=="BreadcrumbList": print([ (i["position"],i["name"],i.get("item")) for i in n["itemListElement"]])
faq=[n for n in nodes if n.get("@type")=="FAQPage"]
print(len(faq))
qa=[(q["name"],q["acceptedAnswer"]["text"]) for q in faq[0]["mainEntity"]]
json.dump(qa,open("/tmp/claude-0/qa.json","w"))
# robots & sitemap & llms
print("---robots");print(get("/robots.txt"))
sm=get("/sitemap.xml");m=re.search(r"<url>(?:(?!</url>).)*how-to-get-your-kid-off-video-games(?:(?!</url>).)*</url>",sm,flags=re.S);print("sitemap:",m.group(0) if m else None)
open(E+"/sitemap-entry.txt","w").write(m.group(0) if m else "NONE")
for slug in ["should-i-buy-my-kid-robux","should-you-ban-fortnite"]:
    m=re.search(r"<url>(?:(?!</url>).)*%s(?:(?!</url>).)*</url>"%slug,sm,flags=re.S);print(m.group(0))
llm=get("/llms.txt")
open(E+"/llms-served.txt","w").write(llm)
print([l for l in llm.splitlines() if "get-your-kid-off" in l])
print("dashes in llms entire:",len(re.findall("[—–]",llm)))
