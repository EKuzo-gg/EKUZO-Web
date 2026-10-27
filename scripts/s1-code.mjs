/**
 * Code maintenance (T2, T3).
 *   npm run s1:code -- partner --target <family code> --name "Display Name" --slug <lowercase> [--apply]
 *   npm run s1:code -- void --code <code> [--apply]
 *   npm run s1:code -- rotate --family-code <code> [--apply]
 *   npm run s1:code -- hide-name --code <code> [--apply]
 *   npm run s1:code -- show-name --code <code> [--apply]
 * Dry-run by default. Add --live for production.
 *
 * partner: partner or creator codes only (T3). A partner code shows the display
 *   name instead of a kid name, credits the target family, and may never contain
 *   a kid first name from that family. Surnames cannot be checked here: the
 *   runbook forbids them.
 * void: status -> void. A voided code stops resolving; existing referrals keep.
 * rotate: for a family link that leaked. The old code is voided and parked as
 *   type 'vanity' (the one-family-code unique index would otherwise block the
 *   new row), a new Damm-valid code is minted. Old referrals keep their code text.
 */
import { display, mintNumeric, normalize } from "../lib/season1/codes.ts";
import { foldName, getSql } from "../lib/season1/db.ts";
import { fail, initEnv, line, parseArgs, q } from "./s1-ops-lib.mjs";

const { flags, opts, positional } = parseArgs(process.argv.slice(2));
const cmd = positional[0];
if (!["partner", "void", "rotate", "hide-name", "show-name"].includes(cmd ?? "")) {
  fail("subcommand must be one of: partner, void, rotate, hide-name, show-name");
}
const env = initEnv(flags);

async function activeCode(raw, label) {
  const c = normalize(raw);
  if (!c) fail(`${label} is not a valid code`);
  const row = (
    await q(
      `select code, family_id, type, status, show_name, display_name, livemode from s1_codes where code = $1 and livemode = $2`,
      [c, env.livemode],
    )
  )[0];
  if (!row) fail(`no code ${c} in this database`);
  return row;
}

if (cmd === "partner") {
  const slug = String(opts.slug ?? "");
  const name = String(opts.name ?? "").trim();
  if (!opts.target) fail("--target <family code> is required");
  if (!name) fail("--name is required (T3: a partner code needs a display name)");
  if (name.length > 60 || /[\u0000-\u001f<>]/.test(name)) fail("--name must be 60 characters or fewer, with no control characters or angle brackets");
  if (!/^[a-z]{3,20}$/.test(slug)) fail("--slug must be 3 to 20 lowercase letters, nothing else");
  if (normalize(slug) !== slug) fail("--slug is not a valid code");

  const target = await activeCode(opts.target, "--target");
  if (target.type !== "family" || target.status !== "active") fail("--target must be an active family code");

  const kids = await q(`select first_name, first_name_key from s1_kids where family_id = $1`, [target.family_id]);
  const folded = foldName(name);
  for (const k of kids) {
    const key = k.first_name_key;
    if (key && (slug.includes(key) || folded.includes(key))) {
      fail("refused: the slug or name contains a kid first name from the target family (T3)");
    }
  }
  const taken = await q(`select 1 from s1_codes where code = $1`, [slug]);
  if (taken.length > 0) fail(`code ${slug} already exists`);

  line(`partner code "${slug}" -> display name "${name}", credits the target family (${display(target.code)})`);
  line("reminder: no surnames and no kid names in partner strings (runbook).");
  if (!env.apply) {
    line("dry-run: nothing written. Re-run with --apply.");
    process.exit(0);
  }
  const rows = await q(
    `insert into s1_codes (code, family_id, type, target_code, status, livemode, display_name, show_name)
     select $1, family_id, 'partner', code, 'active', livemode, $3, true
       from s1_codes where code = $2 and type = 'family' and status = 'active' and livemode = $4
     returning code`,
    [slug, target.code, name, env.livemode],
  );
  if (rows.length === 0) fail("insert did not happen (target changed?)");
  line(`created partner code ${slug}`);
  process.exit(0);
}

if (cmd === "void") {
  if (!opts.code) fail("--code is required");
  const row = await activeCode(opts.code, "--code");
  line(`code ${row.code} type=${row.type} status=${row.status}`);
  if (row.status === "void") {
    line("already void. Nothing to do.");
    process.exit(0);
  }
  line(`${env.apply ? "setting" : "would set"} status=void (existing referrals keep their status)`);
  if (!env.apply) {
    line("dry-run: nothing written. Re-run with --apply.");
    process.exit(0);
  }
  const r = await q(`update s1_codes set status = 'void' where code = $1 and livemode = $2 and status <> 'void' returning code`, [row.code, env.livemode]);
  line(r.length ? `voided ${row.code}` : "no change");
  process.exit(0);
}

if (cmd === "rotate") {
  if (!opts["family-code"]) fail("--family-code is required");
  const old = await activeCode(opts["family-code"], "--family-code");
  if (old.type !== "family") fail("rotate works on family codes only");
  if (old.status !== "active") fail(`code is ${old.status}; rotate only an active family code`);
  line(`family code ${display(old.code)} ${env.apply ? "will be" : "would be"} voided and replaced by a new code.`);
  line("the old link stops working; friends who already joined keep their credit.");
  if (!env.apply) {
    line("dry-run: nothing written. Re-run with --apply.");
    process.exit(0);
  }
  const sql = getSql();
  let minted = null;
  for (let i = 0; i < 5 && !minted; i++) {
    const fresh = mintNumeric();
    try {
      await sql.transaction([
        sql.query(
          `update s1_codes set status = 'void', type = 'vanity'
            where code = $1 and livemode = $2 and type = 'family' and status = 'active'`,
          [old.code, env.livemode],
        ),
        sql.query(
          `insert into s1_codes (code, family_id, type, livemode)
           select $2, family_id, 'family', livemode from s1_codes
            where code = $1 and type = 'vanity' and status = 'void'`,
          [old.code, fresh],
        ),
      ]);
      minted = fresh;
    } catch (e) {
      const msg = String(e?.message ?? "");
      if (!/duplicate key|unique/i.test(msg)) fail("rotate failed and was rolled back");
      // Code collision: loop with a new code. A one-family-code conflict also
      // lands here; after 5 tries we stop and report.
    }
  }
  if (!minted) fail("could not mint a unique code; nothing changed (check s1:find --code)");
  line(`rotated. old=${old.code} (void) new=${minted} (${display(minted)})`);
  line("send the family the new link: /crew/" + minted);
  process.exit(0);
}

// hide-name / show-name
if (!opts.code) fail("--code is required");
const row = await activeCode(opts.code, "--code");
const want = cmd === "show-name";
line(`code ${row.code} type=${row.type} status=${row.status} show_name=${row.show_name}`);
if (row.show_name === want) {
  line(`already show_name=${want}. Nothing to do.`);
  process.exit(0);
}
line(`${env.apply ? "setting" : "would set"} show_name=${want} (${want ? "the first name appears on the invite page" : "the invite page renders without a name"})`);
if (!env.apply) {
  line("dry-run: nothing written. Re-run with --apply.");
  process.exit(0);
}
const r = await q(`update s1_codes set show_name = $2 where code = $1 and livemode = $3 returning code`, [row.code, want, env.livemode]);
line(r.length ? `show_name=${want} on ${row.code}` : "no change");
process.exit(0);
