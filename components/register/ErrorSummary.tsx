"use client";

import type { RegisterError } from "@/hooks/useRegisterForm";

// Shared a11y error summary block at the top of the form. The form's
// scroll-to-first-error logic (handleSubmit + useRegisterForm) is what
// actually moves focus to the offending field; this summary mirrors the
// error list for screen readers and visually-scanning users.

export default function ErrorSummary({ errors }: { errors: RegisterError[] }) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-8 p-5 bg-red/10 border border-red/30 rounded-sm"
    >
      {errors.map((e, i) => (
        <p key={i} className="font-body text-red text-sm mb-1 last:mb-0">
          {e.message}
        </p>
      ))}
    </div>
  );
}
