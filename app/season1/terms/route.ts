import { redirectToBare } from "@/lib/season1/redirect";
import { OFFER } from "@/lib/season1/offer";

// /season1/terms is retired: the Season 01 program terms are section 23 of the
// Terms of Service (anchor #season-01). Browser-side move to the new URL
// (lib/season1/redirect.ts, no-referrer, query dropped). The old terms.html
// stays on disk for reference only. force-dynamic so each request gets the page.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return redirectToBare(request, OFFER.termsUrl);
}
