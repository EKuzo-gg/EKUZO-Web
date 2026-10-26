import json,re
r=json.load(open('rendered.json'))
md=open('/mnt/user-data/uploads/EKUZO/Marketing/content-drafts/2026-10-24-robux-post-copy-of-record.md').read()
md=re.sub(r'<!--.*?-->','',md,flags=re.S)
def norm(s):
    s=s.replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"')
    s=re.sub(r'\s+',' ',s).strip(); return s
exp_lines=[]
for ln in md.split('\n'):
    ln=ln.strip()
    if not ln or ln.startswith('![') : continue
    ln=re.sub(r'^#+\s*','',ln); ln=re.sub(r'^>\s*','',ln); ln=re.sub(r'^(\d+\.|-)\s+','',ln)
    ln=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',ln); ln=ln.replace('**','')
    ln=re.sub(r'(?<!\w)\*([^*]+)\*(?!\w)',r'\1',ln)
    exp_lines.append(ln)
# FAQ Q/A lines are separated by newline in md "**Q**\nA": fine, separate lines
exp=[norm(x) for x in exp_lines]
act=[r['h1'],r['sub']]+[l.split('\t',1)[1] for l in r['lines']]
act=[norm(x) for x in act]
def sents(lines):
    out=[]
    for l in lines:
        parts=re.split(r'(?<=[.!?])\s+(?=[A-Z"(\d$])',l)
        out+= [p for p in parts if p]
    return out
E=sents(exp);A=sents(act)
import difflib
print('expected sentences',len(E),'actual',len(A))
sm=difflib.SequenceMatcher(None,E,A,autojunk=False)
diffs=0
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag!='equal':
        diffs+=1
        print(tag); [print('  EXP:',x) for x in E[i1:i2]]; [print('  ACT:',x) for x in A[j1:j2]]
print('diff blocks:',diffs)
# word-level whole-text compare
ew=' '.join(E).split(); aw=' '.join(A).split()
print('words exp',len(ew),'act',len(aw))
