"use client";

// EKUZO TEAMS REGISTER PAGE — rebuilt 2026-05-25 per the teams
// convergence handoff (`marketing/teams-redesign/01-teams-convergence-handoff.md`)
// Phase 5c. Now a thin shell on the shared register UI
// (`hooks/useRegisterForm.ts` + `components/register/*`), with three
// teams-specific concerns held back from the shared layer:
//   1. Semester selector (single value Fall 2026 — banner-only pre-pin
//      per handoff §1.2; no warn-on-change machinery for a single value).
//   2. Payment plan radio (upfront $576 = 10% off $640 vs. installment
//      1×$160 now + 3×$160 Oct/Nov/Dec via webhook-created Subscription).
//      `02-baseline.md` §2I preservation: trial_end Oct 1 / cancel_at
//      Jan 1 stays in the webhook's Subscription block.
//   3. Sticky sidebar payment math (per-plan totals + Subscription detail).
//
// Drops from the prior 1298-line "rich form" page (handoff §1.3):
//   - gamerTag, gender, skillLevel, tshirtSize, timePreference,
//     firstSemester, preferredGames per-gamer fields. State no longer
//     populated by the form; backend `ClientGamer` defaults them to ""
//     in the per-gamer JSON blob so Stripe metadata + Sheets columns
//     stay byte-stable.
//
// Adds vs. the prior page:
//   - Email-blur → /api/teams/lead (Phase 4 endpoint)
//   - Pre-PI → /api/teams/abandoned (Phase 4 endpoint)
//   - Client-side `squad_token` mint via `nanoid(10)`. The Phase 3
//     server-side helper fallback stays as belt-and-suspenders so any
//     pre-Phase-5 callsite still works.
//   - `?squad=TOKEN` join → fetch /api/squad/[token] → "you're joining
//     [name]'s team" banner. Single-semester = banner-only.
//   - Attribution + cta_source + fbc/fbp threaded through the submit
//     payload via the shared form hook.

import { useState, useEffect } from "react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { trackInitiateCheckout } from "@/lib/analytics";
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

// Minimal post-handoff-§1.3 gamer shape. The /api/teams/register route's
// `ClientGamer` keeps the rich fields as optional — they default to "" in
// the per-gamer JSON blob, so backend storage shape is unchanged.
type GamerInfo = {
  firstName: string;
  lastName: string;
  birthday: string;
};

type PaymentPlan = "upfront" | "installment";

// Squad join — teams pre-pin is single-value (one semester per year), so
// the banner is the whole UX. SquadOwner from the lookup carries the
// camps-shaped week_label/slot/week_dates as empty strings for teams.
type JoiningCrewInfo = {
  owner_gamer_name: string;
};

// ── Data ─────────────────────────────────────────────────────────────────────

const UPFRONT_PRICE = 576;
const INSTALLMENT_MONTHLY = 160;
const INSTALLMENT_TOTAL = 640;
const MAX_GAMERS = 5;

const SEMESTER = {
  label: "Fall 2026",
  startWeek: "Week of August 31, 2026",
  endApprox: "December 2026",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function emptyGamer(): GamerInfo {
  return { firstName: "", lastName: "", birthday: "" };
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function EkuzoTeamsRegisterPage() {
  // Shared register form state + handlers. See hooks/useRegisterForm.ts.
  const form = useRegisterForm({ productSlug: "teams" });
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
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("installment");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Squad-join state. ?squad=TOKEN → fetch /api/squad/[token] → banner.
  // Teams is single-semester, so no week/cohort pre-pin; the banner
  // alone is the entire join experience (handoff §1.2).
  const [joiningSquadToken, setJoiningSquadToken] = useState<string | null>(
    null
  );
  const [joiningCrewInfo, setJoiningCrewInfo] = useState<JoiningCrewInfo | null>(
    null
  );

  // ── Squad owner lookup on mount if ?squad=TOKEN is present ───────────
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
          // 404 / bad token → hand off to /squad/[token], which renders
          // the terminal-state copy (same pattern as camps + e100).
          window.location.href = `/squad/${encodeURIComponent(token)}`;
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        // Reject tokens for the other two products silently — a camps
        // or e100 owner shouldn't pre-pin a teams registration. Mirrors
        // e100's "product !== ekuzo100 → drop the squad param" guard.
        if (data.product !== "teams") return;

        setJoiningSquadToken(token);
        setJoiningCrewInfo({ owner_gamer_name: data.owner_gamer_name });
      } catch {
        if (cancelled) return;
        window.location.href = `/squad/${encodeURIComponent(token)}`;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Gamer management ──────────────────────────────────────────────────
  function updateGamer(index: number, updates: Partial<GamerInfo>) {
    setGamers((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  }

  function addGamer() {
    if (gamers.length >= MAX_GAMERS) return;
    setGamers((prev) => [...prev, emptyGamer()]);
  }

  function removeGamer(index: number) {
    if (gamers.length <= 1) return;
    setGamers((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Pricing (per-gamer × N) ──────────────────────────────────────────
  const gamerCount = gamers.length;
  const totalUpfront = UPFRONT_PRICE * gamerCount;
  const totalInstallmentMonthly = INSTALLMENT_MONTHLY * gamerCount;
  const totalInstallmentFull = INSTALLMENT_TOTAL * gamerCount;
  const chargeNow =
    paymentPlan === "upfront" ? totalUpfront : totalInstallmentMonthly;

  // ── Validation ────────────────────────────────────────────────────────
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

    return errs;
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      scrollToFirstError(errs);
      return;
    }
    setErrors([]);
    setIsSubmitting(true);

    // Mint a fresh squad_token for non-joiners. Joiners inherit the
    // owner's token via joining_squad_token (no new mint, same pattern
    // as camps + e100). Phase 3's helper has a server-side fallback,
    // but minting client-side keeps the token visible if we ever
    // surface it in the success-page URL pre-redirect.
    const squadTokenForSubmit = joiningSquadToken ? null : nanoid(10);

    const attribution = getAttribution();
    const fbc = getFbCookie("_fbc");
    const fbp = getFbCookie("_fbp");

    const payload = {
      parent,
      // Strip the rich fields from per-gamer payload — the backend
      // route accepts the optional shape and defaults them to "".
      gamers: gamers.map((g) => ({
        firstName: g.firstName,
        lastName: g.lastName,
        birthday: g.birthday,
      })),
      paymentPlan,
      additionalInfo,
      totalPrice: chargeNow,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      squad_token: squadTokenForSubmit,
      joining_squad_token: joiningSquadToken,
      attribution,
      cta_source: ctaSource,
      fbc,
      fbp,
    };

    try {
      const res = await fetch("/api/teams/register", {
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

      // Abandoned-cart capture — fires AFTER register API succeeds and
      // BEFORE the parent enters card details. Mirrors camps + e100.
      const firstGamer = gamers[0];
      fetch("/api/teams/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parent.email,
          parent_first_name: parent.firstName,
          parent_last_name: parent.lastName,
          gamer_first_name: firstGamer?.firstName || "",
          semester_label: SEMESTER.label,
          payment_plan: paymentPlan,
        }),
      }).catch(() => {});

      trackInitiateCheckout({ program: "ekuzo-teams", value: chargeNow });
      setIsSubmitting(false);
      scrollToPaymentSection();
    } catch {
      setApiError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <Nav variant="light" />

      {/* Teams gradient: deep navy → red bloom. Compact utility hero
          matching the camps + e100 layout (RegisterHero owns the shape). */}
      <RegisterHero
        background="radial-gradient(ellipse 80% 70% at 0% 0%, rgba(190, 200, 255, 0.55), transparent 60%), radial-gradient(ellipse 80% 70% at 100% 100%, rgba(237, 32, 36, 0.85), transparent 60%), #0a1f4a"
        eyebrow="League of Legends"
        title1="EKUZO"
        title2="TEAMS"
        title2Color="#ED2024"
        subhead={`A full semester. A real team. ${SEMESTER.startWeek}.`}
      />

      {/* ── Form body ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-6 md:pt-10 pb-16 md:pb-24">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              {/* Team-join banner */}
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
                    EKUZOTeams, {SEMESTER.label}. Register below to claim your spot.
                  </p>
                </div>
              )}

              <ErrorSummary errors={errors} />

              {/* Parent info — shared component. Teams uses formatPhone
                  like e100 (digits → "(555) 123-4567"). */}
              <ParentInfoSection
                parent={parent}
                setParent={setParent}
                onEmailBlur={handleEmailBlur}
                formatPhone={formatPhone}
              />

              {/* Per-gamer sections — minimal shape per handoff §1.3. */}
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
                      <InputField
                        label="Birthday *"
                        type="date"
                        errorKey={`gamer-${gi}.birthday`}
                        value={gamer.birthday}
                        onChange={(v) => updateGamer(gi, { birthday: v })}
                      />
                    </div>
                  </div>

                  {gi < gamers.length - 1 && (
                    <hr className="border-t-2 border-black/10 my-10" />
                  )}
                </div>
              ))}

              {/* Add another gamer */}
              {gamers.length < MAX_GAMERS && (
                <button
                  type="button"
                  onClick={addGamer}
                  className="w-full py-4 border-2 border-dashed border-black/20 rounded-sm font-body font-semibold text-black/50 hover:border-red/40 hover:text-red/70 hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 cursor-pointer mb-12"
                >
                  + Add another gamer
                </button>
              )}

              {/* Semester display — Fall 2026 is the only value today.
                  Single-value pre-pin per handoff §1.2 = the join banner
                  is the entire pre-pin UX. When teams ever runs multiple
                  concurrent semesters, a real picker earns its keep
                  here; for now, a flat info card is enough. */}
              <div className="mb-12 bg-[#f5f5f7] rounded-lg px-6 py-5">
                <span
                  className="font-body font-bold text-red uppercase block"
                  style={{ fontSize: "12px", letterSpacing: "1.2px", lineHeight: "16px" }}
                >
                  Semester
                </span>
                <span
                  className="font-display uppercase text-[#0a0a0a] block mt-1"
                  style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1" }}
                >
                  {SEMESTER.label}
                </span>
                <span
                  className="font-body text-[#4b5563] mt-2 block"
                  style={{ fontSize: "14px", lineHeight: "20px" }}
                >
                  Starts {SEMESTER.startWeek}. Runs through {SEMESTER.endApprox}.
                </span>
              </div>

              {/* ── Payment plan ─────────────────────────────────────
                  The one genuine teams-specific UI element (handoff
                  §1.3). KEEP exactly: upfront $576 (10% off) vs.
                  installment $160 now + $160 × 3 Oct/Nov/Dec via the
                  webhook-created Subscription (baseline §2I). */}
              <div className="mb-12" data-error-key="paymentPlan">
                <h2
                  className="font-display uppercase text-black leading-[0.85] mb-2"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                >
                  Payment plan
                </h2>
                <p
                  className="font-body text-[#4b5563] mt-2 mb-6"
                  style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "24px" }}
                >
                  Pricing shown is per gamer.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Installment */}
                  <button
                    type="button"
                    onClick={() => setPaymentPlan("installment")}
                    aria-pressed={paymentPlan === "installment"}
                    className={`relative text-left p-8 flex flex-col gap-3 rounded-lg transition-all cursor-pointer hover:brightness-[1.02] active:scale-[0.99] active:brightness-90 ${
                      paymentPlan === "installment"
                        ? "bg-[#0a0a0a] ring-2 ring-red shadow-lg shadow-red/10"
                        : "bg-[#f5f5f7]"
                    }`}
                  >
                    <span
                      className="font-body font-bold uppercase text-red"
                      style={{ fontSize: "12px", letterSpacing: "1.2px", lineHeight: "16px" }}
                    >
                      Monthly Payments
                    </span>
                    <span
                      className={`font-display uppercase ${
                        paymentPlan === "installment" ? "text-white" : "text-[#0a0a0a]"
                      }`}
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 36px)", lineHeight: "40px" }}
                    >
                      ${INSTALLMENT_MONTHLY}/mo
                    </span>
                    <span
                      className={`font-body ${
                        paymentPlan === "installment" ? "text-white/60" : "text-[#6b7280]"
                      }`}
                      style={{ fontSize: "14px", lineHeight: "20px" }}
                    >
                      4 payments · ${INSTALLMENT_TOTAL} total per gamer
                    </span>
                    <span
                      className={`font-body ${
                        paymentPlan === "installment" ? "text-white/50" : "text-[#9ca3af]"
                      }`}
                      style={{ fontSize: "13px", lineHeight: "18px" }}
                    >
                      Pay ${INSTALLMENT_MONTHLY} today, then auto-charged Oct, Nov, Dec
                    </span>
                  </button>

                  {/* Upfront */}
                  <button
                    type="button"
                    onClick={() => setPaymentPlan("upfront")}
                    aria-pressed={paymentPlan === "upfront"}
                    className={`relative text-left p-8 flex flex-col gap-3 rounded-lg transition-all cursor-pointer hover:brightness-[1.02] active:scale-[0.99] active:brightness-90 ${
                      paymentPlan === "upfront"
                        ? "bg-[#0a0a0a] ring-2 ring-red shadow-lg shadow-red/10"
                        : "bg-[#f5f5f7]"
                    }`}
                  >
                    <div className="absolute top-4 right-4 inline-flex items-center rounded-full bg-[#22c55e]/10 px-3 py-1">
                      <span
                        className="font-body font-bold text-[#16a34a]"
                        style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                      >
                        SAVE 10%
                      </span>
                    </div>
                    <span
                      className="font-body font-bold uppercase text-red"
                      style={{ fontSize: "12px", letterSpacing: "1.2px", lineHeight: "16px" }}
                    >
                      Pay in Full
                    </span>
                    <span
                      className={`font-display uppercase ${
                        paymentPlan === "upfront" ? "text-white" : "text-[#0a0a0a]"
                      }`}
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 36px)", lineHeight: "40px" }}
                    >
                      ${UPFRONT_PRICE}
                    </span>
                    <span
                      className={`font-body ${
                        paymentPlan === "upfront" ? "text-white/60" : "text-[#6b7280]"
                      }`}
                      style={{ fontSize: "14px", lineHeight: "20px" }}
                    >
                      One-time payment · Save $
                      {INSTALLMENT_TOTAL - UPFRONT_PRICE} per gamer
                    </span>
                    <span
                      className={`font-body ${
                        paymentPlan === "upfront" ? "text-white/50" : "text-[#9ca3af]"
                      }`}
                      style={{ fontSize: "13px", lineHeight: "18px" }}
                    >
                      Full semester paid today — no future charges
                    </span>
                  </button>
                </div>
              </div>

              {/* Additional info — optional textarea, same shape camps
                  retained but never surfaced. Preserved as an explicit
                  text area here so the field works end-to-end through
                  the 500-char chunker in the shared register helper. */}
              <div className="mb-12">
                <label
                  htmlFor="teams-additional-info"
                  className="font-body font-bold text-[#374151] block mb-2"
                  style={{ fontSize: "14px", lineHeight: "20px" }}
                >
                  Anything else we should know? (optional)
                </label>
                <textarea
                  id="teams-additional-info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={3}
                  maxLength={1500}
                  placeholder="Allergies, accommodations, gaming experience, anything."
                  className="w-full font-body text-[#0a0a0a] bg-[#f9fafb] border border-[#e5e7eb] rounded p-[17px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#9ca3af]"
                  style={{ fontSize: "16px", lineHeight: "24px" }}
                />
              </div>

              {/* ── Mobile inline summary (lg:hidden) ────────────────── */}
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
                  <TeamsPriceSummary
                    gamerCount={gamerCount}
                    paymentPlan={paymentPlan}
                    chargeNow={chargeNow}
                    totalUpfront={totalUpfront}
                    totalInstallmentFull={totalInstallmentFull}
                    compact={false}
                  />
                </div>
              </div>

              {/* What happens after you click pay */}
              {!showPayment && (
                <PostPaymentSteps
                  steps={[
                    {
                      title: "Right away",
                      desc: "Confirmation + payment receipt land in your inbox.",
                    },
                    {
                      title: "Within 24 hours",
                      desc: "Welcome email with semester details, schedule, and onboarding.",
                    },
                    {
                      title: "Week before the season starts",
                      desc: "Meet your coach and the rest of your team.",
                    },
                  ]}
                />
              )}

              {/* ── CTA / Payment ───────────────────────────────────── */}
              {!showPayment ? (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || chargeNow <= 0}
                    className="w-full font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                    style={{ fontSize: "18px", lineHeight: "28px", padding: "20px" }}
                  >
                    {isSubmitting
                      ? "Setting up payment..."
                      : paymentPlan === "upfront"
                      ? `Continue to payment — $${chargeNow}`
                      : `Continue to payment — $${chargeNow} today`}
                  </button>

                  <ReassuranceRow />
                </>
              ) : clientSecret ? (
                <PaymentStep
                  clientSecret={clientSecret}
                  returnUrl={`${
                    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
                  }/programs/ekuzo-teams/success?payment_intent=${paymentIntentId}`}
                  parentEmail={parent.email}
                  payButtonLabel={
                    paymentPlan === "upfront"
                      ? `Pay $${chargeNow}`
                      : `Pay $${chargeNow} today`
                  }
                  onGoBack={() => {
                    setShowPayment(false);
                    setClientSecret(null);
                    setPaymentIntentId(null);
                  }}
                />
              ) : null}
            </div>
            {/* end left column */}

            {/* ── Sticky checkout summary sidebar (lg+ only) ──────────
                Teams pricing math: per-plan totals + Subscription detail
                for installments. Mobile inline summary above mirrors
                this content. */}
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
                    <TeamsPriceSummary
                      gamerCount={gamerCount}
                      paymentPlan={paymentPlan}
                      chargeNow={chargeNow}
                      totalUpfront={totalUpfront}
                      totalInstallmentFull={totalInstallmentFull}
                      compact
                    />
                  </div>
                </div>

                {/* What you get card */}
                <div className="border border-[#e5e7eb] rounded-sm bg-[#fafafa] px-5 py-5">
                  <p className="font-body font-bold text-[#0a0a0a] text-xs uppercase tracking-wider mb-3">
                    What you get
                  </p>
                  <ul className="flex flex-col gap-2">
                    {[
                      "Full Fall 2026 semester — Aug 31 to Dec",
                      "Hand-picked 5-player team you stay with",
                      "Weekly coached practice + scrim block",
                      "Private moderated team Discord",
                      "End-of-semester tournament + casted bracket",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-red shrink-0 mt-[3px]"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 7L5.5 10L12 3.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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
          </div>
        </div>
      </section>

      <Footer hideTornPaper />
    </>
  );
}

// ── Sticky-sidebar pricing summary (teams) ─────────────────────────────
// Tiny inline component so the same per-plan math renders in both the
// mobile inline summary block and the desktop sticky aside without
// duplicating six pricing lines. Compact=true uses tighter font sizes
// for the desktop rail; compact=false uses the larger mobile sizes.

function TeamsPriceSummary({
  gamerCount,
  paymentPlan,
  chargeNow,
  totalUpfront,
  totalInstallmentFull,
  compact,
}: {
  gamerCount: number;
  paymentPlan: PaymentPlan;
  chargeNow: number;
  totalUpfront: number;
  totalInstallmentFull: number;
  compact: boolean;
}) {
  const labelSize = compact ? "text-xs" : "text-sm";
  const valueSize = compact
    ? { fontSize: "clamp(1.5rem, 1.8vw, 1.875rem)", lineHeight: 1 }
    : { fontSize: "clamp(1.25rem, 2vw, 28px)" };
  const subSize = compact ? "text-[11px]" : "text-xs";

  return (
    <>
      <div className="flex flex-col gap-1 mb-4">
        <span className={`font-body font-bold text-[#0a0a0a] ${labelSize}`}>
          {gamerCount} gamer{gamerCount > 1 ? "s" : ""} · {paymentPlan === "upfront" ? "Paid in full" : "Monthly payments"}
        </span>
        <span className={`font-body text-[#6b7280] ${subSize}`}>
          Fall 2026 · Week of Aug 31
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-3 border-t border-[#e5e7eb]">
        <span className={`font-body font-bold text-[#0a0a0a] ${labelSize}`}>
          {paymentPlan === "upfront" ? "Total" : "Due today"}
        </span>
        <span className="font-display text-[#0a0a0a]" style={valueSize}>
          ${chargeNow}
        </span>
      </div>

      {paymentPlan === "installment" && (
        <p className={`font-body text-[#9ca3af] ${subSize} mt-1`}>
          Then $
          {totalInstallmentFull - chargeNow > 0
            ? `${chargeNow} × 3 (Oct, Nov, Dec) · $${totalInstallmentFull} total`
            : "0 due"}
        </p>
      )}
      {paymentPlan === "upfront" && (
        <p className={`font-body text-[#9ca3af] ${subSize} mt-1`}>
          One-time payment · saves ${totalInstallmentFull - totalUpfront} vs.
          monthly
        </p>
      )}
    </>
  );
}
