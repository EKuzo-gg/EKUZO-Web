/**
 * Shared helpers for the Season 01 ops scripts (s1-refund, s1-attach-code,
 * s1-code, s1-sweep, s1-find). Not a script itself. The scripts run as
 *   node --env-file=.env.local --experimental-strip-types --no-warnings \
 *        --import ./scripts/test-resolve.mjs scripts/<name>.mjs ...
 *
 * Rules every script follows:
 *  - dry-run by default (prints what it would do); --apply acts
 *  - prints order public ids and codes, never full emails (a***@domain),
 *    never secrets or connection strings
 *  - the database and the Stripe key must agree: test with test, live with
 *    live, and live needs --live
 */
import { getSql } from "../lib/season1/db.ts";
import { isTestDbUrl } from "../lib/season1/mode.ts";

/** "--k v", "--k=v" and bare "--flag". Anything else is positional. */
export function parseArgs(argv, booleanFlags = []) {
  const flags = new Set();
  const opts = {};
  const positional = [];
  const bools = new Set(["apply", "dry-run", "live", ...booleanFlags]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      positional.push(a);
      continue;
    }
    const eq = a.indexOf("=");
    if (eq > 0) {
      opts[a.slice(2, eq)] = a.slice(eq + 1);
      continue;
    }
    const name = a.slice(2);
    if (bools.has(name)) {
      flags.add(name);
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      opts[name] = next;
      i++;
    } else {
      flags.add(name);
    }
  }
  return { flags, opts, positional };
}

/** amy@example.com -> a***@example.com. Anything without an @ -> "***". */
export function maskEmail(email) {
  const s = String(email ?? "");
  const at = s.lastIndexOf("@");
  if (at < 1) return "***";
  return `${s[0]}***@${s.slice(at + 1)}`;
}

export function money(cents) {
  if (cents == null) return "-";
  return `$${(cents / 100).toFixed(2)}`;
}

// Unexpected errors print a short code, never a stack with headers or request ids.
function shortError(e) {
  const o = e && typeof e === "object" ? e : {};
  const c = typeof o.code === "string" ? o.code : typeof o.type === "string" ? o.type : typeof o.name === "string" ? o.name : "error";
  console.error(`error: unexpected failure (${c})`);
  process.exit(2);
}
process.on("uncaughtException", shortError);
process.on("unhandledRejection", shortError);

export function fail(message, code = 1) {
  console.error(`error: ${message}`);
  process.exit(code);
}

/**
 * Checks the environment and returns { apply, live, livemode, stripeKeyMode }.
 * Exits on any inconsistency. `needStripe` requires STRIPE_SECRET_KEY.
 */
export function initEnv(flags, { needStripe = false } = {}) {
  const apply = flags.has("apply");
  const live = flags.has("live");
  if (apply && flags.has("dry-run")) fail("pass --apply or --dry-run, not both");

  const url = process.env.DATABASE_URL;
  if (!url) fail("DATABASE_URL is not set (run through the npm script so --env-file loads .env.local)");
  const dbIsTest = isTestDbUrl(url);
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const keyMode = key.startsWith("sk_live_") ? "live" : key.startsWith("sk_test_") ? "test" : key ? "unknown" : "none";

  if (!live) {
    if (!dbIsTest) fail("DATABASE_URL is not the Season 01 test database. Pass --live to work on production.");
    if (keyMode === "live") fail("STRIPE_SECRET_KEY is a live key. Pass --live (and use the production database) to use it.");
  } else {
    if (dbIsTest) fail("--live was passed but DATABASE_URL is the test database.");
    if (keyMode === "test") fail("--live was passed but STRIPE_SECRET_KEY is a test key.");
    // getSql() allows a non-test database only in the production deploy context.
    process.env.S1_DEPLOY_CONTEXT = "production";
  }
  if (needStripe && keyMode !== "test" && keyMode !== "live") fail("STRIPE_SECRET_KEY is missing or not an sk_ key");

  const livemode = live;
  console.log(
    `s1 ops: mode=${apply ? "APPLY" : "dry-run"} db=${live ? "LIVE" : "test"} stripe=${keyMode === "none" ? "n/a" : keyMode}`,
  );
  return { apply, live, livemode, keyMode };
}

/** Parameterized query through the guarded Season 01 client. */
export async function q(text, params = []) {
  return await getSql().query(text, params);
}

export function line(s = "") {
  console.log(s);
}

/**
 * Advice only (README / terms refund rule): once the free jersey has shipped,
 * the refund is the unit price less the $35 jersey, so $65 of the $100. The
 * customer may instead send the jersey back for the full amount.
 */
export const JERSEY_WITHHELD_CENTS = 3500;
export function jerseyRefundAdviceCents(unitCents) {
  return Math.max(0, unitCents - JERSEY_WITHHELD_CENTS);
}

/** True when s1_orders has a jersey_shipped_at column (not in the current migrations). */
export async function hasJerseyShippedColumn() {
  const rows = await q(
    `select 1 from information_schema.columns where table_name = 's1_orders' and column_name = 'jersey_shipped_at' limit 1`,
  );
  return rows.length > 0;
}
