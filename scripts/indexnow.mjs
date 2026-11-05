// IndexNow ping: tells Bing (and the other IndexNow engines) which URLs changed.
// Google does not use IndexNow; request indexing in Search Console by hand.
//
//   npm run indexnow -- https://ekuzo.gg/blog/a https://ekuzo.gg/blog/b
//   npm run indexnow            (no args: every sitemap URL whose lastmod is today, US Central)
//   npm run indexnow -- --dry   (print what would be sent)
//
// The key is public by design: it must be served at https://ekuzo.gg/<key>.txt.
// Added 2026-11-05 (Jamie's go). Run after the deploy is live, never before.
const HOST = "ekuzo.gg";
const KEY = "b170122d53c1cec5ebbc3a713e1b4854";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
let urls = args.filter((a) => !a.startsWith("--"));

if (urls.length === 0) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "";
    if (loc && lastmod.startsWith(today)) urls.push(loc);
  }
  console.log(`Sitemap URLs with lastmod ${today}: ${urls.length}`);
}

const bad = urls.filter((u) => new URL(u).host !== HOST);
if (bad.length) { console.error("Not on " + HOST + ":", bad); process.exit(1); }
if (urls.length === 0) { console.log("Nothing to send."); process.exit(0); }

const keyRes = await fetch(KEY_LOCATION);
const keyBody = keyRes.ok ? (await keyRes.text()).trim() : "";
if (keyBody !== KEY) { console.error(`Key file not live at ${KEY_LOCATION} (status ${keyRes.status}). Deploy first.`); process.exit(1); }

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };
console.log(urls.join("\n"));
if (dry) { console.log("--dry: not sent"); process.exit(0); }

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
const meaning = { 200: "accepted", 202: "accepted, key check pending", 400: "bad request", 403: "key not valid", 422: "URL not on host or key mismatch", 429: "too many requests" };
console.log(`IndexNow: ${res.status} ${meaning[res.status] ?? ""}`);
process.exit(res.ok ? 0 : 1);
