import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import Stripe from "stripe";
import { POST as commitPOST } from "../../../app/api/season1/commit/route";
import { POST as webhookPOST } from "../../../app/api/season1/stripe-webhook/route";
import { fulfil, recordReferral } from "../fulfil";
import { getSql, getOrderByPublicId } from "../db";
import { refSecret, signRef } from "../refcookie";

/**
 * Slice 2 wiring (Relay C): commit reads the signed s1_ref cookie, fulfil writes
 * referrals and flags, full refunds void the referral and the last-order code.
 * Neon test + REAL Stripe test mode. At most ONE succeeded PaymentIntent per run
 * (the friend's 1-kid order); every other PI is canceled unconfirmed. The inviter
 * is an existing paid test family (team+s1test-%) with an active code.
 * Run: S1_DB_TESTS=1 TZ=UTC node --env-file=.env.local ... (see evidence file).
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

const email = (s: string) => `team+s1test-${tag}${s}@ekuzo.gg`;
const ip = () => `198.51.100.${1 + Math.floor(Math.random() * 250)}`;
const piOf = (secretStr: unknown) => String(secretStr).split("_secret_")[0];

async function commit(b: Record<string, unknown>, cookie: string | null) {
  const headers: Record<string, string> = {
    host: "localhost:3103",
    "content-type": "application/json",
    "user-agent": "relay-c-test",
    "x-nf-client-connection-ip": ip(),
  };
  if (cookie) headers.cookie = cookie;
  const res = await commitPOST(
    new Request("http://localhost:3103/api/season1/commit", { method: "POST", headers, body: JSON.stringify(b) }),
  );
  return { status: res.status, body: (await res.json()) as Row };
}

function body(e: string, kids: { firstName: string; age: number }[], expectedCents: number, attemptId = randomUUID()) {
  return { email: e, parentFirstName: "Testparent", phone: "", kids, consent: true, company: "", attemptId, expectedCents };
}

describe("season1 invite wiring (integration, Stripe test mode)", { skip: enabled ? false : "set S1_DB_TESTS=1 to run" }, () => {
  let stripe: Stripe;
  let whsec: string;
  let inviter: { code: string; familyId: string; email: string; fingerprints: string[]; zip: string | null };
  let refCookie: string;
  const toCancel: string[] = [];
  const friendEmail = email("f");
  let friend: { piId: string; publicId: string; orderId: string; familyId: string };

  before(async () => {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    assert.ok(key.startsWith("sk_test_"), "STRIPE_SECRET_KEY must be a test key");
    assert.ok((process.env.DATABASE_URL ?? "").includes("ep-lively-boat-b4fak1h6"), "test DB only");
    assert.ok(process.env.S1_STRIPE_WEBHOOK_SECRET, "S1_STRIPE_WEBHOOK_SECRET must be set");
    whsec = process.env.S1_STRIPE_WEBHOOK_SECRET!;
    stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
    // Reuse a paid test family with an active code and a committed kid (no new succeeded PI).
    const rows = await sqlq(
      `select c.code, c.family_id, g.email, f.billing_zip
         from s1_codes c join s1_families f on f.id = c.family_id
         join s1_guardians g on g.family_id = f.id
        where c.type = 'family' and c.status = 'active' and c.livemode = false
          and g.email like 'team+s1test-%@ekuzo.gg'
          and exists (select 1 from s1_orders o where o.family_id = f.id and o.status = 'paid')
          and exists (select 1 from s1_kids k where k.family_id = f.id and k.status = 'committed')
        order by (f.billing_zip is not null) desc, c.created_at desc limit 1`,
    );
    assert.ok(rows[0], "needs a paid test family with an active code");
    const fps = await sqlq(
      `select distinct pm_details->>'fingerprint' fp from s1_orders
        where family_id = $1 and status in ('paid','partially_refunded') and pm_details->>'fingerprint' is not null`,
      [rows[0].family_id],
    );
    inviter = {
      code: rows[0].code,
      familyId: rows[0].family_id,
      email: rows[0].email,
      fingerprints: fps.map((r) => r.fp),
      zip: rows[0].billing_zip,
    };
    refCookie = `s1_ref=${signRef(inviter.code, refSecret())}`;
    ev(`inviter family ${inviter.familyId} (reused; fingerprints ${inviter.fingerprints.length}, zip ${inviter.zip ? "set" : "null"})`);
  });

  after(async () => {
    for (const id of toCancel) {
      try {
        const p = await stripe.paymentIntents.retrieve(id);
        if (!["succeeded", "canceled", "processing"].includes(p.status)) await stripe.paymentIntents.cancel(id);
      } catch {
        // already final
      }
    }
    console.log(`# tag ${tag}`);
    for (const l of ledger) console.log(l);
    for (const l of evidence) console.log(l);
  });

  it("(1) friend with a signed cookie pays 1 kid -> invite applied, referral pending friend_kids 1, friend_joined outbox, flags, inviteApplied", async () => {
    const c = await commit(body(friendEmail, [{ firstName: "Mira", age: 11 }], 10000), refCookie);
    assert.equal(c.status, 200, JSON.stringify(c.body));
    assert.deepEqual([c.body.invite, c.body.inviteReason], ["applied", "ok"]);
    const piId = piOf(c.body.clientSecret);
    const order = (await sqlq(`select * from s1_orders where public_id = $1`, [c.body.orderId]))[0];
    assert.equal(order.referral_code, inviter.code);

    const confirmed = await stripe.paymentIntents.confirm(piId, { payment_method: "pm_card_visa" });
    assert.equal(confirmed.status, "succeeded");
    note("payment_intent", piId, `(1) friend order ${c.body.orderId} SUCCEEDED`);
    const r = await fulfil(piId, "webhook");
    assert.equal(r.status, "paid");
    friend = { piId, publicId: c.body.orderId, orderId: order.id, familyId: order.family_id };

    let ref = (await sqlq(`select * from s1_referrals where referred_order_id = $1`, [order.id]))[0];
    if (!ref) {
      // The branch deploy's webhook (pre-slice-2 code) can win the fulfil race and set
      // fulfilled_at without a referral step. Run the step directly and say so.
      ev(`(1) deployed webhook won the fulfil race; recordReferral run directly`);
      const pm = await stripe.paymentMethods.retrieve(String(confirmed.payment_method));
      await recordReferral(
        { id: order.id, publicId: order.public_id, familyId: order.family_id, livemode: false, referralCode: order.referral_code },
        { fingerprint: pm.card?.fingerprint ?? null, zip: pm.billing_details?.address?.postal_code ?? null },
      );
      ref = (await sqlq(`select * from s1_referrals where referred_order_id = $1`, [order.id]))[0];
    }
    assert.ok(ref, "referral row");
    assert.deepEqual([ref.code, ref.inviter_family_id, ref.friend_kids, ref.status, ref.livemode], [inviter.code, inviter.familyId, 1, "pending", false]);

    const ob = await sqlq(`select kind, dedupe_key, payload from s1_outbox where dedupe_key like '%:' || $1 || '%'`, [ref.id]);
    const joined = ob.find((o) => o.dedupe_key === `klaviyo_friend_joined:${ref.id}`);
    assert.ok(joined, "friend_joined outbox");
    assert.equal(joined.payload.invited, true);
    assert.equal(joined.payload.invited_by_kid, undefined, "T12: no inviter kid name in the payload");

    const fp = (await sqlq(`select pm_details->>'fingerprint' fp from s1_orders where id = $1`, [order.id]))[0].fp;
    const expectShared = !!fp && inviter.fingerprints.includes(fp);
    assert.equal(ref.reasons.includes("shared_card"), expectShared);
    for (const f of ref.reasons as string[]) {
      assert.ok(ob.find((o) => o.dedupe_key === `discord_flag:${ref.id}:${f}`), `discord_flag outbox for ${f}`);
    }
    assert.equal((await sqlq(`select count(*)::int n from s1_events where source = 'fulfil' and type = 'referral.created' and subject = $1`, [ref.id]))[0].n, 1);

    // Rerun is idempotent: same referral, same outbox count.
    await recordReferral(
      { id: order.id, publicId: order.public_id, familyId: order.family_id, livemode: false, referralCode: order.referral_code },
      { fingerprint: fp, zip: null },
    );
    assert.equal((await sqlq(`select count(*)::int n from s1_referrals where referred_order_id = $1`, [order.id]))[0].n, 1);
    assert.equal((await sqlq(`select count(*)::int n from s1_outbox where dedupe_key like '%:' || $1 || '%'`, [ref.id]))[0].n, ob.length);

    const view = await getOrderByPublicId(c.body.orderId);
    assert.equal(view?.inviteApplied, true);
    assert.ok(view?.code && view.code !== inviter.code, "friend family gets its own code");
    ev(`(1) PI ${piId} order ${c.body.orderId}: referral ${ref.id} pending friend_kids 1, reasons [${ref.reasons.join(",")}], outbox ${ob.length} rows, inviteApplied true`);
  });

  it("(2) inviteRemoved wins over the cookie; a reused attempt re-evaluates the invite and updates referral_code", async () => {
    const e = email("r");
    const b = body(e, [{ firstName: "Remy", age: 12 }], 10000);
    const first = await commit(b, refCookie);
    assert.equal(first.status, 200, JSON.stringify(first.body));
    assert.equal(first.body.invite, "applied");
    const piId = piOf(first.body.clientSecret);
    toCancel.push(piId);
    note("payment_intent", piId, `(2) order ${first.body.orderId} (canceled unconfirmed)`);
    assert.equal((await sqlq(`select referral_code from s1_orders where public_id = $1`, [first.body.orderId]))[0].referral_code, inviter.code);

    const removed = await commit({ ...b, inviteRemoved: true }, refCookie);
    assert.equal(removed.status, 200);
    assert.equal(removed.body.clientSecret, first.body.clientSecret, "same attempt reuses the PI");
    assert.deepEqual([removed.body.invite, removed.body.inviteReason], ["none", "removed"]);
    assert.equal((await sqlq(`select referral_code from s1_orders where public_id = $1`, [first.body.orderId]))[0].referral_code, null);

    // Fresh attempt, removed from the start: order created with a null code.
    const fresh = await commit({ ...body(email("r2"), [{ firstName: "Remy", age: 12 }], 10000), inviteRemoved: true }, refCookie);
    assert.equal(fresh.status, 200);
    assert.equal(fresh.body.invite, "none");
    toCancel.push(piOf(fresh.body.clientSecret));
    note("payment_intent", piOf(fresh.body.clientSecret), `(2) order ${fresh.body.orderId} (canceled unconfirmed)`);
    assert.equal((await sqlq(`select referral_code from s1_orders where public_id = $1`, [fresh.body.orderId]))[0].referral_code, null);
    await stripe.paymentIntents.cancel(piId);
    await stripe.paymentIntents.cancel(piOf(fresh.body.clientSecret));
    ev(`(2) inviteRemoved -> invite none, referral_code null (reused attempt updated from code to null); PIs canceled`);
  });

  it("(3) tampered or unsigned cookie -> invite none", async () => {
    const bad = `s1_ref=${inviter.code}.AAAA`;
    const c = await commit(body(email("t"), [{ firstName: "Tess", age: 10 }], 10000), bad);
    assert.equal(c.status, 200);
    assert.deepEqual([c.body.invite, c.body.inviteReason], ["none", "no_invite"]);
    const piId = piOf(c.body.clientSecret);
    note("payment_intent", piId, `(3) order ${c.body.orderId} (canceled unconfirmed)`);
    await stripe.paymentIntents.cancel(piId);
    const u = await commit(body(email("u"), [{ firstName: "Tess", age: 10 }], 10000), `s1_ref=${inviter.code}`);
    assert.equal(u.body.invite, "none");
    note("payment_intent", piOf(u.body.clientSecret), `(3) order ${u.body.orderId} (canceled unconfirmed)`);
    await stripe.paymentIntents.cancel(piOf(u.body.clientSecret));
  });

  it("(4) own code (inviter's email) -> ignored own_family, no referral code, event recorded", async () => {
    const c = await commit(body(inviter.email, [{ firstName: `Sib${tag.replace(/\d/g, "x")}`, age: 10 }], 8000), refCookie);
    assert.equal(c.status, 200, JSON.stringify(c.body));
    assert.deepEqual([c.body.invite, c.body.inviteReason], ["ignored", "own_family"]);
    assert.equal(c.body.amountCents, 8000, "sibling price across orders");
    const piId = piOf(c.body.clientSecret);
    note("payment_intent", piId, `(4) order ${c.body.orderId} (canceled unconfirmed)`);
    await stripe.paymentIntents.cancel(piId);
    assert.equal((await sqlq(`select referral_code from s1_orders where public_id = $1`, [c.body.orderId]))[0].referral_code, null);
    const evr = await sqlq(`select data from s1_events where source = 'commit' and type = 'invite.ignored' and subject = $1`, [c.body.orderId]);
    assert.equal(evr[0]?.data?.reason, "own_family");
  });

  it("(5) already-paid email (the friend, after paying) -> ignored already_paid", async () => {
    assert.ok(friend, "needs (1)");
    const c = await commit(body(friendEmail, [{ firstName: "Nico", age: 13 }], 8000), refCookie);
    assert.equal(c.status, 200, JSON.stringify(c.body));
    assert.deepEqual([c.body.invite, c.body.inviteReason], ["ignored", "already_paid"]);
    const piId = piOf(c.body.clientSecret);
    note("payment_intent", piId, `(5) order ${c.body.orderId} (canceled unconfirmed)`);
    await stripe.paymentIntents.cancel(piId);
    assert.equal((await sqlq(`select referral_code from s1_orders where public_id = $1`, [c.body.orderId]))[0].referral_code, null);
  });

  it("(6) duplicate kid -> 409 duplicate_kid with no order or PI; the 4th hit in a day -> text_karlin and a flag", async () => {
    assert.ok(friend, "needs (1)");
    const before = (await sqlq(`select count(*)::int n from s1_orders where payer_email = $1`, [friendEmail]))[0].n;
    const statuses: string[] = [];
    for (let i = 0; i < 4; i++) {
      // Folded match: "míra" equals "Mira".
      const c = await commit(body(friendEmail, [{ firstName: i === 0 ? "Mira" : "Míra", age: 11 }], 8000), refCookie);
      assert.equal(c.status, 409);
      statuses.push(c.body.error);
      if (c.body.error === "duplicate_kid") assert.ok(c.body.kidFirstName);
    }
    assert.deepEqual(statuses, ["duplicate_kid", "duplicate_kid", "duplicate_kid", "text_karlin"]);
    const after = (await sqlq(`select count(*)::int n from s1_orders where payer_email = $1`, [friendEmail]))[0].n;
    assert.equal(after, before, "no order created");
    const fam = (await sqlq(`select flags from s1_families where id = $1`, [friend.familyId]))[0];
    assert.ok(fam.flags.includes("duplicate_kid_repeat"));
    ev(`(6) duplicate kid statuses ${statuses.join(",")}; no order; family flag duplicate_kid_repeat`);
  });

  it("(7) 2-kid friend at the fulfil level (synthetic claimed order): friend_kids 2, shared_card and same_zip flags, idempotent", async () => {
    const sql = getSql();
    const fid = randomUUID(), oid = randomUUID(), k1 = randomUUID(), k2 = randomUUID();
    const pub = `t${randomBytes(5).toString("hex")}`;
    await sql.query(`insert into s1_families (id, public_id, livemode) values ($1,$2,false)`, [fid, `t${randomBytes(5).toString("hex")}`]);
    await sql.query(`insert into s1_guardians (id, family_id, email, livemode) values ($1,$2,$3,false)`, [randomUUID(), fid, email("two")]);
    for (const [id, n] of [[k1, "Ana"], [k2, "Ben"]]) {
      await sql.query(`insert into s1_kids (id, family_id, first_name, first_name_key, age, status, livemode) values ($1,$2,$3,$4,11,'committed',false)`, [id, fid, n, n.toLowerCase()]);
    }
    await sql.query(
      `insert into s1_orders (id, public_id, family_id, payer_email, offer_id, offer_version, status, amount_cents, paid_at, referral_code, livemode)
       values ($1,$2,$3,$4,'s1-commit','s1-commit-v1','paid',18000, now(), $5, false)`,
      [oid, pub, fid, email("two"), inviter.code],
    );
    await sql.query(`insert into s1_order_items (order_id, kid_id, role, unit_cents, livemode) values ($1,$2,'first',10000,false),($1,$3,'sibling',8000,false)`, [oid, k1, k2]);

    const joiner = { fingerprint: inviter.fingerprints[0] ?? "fp_test_shared", zip: inviter.zip ?? null };
    const o = { id: oid, publicId: pub, familyId: fid, livemode: false, referralCode: inviter.code };
    const a = await recordReferral(o, joiner);
    const b = await recordReferral(o, joiner);
    assert.equal(a.result, "recorded");
    assert.equal(b.referralId, a.referralId);
    assert.deepEqual(b.flags, a.flags, "rerun computes the same flags");
    const ref = (await sqlq(`select * from s1_referrals where id = $1`, [a.referralId]))[0];
    assert.equal(ref.friend_kids, 2);
    assert.equal(ref.status, "pending");
    if (inviter.fingerprints.length) assert.ok(ref.reasons.includes("shared_card"));
    if (inviter.zip) assert.ok(ref.reasons.includes("same_zip"));
    const ob = await sqlq(`select dedupe_key from s1_outbox where dedupe_key like '%:' || $1 || '%' order by dedupe_key`, [a.referralId]);
    assert.equal(ob.length, 1 + a.flags.length);

    // Own-family code is skipped with no referral.
    const own = await recordReferral({ ...o, id: randomUUID(), familyId: inviter.familyId }, joiner);
    assert.equal(own.result, "own_family");
    ev(`(7) synthetic 2-kid order ${pub}: friend_kids 2, reasons [${ref.reasons.join(",")}], outbox ${ob.length}; rerun idempotent; own_family skipped`);
  });

  it("(8) full refund of the friend order -> referral void and (its only paid order) the friend's code void; inviter code untouched", async () => {
    assert.ok(friend, "needs (1)");
    const refund = await stripe.refunds.create({ payment_intent: friend.piId });
    note("refund", refund.id, `(8) full refund of ${friend.piId}`);
    const pi = await stripe.paymentIntents.retrieve(friend.piId);
    const chargeId = String(pi.latest_charge);
    const event = {
      id: `evt_local_${tag}_refund`,
      object: "event",
      api_version: "2026-02-25.clover",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
      type: "charge.refunded",
      data: { object: { id: chargeId, object: "charge" } },
    };
    const payload = JSON.stringify(event);
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: whsec });
    const res = await webhookPOST(
      new Request("http://localhost:3103/api/season1/stripe-webhook", {
        method: "POST",
        headers: { "stripe-signature": header, "content-type": "application/json" },
        body: payload,
      }),
    );
    assert.equal(res.status, 200, await res.text());
    const order = (await sqlq(`select status from s1_orders where id = $1`, [friend.orderId]))[0];
    assert.equal(order.status, "refunded");
    const ref = (await sqlq(`select status from s1_referrals where referred_order_id = $1`, [friend.orderId]))[0];
    assert.equal(ref.status, "void");
    const fcode = (await sqlq(`select status from s1_codes where family_id = $1 and type = 'family'`, [friend.familyId]))[0];
    assert.equal(fcode.status, "void");
    const icode = (await sqlq(`select status from s1_codes where code = $1`, [inviter.code]))[0];
    assert.equal(icode.status, "active");
    ev(`(8) refund ${refund.id}: order refunded, referral void, friend code void, inviter code active`);
  });
});
