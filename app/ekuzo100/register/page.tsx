"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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

type GamerInfo = {
  firstName: string;
  lastName: string;
  gamerTag: string;
  birthday: string;
  gender: string;
  skillLevel: string;
  preferredGames: string[];
  schedulePreference: string;
};

type CohortOption = {
  label: string;
  value: string;
  startDate: string;
  endDate: string;
  closed: boolean;
};

// ── Data ─────────────────────────────────────────────────────────────────────

const PRICE = 100;

const GAMES = [
  "League of Legends",
  "Valorant",
  "Fortnite",
  "Rocket League",
  "Roblox",
  "Other",
];

const SKILL_LEVELS = [
  "Beginner — new to gaming or this game",
  "Intermediate — plays regularly, knows the basics",
  "Advanced — competitive / plays ranked",
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary"];

const SCHEDULE_OPTIONS = [
  { label: "Afternoon (4:00–5:30 PM)", value: "afternoon" },
  { label: "Evening (7:00–8:30 PM)", value: "evening" },
];

// ── Cohort month calculation ────────────────────────────────────────────────

function getAvailableCohorts(): CohortOption[] {
  const now = new Date();
  const cohorts: CohortOption[] = [];

  // Generate next 3 months, filter to the 2 that are still open
  for (let offset = 0; offset < 4 && cohorts.length < 2; offset++) {
    const year = now.getFullYear();
    const month = now.getMonth() + offset;
    const cohortDate = new Date(year, month, 1);

    // Cohort starts first Monday of the month (or first week)
    const firstDay = new Date(cohortDate.getFullYear(), cohortDate.getMonth(), 1);
    // Find first Monday
    const dayOfWeek = firstDay.getDay();
    const firstMonday = dayOfWeek <= 1 ? 1 + (1 - dayOfWeek) : 1 + (8 - dayOfWeek);
    const startDate = new Date(cohortDate.getFullYear(), cohortDate.getMonth(), firstMonday);

    // End date = 4 weeks later (28 days)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 27); // 4 weeks inclusive

    // Close date = 1 week before start
    const closeDate = new Date(startDate);
    closeDate.setDate(closeDate.getDate() - 7);

    const closed = now > closeDate;

    // Skip if already closed
    if (closed) continue;

    const monthName = cohortDate.toLocaleString("en-US", { month: "long" });
    const yearStr = cohortDate.getFullYear();

    const formatShort = (d: Date) =>
      `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}`;

    cohorts.push({
      label: `${monthName} ${yearStr} Cohort`,
      value: `${yearStr}-${String(cohortDate.getMonth() + 1).padStart(2, "0")}`,
      startDate: formatShort(startDate),
      endDate: formatShort(endDate),
      closed,
    });
  }

  return cohorts;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAgeAtStart(birthday: string, startMonth: string): number | null {
  if (!birthday || !startMonth) return null;
  const match = birthday.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  if (year < 1900 || year > 2026) return null;

  const [startYear, startMo] = startMonth.split("-").map(Number);
  const programStart = new Date(startYear, startMo - 1, 1);
  const bday = new Date(year, parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  if (isNaN(bday.getTime())) return null;

  let age = programStart.getFullYear() - bday.getFullYear();
  const monthDiff = programStart.getMonth() - bday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && programStart.getDate() < bday.getDate())) {
    age--;
  }
  return age;
}

function getAgeNotice(birthday: string, selectedCohort: string): string | null {
  const age = getAgeAtStart(birthday, selectedCohort);
  if (age === null) return null;
  if (age < 10 || age > 18) {
    return 'The recommended age for EKUZO100 is 10–18. If your gamer is outside that range, please mention it in the "Additional Information" section below so we can plan accordingly.';
  }
  return null;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function Ekuzo100RegisterPage() {
  const [parent, setParent] = useState<ParentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [gamer, setGamer] = useState<GamerInfo>({
    firstName: "",
    lastName: "",
    gamerTag: "",
    birthday: "",
    gender: "",
    skillLevel: "",
    preferredGames: [],
    schedulePreference: "",
  });

  const [selectedCohort, setSelectedCohort] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const cohorts = getAvailableCohorts();

  // ── Gamer field helpers ──────────────────────────────────────────────────

  function updateGamer(updates: Partial<GamerInfo>) {
    setGamer((prev) => ({ ...prev, ...updates }));
  }

  function toggleGame(game: string) {
    setGamer((prev) => ({
      ...prev,
      preferredGames: prev.preferredGames.includes(game)
        ? prev.preferredGames.filter((g) => g !== game)
        : [...prev.preferredGames, game],
    }));
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): string[] {
    const errs: string[] = [];

    // Parent
    if (!parent.firstName.trim()) errs.push("Parent first name is required.");
    if (!parent.lastName.trim()) errs.push("Parent last name is required.");
    if (!parent.email.trim()) errs.push("Parent email is required.");

    // Cohort
    if (!selectedCohort) errs.push("Please select a cohort month.");

    // Gamer
    if (!gamer.firstName.trim()) errs.push("Gamer first name is required.");
    if (!gamer.lastName.trim()) errs.push("Gamer last name is required.");
    if (!gamer.gamerTag.trim()) errs.push("Gamer tag / username is required.");
    if (!gamer.birthday) errs.push("Gamer birthday is required.");
    if (!gamer.gender) errs.push("Please select a gender.");
    if (!gamer.preferredGames.length)
      errs.push("Please select at least one preferred game.");
    if (!gamer.schedulePreference)
      errs.push("Please select a schedule preference.");

    return errs;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    const cohortData = cohorts.find((c) => c.value === selectedCohort);

    const payload = {
      parent,
      gamer: {
        ...gamer,
        preferredGames: gamer.preferredGames,
      },
      cohort: {
        value: selectedCohort,
        label: cohortData?.label || "",
        startDate: cohortData?.startDate || "",
        endDate: cohortData?.endDate || "",
      },
      additionalInfo,
      totalPrice: PRICE,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const res = await fetch("/api/ekuzo100/register", {
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
      setIsSubmitting(false);

      setTimeout(() => {
        document
          .getElementById("payment-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setErrors(["Something went wrong. Please try again."]);
      setIsSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const cohortData = cohorts.find((c) => c.value === selectedCohort);

  return (
    <>
      <Nav variant="light" />

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative bg-[#f5f5f7]" style={{ overflow: "clip" }}>
        <div
          className="max-w-[1280px] mx-auto relative"
          style={{
            paddingTop: "128px",
            paddingBottom: "140px",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <div
            className="relative z-10 flex flex-col items-start"
            style={{ gap: "24px", maxWidth: "544px" }}
          >
            {/* Program badge */}
            <div
              className="inline-flex items-center rounded-full"
              style={{
                backgroundColor: "#fef2f2",
                padding: "8px 16px",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2L10.12 6.3L15 7L11.5 10.4L12.24 15L8 12.8L3.76 15L4.5 10.4L1 7L5.88 6.3L8 2Z"
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="font-body font-bold"
                style={{
                  color: "#dc2626",
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "0.3px",
                }}
              >
                4-Week Intro Program — $100
              </span>
            </div>

            {/* Heading */}
            <h1
              className="font-display uppercase"
              style={{
                fontSize: "clamp(3rem, 6.25vw, 120px)",
                lineHeight: "96px",
              }}
            >
              <span style={{ color: "#0a0a0a" }}>EKUZO</span>
              <span style={{ color: "#ed2024" }}>100</span>
              <br />
              <span
                style={{
                  color: "#0a0a0a",
                  fontSize: "clamp(2rem, 4vw, 72px)",
                  lineHeight: "72px",
                }}
              >
                REGISTRATION
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="font-body font-bold"
              style={{
                color: "#ed2024",
                fontSize: "clamp(1rem, 1.4vw, 20px)",
                lineHeight: "28px",
              }}
            >
              One month. $100. Your first team.
            </p>

            {/* Body copy */}
            <div
              className="font-body"
              style={{
                color: "#374151",
                fontSize: "clamp(0.9375rem, 1.25vw, 18px)",
                lineHeight: "28px",
              }}
            >
              <p>
                EKUZO100 is the low-risk way to start. Your gamer joins a
                5-player team, trains with a dedicated coach twice a week, and
                competes in real matches — all in just 4 weeks.
              </p>
              <p className="mt-4">
                No long-term commitment. No contracts. Just a month of real
                growth.
              </p>
            </div>
          </div>
        </div>

        {/* White torn paper overlay */}
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
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-8 p-5 bg-red/10 border border-red/30 rounded-sm">
              {errors.map((e, i) => (
                <p
                  key={i}
                  className="font-body text-red text-sm mb-1 last:mb-0"
                >
                  {e}
                </p>
              ))}
            </div>
          )}

          {/* ── Cohort Selection ──────────────────────────────────────── */}
          <div className="mb-12">
            <h2
              className="font-body font-bold text-red"
              style={{
                fontSize: "clamp(1.25rem, 2vw, 24px)",
                lineHeight: "32px",
              }}
            >
              Choose your cohort month:
            </h2>
            <p
              className="font-body text-[#4b5563] mt-4"
              style={{
                fontSize: "clamp(0.875rem, 1.2vw, 16px)",
                lineHeight: "28px",
              }}
            >
              EKUZO100 is a 4-week commitment starting the first week of the
              month. Sessions are twice a week, 90 minutes each. Registration
              closes one week before the cohort starts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {cohorts.map((cohort) => {
                const isSelected = selectedCohort === cohort.value;
                return (
                  <button
                    key={cohort.value}
                    type="button"
                    onClick={() => setSelectedCohort(cohort.value)}
                    className={`relative text-left p-8 flex flex-col gap-3 transition-all cursor-pointer hover:brightness-[1.02] active:scale-[0.99] active:brightness-90 ${
                      isSelected
                        ? "bg-[#0a0a0a] ring-2 ring-red shadow-lg shadow-red/10"
                        : "bg-[#f5f5f7]"
                    }`}
                  >
                    <span
                      className={`font-body font-bold uppercase ${
                        isSelected ? "text-red" : "text-red"
                      }`}
                      style={{
                        fontSize: "12px",
                        letterSpacing: "1.2px",
                        lineHeight: "16px",
                      }}
                    >
                      EKUZO100
                    </span>
                    <span
                      className={`font-display uppercase ${
                        isSelected ? "text-white" : "text-[#0a0a0a]"
                      }`}
                      style={{
                        fontSize: "clamp(1.5rem, 2.5vw, 36px)",
                        lineHeight: "40px",
                      }}
                    >
                      {cohort.label}
                    </span>
                    <span
                      className={`font-body ${
                        isSelected ? "text-white/60" : "text-[#6b7280]"
                      }`}
                      style={{ fontSize: "14px", lineHeight: "20px" }}
                    >
                      {cohort.startDate} – {cohort.endDate}
                    </span>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`font-body font-bold ${
                          isSelected ? "text-white" : "text-[#0a0a0a]"
                        }`}
                        style={{ fontSize: "24px" }}
                      >
                        $100
                      </span>
                      {isSelected && (
                        <span
                          className="font-body font-bold text-red uppercase"
                          style={{ fontSize: "12px", letterSpacing: "1px" }}
                        >
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Schedule Preference ───────────────────────────────────── */}
          <div className="mb-12">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-2"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              Schedule Preference *
            </h3>
            <p className="font-body text-[#6b7280] text-sm mb-6">
              Sessions are twice a week (days are flexible based on your
              cohort&apos;s availability). Which window works best?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {SCHEDULE_OPTIONS.map((opt) => {
                const isSelected = gamer.schedulePreference === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateGamer({ schedulePreference: opt.value })}
                    className={`flex-1 py-4 px-6 text-center font-body font-bold transition-all cursor-pointer hover:brightness-110 active:scale-[0.97] active:brightness-90 ${
                      isSelected
                        ? "bg-red text-white"
                        : "bg-[#f5f5f7] text-[#0a0a0a] hover:bg-[#e8e8ea]"
                    }`}
                    style={{ fontSize: "16px", lineHeight: "24px" }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Gamer Info ────────────────────────────────────────────── */}
          <div className="mb-12">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-6"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              Tell us about your gamer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <InputField
                label="First Name *"
                required
                value={gamer.firstName}
                onChange={(v) => updateGamer({ firstName: v })}
                placeholder="Enter first name"
              />
              <InputField
                label="Last Name *"
                required
                value={gamer.lastName}
                onChange={(v) => updateGamer({ lastName: v })}
                placeholder="Enter last name"
              />
            </div>

            <div className="mt-6">
              <InputField
                label="Gamer Tag / Username *"
                value={gamer.gamerTag}
                onChange={(v) => updateGamer({ gamerTag: v })}
                placeholder="Enter gamer tag"
              />
            </div>

            {/* Preferred Games */}
            <div className="mt-6">
              <label
                className="font-body font-bold text-[#374151] block mb-3"
                style={{ fontSize: "14px", lineHeight: "20px" }}
              >
                Preferred Games * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                {GAMES.map((game) => {
                  const checked = gamer.preferredGames.includes(game);
                  return (
                    <label
                      key={game}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGame(game)}
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

            {/* Birthday / Gender / Skill Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6 mt-6">
              <InputField
                label="Birthday *"
                type="date"
                value={gamer.birthday}
                onChange={(v) => updateGamer({ birthday: v })}
                hint={
                  gamer.birthday && selectedCohort
                    ? getAgeNotice(gamer.birthday, selectedCohort)
                    : null
                }
              />
              <SelectField
                label="Gender *"
                value={gamer.gender}
                onChange={(v) => updateGamer({ gender: v })}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
              />
              <SelectField
                label="Gaming Skill Level *"
                value={gamer.skillLevel}
                onChange={(v) => updateGamer({ skillLevel: v })}
                options={SKILL_LEVELS}
                placeholder="Select gaming experience"
              />
            </div>
          </div>

          {/* ── Parent / Guardian Info ─────────────────────────────────── */}
          <div className="mb-12">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-6"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              Parent Information
            </h3>

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
                onChange={(v) =>
                  setParent((p) => ({ ...p, phone: formatPhone(v) }))
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* ── Additional Info ────────────────────────────────────────── */}
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
              onChange={(e) =>
                setAdditionalInfo(e.target.value.slice(0, 1500))
              }
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

          {/* ── Summary ───────────────────────────────────────────────── */}
          <div className="mb-8 border border-[#e5e7eb] rounded-sm overflow-hidden">
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
              {!selectedCohort ? (
                <p className="font-body text-[#9ca3af] text-sm">
                  Select a cohort month above to see your summary.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-body font-bold text-[#0a0a0a] text-sm">
                        {gamer.firstName.trim() || "Your Gamer"} —{" "}
                        EKUZO100
                      </span>
                      <span className="font-body text-[#6b7280] text-sm">
                        {cohortData?.label}
                      </span>
                      <span className="font-body text-[#6b7280] text-sm">
                        {cohortData?.startDate} – {cohortData?.endDate}
                      </span>
                      {gamer.schedulePreference && (
                        <span className="font-body text-[#6b7280] text-sm">
                          {SCHEDULE_OPTIONS.find(
                            (o) => o.value === gamer.schedulePreference
                          )?.label || gamer.schedulePreference}
                        </span>
                      )}
                    </div>
                    <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap">
                      ${PRICE}
                    </span>
                  </div>

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
                      ${PRICE}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CTA / Payment ─────────────────────────────────────────── */}
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
                  : "Continue to payment — $100"}
              </button>

              <p
                className="font-body text-black/40 text-center mt-4"
                style={{
                  fontSize: "clamp(0.75rem, 1.1vw, 0.8125rem)",
                }}
              >
                You&apos;ll enter payment details below. By registering you
                agree to our{" "}
                <a
                  href="/terms-of-service"
                  className="underline hover:text-black/60"
                >
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

      <Footer />
    </>
  );
}

// ── Stripe Checkout Form ────────────────────────────────────────────────────

function CheckoutForm({
  paymentIntentId,
  parentEmail,
}: {
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
        return_url: `${siteUrl}/ekuzo100/success?payment_intent=${paymentIntentId}`,
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
        {isProcessing ? "Processing payment..." : `Pay $${PRICE}`}
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
          <path
            d="M7 7h2v5H7V7zm0-3h2v2H7V4z"
            fill="currentColor"
          />
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
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="font-body font-bold text-[#374151]"
        style={{ fontSize: "14px", lineHeight: "20px" }}
      >
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
      {hint && (
        <p className="font-body text-[#c2410c] text-xs leading-4">{hint}</p>
      )}
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
      <label
        className="font-body font-bold text-[#374151]"
        style={{ fontSize: "14px", lineHeight: "20px" }}
      >
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
