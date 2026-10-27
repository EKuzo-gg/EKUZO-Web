import fs from "fs";
import path from "path";
import { renderJoin } from "@/lib/season1/joinPage";
import { currentMode } from "@/lib/season1/mode";
import { SRC_VALUES } from "@/lib/season1/validate";

// Season 01 front door, /season1/join. Cloned from
// /season1/early-access/early-access.html with the deltas in
// docs/season1-commit/02d-spec-slice4.md (C1 to C5, C7, C8, C10, C15, closed
// state). Prices and dates come from lib/season1/offer.ts; the closed state
// from mode and the commit window; the jersey line from the jersey cutoff.
// HTML lives beside this file (literal path, never public/). Served OUTSIDE
// app/layout.tsx, so no Meta pixel fires. GA only.
export const dynamic = "force-dynamic";

const TEMPLATE_PATH = path.join(process.cwd(), "app", "season1", "join", "join.html");

export function GET(request: Request) {
  const mode = currentMode(request.headers.get("host"));
  const srcParam = new URL(request.url).searchParams.get("src");
  const src = srcParam && (SRC_VALUES as readonly string[]).includes(srcParam) ? srcParam : null;
  const tpl = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const html = renderJoin(tpl, { now: new Date(), mode, src });
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
      "referrer-policy": "origin",
    },
  });
}
