/**
 * Sentry (server lane) independent harness for POST /api/season-one.
 * Written without reference to Relay's harness (author is not verifier).
 *
 * Run (from a checkout that has node_modules and tsconfig paths, e.g. /tmp/sentry-server):
 *   KLAVIYO_PRIVATE_API_KEY=test META_CAPI_ACCESS_TOKEN=x META_PIXEL_ID=1 \
 *   BUILD_ROUTE=/tmp/sentry-server/app/api/season-one/route.ts \
 *   REF_ROUTE=/tmp/sentry-server/app/api/season-one/route.devref.ts \
 *   npx tsx sentry-harness.ts
 *
 * BUILD_ROUTE = preview/s1-heroes route. REF_ROUTE = `git show origin/dev:app/api/season-one/route.ts`.
 * Global fetch is mocked: every outbound call is recorded, nothing leaves the process.
 */
import { NextRequest } from "next/server";
import fs from "fs";

type Call = { url: string; method: string; headers: Record<string, string>; rawBody: string; body: any };
let calls: Call[] = [];
const mode = { event: 200 as number | "throw", subscribe: 200 as number | "throw", capi: 200 as number | "throw" };
const logs: string[] = [];

(globalThis as any).fetch = async (input: any, init: any = {}) => {
  const url = String(input);
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(init.headers || {})) headers[k.toLowerCase()] = String(v);
  const rawBody = typeof init.body === "string" ? init.body : "";
  let body: any = null;
  try { body = JSON.parse(rawBody); } catch { /* not json */ }
  calls.push({ url, method: init.method || "GET", headers, rawBody, body });
  const which = /graph\.facebook\.com/.test(url) ? "capi" : /profile-subscription/.test(url) ? "subscribe" : "event";
  const m = mode[which];
  if (m === "throw") throw new Error(`mock network error (${which})`);
  return new Response(JSON.stringify({}), { status: m, headers: { "content-type": "application/json" } });
};
for (const k of ["error", "warn", "log"] as const) (console as any)[k] = (...a: any[]) => { logs.push(`${k}: ${a.map(String).join(" ")}`); };

const BUILD = process.env.BUILD_ROUTE!, REF = process.env.REF_ROUTE!;
const out: string[] = [];
const say = (s: string) => out.push(s);
type R = { id: string; name: string; ok: boolean; detail: string };
const results: R[] = [];
function check(id: string, name: string, ok: boolean, detail = "") {
  results.push({ id, name, ok, detail });
  say(`${ok ? "PASS" : "FAIL"} [${id}] ${name}${ok || !detail ? "" : "  :: " + detail}`);
}

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram";
const GEO = Buffer.from(JSON.stringify({ city: "Austin", country: { code: "US" }, subdivision: { code: "TX" }, postalCode: "78757" })).toString("base64");
const baseBody = (over: Record<string, unknown> = {}) => ({
  email: "sentry+1@example.com", source: "ad-landing", ad: "d3", adName: "Ad 03", where: "top",
  attribution: { utm_source: "meta", utm_medium: "paid_social", utm_campaign: "season1", utm_content: "Ad 03", utm_term: "Instagram_Reels", utm_id: "123", site: "ig" },
  page: "/season1?ad=d3&utm_source=meta", eventId: "evt-0001-abcd",
  eventSourceUrl: "https://ekuzo.gg/season1?ad=d3&utm_source=meta&fbclid=ABC123", ekz_hp: "", ...over,
});
async function call(modPath: string, body: unknown, o: { raw?: string; headers?: Record<string, string> } = {}) {
  const mod = await import(modPath);
  calls = [];
  const req = new NextRequest("http://localhost:3000/api/season-one", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": UA, "x-nf-client-connection-ip": "203.0.113.9", "x-nf-geo": GEO, cookie: "_fbp=fb.1.111.222; _fbc=fb.1.333.444", ...(o.headers || {}) },
    body: o.raw !== undefined ? o.raw : JSON.stringify(body),
  });
  const res = await mod.POST(req);
  let json: any = null; try { json = await res.json(); } catch { /* */ }
  return { status: res.status, json, calls: calls.slice() };
}
const B = (body: unknown, o?: any) => call(BUILD, body, o);
const Rf = (body: unknown, o?: any) => call(REF, body, o);

const evCall = (r: { calls: Call[] }) => r.calls.find((c) => /\/api\/events$/.test(c.url));
const evProps = (r: any) => evCall(r)?.body?.data?.attributes?.properties as Record<string, string> | undefined;
const profProps = (r: any) => evCall(r)?.body?.data?.attributes?.profile?.data?.attributes?.properties as Record<string, string> | undefined;
const capiCall = (r: any) => r.calls.find((c: Call) => /graph\.facebook\.com/.test(c.url));
const subCall = (r: any) => r.calls.find((c: Call) => /profile-subscription/.test(c.url));
const HERO_KEYS_PROFILE = ["season1_hero", "season1_hero_answer"], HERO_KEYS_EVENT = ["hero", "hero_answer", "hero_from"];

// Mask nondeterministic fields so two runs can be compared byte for byte.
function mask(v: any): any {
  if (Array.isArray(v)) return v.map(mask);
  if (v && typeof v === "object") {
    const o: any = {};
    for (const k of Object.keys(v).sort()) {
      if (["time", "unique_id", "season1_joined_at", "event_time"].includes(k)) o[k] = "<masked>";
      else o[k] = mask(v[k]);
    }
    return o;
  }
  if (typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v)) return "<uuid>";
  if (typeof v === "string") return v.replace(/fb\.1\.\d{13}\./g, "fb.1.<ms>.").replace(/-Season 01 Waitlist(?: \w+)?-\d{13}$/, "-<metric>-<ms>");
  return v;
}
const normCalls = (cs: Call[], stripHero = false) => JSON.stringify(cs.map((c) => {
  const b = mask(c.body);
  if (stripHero && /\/api\/events$/.test(c.url) && b?.data?.attributes) {
    const a = b.data.attributes;
    HERO_KEYS_EVENT.forEach((k) => delete a.properties?.[k]);
    HERO_KEYS_PROFILE.forEach((k) => delete a.profile?.data?.attributes?.properties?.[k]);
  }
  return { url: c.url.replace(/fb\.1\.\d{13}\./g, ""), method: c.method, headers: c.headers, body: b };
}));

// Independent oracle for the answer rule (spec C4), written by code point rather than by regex.
const KEEP = new Set([" ", ",", ".", "'", "’", "“", "”", '"', "!", "?", "&", "-"]);
function oracleAnswer(s: unknown): string {
  if (typeof s !== "string") return "";
  let o = "";
  for (const ch of s) if (/^[\p{L}\p{N}]$/u.test(ch) || KEEP.has(ch)) o += ch;
  return o.trim().slice(0, 200);
}
const ALLOWED_RE = /^[\p{L}\p{N} ,.'’“”"!?&-]*$/u;

async function main() {
  const hs = new Set<string>();
  // ---------- sanity: ref truly is origin/dev (no hero code) ----------
  {
    const src = fs.readFileSync(REF, "utf8");
    check("SANITY", "reference route (origin/dev) contains no hero code", !/hero/i.test(src));
    const r = await Rf(baseBody({ hero: "amount", heroAnswer: "A lot", heroFrom: "url" }));
    check("SANITY", "reference route ignores hero fields entirely", !HERO_KEYS_EVENT.some((k) => k in (evProps(r) || {})) && !HERO_KEYS_PROFILE.some((k) => k in (profProps(r) || {})));
  }

  // ---------- C1/C2/C4: every hero with Aaron's real answers ----------
  const answers: Record<string, string[]> = {
    amount: ["A little", "A lot", "Way too much"],
    screentime: ["“Five more minutes.”", "“I can’t pause it.”", "“Just one more game.”", "“I’m almost done.”", "Five more minutes.", "I can’t pause it."],
    games: ["Fortnite", "Fortnite, Something else", "Fortnite, Minecraft, Roblox, Overwatch, Super Smash Bros., Something else", "I have no idea"],
    shortlist: ["Soccer", "Soccer, Dance", "Soccer, Baseball, Dance, Gymnastics, Piano"],
  };
  for (const [hero, list] of Object.entries(answers)) {
    for (const a of list) {
      for (const from of ["url", "ad-map", "split"]) {
        const r = await B(baseBody({ hero, heroAnswer: a, heroFrom: from }));
        const e = evProps(r)!, p = profProps(r)!;
        const ok = r.status === 200 && r.json?.ok === true && p.season1_hero === hero && p.season1_hero_answer === a && e.hero === hero && e.hero_answer === a && e.hero_from === from;
        check("C2", `hero=${hero} answer=${JSON.stringify(a)} from=${from} stored verbatim`, ok, JSON.stringify({ p, e }));
        const ev = r.calls.filter((c) => /\/api\/events$/.test(c.url)).length, sub = r.calls.filter((c) => /profile-subscription/.test(c.url)).length, capi = r.calls.filter((c) => /graph\.facebook/.test(c.url)).length;
        if (from === "url") check("N4", `hero=${hero}: exactly 1 event, 1 subscribe, 1 CAPI Lead`, ev === 1 && sub === 1 && capi === 1, `${ev}/${sub}/${capi}`);
      }
    }
  }
  // Uppercase / padded hero ids from the client are normalized
  for (const h of [" Amount ", "AMOUNT", "Games\n", "\tshortlist", "ScreenTime"]) {
    const r = await B(baseBody({ hero: h, heroAnswer: "x", heroFrom: "url" }));
    check("C3", `hero ${JSON.stringify(h)} normalizes to its id`, ["amount", "games", "shortlist", "screentime"].includes(profProps(r)!.season1_hero), profProps(r)!.season1_hero);
  }

  // ---------- skipped ----------
  for (const hero of ["amount", "games", "screentime", "shortlist"]) {
    for (const [lbl, ha] of [["empty string", ""], ["missing", undefined], ["whitespace", "   \t\n "], ["symbols only", "<>/\\{}[]()=+*#@$%^|~`;:_"], ["null", null], ["zero-width only", "​‍﻿‮"]] as const) {
      const over: any = { hero, heroFrom: "url" }; if (ha !== undefined) over.heroAnswer = ha;
      const r = await B(baseBody(over));
      check("C4", `hero=${hero} heroAnswer ${lbl} -> skipped`, profProps(r)!.season1_hero_answer === "skipped" && evProps(r)!.hero_answer === "skipped", JSON.stringify(profProps(r)));
    }
  }

  // ---------- page A ----------
  {
    for (const [lbl, over, wantFrom] of [
      ["hero none, from none (d7/bare/invalid ad)", { hero: "none", heroAnswer: "", heroFrom: "none" }, "none"],
      ["hero none, from url (hero=none)", { hero: "none", heroAnswer: "", heroFrom: "url" }, "url"],
      ["hero none with a stray answer", { hero: "none", heroAnswer: "Fortnite", heroFrom: "none" }, "none"],
    ] as const) {
      const r = await B(baseBody({ ad: "d7", ...over }));
      const e = evProps(r)!, p = profProps(r)!;
      check("C1", `page A ${lbl}`, p.season1_hero === "none" && p.season1_hero_answer === "" && e.hero === "none" && e.hero_answer === "" && e.hero_from === wantFrom, JSON.stringify({ p, e }));
    }
    const r = await B(baseBody({ ad: "d7", hero: undefined, heroAnswer: undefined, heroFrom: undefined }));
    const e = evProps(r)!, p = profProps(r)!;
    check("C3", "ad-landing with no hero keys at all (old cached client) -> hero none, answer empty, from empty", p.season1_hero === "none" && p.season1_hero_answer === "" && e.hero === "none" && e.hero_from === "" && e.hero_answer === "", JSON.stringify({ p, e }));
  }

  // ---------- C3 hostile hero ----------
  const hostileHero: [string, unknown][] = [
    ["array", ["amount"]], ["array two", ["amount", "games"]], ["object", { toString: "amount" }], ["object value", { a: 1 }], ["number", 5], ["zero", 0], ["true", true], ["null", null],
    ["__proto__", "__proto__"], ["constructor", "constructor"], ["toString", "toString"], ["hasOwnProperty", "hasOwnProperty"], ["valueOf", "valueOf"], ["prototype", "prototype"],
    ["none string", "none"], ["unknown", "foo"], ["empty", ""], ["10k chars", "a".repeat(10000)], ["10k then amount", "x".repeat(10000) + "amount"], ["amount then 10k spaces then junk", "amount" + " ".repeat(300) + "zzz"],
    ["img onerror", "<img src=x onerror=alert(1)>"], ["javascript url", "javascript:alert(1)"], ["amount plus markup", "amount<script>"], ["amount NUL", "amount\u0000"], ["amo zero-width ssh", "amo​unt"], ["RTL override", "‮tnuoma"], ["fullwidth", "ａｍｏｕｎｔ"],
    ["turkish dotless", "AMOUNT".replace("I", "İ")], ["games with trailing dot", "games."], ["Games with unicode space", "games "],
  ];
  for (const [lbl, h] of hostileHero) {
    const r = await B(baseBody({ hero: h, heroAnswer: "A lot", heroFrom: "url" }));
    const hero = profProps(r)?.season1_hero;
    const expectHero = typeof h === "string" ? (["amount", "games", "screentime", "shortlist"].includes(h.trim().toLowerCase()) ? h.trim().toLowerCase() : "none") : "none";
    // "Games with unicode space": JS trim() removes NBSP, so "games " is accepted as games. Compare against that rule.
    check("C3", `hostile hero ${lbl} -> ${expectHero}, no error`, r.status === 200 && hero === expectHero && (hero !== "none" || profProps(r)!.season1_hero_answer === ""), `status=${r.status} hero=${hero}`);
    hs.add(String(hero));
  }
  check("C3", "only allowlisted hero values ever reach Klaviyo", [...hs].every((x) => ["amount", "games", "screentime", "shortlist", "none"].includes(x)), [...hs].join(","));

  // ---------- heroFrom ----------
  const hostileFrom: [string, unknown, string][] = [
    ["url", "url", "url"], ["ad-map", "ad-map", "ad-map"], ["split", "split", "split"], ["none", "none", "none"],
    ["URL upper", "URL", ""], ["padded", " url", ""], ["array", ["url"], ""], ["object", { a: 1 }, ""], ["number", 1, ""], ["null", null, ""], ["true", true, ""], ["missing", undefined, ""], ["empty", "", ""],
    ["unknown", "foo", ""], ["__proto__", "__proto__", ""], ["constructor", "constructor", ""], ["toString", "toString", ""], ["markup", "<b>url</b>", ""], ["10k", "u".repeat(10000), ""], ["url+NUL", "url\u0000", ""],
  ];
  for (const [lbl, v, want] of hostileFrom) {
    const over: any = { hero: "amount", heroAnswer: "A lot" }; if (v !== undefined) over.heroFrom = v;
    const r = await B(baseBody(over));
    check("C3", `heroFrom ${lbl} -> ${JSON.stringify(want)}`, r.status === 200 && evProps(r)!.hero_from === want, `got ${JSON.stringify(evProps(r)?.hero_from)}`);
  }
  // heroFrom never lands on the profile
  {
    const r = await B(baseBody({ hero: "amount", heroAnswer: "A lot", heroFrom: "url" }));
    check("C2", "heroFrom is event-only (no season1_hero_from on the profile)", !Object.keys(profProps(r)!).some((k) => /from/.test(k)));
    check("C2", "profile gets exactly season1_hero and season1_hero_answer as new keys", Object.keys(profProps(r)!).filter((k) => /hero/.test(k)).sort().join() === "season1_hero,season1_hero_answer");
    check("C2", "event gets exactly hero, hero_answer, hero_from as new keys", Object.keys(evProps(r)!).filter((k) => /hero/.test(k)).sort().join() === "hero,hero_answer,hero_from");
    check("C2", "all hero property values are strings", [...Object.values(profProps(r)!), ...Object.values(evProps(r)!)].every((v) => typeof v === "string"));
  }

  // ---------- C4 hostile answer ----------
  const hostileAns: [string, unknown][] = [
    ["array", ["Soccer", "Dance"]], ["object", { a: "Soccer" }], ["number", 42], ["true", true], ["null", null], ["__proto__", "__proto__"], ["constructor", "constructor"],
    ["10k chars", "a".repeat(10000)], ["10k words", "word ".repeat(5000)], ["201 chars", "b".repeat(201)], ["200 chars", "c".repeat(200)], ["199 chars + space + x", "d".repeat(199) + " x"],
    ["img onerror", "<img src=x onerror=alert(1)>"], ["svg onload", "<svg/onload=alert(1)>"], ["script", "<script>alert(document.cookie)</script>"], ["javascript url", "javascript:alert(1)"], ["data url", "data:text/html;base64,PHNjcmlwdD4="],
    ["https url", "https://evil.example.com/path?a=b&c=d#frag"], ["bare domain", "evil.com"], ["mailto", "mailto:a@b.co"], ["markdown link", "[click](http://evil.com)"], ["html entity", "&lt;script&gt;alert(1)&lt;/script&gt;"], ["numeric entity", "&#60;script&#62;"],
    ["klaviyo template", "{{ person.email }} {% include 'x' %} {{ 7*7 }}"], ["django filter", "{{ 'a'|upper }}"], ["jinja dollar", "${7*7} #{7*7} %{7*7}"], ["sql", "'; DROP TABLE users;--"], ["sql2", "\" OR 1=1 --"],
    ["csv formula", "=HYPERLINK(\"http://evil\",\"x\")"], ["csv formula minus", "-2+3+cmd|' /C calc'!A0"], ["at formula", "@SUM(1+1)"], ["plus formula", "+1+1"],
    ["RTL override", "‮evil‬ Soccer"], ["LRM RLM", "So‎cc‏er"], ["zero width", "So​cc​er﻿"], ["BOM", "﻿Soccer"], ["control chars", "So\u0000cc\u0007er\u001b[31m\u007f\u0085"], ["newlines", "Soccer\nDance\r\nPiano\tx"],
    ["line sep", "a b c"], ["emoji", "Soccer ⚽️ 🎮 Dance"], ["combining marks", "Café"], ["astral letters", "𝐒𝐨𝐜𝐜𝐞𝐫"], ["CJK", "サッカー、ダンス"], ["Arabic", "كرة القدم، الرقص"], ["fullwidth angle", "＜script＞alert(1)＜/script＞"],
    ["null byte", "Soccer\u0000"], ["backslash json", "\\\"},\"hero\":\"games\",\"x\":\""], ["json breakout", "\",\"season1_hero\":\"amount"], ["curly quotes", "“Five more minutes.”"], ["straight quote", "He said \"no\""], ["apostrophes", "I can't, can’t, 'quoted'"], ["ampersand", "Tom & Jerry"], ["hyphen lead", "-leading hyphen"], ["percent encoded", "%3Cscript%3E"],
    ["only symbols", "<>/\\{}[]()=+*#@$%^|~`;:_"], ["only spaces", "          "], ["emoji only", "🎮🎮🎮"],
  ];
  for (const [lbl, a] of hostileAns) {
    const r = await B(baseBody({ hero: "shortlist", heroAnswer: a, heroFrom: "url" }));
    const got = profProps(r)?.season1_hero_answer ?? "<missing>";
    const exp = oracleAnswer(a) || "skipped";
    const evGot = evProps(r)?.hero_answer;
    const ok = r.status === 200 && got === exp && evGot === got && ALLOWED_RE.test(got === "skipped" ? "" : got) && got.length <= 200;
    check("C4", `hostile answer ${lbl} -> ${JSON.stringify(got.length > 60 ? got.slice(0, 40) + `...(${got.length})` : got)} (oracle match, allowlist only, <=200)`, ok, `got=${JSON.stringify(got)} exp=${JSON.stringify(exp)}`);
    // Never any markup/link/template/control characters, and well-formed UTF-16 on the wire.
    const wire = evCall(r)?.rawBody || "";
    check("C4", `  ${lbl}: no < > = ( ) / : ; { } [ ] | $ % @ # + \\ or control chars in stored answer`, !/[<>=()\/:;{}\[\]|$%@#+\\\u0000-\u001f\u007f-\u009f]/.test(got));
    check("N11", `  ${lbl}: stored answer is well-formed UTF-16 (no lone surrogate; JSON.stringify escapes them so the wire text alone cannot show it)`, (got as any).isWellFormed(), `answer len ${got.length}`);
  }
  // Truncation boundary behavior
  {
    const r = await B(baseBody({ hero: "amount", heroAnswer: "a" + "𝐀".repeat(150), heroFrom: "url" }));
    const got = profProps(r)!.season1_hero_answer;
    const wf = (got as any).isWellFormed();
    check("N11", "astral-letter answer cut at 200 UTF-16 units leaves a well-formed string", wf, `len=${got.length}, last code unit=0x${got.charCodeAt(got.length - 1).toString(16)}`);
    const r2 = await B(baseBody({ hero: "amount", heroAnswer: "a" + "b".repeat(300), heroFrom: "url" }));
    check("C4", "200 char cap on plain ASCII", profProps(r2)!.season1_hero_answer.length === 200);
    const r3 = await B(baseBody({ hero: "amount", heroAnswer: "x" + " ".repeat(400) + "y", heroFrom: "url" }));
    const g3 = profProps(r3)!.season1_hero_answer;
    check("C4", "cap is applied after trim, so a 200-char cut inside a long whitespace run can leave trailing spaces (interior whitespace is not collapsed)", g3 === g3.trim(), JSON.stringify(g3.length));
  }
  // Perf: regex on very large inputs (ReDoS / DoS)
  for (const [lbl, s] of [["5MB allowed chars", "a".repeat(5_000_000)], ["5MB alternating", "a<".repeat(2_500_000)], ["5MB spaces then junk", " ".repeat(5_000_000) + "<"], ["2MB astral", "𝐀".repeat(1_000_000)]] as const) {
    const t0 = performance.now();
    const r = await B(baseBody({ hero: "amount", heroAnswer: s, heroFrom: "url" }));
    const ms = performance.now() - t0;
    check("N11", `perf ${lbl}: handled in <1500 ms, status 200 (took ${ms.toFixed(0)} ms)`, ms < 1500 && r.status === 200, `status=${r.status}`);
  }
  // Prototype pollution via raw JSON
  {
    const raw = `{"email":"sentry+pp@example.com","source":"ad-landing","ad":"d3","__proto__":{"hero":"amount","heroAnswer":"polluted","season1_hero":"x"},"constructor":{"prototype":{"hero":"games"}},"hero":{"__proto__":{"toString":"amount"}},"heroAnswer":{"__proto__":{"a":1}},"heroFrom":"url"}`;
    const r = await B(null, { raw });
    check("N11", "prototype pollution body: no 5xx, hero none, Object.prototype untouched", r.status === 200 && profProps(r)!.season1_hero === "none" && ({} as any).hero === undefined && ({} as any).season1_hero === undefined && ({} as any).heroAnswer === undefined, JSON.stringify(profProps(r)));
    const r2 = await B(null, { raw: `{"email":"sentry+pp2@example.com","source":"site-popup","__proto__":{"hero":"amount"},"hero":"amount"}` });
    check("C6", "popup + __proto__ hero: no hero keys", !HERO_KEYS_EVENT.some((k) => k in evProps(r2)!) && !HERO_KEYS_PROFILE.some((k) => k in profProps(r2)!));
    const r3 = await B(null, { raw: `{"email":"sentry+pp3@example.com","source":"ad-landing","__proto__":{"source":"site-popup"},"hero":"amount","heroAnswer":"A lot"}` });
    check("N11", "__proto__ cannot flip source", profProps(r3)!.season1_source === "ad-landing");
  }

  // ---------- non-object / malformed bodies ----------
  for (const [lbl, raw] of [["array body", "[]"], ["string body", '"x"'], ["null body", "null"], ["invalid json", "{bad"], ["empty body", ""], ["number body", "5"]] as const) {
    const b = await B(null, { raw }), f = await Rf(null, { raw });
    check("N11", `${lbl}: build matches origin/dev (status ${b.status})`, b.status === f.status && JSON.stringify(b.json) === JSON.stringify(f.json) && b.calls.length === 0);
  }

  // ---------- C6 site-popup: hero fields never written ----------
  for (const [lbl, over] of [
    ["explicit popup", { source: "site-popup" }], ["source missing", { source: undefined }], ["source unknown", { source: "evil" }], ["source array", { source: ["ad-landing"] }], ["source object", { source: { a: 1 } }], ["source number", { source: 5 }], ["source AD-LANDING uppercase", { source: "AD-LANDING" }], ["source padded", { source: " ad-landing" }],
  ] as const) {
    const body: any = baseBody({ hero: "amount", heroAnswer: "Way too much", heroFrom: "url", attributionFrom: "session", ...over });
    if ((over as any).source === undefined) delete body.source;
    const b = await B(body), f = await Rf(body);
    const e = evProps(b)!, p = profProps(b)!;
    check("C6", `popup variant "${lbl}": zero hero keys on profile and event`, !HERO_KEYS_EVENT.some((k) => k in e) && !HERO_KEYS_PROFILE.some((k) => k in p) && p.season1_source === "site-popup", JSON.stringify({ e, p }));
    check("C6", `popup variant "${lbl}": all outbound calls byte-identical to origin/dev`, normCalls(b.calls) === normCalls(f.calls) && b.status === f.status && JSON.stringify(b.json) === JSON.stringify(f.json));
    check("N1", `popup variant "${lbl}": CAPI payload content_name season_one_popup, identical to origin/dev`, capiCall(b)?.body?.data?.[0]?.custom_data?.content_name === "season_one_popup" && JSON.stringify(mask(capiCall(b)?.body)) === JSON.stringify(mask(capiCall(f)?.body)));
  }

  // ---------- N11 steps ----------
  for (const [lbl, step, extra] of [["games", "games", { kidGames: "Fortnite, Minecraft" }], ["age", "age", { kidAge: "10-12" }]] as const) {
    for (const src of ["ad-landing", "site-popup"]) {
      const body = { email: "sentry+step@example.com", step, ...extra, source: src, hero: "amount", heroAnswer: "A lot", heroFrom: "url", ad: "d3", eventId: "e1" };
      const b = await B(body), f = await Rf(body);
      const props = evProps(b)!, pp = profProps(b)!;
      check("N11", `step ${lbl} (${src}) with hero fields: no hero keys, identical to origin/dev`, !HERO_KEYS_EVENT.some((k) => k in props) && !HERO_KEYS_PROFILE.some((k) => k in pp) && normCalls(b.calls) === normCalls(f.calls) && b.status === f.status, JSON.stringify(props));
      check("N11", `step ${lbl} (${src}): one Klaviyo event only, no subscribe, no CAPI`, b.calls.length === 1 && !capiCall(b) && !subCall(b));
    }
  }
  {
    const b = await B({ email: "sentry+step@example.com", step: "bogus", hero: "amount" }), f = await Rf({ email: "sentry+step@example.com", step: "bogus", hero: "amount" });
    check("N4", "unknown step -> 400, no calls (same as origin/dev)", b.status === 400 && f.status === 400 && b.calls.length === 0);
  }

  // ---------- N4 honeypot ----------
  for (const hp of ["x", "http://spam", " y ", "0"]) {
    const b = await B(baseBody({ ekz_hp: hp, hero: "amount", heroAnswer: "A lot", heroFrom: "url" }));
    check("N4", `honeypot ${JSON.stringify(hp)} with hero fields: 200, zero outbound calls`, b.status === 200 && b.json?.ok === true && b.calls.length === 0, `calls=${b.calls.length}`);
  }
  {
    const b = await B(baseBody({ ekz_hp: "   ", hero: "amount", heroAnswer: "A lot", heroFrom: "url" })), f = await Rf(baseBody({ ekz_hp: "   " }));
    check("N4", "whitespace-only honeypot is treated as empty (same as origin/dev): sign-up proceeds", b.calls.length === f.calls.length && b.calls.length === 3);
  }

  // ---------- N4 failure paths ----------
  for (const [lbl, m] of [["Klaviyo event 500", 500], ["Klaviyo event 401", 401], ["Klaviyo event 429", 429], ["Klaviyo event network throw", "throw"]] as const) {
    mode.event = m as any;
    const b = await B(baseBody({ hero: "amount", heroAnswer: "A lot", heroFrom: "url" })), f = await Rf(baseBody({}));
    check("N4", `${lbl}: 502 and ok:false, no subscribe, no CAPI Lead (build)`, b.status === 502 && b.json?.ok === false && b.calls.length === 1 && !capiCall(b) && !subCall(b), `status=${b.status} calls=${b.calls.length}`);
    check("N4", `${lbl}: same status/body as origin/dev`, b.status === f.status && JSON.stringify(b.json) === JSON.stringify(f.json) && f.calls.length === b.calls.length);
    check("N4", `${lbl}: error body does not echo the answer or hero`, !/amount|A lot|hero/i.test(JSON.stringify(b.json)));
  }
  mode.event = 200;
  for (const [lbl, m] of [["subscribe 500", 500], ["subscribe network throw", "throw"]] as const) {
    mode.subscribe = m as any;
    const b = await B(baseBody({ hero: "games", heroAnswer: "Fortnite", heroFrom: "ad-map" })), f = await Rf(baseBody({}));
    check("N4", `${lbl}: still 200 and CAPI Lead still sent`, b.status === 200 && !!capiCall(b) && b.json?.ok === true && b.status === f.status && !!capiCall(f));
  }
  mode.subscribe = 200;
  for (const [lbl, m] of [["CAPI 500", 500], ["CAPI network throw", "throw"]] as const) {
    mode.capi = m as any;
    const b = await B(baseBody({ hero: "games", heroAnswer: "Fortnite", heroFrom: "ad-map" }));
    check("N4", `${lbl}: sign-up still 200`, b.status === 200 && b.json?.ok === true);
  }
  mode.capi = 200;
  {
    const sk = process.env.KLAVIYO_PRIVATE_API_KEY;
    check("N4", "env present for harness", !!sk);
  }

  // ---------- N1: CAPI + Klaviyo subscribe unchanged ----------
  const n1Bodies: [string, any][] = [
    ["page A d7 no hero keys", baseBody({ ad: "d7" })],
    ["page A d7 hero none", baseBody({ ad: "d7", hero: "none", heroAnswer: "", heroFrom: "none" })],
    ["hero amount", baseBody({ ad: "d1", hero: "amount", heroAnswer: "Way too much", heroFrom: "ad-map" })],
    ["hero games", baseBody({ ad: "d3", hero: "games", heroAnswer: "Fortnite, Something else", heroFrom: "ad-map" })],
    ["hero screentime", baseBody({ ad: "d2", hero: "screentime", heroAnswer: "“Five more minutes.”", heroFrom: "ad-map" })],
    ["hero shortlist", baseBody({ ad: "d5", hero: "shortlist", heroAnswer: "Soccer, Dance", heroFrom: "ad-map" })],
    ["hero split d10", baseBody({ ad: "d10", hero: "games", heroAnswer: "I have no idea", heroFrom: "split" })],
    ["hostile hero+answer", baseBody({ ad: "d4", hero: ["x"], heroAnswer: "<img onerror=1>", heroFrom: { a: 1 } })],
    ["no eventId (server makes one)", baseBody({ ad: "d6", eventId: undefined, hero: "amount", heroAnswer: "A lot", heroFrom: "url" })],
    ["eventId with junk", baseBody({ ad: "d6", eventId: "ev<>-1_2 3", hero: "amount" })],
    ["explicit hero in eventSourceUrl", baseBody({ ad: "d3", eventSourceUrl: "https://ekuzo.gg/season1?ad=d3&hero=games&fbclid=Q", hero: "games", heroAnswer: "Roblox", heroFrom: "url" })],
    ["javascript: eventSourceUrl", baseBody({ ad: "d3", eventSourceUrl: "javascript:alert(1)", hero: "games" })],
    ["d13 (not an ad id)", baseBody({ ad: "d13", hero: "amount", heroAnswer: "A lot", heroFrom: "url" })],
    ["d010 quirk", baseBody({ ad: "d010", hero: "amount", heroAnswer: "A lot", heroFrom: "url" })],
    ["bad ad", baseBody({ ad: "zzz", hero: "amount", heroAnswer: "A lot", heroFrom: "url" })],
  ];
  for (const [lbl, body] of n1Bodies) {
    const b = await B(body), f = await Rf(body);
    const bc = capiCall(b), fc = capiCall(f);
    check("N1", `CAPI request identical to origin/dev (minus event_time): ${lbl}`, !!bc && !!fc && JSON.stringify(mask(bc.body)) === JSON.stringify(mask(fc.body)) && bc.url === fc.url && JSON.stringify(bc.headers) === JSON.stringify(fc.headers));
    const raw = bc?.rawBody || "";
    const answer = String(body.heroAnswer ?? "");
    const leak = /hero|season1_hero/i.test(raw.replace(/event_source_url":"[^"]*"/, "")) || (answer.length > 2 && raw.includes(answer));
    check("N1", `no hero key or answer text anywhere in the CAPI body (excluding event_source_url): ${lbl}`, !leak, raw.slice(0, 200));
    const sb = subCall(b), sf = subCall(f);
    check("N1", `Klaviyo subscribe call identical to origin/dev: ${lbl}`, !!sb && !!sf && JSON.stringify(mask(sb.body)) === JSON.stringify(mask(sf.body)) && JSON.stringify(sb.headers) === JSON.stringify(sf.headers));
    check("N1", `exact set of outbound URLs identical to origin/dev: ${lbl}`, JSON.stringify(b.calls.map((c) => c.url.replace(/fb\.1\.\d+\./, ""))) === JSON.stringify(f.calls.map((c) => c.url.replace(/fb\.1\.\d+\./, ""))));
    if (bc) {
      const d0 = bc.body.data[0];
      check("N1", `CAPI event_name Lead, content_name season_one_<ad>, user_data keys unchanged: ${lbl}`, d0.event_name === "Lead" && /^season_one_(d\d+|landing)$/.test(d0.custom_data.content_name) && Object.keys(d0.custom_data).join() === "content_name" && Object.keys(d0.user_data).sort().join() === "client_ip_address,client_user_agent,em,fbc,fbp", JSON.stringify(d0.custom_data) + Object.keys(d0.user_data));
    }
  }
  // Demonstrate the one place a hero id can reach Meta: client-supplied event_source_url.
  {
    const r = await B(baseBody({ eventSourceUrl: "https://ekuzo.gg/season1?ad=d3&hero=games&fbclid=Q", hero: "games", heroAnswer: "Roblox", heroFrom: "url" }));
    say(`INFO event_source_url passes through to Meta verbatim, incl. ?hero=: ${capiCall(r)?.body?.data?.[0]?.event_source_url}`);
  }

  // ---------- full pre-existing-property comparison: page A body without hero fields ----------
  {
    const bodies: [string, any][] = [
      ["page A d7 (no hero fields)", baseBody({ ad: "d7" })],
      ["page A d11", baseBody({ ad: "d11" })],
      ["page A bare (no ad)", baseBody({ ad: "" })],
      ["page A with firstName", baseBody({ ad: "d12", firstName: "  Pat  " })],
      ["no attribution", baseBody({ ad: "d7", attribution: undefined })],
      ["hostile attribution", baseBody({ ad: "d7", attribution: { utm_source: ["x"], utm_content: "z".repeat(500), site: { a: 1 } } })],
      ["ad-landing d3 with hero fields", baseBody({ ad: "d3", hero: "games", heroAnswer: "Fortnite", heroFrom: "ad-map" })],
      ["ad-landing d10 split", baseBody({ ad: "d10", hero: "amount", heroAnswer: "A lot", heroFrom: "split" })],
    ];
    for (const [lbl, body] of bodies) {
      const b = await B(body), f = await Rf(body);
      const same = normCalls(b.calls, true) === normCalls(f.calls, false);
      check("N3/N4", `every pre-existing profile/event/subscribe/CAPI property identical to origin/dev once the 5 new hero keys are removed: ${lbl}`, same && b.status === f.status && JSON.stringify(b.json) === JSON.stringify(f.json));
      const eb = evProps(b)!, ef = evProps(f)!, pb = profProps(b)!, pf = profProps(f)!;
      const addedE = Object.keys(eb).filter((k) => !(k in ef)).sort().join(), addedP = Object.keys(pb).filter((k) => !(k in pf)).sort().join();
      check("N3/N4", `only additions are event {hero,hero_answer,hero_from} and profile {season1_hero,season1_hero_answer}: ${lbl}`, addedE === "hero,hero_answer,hero_from" && addedP === "season1_hero,season1_hero_answer", `${addedE} | ${addedP}`);
      if (lbl.startsWith("page A d7")) say(`INFO key diff for ${lbl}: event +[${addedE}], profile +[${addedP}]`);
    }
    // Header/geo/device parity
    const body = baseBody({ ad: "d7" });
    const b = await B(body, { headers: { "x-nf-geo": "not-base64-json", "user-agent": "curl/8" } }), f = await Rf(body, { headers: { "x-nf-geo": "not-base64-json", "user-agent": "curl/8" } });
    check("N3/N4", "geo/device parsing unchanged with odd headers", normCalls(b.calls, true) === normCalls(f.calls, false));
  }

  // ---------- email / validation parity ----------
  for (const em of ["", "nope", "a@b", "a@b.c", "ａ@b.co", "a\u0000@b.co", "x@y.co\n", "a b@c.de", "A@B.CO", "a".repeat(300) + "@b.co"]) {
    const body = baseBody({ email: em, hero: "amount", heroAnswer: "A lot", heroFrom: "url" });
    const b = await B(body), f = await Rf(body);
    check("N4", `email ${JSON.stringify(em.slice(0, 20))}: same status as origin/dev (${b.status})`, b.status === f.status && b.calls.length === f.calls.length);
  }
  // no env key
  {
    const saved = process.env.KLAVIYO_PRIVATE_API_KEY;
    say(`INFO env KLAVIYO_PRIVATE_API_KEY was ${saved ? "set" : "unset"} for this run`);
  }

  // ---------- summary ----------
  const byReq: Record<string, { pass: number; fail: number }> = {};
  for (const r of results) for (const k of r.id.split("/")) { byReq[k] ??= { pass: 0, fail: 0 }; r.ok ? byReq[k].pass++ : byReq[k].fail++; }
  say("\n=== SUMMARY BY REQUIREMENT TAG ===");
  for (const [k, v] of Object.entries(byReq).sort()) say(`${k}: ${v.pass} pass, ${v.fail} fail`);
  const fails = results.filter((r) => !r.ok);
  say(`TOTAL: ${results.length - fails.length} pass, ${fails.length} fail`);
  if (fails.length) { say("FAILURES:"); fails.forEach((f) => say(`  [${f.id}] ${f.name} :: ${f.detail}`)); }
  fs.writeFileSync(process.env.OUT_TXT || "/tmp/sentry-harness-out.txt", out.join("\n") + "\n");
  fs.writeFileSync((process.env.OUT_TXT || "/tmp/sentry-harness-out.txt").replace(/\.txt$/, ".logs.txt"), logs.join("\n") + "\n");
  process.stdout.write(out.join("\n") + "\n");
}
main().catch((e) => { process.stdout.write("HARNESS CRASH: " + (e?.stack || e) + "\n"); process.exit(2); });
