import { isIP } from "node:net";
import { NextResponse, type NextRequest } from "next/server";
import { BETA_SRC_COOKIE, BETA_SRC_RE, partialAnswers } from "@/lib/season1/betaWizard";
import {
  BETA_RESTART_COOKIE, RESTART_VALID_DAYS, maskEmail, parseRestartToken, restartClearCookies, verifyRestartToken,
} from "@/lib/season1/betaRestart";
import { getSql } from "@/lib/season1/db";
import { isCrossSite } from "@/lib/season1/httpGuard";
import { hit } from "@/lib/season1/ratelimit";
import { keyHash } from "@/lib/season1/rules";
import { keyIsLive } from "@/lib/season1/stripe";

/**
 * POST /api/season1-beta/restore: what the beta restart link's page panel asks.
 * Spec: docs/beta-restart-link-2026-11/02-frozen-spec.md. The token arrives only in the HttpOnly cookie
 * /season1/beta/r/<token> set; this endpoint reads it, never takes it from the body, and never writes
 * to s1_beta_progress, Klaviyo or the sheet (its one write is the rate-limit counter).
 *
 * Body `{}` asks what is saved (masked email and next step only), `{confirm:true}` loads the saved run,
 * `{clear:true}` drops the link. Answers (state, and the cookies each one leaves):
 *   none    no cookie, bad shape, unknown row, bad signature, expired, other mode, or clear   cookies cleared
 *   done    the run was finished: nothing about the player                                      cookies cleared
 *   resume  valid and unfinished: masked email and step; with confirm the run itself            kept; cleared on confirm
 *   503     the database failed or was slow                                                    cookies kept
 *   429     over the hourly limit (the signature is the real control)                           cookies kept
 * Every answer is no-store. Logs carry state names and error codes only.
 */
export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 2500;
const LIMIT_TIMEOUT_MS = 800;
const IP_PER_HOUR = 60;
/** One bucket for every caller with no client IP; much higher than one address's share. */
const NOIP_PER_HOUR = 600;
/** Never returned to the page: the parent's note and the time zone and times (decision D2). */
const WITHHELD = ["note", "timeZone", "tz", "times"] as const;

const SELECT_SQL = `select id, email, session_id, stage, answers, attribution->>'src' as src,
   (completed_at is not null) as completed,
   (updated_at > now() - make_interval(days => $3::int)) as fresh
 from s1_beta_progress where id = $1::uuid and livemode = $2::boolean`;

/** Same rule as /api/season-one's client IP key material (Netlify's header only); copied because that file stays untouched. */
function clientIpKeyMaterial(req: NextRequest): string | null {
  const ip = String(req.headers.get("x-nf-client-connection-ip") ?? "").trim().slice(0, 100).split("%")[0];
  const v = isIP(ip);
  if (v === 4) return ip;
  if (v !== 6) return null;
  let s = ip.toLowerCase();
  const dotted = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(s);
  if (dotted) {
    const [a, b, c, d] = dotted.slice(1).map(Number);
    s = s.slice(0, dotted.index) + `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  const groups = [...head, ...Array(Math.max(fill, 0)).fill("0"), ...tail].map((g) => parseInt(g, 16));
  if (groups.length !== 8 || groups.some((g) => !Number.isFinite(g))) return null;
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
    return `${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`;
  }
  return "v6:" + groups.slice(0, 4).map((g) => g.toString(16).padStart(4, "0")).join(":");
}

async function withTimeout<T>(ms: number, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(`no answer in ${ms} ms`)), ms); })]);
  } finally {
    clearTimeout(timer);
  }
}

/** A failure for the log: a code or name, never a message (a driver message can echo a parameter). */
function errCode(err: unknown): string {
  const e = err as { code?: unknown; name?: unknown } | null;
  const c = e && typeof e.code === "string" ? e.code : e && typeof e.name === "string" ? e.name : "error";
  return /^no answer in/.test(String((err as Error)?.message ?? "")) ? "timeout" : c.replace(/[^A-Za-z0-9_]/g, "").slice(0, 40);
}

function answer(body: Record<string, unknown>, status: number, clear: boolean, extra: string[] = []): NextResponse {
  const res = NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (clear) for (const c of restartClearCookies()) res.headers.append("Set-Cookie", c);
  for (const c of extra) res.headers.append("Set-Cookie", c);
  return res;
}
const none = () => answer({ ok: true, state: "none" }, 200, true);

/** The source cookie, with the options middleware.ts uses for it. */
function srcCookie(value: string): string {
  return `${BETA_SRC_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax`;
}

export async function POST(req: NextRequest) {
  if (isCrossSite(req)) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const raw = await req.json().catch(() => null);
  const body = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  if (body.clear === true) return none();
  const confirm = body.confirm === true;

  const token = req.cookies.get(BETA_RESTART_COOKIE)?.value;
  const rowId = parseRestartToken(token);
  if (!rowId) return none();

  // Limiter: per client address, or one shared bucket with no address. Fails open (the signature is the control).
  try {
    const ip = clientIpKeyMaterial(req);
    const ok = await withTimeout(LIMIT_TIMEOUT_MS, ip ? hit(`s1br:ip:${keyHash(ip)}`, IP_PER_HOUR, 3600) : hit("s1br:noip", NOIP_PER_HOUR, 3600));
    if (!ok) {
      console.warn("Beta restore rate limited");
      return answer({ ok: false }, 429, false);
    }
  } catch (err) {
    console.warn("Beta restore limit check skipped:", errCode(err));
  }

  let row: Record<string, unknown> | undefined;
  try {
    const rows = (await withTimeout(DB_TIMEOUT_MS, getSql().query(SELECT_SQL, [rowId, keyIsLive(), RESTART_VALID_DAYS]) as Promise<Record<string, unknown>[]>)) as Record<string, unknown>[];
    row = rows[0];
  } catch (err) {
    console.error("Beta restore database read failed:", errCode(err));
    return answer({ ok: false }, 503, false);
  }
  if (!row) return none();

  let signed = false;
  try {
    signed = verifyRestartToken(token, rowId, typeof row.session_id === "string" ? row.session_id : "");
  } catch (err) {
    console.error("Beta restore key unavailable:", errCode(err));
    return answer({ ok: false }, 503, false);
  }
  if (!signed || row.fresh !== true) return none();
  if (row.completed === true) return answer({ ok: true, state: "done" }, 200, true);

  const email = typeof row.email === "string" ? row.email : "";
  const stage = Number(row.stage);
  if (!email || !Number.isInteger(stage)) return none();

  if (!confirm) {
    return answer({ ok: true, state: "resume", emailMask: maskEmail(email), step: Math.min(3, Math.max(1, stage + 1)) }, 200, false);
  }

  const answers = partialAnswers(row.answers);
  for (const k of WITHHELD) delete answers[k];
  const extra: string[] = [];
  const src = typeof row.src === "string" ? row.src : "";
  if (!req.cookies.get(BETA_SRC_COOKIE)?.value && BETA_SRC_RE.test(src)) extra.push(srcCookie(src));
  return answer({ ok: true, state: "resume", email, sessionId: String(row.session_id), stage, answers }, 200, true, extra);
}
