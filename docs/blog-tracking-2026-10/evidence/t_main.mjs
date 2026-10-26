import { open, events, flush, clarityQ, save, BASE, POST, stay } from './h.mjs';
const R = {};
// ---- T2/T1/T3 popup
{
  const { b, ctx } = await open({ suppressPopup: false });
  const p = await ctx.newPage();
  await p.goto(BASE + POST, { waitUntil: 'networkidle' });
  await p.waitForSelector('[role=dialog]', { timeout: 8000 });
  await p.fill('[role=dialog] input[type=email]', 'qa-test@example.com');
  await p.click('[role=dialog] button[type=submit]');
  await p.waitForTimeout(2000);
  const fb = await p.evaluate(() => (window.fbq?.queue || []).map(a => JSON.stringify(Array.from(a))));
  await flush(p, 2500); await p.waitForTimeout(6000); await flush(p, 2500);
  R.T2 = { events: events(ctx), clarity: await clarityQ(p), fbq: fb, apiBody: ctx.s1, url: p.url() };
  save('T2_popup', R.T2); await b.close();
}
// ---- T3 not on /blog, author
for (const [n, path] of [['blog', '/blog'], ['author', '/blog/author/karlin-oei']]) {
  const { b, ctx } = await open(); const p = await ctx.newPage();
  await p.goto(BASE + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(1500);
  await flush(p); await p.waitForTimeout(3000);
  save('T3_' + n, { clarity: await clarityQ(p), events: events(ctx), console: ctx.qaRec.console, pageErrors: ctx.qaRec.pageErrors });
  await b.close();
}
