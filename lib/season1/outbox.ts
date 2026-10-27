import { getSql } from "./db";
import { loadFriendCtx, loadOrderCtx } from "./outboxLoad";
import { SenderError, type SendOutcome } from "./senders/context";
import { formatCommit, formatFlag, formatOpsAlert, sendDiscord } from "./senders/discord";
import { buildPurchaseEvent, sendMetaPurchase } from "./senders/meta";
import {
  buildCommittedEvent,
  buildFriendJoinedEvent,
  buildRefundedEvent,
  sendKlaviyoEvent,
} from "./senders/klaviyo";

/**
 * Season 01 outbox sender (slice 3 contract). Rows are written by fulfil and
 * the webhook; this drains them. Neon HTTP only: no FOR UPDATE SKIP LOCKED, so
 * each row is claimed with a conditional UPDATE and only the caller whose
 * UPDATE returns the row sends it. A sender never throws out of drainOutbox:
 * a failure becomes status 'failed' with a PII-free last_error.
 *
 * Statuses: pending, sending, sent, failed, stale, skipped_test,
 * skipped_no_config, skipped_unknown_kind.
 */

const HOUR = 3600_000;
export const MAX_ATTEMPTS = 5;
export const STUCK_SENDING_MS = 5 * 60_000;
export const MARK_STALE_TEST_AGE_MIN = 10;

/** O11: how long a row stays worth sending, from created_at. */
export function maxAgeMs(kind: string): number {
  const base = kind.split(":")[0];
  if (base === "meta_purchase") return 6 * 24 * HOUR;
  if (base.startsWith("klaviyo_")) return 48 * HOUR;
  return 24 * HOUR; // discord_*, ops_alert, anything else
}

export function isStale(kind: string, createdAt: Date | string, now: Date = new Date()): boolean {
  return now.getTime() - new Date(createdAt).getTime() > maxAgeMs(kind);
}

export interface OutboxRow {
  id: string;
  kind: string;
  dedupe_key: string;
  payload: Record<string, unknown> | null;
  status: string;
  attempts: number;
  livemode: boolean;
  created_at: string | Date;
}

export interface RowResult {
  id: string;
  kind: string;
  dedupeKey: string;
  status: string;
  detail?: string;
}

export interface DrainSummary {
  considered: number;
  results: RowResult[];
  counts: Record<string, number>;
  timedOut: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
async function q(text: string, params: unknown[] = []): Promise<Row[]> {
  return (await getSql().query(text, params)) as Row[];
}

const asId = (v: unknown): string | null => (typeof v === "string" && v ? v : null);

function orderRefOf(row: OutboxRow): string | null {
  return asId(row.payload?.order_public_id) ?? asId(row.dedupe_key.split(":")[1]);
}

function referralIdOf(row: OutboxRow): string | null {
  return asId(row.payload?.referral_id) ?? asId(row.dedupe_key.split(":")[1]);
}

/** Resolve one claimed row to a sender outcome. Throws SenderError or plain Error on failure. */
async function dispatch(row: OutboxRow): Promise<SendOutcome> {
  const base = row.kind.split(":")[0];
  switch (base) {
    case "klaviyo_committed":
    case "meta_purchase":
    case "discord_commit": {
      const ref = orderRefOf(row);
      const ctx = ref ? await loadOrderCtx(ref) : null;
      if (!ctx) throw new SenderError("order_not_found");
      if (ctx.livemode !== row.livemode) throw new SenderError("livemode_mismatch");
      if (!["paid", "partially_refunded", "refunded"].includes(ctx.status)) throw new SenderError("order_not_paid");
      if (base === "klaviyo_committed") return sendKlaviyoEvent(buildCommittedEvent(ctx), row.livemode);
      if (base === "meta_purchase") return sendMetaPurchase(buildPurchaseEvent(ctx), row.livemode);
      return sendDiscord(formatCommit(ctx), row.livemode);
    }
    case "klaviyo_friend_joined":
    case "discord_flag": {
      const id = referralIdOf(row);
      const f = id ? await loadFriendCtx(id) : null;
      if (!f) throw new SenderError("referral_not_found");
      if (f.livemode !== row.livemode) throw new SenderError("livemode_mismatch");
      if (base === "klaviyo_friend_joined") return sendKlaviyoEvent(buildFriendJoinedEvent(f), row.livemode);
      const flag = asId(row.payload?.flag) ?? row.dedupe_key.split(":")[2] ?? "flag";
      return sendDiscord(formatFlag(f, flag, row.livemode), row.livemode);
    }
    case "klaviyo_refunded": {
      // Payload: { order_public_id, refund_id, amount_refunded_cents, full }
      const ref = orderRefOf(row);
      const refundId = asId(row.payload?.refund_id);
      const cents = Number(row.payload?.amount_refunded_cents);
      if (!ref || !refundId || !Number.isFinite(cents)) throw new SenderError("bad_refund_payload");
      const ctx = await loadOrderCtx(ref);
      if (!ctx) throw new SenderError("order_not_found");
      if (ctx.livemode !== row.livemode) throw new SenderError("livemode_mismatch");
      const full = row.payload?.full === true;
      return sendKlaviyoEvent(
        buildRefundedEvent({ refundId, orderPublicId: ref, amountRefundedCents: cents, full, order: ctx }),
        row.livemode,
      );
    }
    case "ops_alert": {
      const kind = asId(row.payload?.kind) ?? "ops_alert";
      return sendDiscord(formatOpsAlert(kind, asId(row.payload?.payment_intent), row.livemode), row.livemode);
    }
    default:
      return { outcome: "skipped_no_config", detail: "unknown_kind" };
  }
}

function errorCode(e: unknown): string {
  if (e instanceof SenderError) return e.code;
  // Never store err.message: a driver or fetch error can echo a URL, a token or a row.
  const name = (e as Error)?.name;
  return `error_${typeof name === "string" && /^[A-Za-z]{1,40}$/.test(name) ? name : "unknown"}`;
}

async function processRow(candidate: OutboxRow, now: Date): Promise<RowResult> {
  const out = (status: string, detail?: string): RowResult => ({
    id: candidate.id,
    kind: candidate.kind,
    dedupeKey: candidate.dedupe_key,
    status,
    ...(detail ? { detail } : {}),
  });
  try {
    if (isStale(candidate.kind, candidate.created_at, now)) {
      const r = await q(
        `update s1_outbox set status = 'stale', updated_at = now()
          where id = $1 and status in ('pending','failed') returning id`,
        [candidate.id],
      );
      return out(r.length ? "stale" : "lost_claim");
    }
    const claimed = await q(
      `update s1_outbox set status = 'sending', attempts = attempts + 1, updated_at = now()
        where id = $1 and status in ('pending','failed') and attempts < ${MAX_ATTEMPTS} returning *`,
      [candidate.id],
    );
    if (!claimed.length) return out("lost_claim");
    const row = claimed[0] as OutboxRow;

    let status = "sent";
    let detail: string | undefined;
    let lastError: string | null = null;
    try {
      const r = await dispatch(row);
      status = r.outcome;
      detail = r.detail;
      if (r.detail === "unknown_kind") status = "skipped_unknown_kind";
    } catch (e) {
      status = "failed";
      lastError = errorCode(e);
      detail = lastError;
    }
    await q(
      `update s1_outbox set status = $2, last_error = $3, updated_at = now() where id = $1 and status = 'sending'`,
      [row.id, status, lastError],
    );
    return out(status, detail);
  } catch (e) {
    // The database itself failed (timeout, network). The row may be left in 'sending';
    // stuck recovery returns it to 'failed' after five minutes.
    return out("error", errorCode(e));
  }
}

export interface DrainOptions {
  /** Only rows that belong to this order (its own rows, and referral rows it created). */
  orderId?: string;
  limit?: number;
  budgetMs?: number;
}

/**
 * Drains pending (and retryable failed) rows, oldest first. Parallel within
 * the budget: when the budget runs out the call returns what it has and any
 * unfinished row is recovered by the next drain (stuck recovery).
 * Never throws.
 */
export async function drainOutbox(opts: DrainOptions = {}): Promise<DrainSummary> {
  const limit = Math.max(1, Math.min(opts.limit ?? 20, 100));
  const budgetMs = opts.budgetMs ?? 4000;
  const summary: DrainSummary = { considered: 0, results: [], counts: {}, timedOut: false };
  const now = new Date();
  try {
    // Stuck recovery: a row 'sending' for over five minutes was abandoned mid-flight.
    await q(
      `update s1_outbox set status = 'failed', last_error = 'stuck_sending', updated_at = now()
        where status = 'sending' and updated_at < now() - interval '5 minutes'`,
    );
    const ref = opts.orderId;
    const rows = (await q(
      `select id::text as id, kind, dedupe_key, payload, status, attempts, livemode, created_at
         from s1_outbox
        where status in ('pending','failed') and attempts < ${MAX_ATTEMPTS}
          ${ref ? "and (right(dedupe_key, length($2::text) + 1) = ':' || $2::text or payload->>'order_public_id' = $2::text)" : ""}
        order by created_at asc, id asc
        limit $1`,
      ref ? [limit, ref] : [limit],
    )) as OutboxRow[];
    summary.considered = rows.length;
    if (!rows.length) return summary;

    const done: RowResult[] = [];
    const work = Promise.allSettled(
      rows.map(async (r) => {
        done.push(await processRow(r, now));
      }),
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    const budget = new Promise<"budget">((resolve) => {
      timer = setTimeout(() => resolve("budget"), budgetMs);
    });
    const winner = await Promise.race([work.then(() => "done" as const), budget]);
    if (timer) clearTimeout(timer);
    if (winner === "budget") summary.timedOut = true;
    summary.results = [...done];
    for (const r of rows) {
      if (!done.some((d) => d.id === r.id)) summary.results.push({ id: r.id, kind: r.kind, dedupeKey: r.dedupe_key, status: "in_flight" });
    }
  } catch (e) {
    summary.results.push({ id: "-", kind: "-", dedupeKey: "-", status: "error", detail: errorCode(e) });
  }
  for (const r of summary.results) summary.counts[r.status] = (summary.counts[r.status] ?? 0) + 1;
  return summary;
}

/**
 * One-off for the shared test database: marks every livemode=false pending
 * row older than 10 minutes stale so the first real send does not replay old
 * test rows. Returns the number of rows marked.
 */
export async function markStaleTestRows(): Promise<number> {
  const rows = await q(
    `update s1_outbox set status = 'stale', updated_at = now()
      where livemode = false and status = 'pending'
        and created_at < now() - interval '${MARK_STALE_TEST_AGE_MIN} minutes'
      returning id`,
  );
  return rows.length;
}
