import { redirectToBare } from "@/lib/season1/redirect";

// /season1/early-access moved to /season1/join.
// 301 to the bare new path; the query string (kid names) is dropped. The old
// early-access.html stays on disk for reference only. force-dynamic so the Location is
// built from each request's origin.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return redirectToBare(request, "/season1/join");
}
