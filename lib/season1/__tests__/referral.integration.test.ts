import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { getSql } from "../db";
import { mintNumeric } from "../codes";
import { resolveCode, inviteDecision } from "../referral";

// S1_DB_TESTS=1 node --env-file=.env.local ... ; skips each test until 0004 is applied
// (s1_codes.show_name present).
const enabled = process.env.S1_DB_TESTS === "1";
const tag = randomBytes(4).toString("hex");
const UA = "Mozilla/5.0 (iPhone) Safari/604.1";

describe("referral (integration)", { skip: enabled ? false : "set S1_DB_TESTS=1 to run" }, () => {
  let ready = false;
  const famCode = mintNumeric();
  const hiddenCode = mintNumeric();
  const voidCode = mintNumeric();
  const unpaidCode = mintNumeric();
  const partner = `zz${tag.replace(/[0-9]/g, "q")}`;
  const ownEmail = `team+s1ref-own-${tag}@ekuzo.gg`;
  const paidEmail = `team+s1ref-paid-${tag}@ekuzo.gg`;
  const cleanEmail = `team+s1ref-clean-${tag}@ekuzo.gg`;
  const familyIds: string[] = [];

  async function seedFamily(email: string, code: string | null, opts: { orderStatus: string; kidStatus: string; kid: string; showName?: boolean; codeStatus?: string }) {
    const sql = getSql();
    const fid = randomUUID(), oid = randomUUID(), kid = randomUUID();
    familyIds.push(fid);
    await sql.query(`insert into s1_families (id, public_id, livemode) values ($1,$2,false)`, [fid, `t${randomBytes(5).toString("hex")}`]);
    await sql.query(`insert into s1_guardians (id, family_id, email, livemode) values ($1,$2,$3,false)`, [randomUUID(), fid, email]);
    await sql.query(`insert into s1_kids (id, family_id, first_name, first_name_key, age, status, livemode) values ($1,$2,$3,$4,11,$5,false)`, [kid, fid, opts.kid, opts.kid.toLowerCase(), opts.kidStatus]);
    await sql.query(
      `insert into s1_orders (id, public_id, family_id, payer_email, offer_id, offer_version, status, amount_cents, paid_at, livemode)
       values ($1,$2,$3,$4,'s1-commit','s1-commit-v1',$5,10000, now(), false)`,
      [oid, `t${randomBytes(5).toString("hex")}`, fid, email, opts.orderStatus],
    );
    await sql.query(`insert into s1_order_items (order_id, kid_id, role, unit_cents, livemode) values ($1,$2,'first',10000,false)`, [oid, kid]);
    if (code) {
      await sql.query(
        `insert into s1_codes (code, family_id, type, status, show_name, livemode) values ($1,$2,'family',$3,$4,false)`,
        [code, fid, opts.codeStatus ?? "active", opts.showName ?? true],
      );
    }
    return fid;
  }

  before(async () => {
    if (!enabled) return;
    const rows = (await getSql().query(
      `select 1 from information_schema.columns where table_name = 's1_codes' and column_name = 'show_name'`,
      [],
    )) as unknown[];
    ready = rows.length > 0;
    if (!ready) return;
    await seedFamily(ownEmail, famCode, { orderStatus: "paid", kidStatus: "committed", kid: `Ava${tag}` });
    await seedFamily(`team+s1ref-h-${tag}@ekuzo.gg`, hiddenCode, { orderStatus: "paid", kidStatus: "committed", kid: "Hidden", showName: false });
    await seedFamily(`team+s1ref-v-${tag}@ekuzo.gg`, voidCode, { orderStatus: "paid", kidStatus: "committed", kid: "Void", codeStatus: "void" });
    await seedFamily(`team+s1ref-u-${tag}@ekuzo.gg`, unpaidCode, { orderStatus: "pending", kidStatus: "pending", kid: "Unpaid" });
    await seedFamily(paidEmail, null, { orderStatus: "paid", kidStatus: "committed", kid: "Prior" });
    const pf = await seedFamily(`team+s1ref-p-${tag}@ekuzo.gg`, null, { orderStatus: "paid", kidStatus: "committed", kid: "Pp" });
    await getSql().query(
      `insert into s1_codes (code, family_id, type, status, display_name, livemode) values ($1,$2,'partner','active','Acme Club',false)`,
      [partner, pf],
    );
  });

  after(async () => {
    if (!ready) return;
    const sql = getSql();
    console.log(`# test rows tag=${tag} families=${familyIds.length}`);
    await sql.query(`delete from s1_rate_limits where key like 'ref:ip:%' and key like $1`, [`%${tag}%`]);
  });

  const opt = (ip: string, userAgent = UA) => ({ ip, userAgent, livemode: false });
  const needs = (t: { skip: (m?: string) => void }) => { if (!ready) { t.skip("needs 0004 applied"); return false; } return true; };

  it("resolves a family code to the committed kid's first name", async (t) => {
    if (!needs(t)) return;
    const r = await resolveCode(famCode, opt(`198.51.100.${1 + (parseInt(tag, 16) % 200)}`));
    assert.equal(r?.code, famCode);
    assert.equal(r?.displayName, `Ava${tag}`);
    assert.equal(r?.named, true);
  });
  it("accepts a spaced display form", async (t) => {
    if (!needs(t)) return;
    const spaced = `${famCode.slice(0, 4)} ${famCode.slice(4)}`;
    const r = await resolveCode(spaced, { ...opt("198.51.100.250"), countForLimit: false });
    assert.equal(r?.code, famCode);
  });
  it("show_name false returns the code nameless", async (t) => {
    if (!needs(t)) return;
    const r = await resolveCode(hiddenCode, opt("198.51.100.251"));
    assert.equal(r?.code, hiddenCode);
    assert.equal(r?.displayName, null);
    assert.equal(r?.named, false);
  });
  it("void, unknown and unpaid-family codes return null", async (t) => {
    if (!needs(t)) return;
    assert.equal(await resolveCode(voidCode, opt("198.51.100.252")), null);
    assert.equal(await resolveCode(unpaidCode, opt("198.51.100.252")), null);
    assert.equal(await resolveCode(mintNumeric(), opt("198.51.100.252")), null);
    assert.equal(await resolveCode("12345678", opt("198.51.100.252")), null);
  });
  it("crawler UA gets the code but no name", async (t) => {
    if (!needs(t)) return;
    const r = await resolveCode(famCode, opt("198.51.100.253", "facebookexternalhit/1.1"));
    assert.equal(r?.code, famCode);
    assert.equal(r?.named, false);
  });
  it("partner code shows its display name", async (t) => {
    if (!needs(t)) return;
    const r = await resolveCode(partner, opt("198.51.100.254"));
    assert.equal(r?.displayName, "Acme Club");
    assert.equal(r?.named, true);
  });
  it("the 31st named render from one IP is nameless but keeps the code", async (t) => {
    if (!needs(t)) return;
    const ip = `2001:db8:${tag.slice(0, 4)}:${tag.slice(4)}::1`;
    let last = null;
    for (let i = 0; i < 31; i++) last = await resolveCode(famCode, opt(ip));
    assert.equal(last?.code, famCode);
    assert.equal(last?.named, false);
  });
  it("inviteDecision: ok, unknown, own_family, already_paid", async (t) => {
    if (!needs(t)) return;
    assert.deepEqual(await inviteDecision({ code: famCode, committingEmail: cleanEmail, livemode: false }), { applied: true, reason: "ok" });
    assert.deepEqual(await inviteDecision({ code: mintNumeric(), committingEmail: cleanEmail, livemode: false }), { applied: false, reason: "unknown" });
    assert.deepEqual(await inviteDecision({ code: voidCode, committingEmail: cleanEmail, livemode: false }), { applied: false, reason: "unknown" });
    assert.deepEqual(await inviteDecision({ code: famCode, committingEmail: ownEmail.toUpperCase(), livemode: false }), { applied: false, reason: "own_family" });
    assert.deepEqual(await inviteDecision({ code: famCode, committingEmail: paidEmail, livemode: false }), { applied: false, reason: "already_paid" });
  });
});
