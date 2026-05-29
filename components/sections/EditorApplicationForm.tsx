"use client";

/**
 * EditorApplicationForm
 * --------------------------------------------------------------------
 * Application form rendered inside /editors (Editor Partnership page).
 *
 * Submission target is intentionally stubbed for now — see TODO below.
 * When Jamie wires the API route, swap the placeholder handler for a
 * fetch to /api/editors/apply (Beehiiv tag + Google Sheets row,
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

const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='black' d='M0 0h12L6 8z'/></svg>\")",
  backgroundPosition: "right 14px center",
  backgroundSize: "10px",
};

export default function EditorApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    // TODO(jamie): Replace this stub with a POST to /api/editors/apply.
    // The route should: (1) tag the subscriber in Beehiiv with
    // `editor-applicant`, (2) write a row to an `editor_applications`
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="location" className={labelClasses}>
              City &amp; state / country
            </label>
            <input
              id="location"
              name="location"
              type="text"
              autoComplete="address-level2"
              placeholder="e.g. Austin, TX  or  Lisbon, PT"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="timezone" className={labelClasses}>
              Time zone
            </label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              placeholder="e.g. ET, PT, GMT+1"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* ── 2. Your work ──────────────────────────────────────── */}
      <div className="border-t-2 border-black mt-8 pt-6">
        <div className={sectionLabelClasses}>2 — Your work</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reel" className={labelClasses}>
              Reel or portfolio link <span className="text-red">*</span>
            </label>
            <input
              id="reel"
              name="reel"
              type="url"
              required
              placeholder="https://"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reelTwo" className={labelClasses}>
              Second link (optional)
            </label>
            <input
              id="reelTwo"
              name="reelTwo"
              type="url"
              placeholder="Specific clip you&rsquo;re proud of"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className={labelClasses}>
            Tools you work in <span className="text-red">*</span>
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              Select all that apply
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {[
              "Premiere Pro",
              "After Effects",
              "DaVinci Resolve",
              "Final Cut Pro",
              "CapCut Pro",
              "Opus Clip",
              "Descript",
              "Frame.io",
            ].map((t) => (
              <label key={t} className={checkLabelClasses}>
                <input
                  type="checkbox"
                  name="tools"
                  value={t}
                  className="w-4 h-4 accent-red"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>
            Work types you&rsquo;re strong at <span className="text-red">*</span>
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              Select all that apply
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {[
              "Short-form vertical (Reels / Shorts / TikTok)",
              "Long-form YouTube edits",
              "Camp / event recap reels",
              "Testimonial &amp; interview edits",
              "Promo, sizzle, &amp; ad cuts",
              "Motion graphics &amp; lower-thirds",
              "Sound design &amp; mixing",
              "Color grading",
            ].map((f) => (
              <label key={f} className={checkLabelClasses}>
                <input
                  type="checkbox"
                  name="specialties"
                  value={f.replace(/&amp;/g, "&")}
                  className="w-4 h-4 accent-red"
                />
                <span dangerouslySetInnerHTML={{ __html: f }} />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Rates & availability ───────────────────────────── */}
      <div className="border-t-2 border-black mt-8 pt-6">
        <div className={sectionLabelClasses}>3 — Rates &amp; availability</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rateModel" className={labelClasses}>
              Preferred rate model <span className="text-red">*</span>
            </label>
            <select
              id="rateModel"
              name="rateModel"
              required
              className={inputClasses + " appearance-none bg-no-repeat pr-10"}
              style={selectStyle}
            >
              <option value="">Select…</option>
              <option>Per project / per deliverable</option>
              <option>Hourly</option>
              <option>Monthly retainer</option>
              <option>Open — let&rsquo;s talk</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rateRange" className={labelClasses}>
              Typical rate range
              <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
                Whatever&rsquo;s honest. Currency in USD.
              </span>
            </label>
            <input
              id="rateRange"
              name="rateRange"
              type="text"
              placeholder="e.g. $200–400 per short-form clip"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="capacity" className={labelClasses}>
              Capacity per week <span className="text-red">*</span>
            </label>
            <select
              id="capacity"
              name="capacity"
              required
              className={inputClasses + " appearance-none bg-no-repeat pr-10"}
              style={selectStyle}
            >
              <option value="">Select…</option>
              <option>1–3 short-form clips per week</option>
              <option>4–8 short-form clips per week</option>
              <option>One long-form / week + short-form</option>
              <option>Full-time-equivalent retainer</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="startDate" className={labelClasses}>
              Earliest start date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="text"
              placeholder="e.g. Next Monday  /  June 1  /  Now"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="turnaround" className={labelClasses}>
            Typical turnaround for a 60-second vertical clip
          </label>
          <select
            id="turnaround"
            name="turnaround"
            className={inputClasses + " appearance-none bg-no-repeat pr-10"}
            style={selectStyle}
          >
            <option value="">Select…</option>
            <option>Same day from brief</option>
            <option>24–48 hours</option>
            <option>3–5 days</option>
            <option>Depends on scope</option>
          </select>
        </div>
      </div>

      {/* ── 4. Fit ────────────────────────────────────────────── */}
      <div className="border-t-2 border-black mt-8 pt-6">
        <div className={sectionLabelClasses}>4 — Fit</div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label htmlFor="why" className={labelClasses}>
            Why EKUZO? <span className="text-red">*</span>
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              A sentence or two. We&rsquo;re not looking for a perfect answer.
            </span>
          </label>
          <textarea
            id="why"
            name="why"
            required
            placeholder="What about youth esports, coaching, or the brand makes this interesting to you?"
            className={inputClasses + " min-h-[110px] resize-y"}
          />
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className={labelClasses}>
            Experience with adjacent worlds
            <span className="block text-xs font-normal tracking-normal normal-case text-black/60 mt-0.5">
              Optional — helps us match you to the right briefs
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {[
              "Esports / competitive gaming content",
              "Sports / athletics content",
              "Education / coaching content",
              "Kid- or family-facing brands",
              "Creator / influencer content",
              "Direct-response paid social",
            ].map((f) => (
              <label key={f} className={checkLabelClasses}>
                <input
                  type="checkbox"
                  name="experience"
                  value={f}
                  className="w-4 h-4 accent-red"
                />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="references" className={labelClasses}>
            References or past clients (optional)
          </label>
          <textarea
            id="references"
            name="references"
            placeholder="One or two names &amp; how to verify the work."
            className={inputClasses + " min-h-[80px] resize-y"}
          />
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
          I understand any paid work will be governed by a written
          agreement, EKUZO owns the deliverables, and source footage of
          minors stays inside the project — never re-used on my own
          channels without written approval.
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
