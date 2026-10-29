import { SenderError, dollars, type FriendCtx, type OrderCtx, type SendOutcome } from "./context";

/**
 * Season 01 Discord sender for the ops channel: commits, referral flags and
 * ops alerts. The message never carries an email, phone, address, card data,
 * kid names, ages or location (decision 9, 2026-10-29: a money notification).
 * Free text is stripped of mentions, markup and long digit runs.
 */

export const DISCORD_TIMEOUT_MS = 2000;

/** Free text (order refs, referral ids): no mentions, markup, control characters or phone-like digit runs. */
export function free(s: unknown, max = 40): string {
  return String(s ?? "")
    .replace(/[@<>`*~|\\\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/\d{7,}/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Flag and alert names: lowercase identifier characters only. */
export const ident = (s: unknown, max = 60): string => String(s ?? "").toLowerCase().replace(/[^a-z0-9_:.-]/g, "").slice(0, max);

const tag = (livemode: boolean) => (livemode ? "" : "[TEST] ");

export type SourceCategory = "ad" | "organic" | "referral" | "karlin" | "email";

/** Source category for the commit ping: referral when a friend code was used, else the src value mapped. */
export function sourceCategory(o: Pick<OrderCtx, "src" | "invited">): SourceCategory {
  if (o.invited) return "referral";
  const s = String(o.src ?? "").toLowerCase();
  if (s === "friend") return "referral";
  if (s === "karlin") return "karlin";
  if (s === "email") return "email";
  if (s === "ad" || s.startsWith("ad_")) return "ad";
  return "organic";
}

/** Decision 9 (2026-10-29): test tag, amount, number of kids, source category and order ref only. */
export function formatCommit(o: OrderCtx): string {
  const n = o.kids.length;
  const parts = [
    `${tag(o.livemode)}Season 01 commit`,
    `$${dollars(o.amountCents)}`,
    `${n} ${n === 1 ? "kid" : "kids"}`,
    `source ${sourceCategory(o)}`,
    `ref ${free(o.orderPublicId, 20)}`,
  ];
  return parts.join(" | ").slice(0, 1800);
}

export function formatFlag(f: FriendCtx, flag: string, livemode: boolean): string {
  const parts = [
    `${tag(livemode)}Season 01 referral flag: ${ident(flag, 40)}`,
    `code ${ident(f.code, 20)}`,
    `friend kids ${f.friendKids}`,
    `live friend kids ${f.friendsTotal}`,
    `referral ${free(f.referralId, 40)}`,
  ];
  if (f.joinerOrderRef) parts.push(`ref ${free(f.joinerOrderRef, 20)}`);
  return parts.join(" | ").slice(0, 1800);
}

export function formatOpsAlert(kind: string, paymentIntent: string | null, livemode: boolean): string {
  const pi = paymentIntent && /^pi_[A-Za-z0-9_]{6,80}$/.test(paymentIntent) ? ` | ${paymentIntent}` : "";
  return `${tag(livemode)}Season 01 ops alert: ${ident(kind, 60) || "unknown"}${pi}`;
}

/** TEST webhook for test-mode rows, the live one for live rows. Unset means skipped. */
export function webhookUrl(livemode: boolean): string | null {
  const v = livemode ? process.env.S1_DISCORD_WEBHOOK_URL : process.env.S1_DISCORD_WEBHOOK_URL_TEST;
  return v && v.trim() ? v.trim() : null;
}

export async function sendDiscord(content: string, livemode: boolean): Promise<SendOutcome> {
  const url = webhookUrl(livemode);
  if (!url) return { outcome: "skipped_no_config" };
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
    });
  } catch (err) {
    throw new SenderError((err as Error)?.name === "TimeoutError" ? "discord_timeout" : "discord_network");
  }
  await res.text().catch(() => "");
  if (!res.ok) throw new SenderError(`discord_http_${res.status}`);
  return { outcome: "sent", detail: `http_${res.status}` };
}
