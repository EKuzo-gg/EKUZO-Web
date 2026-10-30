import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  CLICK_ID_MAX,
  LC_COOKIE,
  LC_MAX_BYTES,
  UTM_MAX,
  buildLastClick,
  cleanFirstTouch,
  cleanPath,
  encodedSize,
  orderAttribution,
  parseLastClick,
  validFbc,
  validFbp,
} from "../attribution";
import { middleware } from "../../../middleware";

/**
 * Analytics S5, S6 with resolution C3 and C17 (money red team 7, 8; ops red
 * team 5, 6). The ekuzo_lc cookie and the order attribution built from it.
 */
const NOW = 1_793_000_000_000; // 2026-10-26, ms
const qs = (s: string) => new URLSearchParams(s);
const enc = (v: unknown) => encodeURIComponent(typeof v === "string" ? v : JSON.stringify(v));
const FBCLID = "IwAR2xYz_abc-DEF123";

describe("ekuzo_lc: buildLastClick (middleware logic)", () => {
  it("keeps only the eight kept keys, plus path and ts", () => {
    const r = buildLastClick(
      qs("utm_source=meta&utm_medium=paid&utm_campaign=s01&utm_content=ad7&utm_term=t&utm_id=9&gclid=G1&fbclid=" + FBCLID + "&kid=Sam&src=ad&email=a@b.c"),
      "/season1/join",
      NOW,
    );
    assert.ok(r);
    assert.deepEqual(Object.keys(r.lc).sort(), ["fbclid", "gclid", "path", "ts", "utm_campaign", "utm_content", "utm_id", "utm_medium", "utm_source", "utm_term"]);
    assert.equal(r.lc.path, "/season1/join");
    assert.equal(r.lc.ts, NOW);
    assert.deepEqual(JSON.parse(r.value), r.lc);
  });

  it("returns null with no kept parameter, so a plain visit never overwrites an earlier click", () => {
    assert.equal(buildLastClick(qs("src=ad&kid=Sam"), "/season1/join", NOW), null);
    assert.equal(buildLastClick(qs(""), "/season1/join", NOW), null);
  });

  it("returns null when no kept value survives cleaning (%00, non-ASCII only)", () => {
    assert.equal(buildLastClick(qs("utm_content=%00"), "/", NOW), null);
    assert.equal(buildLastClick(qs("utm_campaign=%F0%9F%98%80"), "/", NOW), null);
  });

  it("utm values: printable ASCII only, capped at 160", () => {
    const r = buildLastClick(qs(`utm_campaign=a%00b%0Ac%E2%80%94d&utm_content=${"x".repeat(400)}`), "/", NOW)!;
    assert.equal(r.lc.utm_campaign, "abcd");
    assert.equal(r.lc.utm_content!.length, UTM_MAX);
  });

  it("fbclid and gclid are kept whole up to 512 or dropped whole, never cut", () => {
    const long = "A".repeat(CLICK_ID_MAX);
    const r = buildLastClick(qs(`fbclid=${long}&gclid=${"B".repeat(CLICK_ID_MAX + 1)}&utm_source=x`), "/", NOW)!;
    assert.equal(r.lc.fbclid, long);
    assert.equal(r.lc.gclid, undefined);
    const spaced = buildLastClick(qs("fbclid=abc%20def&utm_source=x"), "/", NOW)!;
    assert.equal(spaced.lc.fbclid, undefined, "a click id with a space is dropped, not cleaned");
  });

  it("path: /crew/<code> is stored as /crew/; others capped at 128", () => {
    assert.equal(buildLastClick(qs("utm_source=x"), "/crew/48271937", NOW)!.lc.path, "/crew/");
    assert.equal(cleanPath("/CREW/abc"), "/crew/");
    assert.equal(cleanPath("/season1/" + "p".repeat(300)).length, 128);
    assert.equal(cleanPath("not-a-path"), "/");
  });

  it("the encoded cookie stays within 2048 bytes; utm_term is dropped first", () => {
    const fat = "%22".repeat(UTM_MAX); // 160 quotes: 6 encoded bytes each once JSON-escaped
    const p = UTM_KEYS_ALL.map((k) => `${k}=${fat}`).join("&") + `&fbclid=${"F".repeat(CLICK_ID_MAX)}&gclid=${"G".repeat(CLICK_ID_MAX)}`;
    const r = buildLastClick(qs(p), "/season1/join", NOW)!;
    assert.ok(encodedSize(r.value) <= LC_MAX_BYTES, `encoded ${encodedSize(r.value)}`);
    assert.equal(r.lc.utm_term, undefined, "utm_term goes first");
    assert.equal(r.lc.fbclid, "F".repeat(CLICK_ID_MAX), "fbclid kept");
  });
});

const UTM_KEYS_ALL = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];

describe("middleware: ekuzo_lc written before the first-touch early return (C17)", () => {
  const run = (url: string, headers: Record<string, string> = {}) =>
    middleware(new NextRequest(url, { headers: { "user-agent": "Mozilla/5.0 (iPhone)", ...headers } }));

  it("existing ekuzo_origin plus utm_campaign writes ekuzo_lc and leaves ekuzo_origin alone", () => {
    const res = run("https://ekuzo.gg/season1/join?utm_campaign=s01_email&utm_source=klaviyo", { cookie: "ekuzo_origin=paid_meta" });
    const lc = res.cookies.get(LC_COOKIE);
    assert.ok(lc, "ekuzo_lc set");
    assert.equal(JSON.parse(lc.value).utm_campaign, "s01_email");
    assert.equal(lc.httpOnly, true);
    assert.equal(lc.sameSite, "lax");
    assert.equal(lc.path, "/");
    assert.equal(lc.maxAge, 60 * 60 * 24 * 30);
    assert.equal(res.cookies.get("ekuzo_origin"), undefined, "first touch not rewritten");
    const header = res.headers.getSetCookie().find((c) => c.startsWith(`${LC_COOKIE}=`))!;
    assert.match(header, /HttpOnly/i);
    assert.ok(header.split(";")[0].length - LC_COOKIE.length - 1 <= LC_MAX_BYTES);
  });

  it("a first visit with utms sets both cookies", () => {
    const res = run("https://ekuzo.gg/season1/join?utm_source=meta&fbclid=" + FBCLID);
    assert.ok(res.cookies.get(LC_COOKIE));
    assert.equal(res.cookies.get("ekuzo_origin")?.value, "paid_meta");
  });

  it("no kept parameter: no ekuzo_lc (the earlier click survives)", () => {
    const res = run("https://ekuzo.gg/season1/join/signup?src=ad", { cookie: "ekuzo_origin=direct; ekuzo_lc=x" });
    assert.equal(res.cookies.get(LC_COOKIE), undefined);
  });

  it("bots get no ekuzo_lc", () => {
    const res = run("https://ekuzo.gg/season1/join?utm_source=meta", { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" });
    assert.equal(res.cookies.get(LC_COOKIE), undefined);
    assert.equal(res.cookies.get("ekuzo_origin"), undefined);
  });

  it("crew path: stored as /crew/, the code never in the cookie", () => {
    const res = run("https://ekuzo.gg/crew/48271937?utm_source=sms");
    const v = res.cookies.get(LC_COOKIE)!.value;
    assert.equal(JSON.parse(v).path, "/crew/");
    assert.doesNotMatch(v, /48271937/);
  });
});

describe("ekuzo_lc: parseLastClick (commit side), hostile values", () => {
  const good = { utm_source: "meta", utm_campaign: "s01", path: "/season1/join", ts: NOW - 1000 };

  it("round-trips a cookie written by middleware", () => {
    const r = buildLastClick(qs("utm_source=meta&utm_campaign=s01&fbclid=" + FBCLID), "/season1/join", NOW - 5)!;
    assert.deepEqual(parseLastClick(enc(r.value), NOW), r.lc);
  });

  it("%00, an unpaired surrogate and control characters are removed (utm) or dropped (click id)", () => {
    const lc = parseLastClick(enc({ ...good, utm_content: "a\u0000b\ud800c", fbclid: "x\u0000y" }), NOW)!;
    assert.equal(lc.utm_content, "abc");
    assert.equal(lc.fbclid, undefined);
    assert.doesNotThrow(() => JSON.stringify(lc));
    assert.doesNotMatch(JSON.stringify(lc), /\\u0000|\\ud800/);
  });

  it("a raw %00 or lone-surrogate escape in the cookie is harmless", () => {
    assert.equal(parseLastClick("%00", NOW), null);
    assert.equal(parseLastClick("%ED%A0%80", NOW), null, "encoded lone surrogate: URIError caught");
    assert.equal(parseLastClick("%E0%A4%A", NOW), null, "malformed percent-encoding");
  });

  it("a 10 KB cookie is not parsed", () => {
    assert.equal(parseLastClick(enc({ ...good, utm_term: "x".repeat(10_000) }), NOW), null);
  });

  it("non-JSON, array, null, number and nested-object cookies give null or drop the nested key", () => {
    assert.equal(parseLastClick("not json", NOW), null);
    assert.equal(parseLastClick(enc([good]), NOW), null);
    assert.equal(parseLastClick(enc(null), NOW), null);
    assert.equal(parseLastClick(enc(42), NOW), null);
    const nested = parseLastClick(enc({ ...good, utm_campaign: { $ne: 1 }, utm_medium: ["a"] }), NOW)!;
    assert.equal(nested.utm_campaign, undefined);
    assert.equal(nested.utm_medium, undefined);
    assert.equal(nested.utm_source, "meta");
  });

  it("unknown keys are dropped; a bad or missing ts rejects the cookie", () => {
    const lc = parseLastClick(enc({ ...good, origin: "https://evil.example", email: "a@b.c", amountCents: 1 }), NOW)!;
    assert.deepEqual(Object.keys(lc).sort(), ["path", "ts", "utm_campaign", "utm_source"]);
    assert.equal(parseLastClick(enc({ ...good, ts: "1" }), NOW), null);
    assert.equal(parseLastClick(enc({ ...good, ts: 1_700_000_000 }), NOW), null, "seconds, not ms");
    assert.equal(parseLastClick(enc({ ...good, ts: NOW + 3 * 86_400_000 }), NOW), null, "far future");
  });

  it("a cookie with no kept key is null", () => {
    assert.equal(parseLastClick(enc({ path: "/", ts: NOW }), NOW), null);
  });
});

describe("order attribution", () => {
  const lcVal = enc(buildLastClick(qs("utm_source=meta&utm_campaign=s01&fbclid=" + FBCLID), "/season1/join", NOW - 60_000)!.value);

  it("builds {src, lc, first_touch, fbp, fbc}; never the key origin", () => {
    const a = orderAttribution(`ekuzo_origin=paid_meta; ${LC_COOKIE}=${lcVal}; _fbp=fb.1.1792999999999.1234567890`, "ad", NOW);
    assert.deepEqual(Object.keys(a).sort(), ["fbc", "fbp", "first_touch", "lc", "src"]);
    assert.equal(a.src, "ad");
    assert.equal(a.first_touch, "paid_meta");
    assert.equal(a.lc?.utm_campaign, "s01");
    assert.equal(a.fbp, "fb.1.1792999999999.1234567890");
    assert.equal(a.fbc, `fb.1.${NOW - 60_000}.${FBCLID}`, "built from lc.fbclid, ms");
    assert.ok(!("origin" in a));
  });

  it("prefers the Pixel's _fbc cookie over a built one", () => {
    const a = orderAttribution(`${LC_COOKIE}=${lcVal}; _fbc=fb.1.1792000000000.PixelClick_1`, null, NOW);
    assert.equal(a.fbc, "fb.1.1792000000000.PixelClick_1");
  });

  it("invalid fbp, fbc and first touch are dropped", () => {
    const a = orderAttribution(`ekuzo_origin=https://evil.example; _fbp=fb.1.123.abc; _fbc=fb.1.1792000000000.bad%20value`, null, NOW);
    assert.equal(a.first_touch, null);
    assert.equal(a.fbp, null);
    assert.equal(a.fbc, null);
    assert.equal(a.lc, null);
  });

  it("no cookies at all: src only, everything else null", () => {
    assert.deepEqual(orderAttribution(null, "karlin", NOW), { src: "karlin", lc: null, first_touch: null, fbp: null, fbc: null });
  });

  it("regexes per money red team 8", () => {
    assert.equal(validFbp("fb.1.1792999999999.1234567890"), "fb.1.1792999999999.1234567890");
    assert.equal(validFbp("fb.1.1792999999.1234567890"), null, "seconds");
    assert.equal(validFbc("fb.1.1792999999999." + "a".repeat(255)), "fb.1.1792999999999." + "a".repeat(255));
    assert.equal(validFbc("fb.1.1792999999999." + "a".repeat(256)), null);
    assert.equal(validFbc("fb.1.1792999999999.a.b"), null);
    assert.equal(cleanFirstTouch("direct"), "direct");
    assert.equal(cleanFirstTouch("origin"), null);
  });
});
