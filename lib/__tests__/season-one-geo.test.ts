/**
 * Unit tests for lib/seasonOneGeo.ts (visitor location and time zone helpers
 * for /api/season-one). Uses Node.js built-in test runner (node --test).
 *
 * Like lib/__tests__/season-one-attribution.test.ts this imports with a ".js"
 * suffix, so run with the one-line resolver hook that retries a failed
 * relative import as ".ts":
 *
 *   node --experimental-strip-types \
 *     --import 'data:text/javascript,import{register}from"node:module";register("data:text/javascript,export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(/^\\.\\.?\\//.test(s))return n(s.replace(/\\.js$/,\"\")+\".ts\",c);throw e}}")' \
 *     --test lib/__tests__/season-one-geo.test.ts
 *
 * Canonical-name assertions use stable zones only ("America/Chicago", "UTC"):
 * names like Asia/Calcutta vs Asia/Kolkata depend on the ICU build.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cleanTz, geoProfileProps, parseGeoHeader, tzProps, UTC_ALIASES } from "../seasonOneGeo.js";

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o), "utf8").toString("base64");
const EMPTY_GEO = { geo_country: "", geo_region: "", geo_city: "", geo_postal: "", geo_tz: "" };

describe("cleanTz", () => {
  it("accepts valid zones", () => {
    assert.equal(cleanTz("America/Chicago"), "America/Chicago");
    assert.equal(cleanTz("America/Los_Angeles"), "America/Los_Angeles");
    assert.equal(cleanTz("UTC"), "UTC");
  });
  it("canonicalizes case", () => {
    assert.equal(cleanTz("america/chicago"), "America/Chicago");
    assert.equal(cleanTz("utc"), "UTC");
  });
  it("drops every M1 value", () => {
    const bad: unknown[] = [
      {}, { timeZone: "America/Chicago" }, [], ["America/Chicago"], 5, 0, NaN, true, null, undefined,
      "x".repeat(65), "America/" + "a".repeat(60), "../etc", "America/Chicago\"}", "Not/AZone", "",
      " America/Chicago", "America/Chicago\n", "America Chicago", "America/Chicago;", Symbol("x"),
    ];
    for (const v of bad) assert.equal(cleanTz(v), "", `expected "" for ${String(typeof v === "symbol" ? "symbol" : JSON.stringify(v))}`);
  });
  it("accepts a 64-character shape but rejects what Intl rejects", () => {
    assert.equal(cleanTz("A".repeat(64)), "");
  });
  it("never throws on a 1 MB string", () => {
    assert.equal(cleanTz("a".repeat(1_000_000)), "");
  });
});

describe("UTC_ALIASES", () => {
  it("holds the 14 documented names", () => {
    assert.equal(UTC_ALIASES.size, 14);
    for (const n of ["UTC", "Etc/UTC", "Etc/GMT", "GMT", "Etc/UCT", "UCT", "Etc/Universal", "Universal", "Etc/Zulu", "Zulu", "Etc/GMT0", "GMT0", "Etc/Greenwich", "Greenwich"]) {
      assert.ok(UTC_ALIASES.has(n), n);
    }
  });
  it("every alias validates and cleans to an alias (ICU may canonicalize to UTC)", () => {
    for (const n of UTC_ALIASES) {
      const c = cleanTz(n);
      assert.ok(c !== "" && UTC_ALIASES.has(c), `${n} -> ${c}`);
    }
  });
});

// The readGeo body from origin/main (3572edc), kept as the oracle: header string in, geo object out.
const oldText = (v: unknown, max = 120) => (typeof v === "string" ? String(v ?? "").trim().slice(0, max) : "");
function oldReadGeo(h: string | null): Record<string, string> {
  let g: Record<string, unknown> | null = null;
  if (h) {
    for (const decode of [(s: string) => Buffer.from(s, "base64").toString("utf8"), (s: string) => s]) {
      try {
        const j = JSON.parse(decode(h));
        if (j && typeof j === "object" && !Array.isArray(j)) { g = j; break; }
      } catch {
        // not this encoding; try the next
      }
    }
  }
  const code = (v: unknown) => oldText(v && typeof v === "object" ? (v as Record<string, unknown>).code : v, 8);
  return {
    geo_country: code(g?.country),
    geo_region: code(g?.subdivision),
    geo_city: oldText(g?.city, 80),
    geo_postal: oldText(g?.postalCode ?? g?.postal_code, 12),
  };
}

const FIXTURES: Array<[string, string | null]> = [
  ["null", null],
  ["empty", ""],
  ["base64 full", b64({ city: "Austin", country: { code: "US" }, subdivision: { code: "TX" }, postalCode: "78757", timezone: "America/Chicago" })],
  ["raw json full", JSON.stringify({ city: "Austin", country: { code: "US" }, subdivision: { code: "TX" }, postal_code: "78757" })],
  ["bare string codes", b64({ country: "US", subdivision: "TX", city: "Austin" })],
  ["postal_code fallback", b64({ postal_code: "98101" })],
  ["postalCode beats postal_code", b64({ postalCode: "78757", postal_code: "98101" })],
  ["padded city", b64({ city: "  Austin  " })],
  ["long city", b64({ city: "x".repeat(200) })],
  ["long region", b64({ subdivision: { code: "ABCDEFGHIJKL" } })],
  ["long postal", b64({ postalCode: "1234567890123456" })],
  ["numeric fields", b64({ city: 5, country: 7, subdivision: { code: 9 }, postalCode: 12345 })],
  ["null fields", b64({ city: null, country: null, subdivision: null })],
  ["array", b64([1, 2])],
  ["raw array", "[1,2]"],
  ["number", "5"],
  ["string json", '"hello"'],
  ["null json", "null"],
  ["garbage", "not base64 or json !!!"],
  ["bad json", "{city:"],
  ["nested array country", b64({ country: ["US"], subdivision: [] })],
  ["unicode city", b64({ city: "Zürich", country: { code: "CH" } })],
  ["timezone only", b64({ timezone: "America/Chicago" })],
  ["lat long ignored", b64({ city: "Austin", latitude: 30.3, longitude: -97.7 })],
];

describe("parseGeoHeader oracle (old readGeo)", () => {
  for (const [name, h] of FIXTURES) {
    it(`matches the old readGeo on the four existing keys: ${name}`, () => {
      const o = oldReadGeo(h);
      const n = parseGeoHeader(h);
      assert.deepEqual({ geo_country: n.geo_country, geo_region: n.geo_region, geo_city: n.geo_city, geo_postal: n.geo_postal }, o);
      assert.deepEqual(Object.keys(n), ["geo_country", "geo_region", "geo_city", "geo_postal", "geo_tz"]);
    });
  }
  it("differs from the old one only by the strip", () => {
    const h = b64({ city: 'Au"stin\\', subdivision: { code: 'T"X' } });
    assert.equal(oldReadGeo(h).geo_city, 'Au"stin\\');
    assert.equal(parseGeoHeader(h).geo_city, "Austin");
    assert.equal(oldReadGeo(h).geo_region, 'T"X');
    assert.equal(parseGeoHeader(h).geo_region, "TX");
  });
});

describe("parseGeoHeader", () => {
  it("reads base64 JSON including timezone", () => {
    assert.deepEqual(
      parseGeoHeader(b64({ city: "Austin", country: { code: "US" }, subdivision: { code: "TX" }, postalCode: "78757", timezone: "America/Chicago" })),
      { geo_country: "US", geo_region: "TX", geo_city: "Austin", geo_postal: "78757", geo_tz: "America/Chicago" },
    );
  });
  it("reads raw JSON", () => {
    assert.equal(parseGeoHeader('{"city":"Seattle","timezone":"America/Los_Angeles"}').geo_city, "Seattle");
    assert.equal(parseGeoHeader('{"city":"Seattle","timezone":"America/Los_Angeles"}').geo_tz, "America/Los_Angeles");
  });
  it("garbage, array, missing: all empty", () => {
    for (const h of ["%%%garbage%%%", b64([1]), "[1]", "", null, "null", "5"]) assert.deepEqual(parseGeoHeader(h), EMPTY_GEO);
  });
  it("timezone invalid gives empty geo_tz and keeps the rest", () => {
    for (const timezone of ["Not/AZone", "../etc", 5, {}, [], null, 'America/Chicago"}', "x".repeat(65)]) {
      const g = parseGeoHeader(b64({ city: "Austin", timezone }));
      assert.equal(g.geo_tz, "");
      assert.equal(g.geo_city, "Austin");
    }
  });
  it("timezone case is canonicalized", () => {
    assert.equal(parseGeoHeader(b64({ timezone: "america/chicago" })).geo_tz, "America/Chicago");
  });
  it("strips quotes, backslashes and control characters from city and region", () => {
    const g = parseGeoHeader(b64({ city: '  "Au\\st\nin\t\u0000\u007f\u009f"  ', subdivision: { code: '"\\T\nX' } }));
    assert.equal(g.geo_city, "Austin");
    assert.equal(g.geo_region, "TX");
  });
  it("strip happens before trim and cap", () => {
    // 3 quotes in front would eat the cap if capping came first.
    assert.equal(parseGeoHeader(b64({ city: '"""  ' + "a".repeat(100) })).geo_city, "a".repeat(80));
    assert.equal(parseGeoHeader(b64({ subdivision: '""  TXABCDEFG' })).geo_region, "TXABCDEF");
  });
  it("keeps apostrophes and unicode in the city", () => {
    assert.equal(parseGeoHeader(b64({ city: "Coeur d'Alene" })).geo_city, "Coeur d'Alene");
    assert.equal(parseGeoHeader(b64({ city: "Zürich" })).geo_city, "Zürich");
  });
  it("does not strip country or postal (unchanged from the old readGeo)", () => {
    const g = parseGeoHeader(b64({ country: '"U', postalCode: '7"8' }));
    assert.equal(g.geo_country, '"U');
    assert.equal(g.geo_postal, '7"8');
  });
  it("never keeps latitude or longitude", () => {
    const g = parseGeoHeader(b64({ city: "Austin", latitude: 30.3, longitude: -97.7 }));
    assert.deepEqual(Object.keys(g).sort(), ["geo_city", "geo_country", "geo_postal", "geo_region", "geo_tz"]);
  });
  it("never throws (fuzz)", () => {
    const rows: unknown[] = [
      "x".repeat(1_000_000), "[".repeat(100_000), "{\"a\":".repeat(100_000), b64({ city: "x".repeat(1_000_000) }),
      "\u0000", "\ud800", "__proto__", '{"__proto__":{"city":"x"}}', '{"city":{"a":1},"country":{"code":{"b":2}},"subdivision":[]}',
      b64({ country: { code: { code: "US" } } }), "{}", "0", "false", undefined, 5, {}, [], Symbol("x"),
    ];
    for (const h of rows) assert.doesNotThrow(() => parseGeoHeader(h as string | null));
    assert.equal(typeof parseGeoHeader(rows[0] as string).geo_city, "string");
  });
});

describe("tzProps", () => {
  const geoChi = { geo_tz: "America/Chicago" };
  it("browser zone wins when valid", () => {
    assert.deepEqual(tzProps("America/Los_Angeles", geoChi), { tz: "America/Los_Angeles", tz_source: "browser" });
    assert.deepEqual(tzProps("America/Los_Angeles", EMPTY_GEO), { tz: "America/Los_Angeles", tz_source: "browser" });
  });
  it("browser zone is canonicalized", () => {
    assert.deepEqual(tzProps("america/chicago", EMPTY_GEO), { tz: "America/Chicago", tz_source: "browser" });
  });
  it("falls back to geo when the browser tz is missing or invalid", () => {
    for (const b of [undefined, null, "", "Not/AZone", {}, [], 5, "America/Chicago\"}", "../etc", "x".repeat(65)]) {
      assert.deepEqual(tzProps(b, geoChi), { tz: "America/Chicago", tz_source: "geo" });
    }
  });
  it("neither gives empty", () => {
    assert.deepEqual(tzProps(undefined, EMPTY_GEO), { tz: "", tz_source: "" });
    assert.deepEqual(tzProps("Not/AZone", { geo_tz: "Not/AZone" }), { tz: "", tz_source: "" });
    assert.deepEqual(tzProps(undefined, undefined), { tz: "", tz_source: "" });
  });
  it("every UTC alias from the browser loses to a valid non-UTC geo zone", () => {
    for (const a of UTC_ALIASES) assert.deepEqual(tzProps(a, geoChi), { tz: "America/Chicago", tz_source: "geo" }, a);
  });
  it("a UTC alias is used when geo is empty, invalid, or itself UTC", () => {
    for (const a of UTC_ALIASES) {
      const c = cleanTz(a);
      assert.deepEqual(tzProps(a, EMPTY_GEO), { tz: c, tz_source: "browser" }, a);
      assert.deepEqual(tzProps(a, { geo_tz: "Not/AZone" }), { tz: c, tz_source: "browser" }, a);
      assert.deepEqual(tzProps(a, { geo_tz: "UTC" }), { tz: c, tz_source: "browser" }, a);
    }
  });
  it("a non-UTC browser zone beats a UTC geo zone", () => {
    assert.deepEqual(tzProps("America/Chicago", { geo_tz: "UTC" }), { tz: "America/Chicago", tz_source: "browser" });
  });
  it("end to end with parseGeoHeader (J6: header with only a timezone)", () => {
    const geo = parseGeoHeader(b64({ timezone: "America/Denver" }));
    assert.equal(geo.geo_city, "");
    assert.deepEqual(tzProps(undefined, geo), { tz: "America/Denver", tz_source: "geo" });
    assert.deepEqual(tzProps("America/Chicago", geo), { tz: "America/Chicago", tz_source: "browser" });
  });
  it("never throws (fuzz)", () => {
    const vals: unknown[] = [null, undefined, 5, "x", {}, [], Symbol("x"), "x".repeat(1_000_000), { geo_tz: {} }, { geo_tz: ["UTC"] }, { geo_tz: "x".repeat(1_000_000) }, true];
    for (const a of vals) for (const b of vals) assert.doesNotThrow(() => tzProps(a, b));
  });
});

describe("geoProfileProps", () => {
  it("returns all three when present", () => {
    assert.deepEqual(
      geoProfileProps({ geo_city: "Austin", geo_region: "TX", geo_tz: "America/Chicago" }, "America/Chicago"),
      { season1_city: "Austin", season1_region: "TX", season1_tz: "America/Chicago" },
    );
  });
  it("drops empties (J4: no header, valid browser tz)", () => {
    assert.deepEqual(geoProfileProps(EMPTY_GEO, "America/Chicago"), { season1_tz: "America/Chicago" });
  });
  it("drops everything when all are empty (no key written, nothing blanked)", () => {
    assert.deepEqual(geoProfileProps(EMPTY_GEO, ""), {});
    assert.deepEqual(geoProfileProps({}, undefined), {});
  });
  it("city and region without tz", () => {
    assert.deepEqual(geoProfileProps({ geo_city: "Seattle", geo_region: "WA" }, ""), { season1_city: "Seattle", season1_region: "WA" });
  });
  it("an invalid tz is dropped", () => {
    assert.deepEqual(geoProfileProps({ geo_city: "A" }, "Not/AZone"), { season1_city: "A" });
  });
  it("never throws (fuzz)", () => {
    const vals: unknown[] = [null, undefined, 5, "x", {}, [], Symbol("x"), "x".repeat(1_000_000), { geo_city: {}, geo_region: [] }, { geo_city: 5 }, true];
    for (const a of vals) for (const b of vals) assert.doesNotThrow(() => geoProfileProps(a, b));
    assert.deepEqual(geoProfileProps({ geo_city: 5, geo_region: ["TX"] }, {}), {});
  });
});
