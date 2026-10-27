import { SenderError, dollars, type FriendCtx, type OrderCtx, type SendOutcome } from "./context";

/**
 * Season 01 Discord sender for the ops channel: commits, referral flags and
 * ops alerts. The message never carries an email, phone, address or card
 * data. Free text is stripped of mentions, markup and long digit runs.
 */

export const DISCORD_TIMEOUT_MS = 2000;

/** Names, city, src: no mentions, markup, control characters or phone-like digit runs. */
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

export function formatCommit(o: OrderCtx): string {
  const kids = o.kids.map((k) => `${free(k.firstName)}${k.age != null ? ` (${k.age})` : ""}`).join(", ");
  const place = [free(o.geoCity, 40), free(o.geoRegion, 8)].filter(Boolean).join(", ");
  const parts = [
    `${tag(o.livemode)}Season 01 commit: ${free(o.parentFirstName) || "A parent"}`,
    `kids ${kids || "none"}`,
    `$${dollars(o.amountCents)}`,
  ];
  if (place) parts.push(place);
  if (o.src) parts.push(`src ${free(o.src, 40)}`);
  if (o.invited) {
    const by = o.inviterKidName ? `${free(o.inviterKidName)}'s code ` : "code ";
    parts.push(`invited via ${by}${ident(o.referralCode ?? "", 20)}`);
  }
  if (o.jerseyEligible === false) parts.push("past jersey cutoff");
  if (o.status === "refunded" || o.status === "partially_refunded") parts.push(o.status);
  parts.push(`ref ${free(o.orderPublicId, 20)}`);
  return parts.join(" | ").slice(0, 1800);
}

export function formatFlag(f: FriendCtx, flag: string, livemode: boolean): string {
  const parts = [
    `${tag(livemode)}Season 01 referral flag: ${ident(flag, 40)}`,
    `inviter kid ${free(f.inviterKidName) || "unknown"}`,
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
