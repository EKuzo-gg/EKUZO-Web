"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Shared Stripe Elements checkout form. Lifted from the three register
// pages, parameterized by:
//   - returnUrl: where Stripe redirects after a successful confirm
//   - parentEmail: forwarded as receipt_email to Stripe
//   - payButtonLabel: e.g. "Pay $199" (camps/e100) or "Pay $160 today"
//     (teams installment) — caller owns the copy.
//
// Behavior preserved from the three originals: PaymentElement uses the
// `tabs` layout; the button stays disabled until Stripe.js loads + Elements
// is ready; card errors render inline; non-card errors fall back to a
// generic message; success keeps the user on the register page until
// Stripe's redirect fires (the return_url owns post-payment flow).

export default function CheckoutForm({
  returnUrl,
  parentEmail,
  payButtonLabel,
  processingLabel = "Processing payment...",
}: {
  returnUrl: string;
  parentEmail: string;
  payButtonLabel: string;
  processingLabel?: string;
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
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
        options={{ layout: "tabs" }}
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
        {isProcessing ? processingLabel : payButtonLabel}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-black/30"
          aria-hidden="true"
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
