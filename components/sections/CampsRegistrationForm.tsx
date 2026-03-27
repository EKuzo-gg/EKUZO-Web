"use client";

import { useState } from "react";

type SlotStatus = "available" | "filling-fast" | "limited" | "sold-out";

type Slot = {
  id: string;
  time: "AM" | "PM";
  hours: string;
  price: number;
  originalPrice?: number;
  earlyBird?: boolean;
  status: SlotStatus;
};

type Week = {
  number: number;
  label: string;
  dates: string;
  am: Slot;
  pm: Slot;
};

const weeks: Week[] = [
  {
    number: 1,
    label: "Week 1",
    dates: "Jun 23–27",
    am: { id: "w1-am", time: "AM", hours: "9:00 AM–12:00 PM", price: 199, originalPrice: 299, earlyBird: true, status: "available" },
    pm: { id: "w1-pm", time: "PM", hours: "1:00 PM–4:00 PM", price: 199, originalPrice: 299, earlyBird: true, status: "filling-fast" },
  },
  {
    number: 2,
    label: "Week 2",
    dates: "Jun 30–Jul 4",
    am: { id: "w2-am", time: "AM", hours: "9:00 AM–12:00 PM", price: 199, originalPrice: 299, earlyBird: true, status: "available" },
    pm: { id: "w2-pm", time: "PM", hours: "1:00 PM–4:00 PM", price: 199, originalPrice: 299, earlyBird: true, status: "limited" },
  },
  {
    number: 3,
    label: "Week 3",
    dates: "Jul 7–11",
    am: { id: "w3-am", time: "AM", hours: "9:00 AM–12:00 PM", price: 199, originalPrice: 299, earlyBird: true, status: "available" },
    pm: { id: "w3-pm", time: "PM", hours: "1:00 PM–4:00 PM", price: 199, originalPrice: 299, earlyBird: true, status: "available" },
  },
  {
    number: 4,
    label: "Week 4",
    dates: "Jul 14–18",
    am: { id: "w4-am", time: "AM", hours: "9:00 AM–12:00 PM", price: 299, status: "sold-out" },
    pm: { id: "w4-pm", time: "PM", hours: "1:00 PM–4:00 PM", price: 299, status: "available" },
  },
  {
    number: 5,
    label: "Week 5",
    dates: "Jul 21–25",
    am: { id: "w5-am", time: "AM", hours: "9:00 AM–12:00 PM", price: 299, status: "available" },
    pm: { id: "w5-pm", time: "PM", hours: "1:00 PM–4:00 PM", price: 299, status: "available" },
  },
  {
    number: 6,
    label: "Week 6",
    dates: "Jul 28–Aug 1",
    am: { id: "w6-am", time: "AM", hours: "9:00 AM–12:00 PM", price: 299, status: "available" },
    pm: { id: "w6-pm", time: "PM", hours: "1:00 PM–4:00 PM", price: 299, status: "available" },
  },
];

const statusLabel: Record<SlotStatus, { text: string; color: string }> = {
  available:     { text: "Available",      color: "text-green-700 bg-green-50" },
  "filling-fast":{ text: "Filling Fast",   color: "text-amber-700 bg-amber-50" },
  limited:       { text: "Only 3 Left",    color: "text-red bg-red/10" },
  "sold-out":    { text: "Sold Out",       color: "text-black/40 bg-black/5" },
};

type FormData = {
  // Parent
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  // Gamer
  gamerFirstName: string;
  gamerLastName: string;
  gamerAge: string;
  riotId: string;
  // Week
  selectedSlotId: string;
};

const empty: FormData = {
  parentFirstName: "",
  parentLastName: "",
  parentEmail: "",
  parentPhone: "",
  gamerFirstName: "",
  gamerLastName: "",
  gamerAge: "",
  riotId: "",
  selectedSlotId: "",
};

export default function CampsRegistrationForm() {
  const [formData, setFormData] = useState<FormData>(empty);
  const [step, setStep] = useState<"select" | "info" | "payment" | "done">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSlot = weeks
    .flatMap((w) => [w.am, w.pm])
    .find((s) => s.id === formData.selectedSlotId);

  const selectedWeek = weeks.find(
    (w) => w.am.id === formData.selectedSlotId || w.pm.id === formData.selectedSlotId
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSlotSelect(slotId: string) {
    setFormData((prev) => ({ ...prev, selectedSlotId: slotId }));
  }

  function handleContinueToInfo() {
    if (!formData.selectedSlotId) {
      setError("Please select a week and time slot.");
      return;
    }
    setError("");
    setStep("info");
    // Smooth scroll to form top
    document.getElementById("camps-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleContinueToPayment() {
    const required: (keyof FormData)[] = [
      "parentFirstName", "parentLastName", "parentEmail",
      "gamerFirstName", "gamerLastName", "gamerAge",
    ];
    for (const key of required) {
      if (!formData[key]) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    setError("");
    setStep("payment");
    document.getElementById("camps-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "camps-enrollment",
            ...formData,
            selectedWeek: selectedWeek?.label,
            selectedDates: selectedWeek?.dates,
            selectedTime: selectedSlot?.time,
            selectedHours: selectedSlot?.hours,
            price: selectedSlot?.price,
            submittedAt: new Date().toISOString(),
          }),
        });
      }
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🎮</div>
        <h3
          className="font-display text-black mb-4"
          style={{ fontSize: "clamp(2rem, 4.4vw, 3rem)" }}
        >
          YOU&apos;RE REGISTERED!
        </h3>
        <p className="font-body text-black/70 max-w-md mx-auto" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
          Check your inbox for a confirmation email. We&apos;ll be in touch with next steps before camp begins.
        </p>
      </div>
    );
  }

  return (
    <div id="camps-form" className="scroll-mt-24">
      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-10">
        {(["select", "info", "payment"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-body transition-colors ${
                step === s
                  ? "bg-red text-white"
                  : i < ["select", "info", "payment"].indexOf(step)
                  ? "bg-black text-white"
                  : "bg-black/10 text-black/40"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`font-body text-sm font-medium hidden sm:block ${
                step === s ? "text-black" : "text-black/40"
              }`}
            >
              {s === "select" ? "Choose Week" : s === "info" ? "Your Info" : "Payment"}
            </span>
            {i < 2 && <div className="w-8 h-px bg-black/15" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red/10 border border-red/30 rounded-sm text-red font-body text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Week selection */}
      {step === "select" && (
        <div>
          <p className="font-body text-black/60 mb-8" style={{ fontSize: "clamp(1rem, 1.4vw, 20px)" }}>
            Select your preferred week and time slot. Early-bird pricing available on Weeks 1–3.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {weeks.map((week) =>
              ([week.am, week.pm] as Slot[]).map((slot) => {
                const isSoldOut = slot.status === "sold-out";
                const isSelected = formData.selectedSlotId === slot.id;
                const badge = statusLabel[slot.status];
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => handleSlotSelect(slot.id)}
                    className={`text-left p-5 rounded-sm border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-red bg-red/5"
                        : isSoldOut
                        ? "border-black/10 bg-black/3 opacity-50 cursor-not-allowed"
                        : "border-black/15 bg-white hover:border-black/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-body font-bold text-black block" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
                          {week.label} — {slot.time}
                        </span>
                        <span className="font-body text-black/50 text-xs">{week.dates}</span>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold font-body ${badge.color}`}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <p className="font-body text-black/60 text-sm mb-3">{slot.hours}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-body font-bold text-black" style={{ fontSize: "clamp(1.125rem, 1.7vw, 1.25rem)" }}>
                        ${slot.price}
                      </span>
                      {slot.originalPrice && (
                        <span className="font-body text-black/40 text-sm line-through">
                          ${slot.originalPrice}
                        </span>
                      )}
                      {slot.earlyBird && (
                        <span className="font-body text-xs text-red font-semibold">
                          Early Bird
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-1.5 text-red font-body text-sm font-semibold">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {formData.selectedSlotId && (
            <div className="flex items-center gap-4 p-5 bg-black/5 rounded-sm mb-6">
              <div className="flex-1">
                <span className="font-body text-sm text-black/60">Selected:</span>
                <span className="font-body font-bold text-black ml-2" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
                  {selectedWeek?.label} ({selectedWeek?.dates}) — {selectedSlot?.time} {selectedSlot?.hours}
                </span>
              </div>
              <span className="font-body font-bold text-black" style={{ fontSize: "clamp(1.125rem, 1.7vw, 1.25rem)" }}>
                ${selectedSlot?.price}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinueToInfo}
            className="font-body font-bold text-white bg-red px-8 py-4 rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Parent & gamer info */}
      {step === "info" && (
        <div>
          {/* Summary bar */}
          <div className="flex items-center justify-between gap-4 p-4 bg-black/5 rounded-sm mb-8 font-body" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
            <span className="text-black/60">
              {selectedWeek?.label} ({selectedWeek?.dates}) — {selectedSlot?.time}
            </span>
            <span className="font-bold text-black">${selectedSlot?.price}</span>
            <button
              type="button"
              onClick={() => setStep("select")}
              className="text-red underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
            {/* Parent info */}
            <div>
              <h4 className="font-body font-bold text-black mb-5 pb-3 border-b border-black/10" style={{ fontSize: "clamp(1rem, 1.7vw, 1.125rem)" }}>
                Parent / Guardian
              </h4>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" name="parentFirstName" value={formData.parentFirstName} onChange={handleChange} required />
                  <Field label="Last Name" name="parentLastName" value={formData.parentLastName} onChange={handleChange} required />
                </div>
                <Field label="Email" name="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} required />
                <Field label="Phone" name="parentPhone" type="tel" value={formData.parentPhone} onChange={handleChange} placeholder="Optional" />
              </div>
            </div>

            {/* Gamer info */}
            <div>
              <h4 className="font-body font-bold text-black mb-5 pb-3 border-b border-black/10" style={{ fontSize: "clamp(1rem, 1.7vw, 1.125rem)" }}>
                Your Gamer
              </h4>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" name="gamerFirstName" value={formData.gamerFirstName} onChange={handleChange} required />
                  <Field label="Last Name" name="gamerLastName" value={formData.gamerLastName} onChange={handleChange} required />
                </div>
                <Field label="Age" name="gamerAge" type="number" value={formData.gamerAge} onChange={handleChange} required placeholder="e.g. 14" />
                <Field label="Riot ID (optional)" name="riotId" value={formData.riotId} onChange={handleChange} placeholder="GameName#TAG" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="font-body font-medium text-black/60 px-6 py-4 rounded-sm border-2 border-black/15 hover:border-black/40 transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleContinueToPayment}
              className="font-body font-bold text-white bg-red px-8 py-4 rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continue to Payment →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && (
        <form onSubmit={handleSubmitPayment}>
          {/* Summary */}
          <div className="p-5 bg-black/5 rounded-sm mb-8">
            <h4 className="font-body font-bold text-black mb-3" style={{ fontSize: "clamp(1rem, 1.7vw, 1.125rem)" }}>Order Summary</h4>
            <div className="flex items-center justify-between font-body text-black/70 mb-2" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
              <span>
                EKUZO Camp — {selectedWeek?.label} ({selectedWeek?.dates}) {selectedSlot?.time}
              </span>
              <span className="font-bold text-black">${selectedSlot?.price}</span>
            </div>
            {selectedSlot?.earlyBird && (
              <div className="flex items-center justify-between font-body text-xs text-red">
                <span>Early Bird Discount</span>
                <span>-${(selectedSlot.originalPrice ?? 0) - selectedSlot.price}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-body font-bold text-black border-t border-black/10 mt-3 pt-3">
              <span>Total</span>
              <span style={{ fontSize: "clamp(1.125rem, 1.7vw, 1.25rem)" }}>${selectedSlot?.price}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="mb-6">
            <label className="font-body font-medium text-black block mb-2" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
              Promo Code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. EARLYBIRD"
                className="font-body flex-1 border border-black/20 rounded-sm p-3 text-base outline-none focus:border-black transition-colors uppercase"
              />
              <button
                type="button"
                className="font-body font-bold text-black border-2 border-black px-5 py-3 rounded-sm hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Stripe Elements placeholder */}
          <div className="mb-6">
            <label className="font-body font-medium text-black block mb-2" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
              Payment Details
            </label>
            <div className="border border-black/20 rounded-sm p-4 bg-black/[0.02]">
              <p className="font-body text-black/50 text-sm text-center py-4">
                Stripe payment form — coming soon once price IDs are configured.
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setStep("info")}
              className="font-body font-medium text-black/60 px-6 py-4 rounded-sm border-2 border-black/15 hover:border-black/40 transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-body font-bold text-white bg-red flex-1 px-8 py-4 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Processing..." : `Complete Registration — $${selectedSlot?.price}`}
            </button>
          </div>

          <p className="font-body text-black/40 mt-4 text-center" style={{ fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)" }}>
            Secure checkout. By registering you agree to our Terms of Service.
          </p>
        </form>
      )}
    </div>
  );
}

// Small reusable field
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body font-medium text-black" htmlFor={name} style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}>
        {label} {required && <span className="text-red">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="font-body text-black border border-black/20 rounded-sm p-3 outline-none focus:border-black transition-colors" style={{ fontSize: "clamp(0.875rem, 1.4vw, 1rem)" }}
      />
    </div>
  );
}
