import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {
  CLARITY_PAGES,
  GA4_ID,
  PIXEL_ID,
  URL_ALLOW_KEYS,
  okClarityValue,
  renderStaticTags,
  renderTags,
  renderUrlAllow,
  tagsAreLive,
  type DynamicPage,
} from "../tags";
import { redirectToBare } from "../redirect";

/**
 * Analytics build, front end (spec S1 to S4, S12; resolution C8 to C14, P1, P4).
 * Renderer output per host and page, the address bar allow list, the templates,
 * and the route GET output (ops 4: the rendered page, not only the template).
 */

const VENDOR = /googletagmanager|fbevents|facebook\.com\/tr|connect\.facebook|clarity\.ms/;
const QA_BLOCK = /<script>\/\* s1 QA gate[\s\S]*?<\/script>/g;
const LIVE_HOSTS = ["ekuzo.gg", "www.ekuzo.gg", "EKUZO.GG:443"];
const OTHER_HOSTS = ["season1-commit--ekuzo.netlify.app", "ekuzo.netlify.app", "localhost:3105", "ekuzo.gg.evil.example", "", null, undefined];
const PAGES: DynamicPage[] = ["join", "signup", "welcome", "crew"];

function scripts(html: string): string[] {
  const out: string[] = [];
  const re = /<script(?![^>]*\bsrc=)(?![^>]*application\/(?:ld\+)?json)[^>]*>([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function parses(html: string) {
  for (const s of scripts(html)) assert.doesNotThrow(() => new Function(s), s.slice(0, 120));
}

/** vm objects come from another realm; compare plain copies. */
const plain = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const q2 = (v: unknown): unknown[][] => plain(((v as unknown[]) ?? []).map((a) => Array.from(a as ArrayLike<unknown>)));

/** Runs rendered head tags in a bare sandbox and returns what they queued. */
function runTags(html: string, url: string, opts: { cookie?: string; storage?: Map<string, string> } = {}) {
  const u = new URL(url);
  const store = opts.storage ?? new Map<string, string>();
  const appended: string[] = [];
  const el = () => {
    const e: Record<string, unknown> = {};
    return e;
  };
  const anchor = { parentNode: { insertBefore: (e: { src?: string }) => appended.push(String(e.src)) } };
  const doc = {
    cookie: opts.cookie ?? "",
    head: { appendChild: (e: { src?: string }) => appended.push(String(e.src)) },
    documentElement: {},
    createElement: el,
    getElementsByTagName: () => [anchor],
  };
  const win: Record<string, unknown> = {
    document: doc,
    location: { href: u.href, search: u.search, origin: u.origin, pathname: u.pathname, hostname: u.hostname, protocol: u.protocol },
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
    URLSearchParams,
    URL,
    Date,
  };
  win.window = win;
  const ctx = vm.createContext(win);
  for (const s of scripts(html)) vm.runInContext(s, ctx);
  const dl = q2(win.dataLayer);
  const fb = q2((win.fbq as { queue?: unknown[] } | undefined)?.queue);
  const cl = q2((win.clarity as { q?: unknown[] } | undefined)?.q);
  return { win, doc, dl, fb, cl, appended, store };
}

describe("tags renderer: live hosts", () => {
  it("live only on ekuzo.gg or www and mode not test; mode off still measures; missing host is non-live", () => {
    for (const h of LIVE_HOSTS) {
      assert.equal(tagsAreLive(h, "live"), true, String(h));
      assert.equal(tagsAreLive(h, "off"), true, String(h));
      assert.equal(tagsAreLive(h, "test"), false, String(h));
    }
    for (const h of OTHER_HOSTS) for (const m of ["live", "off", "test"] as const) assert.equal(tagsAreLive(h, m), false, `${h} ${m}`);
  });

  for (const page of PAGES) {
    it(`${page}: live render has GA4, never debug_mode or the QA script, and parses`, () => {
      const html = renderTags({ host: "ekuzo.gg", mode: "live", page, orderRef: "abc234defg" });
      assert.ok(html.includes(GA4_ID));
      assert.match(html, /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-8LM45PX53W"><\/script>/);
      assert.doesNotMatch(html, /debug_mode|s1_qa|s1qa|S1QA_|QA gate|consent/);
      parses(html);
    });
  }

  it("Pixel on join, sign-up and welcome only, autoConfig false before init (C11)", () => {
    for (const page of PAGES) {
      const html = renderTags({ host: "ekuzo.gg", mode: "off", page });
      if (page === "crew") {
        assert.doesNotMatch(html, /fbevents|fbq\(/, page);
        continue;
      }
      const set = html.indexOf(`fbq('set','autoConfig',false,"${PIXEL_ID}")`);
      const init = html.indexOf(`fbq('init',"${PIXEL_ID}")`);
      assert.ok(set > 0 && init > set, page);
    }
  });

  it("Clarity per P1: join, sign-up, welcome, thanks; never crew", () => {
    assert.equal(CLARITY_PAGES.crew, false);
    for (const page of PAGES) {
      const html = renderTags({ host: "ekuzo.gg", mode: "live", page });
      assert.equal(/clarity\.ms/.test(html), page !== "crew", page);
      assert.doesNotMatch(html, /clarity\('identify'/);
    }
  });

  it("join queues page_view config with kept params only, PageView then ViewContent", () => {
    const html = renderTags({ host: "ekuzo.gg", mode: "live", page: "join" });
    const r = runTags(html, "https://ekuzo.gg/season1/join?utm_source=meta&utm_campaign=s1&src=ad&fbclid=AbC&gclid=G1");
    const config = r.dl.find((a) => a[0] === "config");
    assert.deepEqual(config, ["config", GA4_ID, { page_location: "https://ekuzo.gg/season1/join?utm_source=meta&utm_campaign=s1&gclid=G1&fbclid=AbC" }]);
    assert.ok(!r.dl.some((a) => a[0] === "consent"));
    assert.deepEqual(r.fb.map((a) => a.slice(0, 2)), [["set", "autoConfig"], ["init", PIXEL_ID], ["track", "PageView"], ["track", "ViewContent"]]);
    assert.deepEqual(r.cl, [["set", "page", "join"], ["set", "src", "ad"], ["set", "utm_campaign", "s1"]]);
  });

  it("sign-up: no ViewContent; Clarity utm tags fall back to the last-click cookie, never an email or code", () => {
    const lc = encodeURIComponent(JSON.stringify({ path: "/season1/join", ts: Date.now(), utm_campaign: "s1-email", utm_content: "jo@example.com" }));
    const html = renderTags({ host: "ekuzo.gg", mode: "live", page: "signup", cookie: `ekuzo_lc=${lc}` });
    const r = runTags(html, "https://ekuzo.gg/season1/join/signup?src=email");
    assert.deepEqual(r.fb.map((a) => a[1]), ["autoConfig", PIXEL_ID, "PageView"]);
    assert.deepEqual(r.cl, [["set", "page", "signup"], ["set", "src", "email"], ["set", "utm_campaign", "s1-email"]]);
    assert.equal(okClarityValue("48271937"), false);
    assert.equal(okClarityValue("a@b.co"), false);
    assert.equal(okClarityValue("d2-a-cantpause"), true);
  });

  it("crew: GA4 only, /crew/ path plus kept params, signals off", () => {
    const html = renderTags({ host: "ekuzo.gg", mode: "live", page: "crew" });
    const r = runTags(html, "https://ekuzo.gg/crew/48271937?utm_source=sms");
    assert.deepEqual(r.dl.find((a) => a[0] === "config"), [
      "config",
      GA4_ID,
      { page_location: "https://ekuzo.gg/crew/?utm_source=sms", allow_google_signals: false, allow_ad_personalization_signals: false },
    ]);
    assert.equal(r.win.fbq, undefined);
    assert.equal(r.win.clarity, undefined);
    assert.equal(r.win.s1px, undefined);
    assert.ok(!JSON.stringify(r.dl).includes("48271937"));
  });

  it("welcome: page_referrer is the origin; Pixel PageView once per order", () => {
    const html = renderTags({ host: "ekuzo.gg", mode: "live", page: "welcome", orderRef: "abc234defg" });
    const storage = new Map<string, string>();
    const r1 = runTags(html, "https://ekuzo.gg/season1/join/welcome", { storage });
    assert.equal((r1.dl.find((a) => a[0] === "config")![2] as Record<string, string>).page_referrer, "https://ekuzo.gg");
    assert.ok(r1.fb.some((a) => a[0] === "track" && a[1] === "PageView"));
    assert.match(String(r1.doc.cookie), /^s1_pxpv_abc234defg=1; Path=\/season1; Max-Age=31536000; SameSite=Lax; Secure$/);
    // The pending state refreshes every 4 s: same order, no second PageView (localStorage or the cookie).
    const r2 = runTags(html, "https://ekuzo.gg/season1/join/welcome", { storage });
    assert.ok(!r2.fb.some((a) => a[1] === "PageView"));
    const r3 = runTags(html, "https://ekuzo.gg/season1/join/welcome", { cookie: "x=1; s1_pxpv_abc234defg=1" });
    assert.ok(!r3.fb.some((a) => a[1] === "PageView"));
    // A bad ref is never embedded.
    assert.doesNotMatch(renderTags({ host: "ekuzo.gg", mode: "live", page: "welcome", orderRef: "</script><x>" }), /<x>/);
  });

  it("live s1px sends Purchase and InitiateCheckout as standard events with the eventID", () => {
    const r = runTags(renderTags({ host: "ekuzo.gg", mode: "live", page: "welcome" }), "https://ekuzo.gg/season1/join/welcome");
    (r.win.s1px as (e: string, p: object, id?: string) => void)("Purchase", { value: 100, currency: "USD" }, "abc234defg");
    const q = q2((r.win.fbq as { queue: unknown[] }).queue);
    assert.deepEqual(q[q.length - 1], ["track", "Purchase", { value: 100, currency: "USD" }, { eventID: "abc234defg" }]);
  });
});

describe("tags renderer: non-live hosts (QA gate)", () => {
  for (const host of OTHER_HOSTS) {
    it(`host ${JSON.stringify(host)}: one gated script, no vendor URL before the gate`, () => {
      for (const page of PAGES) {
        const html = renderTags({ host, mode: "test", page });
        assert.match(html, /^<script>\/\* s1 QA gate/);
        assert.equal(scripts(html).length, 1);
        assert.doesNotMatch(html, /<script async src/);
        assert.doesNotMatch(html.replace(QA_BLOCK, ""), VENDOR);
        const gate = html.indexOf("if(!qa)return;");
        const first = html.search(VENDOR);
        assert.ok(gate > 0 && (first < 0 || first > gate), `${page}: gate precedes vendor URLs`);
        parses(html);
      }
    });
  }
  it("the live host in test mode also gets only the gate", () => {
    assert.match(renderTags({ host: "ekuzo.gg", mode: "test", page: "join" }), /^<script>\/\* s1 QA gate/);
  });

  it("without the flag nothing loads or queues", () => {
    const r = runTags(renderTags({ host: "season1-commit--ekuzo.netlify.app", mode: "test", page: "signup" }), "https://season1-commit--ekuzo.netlify.app/season1/join/signup");
    assert.equal(r.win.gtag, undefined);
    assert.equal(r.win.fbq, undefined);
    assert.equal(r.win.clarity, undefined);
    assert.deepEqual(r.appended, []);
  });

  it("?s1qa=1 sets a session cookie and loads GA4 (debug, consent denied, signals off), Pixel, Clarity", () => {
    const html = renderTags({ host: "season1-commit--ekuzo.netlify.app", mode: "test", page: "join" });
    const r = runTags(html, "https://season1-commit--ekuzo.netlify.app/season1/join?s1qa=1&utm_campaign=x");
    assert.equal(r.doc.cookie, "s1_qa=1; Path=/; SameSite=Lax; Secure");
    assert.deepEqual(r.dl[1], ["consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }]);
    assert.deepEqual(r.dl[2], [
      "config",
      GA4_ID,
      { page_location: "https://season1-commit--ekuzo.netlify.app/season1/join?utm_campaign=x", allow_google_signals: false, allow_ad_personalization_signals: false, debug_mode: true },
    ]);
    (r.win.gtag as (...a: unknown[]) => void)("event", "season1_join_view");
    (r.win.gtag as (...a: unknown[]) => void)("event", "season1_pay_submit", { method: "card" });
    const dl = q2(r.win.dataLayer);
    assert.deepEqual(dl.slice(-2), [["event", "season1_join_view", { debug_mode: true }], ["event", "season1_pay_submit", { method: "card", debug_mode: true }]]);
    assert.ok(r.appended.some((s) => s.startsWith("https://www.googletagmanager.com/gtag/js")));
    assert.ok(r.appended.includes("https://connect.facebook.net/en_US/fbevents.js"));
    assert.ok(r.appended.includes("https://www.clarity.ms/tag/wml8wll5ua"));
  });

  it("a later page in the same session (cookie, no flag) still loads; ?s1qa=0 clears it", () => {
    const html = renderTags({ host: "season1-commit--ekuzo.netlify.app", mode: "test", page: "signup" });
    assert.ok(runTags(html, "https://season1-commit--ekuzo.netlify.app/season1/join/signup", { cookie: "s1_qa=1" }).win.gtag);
    const off = runTags(html, "https://season1-commit--ekuzo.netlify.app/season1/join/signup?s1qa=0", { cookie: "s1_qa=1" });
    assert.match(String(off.doc.cookie), /^s1_qa=; Path=\/; Max-Age=0/);
  });

  it("P4: QA Purchase and InitiateCheckout are S1QA_ custom events; PageView and ViewContent normal", () => {
    const r = runTags(renderTags({ host: "localhost:3105", mode: "test", page: "join" }), "http://localhost:3105/season1/join?s1qa=1");
    assert.equal(r.doc.cookie, "s1_qa=1; Path=/; SameSite=Lax");
    const px = r.win.s1px as (e: string, p: object, id?: string) => void;
    px("Purchase", { value: 100 }, "ord");
    px("InitiateCheckout", { value: 100 }, "h");
    const q = q2((r.win.fbq as { queue: unknown[] }).queue);
    assert.deepEqual(q.map((a) => a.slice(0, 2)), [
      ["set", "autoConfig"], ["init", PIXEL_ID], ["track", "PageView"], ["track", "ViewContent"],
      ["trackCustom", "S1QA_Purchase"], ["trackCustom", "S1QA_InitiateCheckout"],
    ]);
  });
});

describe("tags renderer: force-static pages (landing, thanks)", () => {
  it("thanks: GA4 and Clarity, no Pixel; live on ekuzo.gg, gated elsewhere", () => {
    const html = renderStaticTags("thanks");
    parses(html);
    assert.doesNotMatch(html, /fbevents|fbq\(/);
    const live = runTags(html, "https://ekuzo.gg/season1/thanks?play=league&utm_source=klaviyo");
    assert.deepEqual(live.dl.find((a) => a[0] === "config"), ["config", GA4_ID, { page_location: "https://ekuzo.gg/season1/thanks?utm_source=klaviyo" }]);
    assert.ok(!live.dl.some((a) => JSON.stringify(a).includes("debug_mode")));
    assert.deepEqual(live.cl[0], ["set", "page", "thanks"]);
    const branch = runTags(html, "https://season1-commit--ekuzo.netlify.app/season1/thanks?play=league");
    assert.equal(branch.win.gtag, undefined);
    assert.deepEqual(branch.appended, []);
    const qa = runTags(html, "https://season1-commit--ekuzo.netlify.app/season1/thanks?s1qa=1");
    assert.ok(JSON.stringify(qa.dl).includes("debug_mode"));
  });

  it("landing: Pixel (autoConfig before init in both branches), Clarity, plain GA4 config", () => {
    const html = renderStaticTags("landing");
    parses(html);
    const sets = [...html.matchAll(/fbq\('set','autoConfig',false,"1284038230557204"\)/g)].map((m) => m.index!);
    const inits = [...html.matchAll(/fbq\('init',"1284038230557204"\)/g)].map((m) => m.index!);
    assert.equal(sets.length, 2);
    assert.ok(sets[0] < inits[0] && sets[1] < inits[1]);
    const live = runTags(html, "https://www.ekuzo.gg/season1?ad=d1&utm_source=fb");
    assert.deepEqual(live.dl.find((a) => a[0] === "config"), ["config", GA4_ID, {}]);
    assert.ok(live.fb.some((a) => a[1] === "PageView"));
    assert.ok(live.appended.includes("https://www.clarity.ms/tag/wml8wll5ua"));
    assert.equal(runTags(html, "https://season1-commit--ekuzo.netlify.app/season1").win.fbq, undefined);
  });

  it("landing template: tags placeholder in the head, no hard-coded vendor tag, LIVE drops netlify.app", () => {
    const tpl = fs.readFileSync(path.join(process.cwd(), "app", "season1", "landing.html"), "utf8");
    const head = tpl.slice(0, tpl.indexOf("</head>"));
    assert.ok(head.includes("{{TAGS}}"));
    assert.doesNotMatch(head, VENDOR);
    assert.match(tpl, /const LIVE = \/\(\^\|\\\.\)ekuzo\\\.gg\$\|\^localhost\$\/\.test\(location\.hostname\);/);
    assert.doesNotMatch(tpl, /netlify\\\.app\$/);
  });
});

describe("address bar allow list (C10)", () => {
  function runAllow(html: string, url: string) {
    const u = new URL(url);
    const calls: unknown[][] = [];
    const ctx = vm.createContext({
      URL,
      URLSearchParams,
      location: { href: u.href },
      history: { state: null, replaceState: (...a: unknown[]) => calls.push(a) },
    });
    for (const s of scripts(html)) vm.runInContext(s, ctx);
    return calls;
  }
  it("keeps the eight kept params plus src and s1qa, drops the rest, keeps a plain hash", () => {
    assert.deepEqual([...URL_ALLOW_KEYS].sort(), ["fbclid", "gclid", "s1qa", "src", "utm_campaign", "utm_content", "utm_id", "utm_medium", "utm_source", "utm_term"]);
    const calls = runAllow(renderUrlAllow(), "https://ekuzo.gg/season1/join?utm_source=k&kid=Maya&_kx=abc.123&src=email&s1qa=1&from=Sam&fbclid=X1#faq");
    assert.deepEqual(calls, [[null, "", "/season1/join?utm_source=k&src=email&s1qa=1&fbclid=X1#faq"]]);
  });
  it("no call when nothing needs dropping; an odd hash is dropped", () => {
    assert.deepEqual(runAllow(renderUrlAllow(), "https://ekuzo.gg/season1/join?utm_campaign=a&src=ad"), []);
    assert.deepEqual(runAllow(renderUrlAllow(), "https://ekuzo.gg/crew/48271937#kid=Maya"), [[null, "", "/crew/48271937"]]);
  });
  it("thanks keeps play", () => {
    assert.deepEqual(runAllow(renderUrlAllow(["play"]), "https://ekuzo.gg/season1/thanks?play=league&_kx=1"), [[null, "", "/season1/thanks?play=league"]]);
  });
});

describe("templates (R1, C10, C16)", () => {
  const T: [string, string[]][] = [
    ["join", ["season1", "join", "join.html"]],
    ["signup", ["season1", "join", "signup", "signup.html"]],
    ["welcome", ["season1", "join", "welcome", "welcome.html"]],
    ["crew", ["crew", "[code]", "crew.html"]],
    ["thanks", ["season1", "thanks", "thanks.html"]],
  ];
  for (const [name, p] of T) {
    it(`${name}: URL_ALLOW then TAGS in the head, no hard-coded vendor tag, no history call after TAGS`, () => {
      const tpl = fs.readFileSync(path.join(process.cwd(), "app", ...p), "utf8");
      const a = tpl.indexOf("{{URL_ALLOW}}"), t = tpl.indexOf("{{TAGS}}"), h = tpl.indexOf("</head>");
      assert.ok(a > 0 && t > a && h > t, name);
      assert.doesNotMatch(tpl, VENDOR, name);
      assert.doesNotMatch(tpl.slice(t), /history\.(replaceState|pushState)/, name);
      assert.doesNotMatch(tpl, /\["kid","from"\]/, name);
    });
  }

  it("P1 masks: every element that prints a kid's name", () => {
    const w = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "welcome", "welcome.html"), "utf8");
    assert.match(w, /<h1 [^>]*data-clarity-mask="true">\{\{HERO\}\}<\/h1>/);
    assert.match(w, /<button [^>]*id="share"[^>]*data-clarity-mask="true">Share \{\{KID1\}\}'s link/);
    assert.match(w, /<div data-clarity-mask="true">\{\{RECEIPT_LINES\}\}<\/div>/);
    assert.match(w, /<p [^>]*data-clarity-mask="true">Help us build \{\{KID1\}\}'s team/);
    assert.match(w, /<p [^>]*data-clarity-mask="true"><b>\{\{LINK_SHORT\}\}<\/b>/);
    const s = fs.readFileSync(path.join(process.cwd(), "app", "season1", "join", "signup", "signup.html"), "utf8");
    assert.match(s, /<p id="invTxt" data-clarity-mask="true"><\/p>/);
    assert.match(s, /id="sum" data-clarity-mask="true"/);
    assert.match(s, /id="go" type="submit" data-clarity-mask="true"/);
    assert.match(s, /ks\.setAttribute\('data-clarity-mask','true'\);ks\.textContent=kn;/);
  });
});

describe("route GET output per host (R1, R2, ops 4)", () => {
  const saved: Record<string, string | undefined> = {};
  const realFetch = globalThis.fetch;
  const realError = console.error;
  const KEYS = ["STRIPE_SECRET_KEY", "DATABASE_URL", "S1_COMMIT_MODE", "S1_REF_SECRET"];
  before(() => {
    for (const k of KEYS) saved[k] = process.env[k];
    // Mode "off": the live host renders live tags (mode off still measures).
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.S1_COMMIT_MODE;
    process.env.DATABASE_URL = "postgresql://u:p@ep-lively-boat-b4fak1h6.us-east-2.aws.neon.tech/neondb";
    process.env.S1_REF_SECRET = "unit-ref-secret";
    globalThis.fetch = (async () => {
      throw new TypeError("unit: no network");
    }) as typeof fetch;
    console.error = () => {};
  });
  after(() => {
    globalThis.fetch = realFetch;
    console.error = realError;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  const req = (host: string, p: string) => new Request(`https://${host}${p}`, { headers: { host } });
  async function pages(host: string) {
    const join = await import("../../../app/season1/join/route");
    const signup = await import("../../../app/season1/join/signup/route");
    const crew = await import("../../../app/crew/[code]/route");
    const welcome = await import("../../../app/season1/join/welcome/route");
    return {
      join: await join.GET(req(host, "/season1/join?utm_source=x")).text(),
      signup: await (await signup.GET(req(host, "/season1/join/signup"))).text(),
      crew: await (await crew.GET(req(host, "/crew/48271937"), { params: Promise.resolve({ code: "48271937" }) })).text(),
      welcome: await (await welcome.GET(req(host, "/season1/join/welcome"))).text(),
    };
  }

  it("ekuzo.gg: GA4 on all four; Pixel init on join, sign-up, welcome; no placeholder left; no debug_mode", async () => {
    const p = await pages("ekuzo.gg");
    for (const [name, html] of Object.entries(p)) {
      assert.ok(html.includes("G-8LM45PX53W"), name);
      assert.doesNotMatch(html, /\{\{(TAGS|URL_ALLOW)\}\}|debug_mode|s1 QA gate/, name);
      assert.equal(html.includes(`fbq('init',"${PIXEL_ID}")`), name !== "crew", name);
      assert.equal(html.includes("clarity.ms"), name !== "crew", name);
      parses(html);
      // No history call after the first tag script (C10, privacy 11).
      const firstTag = html.indexOf("<script async src=\"https://www.googletagmanager.com");
      assert.ok(firstTag > 0, name);
      assert.doesNotMatch(html.slice(firstTag), /history\.(replaceState|pushState)/, name);
      assert.ok(html.lastIndexOf("history.replaceState", firstTag) > 0, `${name}: allow list precedes the tags`);
    }
  });

  it("branch deploy host: no vendor URL outside the QA gate", async () => {
    const p = await pages("season1-commit--ekuzo.netlify.app");
    for (const [name, html] of Object.entries(p)) {
      assert.match(html, /s1 QA gate/, name);
      assert.doesNotMatch(html.replace(QA_BLOCK, ""), VENDOR, name);
      assert.doesNotMatch(html, /\{\{(TAGS|URL_ALLOW)\}\}/, name);
    }
  });

  it("thanks and landing (force-static) render the client rule; redirect pages stay tag-free (C8)", async () => {
    const thanks = await import("../../../app/season1/thanks/route");
    const th = await thanks.GET().text();
    assert.match(th, /s1 QA gate/);
    assert.doesNotMatch(th, /\{\{(TAGS|URL_ALLOW)\}\}|fbevents/);
    assert.ok(th.indexOf("history.replaceState") < th.indexOf("s1 QA gate"));
    const landing = await import("../../../app/season1/route");
    const la = await landing.GET().text();
    assert.match(la, /s1 QA gate/);
    assert.doesNotMatch(la.slice(0, la.indexOf("</head>") + 7), /\{\{TAGS\}\}/);
    for (const target of ["/season1/join", "/season1", "/terms-of-service#season-01"]) {
      const html = await redirectToBare(new Request("https://ekuzo.gg/season1/early-access?kid=Maya"), target).text();
      assert.doesNotMatch(html, /googletagmanager|facebook|fbevents|clarity\.ms|gtag/);
    }
  });
});

describe("site layout (S12, F2)", () => {
  it("GA4, the Pixel and Clarity render only when the build context is production", () => {
    const src = fs.readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");
    assert.match(src, /const ANALYTICS_ON = process\.env\.S1_DEPLOY_CONTEXT === "production";/);
    const open = src.indexOf("{ANALYTICS_ON && (");
    const close = src.indexOf(")}", src.lastIndexOf('"wml8wll5ua"'));
    assert.ok(open > 0 && close > open);
    for (const needle of ["googletagmanager.com/gtag/js", 'id="ga4-init"', 'id="meta-pixel-init"', "facebook.com/tr?id=", 'id="ms-clarity"']) {
      const i = src.indexOf(needle);
      assert.ok(i > open && i < close, needle);
    }
    const cfg = fs.readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");
    assert.match(cfg, /S1_DEPLOY_CONTEXT: process\.env\.CONTEXT \|\| ""/);
  });
});
