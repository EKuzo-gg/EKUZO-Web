import { NextResponse, type NextRequest } from "next/server";
import { classifyOrigin, isBotUserAgent } from "@/lib/originClassifier";
import { LC_COOKIE, LC_MAX_AGE_SECONDS, buildLastClick } from "@/lib/season1/attribution";
import { SEASON_ONE_MODE, SEASON_ONE_PARAM } from "@/lib/seasonOne";

/**
 * First-touch acquisition-origin tagging.
 *
 * On the visitor's FIRST page view we classify where they came from
 * (AI chat, organic, social, paid, direct) and persist it in a
 * first-party `ekuzo_origin` cookie. Subsequent visits never overwrite
 * it — first-touch is the whole point: we want the origin that brought
 * them in, not wherever they were when they happened to convert.
 *
 * Phase 1 is measurement only. The cookie is read by the register API
 * routes and written into PaymentIntent metadata → Klaviyo profile +
 * Google Sheets. No Meta / CAPI side effects here.
 */
export function middleware(req: NextRequest) {
  // Season 01 waitlist mode: the enrollment funnel is paused. Send any
  // /register page back to its program page with the waitlist popup open.
  // Success pages are untouched so in-flight payments still confirm.
  const path = req.nextUrl.pathname;
  if (SEASON_ONE_MODE && /\/register\/?$/.test(path)) {
    const url = req.nextUrl.clone();
    url.pathname = path.replace(/\/register\/?$/, "") || "/";
    url.searchParams.set(SEASON_ONE_PARAM, "season-one");
    return NextResponse.redirect(url, 307);
  }

  const res = NextResponse.next();

  // Season 01 last click (analytics S5, C3, C17): any request carrying a kept
  // parameter (utm_*, gclid, fbclid) overwrites ekuzo_lc. Runs BEFORE the
  // first-touch early return, so a parent who already has ekuzo_origin (the
  // waitlist landing) still records the email or ad click. Bots skipped.
  // HttpOnly: only the commit route reads it.
  if (!isBotUserAgent(req.headers.get("user-agent"))) {
    const lc = buildLastClick(req.nextUrl.searchParams, path);
    if (lc) {
      res.cookies.set(LC_COOKIE, lc.value, {
        maxAge: LC_MAX_AGE_SECONDS,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        path: "/",
      });
    }
  }

  // First-touch preserved — cookie already set, do nothing.
  if (req.cookies.get("ekuzo_origin")) return res;

  const origin = classifyOrigin({
    searchParams: req.nextUrl.searchParams,
    referer: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  });

  // Known crawler/bot — don't pollute the dataset with a cookie.
  if (origin === null) return res;

  res.cookies.set("ekuzo_origin", origin, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}

// Marketing routes only. Excludes /api/*, Next internals, the favicon,
// and any path containing a dot (static assets) so the cookie logic
// never double-fires on _next chunks or asset requests.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
