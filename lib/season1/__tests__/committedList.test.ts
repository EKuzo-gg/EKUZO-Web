import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { syncCommittedList } from "../outbox";
import { eventSrc, type OrderCtx } from "../senders/context";
import { formatListAlert } from "../senders/discord";
import {
  S1_COMMITTED_LIST_ID,
  buildCommittedEvent,
  isTeamTestEmail,
  setCommittedListMember,
} from "../senders/klaviyo";

// 11-03: paying families join Klaviyo "Season 01 Committed" (WsfsxW), a full
// refund takes them off, and the Committed event carries a real src.

type SrcIn = Parameters<typeof eventSrc>[0];
const s = (o: Partial<SrcIn>): string =>
  eventSrc({ src: null, invited: false, utmSource: null, utmMedium: null, utmContent: null, firstTouch: null, ...o });

describe("eventSrc: the Committed event's src", () => {
  it("friend: invited, or src friend, even over a paid click", () => {
    assert.equal(s({ invited: true, utmMedium: "paid", utmContent: "d11" }), "friend");
    assert.equal(s({ src: "friend" }), "friend");
  });
  it("karlin: src karlin (the /karlin short link)", () => {
    assert.equal(s({ src: "karlin" }), "karlin");
    assert.equal(s({ src: "KARLIN", utmMedium: "cpc", utmContent: "x" }), "karlin");
  });
  it("ad: a paid last click, src ad, or a paid first touch", () => {
    assert.equal(s({ utmMedium: "paid_social" }), "ad");
    assert.equal(s({ utmSource: "meta", utmContent: "d11-a" }), "ad");
    assert.equal(s({ src: "ad" }), "ad");
    assert.equal(s({ src: "ad_d3" }), "ad");
    assert.equal(s({ firstTouch: "paid_meta" }), "ad");
  });
  it("email: the offer email links (src=email, utm_medium=email)", () => {
    assert.equal(s({ src: "email", utmMedium: "email", utmContent: "email-a" }), "email");
    assert.equal(s({ utmMedium: "email" }), "email");
    assert.equal(s({ src: "email", firstTouch: "paid_meta" }), "email", "the last click beats the first touch");
    assert.equal(s({ src: "email", utmMedium: "email", utmSource: "meta", utmContent: "email-a" }), "email", "a stale Meta source never makes an email order an ad");
  });
  it("direct: nothing else (Bobby's order: organic_google first touch, no src)", () => {
    assert.equal(s({ firstTouch: "organic_google" }), "direct");
    assert.equal(s({}), "direct");
    assert.equal(s({ src: "direct" }), "direct");
    assert.equal(s({ utmSource: "meta" }), "direct", "a Meta source without utm_content is not a paid click");
  });
});

const order = (over: Partial<OrderCtx> = {}): OrderCtx => ({
  orderPublicId: "abcd234567",
  livemode: true,
  status: "paid",
  email: "parent@example.com",
  parentFirstName: "Pat",
  phone: null,
  consentAt: null,
  consentIp: null,
  consentUa: null,
  amountCents: 10000,
  paidAt: "2026-11-04T15:05:00.000Z",
  src: "email",
  offerVersion: "s1-commit-v1",
  jerseyEligible: true,
  invited: false,
  referralCode: null,
  familyPublicId: "fam2345678",
  code: "48271938",
  kids: [{ firstName: "Ava", age: 11, role: "first" }],
  geoCity: null,
  geoRegion: null,
  geoTz: null,
  fbp: null,
  fbc: null,
  utmSource: "klaviyo",
  utmMedium: "email",
  utmCampaign: "season1-early-access",
  utmContent: "email-b",
  firstTouch: "paid_meta",
  ad: null,
  origin: null,
  inviterKidName: null,
  ...over,
});

describe("Committed event carries src and utm_content", () => {
  it("offer email order: src email, utm_content email-b", () => {
    const e = buildCommittedEvent(order());
    assert.equal(e.props.src, "email");
    assert.equal(e.props.utm_content, "email-b");
  });
  it("an order with no src param still gets a source", () => {
    assert.equal(buildCommittedEvent(order({ src: null, utmMedium: null, utmSource: null, utmContent: null, firstTouch: "organic_google" })).props.src, "direct");
    assert.equal(buildCommittedEvent(order({ src: "karlin", utmMedium: null, utmSource: null, utmContent: null })).props.src, "karlin");
  });
});

describe("isTeamTestEmail", () => {
  it("skips team and test addresses", () => {
    for (const e of ["jamie@ekuzo.gg", "TEAM+s1test-x1@ekuzo.gg", "team+s1test7@gmail.com", "team+gstest@gmail.com", "testy.parent@gmail.com", " Testy@yahoo.com "]) {
      assert.equal(isTeamTestEmail(e), true, e);
    }
  });
  it("lets real parents through", () => {
    for (const e of ["bobbyhoguejr@gmail.com", "parent@example.com", "team@school.org", "mytesty@gmail.com", "ekuzo.gg@gmail.com"]) {
      assert.equal(isTeamTestEmail(e), false, e);
    }
  });
});

describe("Committed list membership (stubbed fetch)", () => {
  const realFetch = globalThis.fetch;
  const savedKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const savedHook = process.env.S1_DISCORD_WEBHOOK_URL;
  const calls: Array<{ url: string; method: string; body: string }> = [];
  const stub = (fn: (url: string, method: string) => Response) => {
    calls.length = 0;
    globalThis.fetch = (async (url: unknown, init: RequestInit = {}) => {
      calls.push({ url: String(url), method: String(init.method ?? "GET"), body: String(init.body ?? "") });
      return fn(String(url), String(init.method ?? "GET"));
    }) as typeof fetch;
  };
  const profileOk = () => new Response(JSON.stringify({ data: { type: "profile", id: "01PROFILE123" } }), { status: 200 });
  beforeEach(() => {
    process.env.KLAVIYO_PRIVATE_API_KEY = "pk_test_stub";
    process.env.S1_DISCORD_WEBHOOK_URL = "https://discord.example/webhook";
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (savedKey === undefined) delete process.env.KLAVIYO_PRIVATE_API_KEY; else process.env.KLAVIYO_PRIVATE_API_KEY = savedKey;
    if (savedHook === undefined) delete process.env.S1_DISCORD_WEBHOOK_URL; else process.env.S1_DISCORD_WEBHOOK_URL = savedHook;
  });

  it("add: upserts the profile, then POSTs it to WsfsxW", async () => {
    stub((url) => (url.endsWith("/api/profile-import") ? profileOk() : new Response(null, { status: 204 })));
    const r = await setCommittedListMember("parent@example.com", true, true);
    assert.deepEqual(r, { outcome: "sent", detail: "list_add" });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://a.klaviyo.com/api/profile-import");
    assert.equal(JSON.parse(calls[0].body).data.attributes.email, "parent@example.com");
    assert.equal(calls[1].url, `https://a.klaviyo.com/api/lists/${S1_COMMITTED_LIST_ID}/relationships/profiles`);
    assert.equal(calls[1].method, "POST");
    assert.deepEqual(JSON.parse(calls[1].body), { data: [{ type: "profile", id: "01PROFILE123" }] });
    assert.ok(!calls.some((c) => c.url.includes("XGTv2F")), "never touches the waitlist list");
  });

  it("remove: DELETE with the same body", async () => {
    stub((url) => (url.endsWith("/api/profile-import") ? profileOk() : new Response(null, { status: 204 })));
    const r = await setCommittedListMember("parent@example.com", false, true);
    assert.deepEqual(r, { outcome: "sent", detail: "list_remove" });
    assert.equal(calls[1].method, "DELETE");
    assert.deepEqual(JSON.parse(calls[1].body), { data: [{ type: "profile", id: "01PROFILE123" }] });
  });

  it("skips test mode and team addresses without calling Klaviyo", async () => {
    stub(() => new Response(null, { status: 204 }));
    assert.deepEqual(await setCommittedListMember("parent@example.com", true, false), { outcome: "skipped_test" });
    assert.deepEqual(await setCommittedListMember("team+s1test-9@ekuzo.gg", true, true), { outcome: "skipped_test" });
    assert.deepEqual(await setCommittedListMember("testy@gmail.com", false, true), { outcome: "skipped_test" });
    assert.equal(calls.length, 0);
  });

  it("no API key: skipped_no_config", async () => {
    delete process.env.KLAVIYO_PRIVATE_API_KEY;
    stub(() => new Response(null, { status: 204 }));
    assert.deepEqual(await setCommittedListMember("parent@example.com", true, true), { outcome: "skipped_no_config" });
    assert.equal(calls.length, 0);
  });

  it("errors throw PII-free codes", async () => {
    stub(() => new Response("nope", { status: 500 }));
    await assert.rejects(setCommittedListMember("parent@example.com", true, true), /klaviyo_profile_http_500/);
    stub((url) => (url.endsWith("/api/profile-import") ? new Response("{}", { status: 200 }) : new Response(null, { status: 204 })));
    await assert.rejects(setCommittedListMember("parent@example.com", true, true), /klaviyo_profile_no_id/);
    stub((url) => (url.endsWith("/api/profile-import") ? profileOk() : new Response("x", { status: 429 })));
    await assert.rejects(setCommittedListMember("parent@example.com", true, true), /klaviyo_list_http_429/);
  });

  it("syncCommittedList never throws: a failure alerts Discord with the order ref", async () => {
    stub((url) => (url.startsWith("https://discord.example") ? new Response(null, { status: 204 }) : new Response("x", { status: 503 })));
    const r = await syncCommittedList({ email: "parent@example.com", orderPublicId: "abcd234567" }, true, true);
    assert.equal(r, "failed");
    const alert = calls.find((c) => c.url.startsWith("https://discord.example"));
    assert.ok(alert, "an ops alert was posted");
    const content = JSON.parse(alert!.body).content as string;
    assert.match(content, /klaviyo_list_add_failed \| order abcd234567 \| klaviyo_profile_http_503 \| add to Season 01 Committed \(WsfsxW\) by hand/);
    assert.ok(!content.includes("parent@example.com"), "no email in the alert");
  });

  it("syncCommittedList survives a failing Discord too", async () => {
    stub(() => new Response("x", { status: 500 }));
    assert.equal(await syncCommittedList({ email: "parent@example.com", orderPublicId: "abcd234567" }, false, true), "failed");
  });

  it("formatListAlert: test tag in test mode, remove wording", () => {
    assert.equal(
      formatListAlert(false, "abcd234567", "klaviyo_timeout", false),
      "[TEST] Season 01 ops alert: klaviyo_list_remove_failed | order abcd234567 | klaviyo_timeout | remove from Season 01 Committed (WsfsxW) by hand",
    );
  });
});
