/**
 * Find a Season 01 family. Read only.
 *   npm run s1:find -- --email <email> | --order <public id or pi_...> | --kid <first name> | --code <code> [--live]
 * Prints, per family: guardians (masked emails), orders (status, amount, paid_at,
 * flags), kids (first name, age, status), codes, referrals (counts only, never
 * friend names), and an outbox status summary.
 */
import { normalize } from "../lib/season1/codes.ts";
import { foldName } from "../lib/season1/db.ts";
import { fail, initEnv, line, maskEmail, money, parseArgs, q } from "./s1-ops-lib.mjs";

const { flags, opts } = parseArgs(process.argv.slice(2));
const modes = ["email", "order", "kid", "code"].filter((k) => opts[k]);
if (modes.length !== 1) fail("pass exactly one of --email, --order, --kid, --code");
const env = initEnv(flags);
const lm = env.livemode;

let familyIds = [];
if (opts.email) {
  const email = opts.email.trim().toLowerCase();
  familyIds = (
    await q(
      `select family_id as id from s1_guardians where email = $1 and livemode = $2
       union select family_id from s1_orders where payer_email = $1 and livemode = $2`,
      [email, lm],
    )
  ).map((r) => r.id);
} else if (opts.order) {
  const ref = opts.order.trim();
  familyIds = (
    await q(`select family_id as id from s1_orders where livemode = $2 and (public_id = $1 or payment_intent_id = $1)`, [ref, lm])
  ).map((r) => r.id);
} else if (opts.kid) {
  familyIds = (
    await q(`select distinct family_id as id from s1_kids where first_name_key = $1 and livemode = $2 limit 25`, [foldName(opts.kid), lm])
  ).map((r) => r.id);
} else {
  const code = normalize(opts.code);
  if (!code) fail("that is not a valid code");
  familyIds = (await q(`select family_id as id from s1_codes where code = $1 and livemode = $2`, [code, lm])).map((r) => r.id);
}
familyIds = [...new Set(familyIds)];
if (familyIds.length === 0) {
  line("no match");
  process.exit(0);
}
line(`${familyIds.length} ${familyIds.length === 1 ? "family" : "families"} matched`);

for (const fid of familyIds) {
  const fam = (await q(`select public_id, flags, created_at from s1_families where id = $1`, [fid]))[0];
  line("");
  line(`family ${fam.public_id}  flags=[${(fam.flags ?? []).join(",")}]  created=${new Date(fam.created_at).toISOString().slice(0, 10)}`);

  const guardians = await q(`select email from s1_guardians where family_id = $1 order by created_at`, [fid]);
  line(`  guardians: ${guardians.map((g) => maskEmail(g.email)).join(", ") || "-"}`);

  const orders = await q(
    `select o.public_id, o.status, o.amount_cents, o.paid_at, o.flags, o.failure_count, o.fulfilled_at,
            o.jersey_eligible, o.referral_code is not null as has_invite,
            (select count(*)::int from s1_order_items oi where oi.order_id = o.id) as kid_count
       from s1_orders o where o.family_id = $1 order by o.created_at`,
    [fid],
  );
  line(`  orders (${orders.length}):`);
  for (const o of orders) {
    line(
      `    ${o.public_id} ${o.status} ${money(o.amount_cents)} kids=${o.kid_count} paid=${o.paid_at ? new Date(o.paid_at).toISOString().slice(0, 16) + "Z" : "-"} fulfilled=${o.fulfilled_at ? "yes" : "no"} jersey=${o.jersey_eligible ?? "-"} invited=${o.has_invite ? "yes" : "no"} failures=${o.failure_count} flags=[${(o.flags ?? []).join(",")}]`,
    );
  }

  const kids = await q(
    `select k.first_name, k.age, k.status, o.public_id as order_ref
       from s1_kids k
       left join s1_order_items oi on oi.kid_id = k.id
       left join s1_orders o on o.id = oi.order_id
      where k.family_id = $1 order by k.created_at`,
    [fid],
  );
  line(`  kids (${kids.length}):`);
  for (const k of kids) line(`    ${k.first_name} age=${k.age ?? "-"} ${k.status} order=${k.order_ref ?? "-"}`);

  const codes = await q(
    `select code, type, status, show_name, display_name is not null as has_name from s1_codes where family_id = $1 order by created_at`,
    [fid],
  );
  line(`  codes (${codes.length}):`);
  for (const c of codes) line(`    ${c.code} ${c.type} ${c.status} show_name=${c.show_name}${c.type === "partner" ? ` named=${c.has_name}` : ""}`);

  const asInviter = await q(
    `select status, count(*)::int as n, coalesce(sum(friend_kids), 0)::int as kids from s1_referrals where inviter_family_id = $1 group by status order by status`,
    [fid],
  );
  const asJoiner = await q(
    `select r.status, r.reasons, o.public_id as order_ref from s1_referrals r join s1_orders o on o.id = r.referred_order_id where o.family_id = $1`,
    [fid],
  );
  line(`  referrals as inviter (counts only): ${asInviter.map((r) => `${r.status}=${r.n} (friend kids ${r.kids})`).join(", ") || "none"}`);
  line(`  referral as joiner: ${asJoiner.map((r) => `${r.order_ref} ${r.status}${(r.reasons ?? []).length ? ` reasons=[${r.reasons.join(",")}]` : ""}`).join("; ") || "none"}`);

  const refs = orders.map((o) => o.public_id);
  const outbox = refs.length
    ? await q(
        `select kind, status, count(*)::int as n from s1_outbox
          where right(dedupe_key, 10) = any($1::text[]) or payload->>'order_public_id' = any($1::text[])
          group by kind, status order by kind, status`,
        [refs],
      )
    : [];
  line(`  outbox: ${outbox.map((r) => `${r.kind}:${r.status}=${r.n}`).join(", ") || "none"}`);
}
process.exit(0);
