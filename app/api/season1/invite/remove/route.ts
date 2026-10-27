import { refClearCookieHeader } from "@/lib/season1/refcookie";
import { SECURITY_HEADERS, isCrossSite } from "@/lib/season1/httpGuard";

// T9: "Remove" on the signup banner posts here. Clears the HttpOnly s1_ref cookie.
// L2: cross-site posts get a 403 and leave the cookie alone.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const forbidden = isCrossSite(req);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "cache-control": "no-store",
    ...SECURITY_HEADERS,
  };
  if (!forbidden) headers["set-cookie"] = refClearCookieHeader();
  return new Response(JSON.stringify(forbidden ? { error: "forbidden" } : { ok: true }), {
    status: forbidden ? 403 : 200,
    headers,
  });
}
