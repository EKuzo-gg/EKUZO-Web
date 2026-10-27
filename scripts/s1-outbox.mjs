/**
 * Runs the Season 01 outbox sender once.
 *   npm run s1:outbox                      drain up to 20 rows (all orders)
 *   npm run s1:outbox -- --mark-stale-test mark old livemode=false pending rows stale first
 *   npm run s1:outbox -- --order=<publicId> only that order's rows
 *   npm run s1:outbox -- --limit=50 --budget=20000
 * Needs the TS resolver hook; the npm script passes it. Prints ids and
 * statuses only: no emails, no payloads, no secrets.
 */
import { drainOutbox, markStaleTestRows } from "../lib/season1/outbox.ts";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const val = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

if (flag("mark-stale-test")) {
  const n = await markStaleTestRows();
  console.log(`marked stale (livemode=false, pending, older than 10 min): ${n}`);
}

const limit = Number(val("limit") ?? 20);
const budgetMs = Number(val("budget") ?? 20000);
const orderId = val("order");
const s = await drainOutbox({ orderId, limit, budgetMs });
console.log(`considered=${s.considered} timedOut=${s.timedOut} counts=${JSON.stringify(s.counts)}`);
for (const r of s.results) {
  console.log(`  id=${r.id} kind=${r.kind} key=${r.dedupeKey} -> ${r.status}${r.detail ? ` (${r.detail})` : ""}`);
}
process.exit(0);
