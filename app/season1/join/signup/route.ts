import fs from "fs";
import path from "path";
import { OFFER, isOpen, formatDatePT, lockInDate } from "@/lib/season1/offer";
import { currentMode } from "@/lib/season1/mode";
import { SRC_VALUES } from "@/lib/season1/validate";
import { REF_COOKIE_NAME, refSecret, verifyRef } from "@/lib/season1/refcookie";
import { resolveCode } from "@/lib/season1/referral";
import { SECURITY_HEADERS } from "@/lib/season1/httpGuard";

// Season 01 commit sign-up, /season1/join/signup. Adapted from
// /season1/early-access/signup. HTML lives beside this file (literal path,
// never public/). A JSON config block is injected per request. Served OUTSIDE
// app/layout.tsx, so no Meta pixel fires. GA only.
export const dynamic = "force-dynamic";

/** JSON safe inside <script type="application/json">. */
function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function cookieValue(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

/**
 * The invite the s1_ref cookie carries, for the banner only. Returns the display
 * name (or null when nameless) and never the code. Any failure means no banner.
 */
async function loadInvite(request: Request): Promise<{ name: string | null } | null> {
  try {
    const code = verifyRef(cookieValue(request, REF_COOKIE_NAME), refSecret());
    if (!code) return null;
    const r = await resolveCode(code, {
      ip: request.headers.get("x-nf-client-connection-ip") ?? "noip",
      userAgent: request.headers.get("user-agent"),
      livemode: (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live"),
      countForLimit: false,
    });
    if (!r) return null;
    return { name: r.named && r.displayName ? r.displayName : null };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const now = new Date();
  const mode = currentMode(request.headers.get("host"));
  const srcParam = new URL(request.url).searchParams.get("src");
  const src = srcParam && (SRC_VALUES as readonly string[]).includes(srcParam) ? srcParam : null;

  const invite = await loadInvite(request);

  const config = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    mode,
    open: mode !== "off" && isOpen(now),
    prices: {
      first: OFFER.firstKidCents,
      sibling: OFFER.siblingCents,
      monthly: OFFER.monthlyCents,
      siblingMonthly: OFFER.siblingMonthlyCents,
    },
    maxKids: OFFER.maxKidsPerOrder,
    lockInDate: formatDatePT(lockInDate()),
    jerseyCutoff: formatDatePT(OFFER.jerseyCutoffAt),
    jerseyOpen: now.getTime() < Date.parse(OFFER.jerseyCutoffAt),
    textKarlinSms: OFFER.textKarlinSms,
    termsUrl: "/season1/terms",
    src,
    ...(invite ? { invite } : {}),
  };

  const raw = fs.readFileSync(
    path.join(process.cwd(), "app", "season1", "join", "signup", "signup.html"),
    "utf8",
  );
  const html = raw.split("__S1_CONFIG__").join(safeJson(config));
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
      "referrer-policy": "origin",
      ...SECURITY_HEADERS,
    },
  });
}
