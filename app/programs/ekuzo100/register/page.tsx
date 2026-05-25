"use client";

// EKUZO100 REGISTER PAGE — rebuilt 2026-05-24 per the EKUZO100 redesign
// spec (marketing/ekuzo100-redesign/01-ekuzo100-spec.md). Structural twin
// of /programs/ekuzo-camps/register; the cohort unit is the only thing
// that differs (4-week month-anchored cohort vs camps' single week).
//
// Intentional drops from prior version:
//   • Cohort tile dropdown → month tabs + calendar visualization (Tue/Thu
//     lit up). Parent picks a month; the 8 session dates light up.
//   • Per-gamer "Schedule Preference" (afternoon/evening) → retired
//     entirely. Only one session time runs today (7-8:30 PM); the field
//     carried zero bits of information. When a second time slot is
//     earned back, we'll design the right shape then.
//   • Per-gamer gamerTag / preferredGames / gender / skillLevel /
//     tshirtSize UI → removed (mirrors camps v2). State retained as empty
//     defaults so the API contract / Stripe metadata schema / Sheets
//     columns stay intact.
//
// Intentional additions:
//   • Family-level "Prefer other days?" disclosure with Mon-Fri pills,
//     Tue/Thu pre-checked. Demand instrument for the deferred M/W cohort
//     (DAY_PATTERNS.mon-wed.enabled=false). Optional, never gates submit.
//   • Squad join via ?squad=TOKEN → pre-pin owner's cohort + banner +
//     warn-on-change (parallels camps' week+slot pre-pin).
//   • Email-blur → /api/ekuzo100/lead (deduped per email per session).
//   • Pre-PI → /api/ekuzo100/abandoned (fire-and-forget after register
//     API succeeds, before card entry).

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { trackInitiateCheckout } from "@/lib/analytics";
import { captureAttribution, getAttribution } from "@/lib/attribution";
import { getFbCookie } from "@/lib/fbCookies";
import { nanoid } from "nanoid";

// ── Stripe setup ────────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ── Types ────────────────────────────────────────────────────────────────────

type ParentInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

// State shape preserved from the prior version so the API contract /
// Stripe metadata serializer keeps working. UI-removed fields (gamerTag,
// preferredGames, gender, skillLevel, tshirtSize) stay as empty defaults
// and ship as "" / [] in the submit payload.
type GamerInfo = {
  firstName: string;
  lastName: string;
  gamerTag: string;
  birthday: string;
  gender: string;
  skillLevel: string;
  preferredGames: string[];
  tshirtSize: string;
};

type CohortOption = {
  value: string;       // "2026-06" — machine ID
  label: string;       // "Tuesdays & Thursdays · Jun 2 – Jun 25, 2026"
  monthLabel: string;  // "June 2026" — for the month tab/tile
  monthShort: string;  // "June" — for the tab label
  startDate: string;   // "Jun 2"
  endDate: string;     // "Jun 25"
  sessionDates: Date[]; // the 8 session Date objects
  monthIndex: number;
  year: number;
};

// ── Data ─────────────────────────────────────────────────────────────────────

const PRICE = 100;
const SESSION_TIME = "7:00 – 8:30 PM";

// Day-pattern config — capability lives in data, exposure is config.
// Today only Tue/Thu is enabled. When the "Prefer other days?" disclosure
// shows enough M/W demand, flip mon-wed.enabled and the picker renders
// a second pattern with no other code changes required.
const DAY_PATTERNS = [
  { id: "tue-thu", label: "Tue & Thu", days: [2, 4], enabled: true },
  { id: "mon-wed", label: "Mon & Wed", days: [1, 3], enabled: false },
] as const;

const ACTIVE_DAY_PATTERN = DAY_PATTERNS.find((p) => p.enabled)!;

// Mon-Fri pills for the "Prefer other days?" disclosure. Short labels
// (Mon/Tue/...) feed into preferredDays as a comma-separated string.
type PillDayValue = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
const PILL_DAYS: { value: PillDayValue; label: string; dayOfWeek: number }[] = [
  { value: "Mon", label: "Mon", dayOfWeek: 1 },
  { value: "Tue", label: "Tue", dayOfWeek: 2 },
  { value: "Wed", label: "Wed", dayOfWeek: 3 },
  { value: "Thu", label: "Thu", dayOfWeek: 4 },
  { value: "Fri", label: "Fri", dayOfWeek: 5 },
];

// Pre-checked defaults match the live day pattern. Pre-checking these
// makes the signal unambiguous: parent who UNCHECKS Tue/Thu and selects
// Mon/Wed is a hard conflict (manual follow-up flag); parent who just
// ADDS Friday is low concern.
const DEFAULT_PREFERRED_DAYS: string[] = ACTIVE_DAY_PATTERN.days
  .map((d) => PILL_DAYS.find((p) => p.dayOfWeek === d)?.value)
  .filter((v): v is PillDayValue => v !== undefined);

// ── Date helpers ────────────────────────────────────────────────────────────

// First Tuesday in the given month/year. If the 1st IS a Tue, returns the 1st.
function getFirstTuesday(monthIndex: number, year: number): Date {
  const firstDay = new Date(year, monthIndex, 1);
  const dayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, 2=Tue, ..., 6=Sat
  const offset = (2 - dayOfWeek + 7) % 7;
  return new Date(year, monthIndex, 1 + offset);
}

// Generate the 8 session dates for a cohort starting in this month. 4 full
// weeks of Tue/Thu starting from the month's first Tuesday. Per Jamie's
// 2026-05-24 call: allow overflow into the next month rather than
// truncating (cohorts are 4 weeks, not "capped at the month boundary").
function getCohortSessionDates(monthIndex: number, year: number): Date[] {
  const firstTue = getFirstTuesday(monthIndex, year);
  const dates: Date[] = [];
  for (let week = 0; week < 4; week++) {
    const tue = new Date(firstTue);
    tue.setDate(firstTue.getDate() + week * 7);
    const thu = new Date(firstTue);
    thu.setDate(firstTue.getDate() + week * 7 + 2);
    dates.push(tue, thu);
  }
  return dates;
}

function fmtShortDate(d: Date): string {
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`;
}

function buildCohortOption(monthIndex: number, year: number): CohortOption {
  const sessions = getCohortSessionDates(monthIndex, year);
  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  const monthShort = first.toLocaleString("en-US", { month: "long" });
  const monthLabel = `${monthShort} ${year}`;
  const value = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  // Self-contained schedule string — this is the value the confirmation
  // email shows ("you're booked for Tuesdays & Thursdays Jun 2 – Jun 25").
  // Per §6 revision of the cowork spec, cohort_label is what threads to
  // the email layer; no separate cohort_start/end fields are forwarded.
  const label = `Tuesdays & Thursdays · ${fmtShortDate(first)} – ${fmtShortDate(last)}, ${year}`;
  return {
    value,
    label,
    monthLabel,
    monthShort,
    startDate: fmtShortDate(first),
    endDate: fmtShortDate(last),
    sessionDates: sessions,
    monthIndex,
    year,
  };
}

// Next N cohorts whose first Tue is still in the future (with a small
// lead-time buffer so we don't list cohorts starting in 6 days).
const COHORT_LEAD_DAYS = 7;
function getAvailableCohorts(): CohortOption[] {
  const now = new Date();
  const buffer = new Date(now.getTime() + COHORT_LEAD_DAYS * 24 * 60 * 60 * 1000);
  const cohorts: CohortOption[] = [];
  for (let offset = 0; offset < 6 && cohorts.length < 3; offset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const cohort = buildCohortOption(
      monthDate.getMonth(),
      monthDate.getFullYear()
    );
    // Skip cohorts whose first session is already inside the lead window.
    if (cohort.sessionDates[0] >= buffer) {
      cohorts.push(cohort);
    }
  }
  return cohorts;
}

// Real-calendar helper, lifted from camps register page (pure date math,
// product-agnostic). Builds a 7-col Sun→Sat grid covering the full month
// plus trailing/leading days from adjacent months.
type CalendarCell = { date: number; isCurrentMonth: boolean; fullDate: Date };
function getMonthCalendarGrid(monthIndex: number, year: number): CalendarCell[][] {
  const startDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({
      date: prevMonthDays - i,
      isCurrentMonth: false,
      fullDate: new Date(year, monthIndex - 1, prevMonthDays - i),
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: d,
      isCurrentMonth: true,
      fullDate: new Date(year, monthIndex, d),
    });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: nextDay,
      isCurrentMonth: false,
      fullDate: new Date(year, monthIndex + 1, nextDay),
    });
    nextDay++;
  }
  const rows: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

// Returns true if `d` is one of the cohort's 8 session dates.
function isSessionDate(d: Date, sessions: Date[]): boolean {
  return sessions.some(
    (s) =>
      s.getFullYear() === d.getFullYear() &&
      s.getMonth() === d.getMonth() &&
      s.getDate() === d.getDate()
  );
}

// ── Form helpers ────────────────────────────────────────────────────────────

function emptyGamer(): GamerInfo {
  return {
    firstName: "",
    lastName: "",
    gamerTag: "",
    birthday: "",
    gender: "",
    skillLevel: "",
    preferredGames: [],
    tshirtSize: "",
  };
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getAgeAtStart(birthday: string, sessionStart?: Date): number | null {
  if (!birthday || !sessionStart) return null;
  const match = birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  if (year < 1900 || year > 2030) return null;
  const bday = new Date(year, parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  if (isNaN(bday.getTime())) return null;
  let age = sessionStart.getFullYear() - bday.getFullYear();
  const monthDiff = sessionStart.getMonth() - bday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && sessionStart.getDate() < bday.getDate())) {
    age--;
  }
  return age;
}

function getAgeNotice(birthday: string, sessionStart?: Date): string | null {
  const age = getAgeAtStart(birthday, sessionStart);
  if (age === null) return null;
  if (age < 10 || age > 18) {
    return 'The recommended age for EKUZO100 is 10–18. If your gamer is outside that range, please mention it in the "Additional Information" section below so we can plan accordingly.';
  }
  return null;
}

// ── Page Component ──────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Ekuzo100RegisterPage() {
  const [parent, setParent] = useState<ParentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [gamers, setGamers] = useState<GamerInfo[]>([emptyGamer()]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState<Array<{ key: string; message: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Squad-link state (friend arriving via ?squad=TOKEN) ─────────────
  // E100 squads pre-pin the owner's cohort_month (vs camps' week+slot).
  // Lookup returns owner_gamer_name + cohort_month + cohort_label when
  // product==="ekuzo100"; we render a banner and warn-on-change if the
  // joiner tries to pick a different cohort.
  const [joiningSquadToken, setJoiningSquadToken] = useState<string | null>(null);
  const [joiningCrewInfo, setJoiningCrewInfo] = useState<{
    owner_gamer_name: string;
    cohort_month: string;
    cohort_label: string;
  } | null>(null);
  const [crewOverrideAcknowledged, setCrewOverrideAcknowledged] = useState(false);

  // ── "Prefer other days?" disclosure ─────────────────────────────────
  // Family-level (one value per registration). preferredDays defaults to
  // the active pattern's days so an untouched submission means "Tue/Thu
  // is fine." Unchecking Tue/Thu and selecting Mon/Wed is a hard signal.
  const [preferredDays, setPreferredDays] = useState<string[]>([
    ...DEFAULT_PREFERRED_DAYS,
  ]);
  const [preferredDaysExpanded, setPreferredDaysExpanded] = useState(false);
  const [preferredDaysTouched, setPreferredDaysTouched] = useState(false);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // CTA source — landing-page placement that brought the visitor here.
  // Same pattern as camps; threaded through register POST → Stripe
  // metadata → Beehiiv. Allow-listed (hero/sticky/footer); anything
  // else is dropped so garbage query params don't pollute analytics.
  const [ctaSource, setCtaSource] = useState<string>("");

  // Email-lead capture gate — tracks the last email POSTed to /lead so
  // re-blurring doesn't spam Beehiiv. Comparison is lowercased + trimmed
  // to match server-side normalization.
  const leadFiredForEmailRef = useRef<string>("");

  // Cohorts memoized — computed once per mount (date-of-mount), not on
  // every render. Won't refresh while the user is on the page; that's
  // intentional (no time-travel mid-form).
  const cohortsRef = useRef<CohortOption[] | null>(null);
  if (cohortsRef.current === null) {
    cohortsRef.current = getAvailableCohorts();
  }
  const cohorts = cohortsRef.current;

  const selectedCohortData = cohorts.find((c) => c.value === selectedCohort);

  // ── First-touch UTM + cta capture ───────────────────────────────────
  useEffect(() => {
    captureAttribution();
    if (typeof window !== "undefined") {
      const cta = new URLSearchParams(window.location.search).get("cta") || "";
      if (cta === "hero" || cta === "sticky" || cta === "footer") {
        setCtaSource(cta);
      }
    }
  }, []);

  // ── Squad owner lookup on mount if ?squad=TOKEN ─────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("squad");
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/squad/${encodeURIComponent(token)}`);
        if (cancelled) return;
        if (!res.ok) {
          // 404 / expired / bad token → hand off to /squad/[token],
          // which renders the terminal-state copy.
          window.location.href = `/squad/${encodeURIComponent(token)}`;
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        // E100 join requires product==="ekuzo100" + cohort_month.
        // A camps token landing here is a mismatch; drop the squad
        // param silently rather than redirecting (camps-shaped error
        // pages don't apply here).
        if (data.product !== "ekuzo100" || !data.cohort_month) {
          return;
        }

        setJoiningSquadToken(token);
        setJoiningCrewInfo({
          owner_gamer_name: data.owner_gamer_name,
          cohort_month: data.cohort_month,
          cohort_label: data.cohort_label || "",
        });

        // Pre-select the crew's cohort if it's still in our available
        // list (it might not be if the cohort start date is past the
        // lead window — in which case the join silently falls back
        // to the regular picker).
        if (cohorts.some((c) => c.value === data.cohort_month)) {
          setSelectedCohort(data.cohort_month);
        }
      } catch {
        if (cancelled) return;
        window.location.href = `/squad/${encodeURIComponent(token)}`;
      }
    })();

    return () => {
      cancelled = true;
    };
    // cohorts is stable across renders (memoized via ref); deps left empty
    // intentionally so the lookup runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Gamer management ────────────────────────────────────────────────────

  function gamerLabel(i: number): string {
    const name = gamers[i]?.firstName.trim() ?? "";
    if (gamers.length <= 1) return name || "Gamer";
    return name ? `Gamer ${i + 1}: ${name}` : `Gamer ${i + 1}`;
  }

  function updateGamer(index: number, updates: Partial<GamerInfo>) {
    setGamers((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  }

  function addGamer() {
    if (gamers.length >= 5) return;
    setGamers((prev) => [...prev, emptyGamer()]);
  }

  function removeGamer(index: number) {
    if (gamers.length <= 1) return;
    setGamers((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Cohort selection with squad-join warn ───────────────────────────
  function selectCohort(value: string) {
    if (
      joiningSquadToken &&
      joiningCrewInfo &&
      !crewOverrideAcknowledged &&
      value !== joiningCrewInfo.cohort_month
    ) {
      const ok = window.confirm(
        `You're joining ${joiningCrewInfo.owner_gamer_name}'s cohort in ${joiningCrewInfo.cohort_label}. Changing this means you won't be in the same cohort. Continue?`
      );
      if (!ok) return;
      setCrewOverrideAcknowledged(true);
    }
    setSelectedCohort(value);
  }

  // ── "Prefer other days?" pill toggle ────────────────────────────────
  function togglePreferredDay(value: string) {
    if (!preferredDaysTouched) setPreferredDaysTouched(true);
    setPreferredDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  // ── Email lead capture (onBlur) ─────────────────────────────────────
  function handleEmailBlur() {
    const email = parent.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return;
    if (leadFiredForEmailRef.current === email) return;
    leadFiredForEmailRef.current = email;
    fetch("/api/ekuzo100/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {
      leadFiredForEmailRef.current = "";
    });
  }

  // ── Validation ──────────────────────────────────────────────────────
  function validate(): Array<{ key: string; message: string }> {
    const errs: Array<{ key: string; message: string }> = [];
    if (!parent.firstName.trim())
      errs.push({ key: "parent.firstName", message: "Parent first name is required." });
    if (!parent.lastName.trim())
      errs.push({ key: "parent.lastName", message: "Parent last name is required." });
    if (!parent.email.trim())
      errs.push({ key: "parent.email", message: "Parent email is required." });
    if (!parent.phone.trim())
      errs.push({ key: "parent.phone", message: "Parent phone number is required." });

    gamers.forEach((g, i) => {
      const label = gamers.length > 1 ? `Gamer ${i + 1}` : "Gamer";
      if (!g.firstName.trim())
        errs.push({ key: `gamer-${i}.firstName`, message: `${label} first name is required.` });
      if (!g.birthday)
        errs.push({ key: `gamer-${i}.birthday`, message: `${label} birthday is required.` });
    });

    if (!selectedCohort)
      errs.push({ key: "cohort", message: "Please select a cohort month." });

    return errs;
  }

  // ── Submit ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      const firstKey = errs[0].key;
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(`[data-error-key="${firstKey}"]`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.focus({ preventScroll: true });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    // Squad tokens — every non-joining registration mints a fresh
    // squad_token (10-char nanoid). Joiners inherit the owner's token
    // via joining_squad_token and never mint a new one — that's how
    // the crew stays one coherent group as it grows (matches camps).
    const squadTokenForSubmit = joiningSquadToken ? null : nanoid(10);

    const attribution = getAttribution();
    const fbc = getFbCookie("_fbc");
    const fbp = getFbCookie("_fbp");

    const cohortPayload = selectedCohortData
      ? {
          value: selectedCohortData.value,
          label: selectedCohortData.label,
          startDate: selectedCohortData.startDate,
          endDate: selectedCohortData.endDate,
        }
      : { value: selectedCohort, label: "", startDate: "", endDate: "" };

    const payload = {
      parent,
      gamers,
      cohort: cohortPayload,
      preferredDays,
      additionalInfo,
      totalPrice: PRICE * gamers.length,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      squad_token: squadTokenForSubmit,
      joining_squad_token: joiningSquadToken,
      attribution,
      cta_source: ctaSource,
      fbc,
      fbp,
    };

    try {
      const res = await fetch("/api/ekuzo100/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors([{ key: "_api", message: data.error || "Something went wrong. Please try again." }]);
        setIsSubmitting(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setShowPayment(true);

      // Abandoned-cart capture — fires AFTER register API succeeds and
      // BEFORE the parent enters card details. Fire-and-forget; failures
      // never block payment. Same pattern as camps.
      const firstGamer = gamers[0];
      fetch("/api/ekuzo100/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parent.email,
          parent_first_name: parent.firstName,
          parent_last_name: parent.lastName,
          gamer_first_name: firstGamer?.firstName || "",
          cohort_label: cohortPayload.label,
        }),
      }).catch(() => {});

      trackInitiateCheckout({ program: "ekuzo100", value: PRICE * gamers.length });
      setIsSubmitting(false);

      setTimeout(() => {
        document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setErrors([{ key: "_api", message: "Something went wrong. Please try again." }]);
      setIsSubmitting(false);
    }
  }

  // ── Computed ────────────────────────────────────────────────────────
  const gamerCount = gamers.length;
  const totalPrice = PRICE * gamerCount;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <>
      <Nav variant="light" />

      {/* ── Hero ──────────────────────────────────────────────────────
          Lifted from /programs/ekuzo-camps/register hero shape so cold
          paid traffic lands in the same compact pattern (Eyebrow + tight
          H1 + 1-line body, then form). Color swap from camps' purple to
          e100's orange + neon yellow per Jamie 2026-05-25 — keeps the
          radial-gradient glow + torn-paper transition; same effects. */}
      <section
        className="relative"
        style={{
          overflow: "clip",
          // Diagonal: warm golden glow upper-left, deep red-orange bloom
          // bottom-right. Vibrant orange base.
          background:
            "radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255, 220, 120, 0.80), transparent 60%), radial-gradient(ellipse 80% 70% at 100% 100%, rgba(180, 50, 0, 0.85), transparent 60%), #FF6B1A",
        }}
      >
        <div
          className="max-w-[1232px] mx-auto px-6 sm:px-10"
          style={{
            paddingTop: "48px",
            paddingBottom: "clamp(60px, 9vw, 130px)",
          }}
        >
          <div className="flex flex-col gap-3" style={{ maxWidth: "720px" }}>
            <Eyebrow variant="light">League of Legends</Eyebrow>

            <h1
              className="font-display uppercase"
              style={{ fontSize: "clamp(3.5rem, 6.5vw, 6.5rem)", lineHeight: "0.85" }}
            >
              <span style={{ color: "#ffffff" }}>EKUZO</span>
              <span style={{ color: "#E0FF4F" }}>100</span>
            </h1>

            <p
              className="font-body text-white leading-relaxed mt-2"
              style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", maxWidth: "640px" }}
            >
              4 weeks of elite coaching. Learn how to play, compete, and work as a team. Sessions Tuesdays &amp; Thursdays, {SESSION_TIME} local.
            </p>
          </div>
        </div>

        {/* White torn paper overlay — flush with the bottom of the hero,
            tear edge at the top, solid white at the bottom meeting the
            form section seamlessly. -bottom-px absorbs a subpixel seam. */}
        <div className="absolute -bottom-px left-0 right-0 z-20 pointer-events-none">
          <Image
            src="/images/new%20torn%20paper/torn-paper-white-top-2@2x.png"
            alt=""
            width={4320}
            height={600}
            className="w-full h-auto block"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ── Form body ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-6 md:pt-10 pb-16 md:pb-24">
          {/* Two-column layout on lg+ — main form on the left, sticky
              checkout summary on the right. Mobile (and tablet < lg)
              collapses to single column with the existing inline Summary
              block at the bottom of the form (marked lg:hidden so it
              doesn't double up against the sticky aside). Mirrors the
              camps register layout. min-w-0 on the left column prevents
              long form content from stretching the grid track. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:gap-16">
            <div className="min-w-0">

          {/* Squad-join banner */}
          {joiningCrewInfo && (
            <div className="mb-8 bg-red text-white px-6 py-5 rounded-lg">
              <p
                className="font-display uppercase leading-[0.9]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                You&apos;ve been invited to join {joiningCrewInfo.owner_gamer_name}&apos;s cohort
              </p>
              <p
                className="font-body mt-2"
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "24px" }}
              >
                EKUZO100, {joiningCrewInfo.cohort_label}. We&apos;ve pre-selected
                this cohort for you below.
              </p>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-8 p-5 bg-red/10 border border-red/30 rounded-sm"
            >
              {errors.map((e, i) => (
                <p key={i} className="font-body text-red text-sm mb-1 last:mb-0">
                  {e.message}
                </p>
              ))}
            </div>
          )}

          {/* ── Parent Info (top of form) ────────────────────────── */}
          <div className="mb-12">
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-8"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Parent Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <InputField
                label="Parent first name *"
                required
                errorKey="parent.firstName"
                value={parent.firstName}
                onChange={(v) => setParent((p) => ({ ...p, firstName: v }))}
                placeholder="Enter first name"
              />
              <InputField
                label="Parent last name *"
                required
                errorKey="parent.lastName"
                value={parent.lastName}
                onChange={(v) => setParent((p) => ({ ...p, lastName: v }))}
                placeholder="Enter last name"
              />
              <InputField
                label="Email *"
                type="email"
                required
                errorKey="parent.email"
                value={parent.email}
                onChange={(v) => setParent((p) => ({ ...p, email: v }))}
                onBlur={handleEmailBlur}
                placeholder="your.email@example.com"
              />
              <InputField
                label="Phone number *"
                type="tel"
                errorKey="parent.phone"
                value={parent.phone}
                onChange={(v) =>
                  setParent((p) => ({ ...p, phone: formatPhone(v) }))
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* ── Per-gamer sections (minimal: name + birthday) ───── */}
          {gamers.map((gamer, gi) => (
            <div key={gi} className="mb-12 last:mb-0">
              {gamers.length > 1 && (
                <div className="flex items-center justify-between mb-8">
                  <h2
                    className="font-display uppercase text-black"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    Gamer {gi + 1}
                  </h2>
                  <button
                    type="button"
                    onClick={() => removeGamer(gi)}
                    className="font-body text-sm text-red hover:underline hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="mb-8" style={{ scrollMarginTop: "100px" }}>
                <h3
                  className="font-display uppercase text-black leading-[0.85] mb-6"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                >
                  Gamer {gamers.length > 1 ? `${gi + 1} ` : ""}Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                  <InputField
                    label="First name *"
                    required
                    errorKey={`gamer-${gi}.firstName`}
                    value={gamer.firstName}
                    onChange={(v) => updateGamer(gi, { firstName: v })}
                    placeholder="Enter first name"
                  />
                  {/* Gamer last name dropped 2026-05-25 to mirror camps —
                      keeps the form short before the cohort picker. State
                      retained as "" in emptyGamer() so the API payload
                      shape stays stable; webhook assumes gamer shares
                      parent's surname for fulfillment ops. */}
                  <InputField
                    label="Birthday *"
                    type="date"
                    errorKey={`gamer-${gi}.birthday`}
                    value={gamer.birthday}
                    onChange={(v) => updateGamer(gi, { birthday: v })}
                    hint={
                      gamer.birthday && selectedCohortData
                        ? getAgeNotice(
                            gamer.birthday,
                            selectedCohortData.sessionDates[0]
                          )
                        : null
                    }
                  />
                </div>
              </div>

              {gi < gamers.length - 1 && (
                <hr className="border-t-2 border-black/10 my-10" />
              )}
            </div>
          ))}

          {/* Add another gamer */}
          {gamers.length < 5 && (
            <button
              type="button"
              onClick={addGamer}
              className="w-full py-4 border-2 border-dashed border-black/20 rounded-sm font-body font-semibold text-black/50 hover:border-red/40 hover:text-red/70 hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 cursor-pointer mb-12"
            >
              + Add another gamer
            </button>
          )}

          {/* ── Cohort picker (month tabs + calendar visualization) ─ */}
          <div className="mb-10">
            <h2
              className="font-display uppercase text-black leading-[0.85]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Choose your cohort
            </h2>
            <p
              className="font-body text-[#4b5563] mt-6"
              style={{
                fontSize: "clamp(0.875rem, 1.2vw, 16px)",
                lineHeight: "28px",
              }}
            >
              EKUZO100 is 4 weeks of Tuesday &amp; Thursday sessions, {SESSION_TIME} local. Pick a month: your 8 session dates will light up below.
            </p>

            <div
              className="mt-8 max-w-md bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#f0f0f2] px-5 py-5"
              data-error-key="cohort"
              tabIndex={-1}
              style={{ scrollMarginTop: "100px" }}
            >
              {/* Month tabs */}
              <div
                className={`grid gap-1.5 mb-4 ${
                  cohorts.length === 1
                    ? "grid-cols-1"
                    : cohorts.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {cohorts.map((c) => {
                  const isActive = selectedCohort === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => selectCohort(c.value)}
                      aria-pressed={isActive}
                      className={`py-2 rounded-md border font-body font-bold transition-colors cursor-pointer active:scale-[0.98] ${
                        isActive
                          ? "bg-[#FF6B1A] border-[#FF6B1A] text-white"
                          : "bg-white border-[#e5e7eb] text-[#0a0a0a] hover:bg-[#f9fafb]"
                      }`}
                      style={{ fontSize: "13px" }}
                    >
                      {c.monthShort}
                    </button>
                  );
                })}
                {cohorts.length === 0 && (
                  <p className="font-body text-sm text-[#6b7280] py-2 text-center">
                    No cohorts open right now — check back soon.
                  </p>
                )}
              </div>

              {/* Calendar grid — renders for the selected cohort.
                  Read-only visualization of the 8 session dates;
                  selection happens at the tab level above. */}
              {selectedCohortData && (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <span
                      className="font-display uppercase text-[#0a0a0a]"
                      style={{
                        fontSize: "clamp(32px, 4.5vw, 42px)",
                        lineHeight: "1",
                      }}
                    >
                      {selectedCohortData.monthLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 mb-1.5">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <span
                        key={d}
                        className="text-center font-body font-medium text-[#9ca3af] pb-1"
                        style={{ fontSize: "11px", lineHeight: "1.5" }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {getMonthCalendarGrid(
                      selectedCohortData.monthIndex,
                      selectedCohortData.year
                    )
                      .flat()
                      .map((cell, idx) => {
                        const isSession = isSessionDate(
                          cell.fullDate,
                          selectedCohortData.sessionDates
                        );
                        if (!cell.isCurrentMonth) {
                          // Render adjacent-month days as muted IF they
                          // happen to carry a session (cohort overflow),
                          // otherwise blank.
                          if (isSession) {
                            return (
                              <div
                                key={idx}
                                className="aspect-square flex items-center justify-center rounded-md bg-[#FF6B1A]/80 border border-[#FF6B1A]/80 text-white"
                                aria-label={`Session date: ${cell.fullDate.toLocaleDateString()}`}
                              >
                                <span
                                  className="font-body font-bold"
                                  style={{ fontSize: "13px" }}
                                >
                                  {cell.date}
                                </span>
                              </div>
                            );
                          }
                          return <div key={idx} className="aspect-square" />;
                        }
                        if (isSession) {
                          return (
                            <div
                              key={idx}
                              className="aspect-square flex items-center justify-center rounded-md bg-[#FF6B1A] border border-[#FF6B1A] text-white"
                              aria-label={`Session date: ${cell.fullDate.toLocaleDateString()}`}
                            >
                              <span
                                className="font-body font-bold"
                                style={{ fontSize: "13px" }}
                              >
                                {cell.date}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={idx}
                            aria-disabled="true"
                            className="aspect-square flex items-center justify-center rounded-md border border-[#f0f0f2] bg-[#fafafa]"
                          >
                            <span
                              className="font-body font-bold text-[#d1d5db]"
                              style={{ fontSize: "13px" }}
                            >
                              {cell.date}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Selection summary bar */}
                  <div className="mt-5 bg-[#FF6B1A]/5 border border-[#FF6B1A]/20 rounded-lg px-4 py-3">
                    <span
                      className="block font-display uppercase text-black"
                      style={{
                        fontSize: "clamp(20px, 2.8vw, 26px)",
                        lineHeight: "1.1",
                      }}
                    >
                      {selectedCohortData.startDate} – {selectedCohortData.endDate}
                    </span>
                    <span
                      className="block font-body font-bold mt-1.5"
                      style={{ fontSize: "13px", lineHeight: "1.2", color: "#FF6B1A" }}
                    >
                      Tuesdays &amp; Thursdays · {SESSION_TIME}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ── "Prefer other days?" disclosure ──────────────────
                Collapsed by default — ~90% who are fine with Tue/Thu
                never see it. Optional, never gates submit; pure demand
                capture for the deferred M/W cohort. */}
            <div className="mt-6 max-w-md">
              {!preferredDaysExpanded ? (
                <button
                  type="button"
                  onClick={() => setPreferredDaysExpanded(true)}
                  className="font-body text-sm text-[#6b7280] hover:text-red hover:underline cursor-pointer transition-colors"
                >
                  Prefer other days?
                </button>
              ) : (
                <div className="border border-[#e5e7eb] rounded-lg px-4 py-4 bg-[#fafafa]">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className="font-body font-bold text-[#0a0a0a]"
                      style={{ fontSize: "14px", lineHeight: "20px" }}
                    >
                      Which days work for your family?
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreferredDaysExpanded(false)}
                      className="font-body text-xs text-[#6b7280] hover:text-[#0a0a0a] cursor-pointer"
                      aria-label="Collapse preferred days"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PILL_DAYS.map((p) => {
                      const checked = preferredDays.includes(p.value);
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => togglePreferredDay(p.value)}
                          aria-pressed={checked}
                          className={`px-4 py-2 rounded-full border font-body font-bold text-sm transition-colors cursor-pointer active:scale-[0.97] ${
                            checked
                              ? "bg-[#FF6B1A] border-[#FF6B1A] text-white"
                              : "bg-white border-[#e5e7eb] text-[#0a0a0a] hover:border-[#FF6B1A]/40"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  {preferredDaysTouched && (
                    <p
                      className="font-body text-[#374151] mt-2"
                      style={{ fontSize: "13px", lineHeight: "20px" }}
                    >
                      You&apos;re enrolled in the Tuesday/Thursday cohort for now — that&apos;s the schedule we run today. Tell us what you&apos;d prefer and we&apos;ll open new day options as more families ask, then reach out if one fits.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Additional info ──────────────────────────────────── */}
          <div className="mb-12">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-6"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              Additional information
            </h3>
            <label
              className="font-body font-bold text-[#374151] block mb-2"
              style={{ fontSize: "14px", lineHeight: "20px" }}
            >
              Anything special we should know about?
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value.slice(0, 1500))}
              rows={4}
              maxLength={1500}
              placeholder="Tell us more."
              className="font-body text-[#0a0a0a] w-full bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 outline-none focus:border-[#0a0a0a] transition-colors resize-y"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            />
            <p className="font-body text-sm text-[#9ca3af] mt-1 text-right">
              {additionalInfo.length}/1500
            </p>
          </div>

          {/* ── Summary (mobile/tablet only on lg-) ──────────────────
              On lg+ the sticky sidebar takes over — see the <aside> at
              the bottom of this section. Mobile users still need an
              inline summary so they see the per-gamer breakdown and the
              total before the Continue button. */}
          <div className="mb-8 border border-[#e5e7eb] rounded-sm overflow-hidden lg:hidden">
            <div className="bg-[#f5f5f7] px-6 py-4 border-b border-[#e5e7eb]">
              <h3
                className="font-display uppercase text-[#0a0a0a]"
                style={{
                  fontSize: "clamp(1.25rem, 2vw, 28px)",
                  lineHeight: "32px",
                }}
              >
                Registration Summary
              </h3>
            </div>

            <div className="px-6 py-5">
              {!selectedCohortData ? (
                <p className="font-body text-[#9ca3af] text-sm">
                  Pick a cohort month above to see your summary.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
                    <div className="flex flex-col gap-1">
                      <span className="font-body font-bold text-[#0a0a0a] text-sm">
                        {selectedCohortData.monthLabel} Cohort
                      </span>
                      <span className="font-body text-[#6b7280] text-sm">
                        {selectedCohortData.startDate} – {selectedCohortData.endDate} · Tue &amp; Thu · {SESSION_TIME}
                      </span>
                    </div>
                    <span className="font-body text-[#6b7280] text-sm">
                      ${PRICE}/gamer
                    </span>
                  </div>

                  {gamers.map((g, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-body font-bold text-[#0a0a0a] text-sm">
                          {gamerLabel(i)}
                        </span>
                        <span className="font-body text-[#6b7280] text-sm">
                          EKUZO100 · {selectedCohortData.monthLabel}
                        </span>
                      </div>
                      <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap">
                        ${PRICE}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-1 pt-4 border-t border-[#e5e7eb]">
                    <span
                      className="font-body font-bold text-[#0a0a0a]"
                      style={{ fontSize: "16px" }}
                    >
                      Total
                    </span>
                    <span
                      className="font-display text-[#0a0a0a]"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
                    >
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── What happens after you click pay (NEW) ───────────
              Kills the post-purchase black box. Three-step preview
              between Summary and CTA: immediate receipt → welcome
              email + cohort details → meet coach + team week before
              the cohort starts. Visible to all viewport sizes;
              horizontal flow on sm+, stacked on xs. Lifted from
              camps register. */}
          {!showPayment && (
            <div className="mb-8">
              <h3 className="font-body font-bold text-[#0a0a0a] mb-4" style={{ fontSize: "16px", lineHeight: "24px" }}>
                What happens after you click pay
              </h3>
              <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    step: "1",
                    title: "Right away",
                    desc: "Confirmation + payment receipt land in your inbox.",
                  },
                  {
                    step: "2",
                    title: "Within 24 hours",
                    desc: "Welcome email with cohort details and everything you need to get ready to play.",
                  },
                  {
                    step: "3",
                    title: "Week before the cohort starts",
                    desc: "Meet your coach and get introduced to the rest of your team.",
                  },
                ].map((s) => (
                  <li
                    key={s.step}
                    className="bg-[#fafafa] border border-[#e5e7eb] rounded-sm px-4 py-4 flex gap-3 items-start"
                  >
                    <span
                      className="shrink-0 w-7 h-7 rounded-full bg-red text-white font-body font-bold flex items-center justify-center text-sm"
                      aria-hidden="true"
                    >
                      {s.step}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-body font-bold text-[#0a0a0a] text-sm leading-tight">
                        {s.title}
                      </span>
                      <span className="font-body text-[#6b7280] text-xs leading-snug">
                        {s.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* ── CTA / Payment ─────────────────────────────────────── */}
          {!showPayment ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCohort}
                className="w-full font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                style={{
                  fontSize: "18px",
                  lineHeight: "28px",
                  padding: "20px",
                }}
              >
                {isSubmitting
                  ? "Setting up payment..."
                  : `Continue to payment — $${totalPrice}`}
              </button>

              {/* Reassurance row — three trust signals under the CTA,
                  parallel to camps' refund/conduct/Stripe strip. ToS link
                  demoted to a sub-line below. */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {[
                  {
                    label: "Full refund 14+ days out",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M7 4.5V7L8.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    label: "Code of Conduct enforced",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M7 1.5L11.5 3.5V7C11.5 9.5 9.5 11.5 7 12C4.5 11.5 2.5 9.5 2.5 7V3.5L7 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        <path d="M5 7L6.5 8.5L9 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                  },
                  {
                    label: "Secured by Stripe",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <rect x="2" y="4.5" width="10" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M4 4.5V3.5A2.5 2.5 0 0 1 9.5 3.5V4.5" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 text-[#6b7280]">
                    {item.icon}
                    <span className="font-body text-xs leading-tight">{item.label}</span>
                  </span>
                ))}
              </div>

              <p className="font-body text-black/40 text-center mt-3" style={{ fontSize: "clamp(0.7rem, 1vw, 0.75rem)" }}>
                By registering you agree to our{" "}
                <a href="/terms-of-service" className="underline hover:text-black/60">
                  Terms of Service
                </a>
                .
              </p>
            </>
          ) : clientSecret ? (
            <div id="payment-section" className="mt-8">
              <div className="border border-[#e5e7eb] rounded-sm overflow-hidden">
                <div className="bg-[#0a0a0a] px-6 py-4">
                  <h3
                    className="font-display uppercase text-white"
                    style={{
                      fontSize: "clamp(1.25rem, 2vw, 28px)",
                      lineHeight: "32px",
                    }}
                  >
                    Payment
                  </h3>
                </div>

                <div className="px-6 py-6">
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#ed2024",
                          fontFamily: "Inter, system-ui, sans-serif",
                          borderRadius: "4px",
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      totalPrice={totalPrice}
                      paymentIntentId={paymentIntentId}
                      parentEmail={parent.email}
                    />
                  </Elements>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPayment(false);
                  setClientSecret(null);
                  setPaymentIntentId(null);
                }}
                className="w-full mt-4 font-body text-sm text-black/50 hover:text-black/70 cursor-pointer transition-colors"
              >
                &larr; Go back and edit registration
              </button>
            </div>
          ) : null}

            </div>{/* end left column (form) */}

            {/* ── Sticky checkout summary sidebar (lg+ only) ──────────
                Persistent right-rail panel showing real-time price,
                cohort dates, and what's-included while the user scrolls
                the form. Mirror of the inline mobile Summary above —
                same selectedCohortData + totalPrice. Hidden below lg
                where the inline mobile summary takes over. Sticky
                top-24 accounts for the fixed nav. */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 flex flex-col gap-4">
                <div className="border border-[#e5e7eb] rounded-sm overflow-hidden bg-white">
                  <div className="bg-[#0a0a0a] px-5 py-5">
                    <h3
                      className="font-display uppercase text-white"
                      style={{ fontSize: "clamp(1.75rem, 2.4vw, 2.25rem)", lineHeight: "1" }}
                    >
                      Your registration
                    </h3>
                  </div>

                  <div className="px-5 py-5">
                    {!selectedCohortData ? (
                      <p className="font-body text-[#9ca3af] text-sm leading-relaxed">
                        Pick a cohort month to see your total.
                      </p>
                    ) : (
                      <>
                        <ul className="flex flex-col gap-3 mb-4">
                          {gamers.map((g, i) => (
                            <li
                              key={i}
                              className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f0f0] last:border-0 last:pb-0"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-body font-bold text-[#0a0a0a] text-xs leading-tight truncate">
                                  {gamerLabel(i)}
                                </span>
                                <span className="font-body text-[#6b7280] text-xs leading-snug">
                                  {selectedCohortData.startDate} – {selectedCohortData.endDate}
                                </span>
                                <span className="font-body text-[#6b7280] text-xs leading-snug">
                                  Tue &amp; Thu · {SESSION_TIME}
                                </span>
                              </div>
                              <span className="font-body font-bold text-[#0a0a0a] text-xs whitespace-nowrap">
                                ${PRICE}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-baseline justify-between pt-3 border-t border-[#e5e7eb]">
                          <span className="font-body font-bold text-[#0a0a0a] text-sm">
                            Total
                          </span>
                          <span className="font-display text-[#0a0a0a]" style={{ fontSize: "clamp(1.5rem, 1.8vw, 1.875rem)", lineHeight: 1 }}>
                            ${totalPrice}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* What's included card */}
                <div className="border border-[#e5e7eb] rounded-sm bg-[#fafafa] px-5 py-5">
                  <p className="font-body font-bold text-[#0a0a0a] text-xs uppercase tracking-wider mb-3">
                    What you get
                  </p>
                  <ul className="flex flex-col gap-2">
                    {[
                      "12 hours of live pro coaching",
                      "Hand-picked 5-player team",
                      "Private moderated team chat",
                      "Real match play and tournaments",
                      "Team stays open post-cohort",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-[3px]" style={{ color: "#FF6B1A" }} aria-hidden="true">
                          <path d="M2 7L5.5 10L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-body text-[#374151] text-xs leading-snug">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

          </div>{/* end 2-col grid */}
        </div>
      </section>

      <Footer hideTornPaper />
    </>
  );
}

// ── Stripe Checkout Form ────────────────────────────────────────────────────

function CheckoutForm({
  totalPrice,
  paymentIntentId,
  parentEmail,
}: {
  totalPrice: number;
  paymentIntentId: string | null;
  parentEmail: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError(null);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${siteUrl}/programs/ekuzo100/success?payment_intent=${paymentIntentId}`,
        receipt_email: parentEmail,
      },
    });

    if (error) {
      setPaymentError(
        error.type === "card_error" || error.type === "validation_error"
          ? error.message || "Payment failed. Please try again."
          : "An unexpected error occurred. Please try again."
      );
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handlePayment}>
      <PaymentElement
        onReady={() => setIsReady(true)}
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />

      {paymentError && (
        <div className="mt-4 p-4 bg-red/10 border border-red/30 rounded-sm">
          <p className="font-body text-red text-sm">{paymentError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !isReady}
        className="w-full mt-6 font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
        style={{ fontSize: "18px", lineHeight: "28px", padding: "20px" }}
      >
        {isProcessing ? "Processing payment..." : `Pay $${totalPrice}`}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-black/30"
        >
          <path
            d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12.5c-3.03 0-5.5-2.47-5.5-5.5S4.97 2.5 8 2.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z"
            fill="currentColor"
          />
          <path d="M7 7h2v5H7V7zm0-3h2v2H7V4z" fill="currentColor" />
        </svg>
        <p className="font-body text-black/40 text-sm">
          Secured by Stripe. Your payment info never touches our servers.
        </p>
      </div>
    </form>
  );
}

// ── Reusable sub-components ─────────────────────────────────────────────────

function InputField({
  label,
  required,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  hint,
  errorKey,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  hint?: string | null;
  errorKey?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2"
      style={errorKey ? { scrollMarginTop: "100px" } : undefined}
    >
      <label
        htmlFor={errorKey}
        className="font-body font-bold text-[#374151]"
        style={{ fontSize: "14px", lineHeight: "20px" }}
      >
        {label}
      </label>
      <input
        id={errorKey}
        data-error-key={errorKey}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="font-body text-[#0a0a0a] bg-[#f9fafb] border border-[#e5e7eb] rounded p-[17px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#9ca3af]"
        style={{ fontSize: "16px", lineHeight: "normal" }}
      />
      {hint && (
        <p className="font-body text-[#c2410c] text-xs leading-4">{hint}</p>
      )}
    </div>
  );
}
