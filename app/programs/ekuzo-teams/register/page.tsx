"use client";

import { useState } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
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
  tshirtSize: string;
  timePreference: string;
  firstSemester: string;
  preferredGames: string[];
};

type PaymentPlan = "upfront" | "installment";

// ── Data ─────────────────────────────────────────────────────────────────────

const UPFRONT_PRICE = 576;
const INSTALLMENT_MONTHLY = 160;
const INSTALLMENT_TOTAL = 640;

const SEMESTER = {
  label: "Fall 2026",
  startWeek: "Week of August 31, 2026",
  endApprox: "December 2026",
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

const TSHIRT_SIZES = ["YS", "YM", "YL", "AS", "AM", "AL", "AXL"];

const TIME_PREFERENCES = [
  "After School (4:00–5:30)",
  "Evening (7:00–8:30)",
  "No Preference",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function createEmptyGamer(): GamerInfo {
  return {
    firstName: "",
    lastName: "",
    gamerTag: "",
    birthday: "",
    gender: "",
    skillLevel: "",
    tshirtSize: "",
    timePreference: "",
    firstSemester: "",
    preferredGames: [],
  };
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function EkuzoTeamsRegisterPage() {
  const [parent, setParent] = useState<ParentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [gamers, setGamers] = useState<GamerInfo[]>([createEmptyGamer()]);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("installment");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [chargeNow, setChargeNow] = useState<number>(0);
  const [showPayment, setShowPayment] = useState(false);

  // ── Gamer CRUD ──────────────────────────────────────────────────────────

  function addGamer() {
    if (gamers.length < 5) {
      setGamers((prev) => [...prev, createEmptyGamer()]);
    }
  }

  function removeGamer(index: number) {
    if (gamers.length > 1) {
      setGamers((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function updateGamer(index: number, updates: Partial<GamerInfo>) {
    setGamers((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  }

  function toggleGame(index: number, game: string) {
    setGamers((prev) =>
      prev.map((g, i) =>
        i === index
          ? {
              ...g,
              preferredGames: g.preferredGames.includes(game)
                ? g.preferredGames.filter((gm) => gm !== game)
                : [...g.preferredGames, game],
            }
          : g
      )
    );
  }

  // ── Pricing ─────────────────────────────────────────────────────────────

  const gamerCount = gamers.length;
  const totalUpfront = UPFRONT_PRICE * gamerCount;
  const totalInstallmentMonthly = INSTALLMENT_MONTHLY * gamerCount;
  const totalInstallmentFull = INSTALLMENT_TOTAL * gamerCount;
  const displayChargeNow =
    paymentPlan === "upfront" ? totalUpfront : totalInstallmentMonthly;

  // ── Validation ──────────────────────────────────────────────────────────

  function validate(): string[] {
    const errs: string[] = [];

    // Parent
    if (!parent.firstName.trim()) errs.push("Parent first name is required.");
    if (!parent.lastName.trim()) errs.push("Parent last name is required.");
    if (!parent.email.trim()) errs.push("Parent email is required.");

    // Gamers
    gamers.forEach((gamer, i) => {
      const label = gamers.length > 1 ? `Gamer ${i + 1}` : "Gamer";
      if (!gamer.firstName.trim())
        errs.push(`${label}: first name is required.`);
      if (!gamer.lastName.trim())
        errs.push(`${label}: last name is required.`);
      if (!gamer.birthday) errs.push(`${label}: birthday is required.`);
      if (!gamer.gender) errs.push(`${label}: please select a gender.`);
      if (!gamer.timePreference) errs.push(`${label}: please select a preferred time.`);
      if (!gamer.firstSemester) errs.push(`${label}: please indicate if this is their first semester.`);
      if (!gamer.preferredGames.length)
        errs.push(`${label}: please select at least one preferred game.`);
    });

    return errs;
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    const payload = {
      parent,
      gamers,
      paymentPlan,
      additionalInfo,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const res = await fetch("/api/teams/register", {
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
      setChargeNow(data.chargeNow);
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

  // ── Render ──────────────────────────────────────────────────────────────

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
            style={{ gap: "24px", maxWidth: "600px" }}
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
                Semester Program — {SEMESTER.label}
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
              <span style={{ color: "#ed2024" }}>TEAMS</span>
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
              A full semester. A real team. Starts {SEMESTER.startWeek}.
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
                EKUZOTEAMS is our flagship program. Your gamer joins a permanent
                10-player roster, trains with a dedicated coach twice a week,
                competes in structured matches, and develops real leadership and
                communication skills across one full semester.
              </p>
              <p className="mt-4">
                Secure your gamer&apos;s spot now. The semester begins{" "}
                {SEMESTER.startWeek}.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* ── Upsell Banner ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-16 md:pt-24">
          <div
            className="p-6 sm:p-8 rounded-sm border-2 border-red/20"
            style={{ backgroundColor: "#fef7f7" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex-1">
                <p
                  className="font-display uppercase text-red"
                  style={{
                    fontSize: "clamp(1.25rem, 2vw, 28px)",
                    lineHeight: "32px",
                  }}
                >
                  Can&apos;t wait until Fall 2026?
                </p>
                <p
                  className="font-body text-[#374151] mt-2"
                  style={{
                    fontSize: "clamp(0.875rem, 1.1vw, 16px)",
                    lineHeight: "24px",
                  }}
                >
                  Start training now. EKUZOCAMPS (1-week immersive, $199) and
                  EKUZO100 (4-week boot camp, $100) are running today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href="/programs/ekuzo-camps/register"
                  className="inline-flex items-center justify-center font-body font-bold text-white bg-red rounded px-6 py-3 hover:brightness-110 active:scale-[0.97] active:brightness-90 transition-all duration-150"
                  style={{ fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  Register for Camps — $199
                </Link>
                <Link
                  href="/programs/ekuzo100/register"
                  className="inline-flex items-center justify-center font-body font-bold text-red bg-white border-2 border-red rounded px-6 py-3 hover:bg-red/5 active:scale-[0.97] active:brightness-90 transition-all duration-150"
                  style={{ fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  Register for EKUZO100 — $100
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form body ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 py-12 md:py-16">
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

          {/* ── Semester Info ──────────────────────────────────────────── */}
          <div className="mb-12">
            <div
              className="p-8 bg-[#0a0a0a] rounded-sm"
            >
              <span
                className="font-body font-bold uppercase text-red"
                style={{
                  fontSize: "12px",
                  letterSpacing: "1.2px",
                  lineHeight: "16px",
                }}
              >
                EKUZOTeams
              </span>
              <h2
                className="font-display uppercase text-white mt-2"
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 36px)",
                  lineHeight: "40px",
                }}
              >
                {SEMESTER.label} Semester
              </h2>
              <p
                className="font-body text-white/60 mt-2"
                style={{ fontSize: "14px", lineHeight: "20px" }}
              >
                Begins {SEMESTER.startWeek} &middot; Runs through{" "}
                {SEMESTER.endApprox}
              </p>
              <p
                className="font-body text-white/60 mt-1"
                style={{ fontSize: "14px", lineHeight: "20px" }}
              >
                2 sessions/week &middot; 90 min each &middot; 10-player teams
                with dedicated coach
              </p>
            </div>
          </div>

          {/* ── Payment Plan Selection ─────────────────────────────────── */}
          <div className="mb-12">
            <h2
              className="font-body font-bold text-red"
              style={{
                fontSize: "clamp(1.25rem, 2vw, 24px)",
                lineHeight: "32px",
              }}
            >
              Choose your payment plan:
            </h2>
            <p
              className="font-body text-[#4b5563] mt-2"
              style={{
                fontSize: "clamp(0.875rem, 1.2vw, 16px)",
                lineHeight: "24px",
              }}
            >
              Pricing shown is per gamer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {/* Installment option */}
              <button
                type="button"
                onClick={() => setPaymentPlan("installment")}
                className={`relative text-left p-8 flex flex-col gap-3 transition-all cursor-pointer hover:brightness-[1.02] active:scale-[0.99] active:brightness-90 ${
                  paymentPlan === "installment"
                    ? "bg-[#0a0a0a] ring-2 ring-red shadow-lg shadow-red/10"
                    : "bg-[#f5f5f7]"
                }`}
              >
                <span
                  className="font-body font-bold uppercase text-red"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "1.2px",
                    lineHeight: "16px",
                  }}
                >
                  Monthly Payments
                </span>
                <span
                  className={`font-display uppercase ${
                    paymentPlan === "installment"
                      ? "text-white"
                      : "text-[#0a0a0a]"
                  }`}
                  style={{
                    fontSize: "clamp(1.5rem, 2.5vw, 36px)",
                    lineHeight: "40px",
                  }}
                >
                  ${INSTALLMENT_MONTHLY}/mo
                </span>
                <span
                  className={`font-body ${
                    paymentPlan === "installment"
                      ? "text-white/60"
                      : "text-[#6b7280]"
                  }`}
                  style={{ fontSize: "14px", lineHeight: "20px" }}
                >
                  4 payments &middot; ${INSTALLMENT_TOTAL} total per gamer
                </span>
                <span
                  className={`font-body ${
                    paymentPlan === "installment"
                      ? "text-white/50"
                      : "text-[#9ca3af]"
                  }`}
                  style={{ fontSize: "13px", lineHeight: "18px" }}
                >
                  Pay ${INSTALLMENT_MONTHLY} today, then auto-charged Oct, Nov, Dec
                </span>
                <span
                  className={`font-body italic ${
                    paymentPlan === "installment"
                      ? "text-white/40"
                      : "text-[#9ca3af]"
                  }`}
                  style={{ fontSize: "13px", lineHeight: "18px" }}
                >
                  That&apos;s just $20/session for 90 min of coached, small-group training.
                </span>
                {paymentPlan === "installment" && (
                  <span
                    className="font-body font-bold text-red uppercase mt-1"
                    style={{ fontSize: "12px", letterSpacing: "1px" }}
                  >
                    Selected
                  </span>
                )}
              </button>

              {/* Upfront option */}
              <button
                type="button"
                onClick={() => setPaymentPlan("upfront")}
                className={`relative text-left p-8 flex flex-col gap-3 transition-all cursor-pointer hover:brightness-[1.02] active:scale-[0.99] active:brightness-90 ${
                  paymentPlan === "upfront"
                    ? "bg-[#0a0a0a] ring-2 ring-red shadow-lg shadow-red/10"
                    : "bg-[#f5f5f7]"
                }`}
              >
                {/* Savings badge */}
                <div
                  className="absolute top-4 right-4 inline-flex items-center rounded-full bg-[#22c55e]/10 px-3 py-1"
                >
                  <span
                    className="font-body font-bold text-[#16a34a]"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    SAVE 10%
                  </span>
                </div>

                <span
                  className="font-body font-bold uppercase text-red"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "1.2px",
                    lineHeight: "16px",
                  }}
                >
                  Pay in Full
                </span>
                <span
                  className={`font-display uppercase ${
                    paymentPlan === "upfront"
                      ? "text-white"
                      : "text-[#0a0a0a]"
                  }`}
                  style={{
                    fontSize: "clamp(1.5rem, 2.5vw, 36px)",
                    lineHeight: "40px",
                  }}
                >
                  ${UPFRONT_PRICE}
                </span>
                <span
                  className={`font-body ${
                    paymentPlan === "upfront"
                      ? "text-white/60"
                      : "text-[#6b7280]"
                  }`}
                  style={{ fontSize: "14px", lineHeight: "20px" }}
                >
                  One-time payment &middot; Save $
                  {INSTALLMENT_TOTAL - UPFRONT_PRICE} per gamer
                </span>
                <span
                  className={`font-body ${
                    paymentPlan === "upfront"
                      ? "text-white/50"
                      : "text-[#9ca3af]"
                  }`}
                  style={{ fontSize: "13px", lineHeight: "18px" }}
                >
                  Full semester paid today — no future charges
                </span>
                {paymentPlan === "upfront" && (
                  <span
                    className="font-body font-bold text-red uppercase mt-1"
                    style={{ fontSize: "12px", letterSpacing: "1px" }}
                  >
                    Selected
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Gamer Info (multi-gamer) ────────────────────────────────── */}
          <div className="mb-12">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-2"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              Tell us about your gamer{gamers.length > 1 ? "s" : ""}
            </h3>
            <p className="font-body text-[#6b7280] text-sm mb-8">
              Registering siblings? Add up to 5 gamers below.
            </p>

            {gamers.map((gamer, idx) => (
              <div
                key={idx}
                className="mb-8 p-6 sm:p-8 bg-[#f5f5f7] rounded-sm relative"
              >
                {/* Gamer label + remove */}
                <div className="flex items-center justify-between mb-6">
                  <h4
                    className="font-display uppercase text-[#0a0a0a]"
                    style={{
                      fontSize: "clamp(1.25rem, 2vw, 24px)",
                      lineHeight: "28px",
                    }}
                  >
                    Gamer {gamers.length > 1 ? idx + 1 : ""}
                  </h4>
                  {gamers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGamer(idx)}
                      className="font-body text-sm text-red hover:text-red/70 cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                  <InputField
                    label="First Name *"
                    value={gamer.firstName}
                    onChange={(v) => updateGamer(idx, { firstName: v })}
                    placeholder="Enter first name"
                  />
                  <InputField
                    label="Last Name *"
                    value={gamer.lastName}
                    onChange={(v) => updateGamer(idx, { lastName: v })}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="mt-6">
                  <InputField
                    label="Gamer Tag / Username"
                    value={gamer.gamerTag}
                    onChange={(v) => updateGamer(idx, { gamerTag: v })}
                    placeholder="Enter gamer tag (optional)"
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
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
                            onChange={() => toggleGame(idx, game)}
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

                {/* Birthday / Gender / Experience / T-shirt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mt-6">
                  <InputField
                    label="Birthday *"
                    type="date"
                    value={gamer.birthday}
                    onChange={(v) => updateGamer(idx, { birthday: v })}
                  />
                  <SelectField
                    label="Gender *"
                    value={gamer.gender}
                    onChange={(v) => updateGamer(idx, { gender: v })}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                  />
                  <SelectField
                    label="Gaming Experience"
                    value={gamer.skillLevel}
                    onChange={(v) => updateGamer(idx, { skillLevel: v })}
                    options={SKILL_LEVELS}
                    placeholder="Select..."
                  />
                  <SelectField
                    label="Jersey Size *"
                    value={gamer.tshirtSize}
                    onChange={(v) => updateGamer(idx, { tshirtSize: v })}
                    options={TSHIRT_SIZES}
                    placeholder="Select size"
                  />
                  <SelectField
                    label="First EKUZO Teams semester? *"
                    value={gamer.firstSemester}
                    onChange={(v) => updateGamer(idx, { firstSemester: v })}
                    options={["Yes", "No"]}
                    placeholder="Select..."
                  />
                </div>

                {/* Schedule Preference — card-style selector */}
                <div className="mt-6">
                  <label
                    className="font-body font-bold text-[#374151] block mb-2"
                    style={{ fontSize: "14px", lineHeight: "20px" }}
                  >
                    Schedule Preference *
                  </label>
                  <p className="font-body text-[#6b7280] text-sm mb-4">
                    Sessions are twice a week. Which window works best?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {TIME_PREFERENCES.map((opt) => {
                      const isSelected = gamer.timePreference === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => updateGamer(idx, { timePreference: opt })}
                          className={`flex-1 py-4 px-6 text-center font-body font-bold transition-all cursor-pointer hover:brightness-110 active:scale-[0.97] active:brightness-90 ${
                            isSelected
                              ? "bg-red text-white"
                              : "bg-[#f5f5f7] text-[#0a0a0a] hover:bg-[#e8e8ea]"
                          }`}
                          style={{ fontSize: "16px", lineHeight: "24px" }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Add gamer button */}
            {gamers.length < 5 && (
              <button
                type="button"
                onClick={addGamer}
                className="w-full py-4 border-2 border-dashed border-[#d1d5db] rounded-sm font-body font-bold text-[#6b7280] hover:border-red hover:text-red cursor-pointer transition-all duration-150"
                style={{ fontSize: "15px" }}
              >
                + Add another gamer
              </button>
            )}
          </div>

          {/* ── Parent / Guardian Info ─────────────────────────────────── */}
          <div className="mb-12">
            <h3
              className="font-body font-bold text-[#0a0a0a] mb-6"
              style={{ fontSize: "20px", lineHeight: "28px" }}
            >
              Parent / Guardian Information
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
                label="Phone Number"
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
              <div className="flex flex-col gap-4">
                {/* Semester */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
                  <div className="flex flex-col gap-1">
                    <span className="font-body font-bold text-[#0a0a0a] text-sm">
                      {SEMESTER.label} Semester
                    </span>
                    <span className="font-body text-[#6b7280] text-sm">
                      {SEMESTER.startWeek}
                    </span>
                    <span className="font-body text-[#6b7280] text-sm">
                      {paymentPlan === "upfront"
                        ? "Paid in full"
                        : "4 monthly payments"}
                    </span>
                  </div>
                  <span className="font-body text-[#6b7280] text-sm">
                    {paymentPlan === "upfront"
                      ? `$${UPFRONT_PRICE}/gamer`
                      : `$${INSTALLMENT_MONTHLY}/mo/gamer`}
                  </span>
                </div>

                {/* Per-gamer lines */}
                {gamers.map((gamer, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-body font-bold text-[#0a0a0a] text-sm">
                        {gamer.firstName.trim() || `Gamer ${i + 1}`}{" "}
                        {gamer.lastName.trim()}
                      </span>
                      <span className="font-body text-[#6b7280] text-sm">
                        EKUZOTeams &middot; {SEMESTER.label}
                      </span>
                    </div>
                    <span className="font-body font-bold text-[#0a0a0a] text-sm whitespace-nowrap">
                      {paymentPlan === "upfront"
                        ? `$${UPFRONT_PRICE}`
                        : `$${INSTALLMENT_MONTHLY}/mo`}
                    </span>
                  </div>
                ))}

                {/* Jersey line */}
                {gamers.some((g) => g.firstSemester === "Yes") && (
                  <div className="flex items-start justify-between gap-4 pt-3 border-t border-dashed border-[#e5e7eb]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-body font-bold text-[#0a0a0a] text-sm">
                        Team Jersey{gamers.filter((g) => g.firstSemester === "Yes").length > 1 ? "s" : ""}{" "}
                        <span className="font-body font-bold text-[#16a34a] text-xs uppercase tracking-wide ml-1">
                          FREE
                        </span>
                      </span>
                      <span className="font-body text-[#6b7280] text-xs">
                        Custom printed with gamer tag · included for first-time TEAMS members
                      </span>
                    </div>
                    <span className="font-body text-[#9ca3af] text-sm line-through whitespace-nowrap">
                      ${60 * gamers.filter((g) => g.firstSemester === "Yes").length}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between mt-1 pt-4 border-t border-[#e5e7eb]">
                  <div>
                    <span
                      className="font-body font-bold text-[#0a0a0a] block"
                      style={{ fontSize: "16px" }}
                    >
                      {paymentPlan === "upfront"
                        ? "Total due today"
                        : "Due today (1st of 4 payments)"}
                    </span>
                    {paymentPlan === "installment" && (
                      <span className="font-body text-[#6b7280] text-sm">
                        Then ${totalInstallmentMonthly}/mo on Oct, Nov, Dec &middot; ${totalInstallmentFull} total
                      </span>
                    )}
                  </div>
                  <span
                    className="font-display text-[#0a0a0a]"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 28px)" }}
                  >
                    ${displayChargeNow}
                  </span>
                </div>

                {paymentPlan === "upfront" && (
                  <p className="font-body text-[#16a34a] text-sm">
                    You&apos;re saving ${(INSTALLMENT_TOTAL - UPFRONT_PRICE) * gamerCount} with the pay-in-full discount.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── CTA / Payment ─────────────────────────────────────────── */}
          {!showPayment ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                style={{
                  fontSize: "18px",
                  lineHeight: "28px",
                  padding: "20px",
                }}
              >
                {isSubmitting
                  ? "Setting up payment..."
                  : `Continue to payment — $${displayChargeNow}`}
              </button>

              <p
                className="font-body text-black/40 text-center mt-4"
                style={{
                  fontSize: "clamp(0.75rem, 1.1vw, 0.8125rem)",
                }}
              >
                You&apos;ll enter payment details below.
                {paymentPlan === "installment" &&
                  " Your card will be saved for the 3 remaining monthly payments."}{" "}
                By registering you agree to our{" "}
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
                    Payment — ${chargeNow}
                    {paymentPlan === "installment" && " today"}
                  </h3>
                  {paymentPlan === "installment" && (
                    <p className="font-body text-white/50 text-sm mt-1">
                      Your card will be saved and auto-charged $
                      {totalInstallmentMonthly}/mo on Oct, Nov, Dec.
                    </p>
                  )}
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
                      chargeNow={chargeNow}
                      paymentPlan={paymentPlan}
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
  paymentIntentId,
  parentEmail,
  chargeNow,
  paymentPlan,
}: {
  paymentIntentId: string | null;
  parentEmail: string;
  chargeNow: number;
  paymentPlan: PaymentPlan;
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
        return_url: `${siteUrl}/programs/ekuzo-teams/success?payment_intent=${paymentIntentId}`,
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
        {isProcessing
          ? "Processing payment..."
          : paymentPlan === "installment"
          ? `Pay $${chargeNow} today`
          : `Pay $${chargeNow}`}
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
