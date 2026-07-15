"use client";

// EKUZO 101 REGISTER PAGE
// Clone of e100 register with payment machinery removed — no Stripe,
// no CheckoutForm, no PaymentStep, no abandoned route, no squad token.
// Week picker (WeekPicker component) replaces the cohort picker.
// Copy source: docs/ekuzo101-pilot/copy-deck.md §2 (frozen 2026-07-15).

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import WeekPicker from "@/components/ekuzo101/WeekPicker";
import { trackViewContent, trackRegistration } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import InputField from "@/components/register/InputField";
import RegisterHero from "@/components/register/RegisterHero";
import PostPaymentSteps from "@/components/register/PostPaymentSteps";
import ErrorSummary from "@/components/register/ErrorSummary";
import ParentInfoSection from "@/components/register/ParentInfoSection";

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Page Component ──────────────────────────────────────────────────────────

export default function Ekuzo101RegisterPage() {
  const router = useRouter();

  const form = useRegisterForm({ productSlug: "ekuzo101" });
  const {
    parent,
    setParent,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    ctaSource,
    handleEmailBlur,
    scrollToFirstError,
    setApiError,
  } = form;

  const [gamers, setGamers] = useState<GamerInfo[]>([emptyGamer()]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitError, setSubmitError] = useState("");

  // ── Squad join (?squad=TOKEN) — availability model ─────────────────────
  // Unlike camps/e100, a 101 crew link never pre-pins a schedule. Joining
  // via a friend's link only affiliates the families; each family picks
  // its own availability, and the overlap decides the window. We resolve
  // the owner's gamer name for the banner; invalid/unknown tokens fall
  // back to a plain registration (no error surfaced — hand-sold pilot).
  const [joiningSquad, setJoiningSquad] = useState<{
    token: string;
    ownerGamerName: string;
  } | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("squad");
    if (!token) return;
    fetch(`/api/squad/${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((owner) => {
        if (owner?.owner_gamer_name) {
          setJoiningSquad({ token, ownerGamerName: owner.owner_gamer_name });
        }
      })
      .catch(() => {});
  }, []);

  // Fire ViewContent on mount
  useEffect(() => {
    trackViewContent({ program: "ekuzo101" });
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

  // ── Validation ──────────────────────────────────────────────────────────

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

    if (selectedWeeks.length < 4) {
      errs.push({
        key: "weeks",
        message:
          "Please select at least 4 weeks to continue. You can choose any four from the options above - mix and match around your schedule.",
      });
    }

    return errs;
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selectedWeeks.length < 4 || isSubmitting) return;

    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      scrollToFirstError(errs);
      return;
    }
    setErrors([]);
    setSubmitError("");
    setIsSubmitting(true);

    const attribution = getAttribution();

    try {
      const res = await fetch("/api/ekuzo101/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gamers,
          weeks: selectedWeeks,
          parentFirstName: parent.firstName,
          parentLastName: parent.lastName,
          parentEmail: parent.email,
          parentPhone: parent.phone,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ctaSource,
          additionalInfo,
          joiningSquadToken: joiningSquad?.token || undefined,
          ...attribution,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const msg =
          data.error ||
          "Something went wrong on our end. Your spot has not been reserved yet. Try again in a moment, or email us directly at hello@ekuzo.gg and we'll get you set up manually.";
        setSubmitError(msg);
        setApiError(msg);
        setIsSubmitting(false);
        return;
      }

      try {
        sessionStorage.setItem("ekuzo101-success", JSON.stringify(data));
      } catch {
        // sessionStorage unavailable in some browser contexts; silently skip
      }

      trackRegistration({ program: "ekuzo101" });
      router.push("/programs/ekuzo101/success");
      // NOTE: do NOT re-enable submit on success (single-flight guard)
    } catch {
      const msg =
        "Something went wrong on our end. Your spot has not been reserved yet. Try again in a moment, or email us directly at hello@ekuzo.gg and we'll get you set up manually.";
      setSubmitError(msg);
      setApiError(msg);
      setIsSubmitting(false);
    }
  }

  const canSubmit = selectedWeeks.length >= 4 && !isSubmitting;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <Nav variant="light" />

      {/* Form must not wrap Nav/Footer: FooterNewsletter renders its own <form>,
          and nested forms are invalid HTML (caused a hydration error). */}
      <form onSubmit={handleSubmit} noValidate>

      {/* Orange gradient matches the e100 register hero per Jamie 2026-07-15. */}
      <RegisterHero
        background="radial-gradient(ellipse 80% 70% at 0% 0%, rgba(255, 220, 120, 0.80), transparent 60%), radial-gradient(ellipse 80% 70% at 100% 100%, rgba(180, 50, 0, 0.85), transparent 60%), #FF6B1A"
        eyebrow="EKUZO 101 - SUMMER PILOT"
        title1={"PICK YOUR WEEKS. "}
        title2="RESERVE YOUR SPOT."
        subhead={
          <>
            <span className="block">
              Not Fortnite. Not Roblox. Not another argument about screen
              time. 4 weeks of coached, active play: compete, communicate,
              work as a team.
            </span>
            <span className="block mt-3">
              Sessions Tuesdays &amp; Thursdays, 7:00-8:30 PM local.
            </span>
          </>
        }
      />

      <section className="bg-white">
        <div className="max-w-[1232px] mx-auto px-6 sm:px-10 pt-6 md:pt-10 pb-16 md:pb-24">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:gap-16">
            <div className="min-w-0">

              {/* ── Squad join banner (availability model — no pre-pin) ── */}
              {joiningSquad && (
                <div className="mb-8 bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 rounded-xl px-5 py-4">
                  <p
                    className="font-body font-bold text-[#0a0a0a]"
                    style={{ fontSize: "15px", lineHeight: "22px" }}
                  >
                    You&apos;re joining {joiningSquad.ownerGamerName}&apos;s group!
                  </p>
                  <p
                    className="font-body text-[#374151] mt-1"
                    style={{ fontSize: "14px", lineHeight: "22px" }}
                  >
                    Pick the weeks that work for your family. Schedules
                    don&apos;t need to match perfectly: the pilot is drop-in
                    friendly, and we use everyone&apos;s availability to set
                    up the group.
                  </p>
                </div>
              )}

              {/* Errors */}
              <ErrorSummary errors={errors} />

              {/* Submission error */}
              {submitError && (
                <div className="mb-8 bg-red/10 border border-red/30 rounded-sm px-5 py-4">
                  <p className="font-body text-red text-sm leading-6">{submitError}</p>
                </div>
              )}

              {/* ── Parent Info ─────────────────────────────────────── */}
              <ParentInfoSection
                parent={parent}
                setParent={setParent}
                onEmailBlur={handleEmailBlur}
                formatPhone={formatPhone}
              />

              {/* ── Per-gamer sections ─────────────────────────────── */}
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
              {gamers.length < 5 && (
                <button
                  type="button"
                  onClick={addGamer}
                  className="w-full py-4 border-2 border-dashed border-black/20 rounded-sm font-body font-semibold text-black/50 hover:border-red/40 hover:text-red/70 hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 cursor-pointer mb-12"
                >
                  + Add another gamer
                </button>
              )}

              {/* ── Week Picker ─────────────────────────────────────── */}
              <div
                className="mb-12"
                data-error-key="weeks"
                tabIndex={-1}
                style={{ scrollMarginTop: "100px" }}
              >
                <h2
                  className="font-display uppercase text-black leading-[0.85] mb-4"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                >
                  Choose Your Weeks
                </h2>
                <p
                  className="font-body text-[#4b5563] mb-8"
                  style={{ fontSize: "clamp(0.875rem, 1.2vw, 16px)", lineHeight: "28px" }}
                >
                  The pilot is 4 weeks. We&apos;re showing you the next 6.
                  Sessions are Tue/Thu, 7-8:30 PM local time.
                  <br />
                  <span className="font-semibold text-[#0a0a0a]">Select your availability (minimum 4 weeks).</span>
                </p>

                <WeekPicker
                  selected={selectedWeeks}
                  onChange={setSelectedWeeks}
                />
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

              {/* ── Submit ───────────────────────────────────────────── */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full font-body font-bold text-white bg-red rounded cursor-pointer hover:brightness-110 active:scale-[0.99] active:brightness-90 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                style={{ fontSize: "18px", lineHeight: "28px", padding: "20px" }}
              >
                {isSubmitting ? "Reserving your spot..." : "Reserve Our Spot"}
              </button>

              {/* ── Pilot reassurance row ───────────────────────────── */}
              <div className="mt-6 px-5 py-5 bg-[#f9fafb] border border-[#e5e7eb] rounded-sm">
                <p
                  className="font-body font-bold text-[#0a0a0a] mb-2"
                  style={{ fontSize: "14px", lineHeight: "20px" }}
                >
                  No card required. This is a free pilot.
                </p>
                <p
                  className="font-body text-[#374151]"
                  style={{ fontSize: "14px", lineHeight: "22px" }}
                >
                  At the end of your four weeks, Karlin will reach out personally. If it was
                  worth it, you&apos;ll hear about how to continue. Nothing is charged automatically.
                </p>
              </div>

              {/* ── What happens after you submit ───────────────────── */}
              <PostPaymentSteps
                className="mt-8"
                heading="What happens after you submit"
                steps={[
                  {
                    title: "Right away",
                    desc: "A confirmation email with your selected weeks lands in your inbox.",
                  },
                  {
                    title: "Recruit your friends",
                    desc: "You get a link to invite friends so your gamer starts with familiar teammates.",
                  },
                  {
                    title: "We set up your group",
                    desc: "A real person from EKUZO reaches out directly to set up your gamer's group before Day 1.",
                  },
                ]}
              />

            </div>{/* end left column */}

            {/* ── Sticky sidebar (lg+ only) ────────────────────────── */}
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
                    <p
                      className="font-body font-bold text-[#0a0a0a] mb-1"
                      style={{ fontSize: "14px" }}
                    >
                      EKUZO 101 Summer Pilot
                    </p>
                    <p className="font-body text-[#6b7280] text-sm">
                      {selectedWeeks.length > 0
                        ? `${selectedWeeks.length} week${selectedWeeks.length !== 1 ? "s" : ""} selected`
                        : "No weeks selected yet"}
                    </p>
                    <p className="font-body text-[#6b7280] text-sm mt-1">
                      Tue/Thu, 7:00-8:30 PM local time
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-baseline justify-between">
                      <span className="font-body font-bold text-[#0a0a0a] text-sm">Total</span>
                      <span
                        className="font-display text-[#0a0a0a]"
                        style={{ fontSize: "clamp(1.5rem, 1.8vw, 1.875rem)", lineHeight: 1 }}
                      >
                        $0
                      </span>
                    </div>
                    <p className="font-body text-[#6b7280] text-xs mt-1">
                      Free pilot - no card required
                    </p>
                  </div>
                </div>

                {/* What you get card */}
                <div className="border border-[#e5e7eb] rounded-sm bg-[#fafafa] px-5 py-5">
                  <p className="font-body font-bold text-[#0a0a0a] text-xs uppercase tracking-wider mb-3">
                    What you get
                  </p>
                  <ul className="flex flex-col gap-2">
                    {[
                      // "Same teammates every session" removed 2026-07-15:
                      // availability model can't guarantee identical groups.
                      "4 weeks of live elite coaching",
                      "Tue + Thu, 7:00-8:30 PM local time",
                      "Coach-led small group sessions",
                      "No card required - free pilot",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-[3px]" style={{ color: "#dc2626" }} aria-hidden="true">
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

      </form>

      <Footer hideTornPaper />
    </>
  );
}
