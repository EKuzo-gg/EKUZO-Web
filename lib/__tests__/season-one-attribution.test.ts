/**
 * Unit tests for resolveSeasonOneAttribution in lib/attribution.ts
 * Uses Node.js built-in test runner (node --test).
 *
 * Like lib/__tests__/ekuzo101-weeks.test.ts this imports with a ".js" suffix,
 * and lib/attribution.ts imports "./originClassifier" with no suffix. Plain
 * Node resolves neither to a .ts file, so run with a one-line resolver hook
 * that retries a failed relative import as ".ts":
 *
 *   node --experimental-strip-types \
 *     --import 'data:text/javascript,import{register}from"node:module";register("data:text/javascript,export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(/^\\.\\.?\\//.test(s))return n(s.replace(/\\.js$/,\"\")+\".ts\",c);throw e}}")' \
 *     --test lib/__tests__/season-one-attribution.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveSeasonOneAttribution,
  SEASON_ONE_RETURN_WINDOW_MS,
  SEASON_ONE_RETURN_KEY,
  SEASON_ONE_SESSION_KEY,
} from "../attribution.js";

const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

const EMPTY = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  utm_id: "",
  site: "",
};

const FULL = {
  utm_source: "meta",
  utm_medium: "paid_social",
  utm_campaign: "season1",
  utm_content: "d5-a-showup",
  utm_term: "Instagram_Feed",
  utm_id: "120251332838180600",
  site: "ig",
};

const FULL_QS =
  "?ad=d5&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d5-a-showup&utm_term=Instagram_Feed&utm_id=120251332838180600&site=ig";

const session = (o: unknown) => JSON.stringify(o);
const local = (o: Record<string, unknown>, at: unknown = NOW - DAY) => JSON.stringify({ ...o, at });

describe("constants", () => {
  it("exposes the 7-day window and the storage keys", () => {
    assert.equal(SEASON_ONE_RETURN_WINDOW_MS, 7 * DAY);
    assert.equal(SEASON_ONE_RETURN_KEY, "ekuzo_s1_attribution");
    assert.equal(SEASON_ONE_SESSION_KEY, "ekuzo_attribution");
  });
});

describe("resolveSeasonOneAttribution", () => {
  it("URL wins over session and local", () => {
    const r = resolveSeasonOneAttribution(
      FULL_QS,
      session({ utm_source: "other", ad: "d2" }),
      local({ utm_source: "older", ad: "d3" }),
      NOW,
    );
    assert.deepEqual(r, { attribution: FULL, ad: "d5", from: "url" });
  });

  it("URL with only utm_source counts, with ad empty", () => {
    const r = resolveSeasonOneAttribution("?utm_source=meta", session({ utm_source: "x", ad: "d2" }), null, NOW);
    assert.equal(r.from, "url");
    assert.equal(r.attribution.utm_source, "meta");
    assert.equal(r.ad, "");
  });

  it("URL with only a valid ad is not an ad touch: none, or falls through to session", () => {
    assert.deepEqual(resolveSeasonOneAttribution("?ad=D07", null, null, NOW), { attribution: EMPTY, ad: "", from: "none" });
    const r = resolveSeasonOneAttribution("?ad=d7", session({ ...FULL, ad: "d5" }), null, NOW);
    assert.deepEqual(r, { attribution: FULL, ad: "d5", from: "session" });
  });

  it("URL with only utm_id and/or site is not an ad touch", () => {
    assert.equal(resolveSeasonOneAttribution("?utm_id=123", null, null, NOW).from, "none");
    assert.equal(resolveSeasonOneAttribution("?site=ig&ad=d5", null, null, NOW).from, "none");
    const r = resolveSeasonOneAttribution("?utm_id=123&site=ig", session({ ...FULL, ad: "d5" }), null, NOW);
    assert.equal(r.from, "session");
    assert.equal(r.attribution.utm_id, FULL.utm_id);
  });

  it("each of the five utm_* keys alone is an ad touch", () => {
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const r = resolveSeasonOneAttribution(`?${k}=v&ad=d3&utm_id=9&site=fb`, null, null, NOW);
      assert.equal(r.from, "url", k);
      assert.equal(r.attribution[k as keyof typeof EMPTY], "v");
      assert.equal(r.attribution.utm_id, "9");
      assert.equal(r.attribution.site, "fb");
      assert.equal(r.ad, "d3");
    }
  });

  it("URL with only an invalid ad is not a touch and falls through to session", () => {
    const r = resolveSeasonOneAttribution("?ad=bogus", session({ ...FULL, ad: "d5" }), null, NOW);
    assert.deepEqual(r, { attribution: FULL, ad: "d5", from: "session" });
  });

  it("session fallback when the URL has nothing", () => {
    const r = resolveSeasonOneAttribution("", session({ ...FULL, ad: "d5" }), null, NOW);
    assert.deepEqual(r, { attribution: FULL, ad: "d5", from: "session" });
  });

  it("session wins over local", () => {
    const r = resolveSeasonOneAttribution(
      "?foo=bar",
      session({ utm_source: "sess", ad: "d1" }),
      local({ utm_source: "loc", ad: "d2" }),
      NOW,
    );
    assert.equal(r.from, "session");
    assert.equal(r.attribution.utm_source, "sess");
    assert.equal(r.ad, "d1");
  });

  it("a session record written by captureAttribution (5 utm keys, no ad) resolves with empty ad", () => {
    const r = resolveSeasonOneAttribution(
      "",
      session({ utm_source: "meta", utm_medium: "paid", utm_campaign: "c", utm_content: "x", utm_term: "t" }),
      null,
      NOW,
    );
    assert.equal(r.from, "session");
    assert.equal(r.attribution.utm_id, "");
    assert.equal(r.attribution.site, "");
    assert.equal(r.ad, "");
  });

  it("an empty session record falls through to local", () => {
    const r = resolveSeasonOneAttribution("", session({ ...EMPTY, ad: "" }), local({ ...FULL, ad: "d5" }), NOW);
    assert.equal(r.from, "return-visit");
  });

  it("return-visit within 7 days, ad from the same record", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, NOW - 3 * DAY), NOW);
    assert.deepEqual(r, { attribution: FULL, ad: "d5", from: "return-visit" });
  });

  it("return-visit at exactly 7 days is still valid", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, NOW - 7 * DAY), NOW);
    assert.equal(r.from, "return-visit");
  });

  it("expired one millisecond past 7 days", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, NOW - 7 * DAY - 1), NOW);
    assert.deepEqual(r, { attribution: EMPTY, ad: "", from: "none" });
  });

  it("expired after 8 days", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, NOW - 8 * DAY), NOW);
    assert.deepEqual(r, { attribution: EMPTY, ad: "", from: "none" });
  });

  it("future `at` is rejected", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, NOW + 1), NOW);
    assert.equal(r.from, "none");
  });

  it("`at` equal to now is valid (age 0)", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, NOW), NOW);
    assert.equal(r.from, "return-visit");
  });

  it("non-numeric or missing `at` is rejected", () => {
    for (const at of ["1799999999999", null, NaN, {}, [], true]) {
      const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }, at), NOW);
      assert.equal(r.from, "none", `at=${JSON.stringify(at)}`);
    }
    const noAt = resolveSeasonOneAttribution("", null, JSON.stringify({ ...FULL, ad: "d5" }), NOW);
    assert.equal(noAt.from, "none");
  });

  it("local record with a valid `at` but no values is none", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...EMPTY, ad: "" }), NOW);
    assert.equal(r.from, "none");
  });

  it("malformed JSON in either storage is ignored", () => {
    assert.equal(resolveSeasonOneAttribution("", "{not json", null, NOW).from, "none");
    assert.equal(resolveSeasonOneAttribution("", null, "{not json", NOW).from, "none");
    const r = resolveSeasonOneAttribution("", "{not json", local({ ...FULL, ad: "d5" }), NOW);
    assert.equal(r.from, "return-visit");
  });

  it("non-object JSON (string, number, array, null) is ignored", () => {
    for (const raw of ['"utm_source"', "5", "[1,2]", "null", "true"]) {
      assert.equal(resolveSeasonOneAttribution("", raw, raw, NOW).from, "none", raw);
    }
  });

  it("non-string stored values become empty strings", () => {
    const r = resolveSeasonOneAttribution(
      "",
      session({ utm_source: 5, utm_medium: ["a"], utm_campaign: { x: 1 }, utm_content: null, utm_term: "t", utm_id: "123", site: false, ad: 7 }),
      null,
      NOW,
    );
    assert.equal(r.from, "session");
    assert.deepEqual(r.attribution, { ...EMPTY, utm_term: "t", utm_id: "123" });
    assert.equal(r.ad, "");
  });

  it("a record holding only non-string values counts as empty", () => {
    const r = resolveSeasonOneAttribution("", session({ utm_source: 5, ad: 3 }), null, NOW);
    assert.equal(r.from, "none");
  });

  it("empty everything resolves to none with all-empty values", () => {
    assert.deepEqual(resolveSeasonOneAttribution("", null, null, NOW), { attribution: EMPTY, ad: "", from: "none" });
    assert.deepEqual(resolveSeasonOneAttribution("?utm_source=&ad=", "", "", NOW), { attribution: EMPTY, ad: "", from: "none" });
  });

  it("`ad` always comes from the same source as the attribution values", () => {
    const sess = resolveSeasonOneAttribution("?x=1", session({ utm_source: "s", ad: "d9" }), local({ utm_source: "l", ad: "d2" }), NOW);
    assert.deepEqual([sess.from, sess.attribution.utm_source, sess.ad], ["session", "s", "d9"]);
    const loc = resolveSeasonOneAttribution("?x=1", null, local({ utm_source: "l", ad: "d2" }), NOW);
    assert.deepEqual([loc.from, loc.attribution.utm_source, loc.ad], ["return-visit", "l", "d2"]);
    const url = resolveSeasonOneAttribution("?utm_source=u&ad=d4", session({ utm_source: "s", ad: "d9" }), null, NOW);
    assert.deepEqual([url.from, url.attribution.utm_source, url.ad], ["url", "u", "d4"]);
    // URL has utm but no ad: ad stays empty, it is not borrowed from the session.
    const noAd = resolveSeasonOneAttribution("?utm_source=u", session({ utm_source: "s", ad: "d9" }), null, NOW);
    assert.equal(noAd.ad, "");
  });

  it("a record with only `ad` (or only utm_id / site) does not count", () => {
    assert.deepEqual(resolveSeasonOneAttribution("", session({ ad: "d6" }), null, NOW), { attribution: EMPTY, ad: "", from: "none" });
    assert.deepEqual(resolveSeasonOneAttribution("", null, local({ ad: "d6" }), NOW), { attribution: EMPTY, ad: "", from: "none" });
    assert.equal(resolveSeasonOneAttribution("", session({ utm_id: "9", site: "ig", ad: "d6" }), null, NOW).from, "none");
    assert.equal(resolveSeasonOneAttribution("", null, local({ utm_id: "9", site: "ig", ad: "d6" }), NOW).from, "none");
  });

  it("a session record without utm but with ad falls through to the return-visit record", () => {
    const r = resolveSeasonOneAttribution("", session({ ad: "d6", utm_id: "9" }), local({ ...FULL, ad: "d5" }), NOW);
    assert.deepEqual(r, { attribution: FULL, ad: "d5", from: "return-visit" });
  });

  it("an invalid stored ad is dropped", () => {
    const r = resolveSeasonOneAttribution("", session({ utm_source: "meta", ad: "d13" }), null, NOW);
    assert.equal(r.from, "session");
    assert.equal(r.ad, "");
  });

  it("caps every value at 200 chars", () => {
    const long = "a".repeat(500);
    const u = resolveSeasonOneAttribution(`?utm_source=${long}`, null, null, NOW);
    assert.equal(u.attribution.utm_source.length, 200);
    const s = resolveSeasonOneAttribution("", session({ utm_content: long }), null, NOW);
    assert.equal(s.attribution.utm_content.length, 200);
    const l = resolveSeasonOneAttribution("", null, local({ utm_source: "x", site: long }), NOW);
    assert.equal(l.attribution.site.length, 200);
  });

  it("result carries exactly the seven attribution keys (no `at`, no `ad` inside attribution)", () => {
    const r = resolveSeasonOneAttribution("", null, local({ ...FULL, ad: "d5" }), NOW);
    assert.deepEqual(Object.keys(r.attribution).sort(), Object.keys(EMPTY).sort());
  });
});
