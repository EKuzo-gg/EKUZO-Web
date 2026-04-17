import { NextResponse } from "next/server";
import { fetchSquadOwner, hasWeekPassed, isValidSquadToken } from "@/lib/squad";

/**
 * GET /api/squad/[token]
 *
 * Client-facing proxy around the Apps Script `?action=squad&token=X`
 * endpoint. Lets the register page client look up a crew owner without
 * exposing the Apps Script URL to the browser.
 *
 * Returns 200 { owner_gamer_name, week_label, slot, week_dates } for
 * valid, upcoming crews. Returns 404 for:
 *   - malformed tokens (rejected before any outbound call)
 *   - unknown tokens
 *   - crews whose week has already passed
 *
 * Collapsing "past week" into 404 means the register page's existing
 * error-handler cleanly hands off to /squad/[token], which renders the
 * correct terminal-state copy. Don't split the handoff logic across
 * the client — keep it in one place.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!isValidSquadToken(token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const owner = await fetchSquadOwner(token);
  if (!owner || hasWeekPassed(owner.week_dates)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(owner);
}
