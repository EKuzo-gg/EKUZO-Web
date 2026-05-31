"use client";

// CAMPS REGISTER PAGE — formerly the "v2" variant; promoted to the
// canonical /programs/ekuzo-camps/register route 2026-05-19 (overwrote
// prior v1). Metadata (noindex, canonical to itself) lives in the
// sibling layout.tsx.
//
// Form logic, validation, Stripe Elements integration, lead-capture POST,
// abandoned-cart POST, analytics, attribution capture, fb cookies, and
// submission URLs match the API contract Jamie set up — no API changes
// required. The cta_source query param (?cta=hero|sticky|footer) still
// threads through to Beehiiv via Stripe metadata.
//
// Intentional drops from prior v1 (confirmed with Aaron 2026-05-19):
//   • AM/PM slot choice → PM only (all camps run 1pm-4pm).
//   • Gamer last name field → removed (state field kept as "" default
//     so backend payload stays stable; assume gamer shares parent's
//     surname for fulfillment ops).
//   • Team Status "Building / Looking" fork → silent default of
//     "looking"; squad formation now handled by the post-purchase
//     squad-code link on the success page.
//   • Coach reminder card → removed (coach credibility lives on LP +
//     success page).
//   • Trust strip below hero → removed (same trust info still in the
//     desktop right-rail summary).
//   • Cards-style week picker → removed; Calendar picker is the only
//     view. Shared across all gamers (one week + PM for the whole
//     registration).

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import TornPaperDivider from "@/components/ui/TornPaperDivider";
import { trackInitiateCheckout } from "@/lib/analytics";
import TrackPageView from "@/components/analytics/TrackPageView";
import { getAttribution } from "@/lib/attribution";
import { getFbCookie } from "@/lib/fbCookies";
import { nanoid } from "nanoid";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import InputField from "@/components/register/InputField";
import RegisterHero from "@/components/register/RegisterHero";
import ErrorSummary from "@/components/register/ErrorSummary";
import ParentInfoSection from "@/components/register/ParentInfoSection";
import PostPaymentSteps from "@/components/register/PostPaymentSteps";
import ReassuranceRow from "@/components/register/ReassuranceRow";
import PaymentStep from "@/components/register/PaymentStep";

// ── Types ────────────────────────────────────────────────────────────────────


type Week = {
  number: number;
  label: string;
  dates: string;
  price: number;
  originalPrice?: number;
};

type GamerInfo = {
  firstName: string;
  lastName: string;
  gamerTag: string;
  preferredGames: string[];
  birthday: string;
  skillLevel: string;
  gender: string;
  selectedWeek: number | null;
  selectedSlot: "AM" | "PM" | null;
};

type ParentInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

// Squad vibe check — family-level, one answer per registration
type SquadStatus = "building" | "looking" | null;

// ── Data ─────────────────────────────────────────────────────────────────────

// v2: AM slot offering dropped per Aaron — simplifies the decision down
// to a single time per week. amUrgency entries cleared from the data;
// the Week type still allows the field for backward compat with v1, but
// the v2 card UI never reads it.
const WEEKS: Week[] = [
  // May weeks (Week 01 May 18-22, Week 02 May 25-29) retired 2026-05-22 —
  // May is effectively over and there's no lead time to stand up a cohort
  // for the last May week. Week numbering is intentionally NOT reindexed:
  // week.number flows into Stripe metadata / Sheets / Klaviyo `camp_week`,
  // so June stays Week 03 to keep historical data consistent.
  { number: 3,  label: "Week 03", dates: "June 01 - 05", price: 199, originalPrice: 299 },
  { number: 4,  label: "Week 04", dates: "June 08 - 12", price: 199, originalPrice: 299 },
  { number: 5,  label: "Week 05", dates: "June 15 - 19", price: 199, originalPrice: 299 },
  { number: 6,  label: "Week 06", dates: "June 22 - 26", price: 199, originalPrice: 299 },
  { number: 7,  label: "Week 07", dates: "Jul 13 - 17",  price: 199, originalPrice: 299 },
  { number: 8,  label: "Week 08", dates: "Jul 20 - 24",  price: 199, originalPrice: 299 },
  { number: 9,  label: "Week 09", dates: "Jul 27 - 31",  price: 199, originalPrice: 299 },
  { number: 10, label: "Week 10", dates: "Aug 03 - 07",  price: 199, originalPrice: 299 },
];

const SLOT_HOURS = {
  AM: "9:00 AM to 12:00 PM",
  PM: "1:00 PM to 4:00 PM",
};

// ── v2: Month-grouped week picker ───────────────────────────────────────────
// Aaron's call — parents struggle to know their summer availability when
// confronted with every week at once. Group weeks by month tab; each
// gamer's selectedMonth state persists their tab choice.
type MonthId = "June" | "July" | "August";

const MONTHS: { id: MonthId; label: string }[] = [
  { id: "June", label: "June" },
  { id: "July", label: "July" },
  { id: "August", label: "August" },
];

function getMonthForWeek(weekNumber: number): MonthId {
  if (weekNumber <= 6) return "June";
  if (weekNumber <= 9) return "July";
  return "August";
}

// Extract M-F day numbers from a week.dates string (e.g. "May 18 - 22" or
// "June 01 - 05"). All camp weeks run Mon-Fri within a single month, so we
// just walk start+0..+4. Returns five-element array for the mini-calendar
// strip render.
function getWeekDays(dates: string): number[] {
  const match = dates.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return [];
  const start = parseInt(match[1], 10);
  return [start, start + 1, start + 2, start + 3, start + 4];
}

const WEEKDAY_LABELS = ["M", "T", "W", "Th", "F"];

// Real-calendar helpers (used by the v2 Calendar treatment of the week
// picker). Shows the full month with weekends visible so parents can
// match camp weeks to their actual summer schedule.
const MONTH_INDEX: Record<MonthId, number> = {
  June: 5,
  July: 6,
  August: 7,
};
const CAMP_YEAR = 2026;

type CalendarCell = { date: number; isCurrentMonth: boolean };

// Builds a 7-col × n-row grid (Sun → Sat) covering the full month plus
// the trailing days from the prev month and leading days from the next,
// so the first week starts on Sunday and the last week ends on Saturday.
function getMonthCalendarGrid(monthIndex: number, year: number): CalendarCell[][] {
  const startDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells: CalendarCell[] = [];
  // Prev-month trailing days (greyed out)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({ date: prevMonthDays - i, isCurrentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: d, isCurrentMonth: true });
  }
  // Next-month leading days to fill the grid (greyed out)
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: nextDay++, isCurrentMonth: false });
  }

  const rows: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

// Extract the start-day (Mon) of a camp week from its "Jun 1 - 5" string.
function getCampWeekStartDay(week: Week): number {
  const m = week.dates.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

const GAMES = [
  "League of Legends",
  "Valorant",
  "Fortnite",
  "Rocket League",
  "Roblox",
  "Other",
];

const SKILL_LEVELS = ["Novice", "Amateur", "Experienced", "Pro", "Other"];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary"];

// ── Torn-paper SVG clip path (irregular edges for card mask) ────────────────

const TORN_PAPER_CLIP_ID = "torn-card-clip";

function TornPaperClipDefs() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <defs>
        <clipPath id={TORN_PAPER_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d="
            M 0.02,0
            C 0.03,0.002 0.06,0 0.1,0.003
            L 0.18,0.001 0.25,0.004 0.33,0.001 0.4,0.003
            L 0.48,0 0.55,0.003 0.63,0.001 0.7,0.004
            L 0.78,0.001 0.85,0.003 0.92,0 0.97,0.003
            C 0.99,0.001 1,0.005 1,0.015
            L 1,0.025 0.998,0.08 1,0.14 0.999,0.2
            L 1,0.28 0.998,0.36 1,0.44 0.999,0.52
            L 1,0.6 0.998,0.68 1,0.76 0.999,0.84
            L 1,0.92 0.998,0.96
            C 1,0.985 0.99,0.998 0.97,0.997
            L 0.92,1 0.85,0.997 0.78,0.999 0.7,0.996
            L 0.63,0.999 0.55,0.997 0.48,1 0.4,0.997
            L 0.33,0.999 0.25,0.996 0.18,0.999 0.1,0.997
            L 0.06,1 0.03,0.998 0.02,1
            C 0.008,0.998 0,0.985 0,0.96
            L 0.002,0.92 0,0.84 0.001,0.76 0,0.68
            L 0.002,0.6 0,0.52 0.001,0.44 0,0.36
            L 0.002,0.28 0,0.2 0.001,0.14 0,0.08
            L 0.002,0.025 0,0.015
            C 0,0.005 0.008,0.002 0.02,0
            Z
          " />
        </clipPath>
      </defs>
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyGamer(): GamerInfo {
  return {
    firstName: "",
    lastName: "",
    gamerTag: "",
    preferredGames: [],
    birthday: "",
    skillLevel: "",
    gender: "",
    selectedWeek: null,
    selectedSlot: null,
  };
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function CampsRegisterPage() {
  // Shared register form state + handlers (parent, errors, isSubmitting,
  // payment state, ctaSource, handleEmailBlur, scrollToFirstError,
  // scrollToPaymentSection, setApiError). See hooks/useRegisterForm.ts.
  const form = useRegisterForm({ productSlug: "camps" });
  const {
    parent,
    setParent,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    clientSecret,
    setClientSecret,
    paymentIntentId,
    setPaymentIntentId,
    showPayment,
    setShowPayment,
    ctaSource,
    handleEmailBlur,
    scrollToFirstError,
    scrollToPaymentSection,
    setApiError,
  } = form;

  const [gamers, setGamers] = useState<GamerInfo[]>([emptyGamer()]);
  // Default "looking" so submit validation passes without the (removed)
  // Team Status UI. Squad-code joiners override via joiningSquadToken.
  const [squadStatus, setSquadStatus] = useState<SquadStatus>("looking");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // ── Squad-link state (friend arriving via ?squad=TOKEN) ─────────────
  // If the URL has a ?squad=TOKEN and Apps Script confirms the crew, we
  // pre-select the owner's week/slot for the first gamer, show a banner,
  // and warn if the visitor tries to change away from the crew's slot.
  const [joiningSquadToken, setJoiningSquadToken] = useState<string | null>(null);
  const [joiningCrewInfo, setJoiningCrewInfo] = useState<{
    owner_gamer_name: string;
    week_label: string;
    slot: string;
    week_dates: string;
  } | null>(null);
  const [crewOverrideAcknowledged, setCrewOverrideAcknowledged] = useState(false);

  // Which added gamers (index > 0) have their week/slot picker force-expanded.
  // Gamer 0 always shows the full 10-week grid. Added gamers inherit the
  // previous gamer's selection and render a collapsed summary card until the
  // parent clicks "Change" — this keeps the page from repeating the entire
  // slot picker N times for a multi-gamer family.
  const [expandedSlotPickers, setExpandedSlotPickers] = useState<
    Record<number, boolean>
  >({});

  // v2: per-gamer selected-month tab state for the week picker. Lets each
  // gamer's section keep its own "I'm browsing June" without bleeding to
  // the next gamer. Falls back to the gamer's selectedWeek's month (if
  // they've already picked), then to June (first available month).
  const [selectedMonths, setSelectedMonths] = useState<
    Record<number, MonthId>
  >({});

  function getSelectedMonth(gi: number, gamer: GamerInfo): MonthId {
    if (selectedMonths[gi]) return selectedMonths[gi];
    if (gamer.selectedWeek) return getMonthForWeek(gamer.selectedWeek);
    return "June";
  }

  // Payment state, ctaSource, leadFiredForEmailRef + first-touch
  // attribution capture: now owned by useRegisterForm (see hook).

  // ── Load crew-owner record on mount if ?squad=TOKEN is present ─────
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
          // 404 / past week / bad token → hand off to /squad/[token],
          // which handles the terminal states with the right copy.
          window.location.href = `/squad/${encodeURIComponent(token)}`;
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        setJoiningSquadToken(token);
        setJoiningCrewInfo({
          owner_gamer_name: data.owner_gamer_name,
          week_label: data.week_label,
          slot: data.slot,
          week_dates: data.week_dates,
        });

        // Pre-select the crew's week + slot for the first gamer.
        const weekNum = parseInt(String(data.week_label).replace(/\D/g, ""), 10);
        const slot = data.slot === "AM" || data.slot === "PM" ? data.slot : null;
        if (!Number.isNaN(weekNum) && slot) {
          setGamers((prev) =>
            prev.map((g, i) =>
              i === 0 ? { ...g, selectedWeek: weekNum, selectedSlot: slot } : g
            )
          );
        }
      } catch {
        if (cancelled) return;
        window.location.href = `/squad/${encodeURIComponent(token)}`;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Display helpers ─────────────────────────────────────────────────────
  // One canonical label per gamer — used in the section header, the summary,
  // and validation errors so they stay in sync as the parent types a name.
  //   single gamer, no name → "Gamer"
  //   single gamer, has name → "Marcus"
  //   multi, no name → "Gamer 2"
  //   multi, has name → "Gamer 2: Jamie"
  function gamerLabel(i: number): string {
    const name = gamers[i]?.firstName.trim() ?? "";
    if (gamers.length <= 1) return name || "Gamer";
    return name ? `Gamer ${i + 1}: ${name}` : `Gamer ${i + 1}`;
  }

  // ── Gamer management ────────────────────────────────────────────────────

  function updateGamer(index: number, updates: Partial<GamerInfo>) {
    setGamers((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  }

  function toggleGame(gamerIndex: number, game: string) {
    setGamers((prev) =>
      prev.map((g, i) => {
        if (i !== gamerIndex) return g;
        const has = g.preferredGames.includes(game);
        return {
          ...g,
          preferredGames: has
            ? g.preferredGames.filter((gm) => gm !== game)
            : [...g.preferredGames, game],
        };
      })
    );
  }

  function addGamer() {
    // Added gamers default to the same camp week/slot as the previous one so
    // families sign up siblings into the same session by default. Two cases:
    //
    //   1. Joining via a crew link (QA #11) — inherit the crew's week/slot.
    //      The banner tells the parent everyone's joining together; diverging
    //      from the crew is the exception, not the default.
    //   2. Normal flow — inherit from the most recent gamer that has a
    //      complete (week + slot) selection. If nobody upstream has picked
    //      yet, leave blank.
    //
    // Parents can still override — the slot picker is one click away via the
    // "Change" button on the collapsed summary card.
    const next = emptyGamer();
    if (joiningCrewInfo) {
      const weekNum = parseInt(
        joiningCrewInfo.week_label.replace(/\D/g, ""),
        10
      );
      const slot =
        joiningCrewInfo.slot === "AM" || joiningCrewInfo.slot === "PM"
          ? joiningCrewInfo.slot
          : null;
      if (!Number.isNaN(weekNum) && slot) {
        next.selectedWeek = weekNum;
        next.selectedSlot = slot;
      }
    } else {
      // Walk from last to first to find the most recent complete selection.
      for (let i = gamers.length - 1; i >= 0; i--) {
        const prior = gamers[i];
        if (prior.selectedWeek && prior.selectedSlot) {
          next.selectedWeek = prior.selectedWeek;
          next.selectedSlot = prior.selectedSlot;
          break;
        }
      }
    }
    setGamers((prev) => [...prev, next]);
  }

  function removeGamer(index: number) {
    if (gamers.length <= 1) return;
    setGamers((prev) => prev.filter((_, i) => i !== index));
    // Drop the removed gamer's expanded state and shift everything above it
    // down by one so the indices continue to line up with the gamers array.
    setExpandedSlotPickers((prev) => {
      const next: Record<number, boolean> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const n = parseInt(k, 10);
        if (n < index) next[n] = v;
        else if (n > index) next[n - 1] = v;
      });
      return next;
    });
  }

  // ── Week/slot selection (per gamer) ────────────────────────────────────

  function selectSlot(gamerIndex: number, weekNum: number, slot: "AM" | "PM") {
    // Crew warning: if this visitor arrived via a squad link and is now
    // trying to pick a different (week, slot) than the crew owner — for
    // ANY gamer in the registration — make them confirm they're ok not
    // being at camp together. Acknowledge once (shared latch across all
    // gamers); after that they can edit freely. Per QA-FLAGGED-ISSUES
    // #11 this used to gate only gamer 0, which let gamers 2+ silently
    // land on a different week/slot with the same joining_squad_token.
    if (
      joiningSquadToken &&
      joiningCrewInfo &&
      !crewOverrideAcknowledged
    ) {
      const crewWeekNum = parseInt(
        joiningCrewInfo.week_label.replace(/\D/g, ""),
        10
      );
      const isMatch = crewWeekNum === weekNum && joiningCrewInfo.slot === slot;
      if (!isMatch) {
        const ok = window.confirm(
          `You're joining ${joiningCrewInfo.owner_gamer_name}'s team in ${joiningCrewInfo.week_label} ${joiningCrewInfo.slot}. Changing this means you won't be at camp together. Continue?`
        );
        if (!ok) return;
        setCrewOverrideAcknowledged(true);
      }
    }
    // Shared calendar — write the same (week, slot) to EVERY gamer in
    // state. v2 ships with one shared picker for the whole registration
    // (all gamers attend the same week and PM session), so a click on
    // the calendar must sync across all gamers, not just one. The
    // gamerIndex param is preserved on the signature for callsite
    // compatibility (squad-join warning above still uses it for
    // messaging) but the write itself is fan-out.
    setGamers((prev) =>
      prev.map((g) => ({ ...g, selectedWeek: weekNum, selectedSlot: slot }))
    );
    // Suppress unused-var warning for the legacy gamerIndex param.
    void gamerIndex;

    // Auto-scroll to gamer-info on pick — DISABLED 2026-05-19 while Aaron
    // iterates Calendar layout (every click was dragging the page down,
    // which broke the iteration loop). To revive: restore the
    // requestAnimationFrame block that scrollIntoView's gamer-${gi}-info
    // — git history has the exact snippet.
  }

  // Email-lead capture (onBlur) — now owned by useRegisterForm (hook
  // exposes the same `handleEmailBlur` we used inline before).

  // ── Validation ──────────────────────────────────────────────────────────

  function validate(): Array<{ key: string; message: string }> {
    const errs: Array<{ key: string; message: string }> = [];
    // The submit button is type="button" (not a form submit), so HTML5
    // `required` does nothing — this function is the only gate. Each error
    // carries a `key` that matches a `data-error-key` attribute on the field
    // so handleSubmit can scroll-and-focus the first invalid field. Order
    // here mirrors the visible page order, top-to-bottom: Parent Info,
    // then each gamer's name/birthday, then the shared camp-week picker.

    // Parent block — rendered first on the page.
    if (!parent.firstName.trim()) errs.push({ key: "parent.firstName", message: "Parent first name is required." });
    if (!parent.lastName.trim()) errs.push({ key: "parent.lastName", message: "Parent last name is required." });
    if (!parent.email.trim()) errs.push({ key: "parent.email", message: "Parent email is required." });
    if (!parent.phone.trim()) errs.push({ key: "parent.phone", message: "Parent phone number is required." });

    // Gamer sections. v2 only requires name + birthday + a chosen week/
    // slot — the v1 requirements for preferredGames, gender, and
    // skillLevel were dropped along with their UI fields. State for
    // those fields still exists in the gamer object (sent as empty
    // values in the submit payload to preserve the API contract), but
    // no longer gates submission. Name/birthday render above the week
    // picker, so they're checked first.
    gamers.forEach((g, i) => {
      const label = gamers.length > 1 ? `Gamer ${i + 1}` : "Gamer";
      if (!g.firstName.trim()) errs.push({ key: `gamer-${i}.firstName`, message: `${label} first name is required.` });
      if (!g.birthday.trim()) errs.push({ key: `gamer-${i}.birthday`, message: `${label} birthday is required.` });
      if (!g.selectedWeek || !g.selectedSlot)
        errs.push({ key: `gamer-${i}.weekSlot`, message: `${label}: please select a camp week.` });
    });

    // Team status — not required when arriving via a crew link. A joining
    // visitor is a pure join (see QA-FLAGGED-ISSUES #10); we hide the
    // selector and send squadStatus=null so the webhook writes "".
    if (!joiningSquadToken && !squadStatus)
      errs.push({ key: "squadStatus", message: "Please let us know your team status." });

    return errs;
  }

  // ── Submit — creates Payment Intent and shows payment form ──────────────

  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      scrollToFirstError(errs);
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    // Squad tokens — every non-joining registration mints a fresh
    // squad_token (10-char nanoid). The "Building / Looking" fork was
    // retired in the 2026-05-19 v2 promotion; team formation now happens
    // post-purchase via the squad-share link surfaced on the success page
    // + welcome email, so every parent IS effectively a squad owner.
    //
    // Joining visitors (arrived via ?squad=TOKEN) are still a pure join —
    // they inherit the owner's token via joining_squad_token and never
    // mint a new one (QA-FLAGGED-ISSUES #10).
    const squadTokenForSubmit = joiningSquadToken ? null : nanoid(10);
    const squadStatusForSubmit = joiningSquadToken ? null : squadStatus;

    const attribution = getAttribution();

    // Meta Pixel _fbc / _fbp — set client-side by the Pixel, forwarded
    // verbatim (plaintext, no hash) through the register POST → Stripe PI
    // metadata → webhook → CAPI user_data. Highest-leverage match-quality
    // signal after em; absent if the visitor never loaded the Pixel.
    const fbc = getFbCookie("_fbc");
    const fbp = getFbCookie("_fbp");

    const payload = {
      parent,
      gamers: gamers.map((g) => {
        const week = WEEKS.find((w) => w.number === g.selectedWeek);
        return {
          ...g,
          weekLabel: week?.label,
          weekDates: week?.dates,
          slotHours: g.selectedSlot ? SLOT_HOURS[g.selectedSlot] : null,
          price: week?.price,
        };
      }),
      // squadStatus: family-level vibe check, "building" | "looking" | null
      // Wired: register route → Stripe metadata (squad_status) → webhook
      // → Google Sheets column (camps only) + Klaviyo profile/event +
      // Beehiiv custom field. Klaviyo owns the branded post-purchase moments
      // (Find Your Squad activation lives there); Beehiiv owns the nurture
      // layer. squad_status is written as the human label ("Building a squad"
      // / "Looking for a squad"), which is what Klaviyo flow splits match on.
      // Forced to null when joining via ?squad=TOKEN (QA #10) so the webhook
      // writes "" and the visitor doesn't match any building/looking flow.
      squadStatus: squadStatusForSubmit,
      squad_token: squadTokenForSubmit,
      joining_squad_token: joiningSquadToken,
      additionalInfo,
      totalPrice,
      attribution,
      cta_source: ctaSource,
      fbc,
      fbp,
    };

    try {
      const res = await fetch("/api/camps/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setShowPayment(true);

      // Abandoned-cart capture — fires AFTER the register API succeeds and
      // BEFORE the parent enters card details. If they bail at the Stripe
      // Elements step, the email is still in Beehiiv with cart_abandoned_camps
      // and the first gamer's week/slot context. Fire-and-forget; failures
      // never block payment because the webhook does the heavy lifting on
      // success and this is purely a recovery channel.
      const firstGamer = gamers[0];
      const firstGamerWeek = firstGamer?.selectedWeek ?? null;
      const firstGamerSlot = firstGamer?.selectedSlot ?? null;
      fetch("/api/camps/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parent.email,
          parent_first_name: parent.firstName,
          parent_last_name: parent.lastName,
          gamer_first_name: firstGamer?.firstName || "",
          week: firstGamerWeek,
          slot: firstGamerSlot,
        }),
      }).catch(() => {});

      trackInitiateCheckout({ program: "camps", value: totalPrice });
      setIsSubmitting(false);
      scrollToPaymentSection();
    } catch {
      setApiError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  // ── Computed ────────────────────────────────────────────────────────────

  const totalPrice = gamers.reduce((sum, g) => {
    const week = WEEKS.find((w) => w.number === g.selectedWeek);
    return sum + (week?.price ?? 0);
  }, 0);

  const selectedGamerSummaries = gamers
    .map((g, i) => {
      if (!g.selectedWeek || !g.selectedSlot) return null;
      const week = WEEKS.find((w) => w.number === g.selectedWeek);
      if (!week) return null;
      return {
        index: i,
        gamerName: gamerLabel(i),
        weekLabel: week.label,
        weekDates: week.dates,
        slot: g.selectedSlot,
        slotHours: SLOT_HOURS[g.selectedSlot],
        price: week.price,
        originalPrice: week.originalPrice,
      };
    })
    .filter(Boolean);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Fire ViewContent on register-page load. The ad set optimizes for
          CONTENT_VIEW, but ViewContent previously only fired on the program
          landing pages — so the TLDR→/register ad got almost no optimization
          signal (1 ViewContent on 8k impressions in v2.0). The post-submit
          InitiateCheckout below stays as the deeper-funnel event. */}
      <TrackPageView program="camps" />

      <Nav variant="light" />

      {/* SVG clip path defs for torn-paper cards */}
      <TornPaperClipDefs />

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      {/* Utility hero: cold paid traffic arrives here past the LP pitch.
          Camps gradient is the punchy diagonal — warm-pink upper-left
          glow into deep purple bottom-right bloom. The shared
          RegisterHero owns layout (Eyebrow + H1 + subhead + torn-paper
          white-top) so e100 + teams can swap in their own gradient. */}
      <RegisterHero
        background="radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255, 190, 245, 0.80), transparent 60%), radial-gradient(ellipse 80% 70% at 100% 100%, rgba(80, 15, 150, 0.85), transparent 60%), #A435F0"
        eyebrow="League of Legends"
        title1="Esports"
        title2="Camp"
        subhead="Sign up today to level up this summer. Premier esports camps where kids learn from pros how to play, compete, and work as a team."
      />

      {/* Trust strip (15 hours / Code of Conduct / Secure payment /
          Refund) REMOVED 2026-05-19 to lift the form above the fold.
          Same trust info still surfaces in the desktop right rail
          ("What you get" + refund line). Consider a compact mobile-only
          trust line near the form later if mobile conversion needs it. */}

      {/* ── Form body ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-6 md:pt-10 pb-16 md:pb-24">
          {/* v2: two-column layout on lg+ — main form on the left, sticky
              checkout summary on the right. Mobile (and tablet < lg)
              collapses to single column with the existing inline Summary
              block at the bottom of the form. min-w-0 on the left column
              prevents long form-content overflow from stretching the
              grid track. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:gap-16">
            <div className="min-w-0">

          {/* Team-join banner — shown when arriving via ?squad=TOKEN */}
          {joiningCrewInfo && (
            <div className="mb-8 bg-red text-white px-6 py-5 rounded-lg">
              <p
                className="font-display uppercase leading-[0.9]"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                You&apos;ve been invited to join {joiningCrewInfo.owner_gamer_name}&apos;s team
              </p>
              <p
                className="font-body mt-2"
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "24px" }}
              >
                EKUZO Camp, {joiningCrewInfo.week_label} ({joiningCrewInfo.week_dates}) {joiningCrewInfo.slot}.
                We&apos;ve pre-selected this week for you below.
              </p>
            </div>
          )}

          {/* Errors — summary list at the top for screen readers / a11y.
              The form's handleSubmit also auto-scrolls to and focuses
              the first invalid field via the shared scrollToFirstError. */}
          <ErrorSummary errors={errors} />

          {/* ── Parent contact info (LEADS THE FORM in v2) ──────────────
              Moved to the top of the form 2026-05-19. The email field
              fires handleEmailBlur on blur so the existing
              `form_started_camps` Beehiiv tag fires the moment a valid
              email is typed.
              Note for Jamie: to nurture dropoffs with the richer
              parent.firstName / parent.lastName / parent.phone data,
              /api/camps/lead would need to accept those fields. For
              now only email is sent to /api/camps/lead via the email
              onBlur; the additional fields land in Beehiiv only after
              cart-abandoned or successful payment. Quick API extension
              when you're ready. */}
          <ParentInfoSection
            parent={parent}
            setParent={setParent}
            onEmailBlur={handleEmailBlur}
          />

          {/* ── Per-gamer sections ─────────────────────────────────── */}
          {gamers.map((gamer, gi) => (
            <div key={gi} className="mb-12 last:mb-0">
              {/* Gamer header (only when multiple) */}
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

              {/* ── Gamer Info (v2: name + birthday, MOVED above Week Selection) ─
                  Order swap from v1: gamer identity (name + birthday)
                  now collects BEFORE the week/slot commitment, mirroring
                  the parent-info pattern at the top. Lowers the bar
                  before the most-abandoned step (week selection).

                  Note for Jamie: gamerTag / preferredGames / gender /
                  skillLevel state fields are retained in the gamer
                  state shape and still ship in the /api/camps/register
                  payload as their empty defaults ("" / [] / "" / "")
                  so your Stripe metadata schema, webhook, and Google
                  Sheets columns stay intact. Data just won't be
                  populated for v2 registrations.

                  Scroll target preserved for the selectSlot
                  scrollIntoView call. scrollMarginTop leaves room for
                  the fixed nav. */}
              <div
                id={`gamer-${gi}-info`}
                className="mb-8"
                style={{ scrollMarginTop: "100px" }}
              >
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
                  <InputField
                    label="Birthday *"
                    type="date"
                    errorKey={`gamer-${gi}.birthday`}
                    value={gamer.birthday}
                    onChange={(v) => updateGamer(gi, { birthday: v })}
                  />
                </div>
              </div>


              {/* Divider between gamers */}
              {gi < gamers.length - 1 && (
                <hr className="border-t-2 border-black/10 my-10" />
              )}
            </div>
          ))}

          {/* v2: shared "Add another gamer" button + Calendar —
              lifted out of the per-gamer loop 2026-05-19 so the
              Calendar is one shared picker for all gamers. Wiring
              still drives only gamers[0]; multi-gamer sync deferred
              to the code-cleanup pass. */}
          <button
            type="button"
            onClick={addGamer}
            className="w-full py-4 border-2 border-dashed border-black/20 rounded-sm font-body font-semibold text-black/50 hover:border-red/40 hover:text-red/70 hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 cursor-pointer mb-12"
          >
            + Add another gamer
          </button>

          {(() => {
            // Shared calendar wiring stub — locally alias loop-scope
            // names so the lifted Week Selection JSX (which still
            // references gi/gamer) compiles unchanged. Wired to
            // gamers[0] until multi-gamer sync lands.
            const gi = 0;
            const gamer = gamers[0];
            return (
              <>
              {/* ── Week Selection ──────────────────────────────────── */}
              {/* Added gamers (gi > 0) with an inherited selection collapse to
                  a summary card until the parent clicks "Change". Gamer 0
                  and any added gamer that hasn't picked yet always see the
                  full 10-week grid. This avoids repeating 30 slot buttons
                  on every added gamer. */}
              {(() => {
                const hasSelection =
                  gamer.selectedWeek != null && gamer.selectedSlot != null;
                const collapsible =
                  (gi > 0 || !!joiningSquadToken) && hasSelection;
                const showGrid = !collapsible || expandedSlotPickers[gi];

                if (!showGrid) {
                  const selectedWeek = WEEKS.find(
                    (w) => w.number === gamer.selectedWeek
                  );
                  return (
                    <div className="mb-10">
                      <div className="flex items-center justify-between gap-6 bg-[#f5f5f7] rounded-lg p-6 ring-1 ring-black/10">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span
                            className="font-body font-bold text-red uppercase"
                            style={{
                              fontSize: "12px",
                              letterSpacing: "1.2px",
                              lineHeight: "16px",
                            }}
                          >
                            Camp week &amp; slot
                          </span>
                          <span
                            className="font-display uppercase text-[#0a0a0a]"
                            style={{
                              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                              lineHeight: "1.1",
                            }}
                          >
                            {selectedWeek?.dates}
                          </span>
                          <span
                            className="font-body text-[#0a0a0a]"
                            style={{ fontSize: "14px", lineHeight: "20px" }}
                          >
                            Afternoon session ({SLOT_HOURS.PM})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSlotPickers((prev) => ({
                              ...prev,
                              [gi]: true,
                            }))
                          }
                          className="font-body font-semibold text-sm text-red hover:underline hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150 cursor-pointer shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  );
                }

                const activeMonth = getSelectedMonth(gi, gamer);
                const weeksByMonth: Record<MonthId, typeof WEEKS> = {
                  June: [],
                  July: [],
                  August: [],
                };
                WEEKS.forEach((w) =>
                  weeksByMonth[getMonthForWeek(w.number)].push(w)
                );
                const visibleWeeks = weeksByMonth[activeMonth];

                return (
                  <div className="mb-10">
                    <h2
                      className="font-display uppercase text-black leading-[0.85]"
                      style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                    >
                      Choose your camp week
                    </h2>
                    <p
                      className="font-body text-[#4b5563] mt-6"
                      style={{
                        fontSize: "clamp(0.875rem, 1.2vw, 16px)",
                        lineHeight: "28px",
                      }}
                    >
                      All camps run Monday through Friday, 1:00 PM to 4:00 PM (afternoon sessions only). Browse by month and tap the week that works for your family — teams are built on availability per time zone.
                    </p>


                    {/* July 4 break note — appears at the bottom of June
                        and top of July tabs to explain the 2-week gap
                        (Jun 22-26 → Jul 13-17). Anchors the gap to a
                        calendar event parents already know. */}
                    {activeMonth === "July" && (
                      <div className="mt-6 flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-sm px-4 py-3">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#ea580c] shrink-0 mt-0.5" aria-hidden="true">
                          <path d="M10 2L16.5 5V10C16.5 13.5 13.5 16.5 10 17.5C6.5 16.5 3.5 13.5 3.5 10V5L10 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                          <path d="M10 7V10.5M10 13V13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <p className="font-body text-[#9a3412] text-sm leading-snug">
                          Camp pauses for July 4 holidays (Jun 29 – Jul 10).
                          We&apos;re back the week of July 13.
                        </p>
                      </div>
                    )}

                    {/* v2 picker treatment B — MONTHLY CALENDAR (iOS-
                        inspired, EKUZO-styled). Mockup-locked layout:
                        month-name tabs across the top, prev/next
                        chevrons flanking a centered "Month YEAR" label,
                        full Sun-Sat day-name strip, and a 7-col date
                        grid where every current-month date sits inside
                        a light-bordered cell (graph-paper feel).
                        Leading/trailing days from adjacent months are
                        blank. Camp weeks (Mon-Fri) become clickable;
                        only the SELECTED camp week renders with a
                        purple fill — unselected camp weeks read as
                        plain weekdays per Aaron's mockup. Purple
                        (non-destructive) used in place of brand red
                        because red signals warning/error states. */}
                    {(() => {
                      const monthIdx = MONTHS.findIndex(
                        (m) => m.id === activeMonth
                      );
                      const canGoPrev = monthIdx > 0;
                      const canGoNext = monthIdx < MONTHS.length - 1;
                      const goToMonth = (delta: number) => {
                        const nextIdx = monthIdx + delta;
                        if (nextIdx < 0 || nextIdx >= MONTHS.length) return;
                        setSelectedMonths((prev) => ({
                          ...prev,
                          [gi]: MONTHS[nextIdx].id,
                        }));
                      };
                      const grid = getMonthCalendarGrid(
                        MONTH_INDEX[activeMonth],
                        CAMP_YEAR
                      );
                      const selectedWeekObj = gamer.selectedWeek
                        ? WEEKS.find((w) => w.number === gamer.selectedWeek)
                        : null;
                      // "Jul 13 - 17" → "JULY 13-17". Data is mixed
                      // ("May", "June", "Jul"…); expand 3-char months to
                      // the full name so the summary line reads as a
                      // proper date (Aaron's call 2026-05-19 — abbreviated
                      // months felt clipped).
                      const MONTH_FULL_NAMES: Record<string, string> = {
                        Jan: "January", Feb: "February", Mar: "March",
                        Apr: "April", May: "May", Jun: "June", June: "June",
                        Jul: "July", Aug: "August", Sep: "September",
                        Oct: "October", Nov: "November", Dec: "December",
                      };
                      const formatDateRange = (dates: string): string => {
                        const m = dates.match(/^(\w+)\s+(\d+)\s*-\s*(\d+)$/);
                        if (!m) return dates.toUpperCase();
                        const fullMonth = MONTH_FULL_NAMES[m[1]] ?? m[1];
                        return `${fullMonth.toUpperCase()} ${m[2]}-${m[3]}`;
                      };
                      return (
                        <div
                          className="mt-8 max-w-md bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#f0f0f2] px-5 py-5"
                          data-error-key={`gamer-${gi}.weekSlot`}
                          tabIndex={-1}
                          style={{ scrollMarginTop: "100px" }}
                        >
                          {/* Month tabs — direct picker for the 4 camp
                              months. Selected tab fills purple; others
                              are outlined white. Complements the < / >
                              arrows below for users who prefer a direct
                              jump. */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4">
                            {MONTHS.map((m) => {
                              const isActive = activeMonth === m.id;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedMonths((prev) => ({
                                      ...prev,
                                      [gi]: m.id,
                                    }))
                                  }
                                  aria-pressed={isActive}
                                  className={`py-2 rounded-md border font-body font-bold transition-colors cursor-pointer active:scale-[0.98] ${
                                    isActive
                                      ? "bg-purple border-purple text-white"
                                      : "bg-white border-[#e5e7eb] text-[#0a0a0a] hover:bg-[#f9fafb]"
                                  }`}
                                  style={{ fontSize: "13px" }}
                                >
                                  {m.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Header: prev arrow · Month Year · next arrow */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={() => goToMonth(-1)}
                              disabled={!canGoPrev}
                              aria-label="Previous month"
                              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e5e7eb] text-[#0a0a0a] disabled:text-[#d1d5db] disabled:border-[#f0f0f2] hover:bg-[#f9fafb] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M9 2.5L4 7l5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <span
                              className="font-display uppercase text-[#0a0a0a]"
                              style={{
                                fontSize: "clamp(32px, 4.5vw, 42px)",
                                lineHeight: "1",
                              }}
                            >
                              {activeMonth} {CAMP_YEAR}
                            </span>
                            <button
                              type="button"
                              onClick={() => goToMonth(1)}
                              disabled={!canGoNext}
                              aria-label="Next month"
                              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e5e7eb] text-[#0a0a0a] disabled:text-[#d1d5db] disabled:border-[#f0f0f2] hover:bg-[#f9fafb] transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M5 2.5L10 7l-5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>

                          {/* Day-of-week strip */}
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

                          {/* Date grid */}
                          <div className="grid grid-cols-7 gap-1.5">
                            {grid.flat().map((cell, idx) => {
                              const dayOfWeek = idx % 7; // 0=Sun, 1=Mon, ..., 6=Sat
                              const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
                              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                              // Leading/trailing days from adjacent months
                              // render as completely blank cells per the
                              // mockup — keeps the grid clean.
                              if (!cell.isCurrentMonth) {
                                return (
                                  <div key={idx} className="aspect-square" />
                                );
                              }

                              // Match cell to a camp week iff Mon-Fri in
                              // the active month and within the date
                              // range of one of our 10 camp weeks.
                              const campWeek = isWeekday
                                ? WEEKS.find((w) => {
                                    if (getMonthForWeek(w.number) !== activeMonth) return false;
                                    const start = getCampWeekStartDay(w);
                                    return cell.date >= start && cell.date <= start + 4;
                                  })
                                : undefined;

                              const isSelected =
                                !!campWeek && gamer.selectedWeek === campWeek.number;

                              // SELECTED camp week — solid purple fill.
                              if (isSelected && campWeek) {
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => selectSlot(gi, campWeek.number, "PM")}
                                    aria-pressed={true}
                                    aria-label={`Selected: ${campWeek.label}, ${campWeek.dates}`}
                                    className="aspect-square flex items-center justify-center rounded-md bg-purple border border-purple text-white transition-all duration-150 cursor-pointer active:scale-[0.97]"
                                  >
                                    <span
                                      className="font-body font-bold"
                                      style={{ fontSize: "13px" }}
                                    >
                                      {cell.date}
                                    </span>
                                  </button>
                                );
                              }

                              // Unselected camp week — same look as plain
                              // weekday but clickable + cursor-pointer.
                              // Match the mockup: no tint, no dot. Hover
                              // adds a subtle purple-soft fill so desktop
                              // users get a discoverability cue.
                              if (campWeek) {
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => selectSlot(gi, campWeek.number, "PM")}
                                    aria-pressed={false}
                                    aria-label={`Select ${campWeek.label}, ${campWeek.dates}`}
                                    className="aspect-square flex items-center justify-center rounded-md border border-[#e5e7eb] bg-white hover:bg-purple-soft hover:border-purple/40 transition-all duration-150 cursor-pointer active:scale-[0.97]"
                                  >
                                    <span
                                      className="font-body font-bold text-[#0a0a0a]"
                                      style={{ fontSize: "13px" }}
                                    >
                                      {cell.date}
                                    </span>
                                  </button>
                                );
                              }

                              // Non-camp current-month day — visibly
                              // disabled: muted fill, lighter border,
                              // light-gray text. Same treatment for
                              // weekends + weekdays-without-a-camp so the
                              // grid clearly communicates "camp not
                              // available" (Aaron 2026-05-19 — was
                              // rendering weekday text in full black,
                              // which read as active even though the
                              // cell wasn't clickable).
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

                          {/* Selection summary bar — date range in
                              display font (big, bold, black) with the
                              day-range as a supporting purple line
                              below. Light purple background. ALWAYS
                              rendered (with `invisible` when no week
                              chosen) so picking a week doesn't push
                              the page down — Aaron 2026-05-19. */}
                          <div
                            className={`mt-5 bg-purple-soft border border-purple/20 rounded-lg px-4 py-3 ${
                              selectedWeekObj ? "" : "invisible"
                            }`}
                            aria-hidden={!selectedWeekObj}
                          >
                            <span
                              className="block font-display uppercase text-black"
                              style={{
                                fontSize: "clamp(26px, 3.5vw, 34px)",
                                lineHeight: "1",
                              }}
                            >
                              {selectedWeekObj
                                ? formatDateRange(selectedWeekObj.dates)
                                : "PLACEHOLDER 00-00"}
                            </span>
                            <span
                              className="block font-body font-bold text-purple mt-1.5"
                              style={{ fontSize: "15px", lineHeight: "1.2" }}
                            >
                              Monday through Friday · 1:00 PM – 4:00 PM
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
              </>
            );
          })()}

          {/* v2: standalone "Add another gamer" button MOVED into the
              per-gamer loop (now sits under the last gamer's Gamer Info
              block so it lives with the gamer-identity content).
              Coach reminder card MOVED to after Team Status (thematic
              pairing: who's on your gamer's team + who coaches them). */}

          {/* Team Status (Building / Looking) section REMOVED 2026-05-19.
              Squad-code flow handles team formation post-registration
              (success page surfaces a shareable squad link). Everyone
              defaults to "looking" — see squadStatus useState default. */}

          {/* Coach reminder card ("Your gamer's coaches" + avatars +
              Meet the team link) REMOVED 2026-05-19 — same coach
              credibility lives on the LP and the success page. */}


          {/* v2: Parent / Guardian Info MOVED to the top of the form
              (above the per-gamer sections). Additional Info section
              REMOVED entirely per Aaron's call — was eating real estate
              without driving conversion, and any special-needs notes
              parents need to flag can come via the post-registration
              welcome email reply.

              Note: additionalInfo state is intentionally retained — it
              still ships in the /api/camps/register payload as "" so
              the Stripe metadata schema stays unchanged. The setter is
              unused; safe to leave. */}

          {/* ── Summary Overview (mobile/tablet only on v2) ──────────
              On lg+ the sticky sidebar takes over — see the <aside> at
              the bottom of this section. Mobile users still need an
              inline summary so they see the per-gamer breakdown and the
              total before the Continue button. */}
          <div className="mb-8 border border-[#e5e7eb] rounded-sm overflow-hidden lg:hidden">
            <div className="bg-[#f5f5f7] px-6 py-4 border-b border-[#e5e7eb]">
              <h3
                className="font-display uppercase text-[#0a0a0a]"
                style={{ fontSize: "clamp(2rem, 3vw, 28px)", lineHeight: "1.1" }}
              >
                Registration summary
              </h3>
            </div>

            <div className="px-6 py-5">
              {selectedGamerSummaries.length === 0 ? (
                <p className="font-body text-[#9ca3af] text-sm">
                  No camp weeks selected yet. Choose a week and slot above to see your summary.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {selectedGamerSummaries.map((s) => {
                    if (!s) return null;
                    return (
                      <div key={s.index} className="flex items-start justify-between gap-4 pb-4 border-b border-[#f0f0f0] last:border-0 last:pb-0">
                        <div className="flex flex-col gap-1">
                          <span className="font-body font-bold text-[#0a0a0a] text-sm">
                            {s.gamerName}
                          </span>
                          <span className="font-body text-[#6b7280] text-sm">
                            {s.weekDates}
                          </span>
                          <span className="font-body text-[#6b7280] text-sm">
                            Afternoon session ({s.slotHours})
                          </span>
                        </div>
                        <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap">
                          ${s.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              {selectedGamerSummaries.length > 0 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e5e7eb]">
                  <span className="font-body font-bold text-[#0a0a0a]" style={{ fontSize: "16px" }}>
                    Total (limited-time pricing)
                  </span>
                  <span className="font-display text-[#0a0a0a]" style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}>
                    ${totalPrice}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── What happens after I pay (NEW v2) ────────────────────
              Kills the post-purchase black box. Three-step preview
              between Summary and Continue button. */}
          {!showPayment && (
            <PostPaymentSteps
              steps={[
                {
                  title: "Right away",
                  desc: "Confirmation + payment receipt land in your inbox.",
                },
                {
                  title: "Within 24 hours",
                  desc: "Welcome email with camp details and everything you need to get ready to play.",
                },
                {
                  title: "Week before camp",
                  desc: "Meet your coach and introduction to the rest of the team.",
                },
              ]}
            />
          )}

          {/* ── CTA Button / Payment Section ─────────────────────── */}
          {!showPayment ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || totalPrice <= 0}
                className="w-full font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                style={{ fontSize: "18px", lineHeight: "28px", padding: "20px" }}
              >
                {isSubmitting ? "Setting up payment..." : "Continue to payment"}
              </button>

              {/* Three trust signals + ToS link. */}
              <ReassuranceRow />
            </>
          ) : clientSecret ? (
            <PaymentStep
              clientSecret={clientSecret}
              returnUrl={`${
                process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
              }/programs/ekuzo-camps/success?payment_intent=${paymentIntentId}`}
              parentEmail={parent.email}
              payButtonLabel={`Pay $${totalPrice}`}
              onGoBack={() => {
                setShowPayment(false);
                setClientSecret(null);
                setPaymentIntentId(null);
              }}
            />
          ) : null}

            </div>{/* end left column (form) */}

            {/* ── Sticky checkout summary sidebar (NEW v2, lg+ only) ──
                Persistent right-rail panel showing real-time price,
                gamer count, and what's-included while the user scrolls
                the form. Mirror of the inline mobile Summary above —
                same selectedGamerSummaries + totalPrice state. Hidden
                below lg breakpoint where the inline mobile summary
                takes over. Sticky offset accounts for the fixed nav
                that sits above. */}
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
                    {selectedGamerSummaries.length === 0 ? (
                      <p className="font-body text-[#9ca3af] text-sm leading-relaxed">
                        Pick a camp week + slot for each gamer to see your total.
                      </p>
                    ) : (
                      <>
                        <ul className="flex flex-col gap-3 mb-4">
                          {selectedGamerSummaries.map((s) => {
                            if (!s) return null;
                            return (
                              <li
                                key={s.index}
                                className="flex items-start justify-between gap-3 pb-3 border-b border-[#f0f0f0] last:border-0 last:pb-0"
                              >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="font-body font-bold text-[#0a0a0a] text-xs leading-tight truncate">
                                    {s.gamerName}
                                  </span>
                                  <span className="font-body text-[#6b7280] text-xs leading-snug">
                                    {s.weekDates}
                                  </span>
                                  <span className="font-body text-[#6b7280] text-xs leading-snug">
                                    1:00 PM – 4:00 PM
                                  </span>
                                </div>
                                <span className="font-body font-bold text-[#0a0a0a] text-xs whitespace-nowrap">
                                  ${s.price}
                                </span>
                              </li>
                            );
                          })}
                        </ul>

                        <div className="flex items-baseline justify-between pt-3 border-t border-[#e5e7eb]">
                          <span className="font-body font-bold text-[#0a0a0a] text-sm">
                            Total
                          </span>
                          <span className="font-display text-[#0a0a0a]" style={{ fontSize: "clamp(1.5rem, 1.8vw, 1.875rem)", lineHeight: 1 }}>
                            ${totalPrice}
                          </span>
                        </div>
                        <p className="font-body text-[#9ca3af] text-[11px] mt-1 text-right">
                          Limited-time pricing
                        </p>
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
                      "15 hours of live coaching",
                      "Hand-picked 5-player squad",
                      "Private moderated chat stream",
                      "Tournament Friday + casted bracket",
                      "Squad stays open post-camp",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red shrink-0 mt-[3px]" aria-hidden="true">
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

// CheckoutForm + InputField moved to components/register/ as part of the
// Phase 5 shared-UI extraction (see hooks/useRegisterForm.ts +
// components/register/{CheckoutForm,InputField,PaymentStep}.tsx).
// SquadCard + SelectField below are pre-existing dead code (Team Status
// section was removed 2026-05-19; SelectField was never used in camps)
// — left in place per the "no pre-existing dead-code cleanup during
// refactor" rule.

// ── Reusable sub-components ─────────────────────────────────────────────────

function SquadCard({
  title,
  subtitle,
  isSelected,
  onClick,
}: {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  // Smooth rounded rectangle — no torn-paper clipPath here (it produced
  // jagged edges on both the card and the red outline). Without clipPath we
  // can use a normal ring for the selected state.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`relative text-left p-8 flex flex-col gap-3 cursor-pointer bg-[#f5f5f7] rounded-lg w-full transition-all duration-150 hover:brightness-[0.98] active:scale-[0.99] active:brightness-95 ${
        isSelected
          ? "ring-2 ring-red shadow-lg shadow-red/10"
          : "ring-1 ring-black/10"
      }`}
    >
      {/* Selection check badge — top right */}
      <div
        className={`absolute top-6 right-6 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
          isSelected ? "bg-red" : "bg-white ring-1 ring-black/15"
        }`}
      >
        {isSelected && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2.5 7.5L5.5 10.5L11.5 4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <span
        className="font-display uppercase text-[#0a0a0a] leading-[0.95] pr-10"
        style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
      >
        {title}
      </span>
      <span
        className="font-body text-[#4b5563]"
        style={{ fontSize: "clamp(0.875rem, 1.1vw, 16px)", lineHeight: "24px" }}
      >
        {subtitle}
      </span>
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  errorKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  errorKey?: string;
}) {
  return (
    <div className="flex flex-col gap-2" style={errorKey ? { scrollMarginTop: "100px" } : undefined}>
      <label
        htmlFor={errorKey}
        className="font-body font-bold text-[#374151]"
        style={{ fontSize: "14px", lineHeight: "20px" }}
      >
        {label}
      </label>
      <select
        id={errorKey}
        data-error-key={errorKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-body text-[#1f2937] bg-[#f9fafb] border border-[#e5e7eb] rounded p-[17px] outline-none focus:border-[#0a0a0a] transition-colors appearance-none"
        style={{ fontSize: "16px", lineHeight: "24px" }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
