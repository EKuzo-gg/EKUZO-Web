import sys,re
label=sys.argv[1]; n=0; total=0
for i,l in enumerate(sys.stdin.read().split("\n"),1):
    total+=1
    hits=[]
    if "—" in l: hits.append("em")
    if "–" in l: hits.append("en")
    if re.search(r"(?<=\S) - (?=\S)",l): hits.append("spaced-hyphen")
    if hits: n+=1; print(f"  {label}:{i} [{','.join(hits)}] {l[:160]}")
print(f"{label}: {n} line(s) with dashes of {total} lines scanned")
