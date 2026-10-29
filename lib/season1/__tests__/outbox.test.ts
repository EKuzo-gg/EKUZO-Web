import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { isStale, maxAgeMs } from "../outbox";
import type { FriendCtx, OrderCtx } from "../senders/context";
import {
  COMMITTED_PROPERTY_KEYS,
  FRIEND_JOINED_PROPERTY_KEYS,
  REFUNDED_PROPERTY_KEYS,
  S1_TEST_EMAIL_RE,
  buildCommittedEvent,
  buildFriendJoinedEvent,
  buildRefundedEvent,
  sendKlaviyoEvent,
  testEmailAllowed,
  toRequestBody,
} from "../senders/klaviyo";
import { buildPurchaseEvent, buildRequestBody, testEventCode } from "../senders/meta";
import { formatCommit, formatFlag, formatOpsAlert, sendDiscord, sourceCategory, webhookUrl } from "../senders/discord";

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
  fbp: null,
  fbc: null,
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
  it("drops a bad IP, keeps fbp and fbc when stored", () => {
    const e = buildPurchaseEvent(order({ consentIp: "not-an-ip", fbp: "fb.1.1.2", fbc: "fb.1.1.abc" }));
    assert.deepEqual(Object.keys(e.user_data).sort(), ["client_user_agent", "em", "external_id", "fbc", "fbp"]);
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
  it("commit message is test tag, amount, kid count, source and ref only (decision 9)", () => {
    const m = formatCommit(order());
    assert.equal(m, "[TEST] Season 01 commit | $180 | 2 kids | source referral | ref abcd234567");
    // No parent or kid names, ages, city, region, inviter, code, jersey or refund status.
    for (const leak of ["Pat", "Ava", "Ben", "Zed", "(11)", "(9)", "Austin", "TX", "48271937", "48271938", "jersey", "refund"])
      assert.equal(m.includes(leak), false, leak);
    noPii(m);
    const one = formatCommit(order({ invited: false, src: "karlin", kids: [{ firstName: "Ava", age: 11, role: "first" }], amountCents: 10000, jerseyEligible: false, status: "refunded" }));
    assert.equal(one, "[TEST] Season 01 commit | $100 | 1 kid | source karlin | ref abcd234567");
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
  it("strips mentions and phone-like text from user-supplied fields", () => {
    const m = formatCommit(order({ parentFirstName: "@everyone Pat", src: "5125550142 <@123> `x`", geoCity: "Aus@tin" }));
    noPii(m);
    assert.equal(/[<>`]/.test(m), false);
  });
  it("live messages carry no TEST tag", () => {
    assert.equal(formatCommit(order({ livemode: true })).startsWith("[TEST]"), false);
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
