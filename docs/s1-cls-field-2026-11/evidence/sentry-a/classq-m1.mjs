// M1a/M1b/M1c(local)/J4/J5/J9/X15: node classq-m1.mjs <port> <label>   (label: main|branch)
import fs from "fs";
import { launch, newCtx, typeAndSubmit, waitPosts, snapshot, hostsLeft, sleep } from "./classq-lib.mjs";
const [port, label] = process.argv.slice(2);
const base = `http://localhost:${port}`;
const UTM = "utm_source=fb&utm_medium=paid&utm_campaign=s1&utm_content=AD&fbclid=TESTFBCLID";
const SC = [
  { name: "d18-utm", path: `/season1?ad=d18&${UTM.replace("AD", "d18")}`, j9: true },
  { name: "d19-utm", path: `/season1?ad=d19&${UTM.replace("AD", "d19")}` },
  { name: "d2", path: `/season1?ad=d2` },
  { name: "noad", path: `/season1` },
  { name: "adzz", path: `/season1?ad=zz` },
  { name: "hero-games-r0", path: `/season1?hero=games`, rand: 0 },
  { name: "hero-games-r99", path: `/season1?hero=games`, rand: 0.99 },
  { name: "d10-r0", path: `/season1?ad=d10`, rand: 0 },
  { name: "d10-r99", path: `/season1?ad=d10`, rand: 0.99 },
];
fs.mkdirSync("classq", { recursive: true });
const browser = await launch();
const summary = [];
for (const sc of SC) {
  const ctx = await newCtx(browser, { rand: sc.rand ?? null });
  const rec = ctx.__rec;
  const page = await ctx.newPage();
  page.on("pageerror", (e) => rec.pageErrors.push(String(e)));
  const url = base + sc.path + (sc.path.includes("?") ? "&" : "?") + "s1qa=1";
  await page.goto(url, { waitUntil: "load" });
  await sleep(3000);
  const beforeSubmit = await snapshot(page);
  await typeAndSubmit(page);
  await waitPosts(rec, 1);
  await sleep(1200);
  const after = await snapshot(page);
  const out = { label, scenario: sc.name, url, beforeSubmit, after, posts: rec.posts, pageErrors: rec.pageErrors, hosts: hostsLeft(rec), stubbedCount: rec.stubbed.length, cookies: await ctx.cookies() };
  if (sc.j9) {
    const p2 = await ctx.newPage();
    p2.on("pageerror", (e) => rec.pageErrors.push(String(e)));
    await p2.goto(`${base}/season1?s1qa=1`, { waitUntil: "load" });
    await sleep(3000);
    await typeAndSubmit(p2);
    await waitPosts(rec, 2);
    await sleep(800);
    out.j9 = { secondVisitUrl: p2.url(), posts: rec.posts.slice(1), after: await snapshot(p2), storageNote: "second page of the same context; localStorage and cookies kept" };
  }
  out.formUsed = page.__form; out.hosts = hostsLeft(rec);
  fs.writeFileSync(`classq/${label}-${sc.name}.json`, JSON.stringify(out, null, 1));
  summary.push({ sc: sc.name, posts: rec.posts.length, dl: after.dataLayer.length, fbq: after.fbqQueue?.length, clr: after.clarityQ?.length, offenders: out.hosts.offenders, errs: rec.pageErrors.length });
  console.log(label, JSON.stringify(summary.at(-1)));
  await ctx.close();
}
await browser.close();
