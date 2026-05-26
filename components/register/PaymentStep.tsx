"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import CheckoutForm from "./CheckoutForm";

// Shared payment step: black header bar + Stripe Elements wrapper +
// CheckoutForm + "Go back and edit" button. Lifted from the three
// register pages, where the markup was identical except for the
// return_url path slug and (teams only) the pay-button "today" suffix.
//
// Props the caller owns:
//   - clientSecret: from /api/{product}/register response
//   - returnUrl: full URL Stripe redirects to on success
//   - parentEmail: forwarded to Stripe as receipt_email
//   - payButtonLabel: e.g. "Pay $199" / "Pay $160 today"
//   - onGoBack: optional — resets caller's clientSecret/showPayment state
//     so the form reappears with current values preserved. Omit to hide
//     the back button (not used today, kept for parity with originals).

export default function PaymentStep({
  clientSecret,
  returnUrl,
  parentEmail,
  payButtonLabel,
  processingLabel,
  onGoBack,
}: {
  clientSecret: string;
  returnUrl: string;
  parentEmail: string;
  payButtonLabel: string;
  processingLabel?: string;
  onGoBack?: () => void;
}) {
  return (
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
              returnUrl={returnUrl}
              parentEmail={parentEmail}
              payButtonLabel={payButtonLabel}
              processingLabel={processingLabel}
            />
          </Elements>
        </div>
      </div>

      {onGoBack && (
        <button
          type="button"
          onClick={onGoBack}
          className="w-full mt-4 font-body text-sm text-black/50 hover:text-black/70 cursor-pointer transition-colors"
        >
          &larr; Go back and edit registration
        </button>
      )}
    </div>
  );
}
