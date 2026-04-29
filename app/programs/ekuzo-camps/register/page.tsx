"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Eyebrow from "@/components/ui/Eyebrow";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { trackInitiateCheckout } from "@/lib/analytics";
import { captureAttribution, getAttribution } from "@/lib/attribution";
import { nanoid } from "nanoid";

// ── Stripe setup ────────────────────────────────────────────────────────────

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// ── Types ────────────────────────────────────────────────────────────────────

type SlotUrgency = "available" | "filling-fast" | "limited";

type Week = {
  number: number;
  label: string;
  dates: string;
  price: number;
  originalPrice?: number;
  amUrgency?: SlotUrgency;
  pmUrgency?: SlotUrgency;
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

const WEEKS: Week[] = [
  { number: 1,  label: "Week 01", dates: "May 18 - 22",  price: 199, originalPrice: 299, pmUrgency: "filling-fast" },
  { number: 2,  label: "Week 02", dates: "May 25 - 29",  price: 199, originalPrice: 299 },
  { number: 3,  label: "Week 03", dates: "June 01 - 05", price: 199, originalPrice: 299 },
  { number: 4,  label: "Week 04", dates: "June 08 - 12", price: 199, originalPrice: 299 },
  { number: 5,  label: "Week 05", dates: "June 15 - 19", price: 199, originalPrice: 299, pmUrgency: "limited" },
  { number: 6,  label: "Week 06", dates: "June 22 - 26", price: 199, originalPrice: 299, amUrgency: "filling-fast" },
  { number: 7,  label: "Week 07", dates: "Jul 13 - 17",  price: 199, originalPrice: 299 },
  { number: 8,  label: "Week 08", dates: "Jul 20 - 24",  price: 199, originalPrice: 299 },
  { number: 9,  label: "Week 09", dates: "Jul 27 - 31",  price: 199, originalPrice: 299, amUrgency: "limited", pmUrgency: "filling-fast" },
  { number: 10, label: "Week 10", dates: "Aug 03 - 07",  price: 199, originalPrice: 299 },
];

const SLOT_HOURS = {
  AM: "9:00 AM — 12:00 PM",
  PM: "1:00 PM — 4:00 PM",
};

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
  const [parent, setParent] = useState<ParentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [gamers, setGamers] = useState<GamerInfo[]>([emptyGamer()]);
  const [squadStatus, setSquadStatus] = useState<SquadStatus>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // ── Capture first-touch UTM params on mount ─────────────────────────
  // Direct land on /register via an ad URL writes the UTMs to
  // sessionStorage. If the visitor came via a marketing page that already
  // captured, this is a no-op (first-touch wins). See lib/attribution.ts.
  useEffect(() => {
    captureAttribution();
  }, []);

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
    updateGamer(gamerIndex, { selectedWeek: weekNum, selectedSlot: slot });

    // Added gamers (index > 0): once they've picked, collapse the grid back
    // to the summary card. Gamer 0 keeps the full grid visible — it's the
    // primary decision-making surface and doesn't need to collapse.
    if (gamerIndex > 0) {
      setExpandedSlotPickers((prev) => ({ ...prev, [gamerIndex]: false }));
    }

    // UX guidance: after the parent picks a slot, walk them down to the
    // next thing to fill in (this gamer's info block). RAF lets the
    // selection state paint first so the smooth scroll feels connected
    // to the click rather than racing it. Skips cleanly on SSR / tests
    // that lack `window` or `document`.
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById(`gamer-${gamerIndex}-info`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────

  function validate(): string[] {
    const errs: string[] = [];
    // Parent — every field marked * in the UI must be enforced here. The
    // submit button is type="button" (not a form submit), so the HTML5
    // `required` attribute does nothing — this function is the only gate.
    if (!parent.firstName.trim()) errs.push("Parent first name is required.");
    if (!parent.lastName.trim()) errs.push("Parent last name is required.");
    if (!parent.email.trim()) errs.push("Parent email is required.");
    if (!parent.phone.trim()) errs.push("Parent phone number is required.");

    // Gamers — iterate the full array and enforce every starred field per
    // gamer. Previously only firstName/lastName/week/slot were checked,
    // which let blank birthdays (and everything else) through on added
    // gamers — see QA-FLAGGED-ISSUES #12.
    gamers.forEach((g, i) => {
      const label = gamers.length > 1 ? `Gamer ${i + 1}` : "Gamer";
      if (!g.firstName.trim()) errs.push(`${label} first name is required.`);
      if (!g.lastName.trim()) errs.push(`${label} last name is required.`);
      if (g.preferredGames.length === 0)
        errs.push(`${label}: please select at least one favorite game.`);
      if (!g.birthday.trim()) errs.push(`${label} birthday is required.`);
      if (!g.gender.trim()) errs.push(`${label} gender is required.`);
      if (!g.skillLevel.trim())
        errs.push(`${label} gaming experience is required.`);
      if (!g.selectedWeek || !g.selectedSlot)
        errs.push(`${label}: please select a camp week and time slot.`);
    });

    // Team status — not required when arriving via a crew link. A joining
    // visitor is a pure join (see QA-FLAGGED-ISSUES #10); we hide the
    // selector in the UI and send squadStatus=null so the webhook's
    // squadStatusSafe guard writes "" (not a building/looking opt-in).
    if (!joiningSquadToken && !squadStatus)
      errs.push("Please let us know your team status.");

    return errs;
  }

  // ── Submit — creates Payment Intent and shows payment form ──────────────

  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    // Squad tokens — fresh each submit for Building; joining_squad_token
    // is whatever the ?squad= query param told us on page load. Per
    // QA-FLAGGED-ISSUES #10 a joining visitor is a pure join: never mint
    // a new squad_token even if squadStatus somehow leaked into state
    // (the Team Status selector is hidden in the UI when joiningSquadToken
    // is set, so this is defense-in-depth).
    const squadTokenForSubmit =
      joiningSquadToken
        ? null
        : squadStatus === "building"
        ? nanoid(10)
        : null;
    const squadStatusForSubmit = joiningSquadToken ? null : squadStatus;

    const attribution = getAttribution();

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
    };

    try {
      const res = await fetch("/api/camps/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors([data.error || "Something went wrong. Please try again."]);
        setIsSubmitting(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setShowPayment(true);
      trackInitiateCheckout({ program: "camps", value: totalPrice });
      setIsSubmitting(false);

      // Scroll to payment section
      setTimeout(() => {
        document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setErrors(["Something went wrong. Please try again."]);
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
      <Nav variant="light" />

      {/* SVG clip path defs for torn-paper cards */}
      <TornPaperClipDefs />

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative bg-[#f5f5f7]" style={{ overflow: "clip" }}>
        <div
          className="max-w-[1280px] mx-auto relative pb-36 lg:pb-72"
          style={{ paddingTop: "100px", paddingLeft: "24px", paddingRight: "24px" }}
        >
          {/* Left content */}
          <div className="relative z-10 flex flex-col items-start" style={{ gap: "24px", maxWidth: "544px" }}>
            {/* Season eyebrow + heading grouped tighter */}
            <div className="flex flex-col gap-3">
              <Eyebrow>
                <span className="inline-flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M2 6.5H14" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Summer 2026 Season
                </span>
              </Eyebrow>

              {/* Heading */}
              <h1
                className="font-display uppercase"
                style={{ fontSize: "clamp(4rem, 6.25vw, 120px)", lineHeight: "0.85" }}
              >
              <span style={{ color: "#0a0a0a" }}>CAMP </span>
              <span style={{ color: "#ed2024" }}>REGISTRATION</span>
            </h1>
            </div>

            {/* Red subtitle */}
            <p
              className="font-body font-bold"
              style={{ color: "#000000", fontSize: "clamp(1rem, 1.4vw, 20px)", lineHeight: "28px" }}
            >
              Join us for an incredible week of gaming, learning, and competition.
            </p>

            {/* Body copy */}
            <div
              className="font-body"
              style={{ color: "#374151", fontSize: "clamp(0.9375rem, 1.25vw, 18px)", lineHeight: "28px" }}
            >
              <p>
                <span style={{ color: "#374151" }}>EKUZO</span>
                <span className="font-bold" style={{ color: "#000000" }}>CAMP</span>
                <span style={{ color: "#374151" }}>{" "}is a week long esports camp for beginners to intermediate players. However, it will challenge all skill levels.</span>
              </p>
              <p style={{ lineHeight: "32px" }}>&nbsp;</p>
              <p style={{ color: "#374151" }}>
                If you&apos;re looking for multiple weeks please enroll in{" "}
                <a href="/programs/ekuzo100" className="font-bold underline" style={{ color: "#ed2024" }}>
                  EKUZO100
                </a>
                . Our month long program perfect for those looking to level up.
              </p>
            </div>
          </div>
        </div>

        {/* Hero collage — desktop: absolute right half; mobile: below content */}
        {/* Desktop */}
        <div
          className="hidden lg:block absolute pointer-events-none"
          style={{ bottom: "0", left: "46%", width: "1300px", maxWidth: "65%", height: "105%", overflow: "hidden" }}
        >
          <Image
            src="/images/camp-hero-collage.png"
            alt="EKUZO Camp hero collage with game characters and young gamer"
            width={1822}
            height={1112}
            className="w-full h-full object-contain object-bottom"
            priority
          />
        </div>
        {/* Mobile */}
        <div className="lg:hidden relative w-full -mt-24 mb-0 overflow-hidden">
          <Image
            src="/images/camp-hero-collage.png"
            alt="EKUZO Camp hero collage with game characters and young gamer"
            width={1822}
            height={1112}
            className="w-[115%] max-w-none h-auto object-contain -ml-[5%]"
            priority
          />
        </div>

        {/* White torn paper overlay — anchored to bottom of hero, overlapping only the image */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none translate-y-[55%]">
          <Image
            src="/images/torn-paper-white-1.png"
            alt=""
            width={4320}
            height={600}
            className="w-full h-auto block"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ── Form body ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 py-16 md:py-24">

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
                EKUZO Camp — {joiningCrewInfo.week_label} ({joiningCrewInfo.week_dates}) {joiningCrewInfo.slot}.
                We&apos;ve pre-selected this week for you below.
              </p>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-8 p-5 bg-red/10 border border-red/30 rounded-sm">
              {errors.map((e, i) => (
                <p key={i} className="font-body text-red text-sm mb-1 last:mb-0">
                  {e}
                </p>
              ))}
            </div>
          )}

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
                            {selectedWeek?.label} — {selectedWeek?.dates}
                          </span>
                          <span
                            className="font-body text-[#0a0a0a]"
                            style={{ fontSize: "14px", lineHeight: "20px" }}
                          >
                            {gamer.selectedSlot === "AM"
                              ? "Morning"
                              : "Afternoon"}{" "}
                            Session (
                            {gamer.selectedSlot
                              ? SLOT_HOURS[gamer.selectedSlot]
                              : ""}
                            )
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

                return (
                  <div className="mb-10">
                    <h2
                      className="font-display uppercase text-black leading-[0.85]"
                      style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
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
                      Teams will be built on availability per time zone and
                      preferred time slot.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                      {WEEKS.map((week) => {
                        const isSelectedWeek =
                          gamer.selectedWeek === week.number;
                        return (
                          <div
                            key={week.number}
                            className={`relative bg-[#f5f5f7] p-[33px] flex flex-col gap-6 transition-all ${
                              isSelectedWeek
                                ? "ring-2 ring-red shadow-lg shadow-red/10"
                                : ""
                            }`}
                            style={{ clipPath: `url(#${TORN_PAPER_CLIP_ID})` }}
                          >
                            {/* Card header */}
                            <div className="flex items-start justify-between">
                              <div
                                className="flex flex-col"
                                style={{ gap: "4.5px" }}
                              >
                                <span
                                  className="font-body font-bold text-red uppercase"
                                  style={{
                                    fontSize: "12px",
                                    letterSpacing: "1.2px",
                                    lineHeight: "16px",
                                  }}
                                >
                                  {week.label}
                                </span>
                                <span
                                  className="font-display text-[#0a0a0a] uppercase"
                                  style={{
                                    fontSize: "clamp(2rem, 2.5vw, 36px)",
                                    lineHeight: "1.1",
                                  }}
                                >
                                  {week.dates}
                                </span>
                              </div>
                              <div className="bg-white rounded px-3 py-1 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-baseline gap-2">
                                {week.originalPrice && (
                                  <span className="font-body text-[#9ca3af] text-xs line-through leading-5">
                                    ${week.originalPrice}
                                  </span>
                                )}
                                <span className="font-body font-bold text-[#0a0a0a] text-sm leading-5">
                                  ${week.price}
                                </span>
                              </div>
                            </div>

                            {/* Slot cards */}
                            <div className="flex flex-col gap-4">
                              <SessionCard
                                sessionLabel="Morning Session"
                                slotLabel="AM"
                                hours={SLOT_HOURS.AM}
                                urgency={week.amUrgency}
                                isSelected={
                                  isSelectedWeek && gamer.selectedSlot === "AM"
                                }
                                onClick={() =>
                                  selectSlot(gi, week.number, "AM")
                                }
                              />
                              <SessionCard
                                sessionLabel="Afternoon Session"
                                slotLabel="PM"
                                hours={SLOT_HOURS.PM}
                                urgency={week.pmUrgency}
                                isSelected={
                                  isSelectedWeek && gamer.selectedSlot === "PM"
                                }
                                onClick={() =>
                                  selectSlot(gi, week.number, "PM")
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── Divider ──────────────────────────────────────────── */}
              <hr className="border-t border-black/10 my-12" />

              {/* ── Gamer Info ──────────────────────────────────────── */}
              {/* Scroll target when a time slot is picked (see selectSlot).
                  scrollMarginTop leaves room for the fixed nav so the h3
                  doesn't end up hidden behind it. */}
              <div
                id={`gamer-${gi}-info`}
                className="mb-8"
                style={{ scrollMarginTop: "100px" }}
              >
                <h3
                  className="font-display uppercase text-black leading-[0.85] mb-6"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  Tell us about your gamer{gamers.length > 1 ? ` (${gi + 1})` : ""}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                  <InputField
                    label="First Name *"
                    required
                    value={gamer.firstName}
                    onChange={(v) => updateGamer(gi, { firstName: v })}
                    placeholder="Enter first name"
                  />
                  <InputField
                    label="Last Name *"
                    required
                    value={gamer.lastName}
                    onChange={(v) => updateGamer(gi, { lastName: v })}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="mt-6">
                  <InputField
                    label="Gamer Tag / Username"
                    value={gamer.gamerTag}
                    onChange={(v) => updateGamer(gi, { gamerTag: v })}
                    placeholder="Enter gamer tag"
                  />
                </div>

                {/* Favorite Games — 4-col checkbox grid */}
                <div className="mt-6">
                  <label className="font-body font-bold text-[#374151] block mb-3" style={{ fontSize: "14px", lineHeight: "20px" }}>
                    Favorite Games * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                    {GAMES.map((game) => {
                      const checked = gamer.preferredGames.includes(game);
                      return (
                        <label key={game} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleGame(gi, game)}
                            className="w-5 h-5 rounded-sm border border-[#767676] accent-red cursor-pointer"
                          />
                          <span className="font-body font-medium text-[#0a0a0a] text-sm leading-5">
                            {game}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Birthday / Gender / Gaming Experience — 2-col grid; 3rd item wraps to second row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mt-6">
                  <InputField
                    label="Birthday *"
                    type="date"
                    value={gamer.birthday}
                    onChange={(v) => updateGamer(gi, { birthday: v })}
                  />
                  <SelectField
                    label="Gender *"
                    value={gamer.gender}
                    onChange={(v) => updateGamer(gi, { gender: v })}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />
                  <SelectField
                    label="Gaming Experience *"
                    value={gamer.skillLevel}
                    onChange={(v) => updateGamer(gi, { skillLevel: v })}
                    options={SKILL_LEVELS}
                    placeholder="Select..."
                  />
                </div>
              </div>

              {/* Divider between gamers */}
              {gi < gamers.length - 1 && (
                <hr className="border-t-2 border-black/10 my-10" />
              )}
            </div>
          ))}

          {/* ── Add another gamer ──────────────────────────────────── */}
          <button
            type="button"
            onClick={addGamer}
            className="w-full py-4 border-2 border-dashed border-black/20 rounded-sm font-body font-semibold text-black/50 hover:border-red/40 hover:text-red/70 hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 cursor-pointer mb-12"
          >
            + Add Another Gamer
          </button>

          {/* ── Team Status (vibe check) ───────────────────────────── */}
          {/* Hidden when arriving via a crew link (?squad=TOKEN). Per
              QA-FLAGGED-ISSUES #10, showing this selector to a joining
              visitor caused accidental double-registration (joiner AND
              new crew owner with a fresh squad_token). The top banner
              already tells them they're joining, so we skip the vibe
              check entirely and submit as a pure join. */}
          {!joiningSquadToken && (
            <>
              <hr className="border-t border-black/10 my-12" />
              <div className="mb-12">
                <h2
                  className="font-display uppercase text-black leading-[0.85] mb-6"
                  style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
                >
                  Team status
                </h2>
                <p
                  className="font-body text-[#4b5563] mb-8"
                  style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "28px" }}
                >
                  How should we think about your gamer&apos;s team?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SquadCard
                    title="Building a team"
                    subtitle="My gamer is joining with friends"
                    isSelected={squadStatus === "building"}
                    onClick={() => setSquadStatus("building")}
                  />
                  <SquadCard
                    title="Looking for a team"
                    subtitle="Match my gamer with a great team"
                    isSelected={squadStatus === "looking"}
                    onClick={() => setSquadStatus("looking")}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Parent / Guardian Info ─────────────────────────────── */}
          <hr className="border-t border-black/10 my-12" />
          <div className="mb-12">
            <h2
              className="font-display uppercase text-black leading-[0.85] mb-10"
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
            >
              Parent Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <InputField
                label="Parent First Name *"
                required
                value={parent.firstName}
                onChange={(v) => setParent((p) => ({ ...p, firstName: v }))}
                placeholder="Enter first name"
              />
              <InputField
                label="Parent Last Name *"
                required
                value={parent.lastName}
                onChange={(v) => setParent((p) => ({ ...p, lastName: v }))}
                placeholder="Enter last name"
              />
              <InputField
                label="Email *"
                type="email"
                required
                value={parent.email}
                onChange={(v) => setParent((p) => ({ ...p, email: v }))}
                placeholder="your.email@example.com"
              />
              <InputField
                label="Phone Number *"
                type="tel"
                value={parent.phone}
                onChange={(v) => setParent((p) => ({ ...p, phone: v }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* ── Additional Info ─────────────────────────────────────── */}
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
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              placeholder="Tell us more."
              className="font-body text-[#0a0a0a] w-full bg-[#f9fafb] border border-[#e5e7eb] rounded p-4 outline-none focus:border-[#0a0a0a] transition-colors resize-y"
              style={{ fontSize: "16px", lineHeight: "24px" }}
            />
          </div>

          {/* ── Summary Overview ────────────────────────────────────── */}
          <div className="mb-8 border border-[#e5e7eb] rounded-sm overflow-hidden">
            <div className="bg-[#f5f5f7] px-6 py-4 border-b border-[#e5e7eb]">
              <h3
                className="font-display uppercase text-[#0a0a0a]"
                style={{ fontSize: "clamp(2rem, 3vw, 28px)", lineHeight: "1.1" }}
              >
                Registration Summary
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
                            {s.weekLabel} — {s.weekDates}
                          </span>
                          <span className="font-body text-[#6b7280] text-sm">
                            {s.slot === "AM" ? "Morning" : "Afternoon"} Session ({s.slotHours})
                          </span>
                        </div>
                        <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap flex items-baseline gap-1.5">
                          {s.originalPrice && (
                            <span className="font-normal text-[#9ca3af] line-through">
                              ${s.originalPrice}
                            </span>
                          )}
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
                    Total (Limited-Time Pricing)
                  </span>
                  <span className="font-display text-[#0a0a0a]" style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}>
                    ${totalPrice}
                  </span>
                </div>
              )}
            </div>
          </div>

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

              <p className="font-body text-black/40 text-center mt-4" style={{ fontSize: "clamp(0.75rem, 1.1vw, 0.8125rem)" }}>
                You&apos;ll enter payment details below. By registering you agree to our{" "}
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
                    style={{ fontSize: "clamp(1.25rem, 2vw, 28px)", lineHeight: "32px" }}
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${siteUrl}/programs/ekuzo-camps/success?payment_intent=${paymentIntentId}`,
        receipt_email: parentEmail,
      },
    });

    // If error, the user stays on this page (redirect only happens on success)
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-black/30">
          <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12.5c-3.03 0-5.5-2.47-5.5-5.5S4.97 2.5 8 2.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z" fill="currentColor"/>
          <path d="M7 7h2v5H7V7zm0-3h2v2H7V4z" fill="currentColor"/>
        </svg>
        <p className="font-body text-black/40 text-sm">
          Secured by Stripe. Your payment info never touches our servers.
        </p>
      </div>
    </form>
  );
}

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

function SessionCard({
  sessionLabel,
  slotLabel,
  hours,
  urgency,
  isSelected,
  onClick,
}: {
  sessionLabel: string;
  slotLabel: "AM" | "PM";
  hours: string;
  urgency?: SlotUrgency;
  isSelected: boolean;
  onClick: () => void;
}) {
  const urgencyStyles: Record<SlotUrgency, { bg: string; text: string; label: string }> = {
    available: { bg: "bg-[#dcfce7]", text: "text-[#15803d]", label: "Available" },
    "filling-fast": { bg: "bg-[#ffedd5]", text: "text-[#c2410c]", label: "Filling Fast" },
    limited: { bg: "bg-[#ffedd5]", text: "text-[#c2410c]", label: "Only a Few Left" },
  };

  const u = urgencyStyles[urgency ?? "available"];

  return (
    <div
      className={`bg-white rounded-lg p-4 flex flex-col gap-3 transition-all ${
        isSelected ? "ring-2 ring-red" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="font-body font-bold text-[#1f2937]" style={{ fontSize: "16px", lineHeight: "24px" }}>
          {sessionLabel}
        </span>
        <span
          className={`rounded px-2 py-0.5 font-body font-black uppercase ${u.bg} ${u.text}`}
          style={{ fontSize: "10px", lineHeight: "15px" }}
        >
          {u.label}
        </span>
      </div>

      {/* Time */}
      <span className="font-body font-medium text-[#6b7280]" style={{ fontSize: "14px", lineHeight: "20px" }}>
        {hours}
      </span>

      {/* Button */}
      <button
        type="button"
        onClick={onClick}
        className={`rounded text-center py-2.5 cursor-pointer transition-all duration-150 hover:brightness-110 active:scale-[0.97] active:brightness-90 ${
          isSelected
            ? "bg-red text-white"
            : "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
        }`}
      >
        <span className="font-body font-bold" style={{ fontSize: "14px", lineHeight: "20px" }}>
          Book {slotLabel} Slot
        </span>
      </button>
    </div>
  );
}

function InputField({
  label,
  required,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body font-bold text-[#374151]" style={{ fontSize: "14px", lineHeight: "20px" }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-body text-[#0a0a0a] bg-[#f9fafb] border border-[#e5e7eb] rounded p-[17px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#9ca3af]"
        style={{ fontSize: "16px", lineHeight: "normal" }}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body font-bold text-[#374151]" style={{ fontSize: "14px", lineHeight: "20px" }}>
        {label}
      </label>
      <select
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
