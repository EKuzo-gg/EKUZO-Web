import fs from "fs";
import path from "path";
import { OFFER, formatDatePT, lockInDate } from "@/lib/season1/offer";
import { currentMode } from "@/lib/season1/mode";
import { display } from "@/lib/season1/codes";
import type { OrderView } from "@/lib/season1/db";
import { fulfil, fulfilFromReturn, orderByToken } from "./fulfil-import";
import { drainOutbox } from "@/lib/season1/outbox";
import { SECURITY_HEADERS, pageSecurityHeaders, shareOrigin } from "@/lib/season1/httpGuard";

// Season 01 confirmation, /season1/join/welcome. Adapted from
// /season1/early-access/saved. Names come from the server (order found by the
// s1_order cookie), never from the URL. Stripe's redirect parameters are
// removed in the browser (see GET). Served OUTSIDE app/layout.tsx, so no Meta pixel fires.
export const dynamic = "force-dynamic";

const WELCOME_PATH = "/season1/join/welcome";
const HEADERS = {
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex",
  // The Stripe return URL carries the client secret; never send it as a Referer.
  "referrer-policy": "strict-origin",
  ...SECURITY_HEADERS,
};

function esc(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function money(cents: number): string {
  const x = cents / 100;
  return "$" + (Number.isInteger(x) ? x.toFixed(0) : x.toFixed(2));
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

/** order null = confirmed missing (no cookie, bad token, unknown order); error = the lookup threw. */
async function loadOrder(request: Request, tokenOverride?: string | null): Promise<{ order: OrderView | null; error: boolean }> {
  const token = tokenOverride ?? cookieValue(request, "s1_order");
  if (!token || !/^[A-Za-z0-9_-]{10,128}$/.test(token)) return { order: null, error: false };
  try {
    return { order: await orderByToken(token), error: false };
  } catch {
    return { order: null, error: true };
  }
}

const MAX_TRIES = 5;

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

type State = "paid" | "pending" | "stalled" | "generic";

function pick(html: string, state: State): string {
  let out = html;
  for (const s of ["paid", "pending", "stalled", "generic"] as const) {
    const re = new RegExp(`<!--${s}-->([\\s\\S]*?)<!--/${s}-->`);
    out = out.replace(re, (_m, inner: string) => (s === state ? inner : ""));
  }
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Stripe return: fulfilFromReturn verifies the client secret against the
  // PaymentIntent, fulfils, and hands back a fresh view token for this order.
  // Netlify re-appends the query to a 303 Location (Sentry D1, a redirect loop), so
  // the Stripe return is rendered directly and the query is removed in the browser
  // with history.replaceState before GA loads (GA reads only origin + pathname).
  const pi = url.searchParams.get("payment_intent");
  let returnToken: string | null = null;
  if (pi) {
    const secret = url.searchParams.get("payment_intent_client_secret");
    if (secret) {
      try {
        const r = await fulfilFromReturn(pi, secret);
        if (r.viewToken) returnToken = r.viewToken;
        if (r.status === "paid") await drainOutbox({ limit: 20, budgetMs: 3000 }).catch(() => null);
      } catch {
        // The webhook or the next reload will finish the job.
      }
    }
  }

  const loaded = await loadOrder(request, returnToken);
  let order = loaded.order;
  const dbError = loaded.error;
  // A pending order with a PaymentIntent may have succeeded already; let fulfil
  // check Stripe so the page does not wait on the webhook alone.
  if (order && order.status !== "paid" && order.paymentIntentId) {
    try {
      const r = await fulfil(order.paymentIntentId, "welcome");
      if (r.status === "paid") {
        order = (await loadOrder(request, returnToken)).order ?? order;
        await drainOutbox({ limit: 20, budgetMs: 3000 }).catch(() => null);
      }
    } catch {
      // keep the pending view
    }
  }

  // L3: share links from the raw host header only (never x-forwarded-*), https except localhost.
  const origin = shareOrigin(request.headers.get("host"));
  const mode = currentMode(request.headers.get("host"));
  const sms = `sms:${OFFER.textKarlinSms}`;

  const raw = fs.readFileSync(
    path.join(process.cwd(), "app", "season1", "join", "welcome", "welcome.html"),
    "utf8",
  );

  // A thrown lookup is not "order not found": retry a few times (counted in a
  // short-lived cookie), then tell the parent the payment went through.
  const tries = dbError ? (parseInt(cookieValue(request, "s1_wtry") ?? "0", 10) || 0) + 1 : 0;

  let state: State;
  if (dbError) state = tries <= MAX_TRIES ? "pending" : "stalled";
  else if (!order) state = "generic";
  else if (order.status === "paid" && order.kids.length > 0) state = "paid";
  else state = "pending";

  let html = pick(raw, state);
  html = html.replace(
    "<!--META_REFRESH-->",
    state === "pending" ? '<meta http-equiv="refresh" content="4">' : "",
  );

  const lockIn = lockInDate();
  const vars: Record<string, string> = {
    SMS: esc(sms),
    TEST_HIDDEN: mode === "test" ? "" : " hidden",
    LOCK_IN: esc(formatDatePT(lockIn)),
    LOCK_SHORT: esc(
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric" }).format(lockIn),
    ),
    FIRST: money(OFFER.firstKidCents),
    // Same friend ladder as the season page (lib/season1/joinPage.ts), from offer.ts.
    LADDER0: money(OFFER.seasonCents),
    LADDER1: money(OFFER.seasonCents - OFFER.friendCreditCents),
    LADDER2: money(OFFER.seasonCents - 2 * OFFER.friendCreditCents),
    LADDER3: money(OFFER.seasonCents - 3 * OFFER.friendCreditCents),
  };

  if (state === "paid" && order) {
    const names = order.kids.map((k) => k.firstName);
    vars.KID1 = esc(names[0]);
    vars.HERO =
      names.length === 1
        ? `Great, ${esc(names[0])}'s in!`
        : `Great, ${esc(joinNames(names))} are in!`;
    vars.RECEIPT_LINES = order.kids
      .map((k) => `<div class="line"><span>${esc(k.firstName)}, Season 01, first month</span><span>${money(k.unitCents)}</span></div>`)
      .join("");
    vars.TOTAL = money(order.amountCents);
    // One kid: the per-practice frame. Siblings: the family's monthly total, so a
    // sibling price never shows on a one-kid order.
    const kidCount = order.kids.length;
    vars.THEN_LINE =
      kidCount === 1
        ? `Then ${money(OFFER.monthlyCents)} a month from Feb 15. About ${money(Math.round(OFFER.monthlyCents / OFFER.practicesPerMonth))} a practice.`
        : `Then ${money(OFFER.monthlyCents + OFFER.siblingMonthlyCents * (kidCount - 1))} a month for ${kidCount === 2 ? "both" : `all ${kidCount}`} kids from Feb 15.`;
    vars.ORDER_REF = esc(order.publicId);
    // GA purchase on the paid state (welcome.html): values only, no names.
    vars.GA_VALUE = String(order.amountCents / 100);
    vars.GA_KIDS = String(order.kids.length);
    vars.GA_HAS_CODE = order.code ? "1" : "0";
    // inviteApplied is added to OrderView by the commit work; absent means false.
    const applied = (order as OrderView & { inviteApplied?: boolean }).inviteApplied === true;
    vars.CREDIT_NOTE = applied
      ? '<p class="small" style="margin-top:8px;color:rgba(0,0,0,.75)">Friend credit recorded.</p>'
      : "";
    if (order.code) {
      vars.LINK = esc(`${origin}/crew/${order.code}`);
      vars.LINK_SHORT = esc(`${origin.replace(/^https?:\/\//, "")}/crew/${order.code}`);
      vars.CODE_DISPLAY = esc(display(order.code));
      vars.NO_SHARE = "";
    } else {
      // Paid, but fulfil has not minted the family code yet: receipt without the share block.
      html = html.replace(/<!--share-->[\s\S]*?<!--\/share-->/, "");
      vars.NO_SHARE = '<p class="body" style="margin-top:24px;text-align:center">Your share link is on its way.</p>';
    }
  }

  html = html.replace(/<!--\/?share-->/g, "");
  html = html.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_m, key: string) => vars[key] ?? "");

  if (pi) {
    html = html.replace(
      "<head>",
      `<head>\n<script>try{history.replaceState(null,"",${JSON.stringify(WELCOME_PATH)})}catch(e){}</script>`,
    );
  }

  const headers = new Headers({ "content-type": "text/html; charset=utf-8", ...HEADERS, ...pageSecurityHeaders(mode) });
  if (returnToken) {
    headers.append(
      "set-cookie",
      `s1_order=${returnToken}; Path=/season1; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
    );
  }
  if (dbError) {
    headers.append("set-cookie", `s1_wtry=${tries}; Path=/season1; Max-Age=120; Secure; HttpOnly; SameSite=Lax`);
  } else if (cookieValue(request, "s1_wtry")) {
    headers.append("set-cookie", "s1_wtry=; Path=/season1; Max-Age=0; Secure; HttpOnly; SameSite=Lax");
  }
  if (state === "paid") {
    // Spec: readable by page JS, one year, whole site (the first-visit popup reads the flag).
    headers.append("set-cookie", "ekuzo_s1_joined=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure");
  }
  return new Response(html, { headers });
}
