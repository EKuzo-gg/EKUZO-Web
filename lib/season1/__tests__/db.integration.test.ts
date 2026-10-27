import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  getSql,
  upsertFamilyGuardian,
  insertKids,
  priorPaidKidCount,
  insertPendingOrder,
  setOrderPaymentIntent,
  getOrderByPublicId,
  claimOrderPaid,
  getPaidUnfulfilledOrderByPi,
  markFulfilled,
  mintFamilyCode,
  insertEvent,
  enqueueOutbox,
  newPublicId,
} from "../db";
import { hit } from "../ratelimit";
import { mintNumeric } from "../codes";

// Runs only against the Neon test branch: S1_DB_TESTS=1 node --env-file=.env.local ...
const enabled = process.env.S1_DB_TESTS === "1";
const rand = () => randomBytes(5).toString("hex");

describe("season1 db (integration)", { skip: enabled ? false : "set S1_DB_TESTS=1 to run" }, () => {
  const tag = rand();
  const email = `team+s1test-${tag}@ekuzo.gg`;
  const piId = `pi_test_${tag}`;
  const eventId = `evt_test_${tag}`;
  const outboxKey = `test_kind:${tag}`;
  const rlKey = `test:${tag}`;
  let familyId = "";
  let orderId = "";
  let publicId = "";
  let kidIds: string[] = [];

  after(() => {
    console.log(`# test rows: email=${email} pi=${piId} event=${eventId} outbox=${outboxKey} rl=${rlKey}`);
  });

  it("public ids use the no-lookalike alphabet", () => {
    for (let i = 0; i < 50; i++) assert.match(newPublicId(), /^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/);
  });

  it("upserts family and guardian, reusing the family for the same email", async () => {
    const a = await upsertFamilyGuardian({
      email, firstName: "Test", phone: null, livemode: false,
      attribution: { src: "test" }, geo: { city: "Austin" },
    });
    const b = await upsertFamilyGuardian({ email: email.toUpperCase(), firstName: "Test2", livemode: false });
    assert.equal(b.familyId, a.familyId);
    assert.equal(b.guardianId, a.guardianId);
    assert.equal(b.familyPublicId, a.familyPublicId);
    familyId = a.familyId;
  });

  it("inserts kids and a pending order with items", async () => {
    kidIds = await insertKids(familyId, [{ firstName: "Zoë", age: 11 }, { firstName: "Max", age: 9 }], new Date());
    assert.equal(kidIds.length, 2);
    const o = await insertPendingOrder({
      familyId, payerEmail: email, offerId: "s1-commit", offerVersion: "s1-commit-v1",
      amountCents: 18000, consentVersion: "test", consentAt: new Date(), consentIp: "203.0.113.1",
      consentUa: "node-test", src: "test", livemode: false,
      items: [
        { kidId: kidIds[0], role: "first", unitCents: 10000 },
        { kidId: kidIds[1], role: "sibling", unitCents: 8000 },
      ],
    });
    orderId = o.orderId;
    publicId = o.publicId;
    await setOrderPaymentIntent(orderId, piId, new Date(), true);
    const view = await getOrderByPublicId(publicId);
    assert.ok(view);
    assert.equal(view.status, "pending");
    assert.equal(view.amountCents, 18000);
    assert.equal(view.kids.length, 2);
    assert.equal(view.paymentIntentId, piId);
    assert.equal(view.jerseyEligible, true);
    assert.equal(view.code, null);
    assert.equal(await getOrderByPublicId("nope000000"), null);
  });

  it("pending orders do not count as prior paid kids", async () => {
    assert.equal(await priorPaidKidCount(email, false), 0);
  });

  it("claims a paid order exactly once", async () => {
    const first = await claimOrderPaid(piId, "pm_test_1");
    assert.ok(first);
    assert.equal(first.publicId, publicId);
    assert.equal(first.amountCents, 18000);
    const second = await claimOrderPaid(piId, "pm_test_1");
    assert.equal(second, null);
    assert.equal(await claimOrderPaid("pi_test_missing_" + tag, null), null);
    assert.equal(await priorPaidKidCount(email, false), 2);
    assert.equal(await priorPaidKidCount(email, true), 0);
  });

  it("tracks fulfilment completion", async () => {
    const pending = await getPaidUnfulfilledOrderByPi(piId);
    assert.ok(pending);
    assert.equal(pending.orderId, orderId);
    assert.equal(await markFulfilled(orderId), true);
    assert.equal(await markFulfilled(orderId), false);
    assert.equal(await getPaidUnfulfilledOrderByPi(piId), null);
  });

  it("mints one family code, returning the same code on repeat and under concurrency", async () => {
    const c1 = await mintFamilyCode(familyId, false, () => mintNumeric());
    const c2 = await mintFamilyCode(familyId, false, () => mintNumeric());
    assert.equal(c2, c1);
    const other = await upsertFamilyGuardian({ email: `team+s1test-${tag}b@ekuzo.gg`, livemode: false });
    const [x, y, z] = await Promise.all([
      mintFamilyCode(other.familyId, false, () => mintNumeric()),
      mintFamilyCode(other.familyId, false, () => mintNumeric()),
      mintFamilyCode(other.familyId, false, () => mintNumeric()),
    ]);
    assert.equal(x, y);
    assert.equal(y, z);
    const view = await getOrderByPublicId(publicId);
    assert.equal(view?.code, c1);
    assert.equal(view?.status, "paid");
  });

  it("mintFamilyCode retries on a code collision", async () => {
    const f = await upsertFamilyGuardian({ email: `team+s1test-${tag}c@ekuzo.gg`, livemode: false });
    const taken = await mintFamilyCode(familyId, false, () => mintNumeric());
    const seq = [taken, taken, mintNumeric()];
    const got = await mintFamilyCode(f.familyId, false, () => seq.shift() as string);
    assert.notEqual(got, taken);
  });

  it("records a stripe event once", async () => {
    const e = { source: "test", type: "payment_intent.succeeded", subject: piId, stripeEventId: eventId, data: { n: 1 } };
    assert.equal(await insertEvent(e), true);
    assert.equal(await insertEvent(e), false);
  });

  it("enqueues an outbox key once", async () => {
    assert.equal(await enqueueOutbox("test_kind", outboxKey, { a: 1 }), true);
    assert.equal(await enqueueOutbox("test_kind", outboxKey, { a: 2 }), false);
    const rows = (await getSql().query(`select count(*)::int as n from s1_outbox where dedupe_key = $1`, [
      outboxKey,
    ])) as { n: number }[];
    assert.equal(rows[0].n, 1);
  });

  it("rate limits within a window", async () => {
    assert.equal(await hit(rlKey, 2, 600), true);
    assert.equal(await hit(rlKey, 2, 600), true);
    assert.equal(await hit(rlKey, 2, 600), false);
  });
});
