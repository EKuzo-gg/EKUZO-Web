import { NextResponse, type NextRequest } from "next/server";
import { classifyOrigin } from "@/lib/originClassifier";

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
  const res = NextResponse.next();

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
