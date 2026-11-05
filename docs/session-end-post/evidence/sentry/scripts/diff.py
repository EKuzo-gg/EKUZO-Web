import json,re,difflib
E="/home/claude/ekuzo-web/docs/session-end-post/evidence/sentry"
d=json.load(open("/tmp/claude-0/render.json"))
t=d["mainText"]
copy=open("/mnt/user-data/uploads/EKUZO/Marketing/content-drafts/_read-copy-get-kid-off-the-game-v6.md").read()
copy=re.sub(r"^>.*?\n\n","",copy,count=1,flags=re.S)
def md(s):
    s=re.sub(r"\[([^\]]+)\]\([^)]+\)",r"\1",s)   # links
    s=s.replace("**","").replace("*","")
    s=re.sub(r"^#+ ","",s,flags=re.M)
    s=re.sub(r"^> ?","",s,flags=re.M)
    s=re.sub(r"^\|[-| ]+\|$","",s,flags=re.M)
    s=re.sub(r"^\d\. ","",s,flags=re.M)
    s=re.sub(r"^- ","",s,flags=re.M)
    s=re.sub(r"^\|(.*)\|$",lambda m:" . ".join(c.strip() for c in m.group(1).split("|")),s,flags=re.M)
    return s
def norm(s):
    s=s.replace("’","'").replace("‘","'").replace("“",'"').replace("”",'"').replace(" "," ")
    return re.sub(r"\s+"," ",s).strip()
# restrict page text to article: from H1 to end of sources
i=t.index("How do I get my kid off the game without a fight?")
j=t.index("Sources")
# sources section ends before Keep reading; find end by "Keep"
k=t.find("Keep Reading",j); k = k if k>0 else len(t)
page=t[i:k]
open(E+"/page-text-extracted.txt","w").write(page)
def words(s): return norm(s).split(" ")
cw=words(md(copy)); pw=words(page)
sm=difflib.SequenceMatcher(None,cw,pw,autojunk=False)
out=[]
for tag,a1,a2,b1,b2 in sm.get_opcodes():
    if tag!="equal":
        out.append(f"{tag.upper()} copy[{a1}:{a2}]={' '.join(cw[a1:a2])[:300]!r}  PAGE[{b1}:{b2}]={' '.join(pw[b1:b2])[:300]!r}")
open(E+"/copy-diff.txt","w").write(f"copy words {len(cw)} page words {len(pw)}\n"+"\n".join(out)+"\n")
print(len(cw),len(pw)); print("\n".join(out))
