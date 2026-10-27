import fs from "fs";
import path from "path";
import { display } from "@/lib/season1/codes";
import { OFFER, formatDatePT } from "@/lib/season1/offer";
import { currentMode } from "@/lib/season1/mode";
import { resolveCode } from "@/lib/season1/referral";
import { refSecret, signRef, refSetCookieHeader } from "@/lib/season1/refcookie";
import { SECURITY_HEADERS } from "@/lib/season1/httpGuard";
import { errCode, logStep } from "@/lib/season1/rules";

// Season 01 friend page, /crew/<code>. The link a family shares after committing.
// Static-shaped HTML served by a route handler OUTSIDE app/layout.tsx (no Meta
// pixel; GA4 only). Server-rendered per request: names are HTML-escaped, the
// response is never cached, and the signed s1_ref cookie is set when the code
// resolves (spec 02b, T4 to T10, T14).
export const dynamic = "force-dynamic";

const TEMPLATE_PATH = path.join(process.cwd(), "app", "crew", "[code]", "crew.html");

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const usd = (cents: number) => `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;

function renderHtml(
  tpl: string,
  named: boolean,
  name: string | null,
  code: string | null,
  flags: { jersey: boolean; test: boolean; inactive: boolean },
): string {
  let out = tpl;
  // C8: the jersey line shows only before the cutoff. C15: the test bar shows only in test mode.
  out = out.replace(/<!--IF:jersey-->([\s\S]*?)<!--\/IF:jersey-->/g, (_m, inner) => (flags.jersey ? inner : ""));
  // D4: "Invite link not active?" shows only when the code is unknown or void (resolveCode returned null),
  // never for a valid code rendered nameless (crawler, rate limit, show_name false, partner without a display name).
  out = out.replace(/<!--IF:inactive-->([\s\S]*?)<!--\/IF:inactive-->/g, (_m, inner) => (flags.inactive ? inner : ""));
  out = out.replace(/<!--IF:test-->([\s\S]*?)<!--\/IF:test-->/g, (_m, inner) => (flags.test ? inner : ""));
  out = out.replace(/<!--IF:named-->([\s\S]*?)<!--\/IF-->/g, (_m, inner) => (named ? inner : ""));
  out = out.replace(/<!--IFNOT:named-->([\s\S]*?)<!--\/IFNOT-->/g, (_m, inner) => (named ? "" : inner));
  const codeLine = code
    ? `<p style="font-size:12px;text-align:center;margin-top:8px;color:rgba(255,255,255,.85)">Friend code ${esc(display(code))}</p>`
    : "";
  const sibPct = Math.round((1 - OFFER.siblingMonthlyCents / OFFER.monthlyCents) * 100);
  const vars: Record<string, string> = {
    // CODE_LINE and NAME are escaped here; every other value is a constant from offer.ts.
    CODE_LINE: codeLine,
    NAME: esc(name ?? ""),
    FIRST: usd(OFFER.firstKidCents),
    MONTHLY: usd(OFFER.monthlyCents),
    SEASON_FULL: usd(OFFER.seasonCents),
    SEASON_CREDIT: usd(OFFER.seasonCents - OFFER.friendCreditCents),
    REFUND_DATE: formatDatePT(OFFER.lockInAt),
    JERSEY_DATE: formatDatePT(OFFER.jerseyCutoffAt),
    JERSEY_SHORT: new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric" }).format(new Date(OFFER.jerseyCutoffAt)),
    AGE_MIN: String(OFFER.ageCopyMin),
    AGE_MAX: String(OFFER.ageCopyMax),
    SIB_PCT: String(sibPct),
    SMS: OFFER.textKarlinSms,
  };
  return out.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await ctx.params;
  const ip = req.headers.get("x-nf-client-connection-ip") || "noip";
  const userAgent = req.headers.get("user-agent");
  const livemode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");

  let resolved: Awaited<ReturnType<typeof resolveCode>> = null;
  let inactive = false;
  try {
    resolved = await resolveCode(rawCode, { ip, userAgent, livemode });
    inactive = resolved === null;
  } catch (err) {
    // DB trouble: nameless page, no cookie. Log a short error code only (ops 8, security review L9).
    logStep("crew.resolve", null, false, errCode(err));
    resolved = null;
  }

  const tpl = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const named = !!(resolved && resolved.named && resolved.displayName);
  const html = renderHtml(tpl, named, named ? resolved!.displayName : null, resolved ? resolved.code : null, {
    jersey: Date.now() < Date.parse(OFFER.jerseyCutoffAt),
    test: currentMode(req.headers.get("host")) === "test",
    inactive,
  });

  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "private, no-store",
    "x-robots-tag": "noindex",
    "referrer-policy": "origin",
    ...SECURITY_HEADERS,
  });
  if (resolved) {
    try {
      headers.append("set-cookie", refSetCookieHeader(signRef(resolved.code, refSecret())));
    } catch {
      // No secret configured: render without a cookie rather than failing the page.
    }
  }
  return new Response(html, { status: 200, headers });
}
