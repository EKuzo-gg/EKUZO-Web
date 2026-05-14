"use client";

/**
 * CreatorApplicationForm
 * --------------------------------------------------------------------
 * Application form rendered inside /creators (Creator Partnership page).
 *
 * Submission target is intentionally stubbed for now — see TODO below.
 * When Jamie wires the API route, swap the placeholder handler for a
 * fetch to /api/creators/apply (Beehiiv tag + Google Sheets row,
 * mirroring the existing /api/contact pipeline).
 *
 * Lane note (per CLAUDE.md): pages + components are Aaron's lane;
 * /api/* routes are Jamie's. Keeping the handler stubbed here is
 * intentional so this page ships front-end-complete without crossing
 * lanes.
 */

import { useState } from "react";
import Button from "@/components/ui/Button";

const inputClasses =
  "w-full px-4 py-3 font-body text-base bg-white border border-black rounded-none text-black placeholder-black/40 focus:border-red focus:outline-none focus:ring-2 focus:ring-red/15 transition-colors";

const labelClasses =
  "block text-xs font-bold uppercase tracking-[0.1em] text-black";

const sectionLabelClasses =
  "font-display uppercase text-2xl md:text-3xl tracking-[0.02em] mb-4";

const checkLabelClasses =
  "flex items-center gap-3 px-4 py-3 border border-black/10 cursor-pointer text-sm font-medium hover:border-black transition-colors has-[input:checked]:border-red has-[input:checked]:bg-red/5";

export default function CreatorApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    // TODO(jamie): Replace this stub with a POST to /api/creators/apply.
    // The route should: (1) tag the subscriber in Beehiiv with
    // `creator-applicant`, (2) write a row to a `creator_applications`
    // tab in the existing fulfillment Google Sheet via the same Apps
    // Script webhook used by /api/webhooks/stripe. Mirror /api/contact
    // for shape and error handling.
    await new Promise((r) => setTimeout(r, 350));

    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-black/10 p-6 md:p-10"
    >
      {/* ── 1. About you ──────────────────────────────────────── */}
      <div>
        <div className={sectionLabelClasses}>1 — About you</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className={labelClasses}>
              First name <span className="text-red">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className={labelClasses}>
              Last name <span className="text-red">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClasses}>
              Email <span className="text-red">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={labelClasses}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-2">
          <label htmlFor="location" className={labelClasses}>
            City &amp; state
          </label>
          <input
            id="location"
            name="location"
            type="text"
            autoComplete="address-level2"
            placeholder="e.g. Austin, TX"
            className={inputClasses}
          />
        </div>
      </div>

      {/* ── 2. Your audience ──────────────────────────────────── */}
      <div className="border-t-2 border-black mt-8 pt-6">
        <div className={sectionLabelClasses}>2 — Your audience</div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className={labelClasses}>
            Primary platforms <span className="text-red">*</span>
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              Select all that apply
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {[
              "Instagram",
              "TikTok",
              "YouTube",
              "Twitch",
              "X / Twitter",
              "Newsletter / Substack",
            ].map((p) => (
              <label key={p} className={checkLabelClasses}>
                <input
                  type="checkbox"
                  name="platforms"
                  value={p}
                  className="w-4 h-4 accent-red"
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="handles" className={labelClasses}>
              Handle(s) or links <span className="text-red">*</span>
            </label>
            <input
              id="handles"
              name="handles"
              type="text"
              required
              placeholder="@yourhandle, youtube.com/..."
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="audienceSize" className={labelClasses}>
              Total audience size <span className="text-red">*</span>
            </label>
            <select
              id="audienceSize"
              name="audienceSize"
              required
              className={inputClasses + " appearance-none bg-no-repeat pr-10"}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='black' d='M0 0h12L6 8z'/></svg>\")",
                backgroundPosition: "right 14px center",
                backgroundSize: "10px",
              }}
            >
              <option value="">Select a range…</option>
              <option>Under 5,000</option>
              <option>5,000 – 25,000</option>
              <option>25,000 – 100,000</option>
              <option>100,000 – 500,000</option>
              <option>500,000 – 1M</option>
              <option>1M+</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="audienceDesc" className={labelClasses}>
            Who is your audience?
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              A sentence or two on who watches you and why.
            </span>
          </label>
          <textarea
            id="audienceDesc"
            name="audienceDesc"
            placeholder="Mostly parents of 8–14 year olds in the US. They follow me for…"
            className={inputClasses + " min-h-[110px] resize-y"}
          />
        </div>
      </div>

      {/* ── 3. Your gamer ─────────────────────────────────────── */}
      <div className="border-t-2 border-black mt-8 pt-6">
        <div className={sectionLabelClasses}>3 — Your gamer</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kidName" className={labelClasses}>
              Kid&rsquo;s first name <span className="text-red">*</span>
            </label>
            <input
              id="kidName"
              name="kidName"
              type="text"
              required
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kidAge" className={labelClasses}>
              Age <span className="text-red">*</span>
            </label>
            <input
              id="kidAge"
              name="kidAge"
              type="number"
              min={6}
              max={18}
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="games" className={labelClasses}>
              Favorite game(s) <span className="text-red">*</span>
            </label>
            <input
              id="games"
              name="games"
              type="text"
              required
              placeholder="e.g. Fortnite, Rocket League, Valorant"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill" className={labelClasses}>
              Skill level
            </label>
            <select
              id="skill"
              name="skill"
              className={inputClasses + " appearance-none bg-no-repeat pr-10"}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='black' d='M0 0h12L6 8z'/></svg>\")",
                backgroundPosition: "right 14px center",
                backgroundSize: "10px",
              }}
            >
              <option value="">Select…</option>
              <option>Brand new — just getting into it</option>
              <option>Casual — plays a few times a week</option>
              <option>Serious — knows their game well</option>
              <option>Competitive — already playing ranked or tournaments</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. Fit & intent ───────────────────────────────────── */}
      <div className="border-t-2 border-black mt-8 pt-6">
        <div className={sectionLabelClasses}>4 — Fit &amp; intent</div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="why" className={labelClasses}>
            Why is this interesting to you and your kid?{" "}
            <span className="text-red">*</span>
          </label>
          <textarea
            id="why"
            name="why"
            required
            placeholder="Whatever's true. We're not looking for a perfect answer."
            className={inputClasses + " min-h-[110px] resize-y"}
          />
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className={labelClasses}>
            Content formats you&rsquo;d be comfortable making
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              Optional — pick whatever fits your normal cadence
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {[
              "Reels / TikToks",
              "YouTube shorts",
              "YouTube long-form",
              "Stories",
              "Live streaming",
              "Newsletter / blog post",
            ].map((f) => (
              <label key={f} className={checkLabelClasses}>
                <input
                  type="checkbox"
                  name="formats"
                  value={f}
                  className="w-4 h-4 accent-red"
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cohort" className={labelClasses}>
            How many kids do you think you could rally into the cohort?
          </label>
          <select
            id="cohort"
            name="cohort"
            className={inputClasses + " appearance-none bg-no-repeat pr-10"}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='black' d='M0 0h12L6 8z'/></svg>\")",
              backgroundPosition: "right 14px center",
              backgroundSize: "10px",
            }}
          >
            <option value="">Just a guess is fine…</option>
            <option>Just mine for now</option>
            <option>2 – 4 kids</option>
            <option>5 – 9 kids (full squad +)</option>
            <option>10 – 24 kids</option>
            <option>25+ kids</option>
          </select>
        </div>
      </div>

      {/* ── Consent ───────────────────────────────────────────── */}
      <label className="flex items-start gap-3 p-4 mt-8 border border-black/10 bg-grey text-sm leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 w-4 h-4 accent-red shrink-0"
        />
        <span>
          I understand I own everything I post, EKUZO may repost public
          content with credit, and any use in paid ads will be a separate
          conversation and a separate yes.
        </span>
      </label>

      {/* ── Submit ────────────────────────────────────────────── */}
      <div className="mt-6">
        <Button
          variant="red-filled"
          type="submit"
          className="w-full sm:w-auto"
        >
          {submitting
            ? "Sending…"
            : submitted
              ? "Application sent ✓"
              : "Send my application"}
        </Button>
      </div>

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 px-5 py-4 bg-[#0f3a1a] text-white border-l-4 border-[#4ade80] text-sm"
        >
          <strong>Got it.</strong> We&rsquo;ll be in touch within a week.
          Look for an email from{" "}
          <em className="not-italic underline">partners@ekuzo.gg</em>.
        </div>
      )}
    </form>
  );
}
