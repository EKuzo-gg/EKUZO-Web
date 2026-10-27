import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import Stripe from "stripe";
import { POST as commitPOST } from "../../../app/api/season1/commit/route";
import { POST as webhookPOST } from "../../../app/api/season1/stripe-webhook/route";
import { fulfilWithPi } from "../fulfil";
import {
  getSql,
  insertKids,
  insertPendingOrder,
  setOrderPaymentIntent,
  upsertFamilyGuardian,
} from "../db";
import { OFFER } from "../offer";

/**
 * Phase 5 gap closure (Relay G): AUD-A age_edge at commit, AUD-2 dispute
 * flags, RT15 duplicate_kid, RT16 pi_mismatch. Neon test branch plus Stripe
 * test mode. No payment is confirmed: commit PIs are canceled; the dispute
 * test reuses an existing PAID test order and cleans up what it writes.
 * Run: S1_DB_TESTS=1 node --env-file=.env.local ... (npm run test:s1).
 * Set S1_BASE_URL=http://localhost:3103 to send the dispute events over HTTP.
 */
const enabled = process.env.S1_DB_TESTS === "1";
const tag = randomBytes(4).toString("hex");
const email = (s: string) => `team+s1test-g${tag}${s}@ekuzo.gg`;
const ip = () => `198.51.100.${1 + Math.floor(Math.random() * 250)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
const sqlq = async (text: string, params: unknown[] = []) => (await getSql().query(text, params)) as Row[];

let stripe: Stripe;
let secret: string;

async function commit(body: Record<string, unknown>) {
  const res = await commitPOST(
    new Request("http://localhost:3103/api/season1/commit", {
      method: "POST",
      headers: {
        host: "localhost:3103",
        "content-type": "application/json",
        "user-agent": "relay-g-test",
        "x-nf-client-connection-ip": ip(),
      },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}

async function postEvent(event: unknown) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  const base = process.env.S1_BASE_URL;
  const req = (url: string) =>
    new Request(url, { method: "POST", headers: { "stripe-signature": header, "content-type": "application/json" }, body: payload });
  const res = base
    ? await fetch(`${base}/api/season1/stripe-webhook`, { method: "POST", headers: { "stripe-signature": header, "content-type": "application/json" }, body: payload })
    : await webhookPOST(req("http://localhost:3103/api/season1/stripe-webhook"));
  return { status: res.status, body: (await res.json()) as Row };
}

/** A synthetic pending order with a fake PI id attached (no Stripe call). */
async function syntheticOrder(opts: { kids: { firstName: string; age: number }[]; amountCents: number; suffix: string; familyEmail?: string }) {
  const fam = await upsertFamilyGuardian({ email: opts.familyEmail ?? email(opts.suffix), firstName: "Testparent", livemode: false });
  const kidIds = await insertKids(fam.familyId, opts.kids, new Date());
  const o = await insertPendingOrder({
    familyId: fam.familyId,
    payerEmail: opts.familyEmail ?? email(opts.suffix),
    offerId: OFFER.id,
    offerVersion: OFFER.version,
    amountCents: opts.amountCents,
    consentVersion: OFFER.termsVersion,
    consentAt: new Date(),
    livemode: false,
    attemptId: randomUUID(),
    items: kidIds.map((id, i) => ({ kidId: id, role: i === 0 ? "first" : "sibling", unitCents: opts.amountCents / kidIds.length })),
  });
  const piId = `pi_fake_${randomBytes(8).toString("hex")}`;
  await setOrderPaymentIntent(o.orderId, piId, new Date(), true);
  return { ...fam, ...o, piId };
}

function fakePi(o: { piId: string; publicId: string }, over: Record<string, unknown> = {}): Stripe.PaymentIntent {
  return {
    id: o.piId,
    object: "payment_intent",
    status: "succeeded",
    amount: 10000,
    currency: "usd",
    livemode: false,
    created: Math.floor(Date.now() / 1000),
    metadata: { product: "season1", order_id: o.publicId, offer_version: OFFER.version, livemode: "false" },
    payment_method: null,
    latest_charge: null,
    client_secret: null,
    ...over,
  } as unknown as Stripe.PaymentIntent;
}

const orderRow = async (publicId: string) => (await sqlq(`select * from s1_orders where public_id = $1`, [publicId]))[0];
const dropOutbox = (publicId: string) => sqlq(`delete from s1_outbox where dedupe_key like '%:' || $1`, [publicId]);

describe("season1 gap closure (integration)", { skip: enabled ? false : "set S1_DB_TESTS=1 to run" }, () => {
  const toCancel: string[] = [];
  before(() => {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    assert.ok(key.startsWith("sk_test_"), "STRIPE_SECRET_KEY must be a test key");
    assert.ok((process.env.DATABASE_URL ?? "").includes("ep-lively-boat-b4fak1h6"), "test DB only");
    assert.ok(process.env.S1_STRIPE_WEBHOOK_SECRET, "S1_STRIPE_WEBHOOK_SECRET must be set");
    secret = process.env.S1_STRIPE_WEBHOOK_SECRET!;
    stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  });
  after(async () => {
    for (const id of toCancel) {
      try {
        await stripe.paymentIntents.cancel(id);
      } catch {
        // already final
      }
    }
  });

  it("AUD-A: a kid aged 9 or 18 flags the pending order age_edge at commit; mid ages do not; fulfil keeps the flag", async () => {
    const cases: [string, { firstName: string; age: number }[], number, boolean][] = [
      ["x9", [{ firstName: "Nine", age: 9 }], 10000, true],
      ["x18", [{ firstName: "Eighteen", age: 18 }], 10000, true],
      ["x2", [{ firstName: "Mid", age: 12 }, { firstName: "Edge", age: 9 }], 20000, true],
      ["x12", [{ firstName: "Twelve", age: 12 }], 10000, false],
    ];
    let keptCheck: string | null = null;
    for (const [s, kids, expectedCents, edge] of cases) {
      const e = email(s);
      const c = await commit({ email: e, parentFirstName: "Testparent", phone: "", kids, consent: true, company: "", attemptId: randomUUID(), expectedCents });
      if (c.status === 409 && c.body.error === "price_changed") {
        // Pricing is the server's call; retry once with its amount.
        const c2 = await commit({ email: e, parentFirstName: "Testparent", phone: "", kids, consent: true, company: "", attemptId: randomUUID(), expectedCents: c.body.amountCents });
        Object.assign(c, c2);
      }
      assert.equal(c.status, 200, JSON.stringify(c.body));
      toCancel.push(String(c.body.clientSecret).split("_secret_")[0]);
      const row = await orderRow(c.body.orderId);
      assert.equal(row.status, "pending");
      assert.equal(row.flags.includes("age_edge"), edge, `${s}: flags ${JSON.stringify(row.flags)}`);
      if (edge && !keptCheck) keptCheck = c.body.orderId;
    }
    // Fulfil keeps it: run the paid steps on a synthetic order that already carries the flag.
    const o = await syntheticOrder({ kids: [{ firstName: "Edgekid", age: 9 }], amountCents: 10000, suffix: "keep" });
    await sqlq(`update s1_orders set flags = array_append(flags, 'age_edge') where id = $1`, [o.orderId]);
    const r = await fulfilWithPi(fakePi(o), "webhook");
    assert.equal(r.status, "paid");
    assert.ok((await orderRow(o.publicId)).flags.includes("age_edge"), "fulfil keeps age_edge");
    await dropOutbox(o.publicId);
  });

  it("RT15: fulfil flags duplicate_kid for a same-name kid paid within 30 days; not for a different name or an older order", async () => {
    const e = email("dup");
    const a = await syntheticOrder({ kids: [{ firstName: "Zoë", age: 11 }], amountCents: 10000, suffix: "dup", familyEmail: e });
    assert.equal((await fulfilWithPi(fakePi(a), "webhook")).status, "paid");
    assert.deepEqual((await orderRow(a.publicId)).flags, [], "first order is clean");

    // Second order, same family, folded-equal name (Zoe vs Zoë).
    const b = await syntheticOrder({ kids: [{ firstName: "Zoe", age: 11 }], amountCents: 10000, suffix: "dup", familyEmail: e });
    const rb = await fulfilWithPi(fakePi(b), "webhook");
    assert.equal(rb.status, "paid");
    assert.ok((await orderRow(b.publicId)).flags.includes("duplicate_kid"));

    // Different name: no flag.
    const c = await syntheticOrder({ kids: [{ firstName: "Mira", age: 11 }], amountCents: 10000, suffix: "dup", familyEmail: e });
    await fulfilWithPi(fakePi(c), "webhook");
    assert.ok(!(await orderRow(c.publicId)).flags.includes("duplicate_kid"));

    // Same name but the earlier order was paid 31 days ago: no flag.
    const old = await syntheticOrder({ kids: [{ firstName: "Old", age: 11 }], amountCents: 10000, suffix: "dup2" });
    await fulfilWithPi(fakePi(old), "webhook");
    await sqlq(`update s1_orders set paid_at = now() - interval '31 days' where id = $1`, [old.orderId]);
    const again = await syntheticOrder({ kids: [{ firstName: "Old", age: 11 }], amountCents: 10000, suffix: "dup2", familyEmail: email("dup2") });
    await fulfilWithPi(fakePi(again), "webhook");
    assert.ok(!(await orderRow(again.publicId)).flags.includes("duplicate_kid"), "outside 30 days");

    for (const o of [a, b, c, old, again]) await dropOutbox(o.publicId);
  });

  it("RT16: amount, currency, metadata.order_id or livemode disagreement claims nothing and flags pi_mismatch", async () => {
    const variants: [string, (o: { publicId: string }) => Record<string, unknown>][] = [
      ["amount", () => ({ amount: 9999 })],
      ["currency", () => ({ currency: "eur" })],
      ["order_id", () => ({ metadata: { product: "season1", order_id: "zzzzzzzzzz", offer_version: OFFER.version, livemode: "false" } })],
    ];
    for (const [name, over] of variants) {
      const o = await syntheticOrder({ kids: [{ firstName: `Mm${name}`, age: 11 }], amountCents: 10000, suffix: `mm${name}` });
      const r = await fulfilWithPi(fakePi(o, over(o)), "webhook");
      assert.equal(r.status, "mismatch", name);
      assert.equal(r.claimed, false, name);
      const row = await orderRow(o.publicId);
      assert.equal(row.status, "pending", `${name}: nothing claimed`);
      assert.equal(row.paid_at, null);
      assert.equal(row.fulfilled_at, null);
      assert.ok(row.flags.includes("pi_mismatch"), name);
      const ev = await sqlq(`select 1 from s1_events where type = 'pi_mismatch' and subject = $1`, [o.publicId]);
      assert.equal(ev.length, 1, name);
      assert.equal((await sqlq(`select 1 from s1_outbox where dedupe_key like '%:' || $1`, [o.publicId])).length, 0, `${name}: no outbox`);
      const kids = await sqlq(`select k.status from s1_kids k join s1_order_items i on i.kid_id = k.id where i.order_id = $1`, [o.orderId]);
      assert.ok(kids.every((k) => k.status !== "committed"), `${name}: kids not committed`);
    }

    // livemode: a live-mode order paired with a test-mode PI (keyIsLive is false under a test key).
    const live = await syntheticOrder({ kids: [{ firstName: "Mmlive", age: 11 }], amountCents: 10000, suffix: "mmlive" });
    await sqlq(`update s1_orders set livemode = true where id = $1`, [live.orderId]);
    const rl = await fulfilWithPi(fakePi(live), "webhook");
    assert.equal(rl.status, "mismatch");
    const lrow = await orderRow(live.publicId);
    assert.equal(lrow.status, "pending");
    assert.ok(lrow.flags.includes("pi_mismatch"));
    await sqlq(`delete from s1_events where subject = $1 and type = 'pi_mismatch'`, [live.publicId]);

    // Control: all four agree -> claims and fulfils.
    const ok = await syntheticOrder({ kids: [{ firstName: "Mmok", age: 11 }], amountCents: 10000, suffix: "mmok" });
    const rk = await fulfilWithPi(fakePi(ok), "webhook");
    assert.equal(rk.status, "paid");
    assert.equal(rk.claimed, true);
    await dropOutbox(ok.publicId);
  });

  it("AUD-2 / M7: charge.dispute.created flags the order and the family and queues one ops_alert; replay is a no-op", async () => {
    const paid = (
      await sqlq(
        `select o.id, o.public_id, o.payment_intent_id, o.amount_cents, o.family_id, o.flags, f.flags as fflags
           from s1_orders o join s1_families f on f.id = o.family_id
          where o.status = 'paid' and o.livemode = false and o.payment_intent_id like 'pi_%' and o.payment_intent_id not like 'pi_fake_%'
          order by o.paid_at desc limit 20`,
      )
    );
    let picked: (typeof paid)[number] | null = null;
    let chargeId: string | null = null;
    for (const r of paid) {
      try {
        const pi = await stripe.paymentIntents.retrieve(r.payment_intent_id);
        if (pi.metadata?.product === "season1" && typeof pi.latest_charge === "string") {
          picked = r;
          chargeId = pi.latest_charge;
          break;
        }
      } catch {
        // PI not in this Stripe account
      }
    }
    assert.ok(picked && chargeId, "need an existing paid season1 test order with a real charge on Neon test");
    const hadOrder = (picked.flags as string[]).includes("dispute");
    const hadFamily = (picked.fflags as string[]).includes("dispute");

    const rnd = randomBytes(6).toString("hex");
    const evt = {
      id: `evt_test_dispute_${rnd}`,
      object: "event",
      api_version: "2026-02-25.clover",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
      type: "charge.dispute.created",
      data: {
        object: {
          id: `dp_test_${rnd}`,
          object: "dispute",
          charge: chargeId,
          payment_intent: picked.payment_intent_id,
          amount: picked.amount_cents,
          reason: "fraudulent",
          status: "needs_response",
        },
      },
    };
    try {
      const r1 = await postEvent(evt);
      assert.equal(r1.status, 200, JSON.stringify(r1.body));
      assert.equal(r1.body.duplicate, undefined);
      const o = await orderRow(picked.public_id);
      assert.ok(o.flags.includes("dispute"), "order flagged");
      const f = (await sqlq(`select flags from s1_families where id = $1`, [picked.family_id]))[0];
      assert.ok(f.flags.includes("dispute"), "family flagged");
      const ob = await sqlq(`select kind, payload, status from s1_outbox where dedupe_key = $1`, [`ops_alert:charge.dispute.created:${evt.id}`]);
      assert.equal(ob.length, 1);
      assert.equal(ob[0].kind, "ops_alert");
      assert.equal(ob[0].payload.alert, "dispute");
      assert.equal(ob[0].payload.order_public_id, picked.public_id);
      assert.equal((await sqlq(`select 1 from s1_events where stripe_event_id = $1`, [evt.id])).length, 1);

      const r2 = await postEvent(evt);
      assert.equal(r2.status, 200);
      assert.equal(r2.body.duplicate, true, "replay is a no-op");
      assert.equal((await sqlq(`select 1 from s1_outbox where dedupe_key = $1`, [`ops_alert:charge.dispute.created:${evt.id}`])).length, 1);
      assert.equal((await sqlq(`select 1 from s1_events where stripe_event_id = $1`, [evt.id])).length, 1);
      console.log(`# evidence AUD-2 order ${picked.public_id} pi ${picked.payment_intent_id} charge ${chargeId} event ${evt.id} via ${process.env.S1_BASE_URL ?? "handler"}`);
    } finally {
      // Leave the shared test order as found.
      if (!hadOrder) await sqlq(`update s1_orders set flags = array_remove(flags, 'dispute') where id = $1`, [picked.id]);
      if (!hadFamily) await sqlq(`update s1_families set flags = array_remove(flags, 'dispute') where id = $1`, [picked.family_id]);
      await sqlq(`delete from s1_outbox where dedupe_key = $1`, [`ops_alert:charge.dispute.created:${evt.id}`]);
      await sqlq(`delete from s1_events where stripe_event_id = $1`, [evt.id]);
    }
  });
});
