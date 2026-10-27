/**
 * Pure referral helpers (no DB, no Next): fulfil flag predicates, IP bucketing
 * and crawler detection. Slice 2 contract: 02b-spec-slice2.md (T4, T6, fulfil flags).
 */

export const BURST_THRESHOLD = 5;
export const FREE_REACHED_AT = 4;
export const NODE_AT = 10;

export interface FlagInput {
  /** Card fingerprint of the joining order, if known. */
  joinerFingerprint?: string | null;
  /** Fingerprints on the inviter family's paid orders. */
  inviterFingerprints?: readonly string[] | null;
  joinerZip?: string | null;
  inviterZip?: string | null;
  /** Referrals on this code created in the last 24 h, counting the current one. */
  codeJoinsLast24h: number;
  /** Inviter's live friend kids after this join (includes joinerFriendKids). */
  inviterLiveFriendKidsAfter: number;
  /** Friend kids this join adds. Defaults to 1. Used for crossing semantics. */
  joinerFriendKids?: number;
}

function zip5(z: string | null | undefined): string | null {
  const m = typeof z === "string" ? z.trim().match(/^\d{5}/) : null;
  return m ? m[0] : null;
}

/** Flags in a stable order: shared_card, same_zip, burst, free_reached, node. Never blocks. */
export function computeFlags(i: FlagInput): string[] {
  const flags: string[] = [];
  if (i.joinerFingerprint && (i.inviterFingerprints ?? []).includes(i.joinerFingerprint)) {
    flags.push("shared_card");
  }
  const jz = zip5(i.joinerZip);
  if (jz && jz === zip5(i.inviterZip)) flags.push("same_zip");
  if (i.codeJoinsLast24h >= BURST_THRESHOLD) flags.push("burst");
  const added = i.joinerFriendKids ?? 1;
  const after = i.inviterLiveFriendKidsAfter;
  const before = after - added;
  if (before < FREE_REACHED_AT && after >= FREE_REACHED_AT) flags.push("free_reached");
  if (before < NODE_AT && after >= NODE_AT) flags.push("node");
  return flags;
}

/**
 * Rate-limit bucket for an IP. IPv4 unchanged, IPv6 reduced to its /64
 * ("2001:db8:1:2::/64") or, with v6Prefix 48, its /48 ("2001:db8:1::/48";
 * the commit limiter, security review M1), IPv4-mapped IPv6 reduced to the
 * IPv4 address, missing or unparseable input is "noip".
 */
export function ipBucket(ip: string | null | undefined, v6Prefix: 48 | 64 = 64): string {
  if (!ip) return "noip";
  let s = ip.trim().toLowerCase();
  if (!s) return "noip";
  s = s.replace(/^\[|\]$/g, "").replace(/%.*$/, "");
  if (!s.includes(":")) return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) ? s : "noip";
  const mapped = s.match(/^(?:::ffff:|0:0:0:0:0:ffff:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  // Expand a trailing embedded IPv4 into two groups.
  const v4 = s.match(/^(.*:)(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b, c, d] = [v4[2], v4[3], v4[4], v4[5]].map(Number);
    if ([a, b, c, d].some((n) => n > 255)) return "noip";
    s = v4[1] + ((a << 8) | b).toString(16) + ":" + ((c << 8) | d).toString(16);
  }
  const halves = s.split("::");
  if (halves.length > 2) return "noip";
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  let groups: string[];
  if (halves.length === 2) {
    const fill = 8 - head.length - tail.length;
    if (fill < 1) return "noip";
    groups = [...head, ...Array(fill).fill("0"), ...tail];
  } else {
    groups = head;
  }
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return "noip";
  const n = v6Prefix === 48 ? 3 : 4;
  const head4 = groups.slice(0, n).map((g) => parseInt(g, 16).toString(16));
  return `${head4.join(":")}::/${v6Prefix}`;
}

// T6: known link-unfurl crawlers get the nameless variant and are not counted.
const CRAWLER_PATTERNS: readonly RegExp[] = [
  /facebookexternalhit/i,
  /facebot/i,
  /whatsapp/i,
  /discordbot/i,
  /slackbot/i,
  /twitterbot/i,
  /telegrambot/i,
  /linkedinbot/i,
  /applebot/i,
  /imessage/i,
  /com\.apple\.messages/i,
  /\bmessages\b.*\bpreview/i,
];

export function isCrawlerUa(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return CRAWLER_PATTERNS.some((re) => re.test(userAgent));
}
