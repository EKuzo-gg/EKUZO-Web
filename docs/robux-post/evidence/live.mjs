import { chromium } from 'playwright';
import fs from 'fs';
const BASE = 'https://ekuzo.gg';
// Fail-closed for a live site: analytics and pixel hosts never resolve, and a route records and stubs anything not on ekuzo.gg.
const blockHosts = ['*.google-analytics.com','analytics.google.com','*.googletagmanager.com','*.doubleclick.net','*.clarity.ms','clarity.ms','*.facebook.com','*.facebook.net','connect.facebook.net','*.klaviyo.com'];
const b = await chromium.launch({ args: ['--host-resolver-rules=' + blockHosts.map(h => `MAP ${h} ~NOTFOUND`).join(', ')] });
const out = [];
const pages = ['/blog/should-i-buy-my-kid-robux','/blog','/blog/author/karlin-oei','/parents','/blog/gaming-programs-for-kids','/blog/should-you-ban-fortnite','/blog/what-your-kids-gaming-is-telling-you','/blog/when-your-sons-only-friends-are-online','/blog/gaming-study-13-7-years-younger-what-it-means-for-kids'];
for (const path of pages) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const ext = [], errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith(BASE)) return r.continue(); ext.push(new URL(u).host); return r.fulfill({ status: 204, body: '' }); });
  await ctx.addInitScript(() => { try { localStorage.setItem('ekuzo_s1_dismissed_at', String(Date.now())); } catch (e) {} });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e)));
  const r = await p.goto(BASE + path, { waitUntil: 'networkidle' });
  const info = await p.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name=description]')?.content,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    og: document.querySelector('meta[property="og:image"]')?.content,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const j = JSON.parse(s.textContent); return j['@type'] || (j['@graph']||[]).map(x=>x['@type']).join('+'); } catch { return 'PARSE_ERR'; } }),
    robuxLinks: [...document.querySelectorAll('a[href="/blog/should-i-buy-my-kid-robux"]')].length,
    updated: (document.body.innerText.match(/Updated[^\n]{0,30}/) || [''])[0],
    recent: document.body.innerText.includes('a recent post on X'),
    featured: (document.body.innerText.match(/FEATURED[\s\S]{0,80}/i) || [''])[0].replace(/\s+/g, ' '),
  }));
  out.push({ path, status: r.status(), pageErrors: errs.length, ...info });
  await ctx.close();
}
await b.close();
const sm = await (await fetch(BASE + '/sitemap.xml')).text();
const ll = await (await fetch(BASE + '/llms.txt')).text();
out.push({ sitemapHasPost: sm.includes('/blog/should-i-buy-my-kid-robux'), sitemapPostLastmod: (sm.match(/should-i-buy-my-kid-robux<\/loc>\s*<lastmod>([^<]+)/) || [])[1], llmsHasPost: ll.includes('should-i-buy-my-kid-robux'), llmsEmDashInBlogIndex: /Blog index[^\n]*—/.test(ll) });
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
