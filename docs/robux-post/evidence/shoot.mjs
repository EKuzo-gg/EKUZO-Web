import { launchGuarded, newCtx, BASE } from './lib.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await launchGuarded();
for (const w of [375, 768, 1440]) {
  const ctx = await newCtx(b, { viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/blog/should-i-buy-my-kid-robux`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/robux-post-${w}-full.png`, fullPage: true });
  await p.screenshot({ path: `${out}/robux-post-${w}-top.png` });
  const t = await p.$('table'); if (t) { await t.scrollIntoViewIfNeeded(); await p.screenshot({ path: `${out}/robux-post-${w}-tables.png` }); }
  console.log(w, JSON.stringify({ console: ctx.qaRec.console, pageErrors: ctx.qaRec.pageErrors, http: ctx.qaRec.http, externalHosts: [...new Set(ctx.qaRec.external.map(e => new URL(e.url).host))] }));
  await ctx.close();
}
const ctx = await newCtx(b, { viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
await p.goto(`${BASE}/blog`, { waitUntil: 'networkidle' }); await p.screenshot({ path: `${out}/blog-index-1440-top.png` });
await b.close();
