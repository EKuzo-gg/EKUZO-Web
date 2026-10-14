import { NextRequest } from "next/server";
import { POST } from "/home/claude/ekuzo-web/app/api/season-one/route";

type Call = { url: string; body: any };
let calls: Call[] = [];
(globalThis as any).fetch = async (url: any, init: any) => {
  calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null });
  return new Response("{}", { status: 200 });
};
const origErr = console.error; console.warn = () => {}; console.error = (...a) => origErr("ERR", ...a);

const base = { email: "team+s1test@ekuzo.gg", source: "ad-landing", ad: "d3", adName: "x", where: "top", eventId: "abc-123",
  eventSourceUrl: "https://ekuzo.gg/season1?ad=d3&fbclid=zz", page: "/season1?ad=d3" };
let pass = 0, fail = 0;
const out: string[] = [];
async function run(name: string, extra: any, expect?: (p: any, e: any, c: Call[], res: any) => string[] | void, bodyOverride?: any) {
  calls = [];
  const req = new NextRequest("https://x.test/api/season-one", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(bodyOverride ?? { ...base, ...extra }) });
  const res = await POST(req);
  const j = await res.json();
  const ev = calls.find((c) => c.url.endsWith("/events"));
  const capi = calls.find((c) => c.url.includes("graph.facebook.com"));
  const pp = ev?.body?.data?.attributes?.profile?.data?.attributes?.properties;
  const ep = ev?.body?.data?.attributes?.properties;
  const pick = (o: any) => o && Object.fromEntries(Object.entries(o).filter(([k]) => /hero/.test(k)));
  out.push(`## ${name}\ninput extra: ${JSON.stringify(extra)}\nstatus ${res.status} ${JSON.stringify(j)}\nprofile hero props: ${JSON.stringify(pick(pp))}\nevent hero props:   ${JSON.stringify(pick(ep))}\ncalls: ${calls.map((c) => c.url.replace("https://a.klaviyo.com/api/", "")).join(", ")}`);
  const errs = (expect?.(pp, ep, calls, res) || []) as string[];
  // global invariant: CAPI payload never has hero or answer
  if (capi) {
    const s = JSON.stringify(capi.body);
    if (/hero|answer/i.test(s)) errs.push("CAPI payload mentions hero/answer");
    const cd = capi.body.data[0].custom_data;
    if (JSON.stringify(Object.keys(cd)) !== '["content_name"]') errs.push("CAPI custom_data changed");
  }
  if (errs.length) { fail++; out.push(`RESULT: FAIL ${errs.join("; ")}\n`); } else { pass++; out.push("RESULT: pass\n"); }
}
const eq = (a: any, b: any, l: string) => (a === b ? [] : [`${l}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`]);

(async () => {
  for (const h of ["amount", "games", "screentime", "shortlist"])
    await run(`hero ${h} with answer`, { hero: h, heroAnswer: "Five more minutes.", heroFrom: "ad-map" },
      (p, e) => [...eq(p.season1_hero, h, "p.hero"), ...eq(p.season1_hero_answer, "Five more minutes.", "p.ans"), ...eq(e.hero, h, "e.hero"), ...eq(e.hero_answer, "Five more minutes.", "e.ans"), ...eq(e.hero_from, "ad-map", "e.from")]);
  await run("hero with empty answer -> skipped", { hero: "amount", heroAnswer: "", heroFrom: "url" }, (p, e) => [...eq(p.season1_hero_answer, "skipped", "p.ans"), ...eq(e.hero_answer, "skipped", "e.ans")]);
  await run("hero with answer missing -> skipped", { hero: "games", heroFrom: "split" }, (p, e) => eq(e.hero_answer, "skipped", "e.ans"));
  await run("page A (hero none) with stray answer -> empty", { hero: "none", heroAnswer: "should be dropped", heroFrom: "none" }, (p, e) => [...eq(p.season1_hero, "none", "p.hero"), ...eq(p.season1_hero_answer, "", "p.ans"), ...eq(e.hero_answer, "", "e.ans"), ...eq(e.hero_from, "none", "e.from")]);
  await run("hero missing on ad-landing -> none", {}, (p, e) => [...eq(p.season1_hero, "none", "p.hero"), ...eq(e.hero, "none", "e.hero"), ...eq(e.hero_answer, "", "e.ans"), ...eq(e.hero_from, "", "e.from")]);
  await run('hero "AMOUNT " -> amount', { hero: "AMOUNT ", heroAnswer: "x", heroFrom: "url" }, (p, e) => eq(p.season1_hero, "amount", "p.hero"));
  await run("hero unknown 'foo' -> none", { hero: "foo", heroAnswer: "x" }, (p, e) => [...eq(p.season1_hero, "none", "p.hero"), ...eq(e.hero_answer, "", "e.ans")]);
  await run("hero 'constructor' -> none", { hero: "constructor", heroAnswer: "x" }, (p, e) => eq(p.season1_hero, "none", "p.hero"));
  await run("hero as array -> none", { hero: ["amount"], heroAnswer: "x", heroFrom: "url" }, (p, e) => eq(p.season1_hero, "none", "p.hero"));
  await run("hero as object -> none", { hero: { a: 1 }, heroAnswer: "x" }, (p, e) => eq(p.season1_hero, "none", "p.hero"));
  await run("hero as number -> none", { hero: 5, heroAnswer: "x" }, (p, e) => eq(p.season1_hero, "none", "p.hero"));
  await run("heroAnswer with <script> and a URL", { hero: "amount", heroAnswer: '<script>alert(1)</script> see https://evil.com/a?b=c&d=<e> now' },
    (p, e) => /[<>\/:=;()]/.test(e.hero_answer) ? [`unsafe chars kept: ${e.hero_answer}`] : eq(p.season1_hero_answer, e.hero_answer, "p==e"));
  await run("heroAnswer 500 chars -> 200", { hero: "games", heroAnswer: "a".repeat(500) }, (p, e) => eq(e.hero_answer.length, 200, "len"));
  await run("heroAnswer 300 chars with leading spaces -> trimmed then 200", { hero: "games", heroAnswer: "   " + "b".repeat(300) }, (p, e) => eq(e.hero_answer, "b".repeat(200), "ans"));
  await run("heroAnswer only symbols -> skipped", { hero: "amount", heroAnswer: "<>/\\{}[]@#$%^*()=+;:_~`|" }, (p, e) => eq(e.hero_answer, "skipped", "ans"));
  await run("heroAnswer curly quotes kept", { hero: "amount", heroAnswer: "“Five more minutes.” It’s fine, isn’t it? Yes! A & B - c" }, (p, e) => eq(e.hero_answer, "“Five more minutes.” It’s fine, isn’t it? Yes! A & B - c", "ans"));
  await run("heroAnswer non-string (array) -> skipped", { hero: "amount", heroAnswer: ["x"] }, (p, e) => eq(e.hero_answer, "skipped", "ans"));
  await run("heroAnswer non-string (number) -> skipped", { hero: "amount", heroAnswer: 42 }, (p, e) => eq(e.hero_answer, "skipped", "ans"));
  await run("heroAnswer unicode letters kept", { hero: "amount", heroAnswer: "Más tiempo, por favor" }, (p, e) => eq(e.hero_answer, "Más tiempo, por favor", "ans"));
  await run("heroFrom unknown -> empty", { hero: "amount", heroAnswer: "x", heroFrom: "evil" }, (p, e) => eq(e.hero_from, "", "from"));
  await run("heroFrom array -> empty", { hero: "amount", heroAnswer: "x", heroFrom: ["url"] }, (p, e) => eq(e.hero_from, "", "from"));
  await run("heroFrom 'constructor' -> empty", { hero: "amount", heroAnswer: "x", heroFrom: "constructor" }, (p, e) => eq(e.hero_from, "", "from"));
  await run("site-popup with hero fields -> no hero keys", { source: "site-popup", hero: "amount", heroAnswer: "x", heroFrom: "url" },
    (p, e) => [...(Object.keys(p).some((k) => /hero/.test(k)) ? ["profile has hero key"] : []), ...(Object.keys(e).some((k) => /hero/.test(k)) ? ["event has hero key"] : [])]);
  await run("no source (defaults popup) with hero fields -> no hero keys", { source: undefined, hero: "amount", heroAnswer: "x", heroFrom: "url" },
    (p, e) => (Object.keys(p).concat(Object.keys(e)).some((k) => /hero/.test(k)) ? ["hero key present"] : []));
  await run("step games with hero fields -> unchanged", { step: "games", kidGames: "Fortnite, Minecraft", hero: "amount", heroAnswer: "x", heroFrom: "url" },
    (p, e, c, res) => [...eq(JSON.stringify(p), '{"kid_games":"Fortnite, Minecraft"}', "profile"), ...eq(JSON.stringify(e), '{"kid_games":"Fortnite, Minecraft"}', "event"), ...eq(c.length, 1, "calls")]);
  await run("step age with hero fields -> unchanged", { step: "age", kidAge: "10-12", hero: "amount", heroAnswer: "x", heroFrom: "url" },
    (p, e, c) => [...eq(JSON.stringify(p), '{"season1_kid_age":"10-12"}', "profile"), ...eq(JSON.stringify(e), '{"kid_age":"10-12"}', "event"), ...eq(c.length, 1, "calls")]);
  await run("honeypot with hero -> no write", { hero: "amount", heroAnswer: "x", ekz_hp: "bot" }, (p, e, c) => eq(c.length, 0, "calls"));
  // Meta CAPI: compare with/without hero fields, must be identical except nothing about hero
  const capiOf = async (extra: any) => { calls = []; await POST(new NextRequest("https://x.test/api/season-one", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...base, ...extra }) })); const c = calls.find((x) => x.url.includes("graph.facebook.com")); const d = JSON.parse(JSON.stringify(c!.body)); d.data[0].event_time = 0; return d; };
  const a = JSON.stringify(await capiOf({ hero: "amount", heroAnswer: "Five more minutes.", heroFrom: "url" }));
  const b = JSON.stringify(await capiOf({}));
  out.push(`## Meta CAPI payload with hero+answer vs without\nwith:    ${a}\nwithout: ${b}\nRESULT: ${a === b && !/hero|answer|Five/i.test(a) ? "pass (identical, no hero/answer text)" : "FAIL"}\n`);
  if (!(a === b && !/hero|answer|Five/i.test(a))) fail++; else pass++;
  console.log(out.join("\n"));
  console.log(`TOTAL pass ${pass} fail ${fail}`);
  process.exit(fail ? 1 : 0);
})();
