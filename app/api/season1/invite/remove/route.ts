import { refClearCookieHeader } from "@/lib/season1/refcookie";

// T9: "Remove" on the signup banner posts here. Clears the HttpOnly s1_ref cookie.
export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "set-cookie": refClearCookieHeader(),
    },
  });
}
