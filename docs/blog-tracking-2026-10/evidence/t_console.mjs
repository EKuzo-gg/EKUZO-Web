import { open, save, BASE } from './h.mjs';
const out = {};
for (const path of ['/blog/should-i-buy-my-kid-robux','/blog','/parents','/season1','/blog/author/karlin-oei']) {
  const { b, ctx } = await open(); const p = await ctx.newPage();
  const logs = [];
  p.on('console', m => { if (m.type()==='error') logs.push({text:m.text(), loc:m.location().url}); });
  p.on('response', r => { if (r.status()>=400) logs.push({status:r.status(), url:r.url()}); });
  await p.goto(BASE + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
  out[path] = { logs, pageErrors: ctx.qaRec.pageErrors };
  await b.close();
}
save('T7_console', out); console.log(JSON.stringify(out,null,1));
