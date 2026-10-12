import fs from 'fs';
const dec=s=>s.replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(+d)).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
for (const f of fs.readdirSync(process.argv[2])) {
  let h=fs.readFileSync(process.argv[2]+'/'+f,'utf8');
  h=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
  const m=h.match(/<body[\s\S]*<\/body>/); h=m?m[0]:h;
  // block-level newline
  h=h.replace(/<\/(p|h[1-6]|li|div|blockquote|section|figure|figcaption|ul|ol|header|footer|nav|main|article)>/g,'\n').replace(/<br\s*\/?>/g,'\n');
  // preserve alt
  h=h.replace(/<img[^>]*alt="([^"]*)"[^>]*>/g,(_,a)=>'\n[IMG alt: '+a+']\n');
  let t=dec(h.replace(/<[^>]+>/g,''));
  t=t.split('\n').map(l=>l.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');
  fs.writeFileSync(process.argv[3]+'/'+f.replace('.html','.txt'),t+'\n');
}
