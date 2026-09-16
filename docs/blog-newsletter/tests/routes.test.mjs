// Plain-node tests for app/api/newsletter/route.ts and app/api/contact/route.ts.
// No test runner dependency beyond Node's own node:test / node:assert (Node 22).
//
// Run with:
//   node --test docs/blog-newsletter/tests/routes.test.mjs
//
// How the next/server shim is loaded: this file calls node:module's
// register() at the top, before anything else runs, pointing at
// ./next-server-shim.mjs (a sibling file in this same directory). That
// registers a custom ESM resolution hook for the whole process, so the
// later `await import("../../../app/api/newsletter/route.ts")` below (whose
// source contains a bare `import ... from "next/server"`) resolves
// correctly. See docs/blog-newsletter/02-contract.md section 7 for why the
// shim is needed (next's package.json has no "exports" map, so Node's ESM
// resolver won't add the missing .js extension the way its CJS resolver
// does) and how it was verified against the unmodified routes.
import { register } from "node:module";
register("./next-server-shim.mjs", import.meta.url);

import test from "node:test";
import assert from "node:assert/strict";

// Dummy env vars, set before importing either route module (section 7).
// RESEND_API_KEY must be set or /api/contact's whole Resend block is
// skipped, which would make the P10/N5 Resend-line assertions untestable.
process.env.BEEHIIV_API_KEY = "dummy-key";
process.env.BEEHIIV_PUBLICATION_ID = "pub_dummy";
process.env.RESEND_API_KEY = "dummy-resend-key";

const newsletterMod = await import("../../../app/api/newsletter/route.ts");
const contactMod = await import("../../../app/api/contact/route.ts");

// ---------------------------------------------------------------------------
// Fetch mock helpers
// ---------------------------------------------------------------------------

/**
 * Builds a global.fetch stub that records every call's URL and body
 * synchronously, on invocation (not on settle) -- this is what lets the
 * test see an un-awaited tag call's arguments even though the route never
 * awaits it (contract section 3).
 */
function makeFetchMock({ subscriptionOk = true, subId = "sub_123", tagOk = true } = {}) {
  const calls = [];
  const fn = async (url, opts) => {
    const rawBody = opts?.body;
    const parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
    calls.push({ url: String(url), rawBody, body: parsedBody });

    if (String(url).includes("/tags")) {
      if (!tagOk) {
        return { ok: false, status: 500, json: async () => ({ error: "tag failed" }) };
      }
      return { ok: true, status: 201, json: async () => ({}) };
    }
    if (String(url).includes("api.resend.com")) {
      return { ok: true, status: 200, json: async () => ({ id: "email_123" }) };
    }
    // create-subscription call
    if (!subscriptionOk) {
      return { ok: false, status: 500, json: async () => ({ error: "sub failed" }) };
    }
    return { ok: true, status: 200, json: async () => ({ data: { id: subId } }) };
  };
  return { fn, calls };
}

function newsletterRequest(body) {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function contactRequest(body) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function subscriptionCall(calls) {
  return calls.find((c) => c.url.endsWith("/subscriptions"));
}
function tagsCall(calls) {
  return calls.find((c) => c.url.endsWith("/tags"));
}
function resendCall(calls) {
  return calls.find((c) => c.url.includes("api.resend.com"));
}

// The exact "today" body, per 02-contract.md section 2, case (a).
const TODAY_BODY_STRING = JSON.stringify({
  email: "a@b.com",
  utm_source: "newsletter-signup",
  referring_site: "https://ekuzo.gg",
  custom_fields: [],
});

// ---------------------------------------------------------------------------
// /api/newsletter
// ---------------------------------------------------------------------------

test("T1a: no utm fields -> Beehiiv body byte-identical to today's documented body", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await newsletterMod.POST(newsletterRequest({ email: "a@b.com" }));

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  assert.equal(subscriptionCall(calls).rawBody, TODAY_BODY_STRING);
});

test("N3: FooterNewsletter's exact { email } payload produces an unchanged Beehiiv body", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  // FooterNewsletter.tsx sends exactly { email }, per contract section 1.
  const res = await newsletterMod.POST(newsletterRequest({ email: "a@b.com" }));

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  assert.equal(subscriptionCall(calls).rawBody, TODAY_BODY_STRING);
  assert.deepEqual(tagsCall(calls).body, { tags: ["source-newsletter"] });
});

test("T1b: blog popup, thumbs -> Beehiiv body matches section 2 case (b)", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await newsletterMod.POST(
    newsletterRequest({
      email: "reader@example.com",
      utm_source: "blog",
      utm_medium: "popup",
      utm_campaign: "thumbs",
    })
  );

  assert.equal(res.status, 200);
  assert.deepEqual(subscriptionCall(calls).body, {
    email: "reader@example.com",
    utm_source: "blog",
    utm_medium: "popup",
    utm_campaign: "thumbs",
    referring_site: "https://ekuzo.gg",
    custom_fields: [],
  });
});

test("T1c: blog sticky bar, classic -> Beehiiv body matches section 2 case (c)", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await newsletterMod.POST(
    newsletterRequest({
      email: "reader@example.com",
      utm_source: "blog",
      utm_medium: "sticky",
      utm_campaign: "classic",
    })
  );

  assert.equal(res.status, 200);
  assert.deepEqual(subscriptionCall(calls).body, {
    email: "reader@example.com",
    utm_source: "blog",
    utm_medium: "sticky",
    utm_campaign: "classic",
    referring_site: "https://ekuzo.gg",
    custom_fields: [],
  });
});

test("T1d: all three utm fields invalid -> body reduces to exactly case (a)'s shape", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await newsletterMod.POST(
    newsletterRequest({
      email: "a@b.com",
      utm_source: "spammy-source",
      utm_medium: "email-blast",
      utm_campaign: "unknown-variant",
    })
  );

  assert.equal(res.status, 200);
  assert.equal(subscriptionCall(calls).rawBody, TODAY_BODY_STRING);
});

test("T1d: mixed valid/invalid (valid source+medium, invalid campaign) -> utm_campaign key absent", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await newsletterMod.POST(
    newsletterRequest({
      email: "reader@example.com",
      utm_source: "blog",
      utm_medium: "popup",
      utm_campaign: "SOMETHING_ELSE",
    })
  );

  assert.equal(res.status, 200);
  const body = subscriptionCall(calls).body;
  assert.deepEqual(body, {
    email: "reader@example.com",
    utm_source: "blog",
    utm_medium: "popup",
    referring_site: "https://ekuzo.gg",
    custom_fields: [],
  });
  assert.equal("utm_campaign" in body, false);
});

test("T2: non-blog signup -> tag body is exactly today's { tags: [\"source-newsletter\"] }", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  await newsletterMod.POST(newsletterRequest({ email: "a@b.com" }));

  assert.deepEqual(tagsCall(calls).body, { tags: ["source-newsletter"] });
});

test("T2: blog signup, valid campaign thumbs -> tag body [\"source-blog\", \"variant-thumbs\"]", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  await newsletterMod.POST(
    newsletterRequest({
      email: "reader@example.com",
      utm_source: "blog",
      utm_medium: "popup",
      utm_campaign: "thumbs",
    })
  );

  assert.deepEqual(tagsCall(calls).body, { tags: ["source-blog", "variant-thumbs"] });
});

test("T2: blog signup, valid campaign classic -> tag body [\"source-blog\", \"variant-classic\"]", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  await newsletterMod.POST(
    newsletterRequest({
      email: "reader@example.com",
      utm_source: "blog",
      utm_medium: "sticky",
      utm_campaign: "classic",
    })
  );

  assert.deepEqual(tagsCall(calls).body, { tags: ["source-blog", "variant-classic"] });
});

test("T2 (edge case, contract section 3): blog signup, missing/invalid campaign -> tag body [\"source-blog\"] only", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  await newsletterMod.POST(
    newsletterRequest({
      email: "reader@example.com",
      utm_source: "blog",
      utm_medium: "popup",
      utm_campaign: "SOMETHING_ELSE",
    })
  );

  assert.deepEqual(tagsCall(calls).body, { tags: ["source-blog"] });
});

test("T3: tag endpoint returns 500 -> route still resolves 200 { success: true }", async () => {
  const { fn, calls } = makeFetchMock({ tagOk: false });
  global.fetch = fn;

  const res = await newsletterMod.POST(newsletterRequest({ email: "a@b.com" }));

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  // the tag call did happen (fire-and-forget), it just failed non-blockingly
  assert.ok(tagsCall(calls));
});

// ---------------------------------------------------------------------------
// /api/contact
// ---------------------------------------------------------------------------

test("N5: contact without heardAbout -> Resend HTML and Beehiiv payload byte-identical to today", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await contactMod.POST(
    contactRequest({
      name: "Jamie Fosu",
      contactMethod: "email",
      email: "jamie@example.com",
      message: "Hi there",
      pageUrl: "https://ekuzo.gg/contact",
    })
  );

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });

  assert.deepEqual(subscriptionCall(calls).body, {
    email: "jamie@example.com",
    utm_source: "contact-form",
    referring_site: "https://ekuzo.gg/contact",
    custom_fields: [
      { name: "first_name", value: "Jamie" },
      { name: "last_name", value: "Fosu" },
    ],
  });
  assert.deepEqual(tagsCall(calls).body, { tags: ["source-contact-form"] });

  const html = resendCall(calls).body.html;
  assert.ok(!html.includes("How they heard about us"));
});

test("P10: contact with heardAbout \"x\" -> Resend line, heard-x tag, no new custom_fields key", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await contactMod.POST(
    contactRequest({
      name: "Jamie Fosu",
      contactMethod: "email",
      email: "jamie@example.com",
      message: "Hi there",
      pageUrl: "https://ekuzo.gg/contact",
      heardAbout: "x",
    })
  );

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });

  // Resend HTML contains the exact "How they heard about us" line with the
  // X (Twitter) label from the copy deck.
  const html = resendCall(calls).body.html;
  assert.ok(
    html.includes("<p><strong>How they heard about us:</strong> X (Twitter)</p>")
  );

  // Tag call body contains both source-contact-form and heard-x.
  assert.deepEqual(tagsCall(calls).body, { tags: ["source-contact-form", "heard-x"] });

  // No new custom_fields key: the create-subscription custom_fields array
  // is exactly first_name/last_name, nothing heardAbout-related.
  const customFields = subscriptionCall(calls).body.custom_fields;
  assert.deepEqual(customFields, [
    { name: "first_name", value: "Jamie" },
    { name: "last_name", value: "Fosu" },
  ]);
  assert.ok(!subscriptionCall(calls).rawBody.includes("heard"));
});

test("P10 (validation): unrecognized heardAbout value behaves exactly like no heardAbout", async () => {
  const { fn, calls } = makeFetchMock();
  global.fetch = fn;

  const res = await contactMod.POST(
    contactRequest({
      name: "Jamie Fosu",
      contactMethod: "email",
      email: "jamie@example.com",
      pageUrl: "https://ekuzo.gg/contact",
      heardAbout: "carrier-pigeon",
    })
  );

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  assert.deepEqual(tagsCall(calls).body, { tags: ["source-contact-form"] });
  const html = resendCall(calls).body.html;
  assert.ok(!html.includes("How they heard about us"));
});
