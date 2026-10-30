import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { isStale, maxAgeMs } from "../outbox";
import type { FriendCtx, OrderCtx } from "../senders/context";
import {
  COMMITTED_PROPERTY_KEYS,
  FRIEND_JOINED_PROPERTY_KEYS,
  REFUNDED_PROPERTY_KEYS,
  KLAVIYO_REVISION,
  S1_TEST_EMAIL_RE,
  buildCommittedEvent,
  buildFriendJoinedEvent,
  buildRefundedEvent,
  sendKlaviyoEvent,
  testEmailAllowed,
  toRequestBody,
} from "../senders/klaviyo";
import { buildPurchaseEvent, buildRequestBody, testEventCode } from "../senders/meta";
import {
  adNameFor,
  emailText,
  formatCommit,
  formatFlag,
  formatOpsAlert,
  lookupAdName,
  needsAdNameLookup,
  sendDiscord,
  sourceCategory,
  webhookUrl,
} from "../senders/discord";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

const order = (over: Partial<OrderCtx> = {}): OrderCtx => ({
  orderPublicId: "abcd234567",
  livemode: false,
  status: "paid",
  email: "team+s1test-x1@ekuzo.gg",
  parentFirstName: "Pat",
  phone: "(512) 555-0142",
  consentAt: "2026-10-27T15:00:00.000Z",
  consentIp: "203.0.113.9",
  consentUa: "Mozilla/5.0 test",
  amountCents: 18000,
  paidAt: "2026-10-27T15:05:00.000Z",
  src: "ad_d3",
  offerVersion: "s1-commit-v1",
  jerseyEligible: true,
  invited: true,
  referralCode: "48271937",
  familyPublicId: "fam2345678",
  code: "48271938",
  kids: [
    { firstName: "Ava", age: 11, role: "first" },
    { firstName: "Ben", age: 9, role: "sibling" },
  ],
  geoCity: "Austin",
  geoRegion: "TX",
  geoTz: "America/Chicago",
  fbp: null,
  fbc: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  firstTouch: null,
  origin: null,
  inviterKidName: "Zed",
  ...over,
});

const friend = (over: Partial<FriendCtx> = {}): FriendCtx => ({
  referralId: "11111111-2222-3333-4444-555555555555",
  livemode: false,
  inviterEmail: "team+s1test-inv@ekuzo.gg",
  inviterFirstName: "Sam",
  inviterKidName: "Zed",
  code: "48271937",
  friendKids: 2,
  friendsTotal: 3,
  joinerOrderRef: "abcd234567",
  origin: null,
  ...over,
});

describe("max age (O11)", () => {
  const created = new Date("2026-10-27T00:00:00Z");
  const at = (h: number) => new Date(created.getTime() + h * 3600_000);
  it("per kind", () => {
    assert.equal(maxAgeMs("meta_purchase"), 6 * 24 * 3600_000);
    assert.equal(maxAgeMs("klaviyo_committed"), 48 * 3600_000);
    assert.equal(maxAgeMs("klaviyo_friend_joined"), 48 * 3600_000);
    assert.equal(maxAgeMs("discord_commit"), 24 * 3600_000);
    assert.equal(maxAgeMs("discord_flag:x"), 24 * 3600_000);
    assert.equal(maxAgeMs("ops_alert"), 24 * 3600_000);
  });
  it("stale just past the limit, fresh just inside", () => {
    assert.equal(isStale("klaviyo_committed", created, at(47.9)), false);
    assert.equal(isStale("klaviyo_committed", created, at(48.1)), true);
    assert.equal(isStale("discord_commit", created, at(23)), false);
    assert.equal(isStale("discord_commit", created, at(25)), true);
    assert.equal(isStale("meta_purchase", created, at(24 * 5.9)), false);
    assert.equal(isStale("meta_purchase", created, at(24 * 6.1)), true);
    assert.equal(isStale("meta_purchase", created.toISOString(), at(24 * 6.1)), true);
  });
});

describe("test isolation regex", () => {
  it("allows team+s1test and aaron+ at ekuzo.gg only", () => {
    for (const ok of ["team+s1test-abc@ekuzo.gg", "team+s1test@ekuzo.gg", "aaron+qa1@ekuzo.gg", "Team+S1Test-X@EKUZO.GG"]) {
      assert.equal(testEmailAllowed(ok), true, ok);
    }
    for (const bad of [
      "parent@gmail.com",
      "team@ekuzo.gg",
      "team+other@ekuzo.gg",
      "team+s1test-a@ekuzo.gg.evil.com",
      "x@team+s1test@ekuzo.gg",
      "aaron@ekuzo.gg",
      "aaron+a@b@ekuzo.gg",
      "evil-team+s1test-a@ekuzo.gg",
      "",
    ]) {
      assert.equal(testEmailAllowed(bad), false, bad);
    }
    assert.ok(S1_TEST_EMAIL_RE instanceof RegExp);
  });
  it("a test-mode event to a real address is skipped before any network call", async () => {
    const e = buildCommittedEvent(order({ email: "parent@example.com" }));
    assert.deepEqual(await sendKlaviyoEvent(e, false), { outcome: "skipped_test" });
  });
});

describe("Klaviyo payloads", () => {
  it("Committed property set is exactly the contract, with no invited_by_kid (T12)", () => {
    const e = buildCommittedEvent(order());
    assert.deepEqual(Object.keys(e.props).sort(), [...COMMITTED_PROPERTY_KEYS].sort());
    assert.equal("invited_by_kid" in e.props, false);
    assert.equal(JSON.stringify(e).includes("Zed"), false, "inviter kid name must not reach the joiner's event");
    assert.equal(e.props.invited, true);
    assert.equal(e.props.kid_name, "Ava");
    assert.equal(e.props.kid_age, 11);
    assert.equal(e.props.sibling_names, "Ben");
    assert.equal(e.props.kids_count, 2);
    assert.equal(e.props.amount_paid, 180);
    assert.equal(e.uniqueId, "abcd234567");
    assert.equal(e.metric, "Season 01 Committed");
  });
  it("S7: Committed event carries utm_source, utm_medium, utm_campaign, utm_content and first_touch; the profile never does", () => {
    const e = buildCommittedEvent(
      order({ utmSource: "klaviyo", utmMedium: "email", utmCampaign: "s01_open", utmContent: "hero", firstTouch: "paid_meta" }),
    );
    assert.equal(e.props.utm_source, "klaviyo");
    assert.equal(e.props.utm_medium, "email");
    assert.equal(e.props.utm_campaign, "s01_open");
    assert.equal(e.props.utm_content, "hero");
    assert.equal(e.props.first_touch, "paid_meta");
    const profile = JSON.stringify(e.profileProps);
    for (const k of ["utm_", "first_touch", "season1_ad_name", "klaviyo", "s01_open", "paid_meta"]) {
      assert.equal(profile.includes(k), false, `profile must not carry ${k}`);
    }
    const none = buildCommittedEvent(order());
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "first_touch"]) assert.equal(none.props[k as keyof typeof none.props], "", k);
  });
  it("share_url is the live domain in live mode and the recorded origin in test", () => {
    assert.equal(buildCommittedEvent(order({ livemode: true })).props.share_url, "https://ekuzo.gg/crew/48271938");
    assert.equal(
      buildCommittedEvent(order({ origin: "https://deploy-preview-3--ekuzo.netlify.app" })).props.share_url,
      "https://deploy-preview-3--ekuzo.netlify.app/crew/48271938",
    );
    assert.equal(buildCommittedEvent(order()).props.share_url, "https://season1-commit--ekuzo.netlify.app/crew/48271938");
    assert.equal(
      buildCommittedEvent(order({ origin: "javascript:alert(1)" })).props.share_url,
      "https://season1-commit--ekuzo.netlify.app/crew/48271938",
    );
  });
  it("profile properties and phone without SMS marketing consent", () => {
    const e = buildCommittedEvent(order());
    assert.deepEqual(Object.keys(e.profileProps).sort(), [
      "season1_code", "season1_committed_at", "season1_invited", "season1_jersey_eligible", "season1_kid_name",
      "season1_kids_count", "season1_offer", "season1_share_url", "season1_status", "season1_text_consent_at",
      "season1_text_phone",
    ].sort());
    assert.equal(e.profileProps.season1_status, "committed");
    const body = JSON.stringify(toRequestBody(e));
    assert.equal(/sms|subscri/i.test(body), false);
    const noPhone = buildCommittedEvent(order({ phone: null }));
    assert.equal("season1_text_phone" in noPhone.profileProps, false);
  });
  it("request body shape", () => {
    const b = toRequestBody(buildCommittedEvent(order()));
    assert.equal(b.data.type, "event");
    assert.equal(b.data.attributes.unique_id, "abcd234567");
    assert.equal(b.data.attributes.metric.data.attributes.name, "Season 01 Committed");
    assert.equal(b.data.attributes.profile.data.attributes.email, "team+s1test-x1@ekuzo.gg");
  });
  it("Friend Joined carries no kid names of the friend or of the joiner", () => {
    const e = buildFriendJoinedEvent(friend(), new Date("2026-10-27T16:00:00Z"));
    assert.deepEqual(Object.keys(e.props).sort(), [...FRIEND_JOINED_PROPERTY_KEYS].sort());
    assert.equal(e.uniqueId, "11111111-2222-3333-4444-555555555555");
    assert.equal(e.props.friend_kids, 2);
    assert.equal(e.props.friends_total, 3);
    assert.equal(e.props.credit_pending, 3);
    assert.equal(e.props.credits_to_free, 1);
    assert.deepEqual(e.profileProps, { season1_friends_joined: 3, season1_credit_pending: 3 });
    const all = JSON.stringify(toRequestBody(e));
    for (const name of ["Ava", "Ben"]) assert.equal(all.includes(name), false, name);
    assert.equal(e.email, "team+s1test-inv@ekuzo.gg");
  });
  it("Friend Joined caps credits at the ladder", () => {
    const e = buildFriendJoinedEvent(friend({ friendsTotal: 7 }));
    assert.equal(e.props.credit_pending, 4);
    assert.equal(e.props.credits_to_free, 0);
  });
  it("Refunded", () => {
    const e = buildRefundedEvent({ refundId: "re_1", orderPublicId: "abcd234567", amountRefundedCents: 18000, full: true, order: order() });
    assert.deepEqual(Object.keys(e.props).sort(), [...REFUNDED_PROPERTY_KEYS].sort());
    assert.equal(e.uniqueId, "re_1");
    assert.equal(e.profileProps.season1_status, "refunded");
    const part = buildRefundedEvent({ refundId: "re_2", orderPublicId: "abcd234567", amountRefundedCents: 8000, full: false, order: order() });
    assert.deepEqual(part.profileProps, {});
  });
});

describe("Meta Purchase", () => {
  it("user_data holds only hashed email, external_id, ip and ua", () => {
    const e = buildPurchaseEvent(order());
    assert.deepEqual(Object.keys(e.user_data).sort(), ["client_ip_address", "client_user_agent", "em", "external_id"]);
    assert.deepEqual(e.user_data.em, [sha("team+s1test-x1@ekuzo.gg")]);
    assert.deepEqual(e.user_data.external_id, [sha("fam2345678")]);
    assert.equal(e.user_data.client_ip_address, "203.0.113.9");
    const text = JSON.stringify(e);
    for (const leak of ["Ava", "Ben", "Pat", "555", "Austin", "ekuzo.gg\""]) assert.equal(text.includes(leak), false, leak);
    assert.equal(e.event_id, "abcd234567");
    assert.equal(e.event_time, Math.floor(Date.parse("2026-10-27T15:05:00.000Z") / 1000));
    assert.equal(e.action_source, "website");
    assert.deepEqual(e.custom_data, { value: 180, currency: "USD", content_name: "Season 01", num_items: 2 });
  });
  it("drops a bad IP, keeps fbp and fbc when stored and valid", () => {
    const fbp = "fb.1.1792999999999.1234567890";
    const fbc = "fb.1.1792999999999.IwAR_abc-1";
    const e = buildPurchaseEvent(order({ consentIp: "not-an-ip", fbp, fbc }));
    assert.deepEqual(Object.keys(e.user_data).sort(), ["client_user_agent", "em", "external_id", "fbc", "fbp"]);
    assert.equal(e.user_data.fbp, fbp);
    assert.equal(e.user_data.fbc, fbc);
  });
  it("money 8: a malformed fbp or fbc is omitted, never sent", () => {
    for (const [fbp, fbc] of [
      ["fb.1.1.2", "fb.1.1.abc"],
      ["fb.1.1792999999.1234567890", "fb.1.1792999999999.a b"],
      ["x".repeat(40), "fb.1.1792999999999." + "a".repeat(601)],
    ]) {
      const e = buildPurchaseEvent(order({ fbp, fbc }));
      assert.equal("fbp" in e.user_data, false, fbp);
      assert.equal("fbc" in e.user_data, false, fbc);
    }
  });
  it("test code is forced when livemode is false, absent when true; default TEST_S1", () => {
    const saved = process.env.META_CAPI_TEST_EVENT_CODE;
    try {
      delete process.env.META_CAPI_TEST_EVENT_CODE;
      assert.equal(testEventCode(), "TEST_S1");
      const ev = buildPurchaseEvent(order());
      assert.equal(buildRequestBody(ev, false, "tok").test_event_code, "TEST_S1");
      assert.equal("test_event_code" in buildRequestBody(ev, true, "tok"), false);
      process.env.META_CAPI_TEST_EVENT_CODE = "TEST999";
      assert.equal(buildRequestBody(ev, false, "tok").test_event_code, "TEST999");
    } finally {
      if (saved === undefined) delete process.env.META_CAPI_TEST_EVENT_CODE;
      else process.env.META_CAPI_TEST_EVENT_CODE = saved;
    }
  });
  it("event_source_url is the signup page", () => {
    assert.equal(buildPurchaseEvent(order({ livemode: true })).event_source_url, "https://ekuzo.gg/season1/join");
  });
});

describe("Discord messages", () => {
  const noPii = (s: string) => {
    assert.equal(s.includes("@"), false, s);
    assert.equal(/\d{7,}/.test(s.replace(/\b(48271937|48271938)\b/g, "").replace(/pi_\w+/g, "")), false, s);
    assert.equal(/ekuzo\.gg|gmail|555/i.test(s), false, s);
  };
  // Jamie 2026-10-30 13:17 CT: the commit now carries the payer email and location (replaces decision 9).
  const live = (over: Partial<OrderCtx> = {}) => order({ livemode: true, invited: false, referralCode: null, src: null, ...over });
  const one = [{ firstName: "Ava", age: 11, role: "first" }];
  const KIDS_AND_MONEY = ["Ava", "Ben", "Pat", "(11)", "(9)", "$", "180", "555", "0142", "48271937", "48271938", "jersey", "refund", "abcd234567"];

  it("commit message: exact format, test tag, kid count, email, location, source", () => {
    assert.equal(
      formatCommit(order()),
      "[TEST] Season 01 commit | 2 kids | Email: team+s1test-x1@ekuzo.gg | Location: Austin, TX (time zone: America/Chicago) | Source: referral",
    );
    assert.equal(
      formatCommit(live({ email: "parent@example.com", kids: one, geoCity: "Oshkosh", geoRegion: "WI", geoTz: "America/Chicago", utmMedium: "paid_social", utmContent: "d11-a-toomuch-fl" }) ),
      "Season 01 commit | 1 kid | Email: parent@example.com | Location: Oshkosh, WI (time zone: America/Chicago) | Source: ad d11-a-toomuch-fl",
    );
    // Kid names, ages, phone, amount, ids and the order ref stay out.
    for (const m of [formatCommit(order()), formatCommit(live({ kids: one }))])
      for (const leak of KIDS_AND_MONEY) assert.equal(m.includes(leak), false, `${leak} in ${m}`);
  });
  it("kid count: 1 kid, 2 kids, 0 kids", () => {
    assert.match(formatCommit(live({ kids: one })), /^Season 01 commit \| 1 kid \|/);
    assert.match(formatCommit(live()), /^Season 01 commit \| 2 kids \|/);
    assert.match(formatCommit(live({ kids: [] })), /^Season 01 commit \| 0 kids \|/);
  });
  it("live messages carry no TEST tag; test messages do", () => {
    assert.equal(formatCommit(live()).startsWith("[TEST]"), false);
    assert.equal(formatCommit(order()).startsWith("[TEST] Season 01 commit"), true);
  });

  it("location degrades gracefully", () => {
    const loc = (o: Partial<OrderCtx>) => formatCommit(live(o)).split(" | ")[3];
    assert.equal(loc({}), "Location: Austin, TX (time zone: America/Chicago)");
    assert.equal(loc({ geoTz: null }), "Location: Austin, TX");
    assert.equal(loc({ geoTz: "" }), "Location: Austin, TX");
    assert.equal(loc({ geoCity: null }), "Location: TX (time zone: America/Chicago)");
    assert.equal(loc({ geoCity: null, geoTz: null }), "Location: TX");
    assert.equal(loc({ geoRegion: null }), "Location: Austin (time zone: America/Chicago)");
    assert.equal(loc({ geoCity: null, geoRegion: null, geoTz: null }), "Location: unknown");
    assert.equal(loc({ geoCity: null, geoRegion: null }), "Location: unknown (time zone: America/Chicago)");
  });

  describe("source branches (first match wins)", () => {
    const src = (o: Partial<OrderCtx>, adName: string | null = null) => formatCommit(live(o), adName).split(" | ")[4];
    it("a: invited order or src friend is referral, even with a paid click", () => {
      assert.equal(src({ invited: true, utmMedium: "paid", utmContent: "x" }, "Ad Z"), "Source: referral");
      assert.equal(src({ src: "friend" }), "Source: referral");
    });
    it("b: src karlin", () => {
      assert.equal(src({ src: "karlin", utmMedium: "cpc", utmContent: "x" }, "Ad Z"), "Source: karlin");
    });
    it("c: a paid last click is ad <utm_content>, by medium or by Meta source with content", () => {
      for (const m of ["paid", "cpc", "ppc", "paid_social", "PAID"])
        assert.equal(src({ utmMedium: m, utmContent: "d11-a" }), "Source: ad d11-a", m);
      for (const s of ["meta", "facebook", "fb", "ig", "instagram"])
        assert.equal(src({ utmSource: s, utmContent: "d11-a" }), "Source: ad d11-a", s);
      assert.equal(src({ utmMedium: "paid_social", utmContent: "d11-a" }, "Waitlist Ad"), "Source: ad d11-a", "c beats d");
    });
    it("d: the Klaviyo ad name, with (via <last click>) when the last click was something else", () => {
      assert.equal(src({ utmMedium: "email", utmCampaign: "s01-open" }, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl (via email)");
      assert.equal(src({ src: "email" }, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl (via email)");
      assert.equal(src({ src: "direct" }, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl (via organic)");
      assert.equal(src({}, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl (via organic)");
      assert.equal(src({ src: "ad_d3" }, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl");
      assert.equal(src({ utmSource: "meta" }, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl (via organic)", "meta source without content is not (c)");
      assert.equal(src({ utmMedium: "paid" }, "d11-a-toomuch-fl"), "Source: ad d11-a-toomuch-fl", "paid click without content: no redundant via");
    });
    it("e: email, with the campaign when present", () => {
      assert.equal(src({ utmMedium: "email", utmCampaign: "s01-open" }), "Source: email s01-open");
      assert.equal(src({ src: "email" }), "Source: email");
    });
    it("c2: a paid click with no content and no profile name is ad plus the campaign", () => {
      assert.equal(src({ utmMedium: "paid_social", utmCampaign: "s01" }), "Source: ad s01");
      assert.equal(src({ utmMedium: "cpc" }), "Source: ad");
    });
    it("f and g: first-touch bucket, then organic", () => {
      assert.equal(src({ firstTouch: "paid_meta" }), "Source: paid_meta");
      assert.equal(src({ firstTouch: "organic_google" }), "Source: organic_google");
      assert.equal(src({ firstTouch: "direct" }), "Source: direct");
      assert.equal(src({}), "Source: organic");
      assert.equal(src({ src: "address" }), "Source: organic");
    });
    it("sanitizes and caps every piece", () => {
      const m = formatCommit(live({ utmMedium: "paid", utmContent: "@everyone <@123> `x` **b** ~s~ |p| \\ 5125550142 " + "z".repeat(200) }));
      const s = m.split(" | ").slice(4).join(" | ");
      assert.equal(/[@<>`*~|\\]|\d{7,}/.test(s), false, s);
      assert.ok(s.length <= "Source: ad ".length + 80, s);
      assert.equal(m.split(" | ").length, 5, "no stray separators");
    });
    it("needsAdNameLookup: only when a, b, c have not settled the source", () => {
      assert.equal(needsAdNameLookup(live({ invited: true })), false);
      assert.equal(needsAdNameLookup(live({ src: "karlin" })), false);
      assert.equal(needsAdNameLookup(live({ utmMedium: "paid", utmContent: "x" })), false);
      assert.equal(needsAdNameLookup(live({ utmMedium: "paid" })), true);
      assert.equal(needsAdNameLookup(live({})), true);
    });
  });

  it("email: markup stripped, @ kept, capped at 120", () => {
    const e = (email: string) => formatCommit(live({ email })).split(" | ")[2];
    assert.equal(e("a.b+tag@example.com"), "Email: a.b+tag@example.com");
    assert.equal(e("a_b@example.com"), "Email: a_b@example.com");
    assert.equal(e("<@everyone>`x`*b*~s~|p|\\@e.com"), "Email: @everyonexbsp@e.com");
    assert.equal(e("a b\n@e.com"), "Email: ab@e.com");
    assert.equal(emailText("x".repeat(300)).length, 120);
    assert.equal(e(""), "Email: unknown");
  });
  it("city and region are stripped of mentions and markup", () => {
    const m = formatCommit(live({ geoCity: "Aus@tin <b>*", geoRegion: "T|X`", geoTz: "America/Chi cago<>" }));
    assert.equal(m.split(" | ")[3], "Location: Austin b, TX (time zone: America/Chicago)");
    assert.equal(m.split(" | ").length, 5);
  });

  describe("Klaviyo ad-name lookup (stubbed fetch)", () => {
    const realFetch = globalThis.fetch;
    const savedKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const stub = (fn: (url: string) => Promise<Response> | Response) => {
      calls.length = 0;
      globalThis.fetch = (async (url: unknown, init: RequestInit = {}) => {
        calls.push({ url: String(url), init });
        return fn(String(url));
      }) as typeof fetch;
    };
    const body = (props: Record<string, unknown> | null) =>
      new Response(JSON.stringify({ data: props ? [{ attributes: { properties: props } }] : [] }), { status: 200 });
    beforeEach(() => { process.env.KLAVIYO_PRIVATE_API_KEY = "pk_test_stub"; });
    afterEach(() => {
      globalThis.fetch = realFetch;
      if (savedKey === undefined) delete process.env.KLAVIYO_PRIVATE_API_KEY; else process.env.KLAVIYO_PRIVATE_API_KEY = savedKey;
    });

    it("found: returns season1_ad_name, with the documented request", async () => {
      stub(() => body({ season1_ad_name: "d11-a-toomuch-fl" }));
      assert.equal(await lookupAdName("Parent@Example.com", true), "d11-a-toomuch-fl");
      assert.equal(calls.length, 1);
      const u = decodeURIComponent(calls[0].url);
      assert.ok(u.startsWith("https://a.klaviyo.com/api/profiles?"), u);
      assert.ok(u.includes('filter=equals(email,"parent@example.com")'), u);
      assert.ok(u.includes("fields[profile]=properties"), u);
      const h = calls[0].init.headers as Record<string, string>;
      assert.equal(h.revision, KLAVIYO_REVISION);
      assert.ok(h.Authorization.startsWith("Klaviyo-API-Key "));
      assert.ok(calls[0].init.signal, "has a timeout signal");
    });
    it("not found, no property, blank property, non-string: null", async () => {
      stub(() => body(null));
      assert.equal(await lookupAdName("p@example.com", true), null);
      stub(() => body({ other: "x" }));
      assert.equal(await lookupAdName("p@example.com", true), null);
      stub(() => body({ season1_ad_name: "  " }));
      assert.equal(await lookupAdName("p@example.com", true), null);
      stub(() => body({ season1_ad_name: 42 }));
      assert.equal(await lookupAdName("p@example.com", true), null);
    });
    it("http error, bad json, network error and timeout all return null and never throw", async () => {
      stub(() => new Response("nope", { status: 500 }));
      assert.equal(await lookupAdName("p@example.com", true), null);
      stub(() => new Response("not json", { status: 200 }));
      assert.equal(await lookupAdName("p@example.com", true), null);
      stub(() => { throw new TypeError("fetch failed"); });
      assert.equal(await lookupAdName("p@example.com", true), null);
      stub(() => { throw Object.assign(new Error("timed out"), { name: "TimeoutError" }); });
      assert.equal(await lookupAdName("p@example.com", true), null);
    });
    it("no key, or a quote in the email: no request / safe filter", async () => {
      delete process.env.KLAVIYO_PRIVATE_API_KEY;
      stub(() => body({ season1_ad_name: "x" }));
      assert.equal(await lookupAdName("p@example.com", true), null);
      assert.equal(calls.length, 0);
      process.env.KLAVIYO_PRIVATE_API_KEY = "pk_test_stub";
      await lookupAdName('a"b\\c@example.com', true);
      assert.equal(decodeURIComponent(calls[0].url).includes('equals(email,"abc@example.com")'), true);
    });
    it("test mode: only the allowlisted test addresses are looked up", async () => {
      stub(() => body({ season1_ad_name: "x" }));
      assert.equal(await lookupAdName("real.parent@gmail.com", false), null);
      assert.equal(calls.length, 0);
      assert.equal(await lookupAdName("team+s1test-x1@ekuzo.gg", false), "x");
    });
    it("adNameFor skips the request when a, b or c settle the source", async () => {
      stub(() => body({ season1_ad_name: "x" }));
      assert.equal(await adNameFor(live({ invited: true })), null);
      assert.equal(await adNameFor(live({ src: "karlin" })), null);
      assert.equal(await adNameFor(live({ utmMedium: "paid", utmContent: "c" })), null);
      assert.equal(calls.length, 0);
      assert.equal(await adNameFor(live({ email: "p@example.com" })), "x");
      assert.equal(calls.length, 1);
    });
    it("end to end: lookup result lands in the line; a failed lookup falls through to email", async () => {
      const o = live({ email: "parent@example.com", utmMedium: "email", utmCampaign: "s01-open", kids: one, geoCity: "Oshkosh", geoRegion: "WI" });
      stub(() => body({ season1_ad_name: "d11-a-toomuch-fl" }));
      assert.equal(
        formatCommit(o, await adNameFor(o)),
        "Season 01 commit | 1 kid | Email: parent@example.com | Location: Oshkosh, WI (time zone: America/Chicago) | Source: ad d11-a-toomuch-fl (via email)",
      );
      stub(() => new Response("", { status: 503 }));
      assert.match(formatCommit(o, await adNameFor(o)), /Source: email s01-open$/);
    });
  });

  it("source category: referral when a friend code was used, else src mapped", () => {
    assert.equal(sourceCategory({ invited: true, src: "ad" }), "referral");
    assert.equal(sourceCategory({ invited: false, src: "friend" }), "referral");
    assert.equal(sourceCategory({ invited: false, src: "ad" }), "ad");
    assert.equal(sourceCategory({ invited: false, src: "ad_d3" }), "ad");
    assert.equal(sourceCategory({ invited: false, src: "karlin" }), "karlin");
    assert.equal(sourceCategory({ invited: false, src: "email" }), "email");
    assert.equal(sourceCategory({ invited: false, src: "direct" }), "organic");
    assert.equal(sourceCategory({ invited: false, src: null }), "organic");
    assert.equal(sourceCategory({ invited: false, src: "address" }), "organic");
  });
  it("flag and ops alert messages", () => {
    const m = formatFlag(friend(), "same_card", false);
    assert.match(m, /same_card/);
    assert.equal(m.includes("Zed"), false, m);
    noPii(m);
    const a = formatOpsAlert("orphan_paid_pi", "pi_3Abc123def456", true);
    assert.equal(a, "Season 01 ops alert: orphan_paid_pi | pi_3Abc123def456");
    assert.equal(formatOpsAlert("x", "not a pi @ x", true).includes("@"), false);
  });
  it("webhook env: test vs live, unset means skipped_no_config", async () => {
    const saved = { t: process.env.S1_DISCORD_WEBHOOK_URL_TEST, l: process.env.S1_DISCORD_WEBHOOK_URL };
    try {
      delete process.env.S1_DISCORD_WEBHOOK_URL_TEST;
      delete process.env.S1_DISCORD_WEBHOOK_URL;
      assert.equal(webhookUrl(false), null);
      assert.deepEqual(await sendDiscord("x", false), { outcome: "skipped_no_config" });
      assert.deepEqual(await sendDiscord("x", true), { outcome: "skipped_no_config" });
      process.env.S1_DISCORD_WEBHOOK_URL_TEST = "https://example.invalid/test";
      assert.equal(webhookUrl(false), "https://example.invalid/test");
      assert.equal(webhookUrl(true), null);
    } finally {
      if (saved.t === undefined) delete process.env.S1_DISCORD_WEBHOOK_URL_TEST; else process.env.S1_DISCORD_WEBHOOK_URL_TEST = saved.t;
      if (saved.l === undefined) delete process.env.S1_DISCORD_WEBHOOK_URL; else process.env.S1_DISCORD_WEBHOOK_URL = saved.l;
    }
  });
});
