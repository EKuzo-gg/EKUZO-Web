import { NextResponse, type NextRequest } from "next/server";
import { cleanTz, parseGeoHeader, text } from "@/lib/seasonOneGeo";
import { ORIGIN_VALUES, type Origin } from "@/lib/originClassifier";
import { LC_COOKIE, parseLastClick } from "./attribution";
import { foldName, getSql } from "./db";
import { OFFER } from "./offer";
import { hit, hitPair } from "./ratelimit";
import { keyHash } from "./rules";
import { keyIsLive } from "./stripe";

/**
 * The free beta sign-up wizard (app/season1/beta/start/start.html), step "beta-wizard" of
 * POST /api/season-one. Spec: docs/beta-wizard-go-live-2026-11/02-frozen-spec.md.
 *
 * The wizard is the sign-up: it works for an email with no earlier record (no step lock,
 * no 24 h per-email sign-up limit), and a family can send one submission per player.
 *
 * Where a completed wizard lands:
 *  1. Neon: s1_beta_families (one per email) and s1_beta_players (one per family and first
 *     name; a second submission for the same player updates that row). The first source and
 *     attribution stay on the family; each submission's own go on the player.
 *  2. Klaviyo: a "Beta Wizard Completed" event and beta_* profile properties. No list and no
 *     consent change: never the Season 01 Waitlist list (XGTv2F), which the Day 0 and Day 4
 *     flows and Karlin's founder note all key on, so a wizard-only family gets none of them.
 *     (The endpoint is open, so it must not be a way to subscribe someone else's address.)
 *  3. Sheets: one row per player, only when S1_BETA_SHEETS_WEBHOOK_URL is set (off by default).
 *     Never on a retry of the same submit. No Discord: that channel is for Season 01 sales only
 *     (Jamie, 2026-11-12).
 *
 * Drop-off capture (step "beta-progress", handleBetaProgress below): the page posts after the
 * email screen and after each step, so a family that stops is on record with the answers so far
 * and the step to pick up at: s1_beta_progress in Neon, and a "Beta Wizard Progress" event plus
 * beta_wizard_stage / beta_wizard_next_step on the Klaviyo profile. Completing the wizard marks
 * the progress row done and sets beta_wizard_stage to "done", so a pick-up email never fires for
 * a family that finished.
 * Nothing goes to Meta or GA4 from here, and nothing about the player is ever put in a URL.
 *
 * The parent sees ok when Neon or Klaviyo saved the answers; both failing is a 502 and a retry.
 * The on-screen end state promises a review and an email either way, never a spot.
 * Logs never carry the email, the player's name or any answer.
 */

export const BETA_METRIC = "Beta Wizard Completed";
export const BETA_SRC_COOKIE = "ekuzo_bsrc";
/** `?src=` on a beta page: a short lowercase tag such as karlin-email or karlin-text. */
export const BETA_SRC_RE = /^[a-z0-9][a-z0-9_-]{0,39}$/;
export function cleanBetaSrc(v: unknown): string {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return BETA_SRC_RE.test(s) ? s : "";
}

export const PLAYS_ON = ["Computer", "Console", "Tablet", "Phone", "Not much yet"] as const;
export const TEAM_SPORTS = ["Loves them", "Plays, not their thing", "Tried, didn't stick", "Hasn't tried yet"] as const;
export const SUPERPOWERS = ["Never gives up", "Makes everyone laugh", "Quick thinker", "Natural leader", "Quiet strategist", "Builds anything", "Great teammate"] as const;
export const EXPECTATIONS = ["No toxicity", "Positive mindset", "Winning attitude"] as const;
export const TIME_ZONES = ["Eastern", "Central", "Mountain", "Pacific", "Alaska", "Hawaii", "Other"] as const;
export const TIMES = ["Weekday afternoons", "Weekday evenings", "Weekend afternoons", "Weekend evenings"] as const;
export const AGE_MIN = 9;
export const AGE_MAX = 18;

const KLAVIYO_REVISION = "2025-07-15";
const EVENT_TIMEOUT_MS = 3500;
const SHEETS_TIMEOUT_MS = 2500;
const LIMIT_TIMEOUT_MS = 800;
const DB_TIMEOUT_MS = 2500;
/** Submissions per client IP per clock hour (the waitlist's own ceiling). A school or library shares one address. */
export const IP_PER_HOUR = 30;
/** Submissions per clock hour across everyone: above this they are still saved, but no Sheets row (a flood must not bury the team's sheet). */
export const GLOBAL_QUIET_PER_HOUR = 200;
const FAIL = "We couldn’t save that. Please try again.";

// A first name: letters, marks, digits, spaces and . ' ’ - only.
const NAME_STRIP_RE = /[^\p{L}\p{M}\p{N} .'’-]/gu;
// Free text a parent typed: control characters and the markup characters < > go; everything else stays as typed.
const FREE_STRIP_RE = /[\u0000-\u001f\u007f-\u009f<>]/g;
const freeText = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(FREE_STRIP_RE, " ").replace(/\s+/g, " ").trim().slice(0, max).replace(/[\uD800-\uDBFF]$/, "").trim() : "";
const cleanEventId = (v: unknown) => (typeof v === "string" ? v.replace(/[^A-Za-z0-9-]/g, "").slice(0, 64) : "");

/** Every value must be a string from `allowed`; duplicates collapse; order follows `allowed`. null when anything else is present. */
function subset(v: unknown, allowed: readonly string[], max = allowed.length): string[] | null {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > 20) return null;
  if (!v.every((x) => typeof x === "string" && allowed.includes(x))) return null;
  const out = allowed.filter((a) => v.includes(a));
  return out.length > max ? null : out;
}

export interface BetaAnswers {
  eventId: string;
  playerName: string;
  playerNameKey: string;
  playerAge: number;
  playsOn: string[];
  teamSports: string;
  superpowers: string[];
  funFact: string;
  expectations: string[];
  timeZone: string;
  tz: string;
  times: string[];
  note: string;
  page: string;
  utm: Record<string, string>;
}

export type Validated = { ok: true; value: BetaAnswers } | { ok: false; error: string };

/** Pure: checks every field against the wizard's allowed values. Never throws. */
export function validateBetaWizard(body: Record<string, unknown>, email: string): Validated {
  const bad = (error: string): Validated => ({ ok: false, error });
  const playerName = (typeof body.playerName === "string" ? body.playerName.replace(NAME_STRIP_RE, "") : "").replace(/\s+/g, " ").trim().slice(0, 40).trim();
  const playerNameKey = foldName(playerName);
  if (!playerName || !playerNameKey) return bad("Add your player’s first name.");
  const playerAge = body.playerAge;
  if (typeof playerAge !== "number" || !Number.isInteger(playerAge) || playerAge < AGE_MIN || playerAge > AGE_MAX) return bad("Pick their age.");
  const playsOn = subset(body.playsOn, PLAYS_ON);
  const superpowers = subset(body.superpowers, SUPERPOWERS, 2);
  const expectations = subset(body.expectations, EXPECTATIONS);
  const times = subset(body.times, TIMES);
  if (!playsOn || !superpowers || !expectations || !times) return bad(FAIL);
  if (expectations.length !== EXPECTATIONS.length) return bad("Tap all three to continue.");
  if (times.length < 1) return bad("Pick at least one time.");
  const teamSports = body.teamSports === undefined || body.teamSports === null || body.teamSports === "" ? "" : body.teamSports;
  if (typeof teamSports !== "string" || (teamSports !== "" && !(TEAM_SPORTS as readonly string[]).includes(teamSports))) return bad(FAIL);
  const timeZone = body.timeZone;
  if (typeof timeZone !== "string" || !(TIME_ZONES as readonly string[]).includes(timeZone)) return bad(FAIL);
  const attr = (body.attribution && typeof body.attribution === "object" && !Array.isArray(body.attribution) ? body.attribution : {}) as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = text(attr[k], 160).replace(/[^\x20-\x7e]/g, "").replace(/[<>]/g, "").trim();
    if (v) utm[k] = v;
  }
  const page = text(body.page, 120);
  // With no eventId (an old cached page), one per player, so a retry still lands on the same record.
  const eventId = cleanEventId(body.eventId) || `auto-${keyHash(`${email}|${playerNameKey}`)}`;
  return {
    ok: true,
    value: {
      eventId, playerName, playerNameKey, playerAge, playsOn, teamSports, superpowers,
      funFact: freeText(body.funFact, 120), expectations, timeZone, tz: cleanTz(body.tz), times,
      note: freeText(body.note, 500),
      page: /^\/season1\/beta(\/[a-z0-9/-]*)?$/.test(page) ? page : "/season1/beta/start",
      utm,
    },
  };
}

/** Where this family came from: the beta `?src=` cookie, the last click (ekuzo_lc), the wizard URL's own utm_*, the first-touch bucket. */
export function betaAttribution(req: NextRequest, utm: Record<string, string>): { source: string; attribution: Record<string, unknown> } {
  const src = cleanBetaSrc(req.cookies.get(BETA_SRC_COOKIE)?.value);
  let lc: Record<string, unknown> | null = null;
  try {
    lc = parseLastClick(req.cookies.get(LC_COOKIE)?.value) as Record<string, unknown> | null;
  } catch {
    lc = null;
  }
  const ft = req.cookies.get("ekuzo_origin")?.value;
  const firstTouch = (ORIGIN_VALUES as readonly string[]).includes(ft ?? "") ? (ft as Origin) : null;
  const merged: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "ad"]) {
    const v = utm[k] || (lc && typeof lc[k] === "string" ? (lc[k] as string) : "");
    if (v) merged[k] = v;
  }
  // The source the team reads: the link's own tag first, then the campaign source, then how they first found us.
  // Plain tag characters only: this value is shown in the ops channel, so no link or markup can ride in on a utm_source.
  const tag = (v: string) => v.toLowerCase().replace(/[^a-z0-9_.:-]/g, "").slice(0, 60);
  const source = src || tag(merged.utm_source ?? "") || (firstTouch ? `first-touch:${tag(firstTouch)}` : "") || "direct";
  return { source, attribution: { src: src || null, ...merged, first_touch: firstTouch, lc_path: lc && typeof lc.path === "string" ? lc.path : null } };
}

type Saved = { familyId: string; playerId: string; newFamily: boolean; newPlayer: boolean; sameEvent: boolean; players: number };

async function withTimeout<T>(ms: number, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no answer in ${ms} ms`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One statement: upsert the family (first source and attribution win), upsert the player on
 * (family, first name), and report what changed. A retry of the same submit (same eventId)
 * rewrites the same values and reports sameEvent, so nothing downstream announces it twice.
 */
export const SAVE_SQL = `with fam as (
   insert into s1_beta_families (email, source, attribution, geo, livemode)
   values ($1, $2, $3::jsonb, $4::jsonb, $5::boolean)
   on conflict (email, livemode) do update set updated_at = now()
   returning id, (xmax = 0) as new_family),
 prev as (
   select p.last_event_id from s1_beta_players p where p.family_id = (select id from fam) and p.first_name_key = $7),
 pl as (
   insert into s1_beta_players (family_id, first_name, first_name_key, age, plays_on, team_sports, superpowers, fun_fact,
                                expectations, time_zone, tz, times, note, source, attribution, page, last_event_id, livemode)
   select fam.id, $6, $7, $8::int, $9::text[], $10, $11::text[], $12, $13::text[], $14, $15, $16::text[], $17, $2, $3::jsonb, $18, $19, $5::boolean
     from fam
   on conflict (family_id, first_name_key) do update set
     first_name = excluded.first_name, age = excluded.age, plays_on = excluded.plays_on, team_sports = excluded.team_sports,
     superpowers = excluded.superpowers, fun_fact = excluded.fun_fact, expectations = excluded.expectations,
     time_zone = excluded.time_zone, tz = excluded.tz, times = excluded.times, note = excluded.note,
     page = excluded.page, updated_at = now(),
     submissions = s1_beta_players.submissions + (case when s1_beta_players.last_event_id = excluded.last_event_id then 0 else 1 end),
     last_event_id = excluded.last_event_id
   returning id, (xmax = 0) as new_player),
 done as (
   update s1_beta_progress set stage = 3, next_step = '', completed_at = now(), updated_at = now()
    where email = $1 and livemode = $5::boolean and completed_at is null
   returning 1)
 select fam.id as family_id, fam.new_family, pl.id as player_id, pl.new_player,
        coalesce((select last_event_id from prev), '') as prev_event_id,
        (select count(*)::int from s1_beta_players p where p.family_id = fam.id) + (case when pl.new_player then 1 else 0 end) as players
   from fam, pl`;

async function saveToDb(email: string, a: BetaAnswers, source: string, attribution: Record<string, unknown>, geo: Record<string, string>): Promise<Saved | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const rows = (await withTimeout(
      DB_TIMEOUT_MS,
      getSql().query(SAVE_SQL, [
        email, source, JSON.stringify(attribution), JSON.stringify(geo), keyIsLive(),
        a.playerName, a.playerNameKey, a.playerAge, a.playsOn, a.teamSports, a.superpowers, a.funFact,
        a.expectations, a.timeZone, a.tz, a.times, a.note, a.page, a.eventId,
      ]) as Promise<Record<string, unknown>[]>,
    )) as Record<string, unknown>[];
    const r = rows[0];
    if (!r) return null;
    return {
      familyId: String(r.family_id), playerId: String(r.player_id), newFamily: r.new_family === true, newPlayer: r.new_player === true,
      sameEvent: r.new_player !== true && r.prev_event_id === a.eventId, players: Number(r.players) || 1,
    };
  } catch (err) {
    console.error("Beta wizard database save failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function klaviyo(path: string, body: unknown, timeoutMs: number) {
  return fetch(`https://a.klaviyo.com/api/${path}`, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
      revision: KLAVIYO_REVISION,
    },
    body: JSON.stringify(body),
  });
}

async function saveToKlaviyo(email: string, a: BetaAnswers, source: string, attribution: Record<string, unknown>, geo: Record<string, string>): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    const r = await klaviyo("events", {
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: BETA_METRIC } } },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email,
                properties: {
                  beta_wizard: "yes", beta_completed_at: now, beta_source: source,
                  beta_wizard_stage: "done", beta_wizard_next_step: "",
                  beta_player_name: a.playerName, beta_player_age: a.playerAge,
                  beta_time_zone: a.timeZone, beta_tz: a.tz, beta_times: a.times,
                },
              },
            },
          },
          properties: {
            player_name: a.playerName, player_age: a.playerAge, plays_on: a.playsOn, team_sports: a.teamSports,
            superpowers: a.superpowers, fun_fact: a.funFact, expectations: a.expectations,
            time_zone: a.timeZone, tz: a.tz, times: a.times, note: a.note,
            source, src: attribution.src ?? "", utm_source: attribution.utm_source ?? "", utm_medium: attribution.utm_medium ?? "",
            utm_campaign: attribution.utm_campaign ?? "", utm_content: attribution.utm_content ?? "", utm_term: attribution.utm_term ?? "",
            first_touch: attribution.first_touch ?? "", page: a.page,
            geo_city: geo.geo_city ?? "", geo_region: geo.geo_region ?? "", geo_country: geo.geo_country ?? "",
          },
          time: now,
          unique_id: `${email}-${BETA_METRIC}-${a.eventId}`,
        },
      },
    }, EVENT_TIMEOUT_MS);
    if (!r.ok) console.error("Klaviyo beta wizard event failed:", r.status);
    return r.ok;
  } catch (err) {
    console.error("Klaviyo beta wizard event failed:", err instanceof Error ? err.name : "error");
    return false;
  }
}

async function sheetsRow(email: string, a: BetaAnswers, source: string, saved: Saved | null) {
  const url = (process.env.S1_BETA_SHEETS_WEBHOOK_URL ?? "").trim();
  if (!url) return;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(SHEETS_TIMEOUT_MS),
      body: JSON.stringify({
        tab: "beta-players",
        rows: [{
          submitted_at: new Date().toISOString(), player_id: saved?.playerId ?? "", email, player_name: a.playerName, player_age: a.playerAge,
          time_zone: a.timeZone, tz: a.tz,
          weekday_afternoons: a.times.includes("Weekday afternoons") ? "yes" : "", weekday_evenings: a.times.includes("Weekday evenings") ? "yes" : "",
          weekend_afternoons: a.times.includes("Weekend afternoons") ? "yes" : "", weekend_evenings: a.times.includes("Weekend evenings") ? "yes" : "",
          plays_on: a.playsOn.join(", "), team_sports: a.teamSports, superpowers: a.superpowers.join(", "), fun_fact: a.funFact, note: a.note,
          source, status: saved && !saved.newPlayer ? "updated" : "new", livemode: keyIsLive() ? "live" : "test",
        }],
      }),
    });
    if (!r.ok) console.error("Beta wizard Sheets row failed:", r.status);
  } catch (err) {
    console.error("Beta wizard Sheets row failed:", err instanceof Error ? err.name : "error");
  }
}

/**
 * Per-IP and global counters in one round trip. No per-email counter: anyone can type a parent's
 * address, so a per-email limit would let a stranger lock a family out. Fails open on no database,
 * an error or a slow answer. `quiet` means saved but not announced.
 */
async function checkLimits(ipMaterial: string | null): Promise<{ allowed: boolean; quiet: boolean }> {
  if (!process.env.DATABASE_URL) return { allowed: true, quiet: false };
  try {
    const global = { key: "s1bw:global", limit: GLOBAL_QUIET_PER_HOUR, windowSeconds: 3600 };
    if (!ipMaterial) return { allowed: true, quiet: !(await withTimeout(LIMIT_TIMEOUT_MS, hit(global.key, global.limit, global.windowSeconds))) };
    const [ipOk, globalOk] = await withTimeout(LIMIT_TIMEOUT_MS, hitPair({ key: `s1bw:ip:${keyHash(ipMaterial)}`, limit: IP_PER_HOUR, windowSeconds: 3600 }, global));
    return { allowed: ipOk, quiet: globalOk === false };
  } catch (err) {
    console.warn("Beta wizard limit check skipped:", err instanceof Error ? err.message : err);
    return { allowed: true, quiet: false };
  }
}

/**
 * Handles step "beta-wizard". The caller (the route) has already run the cross-site guard, the
 * email check and the Klaviyo key check. `ipMaterial` is the route's per-IP key material (null
 * when there is no valid client IP: no per-IP limit then, never one shared bucket).
 */
export async function handleBetaWizard(req: NextRequest, body: Record<string, unknown>, email: string, ipMaterial: string | null): Promise<NextResponse> {
  // Honeypot first: look like a success, write nothing.
  if (text(body.ekz_hp)) {
    console.warn("Beta wizard dropped: honeypot field filled");
    return NextResponse.json({ ok: true });
  }
  const v = validateBetaWizard(body, email);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });
  const a = v.value;

  const limits = await checkLimits(ipMaterial);
  if (!limits.allowed) {
    console.warn("Beta wizard rate limited");
    return NextResponse.json({
      ok: false,
      error: `We couldn’t save that just now. Text our founder at ${displayPhone(OFFER.textKarlinSms)} and we’ll add your player by hand.`,
    }, { status: 429 });
  }

  const { source, attribution } = betaAttribution(req, a.utm);
  const g = parseGeoHeader(req.headers.get("x-nf-geo"));
  const geo = { geo_city: g.geo_city ?? "", geo_region: g.geo_region ?? "", geo_country: g.geo_country ?? "", geo_tz: g.geo_tz ?? "" };

  const [saved, klaviyoOk] = await Promise.all([
    saveToDb(email, a, source, attribution, geo),
    saveToKlaviyo(email, a, source, attribution, geo),
  ]);
  if (!saved && !klaviyoOk) {
    return NextResponse.json({
      ok: false,
      error: `We couldn’t save that. Please try again, or text our founder at ${displayPhone(OFFER.textKarlinSms)}.`,
    }, { status: 502 });
  }

  // A retry of the same submit writes no second Sheets row. Without the database we cannot tell, so we write.
  if (limits.quiet) console.warn("Beta wizard quiet: over the hourly ceiling, saved without a Sheets row");
  const announce = !limits.quiet && (!saved || !saved.sameEvent);
  if (announce) await sheetsRow(email, a, source, saved);
  return NextResponse.json({ ok: true });
}

function displayPhone(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

/* ------------------------------------------------------------------------------------------
 * Drop-off capture: step "beta-progress"
 * ---------------------------------------------------------------------------------------- */

export const PROGRESS_METRIC = "Beta Wizard Progress";
/** stage = the last screen the parent finished: 0 the email screen, 1 "what the beta is", 2 the player card. (3, availability, is the completed wizard.) */
export const STAGES = [
  { done: "email", next: "What the beta is", nextStep: 1 },
  { done: "expectations", next: "Player card", nextStep: 2 },
  { done: "player card", next: "Availability", nextStep: 3 },
] as const;
/** Progress posts per client IP per clock hour (three per family). Over it they are dropped silently; the parent never sees it. */
export const PROGRESS_IP_PER_HOUR = 150;

/** The answers so far. Lenient on purpose: a field that is missing or not an allowed value is left out, never an error. */
export function partialAnswers(raw: unknown): Record<string, unknown> {
  const b = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const name = (typeof b.playerName === "string" ? b.playerName.replace(NAME_STRIP_RE, "") : "").replace(/\s+/g, " ").trim().slice(0, 40).trim();
  if (name) out.playerName = name;
  if (typeof b.playerAge === "number" && Number.isInteger(b.playerAge) && b.playerAge >= AGE_MIN && b.playerAge <= AGE_MAX) out.playerAge = b.playerAge;
  const lists: [string, readonly string[], number][] = [["playsOn", PLAYS_ON, 5], ["superpowers", SUPERPOWERS, 2], ["expectations", EXPECTATIONS, 3], ["times", TIMES, 4]];
  for (const [k, allowed, max] of lists) {
    const v = subset(b[k], allowed, max);
    if (v && v.length) out[k] = v;
  }
  if (typeof b.teamSports === "string" && (TEAM_SPORTS as readonly string[]).includes(b.teamSports)) out.teamSports = b.teamSports;
  if (typeof b.timeZone === "string" && (TIME_ZONES as readonly string[]).includes(b.timeZone)) out.timeZone = b.timeZone;
  const tz = cleanTz(b.tz);
  if (tz) out.tz = tz;
  const fact = freeText(b.funFact, 120);
  if (fact) out.funFact = fact;
  const note = freeText(b.note, 500);
  if (note) out.note = note;
  return out;
}

/**
 * One row per email. The same wizard session only ever moves forward (stage is the highest seen,
 * answers merge). A new session (the parent starts again, for a sibling or on another day) starts
 * the row over and clears completed_at, so a second, unfinished run is a drop-off again.
 */
export const PROGRESS_SQL = `insert into s1_beta_progress (email, session_id, stage, next_step, answers, source, attribution, page, livemode)
 values ($1, $2, $3::int, $4, $5::jsonb, $6, $7::jsonb, $8, $9::boolean)
 on conflict (email, livemode) do update set
   stage = case when s1_beta_progress.session_id = excluded.session_id then greatest(s1_beta_progress.stage, excluded.stage) else excluded.stage end,
   next_step = case when s1_beta_progress.session_id = excluded.session_id and s1_beta_progress.stage > excluded.stage then s1_beta_progress.next_step else excluded.next_step end,
   answers = case when s1_beta_progress.session_id = excluded.session_id then s1_beta_progress.answers || excluded.answers else excluded.answers end,
   started_at = case when s1_beta_progress.session_id = excluded.session_id then s1_beta_progress.started_at else now() end,
   completed_at = case when s1_beta_progress.session_id = excluded.session_id then s1_beta_progress.completed_at else null end,
   session_id = excluded.session_id, page = excluded.page, updated_at = now()
 returning id, stage, (completed_at is not null) as completed`;

/**
 * Handles step "beta-progress". Always answers {ok:true} for a well-formed post: the page ignores
 * the answer and a parent is never interrupted by a capture failure. Nothing here goes to Meta.
 */
export async function handleBetaProgress(req: NextRequest, body: Record<string, unknown>, email: string, ipMaterial: string | null): Promise<NextResponse> {
  const ok = () => NextResponse.json({ ok: true });
  if (text(body.ekz_hp)) return ok();
  const stage = body.stage;
  if (typeof stage !== "number" || !Number.isInteger(stage) || stage < 0 || stage >= STAGES.length) return NextResponse.json({ ok: false, error: FAIL }, { status: 400 });
  const sessionId = cleanEventId(body.sessionId);
  if (!sessionId) return NextResponse.json({ ok: false, error: FAIL }, { status: 400 });

  if (process.env.DATABASE_URL && ipMaterial) {
    try {
      if (!(await withTimeout(LIMIT_TIMEOUT_MS, hit(`s1bp:ip:${keyHash(ipMaterial)}`, PROGRESS_IP_PER_HOUR, 3600)))) {
        console.warn("Beta progress dropped: rate limited");
        return ok();
      }
    } catch (err) {
      console.warn("Beta progress limit check skipped:", err instanceof Error ? err.message : err);
    }
  }

  const st = STAGES[stage];
  const answers = partialAnswers(body.answers);
  const attr = (body.attribution && typeof body.attribution === "object" && !Array.isArray(body.attribution) ? body.attribution : {}) as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = text(attr[k], 160).replace(/[^\x20-\x7e]/g, "").replace(/[<>]/g, "").trim();
    if (v) utm[k] = v;
  }
  const { source, attribution } = betaAttribution(req, utm);
  const pageRaw = text(body.page, 120);
  const page = /^\/season1\/beta(\/[a-z0-9/-]*)?$/.test(pageRaw) ? pageRaw : "/season1/beta/start";

  const db = (async (): Promise<{ completed: boolean } | null> => {
    if (!process.env.DATABASE_URL) return null;
    try {
      const rows = (await withTimeout(
        DB_TIMEOUT_MS,
        getSql().query(PROGRESS_SQL, [email, sessionId, stage, st.next, JSON.stringify(answers), source, JSON.stringify(attribution), page, keyIsLive()]) as Promise<Record<string, unknown>[]>,
      )) as Record<string, unknown>[];
      return rows[0] ? { completed: rows[0].completed === true } : null;
    } catch (err) {
      console.error("Beta progress database save failed:", err instanceof Error ? err.message : err);
      return null;
    }
  })();

  const kl = (async () => {
    try {
      const now = new Date().toISOString();
      const profile: Record<string, unknown> = { beta_wizard_stage: st.done, beta_wizard_next_step: st.next, beta_wizard_updated_at: now, beta_source: source };
      if (stage === 0) profile.beta_wizard_started_at = now;
      if (answers.playerName) profile.beta_player_name = answers.playerName;
      if (answers.playerAge) profile.beta_player_age = answers.playerAge;
      const r = await klaviyo("events", {
        data: {
          type: "event",
          attributes: {
            metric: { data: { type: "metric", attributes: { name: PROGRESS_METRIC } } },
            profile: { data: { type: "profile", attributes: { email, properties: profile } } },
            properties: {
              stage, step_done: st.done, next_step: st.next, next_step_number: st.nextStep, session: sessionId, source, page,
              player_name: answers.playerName ?? "", player_age: answers.playerAge ?? "", plays_on: answers.playsOn ?? [],
              team_sports: answers.teamSports ?? "", superpowers: answers.superpowers ?? [], fun_fact: answers.funFact ?? "",
              expectations: answers.expectations ?? [],
            },
            time: now,
            unique_id: `${email}-${PROGRESS_METRIC}-${sessionId}-${stage}`,
          },
        },
      }, EVENT_TIMEOUT_MS);
      if (!r.ok) console.error("Klaviyo beta progress event failed:", r.status);
    } catch (err) {
      console.error("Klaviyo beta progress event failed:", err instanceof Error ? err.name : "error");
    }
  })();

  await Promise.all([db, kl]);
  return ok();
}
