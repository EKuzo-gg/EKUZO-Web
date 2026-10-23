// Sentry server harness. usage: node harness.mjs <baseUrl> <stubLog> <outJson> <suitesCsv>
import http from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const [base, logFile, outFile, suite] = process.argv.slice(2);
const u = new URL(base);
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64");
const GEO = { city: "Austin", country: { code: "US" }, subdivision: { code: "TX" }, postalCode: "78757", timezone: "America/Chicago", latitude: 30.3, longitude: -97.7 };
const GEO_OK = b64(GEO);
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const em = (l) => `sentry+${l}@example.test`;

function send({ body, rawBody, headers = {} }) {
  return new Promise((resolve) => {
    const data = rawBody !== undefined ? rawBody : JSON.stringify(body);
    const req = http.request({ host: u.hostname, port: u.port, path: "/api/season-one", method: "POST", timeout: 120000,
      headers: { "content-type": "application/json", "user-agent": UA, "content-length": Buffer.byteLength(data), ...headers } }, (res) => {
      let t = ""; res.on("data", (c) => (t += c)); res.on("end", () => resolve({ status: res.statusCode, text: t }));
    });
    req.on("error", (e) => resolve({ status: -1, text: "CLIENT_ERROR " + e.code + " " + e.message }));
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    req.end(data);
  });
}
const lines = () => (existsSync(logFile) ? readFileSync(logFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const results = [];
async function run(label, spec) {
  const before = lines().length;
  const r = await send(spec);
  const after = lines();
  results.push({ label, req: { headerKeys: Object.keys(spec.headers || {}), geoHeaderLen: (spec.headers?.["x-nf-geo"] || "").length, bodyLen: spec.rawBody !== undefined ? spec.rawBody.length : JSON.stringify(spec.body).length },
    status: r.status, resp: r.text.slice(0, 300), calls: after.slice(before).map((x) => ({ host: new URL(x.url).hostname, path: new URL(x.url).pathname, body: x.body })) });
  return r;
}
const geoH = (g = GEO_OK) => ({ "x-nf-geo": g, "x-nf-client-connection-ip": "203.0.113.9", cookie: "_fbp=fb.1.1700000000.123456" });
const mainBody = (l, extra = {}) => ({ email: em(l), source: "ad-landing", ad: "d10", adName: "Ad Ten", where: "hero", page: "/season1?ad=d10", hero: "amount", heroAnswer: "Yes", heroFrom: "url", firstName: "Sen",
  attribution: { utm_source: "facebook", utm_medium: "paid", utm_campaign: "s1", utm_content: "d10", utm_term: "x", utm_id: "1", site: "ekuzo" }, eventId: "ev-" + l, eventSourceUrl: "https://ekuzo.gg/season1?ad=d10&fbclid=abc", ...extra });
const textBody = (l, extra = {}) => ({ email: em(l), step: "text-karlin", phone: "+15125550123", ad: "d10", hero: "amount", ...extra });
const popupBody = (l, extra = {}) => ({ email: em(l), source: "site-popup", where: "footer", page: "/", firstName: "Sen", ...extra });

async function control() {
  const before = lines().length;
  const r = await send({ body: mainBody("control", { tz: "America/Denver" }), headers: geoH() });
  const added = lines().slice(before);
  const hosts = added.map((x) => new URL(x.url).hostname);
  const ok = r.status === 200 && hosts.includes("a.klaviyo.com") && hosts.includes("graph.facebook.com") && added.some((x) => x.url.includes("graph.facebook.com") && x.body?.data?.[0]?.event_name === "Lead") && added.some((x) => x.url.includes("/events") && x.body?.data?.attributes?.properties);
  results.push({ label: "control", status: r.status, resp: r.text, calls: added.map((x) => ({ host: new URL(x.url).hostname, path: new URL(x.url).pathname, body: x.body })), stubProven: ok });
  return ok;
}

const suites = {
  n4: async () => {
    await run("n4-main-ad", { body: mainBody("n4-main-ad", { tz: "America/Denver" }), headers: geoH() });
    await run("n4-popup", { body: popupBody("n4-popup"), headers: geoH() });
    await run("n4-games", { body: { email: em("n4-games"), step: "games", kidGames: "League of Legends, Roblox" }, headers: geoH() });
    await run("n4-age", { body: { email: em("n4-age"), step: "age", kidAge: "10-11" }, headers: geoH() });
    await run("n4-text", { body: textBody("n4-text", { tz: "America/Denver" }), headers: geoH() });
    await run("n4-honeypot", { body: { email: em("n4-hp"), source: "ad-landing", ekz_hp: "bot", tz: "America/Denver" }, headers: geoH() });
    await run("n4-bademail", { body: { email: "nope", tz: "America/Denver" }, headers: geoH() });
    await run("n4-unknown-step", { body: { email: em("n4-unk"), step: "bogus", tz: "America/Denver" }, headers: geoH() });
    await run("n4-badphone", { body: textBody("n4-badphone", { phone: "123" }), headers: geoH() });
  },
  journeys: async () => {
    await run("j4-main-nogeo-tz", { body: mainBody("j4-main", { tz: "America/New_York" }), headers: {} });
    await run("j4-popup-nogeo-notz", { body: popupBody("j4-popup"), headers: {} });
    await run("j4-text-nogeo-tz", { body: textBody("j4-text", { tz: "America/New_York" }), headers: {} });
    await run("j4-text-nogeo-notz", { body: textBody("j4-text2"), headers: {} });
    await run("j5-a-main-geo", { body: mainBody("j5", { tz: "America/Denver" }), headers: geoH() });
    await run("j5-b-text-nogeo", { body: textBody("j5", { tz: "America/Denver" }), headers: {} });
    await run("j5-c-text-nogeo-notz", { body: textBody("j5", {}), headers: {} });
    await run("j6-tzonly-main-browser", { body: mainBody("j6a", { tz: "America/Chicago" }), headers: geoH(b64({ timezone: "Pacific/Honolulu" })) });
    await run("j6-tzonly-popup", { body: popupBody("j6b"), headers: geoH(b64({ timezone: "Pacific/Honolulu" })) });
    await run("j6-tzonly-text-notz", { body: textBody("j6c"), headers: geoH(b64({ timezone: "Pacific/Honolulu" })) });
    for (let i = 1; i <= 2; i++) await run("j7-text-" + i, { body: textBody("j7", { tz: "America/Denver" }), headers: geoH() });
    for (let i = 1; i <= 2; i++) await run("j8-main-" + i, { body: mainBody("j8", { tz: "America/Denver" }), headers: geoH() });
    for (const z of ["UTC", "Etc/UTC", "GMT", "Etc/GMT", "Zulu", "Etc/GMT+0", "Greenwich"]) {
      await run("utc-geo-main-" + z, { body: mainBody("utcg-" + z.replace(/\W/g, "_"), { tz: z }), headers: geoH() });
      await run("utc-nogeozone-main-" + z, { body: mainBody("utcn-" + z.replace(/\W/g, "_"), { tz: z }), headers: geoH(b64({ city: "Austin", country: { code: "US" }, subdivision: { code: "TX" } })) });
    }
    await run("utc-geo-text", { body: textBody("utc-text-geo", { tz: "UTC" }), headers: geoH() });
    await run("utc-nogeo-text", { body: textBody("utc-text-nogeo", { tz: "UTC" }), headers: {} });
    await run("utc-geo-is-utc-main", { body: mainBody("utc-geo-utc", { tz: "UTC" }), headers: geoH(b64({ city: "Reykjavik", timezone: "UTC" })) });
    await run("browser-valid-vs-geo-diff", { body: mainBody("bvg", { tz: "America/Los_Angeles" }), headers: geoH() });
  },
  m1: async () => {
    const big = "A".repeat(1024 * 1024);
    const vals = [
      ["object", { a: 1 }], ["object-tz", { timeZone: "America/Chicago" }], ["array", ["America/Chicago"]], ["number", 5], ["null", null], ["bool", true], ["len65", "A".repeat(65)],
      ["dotdot", "../etc"], ["quote-brace", 'America/Chicago"}'], ["notazone", "Not/AZone"], ["empty", ""], ["spaces", " America/Chicago "],
      ["lower", "america/chicago"], ["upper", "AMERICA/CHICAGO"], ["plus", "Etc/GMT+5"], ["calcutta", "Asia/Calcutta"], ["est5edt", "EST5EDT"], ["offset", "+05:30"], ["backslash", "America\\Chicago"],
      ["newline", "America/Chicago\n"], ["unicode", "America/Chicagö"], ["len64ok", "America/Argentina/ComodRivadavia"], ["mb1", big], ["mb1-slash", "A/".repeat(512 * 1024)], ["proto", JSON.parse('{"__proto__":{"x":1}}')],
    ];
    const noTz = b64({ city: "Austin", country: { code: "US" }, subdivision: { code: "TX" } });
    for (const [n, v] of vals) {
      await run("m1-main-" + n, { body: mainBody("m1m-" + n, { tz: v }), headers: geoH(noTz) });
      await run("m1-text-" + n, { body: textBody("m1t-" + n, { tz: v }), headers: geoH(noTz) });
      await run("m1-main-geo-" + n, { body: mainBody("m1mg-" + n, { tz: v }), headers: geoH() });
    }
    await run("m1-main-tz-missing-key", { body: mainBody("m1-nokey"), headers: geoH() });
  },
  m2: async () => {
    const H = [
      ["not-base64", "not base64!!"], ["raw-json", JSON.stringify(GEO)], ["json-array-b64", b64([GEO])], ["json-array-raw", JSON.stringify([GEO])],
      ["tz-invalid", b64({ ...GEO, timezone: "Not/AZone" })], ["tz-object", b64({ ...GEO, timezone: { a: 1 } })], ["city-quotes", b64({ ...GEO, city: 'Au"stin' })], ["city-backslash", b64({ ...GEO, city: "Au\\stin" })],
      ["city-newline", b64({ ...GEO, city: "Au\nstin\t\u0001x\u007f\u0085y" })], ["city-apostrophe", b64({ ...GEO, city: "Coeur d'Alene" })], ["region-brace", b64({ ...GEO, subdivision: { code: 'US"}' } })],
      ["region-backslash-str", b64({ ...GEO, subdivision: "T\\X" })], ["region-long", b64({ ...GEO, subdivision: { code: "TEXASTEXAS" } })],
      ["json-null-b64", b64("null")], ["json-string-b64", b64('"abc"')], ["json-number-b64", b64("12")], ["json-true-raw", "true"], ["empty", ""], ["only-spaces", "   "],
      ["huge-8k", b64({ ...GEO, city: "X".repeat(5000) })], ["city-nonstring", b64({ ...GEO, city: { a: 1 }, country: 5, subdivision: [1], postalCode: {} })],
      ["country-str", b64({ city: "Austin", country: "US", subdivision: "TX", postal_code: "78757", timezone: "America/Chicago" })],
      ["lat-long-only", b64({ latitude: 1, longitude: 2 })], ["emoji-city", b64({ ...GEO, city: "Aus\u{1F600}tin" })], ["b64-garbage-json", b64("{bad")],
    ];
    for (const [n, h] of H) {
      await run("m2-main-" + n, { body: mainBody("m2m-" + n, { tz: "America/Denver" }), headers: { "x-nf-geo": h } });
      await run("m2-popup-" + n, { body: popupBody("m2p-" + n), headers: { "x-nf-geo": h } });
      await run("m2-text-" + n, { body: textBody("m2t-" + n, { tz: "America/Denver" }), headers: { "x-nf-geo": h } });
    }
  },
  nreg: async () => {
    const hs = geoH();
    await run("n2-badphone-short", { body: textBody("n2a", { phone: "5125550123" }), headers: hs });
    await run("n2-badphone-1start", { body: textBody("n2b", { phone: "+11235550123" }), headers: hs });
    await run("n2-badphone-letters", { body: textBody("n2c", { phone: "+1512555abcd" }), headers: hs });
    await run("n2-badphone-obj", { body: textBody("n2d", { phone: { a: 1 } }), headers: hs });
    await run("n2-badphone-missing", { body: { email: em("n2e"), step: "text-karlin" }, headers: hs });
    await run("n2-badphone-nogeo", { body: textBody("n2f", { phone: "x" }), headers: {} });
    await run("n2-badphone-badtz", { body: textBody("n2g", { phone: "x", tz: { a: 1 } }), headers: hs });
    await run("n2-phone-formatted", { body: textBody("n2h", { phone: " +15125550123 " }), headers: hs });
    await run("n2-phone-valid-nonus-tz", { body: textBody("n2i", { phone: "+15125550123", tz: "Europe/London" }), headers: hs });
    await run("n3-unknown-step-nogeo", { body: { email: em("n3a"), step: "nope" }, headers: {} });
    await run("n3-step-null", { body: { email: em("n3b"), step: null }, headers: hs });
    await run("n3-step-number", { body: { email: em("n3c"), step: 5 }, headers: hs });
    await run("n3-step-empty", { body: { email: em("n3d"), step: "" }, headers: hs });
    await run("n3-honeypot-ad", { body: { ...mainBody("n3e", { tz: "America/Denver" }), ekz_hp: "x" }, headers: hs });
    await run("n3-honeypot-popup", { body: { ...popupBody("n3f"), ekz_hp: "x" }, headers: hs });
    await run("n3-games-empty", { body: { email: em("n3g"), step: "games", kidGames: "!!!" }, headers: hs });
    await run("n3-age-empty", { body: { email: em("n3h"), step: "age" }, headers: hs });
    await run("n3-bademail-empty", { body: { email: "" }, headers: hs });
    await run("n3-bademail-nul", { body: { email: "a\u0000@b.com" }, headers: hs });
    await run("n3-bademail-missing", { body: {}, headers: hs });
    await run("n3-malformed-json", { rawBody: "{bad", headers: hs });
    await run("n3-json-array", { rawBody: "[]", headers: hs });
    await run("n3-json-null", { rawBody: "null", headers: hs });
    await run("n3-empty-body", { rawBody: "", headers: hs });
    await run("n3-json-string", { rawBody: '"x"', headers: hs });
    await run("n3-malformed-json-nogeo", { rawBody: '{"email":', headers: {} });
  },
};
const ok = await control();
if (!ok) { writeFileSync(outFile, JSON.stringify({ stubProven: false, results }, null, 1)); console.error("STUB NOT PROVEN"); process.exit(3); }
for (const s of suite.split(",")) await suites[s]();
writeFileSync(outFile, JSON.stringify({ stubProven: true, results }, null, 1));
console.log("done", results.length, "requests,", results.filter((r) => r.status >= 500 || r.status < 0).length, "5xx/err");
