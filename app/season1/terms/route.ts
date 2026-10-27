import fs from "fs";
import path from "path";
import { OFFER, formatDatePT, lockInDate } from "@/lib/season1/offer";
import { SECURITY_HEADERS } from "@/lib/season1/httpGuard";

// Season 01 program terms, /season1/terms. DRAFT addendum (KB outbox W3, part 1).
// Served OUTSIDE app/layout.tsx. Dates come from the offer config.
export const dynamic = "force-dynamic";

export function GET() {
  const raw = fs.readFileSync(path.join(process.cwd(), "app", "season1", "terms", "terms.html"), "utf8");
  const vars: Record<string, string> = {
    VERSION: OFFER.termsVersion,
    LOCK_IN: formatDatePT(lockInDate()),
    JERSEY_CUTOFF: formatDatePT(OFFER.jerseyCutoffAt),
    SMS: `sms:${OFFER.textKarlinSms}`,
  };
  const html = raw.replace(/\{\{([A-Z_]+)\}\}/g, (_m, k: string) => vars[k] ?? "");
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
      ...SECURITY_HEADERS,
    },
  });
}
