import fs from "fs";
import path from "path";
import { OFFER, isOpen, formatDatePT, lockInDate } from "@/lib/season1/offer";
import { resolveMode } from "@/lib/season1/mode";
import { SRC_VALUES } from "@/lib/season1/validate";

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

export function GET(request: Request) {
  const now = new Date();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const mode = resolveMode({
    envMode: process.env.S1_COMMIT_MODE,
    stripeKey: process.env.STRIPE_SECRET_KEY,
    databaseUrl: process.env.DATABASE_URL,
    host,
  });
  const srcParam = new URL(request.url).searchParams.get("src");
  const src = srcParam && (SRC_VALUES as readonly string[]).includes(srcParam) ? srcParam : null;

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
    },
  });
}
