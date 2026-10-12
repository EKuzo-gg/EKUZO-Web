# CP-16 voice lint. Run: git diff 0da2e89 HEAD -U0 -- app public/llms.txt | python3 voice-lint.py
import sys,re
w3a="delve realm tapestry paradigm intricate intricacies showcasing pivotal surpass meticulously vibrant unparalleled underscore synergy game-changer testament commendable meticulous holistic garner accentuate pioneering trailblazing unleash transformative redefine frictionless mission-critical visionary disruptive reimagine unprecedented leading-edge synergize democratize supercharge paradigm-shifting plug-and-play turnkey future-proof".split()
ph3a=["serves as","stands as","marks a","represents a","boasts a","features a","offers a"]
ph3c=["in today's","in today’s","important to note","worth noting","in order to","straightforward","let's dive","let's explore","let's unpack","delve into","at the end of the day","moving forward","to put this in perspective","what makes this particularly interesting","the implications here are","in other words","goes without saying","nobody","most people don't realize","most people don’t realize","despite its","challenges and future prospects"]
tr3d=["furthermore","additionally","moreover","that said","that being said","with that in mind","also worth mentioning","on top of that"]
sym=["—","–","→","←","⇒","&mdash;","&ndash;","&rarr;","&larr;"]
file=None;ln=0;hits=0;added=0;perfile={}
for line in sys.stdin:
    line=line.rstrip("\n")
    if line.startswith("+++ "): file=line[6:]; continue
    m=re.match(r"@@ -\S+ \+(\d+)",line)
    if m: ln=int(m.group(1)); continue
    if line.startswith("+") and not line.startswith("+++"):
        t=line[1:]; low=t.lower(); added+=1; perfile[file]=perfile.get(file,0)+1
        found=[]
        for s in sym:
            if s in t: found.append("SYMBOL "+repr(s))
        for w in w3a:
            if re.search(r"(?<![\w-])"+re.escape(w)+r"(?![\w-])",low): found.append("3A "+w)
        for p in ph3a+ph3c+tr3d:
            if p in low: found.append("PHRASE "+p)
        for f in found: print(f"{file}:{ln}: {f} :: {t.strip()[:110]}"); hits+=1
        ln+=1
print(f"added lines scanned: {added}; hits: {hits}")
for f,c in perfile.items(): print(f"  {c:5d} {f}")
