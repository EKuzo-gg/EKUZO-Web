import { chromium } from 'playwright';
export const BASE = process.env.QA_BASE || 'http://localhost:3311';
// Fail-closed: every non-loopback request goes to a dead proxy (port 9), and
// context.route records and aborts anything external before it leaves.
export async function launchGuarded() {
  return chromium.launch({ args: ['--proxy-server=http://127.0.0.1:9', '--proxy-bypass-list=<-loopback>;localhost;127.0.0.1'] });
}
export async function newCtx(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, ...(opts.ctx || {}) });
  ctx.qaRec = { external: [], console: [], pageErrors: [], http: [] };
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(BASE) || u.startsWith('data:')) return route.continue();
    ctx.qaRec.external.push({ url: u, method: route.request().method(), post: route.request().postData()?.slice(0, 400) || null });
    return route.fulfill({ status: 204, body: '' });
  });
  if (opts.suppressPopup !== false) {
    await ctx.addInitScript(() => { try { localStorage.setItem('ekuzo_s1_dismissed_at', String(Date.now())); } catch (e) {} });
  }
  ctx.on('page', (p) => {
    p.on('console', (m) => { if (m.type() === 'error') ctx.qaRec.console.push(m.text()); });
    p.on('pageerror', (e) => ctx.qaRec.pageErrors.push(String(e)));
    p.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) ctx.qaRec.http.push(`${r.status()} ${r.url()}`); });
  });
  return ctx;
}
