import fs from "fs";
import path from "path";
import { renderJoin } from "@/lib/season1/joinPage";
import { currentMode, isLiveHost } from "@/lib/season1/mode";
import { SRC_VALUES } from "@/lib/season1/validate";
import { pageSecurityHeaders } from "@/lib/season1/httpGuard";
import { tagsForRequest } from "@/lib/season1/tags";

// /season1/join serves B's template (decision D10 in
// docs/s1-join-sync-2026-11/03-decision-log.md). This file must stay identical
// to app/season1/join/b/route.ts apart from this comment and the template
// path and the `indexable` line (R2-D5: /join is indexable only on the live
// host in live mode; /join/b and /join/jersey stay noindex);
// lib/season1/__tests__/joinRoutesMatch.test.ts fails if they drift.
// Original header of the B route:
// Season 01 front door, /season1/join. Cloned from
// /season1/early-access/early-access.html with the deltas in
// docs/season1-commit/02d-spec-slice4.md (C1 to C5, C7, C8, C10, C15, closed
// state). Prices and dates come from lib/season1/offer.ts; the closed state
// from mode and the commit window; the jersey line from the jersey cutoff.
// HTML lives beside this file (literal path, never public/). Served OUTSIDE
// app/layout.tsx: its head tags (GA4, Pixel, Clarity) come from lib/season1/tags.ts.
export const dynamic = "force-dynamic";

const TEMPLATE_PATH = path.join(process.cwd(), "app", "season1", "join", "b", "join-b.html");

export function GET(request: Request) {
  const host = request.headers.get("host");
  const mode = currentMode(host);
  const indexable = isLiveHost(host) && mode === "live";
  const srcParam = new URL(request.url).searchParams.get("src");
  const src = srcParam && (SRC_VALUES as readonly string[]).includes(srcParam) ? srcParam : null;
  const tpl = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const html = renderJoin(tpl, { now: new Date(), mode, src, tags: tagsForRequest(request, "join", mode), seo: { indexable } });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      ...(indexable ? {} : { "x-robots-tag": "noindex" }),
      "referrer-policy": "origin",
      ...pageSecurityHeaders(mode),
    },
  });
}
