import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import Stripe from "stripe";
import { POST as commitPOST } from "../../../app/api/season1/commit/route";
import { POST as webhookPOST } from "../../../app/api/season1/stripe-webhook/route";
import { fulfil, fulfilFromReturn } from "../fulfil";
import { getSql, getOrderByViewToken, priorPaidKidCount } from "../db";
import { shouldSkipLegacy } from "../legacyGuard";

/**
 * Money-path integration (Relay B). Neon test branch plus REAL Stripe test
 * mode. Run: S1_DB_TESTS=1 node --env-file=.env.local ... (see evidence file).
 * Emails are team+s1test-<tag>...@ekuzo.gg only. Every Stripe object created
 * is printed on a "# ledger" line for 06-cleanup-ledger.md.
 */
const enabled = process.env.S1_DB_TESTS === "1";
const tag = randomBytes(4).toString("hex");
const ledger: string[] = [];
const note = (kind: string, id: string, why: string) => ledger.push(`# ledger ${kind} ${id} ${why}`);
const evidence: string[] = [];
const ev = (s: string) => evidence.push(`# evidence ${s}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
const sqlq = async (text: string, params: unknown[] = []) => (await getSql().query(text, params)) as Row[];

let stripe: Stripe;
let secret: string;
const email = (s: string) => `team+s1test-${tag}${s}@ekuzo.gg`;
const ip = () => `198.51.100.${1 + Math.floor(Math.random() * 250)}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function commit(body: Record<string, unknown>, opts: { ip?: string } = {}) {
  const res = await commitPOST(
    new Request("http://localhost:3103/api/season1/commit", {
      method: "POST",
      headers: {
        host: "localhost:3103",
        "content-type": "application/json",
        "user-agent": "relay-b-test",
        "x-nf-client-connection-ip": opts.ip ?? ip(),
        "x-forwarded-for": "203.0.113.9, 10.0.0.1",
      },
      body: JSON.stringify(body),
    }),
  );
  const j = (await res.json()) as Row;
  return { status: res.status, body: j, cookie: res.headers.get("set-cookie") };
}

function body(e: string, kids: { firstName: string; age: number }[], expectedCents: number, attemptId = randomUUID()) {
  return { email: e, parentFirstName: "Testparent", phone: "", kids, consent: true, company: "", attemptId, expectedCents };
}

async function postEvent(event: unknown, sec = secret) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: sec });
  const res = await webhookPOST(
    new Request("http://localhost:3103/api/season1/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": header, "content-type": "application/json" },
      body: payload,
    }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}

/** The real Stripe event for this object, or a constructed one if it is not listed yet. */
async function eventFor(type: string, objectId: string, fallbackObject: unknown, pick?: (e: Stripe.Event) => boolean) {
  for (let i = 0; i < 8; i++) {
    const list = await stripe.events.list({ type, limit: 10 });
    const hit = list.data.find(
      (e) => (e.data.object as unknown as { id: string }).id === objectId && (!pick || pick(e)),
    );
    if (hit) return { event: hit, real: true };
    await sleep(1500);
  }
  return {
    event: {
      id: `evt_local_${tag}_${randomBytes(4).toString("hex")}`,
      object: "event",
      api_version: "2026-02-25.clover",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
      type,
      data: { object: fallbackObject },
    },
    real: false,
  };
}

async function orderRow(publicId: string) {
  return (await sqlq(`select * from s1_orders where public_id = $1`, [publicId]))[0];
}
async function outboxCount(publicId: string) {
  return (await sqlq(`select count(*)::int n from s1_outbox where dedupe_key like '%:' || $1`, [publicId]))[0].n as number;
}
async function codesFor(familyId: string) {
  return sqlq(`select code, status from s1_codes where family_id = $1 and type = 'family'`, [familyId]);
}

describe("season1 money path (integration, Stripe test mode)", { skip: enabled ? false : "set S1_DB_TESTS=1 to run" }, () => {
  before(() => {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    assert.ok(key.startsWith("sk_test_"), "STRIPE_SECRET_KEY must be a test key");
    assert.ok((process.env.DATABASE_URL ?? "").includes("ep-lively-boat-b4fak1h6"), "test DB only");
    assert.ok(process.env.S1_STRIPE_WEBHOOK_SECRET, "S1_STRIPE_WEBHOOK_SECRET must be set");
    secret = process.env.S1_STRIPE_WEBHOOK_SECRET!;
    stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  });
  after(() => {
    console.log(`# tag ${tag}`);
    for (const l of ledger) console.log(l);
    for (const l of evidence) console.log(l);
  });

  // shared across tests
  let A: { piId: string; publicId: string; familyId: string; customer: string; pm: string; secret: string };
  const toCancel: string[] = [];
  after(async () => {
    for (const id of toCancel) {
      try {
        const p = await stripe.paymentIntents.retrieve(id);
        if (!["succeeded", "canceled", "processing"].includes(p.status)) await stripe.paymentIntents.cancel(id);
      } catch {
        // already final
      }
    }
  });
  const piOf = (secretStr: unknown) => String(secretStr).split("_secret_")[0];

  it("(a)+(b) commit -> PI (off_session, card, season1 metadata); reuse; visa; welcome, return and webhook race -> one claim; webhook replay is a no-op", async () => {
    const e = email("a");
    const b = body(e, [{ firstName: "Zoë", age: 11 }], 10000);
    const c = await commit(b);
    assert.equal(c.status, 200, JSON.stringify(c.body));
    assert.equal(c.body.amountCents, 10000);
    assert.match(c.body.orderId, /^[23456789a-z]{10}$/);
    assert.match(c.cookie ?? "", /^s1_order=[A-Za-z0-9_-]{43}; Path=\/season1; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax$/);
    const piId = piOf(c.body.clientSecret);
    note("payment_intent", piId, `(a) order ${c.body.orderId} SUCCEEDED`);

    const pi = await stripe.paymentIntents.retrieve(piId);
    assert.equal(pi.setup_future_usage, "off_session");
    assert.deepEqual(pi.payment_method_types, ["card"]);
    assert.equal(pi.amount, 10000);
    assert.equal(pi.currency, "usd");
    assert.equal(pi.description, "EKUZO Season 01 commitment");
    assert.equal(pi.receipt_email, e);
    assert.deepEqual(
      { ...pi.metadata },
      { product: "season1", order_id: c.body.orderId, offer_version: "s1-commit-v1", livemode: "false" },
    );
    assert.ok(pi.customer);
    note("customer", String(pi.customer), "(a) family customer");
    assert.equal(shouldSkipLegacy(pi), true, "(i) legacy guard skips a real season1 PI");

    // RT3: same attempt, same kids and amount -> same clientSecret, no new PI, fresh token.
    const again = await commit(b);
    assert.equal(again.status, 200);
    assert.equal(again.body.clientSecret, c.body.clientSecret);
    assert.equal(again.body.orderId, c.body.orderId);
    const token = (again.cookie ?? "").split(";")[0].split("=")[1];
    assert.equal(await getOrderByViewToken((c.cookie ?? "").split(";")[0].split("=")[1]), null, "older token replaced");
    assert.equal((await sqlq(`select count(*)::int n from s1_orders where payer_email = $1`, [e]))[0].n, 1);

    let row = await orderRow(c.body.orderId);
    assert.equal(row.status, "pending");
    assert.notEqual(row.consent_ip, "203.0.113.9", "RT20: consent_ip never from x-forwarded-for");
    assert.equal(row.consent_xff, "203.0.113.9, 10.0.0.1");
    assert.equal(row.payer_first_name, "Testparent");
    assert.equal(row.attempt_id, b.attemptId);
    assert.equal(row.livemode, false);
    assert.equal((await getOrderByViewToken(token))?.status, "pending");

    const confirmed = await stripe.paymentIntents.confirm(piId, { payment_method: "pm_card_visa" });
    assert.equal(confirmed.status, "succeeded");
    const { event, real } = await eventFor("payment_intent.succeeded", piId, confirmed);
    ev(`(a) PI ${piId} order ${c.body.orderId}; succeeded event ${event.id} real=${real}`);

    // (b) race: three fulfils, the signed webhook and the welcome return at once.
    const results = await Promise.all([
      fulfil(piId, "welcome"),
      fulfil(piId, "welcome"),
      fulfil(piId, "webhook"),
      postEvent(event),
      fulfilFromReturn(piId, String(c.body.clientSecret)),
    ]);
    const w1 = results[3] as { status: number; body: Row };
    assert.equal(w1.status, 200, JSON.stringify(w1.body));
    const ret = results[4] as Awaited<ReturnType<typeof fulfilFromReturn>>;
    assert.equal(ret.orderPublicId, c.body.orderId);
    assert.ok(ret.viewToken);
    const claims = results.slice(0, 3).filter((r) => (r as { claimed?: boolean }).claimed).length;
    assert.ok(claims <= 1);
    const claimRows = await sqlq(`select count(*)::int n from s1_events where source = 'fulfil' and type = 'order.paid' and subject = $1`, [c.body.orderId]);
    assert.equal(claimRows[0].n, 1);

    const w2 = await postEvent(event);
    assert.equal(w2.status, 200);
    assert.equal(w2.body.duplicate, true);

    row = await orderRow(c.body.orderId);
    assert.equal(row.status, "paid");
    assert.ok(row.fulfilled_at);
    assert.equal(row.jersey_eligible, true);
    assert.equal(row.pm_details.type, "card");
    assert.ok(row.pm_details.fingerprint);
    assert.equal(row.payment_method_id, confirmed.payment_method);
    assert.equal(await outboxCount(c.body.orderId), 3);
    const ob = await sqlq(`select kind, livemode from s1_outbox where dedupe_key like '%:' || $1 order by kind`, [c.body.orderId]);
    assert.deepEqual(ob.map((r) => r.kind), ["discord_commit", "klaviyo_committed", "meta_purchase"]);
    assert.ok(ob.every((r) => r.livemode === false));
    const codes = await codesFor(row.family_id);
    assert.equal(codes.length, 1);
    assert.match(codes[0].code, /^[1-9]\d{7}$/);
    const evRow = await sqlq(`select processed_at from s1_events where stripe_event_id = $1`, [event.id]);
    assert.equal(evRow.length, 1);
    assert.ok(evRow[0].processed_at);
    const kids = await sqlq(`select k.status from s1_kids k join s1_order_items oi on oi.kid_id = k.id where oi.order_id = $1`, [row.id]);
    assert.deepEqual(kids.map((k) => k.status), ["committed"]);
    const view = await getOrderByViewToken(String(ret.viewToken));
    assert.equal(view?.publicId, c.body.orderId);
    assert.equal(view?.code, codes[0].code);
    assert.equal(await getOrderByViewToken("x".repeat(43)), null);

    // Wrong secret proves nothing; a fulfilled order answers from the DB.
    const bad = await fulfilFromReturn(piId, String(c.body.clientSecret) + "x");
    assert.deepEqual([bad.viewToken, bad.status], [null, "unverified"]);
    const t0 = Date.now();
    const rep = await fulfil(piId, "welcome");
    assert.deepEqual([rep.claimed, rep.status], [false, "paid"]);
    ev(`(a) paid, one code, outbox 3, event processed, replay duplicate; (b) race claim events=1; repeat fulfil ${Date.now() - t0} ms`);
    A = { piId, publicId: c.body.orderId, familyId: row.family_id, customer: String(pi.customer), pm: String(confirmed.payment_method), secret: String(c.body.clientSecret) };
  });

  it("(c) orphan: stored PI id nulled and ref unknown -> webhook 500, processed_at null, ops_alert; replay after ref restored -> backfill, paid; D4 rerun", async () => {
    // Reuses (a)'s succeeded PI: put the order back to pending and hide it.
    await sqlq(`delete from s1_outbox where dedupe_key like '%:' || $1`, [A.publicId]);
    await sqlq(
      `update s1_orders set status = 'pending', paid_at = null, fulfilled_at = null, payment_intent_id = null,
              public_id = public_id || 'zz' where public_id = $1`,
      [A.publicId],
    );
    const pi = await stripe.paymentIntents.retrieve(A.piId);
    const { event } = await eventFor("payment_intent.succeeded", "never-listed", pi);
    ev(`(c) synthetic signed event ${event.id} for ${A.piId}`);
    const w1 = await postEvent(event);
    assert.equal(w1.status, 500);
    const e1 = await sqlq(`select processed_at from s1_events where stripe_event_id = $1`, [event.id]);
    assert.equal(e1.length, 1);
    assert.equal(e1[0].processed_at, null);
    const alert = await sqlq(`select livemode from s1_outbox where dedupe_key = $1`, [`ops_alert:${A.piId}`]);
    assert.equal(alert.length, 1);
    assert.equal(alert[0].livemode, false);
    assert.equal((await sqlq(`select 1 from s1_events where type = 'orphan_paid_pi' and subject = $1`, [A.piId])).length, 1);

    await sqlq(`update s1_orders set public_id = $1 where public_id = $2`, [A.publicId, A.publicId + "zz"]);
    const w2 = await postEvent(event);
    assert.equal(w2.status, 200, JSON.stringify(w2.body));
    let row = await orderRow(A.publicId);
    assert.equal(row.payment_intent_id, A.piId);
    assert.equal(row.status, "paid");
    assert.ok(row.fulfilled_at);
    assert.equal(await outboxCount(A.publicId), 3);
    assert.ok((await sqlq(`select processed_at from s1_events where stripe_event_id = $1`, [event.id]))[0].processed_at);

    // D4: paid with fulfilled_at null and lost outbox rows -> fulfil reruns the steps.
    await sqlq(`delete from s1_outbox where dedupe_key like '%:' || $1`, [A.publicId]);
    await sqlq(`update s1_orders set fulfilled_at = null where public_id = $1`, [A.publicId]);
    const r = await fulfil(A.piId, "welcome");
    assert.deepEqual([r.claimed, r.status], [false, "paid"]);
    row = await orderRow(A.publicId);
    assert.ok(row.fulfilled_at);
    assert.equal(await outboxCount(A.publicId), 3);
    assert.equal((await codesFor(row.family_id)).length, 1);

    // Ops 5: a void family code comes back active on a paid order.
    await sqlq(`update s1_codes set status = 'void' where family_id = $1 and type = 'family'`, [A.familyId]);
    await sqlq(`update s1_orders set status = 'pending', fulfilled_at = null where public_id = $1`, [A.publicId]);
    const r2 = await fulfil(A.piId, "welcome");
    assert.deepEqual([r2.claimed, r2.status], [true, "paid"]);
    const codes = await codesFor(A.familyId);
    assert.deepEqual(codes.map((x) => x.status), ["active"]);
    ev(`(c) orphan -> 500 + ops_alert + processed_at null; replay -> backfilled + paid; D4 rerun restored outbox; void code reactivated`);
  });

  it("(d) decline -> pending, failure_count 1 (replay-safe); same attempt reuses the PI; 3 declines -> canceled + card_testing_suspect", async () => {
    const b = body(email("d"), [{ firstName: "Mia", age: 14 }], 10000);
    const c = await commit(b);
    assert.equal(c.status, 200);
    const piId = piOf(c.body.clientSecret);
    toCancel.push(piId);
    note("payment_intent", piId, `(d) order ${c.body.orderId} (declines, canceled)`);
    const decline = async () => {
      try {
        await stripe.paymentIntents.confirm(piId, { payment_method: "pm_card_chargeDeclined" });
        assert.fail("expected a decline");
      } catch (e) {
        assert.equal((e as { code?: string }).code, "card_declined");
      }
    };
    await decline();
    const after1 = await stripe.paymentIntents.retrieve(piId);
    assert.equal(after1.status, "requires_payment_method");
    const ev1 = await eventFor("payment_intent.payment_failed", piId, after1);
    assert.equal((await postEvent(ev1.event)).status, 200);
    assert.equal((await postEvent(ev1.event)).status, 200);
    let row = await orderRow(c.body.orderId);
    assert.equal(row.status, "pending");
    assert.equal(row.failure_count, 1);
    assert.equal((await fulfil(piId, "welcome")).status, "pending");
    const again = await commit(b);
    assert.equal(again.status, 200);
    assert.equal(again.body.clientSecret, c.body.clientSecret);

    const seen = new Set([ev1.event.id]);
    for (let n = 2; n <= 3; n++) {
      await decline();
      const pi = await stripe.paymentIntents.retrieve(piId);
      const evn = await eventFor("payment_intent.payment_failed", piId, pi, (e) => !seen.has(e.id));
      seen.add(evn.event.id);
      assert.equal((await postEvent(evn.event)).status, 200);
    }
    row = await orderRow(c.body.orderId);
    assert.equal(row.failure_count, 3);
    assert.ok(row.flags.includes("card_testing_suspect"));
    assert.equal((await stripe.paymentIntents.retrieve(piId)).status, "canceled");
    ev(`(d) failure_count 1 after replay; 3 -> PI canceled + flag (order ${c.body.orderId})`);
  });

  it("(e) 3DS card -> requires_action, order pending, return proves ownership", async () => {
    const c = await commit(body(email("e"), [{ firstName: "Ivy", age: 15 }], 10000));
    assert.equal(c.status, 200);
    const piId = piOf(c.body.clientSecret);
    toCancel.push(piId);
    note("payment_intent", piId, `(e) order ${c.body.orderId} (3DS, canceled after)`);
    const pi = await stripe.paymentIntents.confirm(piId, {
      payment_method: "pm_card_authenticationRequired",
      return_url: "https://season1-commit--ekuzo.netlify.app/season1/join/welcome",
    });
    assert.equal(pi.status, "requires_action");
    const r = await fulfil(piId, "welcome");
    assert.deepEqual([r.status, r.claimed], ["pending", false]);
    const ret = await fulfilFromReturn(piId, String(c.body.clientSecret));
    assert.equal(ret.status, "pending");
    assert.ok(ret.viewToken);
    assert.equal((await orderRow(c.body.orderId)).status, "pending");
    ev(`(e) requires_action -> pending (order ${c.body.orderId})`);
  });

  it("(f) off-session: saved visa charges $1.60; 3155 and 3184 cards off-session -> authentication_required", async () => {
    const ok = await stripe.paymentIntents.create({
      amount: 160,
      currency: "usd",
      customer: A.customer,
      payment_method: A.pm,
      payment_method_types: ["card"],
      off_session: true,
      confirm: true,
      description: "EKUZO Season 01 off-session proof (test)",
      metadata: { product: "season1_offsession_test" },
    });
    note("payment_intent", ok.id, "(f) off-session $1.60 on (a) saved visa SUCCEEDED");
    assert.equal(ok.status, "succeeded");
    ev(`(f) off-session visa ${ok.id} succeeded`);

    for (const pm of ["pm_card_authenticationRequiredOnSetup", "pm_card_authenticationRequired"]) {
      const attached = await stripe.paymentMethods.attach(pm, { customer: A.customer });
      note("payment_method", attached.id, `(f) ${pm} attached to ${A.customer}`);
      try {
        const p = await stripe.paymentIntents.create({
          amount: 160,
          currency: "usd",
          customer: A.customer,
          payment_method: attached.id,
          payment_method_types: ["card"],
          off_session: true,
          confirm: true,
          metadata: { product: "season1_offsession_test" },
        });
        note("payment_intent", p.id, `(f) ${pm} off-session status ${p.status}`);
        assert.fail(`expected authentication_required for ${pm}, got ${p.status}`);
      } catch (e) {
        const err = e as { code?: string; raw?: { payment_intent?: { id?: string } } };
        if (err.raw?.payment_intent?.id) note("payment_intent", err.raw.payment_intent.id, `(f) ${pm} off-session failed as expected`);
        assert.equal(err.code, "authentication_required");
        ev(`(f) ${pm} off-session -> authentication_required (expected)`);
      }
    }
  });

  it("(g) pricing without confirming: two kids 18000; price_changed before any PI; returning family 8000 on the same Customer; changed kids cancel the old PI", async () => {
    const e2 = email("g");
    const wrong = await commit(body(e2, [{ firstName: "Ola", age: 10 }, { firstName: "Ben", age: 12 }], 10000));
    assert.equal(wrong.status, 409);
    assert.deepEqual(wrong.body, { error: "price_changed", amountCents: 18000 });
    assert.equal((await sqlq(`select count(*)::int n from s1_orders where payer_email = $1`, [e2]))[0].n, 0);

    const attempt = randomUUID();
    const one = await commit(body(e2, [{ firstName: "Ola", age: 10 }], 10000, attempt));
    assert.equal(one.status, 200);
    const oldPi = piOf(one.body.clientSecret);
    toCancel.push(oldPi);
    note("payment_intent", oldPi, `(g) superseded order ${one.body.orderId} (canceled by commit)`);
    const two = await commit(body(e2, [{ firstName: "Ola", age: 10 }, { firstName: "Ben", age: 12 }], 18000, attempt));
    assert.equal(two.status, 200);
    assert.equal(two.body.amountCents, 18000);
    assert.notEqual(two.body.orderId, one.body.orderId);
    const newPi = piOf(two.body.clientSecret);
    toCancel.push(newPi);
    note("payment_intent", newPi, `(g) two kids order ${two.body.orderId} (canceled unconfirmed)`);
    assert.equal((await stripe.paymentIntents.retrieve(newPi)).amount, 18000);
    assert.equal((await stripe.paymentIntents.retrieve(oldPi)).status, "canceled");
    assert.equal((await orderRow(one.body.orderId)).status, "canceled");
    const items = await sqlq(
      `select role, unit_cents from s1_order_items oi join s1_orders o on o.id = oi.order_id where o.public_id = $1 order by unit_cents desc`,
      [two.body.orderId],
    );
    assert.deepEqual(items.map((i) => [i.role, i.unit_cents]), [["first", 10000], ["sibling", 8000]]);

    const ea = email("a");
    assert.equal(await priorPaidKidCount(ea, false), 1);
    const ret100 = await commit(body(ea, [{ firstName: "Kai", age: 9 }], 10000));
    assert.equal(ret100.status, 409);
    assert.deepEqual(ret100.body, { error: "price_changed", amountCents: 8000 });
    const ret80 = await commit({ ...body(ea, [{ firstName: "Kai", age: 9 }], 8000), parentFirstName: "Squatter" });
    assert.equal(ret80.status, 200);
    const rpi = await stripe.paymentIntents.retrieve(piOf(ret80.body.clientSecret));
    toCancel.push(rpi.id);
    note("payment_intent", rpi.id, `(g) returning family order ${ret80.body.orderId} (canceled unconfirmed)`);
    assert.equal(rpi.amount, 8000);
    assert.equal(rpi.customer, A.customer, "RT6: same Season 01 Customer for the family");
    assert.equal((await sqlq(`select distinct family_id from s1_orders where payer_email = $1`, [ea])).length, 1);
    const gu = await sqlq(`select first_name from s1_guardians where email = $1`, [ea]);
    assert.equal(gu[0].first_name, "Testparent", "RT7: guardian not overwritten");
    assert.equal((await orderRow(ret80.body.orderId)).payer_first_name, "Squatter");
    for (const id of [newPi, rpi.id]) await stripe.paymentIntents.cancel(id);
    ev(`(g) 409 price_changed (no order); 18000 two kids; old PI canceled; returning 8000 on ${A.customer}; all unconfirmed PIs canceled`);
  });

  it("(h) refunds on (a): partial -> partially_refunded; second partial sums to full -> refunded; refund before fulfil claims as refunded with no code or outbox", async () => {
    const r1 = await stripe.refunds.create({ payment_intent: A.piId, amount: 4000 });
    note("refund", r1.id, "(h) partial 4000 of (a)");
    let ch = await stripe.charges.retrieve(String(r1.charge));
    let e1 = await eventFor("charge.refunded", ch.id, ch, (e) => (e.data.object as Stripe.Charge).amount_refunded === 4000);
    assert.equal((await postEvent(e1.event)).status, 200);
    assert.equal((await orderRow(A.publicId)).status, "partially_refunded");

    const r2 = await stripe.refunds.create({ payment_intent: A.piId, amount: 6000 });
    note("refund", r2.id, "(h) partial 6000 of (a), sums to full");
    ch = await stripe.charges.retrieve(String(r2.charge));
    assert.equal(ch.amount_refunded, ch.amount);
    // Ops 4: even the first refund's event reads as full now, because the handler reads the charge fresh.
    e1 = await eventFor("charge.refunded", ch.id, ch, (e) => (e.data.object as Stripe.Charge).amount_refunded === 10000);
    assert.equal((await postEvent(e1.event)).status, 200);
    let row = await orderRow(A.publicId);
    assert.equal(row.status, "refunded");
    const kids = await sqlq(`select k.status from s1_kids k join s1_order_items oi on oi.kid_id = k.id where oi.order_id = $1`, [row.id]);
    assert.ok(kids.length > 0 && kids.every((k) => k.status === "refunded"));
    assert.equal(await priorPaidKidCount(email("a"), false), 0);

    // RT13: simulate a refund that landed before fulfil (the PI is fully refunded now).
    await sqlq(`delete from s1_outbox where dedupe_key like '%:' || $1`, [A.publicId]);
    await sqlq(`delete from s1_codes where family_id = $1 and type = 'family'`, [A.familyId]);
    await sqlq(`update s1_orders set status = 'pending', paid_at = null, fulfilled_at = null where public_id = $1`, [A.publicId]);
    await sqlq(`update s1_kids set status = 'pending' where id in (select kid_id from s1_order_items where order_id = $1)`, [row.id]);
    const fr = await fulfil(A.piId, "webhook");
    assert.deepEqual([fr.status, fr.claimed], ["refunded", true]);
    row = await orderRow(A.publicId);
    assert.equal(row.status, "refunded");
    assert.ok(row.fulfilled_at);
    assert.equal(await outboxCount(A.publicId), 0);
    assert.equal((await codesFor(A.familyId)).length, 0);
    ev(`(h) 4000 -> partially_refunded; +6000 -> refunded (kids refunded, prior paid 0); refund-before-fulfil -> refunded, no code, no outbox`);
  });

  it("(i) guards: bad signature 400, other mode skipped, non-season1 skipped and nothing written, missing secret 500; commit off/honeypot/age; per-IP limit", async () => {
    const fake = { id: `evt_local_${tag}_x`, object: "event", livemode: false, type: "payment_intent.succeeded", data: { object: { id: "pi_x", object: "payment_intent", metadata: { product: "camps", parent_email: "p@x.com" } } } };
    assert.equal((await postEvent(fake, "whsec_wrong")).status, 400);
    const skipped = await postEvent(fake);
    assert.deepEqual([skipped.status, skipped.body.skipped], [200, "not_season1"]);
    const live = await postEvent({ ...fake, id: `evt_local_${tag}_live`, livemode: true });
    assert.equal(live.body.skipped, "mode_mismatch");
    assert.equal((await sqlq(`select 1 from s1_events where stripe_event_id in ($1, $2)`, [fake.id, `evt_local_${tag}_live`])).length, 0);
    const saved = process.env.S1_STRIPE_WEBHOOK_SECRET;
    delete process.env.S1_STRIPE_WEBHOOK_SECRET;
    try {
      assert.equal((await postEvent(fake)).status, 500);
    } finally {
      process.env.S1_STRIPE_WEBHOOK_SECRET = saved;
    }
    process.env.S1_COMMIT_MODE = "off";
    try {
      const off = await commit(body(email("i"), [{ firstName: "Ned", age: 10 }], 10000));
      assert.deepEqual([off.status, off.body], [409, { error: "closed" }]);
    } finally {
      delete process.env.S1_COMMIT_MODE;
    }
    // L1 at the route: cross-site and non-JSON posts never reach validation or the DB.
    const xs = await commitPOST(
      new Request("http://localhost:3103/api/season1/commit", {
        method: "POST",
        headers: { host: "localhost:3103", "content-type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify(body(email("i"), [{ firstName: "Ned", age: 10 }], 10000)),
      }),
    );
    assert.equal(xs.status, 403);
    const tp = await commitPOST(
      new Request("http://localhost:3103/api/season1/commit", {
        method: "POST",
        headers: { host: "localhost:3103", "content-type": "text/plain", "sec-fetch-site": "same-origin" },
        body: JSON.stringify(body(email("i"), [{ firstName: "Ned", age: 10 }], 10000)),
      }),
    );
    assert.equal(tp.status, 415);
    const hp = await commit({ ...body(email("i"), [{ firstName: "Ned", age: 10 }], 10000), company: "Acme" });
    assert.deepEqual([hp.status, hp.body], [422, { error: "invalid" }]);
    const age = await commit(body(email("i"), [{ firstName: "Ned", age: 8 }], 10000));
    assert.deepEqual([age.status, age.body.error], [422, "age_outside"]);
    assert.equal((await sqlq(`select count(*)::int n from s1_orders where payer_email = $1`, [email("i")]))[0].n, 0);
    const oneIp = `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const statuses: number[] = [];
    for (let n = 0; n < 6; n++) {
      const r = await commit(body(email(`rl${n}`), [{ firstName: "Rae", age: 10 }], 10000), { ip: oneIp });
      statuses.push(r.status);
      if (r.status === 200) {
        const id = piOf(r.body.clientSecret);
        toCancel.push(id);
        note("payment_intent", id, `(i) rate-limit run ${r.body.orderId} (canceled unconfirmed)`);
      }
    }
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
    // D5: 422s from one IP do not count; the next valid call from a fresh IP is unaffected by them.
    const ip422 = `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    for (let n = 0; n < 7; n++) {
      const r = await commit(body(email(`v${n}`), [{ firstName: "Rae", age: 8 }], 10000), { ip: ip422 });
      assert.equal(r.status, 422);
    }
    const rl = await sqlq(`select count from s1_rate_limits where key = $1`, [`s1pi:ip:${ip422}`]);
    assert.equal(rl.length, 0, "D5: no per-IP row for 422s");
    const afterBad = await commit(body(email("v-ok"), [{ firstName: "Rae", age: 10 }], 10000), { ip: ip422 });
    assert.equal(afterBad.status, 200);
    assert.equal("inviteReason" in afterBad.body, false, "M2");
    assert.equal(afterBad.body.invite, "none");
    toCancel.push(piOf(afterBad.body.clientSecret));
    note("payment_intent", piOf(afterBad.body.clientSecret), `(i) D5 run ${afterBad.body.orderId} (canceled unconfirmed)`);
    ev(`(i) guards pass; per-IP statuses ${statuses.join(",")}`);
  });
});
