"use client";

import { useEffect, useRef, useState } from "react";
import { captureAttribution } from "@/lib/attribution";
import { trackLead } from "@/lib/analytics";

// Shared register-form orchestration hook. Owns the truly cross-product
// state and side effects:
//   - parent (4 fields)
//   - errors + scrollToFirstError + ErrorSummary integration
//   - isSubmitting
//   - Stripe payment state (clientSecret / paymentIntentId / showPayment)
//   - ctaSource (from ?cta=hero|sticky|footer on mount)
//   - first-touch attribution capture (via captureAttribution on mount)
//   - email-blur lead capture against /api/{product}/lead with a
//     per-email session-ref gate so re-blurring doesn't spam Beehiiv
//
// Deliberately NOT in this hook (the Phase 4 "abandoned routes" lesson —
// field-level shape divergence across products is the signal to
// REPLICATE rather than extract):
//   - Gamer state shape (camps/e100/teams each carry different fields)
//   - Submit payload (different keys per product)
//   - Abandoned payload (different keys per product)
//   - Picker state (week/slot vs. cohort_month vs. semester+plan)
//   - Squad-join mount effect (each product pre-pins a different shape:
//     camps week+slot, e100 cohort_month, teams banner-only)
//
// Each register page composes this hook with its own gamer state +
// submit pipeline. The hook gives back enough that the page's submit
// can stay short.
//
// See marketing/teams-redesign/01-teams-convergence-handoff.md §3 Seam 4
// + §7 ("No big-bang single parameterized register component — extract
// shared seams, keep thin product-specific UI") for the architecture
// posture this hook embodies.

export type ParentInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type RegisterError = { key: string; message: string };

export type CtaSource = "hero" | "sticky" | "footer" | "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Productid maps to the URL slug for /api/{productSlug}/lead.
// camps → /api/camps/lead
// ekuzo100 → /api/ekuzo100/lead
// teams → /api/teams/lead
export type ProductLeadSlug = "camps" | "ekuzo100" | "teams";

export function useRegisterForm({
  productSlug,
}: {
  productSlug: ProductLeadSlug;
}) {
  const [parent, setParent] = useState<ParentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<RegisterError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment state — driven by /api/{product}/register response.
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // CTA source — captured from ?cta=hero|sticky|footer on mount. Threaded
  // into the submit payload → Stripe metadata → Beehiiv custom field.
  // Allow-listed so garbage query params don't pollute analytics.
  const [ctaSource, setCtaSource] = useState<CtaSource>("");

  // Email-lead gate — last email POSTed to /api/{product}/lead so a
  // re-blur with the same email doesn't double-subscribe in Beehiiv.
  // Comparison is lowercased + trimmed to match server-side normalization.
  const leadFiredForEmailRef = useRef<string>("");

  // First-touch attribution + CTA capture on mount.
  useEffect(() => {
    captureAttribution();
    if (typeof window !== "undefined") {
      const cta =
        new URLSearchParams(window.location.search).get("cta") || "";
      if (cta === "hero" || cta === "sticky" || cta === "footer") {
        setCtaSource(cta);
      }
    }
  }, []);

  // Email lead capture — fire-and-forget. Failures swallow + clear the
  // ref so a later blur can retry. Same shape as the original three
  // pages; only the URL varies by product.
  function handleEmailBlur() {
    const email = parent.email.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return;
    if (leadFiredForEmailRef.current === email) return;
    leadFiredForEmailRef.current = email;
    // Fire the Meta Pixel (+ GA4) Lead event alongside the server-side
    // capture. Previously only the Beehiiv POST ran here, so Meta never
    // saw a Lead for register-page email captures — the funnel-fix signal
    // the v2.0 campaign was built to read was invisible on-platform.
    // Gated by the same per-email ref above, so it fires once per email.
    trackLead({ source: `${productSlug}_register` });
    fetch(`/api/${productSlug}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {
      leadFiredForEmailRef.current = "";
    });
  }

  // Scroll to + focus the first invalid field. Falls back to top-scroll
  // for any error key that doesn't match a data-error-key in the DOM.
  // Focus uses preventScroll so the smooth visual scroll lands first and
  // the screen reader announces the field once it's centered.
  function scrollToFirstError(errs: RegisterError[]) {
    if (errs.length === 0) return;
    const firstKey = errs[0].key;
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-error-key="${firstKey}"]`
      );
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Smooth-scroll to the rendered payment section after the register
  // POST succeeds. 100ms timeout lets React commit + Elements mount
  // before the scroll fires.
  function scrollToPaymentSection() {
    setTimeout(() => {
      document
        .getElementById("payment-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  // Convenience: handle an API failure response by setting the errors
  // to a single _api entry. The page's render path treats _api the same
  // as any other error key.
  function setApiError(message: string) {
    setErrors([{ key: "_api", message }]);
  }

  return {
    // State
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
    // Handlers
    handleEmailBlur,
    scrollToFirstError,
    scrollToPaymentSection,
    setApiError,
  };
}
