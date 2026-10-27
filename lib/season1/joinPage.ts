import { OFFER, isOpen, formatDatePT, lockInDate } from "./offer";

/**
 * Pure renderer for /season1/join (app/season1/join/route.ts). Prices and
 * dates come from offer.ts, the closed state from mode and the commit window,
 * the jersey line from the jersey cutoff. The clock is injected.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const usd = (cents: number) => `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;

/** Keeps or drops <!--IF:name-->...<!--/IF:name--> and <!--IFNOT:name-->...<!--/IFNOT:name--> blocks. */
function blocks(tpl: string, flags: Record<string, boolean>): string {
  let out = tpl;
  for (const [name, on] of Object.entries(flags)) {
    out = out.replace(new RegExp(`<!--IF:${name}-->([\\s\\S]*?)<!--/IF:${name}-->`, "g"), (_m, inner: string) => (on ? inner : ""));
    out = out.replace(new RegExp(`<!--IFNOT:${name}-->([\\s\\S]*?)<!--/IFNOT:${name}-->`, "g"), (_m, inner: string) => (on ? "" : inner));
  }
  return out;
}

export function renderJoin(tpl: string, opts: { now: Date; mode: "off" | "test" | "live"; src: string | null }): string {
  const { now, mode, src } = opts;
  const open = mode !== "off" && isOpen(now);
  const jersey = now.getTime() < Date.parse(OFFER.jerseyCutoffAt);
  const sms = `+${OFFER.textKarlinSms.replace(/^\+/, "")}`;
  const lockIn = lockInDate();
  const sibPct = Math.round((1 - OFFER.siblingMonthlyCents / OFFER.monthlyCents) * 100);
  const closedBlock =
    `<p style="margin-top:16px;font-size:15px;font-weight:700">Signups are paused. Text Karlin.</p>` +
    `<a class="btn black" style="margin-top:12px" href="sms:${esc(sms)}">Text Karlin</a>` +
    `<a class="btn ghost" style="margin-top:12px" href="/season1">Join the waitlist</a>`;

  const vars: Record<string, string> = {
    TITLE: open ? "Season 01 is open" : "Season 01",
    EYEBROW: open ? "Season 01 is open" : "Season 01",
    SIGNUP: "/season1/join/signup" + (src ? `?src=${encodeURIComponent(src)}` : ""),
    FIRST: usd(OFFER.firstKidCents),
    MONTHLY: usd(OFFER.monthlyCents),
    SEASON_FULL: usd(OFFER.seasonCents),
    LADDER1: usd(OFFER.seasonCents - OFFER.friendCreditCents),
    LADDER2: usd(OFFER.seasonCents - 2 * OFFER.friendCreditCents),
    LADDER3: usd(OFFER.seasonCents - 3 * OFFER.friendCreditCents),
    LOCK_IN: formatDatePT(lockIn),
    LOCK_SHORT: new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric" }).format(lockIn),
    AGE_MIN: String(OFFER.ageCopyMin),
    AGE_MAX: String(OFFER.ageCopyMax),
    SIB_PCT: String(sibPct),
    SMS: sms,
    CLOSED_BLOCK: closedBlock,
  };

  let out = blocks(tpl, { open, jersey, test: mode === "test" });
  // CLOSED_BLOCK is built here from constants; every other value is a constant or a whitelisted src.
  out = out.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k: string) => (k in vars ? (k === "CLOSED_BLOCK" ? vars[k] : esc(vars[k])) : m));
  return out;
}
