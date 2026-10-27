import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { signRef, verifyRef, refSecret, REF_COOKIE, refSetCookieHeader, refClearCookieHeader } from "../refcookie";
import { computeFlags, ipBucket, isCrawlerUa } from "../referralFlags";

describe("refcookie", () => {
  const secret = "test-secret-1";
  it("round-trips a numeric and a partner code", () => {
    for (const code of ["48271937", "acme"]) {
      const v = signRef(code, secret);
      assert.match(v, /^[A-Za-z0-9]+\.[A-Za-z0-9_-]{43}$/);
      assert.equal(verifyRef(v, secret), code);
    }
  });
  it("rejects a tampered code, a tampered signature and a wrong secret", () => {
    const v = signRef("48271937", secret);
    assert.equal(verifyRef(v.replace("48271937", "48271938"), secret), null);
    assert.equal(verifyRef(v.slice(0, -1) + (v.endsWith("A") ? "B" : "A"), secret), null);
    assert.equal(verifyRef(v, "other-secret"), null);
  });
  it("rejects unsigned, empty and malformed values", () => {
    for (const bad of ["48271937", "", ".", "48271937.", ".abc", "a.b.c", null, undefined, "48271937.short"]) {
      assert.equal(verifyRef(bad as string, secret), null, String(bad));
    }
  });
  it("cookie attributes are constant", () => {
    assert.deepEqual(
      { ...REF_COOKIE },
      { name: "s1_ref", path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 1209600 },
    );
    const h = refSetCookieHeader("x.y");
    assert.match(h, /^s1_ref=x\.y; Path=\/; Max-Age=1209600; HttpOnly; Secure; SameSite=Lax$/);
    assert.match(refClearCookieHeader(), /Max-Age=0/);
  });
  it("refSecret prefers S1_REF_SECRET, falls back, and throws when neither is set", () => {
    const saved = { a: process.env.S1_REF_SECRET, b: process.env.S1_STRIPE_WEBHOOK_SECRET };
    try {
      delete process.env.S1_REF_SECRET;
      delete process.env.S1_STRIPE_WEBHOOK_SECRET;
      assert.throws(() => refSecret());
      process.env.S1_STRIPE_WEBHOOK_SECRET = "fallback-secret-value";
      assert.equal(refSecret(), "fallback-secret-value");
      process.env.S1_REF_SECRET = "primary";
      assert.equal(refSecret(), "primary");
    } finally {
      if (saved.a === undefined) delete process.env.S1_REF_SECRET; else process.env.S1_REF_SECRET = saved.a;
      if (saved.b === undefined) delete process.env.S1_STRIPE_WEBHOOK_SECRET; else process.env.S1_STRIPE_WEBHOOK_SECRET = saved.b;
    }
  });
});

describe("ipBucket", () => {
  it("leaves IPv4 unchanged", () => {
    assert.equal(ipBucket("203.0.113.9"), "203.0.113.9");
  });
  it("reduces IPv6 to the /64", () => {
    assert.equal(ipBucket("2001:db8:1:2:aaaa:bbbb:cccc:dddd"), "2001:db8:1:2::/64");
    assert.equal(ipBucket("2001:DB8:1:2::1"), "2001:db8:1:2::/64");
    assert.equal(ipBucket("2001:db8:1:2:ffff::"), "2001:db8:1:2::/64");
    assert.equal(ipBucket("2001:0db8:0001:0002:0000:0000:0000:0001"), "2001:db8:1:2::/64");
  });
  it("same /64 collides, different /64 does not", () => {
    assert.equal(ipBucket("2001:db8:1:2::1"), ipBucket("2001:db8:1:2:9::9"));
    assert.notEqual(ipBucket("2001:db8:1:2::1"), ipBucket("2001:db8:1:3::1"));
  });
  it("handles compression at the front and IPv4-mapped addresses", () => {
    assert.equal(ipBucket("::1"), "0:0:0:0::/64");
    assert.equal(ipBucket("::ffff:203.0.113.9"), "203.0.113.9");
    assert.equal(ipBucket("fe80::1%eth0"), "fe80:0:0:0::/64");
  });
  it("missing or garbage input is noip", () => {
    for (const v of [undefined, null, "", "   ", "not-an-ip", "1:2:3", "1::2::3", "300.1.1.1x"]) {
      assert.equal(ipBucket(v as string), "noip", String(v));
    }
  });
});

describe("computeFlags", () => {
  const base = {
    joinerFingerprint: "fp_a",
    inviterFingerprints: ["fp_b"],
    joinerZip: "78757",
    inviterZip: "98101",
    codeJoinsLast24h: 1,
    inviterLiveFriendKidsAfter: 1,
  };
  it("no flags for an ordinary join", () => {
    assert.deepEqual(computeFlags(base), []);
  });
  it("shared_card when the fingerprint is on the inviter's orders; not when null", () => {
    assert.deepEqual(computeFlags({ ...base, inviterFingerprints: ["fp_x", "fp_a"] }), ["shared_card"]);
    assert.deepEqual(computeFlags({ ...base, joinerFingerprint: null, inviterFingerprints: ["fp_a"] }), []);
  });
  it("same_zip compares the first five digits and ignores blanks", () => {
    assert.deepEqual(computeFlags({ ...base, inviterZip: "78757-1234" }), ["same_zip"]);
    assert.deepEqual(computeFlags({ ...base, joinerZip: "", inviterZip: "" }), []);
    assert.deepEqual(computeFlags({ ...base, joinerZip: null, inviterZip: "78757" }), []);
  });
  it("burst at 5 or more, not at 4", () => {
    assert.deepEqual(computeFlags({ ...base, codeJoinsLast24h: 4 }), []);
    assert.deepEqual(computeFlags({ ...base, codeJoinsLast24h: 5 }), ["burst"]);
    assert.deepEqual(computeFlags({ ...base, codeJoinsLast24h: 9 }), ["burst"]);
  });
  it("free_reached only when crossing from below 4 to 4 or more", () => {
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 3 }), []);
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 4 }), ["free_reached"]);
    // already at 4, one more: no re-flag
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 5 }), []);
    // two friend kids take 3 to 5: crossing
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 5, joinerFriendKids: 2 }), ["free_reached"]);
    // two friend kids take 4 to 6: no re-flag
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 6, joinerFriendKids: 2 }), []);
  });
  it("node only when crossing from below 10 to 10 or more", () => {
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 9 }), []);
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 10 }), ["node"]);
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 11 }), []);
    assert.deepEqual(computeFlags({ ...base, inviterLiveFriendKidsAfter: 11, joinerFriendKids: 3 }), ["node"]);
  });
  it("stable order with several flags", () => {
    assert.deepEqual(
      computeFlags({
        ...base, inviterFingerprints: ["fp_a"], inviterZip: "78757", codeJoinsLast24h: 6,
        inviterLiveFriendKidsAfter: 4,
      }),
      ["shared_card", "same_zip", "burst", "free_reached"],
    );
  });
});

describe("isCrawlerUa", () => {
  const crawlers = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Facebot",
    "WhatsApp/2.23.20.0 A",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Twitterbot/1.0",
    "TelegramBot (like TwitterBot)",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15 (Applebot/0.1)",
    "com.apple.messages.URLPreviewService iMessage",
  ];
  it("detects known unfurl crawlers", () => {
    for (const ua of crawlers) assert.equal(isCrawlerUa(ua), true, ua);
  });
  it("does not flag normal browsers or missing UA", () => {
    assert.equal(isCrawlerUa("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1"), false);
    assert.equal(isCrawlerUa("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36"), false);
    assert.equal(isCrawlerUa(""), false);
    assert.equal(isCrawlerUa(null), false);
  });
});
